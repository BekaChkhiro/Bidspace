<?php
/**
 * Admin Dashboard Functions
 */

// Add rewrite rules
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
add_action('init', 'add_admin_dashboard_rewrite_rules');

// Add query vars
function add_admin_dashboard_query_vars($vars) {
    $vars[] = 'admin_dashboard';
    $vars[] = 'admin_page';
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
        if (!is_user_logged_in() || !current_user_can('manage_options')) {
            wp_redirect(home_url());
            exit;
        }
        
        include get_template_directory() . '/admin-dashboard/admin-dashboard-layout.php';
        exit;
    }
}
add_action('template_redirect', 'admin_dashboard_template_redirect');

// Add admin menu item
function add_frontend_admin_menu_item($items, $args) {
    if (is_user_logged_in() && current_user_can('manage_options')) {
        $items .= '<li><a href="' . home_url('admin/dashboard') . '">ადმინ პანელი</a></li>';
    }
    return $items;
}
add_filter('wp_nav_menu_items', 'add_frontend_admin_menu_item', 10, 2);

// Hide menu items for non-logged in users
function enhanced_hide_menu_items($items, $menu, $args) {
    error_log('enhanced_hide_menu_items function called');
    
    if (!is_user_logged_in()) {
        $restricted_pages = array('dashboard', 'profile', 'my-pages');
        foreach ($items as $key => $item) {
            error_log('Checking menu item: ' . $item->title . ', Object: ' . $item->object . ', Type: ' . $item->type);
            
            if ($item->type == 'post_type' && $item->object == 'page') {
                $page = get_post($item->object_id);
                if ($page) {
                    error_log('Page slug: ' . $page->post_name);
                    if (in_array($page->post_name, $restricted_pages)) {
                        error_log('Removing menu item: ' . $item->title);
                        unset($items[$key]);
                    }
                }
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

// Search auctions handler
function search_auctions_callback() {
    $query = sanitize_text_field($_POST['query']);
    
    $args = array(
        'post_type' => 'auction',
        's' => $query,
        'posts_per_page' => 5
    );
    
    $search_query = new WP_Query($args);
    
    if ($search_query->have_posts()) {
        while ($search_query->have_posts()) {
            $search_query->the_post();
            ?>
            <a href="<?php echo esc_url(home_url('/auction/' . get_the_ID())); ?>" class="block p-3 hover:bg-gray-100">
                <?php the_title(); ?>
            </a>
            <?php
        }
    } else {
        echo '<div class="p-3">შედეგები ვერ მოიძებნა</div>';
    }
    
    wp_reset_postdata();
    die();
}
add_action('wp_ajax_search_auctions', 'search_auctions_callback');
add_action('wp_ajax_nopriv_search_auctions', 'search_auctions_callback');

// Admin post type support
function add_admin_auction_support() {
    register_post_type('auction', array(
        'public' => true,
        'has_archive' => true,
        'show_in_rest' => true,
        'labels' => array(
            'name' => 'Auctions',
            'singular_name' => 'Auction'
        ),
        'supports' => array('title', 'editor', 'thumbnail', 'author'),
        'menu_icon' => 'dashicons-hammer',
        'capability_type' => 'auction',
        'map_meta_cap' => true,
        'rewrite' => array('slug' => 'auctions')
    ));

    // Register auction statuses
    register_post_status('completed', array(
        'label' => 'Completed',
        'public' => true,
        'show_in_admin_all_list' => true,
        'show_in_admin_status_list' => true,
        'label_count' => _n_noop('Completed <span class="count">(%s)</span>',
            'Completed <span class="count">(%s)</span>')
    ));
}
add_action('init', 'add_admin_auction_support');

// Add admin meta boxes
function add_auction_meta_boxes() {
    add_meta_box(
        'auction_details',
        'Auction Details',
        'render_auction_details_meta_box',
        'auction',
        'normal',
        'high'
    );
}
add_action('add_meta_boxes', 'add_auction_meta_boxes');

// Render auction meta box
function render_auction_details_meta_box($post) {
    $auction_price = get_post_meta($post->ID, 'auction_price', true);
    $buy_now_price = get_post_meta($post->ID, 'buy_now', true);
    $due_time = get_post_meta($post->ID, 'due_time', true);
    $city = get_post_meta($post->ID, 'city', true);
    
    wp_nonce_field('save_auction_details', 'auction_details_nonce');
    ?>
    <div class="auction-meta-box">
        <p>
            <label for="auction_price">საწყისი ფასი:</label>
            <input type="number" id="auction_price" name="auction_price" 
                   value="<?php echo esc_attr($auction_price); ?>">
        </p>
        <p>
            <label for="buy_now">მყიდველი ფასი:</label>
            <input type="number" id="buy_now" name="buy_now" 
                   value="<?php echo esc_attr($buy_now_price); ?>">
        </p>
        <p>
            <label for="due_time">დასრულების დრო:</label>
            <input type="datetime-local" id="due_time" name="due_time" 
                   value="<?php echo esc_attr($due_time); ?>">
        </p>
        <p>
            <label for="city">ქალაქი:</label>
            <input type="text" id="city" name="city" 
                   value="<?php echo esc_attr($city); ?>">
        </p>
    </div>
    <?php
}

// Save auction meta
function save_auction_meta($post_id) {
    if (!isset($_POST['auction_details_nonce']) || 
        !wp_verify_nonce($_POST['auction_details_nonce'], 'save_auction_details')) {
        return;
    }

    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }

    if (!current_user_can('edit_post', $post_id)) {
        return;
    }

    $fields = array(
        'auction_price',
        'buy_now',
        'due_time',
        'city'
    );

    foreach ($fields as $field) {
        if (isset($_POST[$field])) {
            update_post_meta($post_id, $field, sanitize_text_field($_POST[$field]));
        }
    }
}
add_action('save_post_auction', 'save_auction_meta');

// Add auction columns
function add_auction_columns($columns) {
    $new_columns = array();
    foreach ($columns as $key => $value) {
        if ($key == 'date') {
            $new_columns['current_price'] = 'მიმდინარე ფასი';
            $new_columns['buy_now'] = 'მყიდველი ფასი';
            $new_columns['due_time'] = 'დასრულების დრო';
        }
        $new_columns[$key] = $value;
    }
    return $new_columns;
}
add_filter('manage_auction_posts_columns', 'add_auction_columns');

// Populate auction columns
function populate_auction_columns($column, $post_id) {
    switch ($column) {
        case 'current_price':
            echo get_post_meta($post_id, 'auction_price', true);
            break;
        case 'buy_now':
            echo get_post_meta($post_id, 'buy_now', true);
            break;
        case 'due_time':
            echo get_post_meta($post_id, 'due_time', true);
            break;
    }
}
add_action('manage_auction_posts_custom_column', 'populate_auction_columns', 10, 2);