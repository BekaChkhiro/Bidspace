<?php
/**
 * Admin dashboard functionality
 */

function add_admin_dashboard_rewrite_rules() {
    add_rewrite_rule(
        '^admin/dashboard/?$',
        'index.php?admin_dashboard=true',
        'top'
    );
    
    add_rewrite_rule(
        '^admin/dashboard/([^/]+)/?$',
        'index.php?admin_dashboard=true&admin_page=$matches[1]',
        'top'
    );
}

function add_admin_dashboard_query_vars($vars) {
    $vars[] = 'admin_dashboard';
    $vars[] = 'admin_page';
    return $vars;
}

function register_admin_dashboard_endpoint() {
    add_rewrite_endpoint('admin-dashboard', EP_ROOT);
}

function admin_dashboard_template_redirect() {
    if (get_query_var('admin_dashboard')) {
        if (!is_user_logged_in() || !current_user_can('manage_options')) {
            wp_redirect(home_url());
            exit;
        }
        
        include get_template_directory() . '/admin-dashboard/admin-dashboard-layout.php';
        exit;
    }
}

function add_frontend_admin_menu_item($items, $args) {
    if (is_user_logged_in() && current_user_can('manage_options')) {
        $items .= '<li><a href="' . home_url('admin/dashboard') . '">ადმინ პანელი</a></li>';
    }
    return $items;
}

function flush_admin_dashboard_rules() {
    add_admin_dashboard_rewrite_rules();
    flush_rewrite_rules();
}

// Add actions and filters
add_action('init', 'add_admin_dashboard_rewrite_rules');
add_action('init', 'register_admin_dashboard_endpoint');
add_action('template_redirect', 'admin_dashboard_template_redirect');
add_action('after_switch_theme', 'flush_admin_dashboard_rules');
add_filter('query_vars', 'add_admin_dashboard_query_vars');
add_filter('wp_nav_menu_items', 'add_frontend_admin_menu_item', 10, 2);