<?php
/**
 * Main functions file
 * 
 * @package BidSpace
 */

// Include all functionality files
require_once get_template_directory() . '/includes/setup.php';
require_once get_template_directory() . '/includes/auth.php';
require_once get_template_directory() . '/includes/auction.php';
require_once get_template_directory() . '/includes/comments.php';
require_once get_template_directory() . '/includes/admin.php';
require_once get_template_directory() . '/includes/rest-api.php';
require_once get_template_directory() . '/functions/wishlist.php';

// Include password reset functionality
require_once get_template_directory() . '/includes/password-reset.php';

// Register Custom Post Types
require_once get_template_directory() . '/includes/custom-post-types.php';

// Include Custom Fonts Management
require_once get_template_directory() . '/includes/custom-fonts.php';

// Make sure we have required plugin functions
if (!function_exists('is_plugin_active')) {
    include_once(ABSPATH . 'wp-admin/includes/plugin.php');
}

// Deactivate Use Any Font plugin if active
function deactivate_use_any_font() {
    if (function_exists('is_plugin_active') && is_plugin_active('use-any-font/use-any-font.php')) {
        deactivate_plugins('use-any-font/use-any-font.php');
    }
}
add_action('admin_init', 'deactivate_use_any_font');

// Enable WordPress REST API CORS
function add_cors_http_header() {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
    
    if ('OPTIONS' == $_SERVER['REQUEST_METHOD']) {
        status_header(200);
        exit();
    }
}
add_action('init', 'add_cors_http_header');

// Enable WordPress Session Management
function start_session() {
    if (!session_id()) {
        session_start();
    }
}
add_action('init', 'start_session', 1);

// Add nonce verification bypass for our custom endpoints
function my_rest_authentication_errors($errors) {
    $request_uri = $_SERVER['REQUEST_URI'];
    if (strpos($request_uri, '/wp-json/custom/v1/') !== false) {
        return true;
    }
    return $errors;
}
add_filter('rest_authentication_errors', 'my_rest_authentication_errors');

// Add CORS headers for REST API
function add_cors_headers_for_rest() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization');
        return $value;
    });
}
add_action('rest_api_init', 'add_cors_headers_for_rest', 15);

add_action('after_setup_theme', 'show_admin_bar_for_admins');

function show_admin_bar_for_admins() {
    if (!current_user_can('administrator')) {
        add_filter('show_admin_bar', '__return_false');
    }
}

// Add Twilio settings to the Customizer
function bidspace_customize_register($wp_customize) {
    // Add Twilio section
    $wp_customize->add_section('twilio_settings', array(
        'title' => 'Twilio SMS Settings',
        'priority' => 120,
    ));

    // Add Account SID setting
    $wp_customize->add_setting('twilio_account_sid', array(
        'default' => '',
        'type' => 'option',
        'capability' => 'manage_options'
    ));

    $wp_customize->add_control('twilio_account_sid', array(
        'label' => 'Account SID',
        'section' => 'twilio_settings',
        'type' => 'text'
    ));

    // Add Auth Token setting
    $wp_customize->add_setting('twilio_auth_token', array(
        'default' => '',
        'type' => 'option',
        'capability' => 'manage_options'
    ));

    $wp_customize->add_control('twilio_auth_token', array(
        'label' => 'Auth Token',
        'section' => 'twilio_settings',
        'type' => 'text'
    ));

    // Add Phone Number setting
    $wp_customize->add_setting('twilio_phone_number', array(
        'default' => '',
        'type' => 'option',
        'capability' => 'manage_options'
    ));

    $wp_customize->add_control('twilio_phone_number', array(
        'label' => 'Twilio Phone Number',
        'section' => 'twilio_settings',
        'type' => 'text'
    ));
}
add_action('customize_register', 'bidspace_customize_register');