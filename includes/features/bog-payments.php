<?php
/**
 * BOG Payments Integration
 */

class BOG_Payments {
    private $client_id;
    private $client_secret;
    private $token_url = 'https://oauth2.bog.ge/auth/realms/bog/protocol/openid-connect/token';
    private $api_url = 'https://api.bog.ge/payments/v1/ecommerce/orders';

    public function __construct() {
        $this->client_id = '10000610';
        $this->client_secret = '4CkZtaO70B3s';
    }

    public function get_access_token() {
        $ch = curl_init($this->token_url);
        
        error_log('BOG Payment: Requesting access token from ' . $this->token_url);
        
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Disable SSL verification temporarily
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/x-www-form-urlencoded']);
        
        $postFields = [
            'grant_type' => 'client_credentials',
            'client_id' => $this->client_id,
            'client_secret' => $this->client_secret
        ];
        
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postFields));

        $response = curl_exec($ch);
        $curl_info = curl_getinfo($ch);
        
        if (curl_errno($ch)) {
            $error_msg = curl_error($ch);
            error_log('BOG Payment: Token request failed - ' . $error_msg);
            error_log('BOG Payment: Curl info - ' . print_r($curl_info, true));
            curl_close($ch);
            return [
                'success' => false,
                'error' => $error_msg
            ];
        }

        curl_close($ch);
        $data = json_decode($response, true);

        error_log('BOG Payment: Token response - ' . print_r($data, true));

        if (isset($data['access_token'])) {
            error_log('BOG Payment: Successfully obtained access token');
            return [
                'success' => true,
                'token' => $data['access_token']
            ];
        }

        error_log('BOG Payment: Failed to parse token response - ' . print_r($response, true));
        return [
            'success' => false,
            'error' => 'Invalid token response'
        ];
    }

    public function initiate_payment($order_id, $amount, $currency = 'GEL', $description = '') {
        error_log('BOG Payment: Initiating payment for order ' . $order_id);
        
        $token_response = $this->get_access_token();
        if (!$token_response['success']) {
            error_log('BOG Payment: Failed to get access token - ' . $token_response['error']);
            return [
                'success' => false,
                'error' => 'Failed to get access token: ' . $token_response['error']
            ];
        }

        $site_url = get_site_url();
        $callback_url = add_query_arg('wc-api', 'bog_payment_gateway', $site_url);

        // Format the order data according to BOG API requirements
        $data = [
            'intent' => 'AUTHORIZE',
            'locale' => 'ka',
            'shop_order_id' => $order_id,
            'redirect_url' => $callback_url,
            'capture_method' => 'AUTOMATIC',
            'purchase_units' => [[
                'amount' => [
                    'currency_code' => $currency,
                    'value' => number_format($amount, 2, '.', '')
                ],
                'description' => $description
            ]],
            'redirect_urls' => [
                'success_url' => $site_url . '/payment-success',
                'fail_url' => $site_url . '/payment-failed',
                'cancel_url' => $site_url . '/payment-cancelled'
            ]
        ];

        error_log('BOG Payment: Payment request data - ' . print_r($data, true));

        $ch = curl_init($this->api_url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Disable SSL verification temporarily
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $token_response['token'],
            'Content-Type: application/json',
            'Accept: application/json',
            'Accept-Language: ka'
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

        $response = curl_exec($ch);
        $curl_info = curl_getinfo($ch);

        if (curl_errno($ch)) {
            $error_msg = curl_error($ch);
            error_log('BOG Payment: Payment initiation failed - ' . $error_msg);
            error_log('BOG Payment: Curl info - ' . print_r($curl_info, true));
            curl_close($ch);
            return [
                'success' => false,
                'error' => $error_msg
            ];
        }

        curl_close($ch);
        
        error_log('BOG Payment: Raw response - ' . $response);
        
        $response_data = json_decode($response, true);
        error_log('BOG Payment: Parsed response - ' . print_r($response_data, true));

        if (isset($response_data['links']) && is_array($response_data['links'])) {
            foreach ($response_data['links'] as $link) {
                if (isset($link['rel']) && $link['rel'] === 'approve' && isset($link['href'])) {
                    return [
                        'success' => true,
                        'links' => [
                            'redirect' => $link['href']
                        ]
                    ];
                }
            }
        }

        return [
            'success' => false,
            'error' => 'Could not find payment redirect URL in response'
        ];
    }

    public function verify_payment($order_id) {
        error_log('BOG Payment: Verifying payment for order ' . $order_id);
        
        $token_response = $this->get_access_token();
        if (!$token_response['success']) {
            return [
                'success' => false,
                'error' => 'Failed to get access token: ' . $token_response['error']
            ];
        }

        $verify_url = $this->api_url . '/' . $order_id;
        
        $ch = curl_init($verify_url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPGET, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $token_response['token'],
            'Accept-Language: ka'
        ]);

        $response = curl_exec($ch);
        $curl_info = curl_getinfo($ch);

        if (curl_errno($ch)) {
            $error_msg = curl_error($ch);
            error_log('BOG Payment: Payment verification failed - ' . $error_msg);
            error_log('BOG Payment: Curl info - ' . print_r($curl_info, true));
            curl_close($ch);
            return [
                'success' => false,
                'error' => $error_msg
            ];
        }

        curl_close($ch);
        $data = json_decode($response, true);

        error_log('BOG Payment: Verification response - ' . print_r($data, true));

        if (isset($data['order_status'])) {
            return [
                'success' => true,
                'status' => $data['order_status']['key']
            ];
        }

        return [
            'success' => false,
            'error' => 'Invalid verification response'
        ];
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