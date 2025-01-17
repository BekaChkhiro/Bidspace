<?php

function bidspace_register_password_reset_endpoints() {
    register_rest_route('bidspace/v1', '/request-password-reset', array(
        'methods' => 'POST',
        'callback' => 'bidspace_request_password_reset',
        'permission_callback' => '__return_true'
    ));

    register_rest_route('bidspace/v1', '/verify-code', array(
        'methods' => 'POST',
        'callback' => 'bidspace_verify_code',
        'permission_callback' => '__return_true'
    ));

    register_rest_route('bidspace/v1', '/reset-password', array(
        'methods' => 'POST',
        'callback' => 'bidspace_reset_password',
        'permission_callback' => '__return_true'
    ));
}

function bidspace_request_password_reset($request) {
    $email = sanitize_email($request->get_param('email'));
    $user = get_user_by('email', $email);
    
    if (!$user) {
        return new WP_Error('user_not_found', 'მომხმარებელი ვერ მოიძებნა', array('status' => 404));
    }

    $verification_code = wp_rand(100000, 999999);
    $code_data = array(
        'code' => $verification_code,
        'expires' => time() + (30 * 60)
    );
    
    update_user_meta($user->ID, 'password_reset_code', $code_data);

    $to = $email;
    $subject = 'პაროლის აღდგენის კოდი';
    $message = sprintf(
        'თქვენი პაროლის აღდგენის კოდია: %s',
        $verification_code
    );
    $headers = array('Content-Type: text/plain; charset=UTF-8');

    if (wp_mail($to, $subject, $message, $headers)) {
        return array(
            'success' => true,
            'message' => 'კოდი გამოგზავნილია'
        );
    }

    return new WP_Error('email_failed', 'კოდის გაგზავნა ვერ მოხერხდა', array('status' => 500));
}

function bidspace_verify_code($request) {
    $email = sanitize_email($request->get_param('email'));
    $code = $request->get_param('code');
    
    $user = get_user_by('email', $email);
    if (!$user) {
        return new WP_Error('user_not_found', 'მომხმარებელი ვერ მოიძებნა', array('status' => 404));
    }

    $code_data = get_user_meta($user->ID, 'password_reset_code', true);
    
    if (!$code_data || time() > $code_data['expires']) {
        return new WP_Error('code_expired', 'კოდს ვადა გაუვიდა', array('status' => 400));
    }

    if ($code !== (string)$code_data['code']) {
        return new WP_Error('invalid_code', 'არასწორი კოდი', array('status' => 400));
    }

    return array(
        'success' => true,
        'message' => 'კოდი დადასტურებულია'
    );
}

function bidspace_reset_password($request) {
    $email = sanitize_email($request->get_param('email'));
    $code = $request->get_param('code');
    $new_password = $request->get_param('new_password');
    
    $user = get_user_by('email', $email);
    if (!$user) {
        return new WP_Error('user_not_found', 'მომხმარებელი ვერ მოიძებნა', array('status' => 404));
    }

    $code_data = get_user_meta($user->ID, 'password_reset_code', true);
    
    if (!$code_data || time() > $code_data['expires']) {
        return new WP_Error('code_expired', 'კოდს ვადა გაუვიდა', array('status' => 400));
    }

    if ($code !== (string)$code_data['code']) {
        return new WP_Error('invalid_code', 'არასწორი კოდი', array('status' => 400));
    }

    wp_set_password($new_password, $user->ID);
    delete_user_meta($user->ID, 'password_reset_code');

    return array(
        'success' => true,
        'message' => 'პაროლი წარმატებით შეიცვალა'
    );
}

add_action('rest_api_init', 'bidspace_register_password_reset_endpoints');
