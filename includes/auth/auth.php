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

    // HTML version of the email
    $message_html = '
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <img src="' . get_template_directory_uri() . '/src/assets/images/bidspace_logo.png" alt="Bidspace Logo" style="max-width: 150px;">
        </div>
        
        <div style="background: #f9f9f9; border-radius: 10px; padding: 30px; margin-bottom: 30px;">
            <h2 style="color: #000; margin-bottom: 20px; text-align: center;">ანგარიშის დადასტურება</h2>
            
            <p style="margin-bottom: 20px;">გამარჯობა ' . $first_name . ',</p>
            
            <p style="margin-bottom: 20px;">მადლობა Bidspace-ზე დარეგისტრირებისთვის. გთხოვთ, დაადასტუროთ თქვენი ანგარიში ქვემოთ მოცემული კოდის გამოყენებით.</p>
            
            <div style="background: #fff; padding: 20px; border-radius: 5px; text-align: center; margin: 30px 0;">
                <p style="font-size: 18px; margin-bottom: 10px;">თქვენი დადასტურების კოდია:</p>
                <div style="position: relative; display: inline-block;">
                    <h1 style="color: #000; font-size: 32px; margin: 0; padding: 10px 20px; background: #f5f5f5; border-radius: 5px; letter-spacing: 3px;">' . $verification_code . '</h1>
                </div>
            </div>
            
            <p style="color: #666; font-size: 14px;">კოდი მოქმედებს 30 წუთის განმავლობაში.</p>
            
            <p style="color: #666; margin-top: 30px;">თუ თქვენ არ დარეგისტრირებულხართ Bidspace-ზე, გთხოვთ უგულებელყოთ ეს შეტყობინება.</p>
        </div>
        
        <div style="text-align: center; color: #666; font-size: 12px;">
            <p>ეს არის ავტომატური შეტყობინება, გთხოვთ არ უპასუხოთ.</p>
            <p>&copy; ' . date('Y') . ' Bidspace. ყველა უფლება დაცულია.</p>
        </div>
    </body>
    </html>';

    // Plain text version
    $message_text = sprintf(
        "ანგარიშის დადასტურება - Bidspace\n\n" .
        "გამარჯობა %s,\n\n" .
        "მადლობა Bidspace-ზე დარეგისტრირებისთვის. გთხოვთ, დაადასტუროთ თქვენი ანგარიში.\n\n" .
        "თქვენი დადასტურების კოდია: %s\n\n" .
        "კოდი მოქმედებს 30 წუთის განმავლობაში.\n\n" .
        "თუ თქვენ არ დარეგისტრირებულხართ Bidspace-ზე, გთხოვთ უგულებელყოთ ეს შეტყობინება.\n\n" .
        "ეს არის ავტომატური შეტყობინება, გთხოვთ არ უპასუხოთ.",
        $first_name,
        $verification_code
    );

    $headers = array(
        'Content-Type: text/html; charset=UTF-8',
        'From: Bidspace <noreply@bidspace.ge>'
    );

    $subject = 'ანგარიშის დადასტურება - Bidspace';

    // Send email with both HTML and plain text versions
    add_filter('wp_mail_content_type', function() { return "text/html"; });
    $mail_sent = wp_mail($email, $subject, $message_html, $headers);
    remove_filter('wp_mail_content_type', function() { return "text/html"; });

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
        'გამარჯობა %s,\n\nგთხოვთ შეიყვანოთ ეს კოდი თქვენი ანგარიშის დასადასტურებლად: %s',
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

        require_once __DIR__ . '/twilio-config.php';
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
            'გამარჯობა,\n\nგთხოვთ შეიყვანოთ ეს კოდი პაროლის აღსადგენად: %s',
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
    // Force session start
    if (!session_id()) {
        session_start();
    }

    // Clear WordPress auth cookies
    wp_clear_auth_cookie();
    
    // Clear session data
    $_SESSION = array();
    
    // Destroy session
    if (session_id()) {
        session_destroy();
    }
    
    // Clear all cookies
    if (isset($_COOKIE[LOGGED_IN_COOKIE])) {
        setcookie(LOGGED_IN_COOKIE, '', time() - 3600, COOKIEPATH, COOKIE_DOMAIN);
    }
    if (isset($_COOKIE[AUTH_COOKIE])) {
        setcookie(AUTH_COOKIE, '', time() - 3600, COOKIEPATH, COOKIE_DOMAIN);
    }
    if (isset($_COOKIE[SECURE_AUTH_COOKIE])) {
        setcookie(SECURE_AUTH_COOKIE, '', time() - 3600, COOKIEPATH, COOKIE_DOMAIN);
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
add_filter('authenticate', 'verify_username_password', 1, 3);