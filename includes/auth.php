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
    // რეგისტრაციის კოდი უცვლელი რჩება
}

// Verification handler
function custom_verify_code_endpoint($request) {
    // ვერიფიკაციის კოდი უცვლელი რჩება
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

    wp_logout();
    session_destroy();
    
    // Redirect to the main page
    wp_redirect(home_url());
    exit();
    
    return new WP_REST_Response([
        'success' => true,
        'message' => 'Successfully logged out'
    ]);
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
                'name' => $current_user->display_name
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
});

// Add required actions
add_action('init', 'redirect_login_page');
add_action('wp_login_failed', 'login_failed');
add_action('wp_logout', 'logout_page');
add_filter('authenticate', 'verify_username_password', 1, 3);