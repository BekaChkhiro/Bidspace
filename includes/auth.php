<?php
/**
 * Authentication Functions
 */

// Login handler
function custom_login($request) {
    $creds = array(
        'user_login'    => $request->get_param('username'),
        'user_password' => $request->get_param('password'),
        'remember'      => true
    );

    $user = wp_signon($creds, false);

    if (is_wp_error($user)) {
        return new WP_REST_Response(array(
            'success' => false,
            'message' => $user->get_error_message()
        ), 401);
    }

    wp_set_current_user($user->ID);
    wp_set_auth_cookie($user->ID);

    return new WP_REST_Response(array(
        'success' => true,
        'message' => 'ავტორიზაცია წარმატებულია'
    ), 200);
}

// Registration handler
function custom_register_endpoint($request) {
    $username = sanitize_user($request->get_param('username'));
    $email = sanitize_email($request->get_param('email'));
    $password = $request->get_param('password');
    $firstName = sanitize_text_field($request->get_param('firstName'));
    $lastName = sanitize_text_field($request->get_param('lastName'));
    $phone = sanitize_text_field($request->get_param('phone'));
    $personalNumber = sanitize_text_field($request->get_param('personalNumber'));

    if (empty($firstName) || empty($lastName) || empty($email) || empty($phone) || 
        empty($username) || empty($personalNumber) || empty($password)) {
        return new WP_REST_Response(array(
            'success' => false,
            'message' => 'გთხოვთ შეავსოთ ყველა სავალდებულო ველი'
        ), 400);
    }

    if (email_exists($email) || username_exists($username)) {
        return new WP_REST_Response(array(
            'success' => false,
            'message' => 'ელ-ფოსტა ან მომხმარებლის სახელი უკვე არსებობს'
        ), 400);
    }

    $verificationCode = generate_verification_code();
    
    $user_id = wp_create_user($username, $password, $email);
    
    if (is_wp_error($user_id)) {
        return new WP_REST_Response(array(
            'success' => false,
            'message' => 'რეგისტრაცია ვერ მოხერხდა'
        ), 500);
    }

    update_user_meta($user_id, 'first_name', $firstName);
    update_user_meta($user_id, 'last_name', $lastName);
    update_user_meta($user_id, 'phone', $phone);
    update_user_meta($user_id, 'personal_number', $personalNumber);
    update_user_meta($user_id, 'verification_code', $verificationCode);

    $to = $email;
    $subject = 'ვერიფიკაციის კოდი';
    $message = "თქვენი ვერიფიკაციის კოდია: $verificationCode";
    $headers = array('Content-Type: text/html; charset=UTF-8');

    wp_mail($to, $subject, $message, $headers);

    return new WP_REST_Response(array(
        'success' => true,
        'message' => 'რეგისტრაცია წარმატებით დასრულდა'
    ), 200);
}

// Verification handler
function custom_verify_code_endpoint($request) {
    $email = sanitize_email($request->get_param('email'));
    $code = sanitize_text_field($request->get_param('code'));

    $user = get_user_by('email', $email);

    if (!$user) {
        return new WP_REST_Response(array(
            'success' => false,
            'message' => 'მომხმარებელი ვერ მოიძებნა'
        ), 404);
    }

    $stored_code = get_user_meta($user->ID, 'verification_code', true);

    if ($code !== $stored_code) {
        return new WP_REST_Response(array(
            'success' => false,
            'message' => 'არასწორი კოდი'
        ), 400);
    }

    update_user_meta($user->ID, 'email_verified', true);
    delete_user_meta($user->ID, 'verification_code');

    return new WP_REST_Response(array(
        'success' => true,
        'message' => 'ვერიფიკაცია წარმატებით დასრულდა'
    ), 200);
}

// Generate verification code
function generate_verification_code() {
    return str_pad(strval(mt_rand(100000, 999999)), 6, '0', STR_PAD_LEFT);
}

// Login redirect
function redirect_login_page() {
    $login_page = home_url('/login/');
    $page_viewed = basename($_SERVER['REQUEST_URI']);

    if ($page_viewed == "wp-login.php" && $_SERVER['REQUEST_METHOD'] == 'GET') {
        wp_redirect($login_page);
        exit;
    }
}
add_action('init', 'redirect_login_page');

// Login failed handler
function login_failed() {
    $login_page = home_url('/login/');
    wp_redirect($login_page . '?login=failed');
    exit;
}
add_action('wp_login_failed', 'login_failed');

// Username password verification
function verify_username_password($user, $username, $password) {
    $login_page = home_url('/login/');
    if ($username == "" || $password == "") {
        wp_redirect($login_page . "?login=empty");
        exit;
    }
}
add_filter('authenticate', 'verify_username_password', 1, 3);

// Logout handler
function logout_page() {
    $login_page = home_url('/login/');
    wp_redirect($login_page . "?logged_out=true");
    exit;
}
add_action('wp_logout', 'logout_page');

// Register REST routes
add_action('rest_api_init', function() {
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