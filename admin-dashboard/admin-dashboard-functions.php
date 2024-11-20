<?php
// File: admin-dashboard/admin-dashboard-functions.php

// Add rewrite rules for admin dashboard
function add_admin_dashboard_rewrite_rules() {
    add_rewrite_rule(
        'admin-dashboard/([^/]+)/?$',
        'index.php?pagename=admin-dashboard&admin_section=$matches[1]',
        'top'
    );
}
add_action('init', 'add_admin_dashboard_rewrite_rules');

// Add query vars
function add_admin_dashboard_query_vars($vars) {
    $vars[] = 'admin_section';
    return $vars;
}
add_filter('query_vars', 'add_admin_dashboard_query_vars');

// Add menu item to WordPress admin menu
function add_admin_dashboard_menu() {
    add_menu_page(
        'Admin Dashboard',
        'Admin Dashboard',
        'manage_options',
        'custom-admin-dashboard',
        'render_admin_dashboard',
        'dashicons-dashboard',
        2
    );
}
add_action('admin_menu', 'add_admin_dashboard_menu');

// Render the admin dashboard from WordPress admin menu
function render_admin_dashboard() {
    wp_redirect(home_url('/admin-dashboard'));
    exit;
}

// Register and enqueue admin styles and scripts
function enqueue_admin_dashboard_assets() {
    if (is_page('admin-dashboard')) {
        wp_enqueue_style(
            'admin-dashboard-styles',
            get_template_directory_uri() . '/admin-dashboard/assets/css/admin-dashboard.css',
            array(),
            '1.0.0'
        );

        wp_enqueue_script(
            'admin-dashboard-scripts',
            get_template_directory_uri() . '/admin-dashboard/assets/js/admin-dashboard.js',
            array('jquery'),
            '1.0.0',
            true
        );

        wp_localize_script('admin-dashboard-scripts', 'adminDashboard', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('admin_dashboard_nonce')
        ));
    }
}
add_action('wp_enqueue_scripts', 'enqueue_admin_dashboard_assets');

// Template loader for admin dashboard
function load_admin_dashboard_template($template) {
    if (is_page('admin-dashboard')) {
        if (!current_user_can('manage_options')) {
            wp_redirect(home_url());
            exit;
        }

        $new_template = locate_template('admin-dashboard/admin-dashboard-layout.php');
        if (!empty($new_template)) {
            return $new_template;
        }
    }
    return $template;
}
add_filter('template_include', 'load_admin_dashboard_template', 99);

// Add admin bar menu item
function add_admin_dashboard_admin_bar_link($wp_admin_bar) {
    if (current_user_can('manage_options')) {
        $wp_admin_bar->add_node(array(
            'id'    => 'custom-admin-dashboard',
            'title' => 'Admin Dashboard',
            'href'  => home_url('/admin-dashboard'),
        ));
    }
}
add_action('admin_bar_menu', 'add_admin_dashboard_admin_bar_link', 999);

// AJAX handlers
function handle_admin_auction_actions() {
    check_ajax_referer('admin_dashboard_nonce', 'nonce');
    
    if (!current_user_can('manage_options')) {
        wp_send_json_error('Unauthorized');
        return;
    }

    $action = isset($_POST['auction_action']) ? sanitize_text_field($_POST['auction_action']) : '';
    $auction_id = isset($_POST['auction_id']) ? intval($_POST['auction_id']) : 0;

    switch ($action) {
        case 'approve':
            update_post_meta($auction_id, 'auction_status', 'approved');
            log_admin_action($auction_id, 'approved_auction');
            wp_send_json_success('Auction approved');
            break;
            
        case 'reject':
            update_post_meta($auction_id, 'auction_status', 'rejected');
            log_admin_action($auction_id, 'rejected_auction');
            wp_send_json_success('Auction rejected');
            break;
            
        default:
            wp_send_json_error('Invalid action');
            break;
    }
}
add_action('wp_ajax_handle_admin_auction_actions', 'handle_admin_auction_actions');

// Logging function
function log_admin_action($auction_id, $action, $notes = '') {
    global $wpdb;
    $admin_id = get_current_user_id();
    
    $data = array(
        'admin_id' => $admin_id,
        'auction_id' => $auction_id,
        'action' => $action,
        'notes' => $notes,
        'created_at' => current_time('mysql')
    );
    
    $wpdb->insert($wpdb->prefix . 'admin_action_logs', $data);
}

// Get dashboard statistics
function get_admin_dashboard_stats() {
    $stats = array(
        'total_auctions' => wp_count_posts('auction')->publish,
        'pending_auctions' => wp_count_posts('auction')->pending,
        'total_users' => count_users()['total_users'],
        'monthly_revenue' => calculate_monthly_revenue(),
        'active_auctions' => get_active_auctions_count(),
        'total_bids' => get_total_bids_count()
    );
    
    return $stats;
}

// Helper functions
function calculate_monthly_revenue() {
    global $wpdb;
    $first_day_of_month = date('Y-m-01 00:00:00');
    $last_day_of_month = date('Y-m-t 23:59:59');
    
    $revenue = $wpdb->get_var($wpdb->prepare(
        "SELECT SUM(meta_value) 
        FROM {$wpdb->postmeta} 
        WHERE meta_key = 'auction_final_price' 
        AND post_id IN (
            SELECT ID 
            FROM {$wpdb->posts} 
            WHERE post_type = 'auction' 
            AND post_status = 'publish'
            AND post_date BETWEEN %s AND %s
        )",
        $first_day_of_month,
        $last_day_of_month
    ));
    
    return $revenue ? floatval($revenue) : 0;
}

function get_active_auctions_count() {
    $args = array(
        'post_type' => 'auction',
        'post_status' => 'publish',
        'meta_query' => array(
            array(
                'key' => 'auction_status',
                'value' => 'active',
                'compare' => '='
            )
        )
    );
    $query = new WP_Query($args);
    return $query->found_posts;
}

function get_total_bids_count() {
    global $wpdb;
    return $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}auction_bids");
}

// Create necessary tables on theme activation
function create_admin_dashboard_tables() {
    global $wpdb;
    
    $charset_collate = $wpdb->get_charset_collate();
    
    $sql = "CREATE TABLE IF NOT EXISTS {$wpdb->prefix}admin_action_logs (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        admin_id bigint(20) NOT NULL,
        auction_id bigint(20) NOT NULL,
        action varchar(50) NOT NULL,
        notes text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
}
add_action('after_switch_theme', 'create_admin_dashboard_tables');

// Flush rewrite rules on theme activation
function flush_admin_dashboard_rules() {
    add_admin_dashboard_rewrite_rules();
    flush_rewrite_rules();
}
add_action('after_switch_theme', 'flush_admin_dashboard_rules');

// Optional: Add link to navigation menu
function add_admin_dashboard_nav_menu_item($items, $args) {
    if (is_user_logged_in() && current_user_can('manage_options')) {
        $items .= '<li><a href="' . home_url('/admin-dashboard') . '">ადმინ პანელი</a></li>';
    }
    return $items;
}
add_filter('wp_nav_menu_items', 'add_admin_dashboard_nav_menu_item', 10, 2);