<?php
/**
 * Comments Functions
 */

// Add comment capabilities
function add_auction_comment_capabilities() {
    $roles = array('administrator', 'editor', 'author', 'contributor', 'subscriber');
    
    foreach($roles as $role_name) {
        $role = get_role($role_name);
        if ($role) {
            $role->add_cap('read_auction');
            $role->add_cap('comment_on_auction');
        }
    }
}
add_action('init', 'add_auction_comment_capabilities');

// Register meta fields
function register_auction_meta_fields() {
    register_post_meta('auction', 'comments', array(
        'type' => 'object',
        'single' => true,
        'show_in_rest' => true,
        'auth_callback' => function() {
            return is_user_logged_in();
        }
    ));
}
add_action('init', 'register_auction_meta_fields');

// Comment permissions
function auction_rest_permission_callback($request) {
    if (is_user_logged_in()) {
        return true;
    }
    return new WP_Error(
        'rest_forbidden',
        'გთხოვთ გაიაროთ ავტორიზაცია კომენტარის დასამატებლად.',
        array('status' => 401)
    );
}

// Handle comment submission
function handle_auction_comment($request) {
    $auction_id = $request->get_param('id');
    $user_id = get_current_user_id();
    
    if (!$user_id) {
        return new WP_Error(
            'rest_forbidden',
            'გთხოვთ გაიაროთ ავტორიზაცია კომენტარის დასამატებლად.',
            array('status' => 401)
        );
    }
    
    $auction = get_post($auction_id);
    if (!$auction || $auction->post_type !== 'auction') {
        return new WP_Error(
            'rest_not_found',
            'აუქციონი ვერ მოიძებნა.',
            array('status' => 404)
        );
    }

    $existing_comments = get_post_meta($auction_id, 'comments', true);
    if (!is_array($existing_comments)) {
        $existing_comments = array();
    }

    $comment_text = sanitize_textarea_field($request->get_param('comment_area'));
    
    $new_comment = array(
        'comment_author' => $user_id,
        'comment_author_name' => get_the_author_meta('display_name', $user_id),
        'comment_date' => current_time('mysql'),
        'comment_area' => $comment_text
    );
    
    $existing_comments[] = $new_comment;
    
    $updated = update_post_meta($auction_id, 'comments', $existing_comments);
    
    if ($updated) {
        return rest_ensure_response(array(
            'success' => true,
            'message' => 'კომენტარი წარმატებით დაემატა',
            'comment' => $new_comment
        ));
    }
    
    return new WP_Error(
        'comment_not_added',
        'კომენტარის დამატება ვერ მოხერხდა, გთხოვთ სცადოთ თავიდან.',
        array('status' => 500)
    );
}

// Register comment REST route
add_action('rest_api_init', function() {
    register_rest_route('wp/v2', '/auction/(?P<id>\d+)/comment', array(
        'methods' => 'POST',
        'callback' => 'handle_auction_comment',
        'permission_callback' => 'auction_rest_permission_callback',
        'args' => array(
            'id' => array(
                'validate_callback' => function($param) {
                    return is_numeric($param);
                }
            )
        )
    ));
});

// Allow anonymous comments
add_filter('rest_allow_anonymous_comments', '__return_true');

// Allow comment meta for all users
add_filter('rest_auction_meta_check_permissions', 'custom_auction_rest_permission', 10, 4);
function custom_auction_rest_permission($permission, $context, $object_id, $post_type) {
    if ($post_type === 'auction' && is_user_logged_in()) {
        return true;
    }
    return $permission;
}