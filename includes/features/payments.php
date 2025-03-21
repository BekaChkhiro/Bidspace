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
    $params = $request->get_json_params();
    $auction_id = sanitize_text_field($params['auction_id']);
    $amount = floatval($params['amount']);

    // Get auction details
    $auction = get_post($auction_id);
    if (!$auction || $auction->post_type !== 'auction') {
        return new WP_Error('invalid_auction', 'Invalid auction', array('status' => 404));
    }

    // Generate unique order ID
    $order_id = 'BID-' . time() . '-' . $auction_id;

    // BOG API Configuration
    $client_id = get_option('bog_client_id');
    $secret_key = get_option('bog_secret_key');
    $is_production = get_option('bog_is_production', false);

    $api_url = $is_production 
        ? 'https://ipay.ge/opay/api/v1'
        : 'https://ipay.ge/opay/api/v1/test';

    // Prepare payment request
    $payment_data = array(
        'intent' => 'CAPTURE',
        'items' => [[
            'amount' => $amount,
            'description' => sprintf('Payment for auction #%d', $auction_id),
            'quantity' => 1
        ]],
        'merchant_order_id' => $order_id,
        'purchase_units' => [[
            'amount' => [
                'currency_code' => 'GEL',
                'value' => $amount
            ]
        ]],
        'redirect_urls' => [
            'success_url' => home_url("/payment-success?order_id={$order_id}"),
            'fail_url' => home_url("/payment-failed?order_id={$order_id}"),
            'cancel_url' => home_url("/payment-cancelled?order_id={$order_id}")
        ]
    );

    // Make request to BOG API
    $response = wp_remote_post($api_url . '/checkout/orders', array(
        'headers' => array(
            'Authorization' => 'Bearer ' . $client_id,
            'Content-Type' => 'application/json'
        ),
        'body' => json_encode($payment_data)
    ));

    if (is_wp_error($response)) {
        return new WP_Error('payment_error', $response->get_error_message(), array('status' => 500));
    }

    $body = json_decode(wp_remote_retrieve_body($response), true);

    // Save payment details
    update_post_meta($auction_id, 'payment_order_id', $order_id);
    update_post_meta($auction_id, 'payment_status', 'pending');
    update_post_meta($auction_id, 'payment_amount', $amount);

    return new WP_REST_Response($body, 200);
}

function check_bog_payment_status($request) {
    $order_id = $request['order_id'];
    
    // BOG API Configuration
    $client_id = get_option('bog_client_id');
    $secret_key = get_option('bog_secret_key');
    $is_production = get_option('bog_is_production', false);

    $api_url = $is_production 
        ? 'https://ipay.ge/opay/api/v1'
        : 'https://ipay.ge/opay/api/v1/test';

    // Make request to BOG API
    $response = wp_remote_get($api_url . '/checkout/payment/' . $order_id, array(
        'headers' => array(
            'Authorization' => 'Bearer ' . $client_id
        )
    ));

    if (is_wp_error($response)) {
        return new WP_Error('payment_error', $response->get_error_message(), array('status' => 500));
    }

    $body = json_decode(wp_remote_retrieve_body($response), true);

    // Update payment status
    if ($body['status'] === 'success') {
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
        }
    }

    return new WP_REST_Response($body, 200);
}