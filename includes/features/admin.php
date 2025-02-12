<?php
/**
 * Admin Dashboard Functions
 */

// Add rewrite rules
function add_admin_dashboard_rewrite_rules() {
    add_rewrite_rule('^admin-dashboard/?$', 'index.php?admin_dashboard=1', 'top');
}
add_action('init', 'add_admin_dashboard_rewrite_rules');

// Add query vars
function add_admin_dashboard_query_vars($vars) {
    $vars[] = 'admin_dashboard';
    return $vars;
}
add_filter('query_vars', 'add_admin_dashboard_query_vars');

// Register endpoint
function register_admin_dashboard_endpoint() {
    add_rewrite_endpoint('admin-dashboard', EP_ROOT);
}
add_action('init', 'register_admin_dashboard_endpoint');

// Template redirect
function admin_dashboard_template_redirect() {
    if (get_query_var('admin_dashboard')) {
        if (!is_user_logged_in()) {
            wp_redirect(home_url());
            exit;
        }
        include get_template_directory() . '/dashboard-templates/admin-dashboard.php';
        exit;
    }
}
add_action('template_redirect', 'admin_dashboard_template_redirect');

// Add admin menu item
function add_frontend_admin_menu_item($items, $args) {
    if (is_user_logged_in() && current_user_can('administrator')) {
        $items .= '<li><a href="' . home_url('admin-dashboard') . '">Admin Dashboard</a></li>';
    }
    return $items;
}
add_filter('wp_nav_menu_items', 'add_frontend_admin_menu_item', 10, 2);

// Hide menu items for non-logged in users
function enhanced_hide_menu_items($items, $menu, $args) {
    if (!is_user_logged_in()) {
        foreach ($items as $key => $item) {
            if ($item->title == 'Admin Dashboard' || 
                $item->title == 'My Account' || 
                $item->title == 'Dashboard') {
                unset($items[$key]);
            }
        }
    }
    return $items;
}
add_filter('wp_nav_menu_objects', 'enhanced_hide_menu_items', 10, 3);

// Flush rewrite rules
function flush_admin_dashboard_rules() {
    add_admin_dashboard_rewrite_rules();
    flush_rewrite_rules();
}
add_action('after_switch_theme', 'flush_admin_dashboard_rules');

// Hide admin bar using CSS as well
function hide_admin_bar_css() {
    if (!current_user_can('administrator')) {
        echo '<style type="text/css">
            #wpadminbar { display:none !important; }
            html { margin-top: 0 !important; }
        </style>';
    }
}
add_action('wp_head', 'hide_admin_bar_css');

// Add admin menu for email testing
function add_email_test_menu() {
    add_menu_page(
        'Test Email',
        'Test Email',
        'manage_options',
        'test-winner-email',
        'render_email_test_page',
        'dashicons-email',
        30
    );
}
add_action('admin_menu', 'add_email_test_menu');

function render_email_test_page() {
    ?>
    <div class="wrap">
        <h1>Test Winner Email</h1>
        <div class="card">
            <h2>Send Test Email</h2>
            <p>Use this form to send a test winner notification email to yourself.</p>
            
            <form id="test-email-form" style="margin-top: 20px;">
                <table class="form-table">
                    <tr>
                        <th scope="row"><label for="auction_id">Auction ID</label></th>
                        <td>
                            <input type="number" id="auction_id" name="auction_id" class="regular-text" required>
                        </td>
                    </tr>
                </table>
                
                <div id="response-message" style="margin: 20px 0;"></div>
                
                <p class="submit">
                    <button type="submit" class="button button-primary">Send Test Email</button>
                </p>
            </form>
        </div>
    </div>

    <script>
    jQuery(document).ready(function($) {
        $('#test-email-form').on('submit', function(e) {
            e.preventDefault();
            
            const auctionId = $('#auction_id').val();
            const $responseDiv = $('#response-message');
            const $submitButton = $(this).find('button[type="submit"]');
            
            $submitButton.prop('disabled', true).text('Sending...');
            $responseDiv.html('').removeClass('notice-success notice-error');
            
            $.ajax({
                url: '/wp-json/bidspace/v1/test-winner-email',
                method: 'POST',
                data: JSON.stringify({ auction_id: auctionId }),
                contentType: 'application/json',
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('X-WP-Nonce', wpApiSettings.nonce);
                },
                success: function(response) {
                    $responseDiv
                        .addClass('notice notice-success')
                        .html('<p>Test email sent successfully!</p>');
                },
                error: function(xhr) {
                    const message = xhr.responseJSON?.message || 'Failed to send test email';
                    $responseDiv
                        .addClass('notice notice-error')
                        .html('<p>Error: ' + message + '</p>');
                },
                complete: function() {
                    $submitButton.prop('disabled', false).text('Send Test Email');
                }
            });
        });
    });
    </script>
    <?php
}