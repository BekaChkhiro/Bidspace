<?php

function bidspace_register_rest_routes() {
    register_rest_route('bidspace/v1', '/auction/create', array(
        'methods' => 'POST',
        'callback' => 'bidspace_create_auction',
        'permission_callback' => function() {
            return is_user_logged_in();
        }
    ));
}
add_action('rest_api_init', 'bidspace_register_rest_routes');

function bidspace_create_auction($request) {
    $params = $request->get_params();
    
    // Validate required fields
    $required_fields = array(
        'title', 'category', 'ticket_category', 'start_date', 'city',
        'ticket_price', 'ticket_quantity', 'start_time', 'due_time',
        'auction_price', 'min_bid_price'
    );

    foreach ($required_fields as $field) {
        if (empty($params[$field])) {
            return new WP_Error(
                'missing_field',
                sprintf('Field %s is required', $field),
                array('status' => 400)
            );
        }
    }

    // Create auction post
    $post_data = array(
        'post_title'   => sanitize_text_field($params['title']),
        'post_status'  => 'publish',
        'post_type'    => 'auction', // Make sure this post type exists
        'post_author'  => get_current_user_id()
    );

    $post_id = wp_insert_post($post_data);

    if (is_wp_error($post_id)) {
        return new WP_Error(
            'failed_to_create',
            'Failed to create auction',
            array('status' => 500)
        );
    }

    // Save all the meta fields
    $meta_fields = array(
        'category', 'ticket_category', 'start_date', 'city',
        'ticket_price', 'ticket_quantity', 'hall', 'row', 'place',
        'sector', 'start_time', 'due_time', 'auction_price',
        'buy_now', 'min_bid_price', 'ticket_information',
        'skhva_qalaqebi', 'sazgvargaret'
    );

    foreach ($meta_fields as $field) {
        if (isset($params[$field])) {
            update_post_meta($post_id, '_' . $field, sanitize_text_field($params[$field]));
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
        'message' => 'Auction created successfully'
    );
}
