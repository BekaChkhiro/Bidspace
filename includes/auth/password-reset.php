<?php

function bidspace_register_password_reset_endpoints() {
    // Endpoint to request verification code
    register_rest_route('bidspace/v1', '/request-password-reset', array(
        'methods' => 'POST',
        'callback' => 'bidspace_request_password_reset',
        'permission_callback' => function() {
            return is_user_logged_in();
        }
    ));

    // Endpoint to verify code only
    register_rest_route('bidspace/v1', '/verify-code', array(
        'methods' => 'POST',
        'callback' => 'bidspace_verify_code',
        'permission_callback' => function() {
            return is_user_logged_in();
        }
    ));

    // Endpoint to verify code and change password
    register_rest_route('bidspace/v1', '/verify-and-reset-password', array(
        'methods' => 'POST',
        'callback' => 'bidspace_verify_and_reset_password',
        'permission_callback' => function() {
            return is_user_logged_in();
        }
    ));
}
add_action('rest_api_init', 'bidspace_register_password_reset_endpoints');

function bidspace_request_password_reset($request) {
    $user_id = get_current_user_id();
    $user = get_user_by('id', $user_id);
    
    if (!$user) {
        return new WP_Error('user_not_found', 'User not found', array('status' => 404));
    }

    // Generate verification code
    $verification_code = wp_rand(100000, 999999);
    
    // Store code in user meta with expiration (30 minutes)
    $code_data = array(
        'code' => $verification_code,
        'expires' => time() + (30 * 60)
    );
    update_user_meta($user_id, 'password_reset_code', $code_data);

    // Send email
    $to = $user->user_email;
    $subject = 'პაროლის შეცვლის კოდი - Bidspace';
    $message = sprintf(
        'თქვენი პაროლის შეცვლის კოდია: %s\n\n' .
        'კოდი მოქმედია 30 წუთის განმავლობაში.\n\n' .
        'თუ თქვენ არ მოითხოვეთ პაროლის შეცვლა, გთხოვთ უგულებელყოთ ეს შეტყობინება.',
        $verification_code
    );
    $headers = array('Content-Type: text/plain; charset=UTF-8');

    if (wp_mail($to, $subject, $message, $headers)) {
        return array(
            'success' => true,
            'message' => 'Verification code sent to your email'
        );
    }

    return new WP_Error('email_failed', 'Failed to send verification email', array('status' => 500));
}

function bidspace_verify_code($request) {
    $user_id = get_current_user_id();
    $params = $request->get_params();
    
    if (!isset($params['code'])) {
        return new WP_Error('missing_code', 'Verification code is required', array('status' => 400));
    }

    $code_data = get_user_meta($user_id, 'password_reset_code', true);
    
    if (!$code_data || !is_array($code_data)) {
        return new WP_Error('invalid_code', 'No verification code found', array('status' => 400));
    }

    if (time() > $code_data['expires']) {
        delete_user_meta($user_id, 'password_reset_code');
        return new WP_Error('code_expired', 'Verification code has expired', array('status' => 400));
    }

    if ($params['code'] !== (string)$code_data['code']) {
        return new WP_Error('invalid_code', 'Invalid verification code', array('status' => 400));
    }

    return array(
        'success' => true,
        'message' => 'Code verified successfully'
    );
}

function bidspace_verify_and_reset_password($request) {
    $user_id = get_current_user_id();
    $params = $request->get_params();
    
    if (!isset($params['code']) || !isset($params['new_password'])) {
        return new WP_Error('missing_params', 'Missing required parameters', array('status' => 400));
    }

    $code_data = get_user_meta($user_id, 'password_reset_code', true);
    
    if (!$code_data || !is_array($code_data)) {
        return new WP_Error('invalid_code', 'No verification code found', array('status' => 400));
    }

    if (time() > $code_data['expires']) {
        delete_user_meta($user_id, 'password_reset_code');
        return new WP_Error('code_expired', 'Verification code has expired', array('status' => 400));
    }

    if ($params['code'] !== (string)$code_data['code']) {
        return new WP_Error('invalid_code', 'Invalid verification code', array('status' => 400));
    }

    // Change password
    wp_set_password($params['new_password'], $user_id);
    
    // Clear verification code
    delete_user_meta($user_id, 'password_reset_code');

    return array(
        'success' => true,
        'message' => 'Password updated successfully'
    );
}
