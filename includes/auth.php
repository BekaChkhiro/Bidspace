<?php
/**
 * Authentication related functions
 */

function custom_login($request) {
    $creds = array(
        'user_login'    => $request->get_param('username'),
        'user_password' => $request->get_param('password'),
        'remember'      => true
    );

    $user = wp_signon($creds, false);

    if (is_wp_error($user)) {
        return new WP_REST_Response(array('success' => false, 'message' => $user->get_error_message()), 401);
    } else {
        return new WP_REST_Response(array('success' => true, 'message' => 'ავტორიზაცია წარმატებულია'), 200);
    }
}

function custom_register_endpoint($request) {
    $firstName = $request->get_param('firstName');
    $lastName = $request->get_param('lastName');
    $email = $request->get_param('email');
    $phone = $request->get_param('phone');
    $username = $request->get_param('username');
    $personalNumber = $request->get_param('personalNumber');
    $password = $request->get_param('password');

    if (empty($firstName) || empty($lastName) || empty($email) || empty($phone) || empty($username) || empty($personalNumber) || empty($password)) {
        return [
            'success' => false,
            'message' => 'გთხოვთ შეავსოთ ყველა სავალდებულო ველი',
        ];
    }

    if (email_exists($email) || username_exists($username)) {
        return [
            'success' => false,
            'message' => 'ელ-ფოსტა ან მომხმარებლის სახელი უკვე არსებობს',
        ];
    }

    $verificationCode = generate_verification_code();
    update_user_meta(email_exists($email), 'verification_code', $verificationCode);

    $subject = 'Verification Code';
    $message = 'Your verification code is: ' . $verificationCode;
    wp_mail($email, $subject, $message);

    return [
        'success' => true,
        'message' => 'A verification code has been sent to your email address.',
    ];
}

function custom_verify_code_endpoint($request) {
    $email = $request->get_param('email');
    $code = $request->get_param('code');

    $storedCode = get_user_meta(email_exists($email), 'verification_code', true);
    if ($code === $storedCode) {
        $userId = username_exists($username);
        if (!$userId) {
            $userId = wp_create_user($username, $password, $email);
        }

        update_user_meta($userId, 'first_name', $firstName);
        update_user_meta($userId, 'last_name', $lastName);
        update_user_meta($userId, 'phone', $phone);
        update_user_meta($userId, 'personal_number', $personalNumber);
        delete_user_meta($userId, 'verification_code');

        return [
            'success' => true,
            'message' => 'Registration completed successfully.',
        ];
    } else {
        return [
            'success' => false,
            'message' => 'Invalid verification code.',
        ];
    }
}

function generate_verification_code() {
    return str_pad(strval(mt_rand(100000, 999999)), 6, '0', STR_PAD_LEFT);
}

function redirect_login_page() {
    $login_page = home_url('/login/');
    $page_viewed = basename($_SERVER['REQUEST_URI']);

    if ($page_viewed == "wp-login.php" && $_SERVER['REQUEST_METHOD'] == 'GET') {
        wp_redirect($login_page);
        exit;
    }
}

function login_failed() {
    $login_page = home_url('/login/');
    wp_redirect($login_page . '?login=failed');
    exit;
}

function verify_username_password($user, $username, $password) {
    $login_page = home_url('/login/');
    if ($username == "" || $password == "") {
        wp_redirect($login_page . "?login=empty");
        exit;
    }
}

function logout_page() {
    $login_page = home_url('/login/');
    wp_redirect($login_page . "?logged_out=true");
    exit;
}

// Add actions and REST routes
add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/login', array(
        'methods' => 'POST',
        'callback' => 'custom_login',
        'permission_callback' => '__return_true'
    ));

    register_rest_route('custom/v1', '/register', array(
        'methods' => 'POST',
        'callback' => 'custom_register_endpoint',
        'permission_callback' => '__return_true'
    ));

    register_rest_route('custom/v1', '/verify-code', array(
        'methods' => 'POST',
        'callback' => 'custom_verify_code_endpoint',
        'permission_callback' => '__return_true'
    ));
});

add_action('init', 'redirect_login_page');
add_action('wp_login_failed', 'login_failed');
add_filter('authenticate', 'verify_username_password', 1, 3);
add_action('wp_logout', 'logout_page');