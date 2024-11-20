<?php
// File: dashboard-templates/dashboard-functions.php

// Add rewrite rules for dashboard pages
function add_dashboard_rewrite_rules() {
    add_rewrite_rule(
        '^dashboard/([^/]+)/?$',
        'index.php?pagename=dashboard&dashboard_page=$matches[1]',
        'top'
    );
}
add_action('init', 'add_dashboard_rewrite_rules', 10, 0);

// დაშბორდის სტილების ჩატვირთვა
function enqueue_dashboard_styles() {
    // შეამოწმეთ, არის თუ არა მიმდინარე გვერდი დაშბორდის ნაწილი
    if (is_page('dashboard') || 
        (isset($_GET['page']) && strpos($_GET['page'], 'dashboard') !== false) ||
        is_page_template(array('dashboard-page.php', 'dashboard-template.php')) ||
        (function_exists('is_dashboard') && is_dashboard())) {
        
        wp_enqueue_style('dashboard-styles', get_template_directory_uri() . '/dashboard-templates/dashboard-style.css', array(), time());
    }
}
add_action('wp_enqueue_scripts', 'enqueue_dashboard_styles');

// Add query vars
function add_dashboard_query_vars($vars) {
    $vars[] = 'dashboard_page';
    return $vars;
}
add_filter('query_vars', 'add_dashboard_query_vars');

// Parse request
function dashboard_parse_request($wp) {
    if (strpos($wp->request, 'dashboard/') === 0) {
        $parts = explode('/', trim($wp->request, '/'));
        if (count($parts) > 1) {
            $wp->query_vars['pagename'] = 'dashboard';
            $wp->query_vars['dashboard_page'] = $parts[1];
        }
    }
}
add_action('parse_request', 'dashboard_parse_request');

// Custom template loading
function load_dashboard_template($template) {
    if (get_query_var('pagename') === 'dashboard') {
        $dashboard_page = get_query_var('dashboard_page');
        if ($dashboard_page) {
            $new_template = locate_template("dashboard-templates/dashboard-pages/dashboard-{$dashboard_page}.php");
            if (!empty($new_template)) {
                return $new_template;
            }
        } else {
            $new_template = locate_template('dashboard-templates/page-dashboard.php');
            if (!empty($new_template)) {
                return $new_template;
            }
        }
    }
    return $template;
}
add_filter('template_include', 'load_dashboard_template', 99);

// Flush rewrite rules on theme activation
function flush_dashboard_rewrite_rules() {
    add_dashboard_rewrite_rules();
    flush_rewrite_rules();
}
add_action('after_switch_theme', 'flush_dashboard_rewrite_rules');

// Check user access for dashboard
function check_dashboard_access() {
    if (is_page('dashboard') || get_query_var('dashboard_page')) {
        if (!is_user_logged_in()) {
            wp_redirect(wp_login_url(get_permalink()));
            exit;
        }
        
        // Optional: Check for specific user role
        // $user = wp_get_current_user();
        // $allowed_roles = array('administrator', 'editor', 'author', 'auction_user');
        // if (!array_intersect($allowed_roles, $user->roles)) {
        //     wp_redirect(home_url());
        //     exit;
        // }
    }
}
add_action('template_redirect', 'check_dashboard_access', 1);

// Remove admin bar for auction users
function remove_admin_bar_for_auction_users() {
    if (current_user_can('auction_user')) {
        show_admin_bar(false);
    }
}
add_action('after_setup_theme', 'remove_admin_bar_for_auction_users');

// აუქციონების ძებნის ფუნქცია
function search_auctions() {
    $query = sanitize_text_field($_POST['query']);
    $args = array(
        'post_type' => 'auction',
        'post_status' => 'publish',
        's' => $query,
        'posts_per_page' => -1 // ყველა შედეგის გამოტანა
    );
    $search_query = new WP_Query($args);

    ob_start();

    if ($search_query->have_posts()) {
        echo '<div class="search-results-container" style="max-height: 400px; overflow-y: auto;">'; // სქროლის კონტეინერი
        while ($search_query->have_posts()) {
            $search_query->the_post();
            $start_time = get_post_meta(get_the_ID(), 'start_time', true);
            $formatted_date = date('Y m d', strtotime($start_time)); // წელი, თვე, დღე
            $city = get_post_meta(get_the_ID(), 'city', true);
            $auction_price = get_post_meta(get_the_ID(), 'auction_price', true);
            $featured_image = get_the_post_thumbnail_url(get_the_ID(), 'thumbnail');
            if (!$featured_image) {
                $featured_image = get_stylesheet_directory_uri() . '/path/to/default-image.jpg';
            }
            ?>
            <a href="<?php echo home_url('/auction/' . get_the_ID()); ?>" class="block p-3 border-b hover:bg-gray-100">
                <div class="flex items-center">
                    <img src="<?php echo esc_url($featured_image); ?>" alt="<?php the_title(); ?>" class="w-3/12 h-16 object-cover rounded mr-4">
                    <div class="flex flex-col gap-1">
                        <h3 class="font-bold"><?php the_title(); ?></h3>
                        <div class="text-sm text-gray-600 flex gap-2">
                            <div class="flex gap-1">
                                <img src="<?php echo get_stylesheet_directory_uri() ?>/icons/dashboard/date_icon.svg" alt="date icon" width="18px">
                                <span><?php echo esc_html($formatted_date); ?></span>
                            </div>
                            <div class="flex gap-1">
                                <img src="<?php echo get_stylesheet_directory_uri() ?>/icons/dashboard/map_icon.svg" alt="map icon" width="18px">
                                <span><?php echo esc_html($city); ?></span>
                            </div> 
                        </div>
                        <div class="text-sm font-semibold">მიმდინარე ფასი: <?php echo esc_html($auction_price); ?>₾</div>
                    </div>
                </div>
            </a>
            <?php
        }
        echo '</div>'; // სქროლის კონტეინერის დახურვა
    } else {
        echo '<div class="p-4">აუქციონები ვერ მოიძებნა.</div>';
    }

    $output = ob_get_clean();
    wp_reset_postdata();

    echo $output;
    wp_die();
}
add_action('wp_ajax_search_auctions', 'search_auctions');
add_action('wp_ajax_nopriv_search_auctions', 'search_auctions');


function enqueue_ajax_url() {
    wp_localize_script('jquery', 'ajax_object', array('ajax_url' => admin_url('admin-ajax.php')));
}
add_action('wp_enqueue_scripts', 'enqueue_ajax_url');

?>