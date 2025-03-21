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
        $auction_id = $params['auction_id'];
        $amount = $params['amount'];

        // Check if payment already exists and is completed
        $payment_status = get_post_meta($auction_id, 'payment_status', true);
        if ($payment_status === 'completed') {
            return new WP_Error(
                'payment_exists',
                'გადახდა უკვე განხორციელებულია',
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
        $auction = get_post($auction_id);
        $description = sprintf(
            'გადახდა აუქციონისთვის: %s',
            $auction->post_title
        );

        $bog_payments = get_bog_payments();
        $result = $bog_payments->initiate_payment($order_id, $amount, 'GEL', $description);

        if (!$result['success']) {
            throw new Exception($result['error']);
        }

        return rest_ensure_response($result);

    } catch (Exception $e) {
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