<?php
/**
 * BOG Payment Integration
 */

require_once get_template_directory() . '/includes/features/bog-payments.php';

// Initialize BOG Payments
function get_bog_payments() {
    static $bog_payments = null;
    if ($bog_payments === null) {
        $bog_payments = new BOG_Payments();
    }
    return $bog_payments;
}

// Register payment endpoints
add_action('rest_api_init', function () {
    register_rest_route('bidspace/v1', '/payment/initiate', array(
        'methods' => 'POST',
        'callback' => 'initiate_bog_payment',
        'permission_callback' => function () {
            return is_user_logged_in();
        },
        'args' => array(
            'auction_id' => array(
                'required' => true,
                'type' => 'integer',
                'validate_callback' => function($param) {
                    return is_numeric($param) && get_post_type($param) === 'auction';
                }
            ),
            'amount' => array(
                'required' => true,
                'type' => 'number',
                'validate_callback' => function($param) {
                    return is_numeric($param) && $param > 0;
                }
            )
        )
    ));

    register_rest_route('bidspace/v1', '/payment/verify/(?P<order_id>[a-zA-Z0-9-]+)', array(
        'methods' => 'GET',
        'callback' => 'verify_bog_payment',
        'permission_callback' => function () {
            return is_user_logged_in();
        }
    ));
});

function initiate_bog_payment($request) {
    try {
        $params = $request->get_json_params();
        $auction_id = absint($params['auction_id']);
        $amount = floatval($params['amount']);

        error_log('Payment Initiation Request - Auction ID: ' . $auction_id . ', Amount: ' . $amount . ', User ID: ' . get_current_user_id());

        // Validate user authentication
        if (!is_user_logged_in()) {
            return new WP_Error(
                'authentication_required',
                'გთხოვთ გაიაროთ ავტორიზაცია',
                array('status' => 401)
            );
        }

        // Validate auction exists and is published
        $auction = get_post($auction_id);
        if (!$auction || $auction->post_type !== 'auction' || $auction->post_status !== 'publish') {
            return new WP_Error(
                'invalid_auction',
                'აუქციონი ვერ მოიძებნა',
                array('status' => 404)
            );
        }

        // Check if payment already exists and is completed
        $payment_status = get_post_meta($auction_id, 'payment_status', true);
        if ($payment_status === 'completed') {
            return new WP_Error(
                'payment_exists',
                'გადახდა უკვე განხორციელებულია',
                array('status' => 400)
            );
        }

        // Get and validate last bid
        $bids_list = get_post_meta($auction_id, 'bids_list', true);
        if (!$bids_list || !is_array($bids_list)) {
            return new WP_Error(
                'invalid_bid',
                'ბიდი ვერ მოიძებნა',
                array('status' => 400)
            );
        }

        // Get the last bid (most recent)
        usort($bids_list, function($a, $b) {
            return strtotime($b['bid_time']) - strtotime($a['bid_time']);
        });
        $last_bid = reset($bids_list);

        if (!$last_bid) {
            return new WP_Error(
                'no_bids',
                'ბიდი ვერ მოიძებნა',
                array('status' => 400)
            );
        }

        // Compare amounts with float precision handling
        $last_bid_amount = floatval($last_bid['bid_price']);
        $requested_amount = floatval($amount);

        if (abs($last_bid_amount - $requested_amount) > 0.01) { // Allow for minor float precision differences
            error_log("Amount mismatch - Last bid: $last_bid_amount, Requested: $requested_amount");
            return new WP_Error(
                'invalid_amount',
                'გადასახდელი თანხა არ ემთხვევა ბიდის თანხას',
                array('status' => 400)
            );
        }

        // Generate unique order ID
        $order_id = 'BID' . $auction_id . '_' . time();
        
        // Save order ID to auction meta
        update_post_meta($auction_id, 'payment_order_id', $order_id);
        update_post_meta($auction_id, 'payment_amount', $amount);
        update_post_meta($auction_id, 'payment_status', 'pending');

        // Get auction title for payment description
        $description = sprintf(
            'გადახდა აუქციონისთვის: %s',
            $auction->post_title
        );

        error_log('Initiating BOG payment with order ID: ' . $order_id);
        
        $bog_payments = get_bog_payments();
        $result = $bog_payments->initiate_payment($order_id, $amount, 'GEL', $description);

        if (!$result['success']) {
            error_log('BOG Payment initiation failed: ' . print_r($result, true));
            throw new Exception($result['error'] ?: 'Could not initiate payment');
        }

        if (!isset($result['links']['redirect'])) {
            error_log('BOG Payment missing redirect URL: ' . print_r($result, true));
            throw new Exception('Could not find payment redirect URL in response');
        }

        error_log('Payment initiated successfully. Redirect URL: ' . $result['links']['redirect']);

        return rest_ensure_response([
            'success' => true,
            'links' => [
                'redirect' => $result['links']['redirect']
            ],
            'order_id' => $order_id
        ]);

    } catch (Exception $e) {
        error_log('Payment initiation error: ' . $e->getMessage());
        return new WP_Error(
            'payment_init_failed',
            $e->getMessage(),
            array('status' => 500)
        );
    }
}

function verify_bog_payment($request) {
    try {
        $order_id = $request['order_id'];
        
        $bog_payments = get_bog_payments();
        $result = $bog_payments->verify_payment($order_id);

        if (!$result['success']) {
            throw new Exception($result['error']);
        }

        return rest_ensure_response($result);

    } catch (Exception $e) {
        return new WP_Error(
            'payment_verify_failed',
            $e->getMessage(),
            array('status' => 500)
        );
    }
}

function initiate_auction_payment($auction_id, $amount) {
    // Create WooCommerce product for the auction
    $auction = get_post($auction_id);
    $product = array(
        'post_title'    => sprintf('აუქციონი: %s', $auction->post_title),
        'post_content'  => sprintf('გადახდა აუქციონისთვის: %s', $auction->post_title),
        'post_status'   => 'publish',
        'post_type'     => 'product'
    );
    
    $product_id = wp_insert_post($product);
    
    if (is_wp_error($product_id)) {
        throw new Exception('Failed to create product');
    }

    // Set product meta
    update_post_meta($product_id, '_regular_price', $amount);
    update_post_meta($product_id, '_price', $amount);
    update_post_meta($product_id, '_virtual', 'yes');
    update_post_meta($product_id, '_sold_individually', 'yes');
    
    // Link product to auction
    update_post_meta($product_id, '_auction_id', $auction_id);
    update_post_meta($auction_id, '_product_id', $product_id);

    // Create cart url
    WC()->cart->empty_cart();
    WC()->cart->add_to_cart($product_id, 1);
    $checkout_url = wc_get_checkout_url();

    return array(
        'success' => true,
        'links' => array(
            'redirect' => $checkout_url
        )
    );
}

// Add WooCommerce order completion handler
add_action('woocommerce_order_status_completed', 'handle_auction_payment_completion');
function handle_auction_payment_completion($order_id) {
    $order = wc_get_order($order_id);
    
    foreach ($order->get_items() as $item) {
        $product_id = $item->get_product_id();
        $auction_id = get_post_meta($product_id, '_auction_id', true);
        
        if ($auction_id) {
            update_post_meta($auction_id, 'payment_status', 'completed');
            do_action('bidspace_payment_completed', $auction_id);
        }
    }
}

// Clean up temporary products
add_action('bidspace_payment_completed', 'cleanup_auction_product');
function cleanup_auction_product($auction_id) {
    $product_id = get_post_meta($auction_id, '_product_id', true);
    if ($product_id) {
        wp_delete_post($product_id, true); // Force delete the product
        delete_post_meta($auction_id, '_product_id');
    }
}

// Hook into payment initiation
add_filter('bidspace_payment_initiate', function($result, $auction_id, $amount) {
    try {
        // Check if WooCommerce is active
        if (!class_exists('WooCommerce')) {
            return $result;
        }

        // Check if user chose WooCommerce payment
        if (isset($_POST['payment_method']) && $_POST['payment_method'] === 'woocommerce') {
            return initiate_auction_payment($auction_id, $amount);
        }

        return $result;
    } catch (Exception $e) {
        return new WP_Error(
            'payment_initiation_failed',
            $e->getMessage(),
            array('status' => 500)
        );
    }
}, 10, 3);