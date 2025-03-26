<?php
/**
 * BOG Payments Integration
 */

class BOG_Payments {
    private $client_id;
    private $secret_key;
    private $is_production;
    private $api_base_url;

    public function __construct() {
        $this->client_id = get_option('bog_client_id');
        $this->secret_key = get_option('bog_secret_key');
        $this->is_production = get_option('bog_is_production', false);
        $this->api_base_url = $this->is_production 
            ? 'https://ipay.ge/opay/api/v1'
            : 'https://ipay.ge/opay/api/v1/sandbox';
    }

    public function initiate_payment($order_id, $amount, $currency = 'GEL', $description = '') {
        try {
            $callback_url = home_url('/payment-callback');
            $success_url = home_url('/payment-success');
            $fail_url = home_url('/payment-failed');
            $cancel_url = home_url('/payment-cancelled');

            $payload = array(
                'intent' => 'AUTHORIZE',
                'shop_order_id' => $order_id,
                'locale' => 'ka',
                'shop_name' => 'Bidspace',
                'shop_transaction_id' => $order_id,
                'callback_url' => $callback_url,
                'success_redirect_url' => $success_url,
                'fail_redirect_url' => $fail_url,
                'cancel_redirect_url' => $cancel_url,
                'cart' => array(
                    'currency' => $currency,
                    'total_amount' => $amount,
                    'items' => array(
                        array(
                            'name' => 'აუქციონის გადასახადი',
                            'price' => $amount,
                            'quantity' => 1
                        )
                    )
                )
            );

            if (!empty($description)) {
                $payload['cart']['items'][0]['description'] = $description;
            }

            $args = array(
                'method' => 'POST',
                'timeout' => 30,
                'headers' => array(
                    'Content-Type' => 'application/json',
                    'Authorization' => 'Bearer ' . $this->get_access_token()
                ),
                'body' => json_encode($payload)
            );

            error_log('BOG Payment Request: ' . json_encode($payload));

            $response = wp_remote_post($this->api_base_url . '/checkout/orders', $args);

            if (is_wp_error($response)) {
                throw new Exception($response->get_error_message());
            }

            $body = wp_remote_retrieve_body($response);
            $data = json_decode($body, true);

            error_log('BOG Payment Response: ' . $body);

            if (!isset($data['links']['redirect'])) {
                throw new Exception('Invalid response from payment gateway');
            }

            return array(
                'success' => true,
                'links' => array(
                    'redirect' => $data['links']['redirect']
                )
            );

        } catch (Exception $e) {
            error_log('BOG Payment Error: ' . $e->getMessage());
            return array(
                'success' => false,
                'error' => $e->getMessage()
            );
        }
    }

    private function get_access_token() {
        $cache_key = 'bog_access_token';
        $token = get_transient($cache_key);

        if ($token !== false) {
            return $token;
        }

        // The OAuth endpoint is separate from the API endpoints
        $oauth_url = $this->is_production 
            ? 'https://oauth2.bog.ge/auth/realms/bog/protocol/openid-connect/token'
            : 'https://oauth2-test.bog.ge/auth/realms/bog/protocol/openid-connect/token';

        $args = array(
            'method' => 'POST',
            'timeout' => 30,
            'headers' => array(
                'Content-Type' => 'application/x-www-form-urlencoded'
            ),
            'body' => array(
                'grant_type' => 'client_credentials',
                'scope' => 'payment',
                'client_id' => $this->client_id,
                'client_secret' => $this->secret_key
            )
        );

        error_log('BOG OAuth Request URL: ' . $oauth_url);
        error_log('BOG OAuth Request Body: ' . json_encode($args['body']));
        
        $response = wp_remote_post($oauth_url, $args);
        
        if (is_wp_error($response)) {
            error_log('BOG OAuth Error: ' . $response->get_error_message());
            throw new Exception($response->get_error_message());
        }

        $body = wp_remote_retrieve_body($response);
        $status = wp_remote_retrieve_response_code($response);
        
        error_log('BOG OAuth Response Status: ' . $status);
        error_log('BOG OAuth Response Body: ' . $body);

        $data = json_decode($body, true);
        
        if ($status !== 200 || !isset($data['access_token'])) {
            $error_msg = isset($data['error_description']) ? $data['error_description'] : 'Unknown error';
            error_log('BOG OAuth Error: ' . $error_msg);
            throw new Exception('Failed to get access token: ' . $error_msg);
        }

        // Cache token for slightly less than its expiry time if provided, otherwise 1 hour
        $expires_in = isset($data['expires_in']) ? (int)$data['expires_in'] - 60 : HOUR_IN_SECONDS;
        set_transient($cache_key, $data['access_token'], $expires_in);
        
        return $data['access_token'];
    }

    public function verify_payment($order_id) {
        try {
            $args = array(
                'method' => 'GET',
                'timeout' => 30,
                'headers' => array(
                    'Authorization' => 'Bearer ' . $this->get_access_token()
                )
            );

            $response = wp_remote_get(
                $this->api_base_url . '/checkout/payment/' . urlencode($order_id),
                $args
            );

            if (is_wp_error($response)) {
                throw new Exception($response->get_error_message());
            }

            $body = json_decode(wp_remote_retrieve_body($response), true);

            error_log('BOG Payment Verification Response: ' . json_encode($body));

            if (!isset($body['status'])) {
                throw new Exception('Invalid response while verifying payment');
            }

            return array(
                'success' => true,
                'status' => $body['status']
            );

        } catch (Exception $e) {
            error_log('BOG Payment Verification Error: ' . $e->getMessage());
            return array(
                'success' => false,
                'error' => $e->getMessage()
            );
        }
    }

    public function handle_callback($data) {
        try {
            error_log('BOG Payment Callback Data: ' . json_encode($data));

            if (!isset($data['shop_order_id']) || !isset($data['status'])) {
                throw new Exception('Invalid callback data');
            }

            // Verify payment status with BOG
            $verification = $this->verify_payment($data['shop_order_id']);
            
            if (!$verification['success']) {
                throw new Exception('Payment verification failed');
            }

            // Find auction by order ID
            $args = array(
                'post_type' => 'auction',
                'meta_query' => array(
                    array(
                        'key' => 'payment_order_id',
                        'value' => $data['shop_order_id']
                    )
                )
            );

            $auctions = get_posts($args);

            if (empty($auctions)) {
                throw new Exception('Auction not found for order ' . $data['shop_order_id']);
            }

            $auction_id = $auctions[0]->ID;

            // Update payment status
            switch ($verification['status']) {
                case 'success':
                    update_post_meta($auction_id, 'payment_status', 'completed');
                    do_action('bidspace_payment_completed', $auction_id);
                    break;
                
                case 'failed':
                    update_post_meta($auction_id, 'payment_status', 'failed');
                    do_action('bidspace_payment_failed', $auction_id);
                    break;
                
                case 'cancelled':
                    update_post_meta($auction_id, 'payment_status', 'cancelled');
                    do_action('bidspace_payment_cancelled', $auction_id);
                    break;
                
                default:
                    throw new Exception('Unknown payment status: ' . $verification['status']);
            }

            return array(
                'success' => true,
                'message' => 'Payment callback processed successfully'
            );

        } catch (Exception $e) {
            error_log('BOG Payment Callback Error: ' . $e->getMessage());
            return array(
                'success' => false,
                'error' => $e->getMessage()
            );
        }
    }
}