<?php
/**
 * Theme Setup and Configuration
 */

// Load theme assets
function boilerplate_load_assets() {
    wp_enqueue_script('ourmainjs', get_theme_file_uri('/build/index.js'), array('wp-element'), '1.0', true);
    wp_enqueue_style('ourmaincss', get_theme_file_uri('/build/index.css'));
}
add_action('wp_enqueue_scripts', 'boilerplate_load_assets');

// Add theme support
function boilerplate_add_support() {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
}
add_action('after_setup_theme', 'boilerplate_add_support');

// Enqueue custom styles
function my_theme_enqueue_styles() {
    wp_enqueue_style('custom-style', get_template_directory_uri() . '/style.css');
}
add_action('wp_enqueue_scripts', 'my_theme_enqueue_styles');

// React scripts
function my_react_theme_scripts() {
    wp_enqueue_script('my-react-theme-app', get_template_directory_uri() . '/build/index.js', array('wp-element'), '1.0.0', true);
    wp_enqueue_style('my-react-theme-style', get_stylesheet_uri());
}
add_action('wp_enqueue_scripts', 'my_react_theme_scripts');

// Tailwind CSS
function enqueue_tailwind() {
    wp_enqueue_style('tailwind-css', 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css', array(), null);
}
add_action('wp_enqueue_scripts', 'enqueue_tailwind');

// Font Awesome
function load_font_awesome() {
    wp_enqueue_style('font-awesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');
}
add_action('wp_enqueue_scripts', 'load_font_awesome');

// Register menus
function register_my_menus() {
    register_nav_menus(
        array(
            'header-menu' => __('Header Menu'),
        )
    );
}
add_action('init', 'register_my_menus');

// Force front page template
function force_front_page() {
    if (is_home()) {
        $front_page = get_stylesheet_directory() . '/front-page.php';
        if (file_exists($front_page)) {
            include($front_page);
            exit();
        }
    }
}
add_action('template_redirect', 'force_front_page');

// Add REST API settings to frontend
function add_rest_settings() {
    if (is_user_logged_in()) {
        $user_id = get_current_user_id();
        ?>
        <script type="text/javascript">
            window.bidspaceSettings = {
                restNonce: '<?php echo wp_create_nonce("wp_rest"); ?>',
                userId: <?php echo $user_id; ?>,
                ajaxUrl: '<?php echo admin_url('admin-ajax.php'); ?>',
                ajaxNonce: '<?php echo wp_create_nonce('bidspace_ajax'); ?>'
            };
        </script>
        <?php
    }
}
add_action('wp_footer', 'add_rest_settings', 100);

// Add CORS headers
function add_cors_headers() {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-WP-Nonce');
}
add_action('init', 'add_cors_headers');

// Add AJAX URL
function add_ajax_url_to_head() {
    ?>
    <script type="text/javascript">
        var ajaxurl = '<?php echo admin_url('admin-ajax.php'); ?>';
    </script>
    <?php
}
add_action('wp_head', 'add_ajax_url_to_head');

// Filter for all users 
add_filter('rest_user_query', function($args, $request) {
    $args['has_published_posts'] = false;
    return $args;
}, 10, 2);

function spa_rewrite_rules() {
  add_rewrite_rule('^.*$', 'index.php', 'top');
}
add_action('init', 'spa_rewrite_rules');

function spa_template() {
  return get_template_directory() . '/index.php';
}
add_filter('template_include', 'spa_template');

function spa_enable_rewrites() {
  add_rewrite_rule('^questions/?', 'index.php', 'top');
  add_rewrite_rule('^auction/?', 'index.php', 'top');
  add_rewrite_rule('^instruction/?', 'index.php', 'top');
  add_rewrite_rule('^sport/?', 'index.php', 'top');
  add_rewrite_rule('^travel/?', 'index.php', 'top');
  add_rewrite_rule('^events/?', 'index.php', 'top');
  add_rewrite_rule('^theater_cinema/?', 'index.php', 'top');
}
add_action('init', 'spa_enable_rewrites');

function spa_template_include($template) {
  if (is_404()) {
      return get_stylesheet_directory() . '/index.php';
  }
  return $template;
}
add_filter('template_include', 'spa_template_include');