<?php
/**
 * Authentication Functions
 */

// Login handler
function custom_login($request) {
    error_log('Login attempt started');
    
    $creds = array(
        'user_login'    => $request->get_param('username'),
        'user_password' => $request->get_param('password'),
        'remember'      => true
    );

    error_log('Login attempt for user: ' . $creds['user_login']);

    // Force session start
    if (!session_id()) {
        session_start();
    }

    $user = wp_signon($creds, true);

    if (is_wp_error($user)) {
        error_log('Login error: ' . $user->get_error_message());
        return new WP_REST_Response(array(
            'success' => false,
            'message' => $user->get_error_message()
        ), 401);
    }

    wp_set_current_user($user->ID);
    wp_set_auth_cookie($user->ID, true);
    $_SESSION['wp_user_id'] = $user->ID;

    error_log('User logged in successfully. User ID: ' . $user->ID);
    error_log('Session ID: ' . session_id());
    error_log('Is user logged in: ' . (is_user_logged_in() ? 'Yes' : 'No'));

    return new WP_REST_Response(array(
        'success' => true,
        'message' => 'ავტორიზაცია წარმატებულია',
        'user' => array(
            'id' => $user->ID,
            'email' => $user->user_email,
            'name' => $user->display_name
        )
    ), 200);
}

// Registration handler
function custom_register_endpoint($request) {
    error_log('Registration attempt started');
    error_log('Request parameters: ' . print_r($request->get_params(), true));

    $username = sanitize_user($request->get_param('username'));
    $email = sanitize_email($request->get_param('email'));
    $password = $request->get_param('password');
    $first_name = sanitize_text_field($request->get_param('firstName'));
    $last_name = sanitize_text_field($request->get_param('lastName'));
    $phone = sanitize_text_field($request->get_param('phone'));
    $personal_number = sanitize_text_field($request->get_param('personalNumber'));

    error_log("Processing registration for username: $username, email: $email");

    // Check if username exists
    if (username_exists($username)) {
        error_log("Username $username already exists");
        return new WP_REST_Response([
            'success' => false,
            'message' => 'მომხმარებლის სახელი დაკავებულია'
        ], 400);
    }

    // Check if email exists
    if (email_exists($email)) {
        error_log("Email $email already exists");
        return new WP_REST_Response([
            'success' => false,
            'message' => 'ელ-ფოსტა უკვე გამოყენებულია'
        ], 400);
    }

    // Create user
    $user_id = wp_create_user($username, $password, $email);

    if (is_wp_error($user_id)) {
        error_log('User creation error: ' . $user_id->get_error_message());
        return new WP_REST_Response([
            'success' => false,
            'message' => $user_id->get_error_message()
        ], 400);
    }

    error_log("User created successfully with ID: $user_id");

    // Update user meta
    update_user_meta($user_id, 'first_name', $first_name);
    update_user_meta($user_id, 'last_name', $last_name);
    update_user_meta($user_id, 'phone_number', $phone);
    update_user_meta($user_id, 'piradi_nomeri', $personal_number);

    // Generate verification code
    $verification_code = generate_verification_code();
    update_user_meta($user_id, 'verification_code', $verification_code);
    update_user_meta($user_id, 'email_verified', false);

    error_log("Verification code generated: $verification_code");

    // Send verification email
    $to = $email;
    $subject = 'ელ-ფოსტის დადასტურება';
    $message = sprintf(
        'გამარჯობა %s,\n\nგთხოვთ შეიყვანოთ ეს კოდი თქვენი ანგარიშის დასადასტურებლად: %s',
        $first_name,
        $verification_code
    );
    $headers = array('Content-Type: text/plain; charset=UTF-8');
    
    $mail_sent = wp_mail($to, $subject, $message, $headers);
    error_log("Verification email sent: " . ($mail_sent ? 'success' : 'failed'));

    return new WP_REST_Response([
        'success' => true,
        'message' => 'რეგისტრაცია წარმატებით დასრულდა'
    ], 200);
}

// Verification handler
function custom_verify_code_endpoint($request) {
    $email = sanitize_email($request->get_param('email'));
    $code = sanitize_text_field($request->get_param('code'));

    // Get user by email
    $user = get_user_by('email', $email);
    if (!$user) {
        return new WP_REST_Response([
            'success' => false,
            'message' => 'მომხმარებელი ვერ მოიძებნა'
        ], 400);
    }

    // Get stored verification code
    $stored_code = get_user_meta($user->ID, 'verification_code', true);
    if ($stored_code !== $code) {
        return new WP_REST_Response([
            'success' => false,
            'message' => 'არასწორი კოდი'
        ], 400);
    }

    // Mark email as verified
    update_user_meta($user->ID, 'email_verified', true);
    delete_user_meta($user->ID, 'verification_code');

    // Auto-login user
    wp_set_current_user($user->ID);
    wp_set_auth_cookie($user->ID);

    return new WP_REST_Response([
        'success' => true,
        'message' => 'ელ-ფოსტა დადასტურებულია'
    ], 200);
}

// Resend verification code handler
function custom_resend_code_endpoint($request) {
    $email = sanitize_email($request->get_param('email'));

    // Get user by email
    $user = get_user_by('email', $email);
    if (!$user) {
        return new WP_REST_Response([
            'success' => false,
            'message' => 'მომხმარებელი ვერ მოიძებნა'
        ], 400);
    }

    // Check if email is already verified
    $is_verified = get_user_meta($user->ID, 'email_verified', true);
    if ($is_verified) {
        return new WP_REST_Response([
            'success' => false,
            'message' => 'ელ-ფოსტა უკვე დადასტურებულია'
        ], 400);
    }

    // Generate new verification code
    $verification_code = generate_verification_code();
    update_user_meta($user->ID, 'verification_code', $verification_code);

    // Send verification email
    $to = $email;
    $subject = 'ელ-ფოსტის დადასტურება';
    $message = sprintf(
        'გამარჯობა %s,\ნ\nგთხოვთ შეიყვანოთ ეს კოდი თქვენი ანგარიშის დასადასტურებლად: %s',
        get_user_meta($user->ID, 'first_name', true),
        $verification_code
    );
    $headers = array('Content-Type: text/plain; charset=UTF-8');
    
    $sent = wp_mail($to, $subject, $message, $headers);

    if (!$sent) {
        return new WP_REST_Response([
            'success' => false,
            'message' => 'კოდის გაგზავნა ვერ მოხერხდა'
        ], 500);
    }

    return new WP_REST_Response([
        'success' => true,
        'message' => 'კოდი წარმატებით გაიგზავნა'
    ], 200);
}

// Request password reset handler
function request_password_reset($request) {
    $user = wp_get_current_user();
    if (!$user || !$user->exists()) {
        return new WP_REST_Response([
            'success' => false,
            'message' => 'მომხმარებელი ვერ მოიძებნა'
        ], 401);
    }

    $verification_method = $request->get_param('verification_method');
    $verification_code = generate_verification_code();
    
    // Store verification code and method
    update_user_meta($user->ID, 'reset_verification_code', $verification_code);
    update_user_meta($user->ID, 'reset_verification_method', $verification_method);
    update_user_meta($user->ID, 'reset_code_timestamp', time());

    if ($verification_method === 'sms') {
        $phone = $request->get_param('phone');
        if (empty($phone)) {
            return new WP_REST_Response([
                'success' => false,
                'message' => 'ტელეფონის ნომერი არ არის მითითებული'
            ], 400);
        }

        require_once _DIR_ . '/twilio-config.php';
        $sms_sent = send_sms_verification($phone, $verification_code);
        
        if (!$sms_sent) {
            return new WP_REST_Response([
                'success' => false,
                'message' => 'SMS-ის გაგზავნა ვერ მოხერხდა'
            ], 500);
        }
    } else {
        // Send verification email
        $to = $user->user_email;
        $subject = 'პაროლის აღდგენა';
        $message = sprintf(
            'გამარჯობა,\ნ\nგთხოვთ შეიყვანოთ ეს კოდი პაროლის აღსადგენად: %s',
            $verification_code
        );
        $headers = array('Content-Type: text/plain; charset=UTF-8');
        
        if (!wp_mail($to, $subject, $message, $headers)) {
            return new WP_REST_Response([
                'success' => false,
                'message' => 'ელ-ფოსტის გაგზავნა ვერ მოხერხდა'
            ], 500);
        }
    }

    return new WP_REST_Response([
        'success' => true,
        'message' => 'დადასტურების კოდი გაგზავნილია'
    ], 200);
}

// Verify and reset password handler
function verify_and_reset_password($request) {
    $user = wp_get_current_user();
    if (!$user || !$user->exists()) {
        return new WP_REST_Response([
            'success' => false,
            'message' => 'მომხმარებელი ვერ მოიძებნა'
        ], 401);
    }

    $code = $request->get_param('code');
    $new_password = $request->get_param('new_password');
    
    // Verify the code
    $stored_code = get_user_meta($user->ID, 'reset_verification_code', true);
    $code_timestamp = get_user_meta($user->ID, 'reset_code_timestamp', true);
    
    // Check if code is expired (15 minutes)
    if (time() - $code_timestamp > 900) {
        delete_user_meta($user->ID, 'reset_verification_code');
        delete_user_meta($user->ID, 'reset_code_timestamp');
        delete_user_meta($user->ID, 'reset_verification_method');
        
        return new WP_REST_Response([
            'success' => false,
            'message' => 'დადასტურების კოდს ვადა გაუვიდა'
        ], 400);
    }

    if ($stored_code !== $code) {
        return new WP_REST_Response([
            'success' => false,
            'message' => 'არასწორი დადასტურების კოდი'
        ], 400);
    }

    // Reset password
    wp_set_password($new_password, $user->ID);
    
    // Clean up verification data
    delete_user_meta($user->ID, 'reset_verification_code');
    delete_user_meta($user->ID, 'reset_code_timestamp');
    delete_user_meta($user->ID, 'reset_verification_method');

    return new WP_REST_Response([
        'success' => true,
        'message' => 'პაროლი წარმატებით შეიცვალა'
    ], 200);
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

// Login failed handler
function login_failed() {
    $login_page = home_url('/login/');
    wp_redirect($login_page . '?login=failed');
    exit;
}

// Username password verification
function verify_username_password($user, $username, $password) {
    $login_page = home_url('/login/');
    if ($username == "" || $password == "") {
        wp_redirect($login_page . "?login=empty");
        exit;
    }
}

// Logout handler
function logout_page() {
    $login_page = home_url('/login/');
    wp_redirect($login_page . "?logged_out=true");
    exit;
}

// Logout endpoint
function custom_logout_endpoint() {
    // Clear WordPress auth cookies
    wp_clear_auth_cookie();
    
    // Clear session
    if (session_id()) {
        session_destroy();
    }
    
    // Clear all WordPress cookies
    if (isset($_COOKIE)) {
        $cookies = array_keys($_COOKIE);
        foreach ($cookies as $cookie) {
            if (strpos($cookie, 'wordpress_') === 0 || strpos($cookie, 'wp-') === 0) {
                setcookie($cookie, '', time() - 3600, '/');
            }
        }
    }

    wp_logout();

    return new WP_REST_Response([
        'success' => true,
        'message' => 'Successfully logged out'
    ], 200);
}

// Auth status handler
function get_auth_status() {
    // Force session start
    if (!session_id()) {
        session_start();
    }

    error_log('Auth Status Check - Session ID: ' . session_id());
    error_log('Session user ID: ' . (isset($_SESSION['wp_user_id']) ? $_SESSION['wp_user_id'] : 'Not set'));
    error_log('Is user logged in: ' . (is_user_logged_in() ? 'Yes' : 'No'));

    if (is_user_logged_in() || isset($_SESSION['wp_user_id'])) {
        $current_user = wp_get_current_user();
        if (!$current_user->ID && isset($_SESSION['wp_user_id'])) {
            wp_set_current_user($_SESSION['wp_user_id']);
            $current_user = wp_get_current_user();
        }

        error_log('Current user ID: ' . $current_user->ID);
        
        return new WP_REST_Response(array(
            'success' => true,
            'message' => 'მომხმარებელი ავტორიზებულია',
            'user' => array(
                'id' => $current_user->ID,
                'email' => $current_user->user_email,
                'name' => $current_user->display_name,
                'roles' => $current_user->roles
            )
        ), 200);
    }
    
    error_log('User not logged in');
    return new WP_REST_Response(array(
        'success' => false,
        'message' => 'მომხმარებელი არ არის ავტორიზებული'
    ), 200);
}

// Register all REST routes
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

    register_rest_route('custom/v1', '/resend-code', array(
        'methods' => 'POST',
        'callback' => 'custom_resend_code_endpoint',
        'permission_callback' => '__return_true'
    ));

    register_rest_route('custom/v1', '/logout', array(
        'methods' => 'GET',
        'callback' => 'custom_logout_endpoint',
        'permission_callback' => '__return_true'
    ));

    register_rest_route('custom/v1', '/auth-status', array(
        'methods' => 'GET',
        'callback' => 'get_auth_status',
        'permission_callback' => '__return_true'
    ));

    register_rest_route('custom/v1', '/request-password-reset', array(
        'methods' => 'POST',
        'callback' => 'request_password_reset',
        'permission_callback' => 'is_user_logged_in'
    ));
    
    register_rest_route('custom/v1', '/verify-and-reset-password', array(
        'methods' => 'POST',
        'callback' => 'verify_and_reset_password',
        'permission_callback' => 'is_user_logged_in'
    ));
});

// Add required actions
add_action('init', 'redirect_login_page');
add_action('wp_login_failed', 'login_failed');
add_action('wp_logout', 'logout_page');
add_filter('authenticate', 'verify_username_password', 1, 3);
