<?php
/**
 * BOG Payment Integration
 */

// Register payment endpoints
add_action('rest_api_init', function () {
    register_rest_route('bidspace/v1', '/payment/initiate', array(
        'methods' => 'POST',
        'callback' => 'initiate_bog_payment',
        'permission_callback' => function () {
            return is_user_logged_in();
        }
    ));

    register_rest_route('bidspace/v1', '/payment/status/(?P<order_id>[a-zA-Z0-9-]+)', array(
        'methods' => 'GET',
        'callback' => 'check_bog_payment_status',
        'permission_callback' => function () {
            return is_user_logged_in();
        }
    ));
});

function initiate_bog_payment($request) {
    try {
        $params = $request->get_json_params();
        
        if (empty($params)) {
            error_log('BOG Payment: Empty request parameters');
            return new WP_Error('invalid_request', 'Invalid request parameters', array('status' => 400));
        }

        $auction_id = sanitize_text_field($params['auction_id']);
        $amount = floatval($params['amount']);

        if (!$auction_id || !$amount) {
            error_log('BOG Payment: Missing required parameters - auction_id: ' . $auction_id . ', amount: ' . $amount);
            return new WP_Error('missing_params', 'Missing required parameters', array('status' => 400));
        }

        // Get auction details
        $auction = get_post($auction_id);
        if (!$auction || $auction->post_type !== 'auction') {
            error_log('BOG Payment: Invalid auction ID: ' . $auction_id);
            return new WP_Error('invalid_auction', 'Invalid auction', array('status' => 404));
        }

        // Check if payment is already completed
        $payment_status = get_post_meta($auction_id, 'payment_status', true);
        if ($payment_status === 'completed') {
            error_log('BOG Payment: Payment already completed for auction: ' . $auction_id);
            return new WP_Error('payment_completed', 'Payment already completed', array('status' => 400));
        }

        // Generate unique order ID
        $order_id = 'BID-' . time() . '-' . $auction_id;

        // BOG API Configuration
        $client_id = get_option('bog_client_id');
        $secret_key = get_option('bog_secret_key');
        $is_production = get_option('bog_is_production', false);

        if (!$client_id || !$secret_key) {
            error_log('BOG Payment: Missing API credentials');
            return new WP_Error('missing_credentials', 'Payment system configuration error', array('status' => 500));
        }

        $api_url = $is_production 
            ? 'https://ipay.ge/opay/api/v1'
            : 'https://ipay.ge/opay/api/v1/test';

        // Prepare payment request
        $payment_data = array(
            'intent' => 'CAPTURE',
            'shop_order_id' => $order_id,
            'redirect_url' => home_url("/payment-success?order_id={$order_id}"),
            'callback_url' => home_url("/payment-callback?order_id={$order_id}"),
            'locale' => 'ka',
            'cart' => array(
                'currency' => 'GEL',
                'total_cost' => $amount,
                'items' => array(
                    array(
                        'name' => 'Payment for auction #' . $auction_id,
                        'quantity' => 1,
                        'price' => $amount,
                        'product_id' => $auction_id
                    )
                )
            ),
            'cancel_url' => home_url("/payment-cancelled?order_id={$order_id}"),
            'fail_url' => home_url("/payment-failed?order_id={$order_id}"),
            'show_shop_order_id_on_extract' => true,
            'capture_method' => 'AUTOMATIC',
            'purchase_units' => array(
                array(
                    'amount' => array(
                        'currency_code' => 'GEL',
                        'value' => $amount
                    )
                )
            )
        );

        error_log('BOG Payment: Sending request to BOG API - ' . json_encode($payment_data));

        // Make request to BOG API
        $response = wp_remote_post($api_url . '/checkout/orders', array(
            'headers' => array(
                'Authorization' => 'Bearer ' . $client_id,
                'Content-Type' => 'application/json'
            ),
            'body' => json_encode($payment_data),
            'timeout' => 30,
            'sslverify' => true
        ));

        if (is_wp_error($response)) {
            error_log('BOG Payment: WP Error - ' . $response->get_error_message());
            return new WP_Error('payment_error', $response->get_error_message(), array('status' => 500));
        }

        $response_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);
        
        error_log('BOG Payment: Response Code - ' . $response_code);
        error_log('BOG Payment: Response Body - ' . $response_body);

        if ($response_code !== 200) {
            return new WP_Error(
                'bog_api_error',
                'BOG API Error: ' . $response_code . ' - ' . $response_body,
                array('status' => $response_code)
            );
        }

        $body = json_decode($response_body, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log('BOG Payment: JSON decode error - ' . json_last_error_msg());
            error_log('BOG Payment: Raw response - ' . $response_body);
            return new WP_Error('json_decode_error', 'Failed to parse API response', array('status' => 500));
        }

        if (empty($body)) {
            error_log('BOG Payment: Empty response body');
            return new WP_Error('empty_response', 'Empty response from payment system', array('status' => 500));
        }

        // Save payment details
        update_post_meta($auction_id, 'payment_order_id', $order_id);
        update_post_meta($auction_id, 'payment_status', 'pending');
        update_post_meta($auction_id, 'payment_amount', $amount);

        // Format response for frontend
        $formatted_response = array(
            'order_id' => $order_id,
            'links' => array(
                'redirect' => isset($body['links']['redirect']) ? $body['links']['redirect'] : 
                            (isset($body['payment_hash']) ? $api_url . '/checkout/pay/' . $body['payment_hash'] : null)
            )
        );

        if (!isset($formatted_response['links']['redirect'])) {
            error_log('BOG Payment: Missing redirect URL in response');
            return new WP_Error('missing_redirect', 'Payment system did not provide redirect URL', array('status' => 500));
        }

        return new WP_REST_Response($formatted_response, 200);
        
    } catch (Exception $e) {
        error_log('BOG Payment: Unexpected error - ' . $e->getMessage());
        error_log('BOG Payment: Stack trace - ' . $e->getTraceAsString());
        return new WP_Error('unexpected_error', 'An unexpected error occurred', array('status' => 500));
    }
}

function check_bog_payment_status($request) {
    try {
        $order_id = $request['order_id'];
        
        if (!$order_id) {
            error_log('BOG Payment Status: Missing order ID');
            return new WP_Error('missing_order_id', 'Order ID is required', array('status' => 400));
        }
        
        // BOG API Configuration
        $client_id = get_option('bog_client_id');
        $secret_key = get_option('bog_secret_key');
        $is_production = get_option('bog_is_production', false);

        if (!$client_id || !$secret_key) {
            error_log('BOG Payment Status: Missing API credentials');
            return new WP_Error('missing_credentials', 'Payment system configuration error', array('status' => 500));
        }

        $api_url = $is_production 
            ? 'https://ipay.ge/opay/api/v1'
            : 'https://ipay.ge/opay/api/v1/test';

        error_log('BOG Payment Status: Checking status for order - ' . $order_id);

        // Make request to BOG API
        $response = wp_remote_get($api_url . '/checkout/payment/' . $order_id, array(
            'headers' => array(
                'Authorization' => 'Bearer ' . $client_id
            ),
            'timeout' => 30,
            'sslverify' => true
        ));

        if (is_wp_error($response)) {
            error_log('BOG Payment Status: WP Error - ' . $response->get_error_message());
            return new WP_Error('payment_error', $response->get_error_message(), array('status' => 500));
        }

        $response_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);
        
        error_log('BOG Payment Status: Response Code - ' . $response_code);
        error_log('BOG Payment Status: Response Body - ' . $response_body);

        if ($response_code !== 200) {
            return new WP_Error(
                'bog_api_error',
                'BOG API Error: ' . $response_code . ' - ' . $response_body,
                array('status' => $response_code)
            );
        }

        $body = json_decode($response_body, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log('BOG Payment Status: JSON decode error - ' . json_last_error_msg());
            error_log('BOG Payment Status: Raw response - ' . $response_body);
            return new WP_Error('json_decode_error', 'Failed to parse API response', array('status' => 500));
        }

        // Update payment status
        if (isset($body['status']) && $body['status'] === 'success') {
            // Find auction by order ID
            $args = array(
                'post_type' => 'auction',
                'meta_query' => array(
                    array(
                        'key' => 'payment_order_id',
                        'value' => $order_id
                    )
                )
            );
            
            $auctions = get_posts($args);
            if (!empty($auctions)) {
                $auction_id = $auctions[0]->ID;
                update_post_meta($auction_id, 'payment_status', 'completed');
                error_log('BOG Payment Status: Updated payment status to completed for auction - ' . $auction_id);
            }
        }

        return new WP_REST_Response($body, 200);
        
    } catch (Exception $e) {
        error_log('BOG Payment Status: Unexpected error - ' . $e->getMessage());
        error_log('BOG Payment Status: Stack trace - ' . $e->getTraceAsString());
        return new WP_Error('unexpected_error', 'An unexpected error occurred', array('status' => 500));
    }
}