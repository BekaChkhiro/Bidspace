<?php
/**
 * Theme Setup and Configuration
 */

// Load theme assets
function boilerplate_load_assets() {
    wp_enqueue_script('ourmainjs', get_theme_file_uri('/build/index.js'), array('wp-element'), '1.0', true);
    wp_enqueue_style('ourmaincss', get_theme_file_uri('/build/index.css'));
    wp_enqueue_style('tailwind-css', 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css', array(), null);
    wp_enqueue_style('font-awesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');
    wp_enqueue_style('custom-style', get_stylesheet_uri());
    
    if (is_user_logged_in()) {
        wp_localize_script('ourmainjs', 'bidspaceSettings', array(
            'restNonce' => wp_create_nonce("wp_rest"),
            'userId' => get_current_user_id(),
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'ajaxNonce' => wp_create_nonce('bidspace_ajax'),
            'wpApiSettings' => array(
                'root' => esc_url_raw(rest_url()),
                'nonce' => wp_create_nonce('wp_rest')
            )
        ));
    }
}
add_action('wp_enqueue_scripts', 'boilerplate_load_assets');

// Add theme support
function boilerplate_add_support() {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
}
add_action('after_setup_theme', 'boilerplate_add_support');

// Register menus
function register_my_menus() {
    register_nav_menus(
        array(
            'header-menu' => __('Header Menu'),
        )
    );
}
add_action('init', 'register_my_menus');

// Filter for all users 
add_filter('rest_user_query', function($args, $request) {
    $args['has_published_posts'] = false;
    return $args;
}, 10, 2);

function spa_rewrite_rules() {
    add_rewrite_rule('^(?!wp-admin|wp-json|wp-content|wp-includes).*', 'index.php', 'top');
}
add_action('init', 'spa_rewrite_rules');

function spa_template_include($template) {
    if (
        !is_admin() && 
        !is_customize_preview() && 
        !in_array($GLOBALS['pagenow'], ['wp-login.php', 'wp-register.php']) &&
        !str_contains($_SERVER['REQUEST_URI'], 'wp-json') &&
        !str_contains($_SERVER['REQUEST_URI'], 'wp-content')
    ) {
        return get_stylesheet_directory() . '/index.php';
    }
    return $template;
}
add_filter('template_include', 'spa_template_include');

// CORS და REST API კონფიგურაცია
function custom_rest_cors() {
  remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
  
  add_filter('rest_pre_serve_request', function($value) {
      header('Access-Control-Allow-Origin: ' . esc_url_raw(site_url()));
      header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
      header('Access-Control-Allow-Credentials: true');
      header('Access-Control-Allow-Headers: X-WP-Nonce, Content-Type');
      
      return $value;
  });
}
add_action('rest_api_init', 'custom_rest_cors', 15);

// REST API ავტორიზაციის კონფიგურაცია
function custom_determine_current_user($user_id) {
  if ($user_id) {
      return $user_id;
  }

  if (!empty($_SERVER['HTTP_X_WP_NONCE'])) {
      $nonce = $_SERVER['HTTP_X_WP_NONCE'];
      if (wp_verify_nonce($nonce, 'wp_rest')) {
          return wp_get_current_user()->ID;
      }
  }

  return $user_id;
}
add_filter('determine_current_user', 'custom_determine_current_user', 20);

function enqueue_api_scripts() {
    wp_enqueue_script('my-api-script', get_template_directory_uri() . '/js/api.js', array(), '1.0', true);
    wp_localize_script('my-api-script', 'wpApiSettings', array(
        'root' => esc_url_raw(rest_url()),
        'nonce' => wp_create_nonce('wp_rest')
    ));
}
add_action('wp_enqueue_scripts', 'enqueue_api_scripts');