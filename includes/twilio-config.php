<?php
require_once __DIR__ . '/../vendor/autoload.php';
use Twilio\Rest\Client;

function get_twilio_client() {
    $account_sid = get_option('twilio_account_sid', '');
    $auth_token = get_option('twilio_auth_token', '');
    
    if (empty($account_sid) || empty($auth_token)) {
        error_log('Twilio credentials are not configured in WordPress settings');
        return null;
    }
    
    return new Client($account_sid, $auth_token);
}

function send_sms_verification($to_number, $code) {
    try {
        $client = get_twilio_client();
        if (!$client) {
            return false;
        }

        $phone_number = get_option('twilio_phone_number', '');
        if (empty($phone_number)) {
            error_log('Twilio phone number is not configured in WordPress settings');
            return false;
        }

        $message = $client->messages->create(
            $to_number,
            [
                'from' => $phone_number,
                'body' => "თქვენი დადასტურების კოდია: $code"
            ]
        );
        return true;
    } catch (Exception $e) {
        error_log('Twilio SMS Error: ' . $e->getMessage());
        return false;
    }
}
