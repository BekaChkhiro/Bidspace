<?php


add_filter('woocommerce_payment_gateways', 'add_bog_payment_gateway');
function add_bog_payment_gateway($gateways) {
    $gateways[] = 'WC_BOG_Payment_Gateway';
    return $gateways;
}

add_action('plugins_loaded', 'init_bog_payment_gateway_class');
function init_bog_payment_gateway_class() {
    class WC_BOG_Payment_Gateway extends WC_Payment_Gateway {
        public function __construct() {
            $this->id = 'bog_payment_gateway';
            $this->icon = 'https://webstatic.bog.ge/images/all.svg';
            $this->has_fields = true;
            $this->method_title = __('BOG Payment Gateway', 'woocommerce');
            $this->method_description = __('Process payments through BOG API.', 'woocommerce');

            $this->init_form_fields();
            $this->init_settings();

            $this->title = $this->get_option('title');
            $this->client_id = $this->get_option('client_id');
            $this->client_secret = $this->get_option('client_secret');

            add_action('woocommerce_update_options_payment_gateways_' . $this->id, array($this, 'process_admin_options'));
            add_action('woocommerce_receipt_' . $this->id, array($this, 'receipt_page'));
            add_action('woocommerce_api_bog_payment_gateway', array($this, 'handle_callback'));
        }

        public function init_form_fields() {
            $this->form_fields = array(
                'enabled' => array(
                    'title'   => __('Enable/Disable', 'woocommerce'),
                    'type'    => 'checkbox',
                    'label'   => __('Enable BOG Payment Gateway', 'woocommerce'),
                    'default' => 'yes',
                ),
                'title' => array(
                    'title'       => __('Title', 'woocommerce'),
                    'type'        => 'text',
                    'description' => __('Title displayed during checkout.', 'woocommerce'),
                    'default'     => __('Credit Card', 'woocommerce'),
                ),
                'client_id' => array(
                    'title'       => __('Client ID', 'woocommerce'),
                    'type'        => 'text',
                    'description' => __('Your BOG Client ID.', 'woocommerce'),
                    'default'     => '',
                ),
                'client_secret' => array(
                    'title'       => __('Client Secret', 'woocommerce'),
                    'type'        => 'password',
                    'description' => __('Your BOG Client Secret.', 'woocommerce'),
                    'default'     => '',
                ),
            );
        }

        public function process_payment($order_id) {
            global $woocommerce;
            $order = wc_get_order($order_id);

            error_log('Processing payment for order ID: ' . $order_id);

            $token = $this->get_access_token($this->client_id, $this->client_secret);
            if (is_wp_error($token)) {
                error_log('Token error: ' . $token->get_error_message());
                wc_add_notice(__('Payment error: ', 'woocommerce') . $token->get_error_message(), 'error');
                return;
            }

            $items = $order->get_items();
            $basket = array();

            foreach ($items as $item) {
                $product_id = $item->get_product_id();
                $quantity = $item->get_quantity();
                $unit_price = $item->get_total() / $quantity;

                $basket[] = array(
                    "quantity" => $quantity,
                    "unit_price" => number_format($unit_price, 2, '.', ''),
                    "product_id" => $product_id,
                );
            }

            $site_url = get_site_url();
            $currency = get_woocommerce_currency();
            $total_amount = $order->get_total();

            // Конвертация валюты
            if ($currency !== 'GEL') {
                $rate = $this->get_currency_conversion_rate($currency, 'GEL');
                if ($rate > 0) {
                    $total_amount = round($total_amount * $rate, 2);
                } else {
                    error_log('Currency conversion failed for currency: ' . $currency);
                    wc_add_notice(__('Currency conversion failed.', 'woocommerce'), 'error');
                    return;
                }
            }

            $data = array(
                "callback_url" => $site_url . "/wc-api/bog_payment_gateway",
                "external_order_id" => $order->get_order_number(),
                "purchase_units" => array(
                    "currency" => "GEL",
                    "total_amount" => $total_amount,
                    "basket" => $basket,
                ),
                "redirect_urls" => array(
                    "fail" => $order->get_cancel_order_url(),
                    "success" => $this->get_return_url($order)
                ),
            );

            error_log('Payment request data: ' . print_r($data, true));

            $response = $this->create_payment_order($token, $data);
            if (is_wp_error($response)) {
                error_log('Payment creation error: ' . $response->get_error_message());
                wc_add_notice(__('Payment error: ', 'woocommerce') . $response->get_error_message(), 'error');
                return;
            }

            error_log('Payment response: ' . print_r($response, true));

            if (isset($response['_links']['redirect']['href'])) {
                $woocommerce->cart->empty_cart();
                $order->update_status('pending', __('Awaiting BOG payment', 'woocommerce'));
                return array(
                    'result' => 'success',
                    'redirect' => $response['_links']['redirect']['href'],
                );
            } else {
                error_log('Payment error: Redirect link not found in response');
                wc_add_notice(__('Payment error: Redirect link not found in the response.', 'woocommerce'), 'error');
                return;
            }
        }

        private function get_currency_conversion_rate($from_currency, $to_currency) {
            // Пример фиксированного курса. Замените на вызов внешнего API для динамических данных.
            $rates = array(
                'USD' => 2.65,
                'EUR' => 2.85,
            );

            return isset($rates[$from_currency]) ? $rates[$from_currency] : 0;
        }

        public function handle_callback() {
            error_log('BOG Callback received at: ' . date('Y-m-d H:i:s'));
            
            $raw_post = file_get_contents('php://input');
            error_log('Raw callback data: ' . $raw_post);
            
            $callback_data = json_decode($raw_post, true);
            
            if ($callback_data && isset($callback_data['body']['external_order_id'])) {
                $order_id = $callback_data['body']['external_order_id'];
                $order = wc_get_order($order_id);
                
                if ($order) {
                    $order_status = $callback_data['body']['order_status']['key'];
                    
                    if ($order_status === 'completed') {
                        $transaction_id = $callback_data['body']['payment_detail']['transaction_id'];
                        $order->payment_complete($transaction_id);
                        $order->add_order_note(sprintf(
                            'BOG Payment completed successfully. Transaction ID: %s, Card: %s',
                            $transaction_id,
                            $callback_data['body']['payment_detail']['payer_identifier']
                        ));
                        $order->save();
                    } else {
                        $order->update_status('failed', 'Payment failed. Status: ' . $order_status);
                        $order->save();
                    }
                }
            }

            status_header(200);
            exit;
        }

        private function get_access_token($client_id, $client_secret) {
            $url = 'https://oauth2.bog.ge/auth/realms/bog/protocol/openid-connect/token';
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/x-www-form-urlencoded'));
            curl_setopt($ch, CURLOPT_USERPWD, "{$client_id}:{$client_secret}");
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query(array('grant_type' => 'client_credentials')));

            $response = curl_exec($ch);
            if (curl_errno($ch)) {
                error_log('Token request curl error: ' . curl_error($ch));
                return new WP_Error('curl_error', curl_error($ch));
            }
            curl_close($ch);
            
            $body = json_decode($response, true);
            if (isset($body['access_token'])) {
                error_log('Access token obtained successfully');
                return $body['access_token'];
            } else {
                error_log('Token request failed. Response: ' . print_r($body, true));
                return new WP_Error('token_error', 'Failed to retrieve access token: ' . $response);
            }
        }

        private function create_payment_order($token, $data) {
            $url = 'https://api.bog.ge/payments/v1/ecommerce/orders';
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, array(
                'Accept-Language: ka',
                'Authorization: Bearer ' . $token,
                'Content-Type: application/json'
            ));
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            
            $response = curl_exec($ch);
            if (curl_errno($ch)) {
                error_log('Payment order creation curl error: ' . curl_error($ch));
                return new WP_Error('curl_error', curl_error($ch));
            }
            curl_close($ch);
            
            error_log('Payment order creation response: ' . $response);
            return json_decode($response, true);
        }

        public function receipt_page($order) {
            echo '<p>' . __('Thank you for your order, please click the button below to pay with BOG.', 'woocommerce') . '</p>';
        }
    }
}
