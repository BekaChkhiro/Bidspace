<?php
/**
 * Main functions file
 * 
 * @package BidSpace
 */

// Include all functionality files
require_once get_template_directory() . '/includes/core/setup.php';
require_once get_template_directory() . '/includes/auth/auth.php';
require_once get_template_directory() . '/includes/features/auction.php';
require_once get_template_directory() . '/includes/features/comments.php';
require_once get_template_directory() . '/includes/features/admin.php';
require_once get_template_directory() . '/includes/features/users.php';
require_once get_template_directory() . '/functions/wishlist.php';

// Include password reset functionality
require_once get_template_directory() . '/includes/auth/password-reset.php';

// Register Custom Post Types
require_once get_template_directory() . '/includes/core/custom-post-types.php';

// Include Custom Fonts Management
require_once get_template_directory() . '/includes/core/custom-fonts.php';

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
    header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, X-API-Key");
    
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
        header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key');
        return $value;
    });
}
add_action('rest_api_init', 'add_cors_headers_for_rest', 15);

// Hide WordPress admin bar for all users
function hide_admin_bar_for_all_users() {
    add_filter('show_admin_bar', '__return_false');
}
add_action('after_setup_theme', 'hide_admin_bar_for_all_users');

// Enqueue WordPress REST API nonce
function enqueue_wp_api_settings() {
    wp_enqueue_script('wp-api');
    wp_localize_script('wp-api', 'wpApiSettings', array(
        'root' => esc_url_raw(rest_url()),
        'nonce' => wp_create_nonce('wp_rest'),
        'apiKey' => get_option('bidspace_api_key', '')
    ));
}
add_action('wp_enqueue_scripts', 'enqueue_wp_api_settings');

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

// Add API Key management page
function bidspace_add_api_key_page() {
    add_options_page(
        'API გასაღების მართვა',
        'API გასაღები',
        'manage_options',
        'bidspace-api-key',
        'bidspace_render_api_key_page'
    );
}
add_action('admin_menu', 'bidspace_add_api_key_page');

// Render API Key management page
function bidspace_render_api_key_page() {
    if (isset($_POST['generate_new_key']) && check_admin_referer('generate_new_key_action', 'generate_new_key_nonce')) {
        $new_key = wp_generate_password(32, false);
        update_option('bidspace_api_key', $new_key);
        echo '<div class="notice notice-success"><p>API გასაღები წარმატებით განახლდა!</p></div>';
    }

    $current_key = get_option('bidspace_api_key', '');
    ?>
    <div class="wrap">
        <h1>API გასაღების მართვა</h1>
        <div class="card" style="max-width: 800px; padding: 20px; margin-top: 20px;">
            <h2>მიმდინარე API გასაღები</h2>
            <div style="background: #f1f1f1; padding: 10px; margin: 10px 0;">
                <code style="font-size: 16px;"><?php echo esc_html($current_key); ?></code>
            </div>
            <form method="post">
                <?php wp_nonce_field('generate_new_key_action', 'generate_new_key_nonce'); ?>
                <input type="submit" name="generate_new_key" class="button button-primary" value="ახალი გასაღების გენერაცია">
            </form>
        </div>
    </div>
    <?php
}

// Add API key verification
add_filter('rest_pre_dispatch', function($result, $server, $request) {
    if (strpos($request->get_route(), '/wp/v2/auction') === false) {
        return $result;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        return $result;
    }

    $api_key = $request->get_header('X-API-Key');
    $valid_key = get_option('bidspace_api_key', '');

    if (!$api_key || $api_key !== $valid_key) {
        return new WP_Error(
            'rest_forbidden',
            'არასწორი API გასაღები',
            array('status' => 401)
        );
    }

    return $result;
}, 10, 3);

// Add REST API nonce to admin-ajax.php
function bidspace_add_rest_nonce() {
    wp_enqueue_script('wp-api');
    wp_localize_script('wp-api', 'wpApiSettings', array(
        'root' => esc_url_raw(rest_url()),
        'nonce' => wp_create_nonce('wp_rest')
    ));
}
add_action('wp_enqueue_scripts', 'bidspace_add_rest_nonce');
add_action('admin_enqueue_scripts', 'bidspace_add_rest_nonce');

// გავაუმჯობესოთ CORS და აუთენთიფიკაციის ჰენდლინგი
function bidspace_customize_rest_cors() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization, X-WP-Nonce, X-API-Key, X-WP-Admin');
        
        if ('OPTIONS' === $_SERVER['REQUEST_METHOD']) {
            status_header(200);
            exit();
        }
        
        return $value;
    });
}
add_action('rest_api_init', 'bidspace_customize_rest_cors', 15);

// გავაუმჯობესოთ nonce-ის გამოყენება
function bidspace_enqueue_rest_api_settings() {
    // ძველი სკრიპტების წაშლა
    wp_dequeue_script('wp-api');
    
    // ახალი სკრიპტების დამატება
    wp_enqueue_script('wp-api');
    wp_localize_script('wp-api', 'wpApiSettings', array(
        'root' => esc_url_raw(rest_url()),
        'nonce' => wp_create_nonce('wp_rest'),
        'apiKey' => get_option('bidspace_api_key', ''),
        'user' => array(
            'can_edit' => current_user_can('edit_others_auctions')
        )
    ));
}
remove_action('wp_enqueue_scripts', 'enqueue_wp_api_settings');
add_action('wp_enqueue_scripts', 'bidspace_enqueue_rest_api_settings');
add_action('admin_enqueue_scripts', 'bidspace_enqueue_rest_api_settings');

// შევცვალოთ API ავთენტიფიკაციის ლოგიკა
function bidspace_api_auth_handler($result, $server, $request) {
    // OPTIONS რექვესთებისთვის ყოველთვის დავაბრუნოთ true
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        return true;
    }

    // /auction ენდპოინტისთვის
    if (strpos($request->get_route(), '/wp/v2/auction') !== false) {
        // ადმინისტრატორებისთვის ყველა მოქმედება დაშვებულია
        if (current_user_can('administrator')) {
            return $result;
        }

        // GET რექვესთებისთვის არ მოვითხოვოთ API key
        if ($request->get_method() === 'GET') {
            return $result;
        }

        // DELETE რექვესთებისთვის შევამოწმოთ ნონსი და API key
        if ($request->get_method() === 'DELETE') {
            $nonce_verified = wp_verify_nonce($request->get_header('X-WP-Nonce'), 'wp_rest');
            $api_key = $request->get_header('X-API-Key');
            $valid_key = get_option('bidspace_api_key', '');

            if (!$nonce_verified || !$api_key || $api_key !== $valid_key) {
                return new WP_Error(
                    'rest_forbidden',
                    'უფლებამოსილების შემოწმება ვერ მოხერხდა',
                    array('status' => 401)
                );
            }
        }

        // სხვა შემთხვევებში შევამოწმოთ API key
        $api_key = $request->get_header('X-API-Key');
        $valid_key = get_option('bidspace_api_key', '');

        if (!$api_key || $api_key !== $valid_key) {
            return new WP_Error(
                'rest_forbidden',
                'არასწორი API გასაღები',
                array('status' => 401)
            );
        }
    }

    return $result;
}

// წავშალოთ ძველი ფილტრი და დავამატოთ ახალი
remove_filter('rest_pre_dispatch', 'bidspace_api_auth_handler');
add_filter('rest_pre_dispatch', 'bidspace_api_auth_handler', 10, 3);

// Remove all existing auction query filters first
remove_all_filters('rest_auction_query');

// Add new simplified filter that doesn't check visibility for admin dashboard
add_filter('rest_auction_query', function($args, $request) {
    // Check if request is from admin dashboard
    $is_admin_request = 
        isset($_SERVER['HTTP_X_WP_ADMIN']) || 
        (isset($_SERVER['HTTP_REFERER']) && strpos($_SERVER['HTTP_REFERER'], '/wp-admin/') !== false);

    // For admin dashboard requests, return all auctions without visibility filtering
    if ($is_admin_request) {
        return $args;
    }

    // For frontend requests, keep visibility filter
    if (!isset($args['meta_query'])) {
        $args['meta_query'] = array();
    }
    
    $args['meta_query'][] = array(
        'key' => 'visibility',
        'value' => '1',
        'compare' => '='
    );
    
    return $args;
}, 10, 2);


