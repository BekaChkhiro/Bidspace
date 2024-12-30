<?php
/**
 * User Management Functions
 */

// Modify REST API response for users
function modify_user_rest_response($response, $user, $request) {
    $data = $response->get_data();
    
    // Add registration date
    $data['registered_date'] = get_user_registered_date($user->ID);
    
    // Add roles
    $user_meta = get_userdata($user->ID);
    $data['roles'] = $user_meta->roles;

    $response->set_data($data);
    return $response;
}
add_filter('rest_prepare_user', 'modify_user_rest_response', 10, 3);

// Helper function to get user registration date
function get_user_registered_date($user_id) {
    $user = get_userdata($user_id);
    return $user ? $user->user_registered : '';
}

// Allow access to users endpoint
function allow_users_endpoint_access() {
    remove_filter('rest_user_query', 'custom_users_permissions_check');
}
add_action('init', 'allow_users_endpoint_access');
