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
require_once get_template_directory() . '/includes/features/payments.php';
require_once get_template_directory() . '/functions/wishlist.php';
require_once get_template_directory() . '/includes/core/forum.php';

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
        header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key, X-WP-Nonce');
        header("Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://*.google.com https://*.googleapis.com https://*.firebaseapp.com; frame-src 'self' https://www.google.com https://*.firebaseapp.com; connect-src 'self' https://*.googleapis.com https://*.google.com https://*.firebaseio.com https://*.cloudfunctions.net");
        
        if ('OPTIONS' == $_SERVER['REQUEST_METHOD']) {
            status_header(200);
            exit();
        }
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

// Temporary rewrite flush - remove after forum appears
add_action('init', function() {
    flush_rewrite_rules();
}, 999);

// Remove all existing auction query filters first
remove_all_filters('rest_auction_query');

// Add new filter that handles visibility, city, and price filtering
add_filter('rest_auction_query', function($args, $request) {
    // Check if request is from admin dashboard
    $is_admin_request = 
        isset($_SERVER['HTTP_X_WP_ADMIN']) || 
        (isset($_SERVER['HTTP_REFERER']) && strpos($_SERVER['HTTP_REFERER'], '/wp-admin/') !== false);

    if (!$is_admin_request) {
        if (!isset($args['meta_query'])) {
            $args['meta_query'] = array();
        }

        $meta_query = array();
        
        // Add visibility filter for non-admin requests
        $meta_query[] = array(
            'key' => 'visibility',
            'value' => '1',
            'compare' => '='
        );
        
        // Add price filter if provided
        $min_price = $request->get_param('min_price');
        $max_price = $request->get_param('max_price');
        
        if ($min_price !== null || $max_price !== null) {
            $price_query = array();
            
            if ($min_price !== null && is_numeric($min_price)) {
                $price_query[] = array(
                    'key' => 'auction_price',
                    'value' => floatval($min_price),
                    'type' => 'NUMERIC',
                    'compare' => '>='
                );
            }
            
            if ($max_price !== null && is_numeric($max_price)) {
                $price_query[] = array(
                    'key' => 'auction_price',
                    'value' => floatval($max_price),
                    'type' => 'NUMERIC',
                    'compare' => '<='
                );
            }
            
            if (!empty($price_query)) {
                if (count($price_query) > 1) {
                    $price_query['relation'] = 'AND';
                }
                $meta_query[] = $price_query;
            }
        }
        
        // Add city filter if provided
        if ($request->get_param('city')) {
            $meta_query[] = array(
                'key' => 'city',
                'value' => sanitize_text_field($request->get_param('city')),
                'compare' => '='
            );
        }
        
        // Set meta_query relation to AND
        if (count($meta_query) > 1) {
            $meta_query['relation'] = 'AND';
        }
        
        $args['meta_query'] = $meta_query;
    }
    
    return $args;
}, 10, 2);

// Add FCM token endpoints
add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/save-fcm-token', array(
        'methods' => 'POST',
        'callback' => 'save_fcm_token',
        'permission_callback' => function() {
            return is_user_logged_in();
        }
    ));

    register_rest_route('custom/v1', '/remove-fcm-token', array(
        'methods' => 'POST',
        'callback' => 'remove_fcm_token',
        'permission_callback' => function() {
            return is_user_logged_in();
        }
    ));
});

function save_fcm_token($request) {
    $user_id = get_current_user_id();
    $token = $request->get_param('token');
    
    if (!$token) {
        return new WP_Error('missing_token', 'FCM token is required', array('status' => 400));
    }

    // Save token to user meta
    update_user_meta($user_id, 'fcm_token', sanitize_text_field($token));
    
    return array(
        'success' => true,
        'message' => 'FCM token saved successfully'
    );
}

function remove_fcm_token() {
    $user_id = get_current_user_id();
    delete_user_meta($user_id, 'fcm_token');
    
    return array(
        'success' => true,
        'message' => 'FCM token removed successfully'
    );
}

// Function to send FCM notification
function send_fcm_notification($user_id, $title, $body, $data = array()) {
    $fcm_token = get_user_meta($user_id, 'fcm_token', true);
    if (!$fcm_token) {
        return false;
    }

    $server_key = 'AAAAOPfm7ow:APA91bG0XNb4Jx5Scj8y4QyhYfwCbULPhwE6hQkHZ2Y1pB8a7FTDVKUmnr0qzK2lC1aWGq4h9gAZbhhN_gEKLLiZXVSVJXrtQG8oVuv-YWIFwmVNwoJYI0jgzTxLnRa_GQUr55wlF3ud';
    
    $fields = array(
        'to' => $fcm_token,
        'notification' => array(
            'title' => $title,
            'body' => $body,
            'icon' => get_template_directory_uri() . '/src/assets/images/notification-icon.png',
            'click_action' => site_url()
        ),
        'data' => $data
    );

    $headers = array(
        'Authorization: key=' . $server_key,
        'Content-Type: application/json'
    );

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://fcm.googleapis.com/fcm/send');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($fields));
    
    $result = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($result, true);
}

// Example usage for sending notification when new auction is created
add_action('save_post_auction', function($post_id, $post, $update) {
    if ($update || wp_is_post_revision($post_id)) {
        return;
    }

    // Get all users
    $users = get_users(array('fields' => 'ID'));
    
    foreach ($users as $user_id) {
        send_fcm_notification(
            $user_id,
            'ახალი აუქციონი',
            'დამატებულია ახალი აუქციონი: ' . get_the_title($post_id),
            array(
                'post_id' => $post_id,
                'action' => 'new_auction'
            )
        );
    }
}, 10, 3);

// Add BOG Payment Settings
function bidspace_add_bog_settings() {
    add_settings_section(
        'bidspace_bog_settings',
        'BOG გადახდის პარამეტრები',
        function() {
            echo '<p>Bank of Georgia გადახდის სისტემის პარამეტრები</p>';
        },
        'general'
    );

    // Client ID
    add_settings_field(
        'bog_client_id',
        'Client ID',
        function() {
            $value = get_option('bog_client_id');
            echo '<input type="text" id="bog_client_id" name="bog_client_id" value="' . esc_attr($value) . '" class="regular-text">';
        },
        'general',
        'bidspace_bog_settings'
    );

    // Secret Key
    add_settings_field(
        'bog_secret_key',
        'Secret Key',
        function() {
            $value = get_option('bog_secret_key');
            echo '<input type="password" id="bog_secret_key" name="bog_secret_key" value="' . esc_attr($value) . '" class="regular-text">';
        },
        'general',
        'bidspace_bog_settings'
    );

    // Production Mode
    add_settings_field(
        'bog_is_production',
        'Production Mode',
        function() {
            $value = get_option('bog_is_production', false);
            echo '<input type="checkbox" id="bog_is_production" name="bog_is_production" value="1" ' . checked(1, $value, false) . '>';
            echo '<label for="bog_is_production"> Enable production mode</label>';
        },
        'general',
        'bidspace_bog_settings'
    );

    register_setting('general', 'bog_client_id');
    register_setting('general', 'bog_secret_key');
    register_setting('general', 'bog_is_production');
}
add_action('admin_init', 'bidspace_add_bog_settings');




