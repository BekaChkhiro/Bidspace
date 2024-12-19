<?php
require_once __DIR__ . '/../vendor/autoload.php';
use Twilio\Rest\Client;

function get_twilio_client() {
    // Credentials should be defined in wp-config.php
    if (!defined('TWILIO_ACCOUNT_SID') || !defined('TWILIO_AUTH_TOKEN') || !defined('TWILIO_PHONE_NUMBER')) {
        error_log('Twilio credentials are not configured in wp-config.php');
        return null;
    }
    
    return new Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}

function send_sms_verification($to_number, $code) {
    try {
        $client = get_twilio_client();
        if (!$client) {
            return false;
        }

        $message = $client->messages->create(
            $to_number,
            [
                'from' => TWILIO_PHONE_NUMBER,
                'body' => "თქვენი დადასტურების კოდია: $code"
            ]
        );
        return true;
    } catch (Exception $e) {
        error_log('Twilio SMS Error: ' . $e->getMessage());
        return false;
    }
}
