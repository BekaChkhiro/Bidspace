<?php
/**
 * Theme setup and basic functionality
 */

function boilerplate_load_assets() {
    wp_enqueue_script('ourmainjs', get_theme_file_uri('/build/index.js'), array('wp-element'), '1.0', true);
    wp_enqueue_style('ourmaincss', get_theme_file_uri('/build/index.css'));
}

function boilerplate_add_support() {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
}

function my_theme_enqueue_styles() {
    wp_enqueue_style('custom-style', get_template_directory_uri() . '/style.css');
}

function my_react_theme_scripts() {
    wp_enqueue_script('my-react-theme-app', get_template_directory_uri() . '/build/index.js', array('wp-element'), '1.0.0', true);
    wp_enqueue_style('my-react-theme-style', get_stylesheet_uri());
}

function enqueue_tailwind() {
    wp_enqueue_style('tailwind-css', 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css', array(), null);
}

function load_font_awesome() {
    wp_enqueue_style('font-awesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');
}

function register_my_menus() {
    register_nav_menus(
        array(
            'header-menu' => __('Header Menu'),
        )
    );
}

function force_front_page() {
    if (is_home()) {
        $front_page = get_stylesheet_directory() . '/front-page.php';
        if (file_exists($front_page)) {
            include($front_page);
            exit();
        }
    }
}

function enhanced_hide_menu_items($items, $menu, $args) {
    if (!is_user_logged_in()) {
        $restricted_pages = array('dashboard', 'profile', 'my-pages');
        foreach ($items as $key => $item) {
            if ($item->type == 'post_type' && $item->object == 'page') {
                $page = get_post($item->object_id);
                if ($page && in_array($page->post_name, $restricted_pages)) {
                    unset($items[$key]);
                }
            }
        }
    }
    return $items;
}

// Add actions
add_action('wp_enqueue_scripts', 'boilerplate_load_assets');
add_action('after_setup_theme', 'boilerplate_add_support');
add_action('wp_enqueue_scripts', 'my_theme_enqueue_styles');
add_action('wp_enqueue_scripts', 'my_react_theme_scripts');
add_action('wp_enqueue_scripts', 'enqueue_tailwind');
add_action('wp_enqueue_scripts', 'load_font_awesome');
add_action('init', 'register_my_menus');
add_action('template_redirect', 'force_front_page');
add_filter('wp_nav_menu_objects', 'enhanced_hide_menu_items', 10, 3);