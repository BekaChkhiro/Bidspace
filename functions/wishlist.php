<?php

// Register wishlist user meta
function register_wishlist_meta() {
    register_meta('user', 'wishlist', array(
        'type' => 'array',
        'description' => 'User wishlist auction IDs',
        'single' => true,
        'show_in_rest' => true,
        'default' => array(),
        'auth_callback' => function($allowed, $meta_key, $object_id, $user_id) {
            // Only allow users to modify their own wishlist
            return $object_id === $user_id;
        }
    ));
}
add_action('init', 'register_wishlist_meta');

// Add REST API endpoint for toggling wishlist items
function register_wishlist_routes() {
    register_rest_route('custom/v1', '/wishlist/toggle/(?P<auction_id>\d+)', array(
        'methods' => 'POST',
        'callback' => 'toggle_wishlist_item',
        'permission_callback' => function() {
            return is_user_logged_in();
        },
        'args' => array(
            'auction_id' => array(
                'validate_callback' => function($param) {
                    return is_numeric($param);
                }
            )
        )
    ));
}
add_action('rest_api_init', 'register_wishlist_routes');

function toggle_wishlist_item($request) {
    $user_id = get_current_user_id();
    $auction_id = intval($request['auction_id']); // Convert to integer
    
    // Get current wishlist
    $wishlist = get_user_meta($user_id, 'wishlist', true);
    if (!is_array($wishlist)) {
        $wishlist = array();
    }
    
    // Convert all wishlist IDs to integers
    $wishlist = array_map('intval', $wishlist);
    
    // Toggle auction in wishlist
    $index = array_search($auction_id, $wishlist, true); // Strict comparison
    if ($index !== false) {
        unset($wishlist[$index]);
        $wishlist = array_values($wishlist); // Reindex array
        $action = 'removed';
    } else {
        $wishlist[] = $auction_id;
        $action = 'added';
    }
    
    // Update wishlist
    update_user_meta($user_id, 'wishlist', $wishlist);
    
    return array(
        'success' => true,
        'action' => $action,
        'wishlist' => array_map('intval', $wishlist) // Ensure integers in response
    );
}

// Add wishlist data to user endpoint
function add_wishlist_to_user_response($response) {
    $user_id = get_current_user_id();
    if ($user_id) {
        $wishlist = get_user_meta($user_id, 'wishlist', true);
        if (!is_array($wishlist)) {
            $wishlist = array();
        }
        // Convert all wishlist IDs to integers
        $wishlist = array_map('intval', $wishlist);
        $response->data['wishlist'] = $wishlist;
    }
    return $response;
}

add_filter('rest_prepare_user', 'add_wishlist_to_user_response', 10, 3);
