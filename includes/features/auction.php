<?php
// Include email notifications
require_once(get_template_directory() . '/includes/notifications/email-notifications.php');

/**
 * Auction Functions
 */

// Create Auction User role
function create_auction_user_role() {
    add_role('auction_user', 'Auction User', array(
        'read' => true,
        'edit_auctions' => true,
        'publish_auctions' => true,
        'upload_files' => true,
        'delete_auction' => true,
        'delete_auctions' => true,
        'delete_published_auctions' => true
    ));
}
add_action('init', 'create_auction_user_role');

// Refresh auction user capabilities
function refresh_auction_user_capabilities() {
    $auction_users = get_users(array('role' => 'auction_user'));
    foreach ($auction_users as $user) {
        $user->add_cap('delete_auction');
        $user->add_cap('delete_auctions');
        $user->add_cap('delete_published_auctions');
    }
}
add_action('init', 'refresh_auction_user_capabilities');

// Handle placing bid
function handle_place_bid($request) {
    $current_user_id = get_current_user_id();
    $auction_id = $request['id'];
    
    if (!$current_user_id) {
        return new WP_Error('not_logged_in', 'გთხოვთ გაიაროთ ავტორიზაცია', array('status' => 401));
    }

    $params = $request->get_json_params();
    if (!isset($params['bid_price'])) {
        return new WP_Error('missing_params', 'bid_price პარამეტრი სავალდებულოა', array('status' => 400));
    }

    $auction = get_post($auction_id);
    if (!$auction || $auction->post_type !== 'auction') {
        return new WP_Error('invalid_auction', 'აუქციონი ვერ მოიძებნა', array('status' => 404));
    }

    $due_time = get_post_meta($auction_id, 'due_time', true);
    $now = current_time('timestamp');
    $due_timestamp = strtotime($due_time);
    
    if ($due_timestamp && $now > $due_timestamp) {
        return new WP_Error('auction_ended', 'აუქციონი დასრულებულია', array('status' => 400));
    }

    if ($auction->post_author == $current_user_id) {
        return new WP_Error('author_bid', 'თქვენ არ შეგიძლიათ საკუთარ აუქციონზე ბიდის დადება', array('status' => 403));
    }

    $current_price = floatval(get_post_meta($auction_id, 'auction_price', true));
    $new_bid_price = floatval($params['bid_price']);
    
    if ($new_bid_price <= $current_price) {
        return new WP_Error('invalid_bid', 'ბიდი უნდა იყოს მიმდინარე ფასზე მეტი', array('status' => 400));
    }

    $bids_list = get_post_meta($auction_id, 'bids_list', true) ?: array();
    
    $current_time = current_time('mysql');
    $author_name = get_the_author_meta('display_name', $current_user_id);
    
    $new_bid = array(
        'bid_price' => $new_bid_price,
        'bid_author' => $current_user_id,
        'author_name' => $author_name,
        'bid_time' => $current_time,
        'price_increase' => $new_bid_price - $current_price
    );
    
    array_unshift($bids_list, $new_bid);

    // Update auction meta
    update_post_meta($auction_id, 'auction_price', $new_bid_price);
    update_post_meta($auction_id, 'bids_list', $bids_list);
    
    // Update last bid information
    update_post_meta($auction_id, 'last_bid_price', $new_bid_price);
    update_post_meta($auction_id, 'last_bid_author', $author_name);
    update_post_meta($auction_id, 'last_bid_time', $current_time);
    update_post_meta($auction_id, 'last_bid_author_id', $current_user_id);

    $time_left = $due_timestamp - $now;
    $was_extended = false;
    
    if ($time_left <= 30) {
        $extended_time = date('Y-m-d H:i:s', $due_timestamp + 30);
        update_post_meta($auction_id, 'due_time', $extended_time);
        $was_extended = true;
        $due_time = $extended_time;
    } else if ($time_left <= 0) {
        // Check if auction has ended and notify winner
        check_auction_end_and_notify($auction_id);
    }

    return new WP_REST_Response(array(
        'success' => true,
        'current_price' => $new_bid_price,
        'bids_list' => $bids_list,
        'due_time' => $due_time ?? $due_time,
        'was_extended' => $was_extended,
        'message' => $was_extended ? 
            'ბიდი წარმატებით განთავსდა და აუქციონის დრო გაგრძელდა 30 წამით' : 
            'ბიდი წარმატებით განთავსდა'
    ), 200);
}

// Get auction with author
function get_auction_with_author($request) {
    $auction_id = $request['id'];
    
    $auction = get_post($auction_id);
    
    if (!$auction || $auction->post_type !== 'auction') {
        return new WP_Error(
            'no_auction_found',
            'No auction found with this ID',
            array('status' => 404)
        );
    }

    $author = get_user_by('id', $auction->post_author);
    $meta = get_post_meta($auction_id);
    
    $formatted_meta = array();
    foreach ($meta as $key => $value) {
        $formatted_meta[$key] = maybe_unserialize($value[0]);
    }

    $response = array(
        'id' => $auction->ID,
        'title' => array(
            'rendered' => get_the_title($auction)
        ),
        'content' => array(
            'rendered' => apply_filters('the_content', $auction->post_content)
        ),
        'date' => $auction->post_date,
        'modified' => $auction->post_modified,
        'status' => $auction->post_status,
        'featured_media' => get_post_thumbnail_id($auction),
        'meta' => $formatted_meta,
        'author_data' => $author ? array(
            'id' => $author->ID,
            'display_name' => $author->display_name,
            'user_nicename' => $author->user_nicename,
            'user_email' => $author->user_email,
            'user_registered' => $author->user_registered
        ) : null
    );

    return rest_ensure_response($response);
}

// Check auction author
function check_auction_author($auction_id, $user_id) {
    $post = get_post($auction_id);
    if (!$post) {
        return false;
    }
    
    return (int)$post->post_author === (int)$user_id;
}

// Extend auction time
function extend_auction_time($auction_id) {
    $current_due_time = get_post_meta($auction_id, 'due_time', true);
    
    if (!$current_due_time) {
        error_log('Failed to extend auction time - No due time found for auction: ' . $auction_id);
        return false;
    }
    
    $now = current_time('timestamp');
    $due_timestamp = strtotime($current_due_time);
    
    if ($due_timestamp < $now) {
        error_log('Failed to extend auction time - Auction already ended: ' . $auction_id);
        return false;
    }
    
    $new_due_time = date('Y-m-d H:i:s', $due_timestamp + 30);
    update_post_meta($auction_id, 'due_time', $new_due_time);
    
    return $new_due_time;
}

// Filter auctions by meta
function filter_auctions_by_meta($args, $request) {
    // City filter
    $city = $request->get_param('city');
    if (!empty($city)) {
        $args['meta_query'][] = array(
            'key' => 'city',
            'value' => $city,
            'compare' => '='
        );
    }

    // Price range filter
    $min_price = $request->get_param('min_price');
    $max_price = $request->get_param('max_price');
    if (!empty($min_price) || !empty($max_price)) {
        $price_query = array('key' => 'auction_price');
        if (!empty($min_price)) {
            $price_query['value'] = $min_price;
            $price_query['compare'] = '>=';
            $price_query['type'] = 'NUMERIC';
        }
        if (!empty($max_price)) {
            $price_query['value'] = $max_price;
            $price_query['compare'] = '<=';
            $price_query['type'] = 'NUMERIC';
        }
        $args['meta_query'][] = $price_query;
    }

    // Buy now filter
    $min_buy_now = $request->get_param('min_buy_now');
    $max_buy_now = $request->get_param('max_buy_now');
    if (!empty($min_buy_now) || !empty($max_buy_now)) {
        $buy_now_query = array('key' => 'buy_now');
        if (!empty($min_buy_now)) {
            $buy_now_query['value'] = $min_buy_now;
            $buy_now_query['compare'] = '>=';
            $buy_now_query['type'] = 'NUMERIC';
        }
        if (!empty($max_buy_now)) {
            $buy_now_query['value'] = $max_buy_now;
            $buy_now_query['compare'] = '<=';
            $buy_now_query['type'] = 'NUMERIC';
        }
        $args['meta_query'][] = $buy_now_query;
    }

    if (!empty($args['meta_query'])) {
        $args['meta_query']['relation'] = 'AND';
    }

    return $args;
}
add_filter('rest_auction_query', 'filter_auctions_by_meta', 10, 2);

// Handle auction creation
function handle_create_auction($request) {
    $params = $request->get_params();
    
    // Common required fields for all categories
    $common_required_fields = array(
        'title', 'category', 'ticket_category', 'start_date', 'city',
        'ticket_price', 'ticket_quantity'
    );

    // Additional required fields based on ticket category
    $category_required_fields = array(
        'თეატრი-კინო' => array('hall', 'row', 'place'),
        'სპორტი' => array('sector', 'row', 'place'),
    );

    // Check common required fields
    foreach ($common_required_fields as $field) {
        if (empty($params[$field])) {
            return new WP_Error(
                'missing_field',
                sprintf('%s არის სავალდებულო ველი', $field),
                array('status' => 400)
            );
        }
    }

    // Check category-specific required fields
    if (isset($params['ticket_category']) && 
        isset($category_required_fields[$params['ticket_category']])) {
        foreach ($category_required_fields[$params['ticket_category']] as $field) {
            if (empty($params[$field])) {
                return new WP_Error(
                    'missing_field',
                    sprintf('%s არის სავალდებულო ველი %s კატეგორიისთვის', 
                        $field, $params['ticket_category']),
                    array('status' => 400)
                );
            }
        }
    }

    // Create auction post
    $post_data = array(
        'post_title'   => sanitize_text_field($params['title']),
        'post_status'  => 'publish',
        'post_type'    => 'auction',
        'post_author'  => get_current_user_id()
    );

    $post_id = wp_insert_post($post_data);

    if (is_wp_error($post_id)) {
        return new WP_Error(
            'failed_to_create',
            'აუქციონის შექმნა ვერ მოხერხდა',
            array('status' => 500)
        );
    }

    // Save all the meta fields
    $meta_fields = array(
        'category', 'ticket_category', 'start_date', 'city',
        'ticket_price', 'ticket_quantity', 'hall', 'row', 'place',
        'sector', 'start_time', 'due_time', 'auction_price',
        'buy_now', 'min_bid_price', 'ticket_information'
    );

    foreach ($meta_fields as $field) {
        if (isset($params[$field])) {
            update_post_meta($post_id, $field, sanitize_text_field($params[$field]));
        }
    }

    // Handle featured image upload
    if (!empty($_FILES['featured_image'])) {
        require_once(ABSPATH . 'wp-admin/includes/image.php');
        require_once(ABSPATH . 'wp-admin/includes/file.php');
        require_once(ABSPATH . 'wp-admin/includes/media.php');

        $attachment_id = media_handle_upload('featured_image', $post_id);
        
        if (!is_wp_error($attachment_id)) {
            set_post_thumbnail($post_id, $attachment_id);
        }
    }

    return array(
        'success' => true,
        'auction_id' => $post_id,
        'message' => 'აუქციონი წარმატებით შეიქმნა'
    );
}

// Register REST routes
add_action('rest_api_init', function () {
    register_rest_route('bidspace/v1', '/auction/create', array(
        'methods' => 'POST',
        'callback' => 'handle_create_auction',
        'permission_callback' => 'is_user_logged_in'
    ));

    register_rest_route('bidspace/v1', '/auction/(?P<id>\d+)', array(
        'methods' => 'GET',
        'callback' => 'get_auction_with_author',
        'permission_callback' => '__return_true'
    ));

    register_rest_route('bidspace/v1', '/auction/(?P<id>\d+)/bid', array(
        'methods' => 'POST',
        'callback' => 'handle_place_bid',
        'permission_callback' => 'is_user_logged_in'
    ));

    register_rest_route('bidspace/v1', '/auction/(?P<id>\d+)/current-price', array(
        'methods' => 'GET',
        'callback' => function ($request) {
            $auction_id = $request['id'];
            $current_price = get_post_meta($auction_id, 'auction_price', true);
            return new WP_REST_Response(array('price' => $current_price), 200);
        },
        'permission_callback' => '__return_true'
    ));

    // Add new endpoint for getting user display name
    register_rest_route('bidspace/v1', '/auction/user/(?P<id>\d+)', array(
        'methods' => 'GET',
        'callback' => function($request) {
            $user_id = $request['id'];
            $user = get_user_by('id', $user_id);
            
            if (!$user) {
                return new WP_Error(
                    'user_not_found',
                    'User not found',
                    array('status' => 404)
                );
            }
            
            return new WP_REST_Response(array(
                'id' => $user->ID,
                'display_name' => $user->display_name
            ), 200);
        },
        'permission_callback' => '__return_true'
    ));

    register_rest_route('bidspace/v1', '/auction/(?P<id>\d+)/end', array(
        'methods' => 'POST',
        'callback' => function ($request) {
            $auction_id = $request['id'];
            $params = $request->get_json_params();
            
            update_post_meta($auction_id, 'last_bid_price', $params['last_bid_price']);
            update_post_meta($auction_id, 'last_bid_author', $params['last_bid_author']);
            update_post_meta($auction_id, 'last_bid_time', $params['last_bid_time']);
            update_post_meta($auction_id, 'last_bid_author_id', $params['last_bid_author_id']);
            
            wp_update_post(array(
                'ID' => $auction_id,
                'post_status' => 'completed'
            ));
            
            return new WP_REST_Response(array(
                'success' => true,
                'message' => 'Final bid data saved successfully'
            ), 200);
        },
        'permission_callback' => '__return_true'
    ));
});

// Register winner notification endpoint
function register_winner_notification_endpoint() {
    register_rest_route('wp/v2', '/auction/(?P<id>\d+)/notify-winner', array(
        'methods' => 'POST',
        'callback' => 'handle_winner_notification',
        'permission_callback' => function() {
            return is_user_logged_in();
        },
        'args' => array(
            'id' => array(
                'validate_callback' => function($param) {
                    return is_numeric($param);
                }
            )
        )
    ));
}
add_action('rest_api_init', 'register_winner_notification_endpoint');

function handle_winner_notification($request) {
    $auction_id = $request['id'];
    $auction = get_post($auction_id);

    if (!$auction || $auction->post_type !== 'auction') {
        return new WP_Error('invalid_auction', 'არასწორი აუქციონი', array('status' => 404));
    }

    // Check if notification was already sent
    $notification_sent = get_post_meta($auction_id, 'winner_notified', true);
    if ($notification_sent) {
        return new WP_REST_Response(array('message' => 'შეტყობინება უკვე გაგზავნილია'), 200);
    }

    // Check if auction has ended
    $due_time = get_post_meta($auction_id, 'due_time', true);
    if (!$due_time || strtotime($due_time) > current_time('timestamp')) {
        return new WP_Error('auction_not_ended', 'აუქციონი ჯერ არ დასრულებულა', array('status' => 400));
    }

    // Send notification
    $result = check_auction_end_and_notify($auction_id);

    if ($result) {
        return new WP_REST_Response(array('message' => 'შეტყობინება წარმატებით გაიგზავნა'), 200);
    }

    return new WP_Error('notification_failed', 'შეტყობინების გაგზავნა ვერ მოხერხდა', array('status' => 500));
}

// Register auction meta
register_rest_field('auction', 'auction_meta', array(
    'get_callback' => function($post) {
        return get_post_meta($post['id']);
    },
    'update_callback' => null,
    'schema' => null,
));

function register_auction_post_type() {
    $args = array(
        'public' => true,
        'label'  => 'Auctions',
        'show_in_rest' => true,
        'supports' => array('title', 'editor', 'thumbnail', 'custom-fields'),
        'rest_base' => 'auction'
    );
    register_post_type('auction', $args);
}
add_action('init', 'register_auction_post_type');