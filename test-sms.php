<?php
require_once __DIR__ . '/includes/twilio-config.php';

// ტესტური კოდი
$verification_code = str_pad(strval(mt_rand(100000, 999999)), 6, '0', STR_PAD_LEFT);

// შეცვალეთ ეს თქვენი ტელეფონის ნომრით
$phone_number = '+995568694879';

$result = send_sms_verification($phone_number, $verification_code);

if ($result) {
    echo "SMS გაიგზავნა წარმატებით! კოდი: " . $verification_code;
} else {
    echo "SMS-ის გაგზავნა ვერ მოხერხდა. შეამოწმეთ error.log";
}
