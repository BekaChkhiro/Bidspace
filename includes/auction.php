<?php
/**
 * Auction related functionality
 */

function create_auction_user_role() {
    add_role('auction_user', 'Auction User', array(
        'read' => true,
        'edit_auctions' => true,
        'publish_auctions' => true,
        'upload_files' => true
    ));
}

function handle_place_bid($request) {
    $current_user_id = get_current_user_id();
    $auction_id = $request['id'];
    
    if (!$current_user_id) {
        return new WP_Error('not_logged_in', 'გთხოვთ გაიაროთ ავტორიზაცია', ['status' => 401]);
    }

    $params = $request->get_json_params();
    if (!isset($params['bid_price'])) {
        return new WP_Error('missing_params', 'bid_price პარამეტრი სავალდებულოა', ['status' => 400]);
    }

    $auction = get_post($auction_id);
    if (!$auction || $auction->post_type !== 'auction') {
        return new WP_Error('invalid_auction', 'აუქციონი ვერ მოიძებნა', ['status' => 404]);
    }

    $due_time = get_post_meta($auction_id, 'due_time', true);
    $now = current_time('timestamp');
    $due_timestamp = strtotime($due_time);
    
    if ($due_timestamp && $now > $due_timestamp) {
        return new WP_Error('auction_ended', 'აუქციონი დასრულებულია', ['status' => 400]);
    }

    if ($auction->post_author == $current_user_id) {
        return new WP_Error('author_bid', 'თქვენ არ შეგიძლიათ საკუთარ აუქციონზე ბიდის დადება', ['status' => 403]);
    }

    $current_price = floatval(get_post_meta($auction_id, 'auction_price', true));
    $new_bid_price = floatval($params['bid_price']);
    
    if ($new_bid_price <= $current_price) {
        return new WP_Error('invalid_bid', 'ბიდი უნდა იყოს მიმდინარე ფასზე მეტი', ['status' => 400]);
    }

    update_post_meta($auction_id, 'auction_price', $new_bid_price);
    update_post_meta($auction_id, 'last_bidder', $current_user_id);
    update_post_meta($auction_id, 'last_bid_time', current_time('mysql'));

    return new WP_REST_Response([
        'success' => true,
        'message' => 'ბიდი წარმატებით დაემატა',
        'new_price' => $new_bid_price
    ], 200);
}

function add_bid_settings() {
    if (is_user_logged_in()) {
        $user_id = get_current_user_id();
        ?>
        <script type="text/javascript">
            window.bidspaceSettings = {
                restNonce: '<?php echo wp_create_nonce("wp_rest"); ?>',
                userId: <?php echo $user_id; ?>,
                ajaxUrl: '<?php echo admin_url('admin-ajax.php'); ?>',
                ajaxNonce: '<?php echo wp_create_nonce('bidspace_ajax'); ?>'
            };
        </script>
        <?php
    }
}

function register_auction_meta() {
    register_rest_field('auction', 'auction_meta', array(
        'get_callback' => function($post) {
            return get_post_meta($post['id']);
        },
        'update_callback' => null,
        'schema' => null,
    ));
}

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

    if (!empty($args['meta_query'])) {
        $args['meta_query']['relation'] = 'AND';
    }

    return $args;
}

// Add actions and REST routes
add_action('init', 'create_auction_user_role');
add_action('wp_footer', 'add_bid_settings', 100);
add_action('rest_api_init', 'register_auction_meta');
add_filter('rest_auction_query', 'filter_auctions_by_meta', 10, 2);

add_action('rest_api_init', function () {
    register_rest_route('bidspace/v1', '/auction/(?P<id>\d+)/bid', array(
        'methods' => 'POST',
        'callback' => 'handle_place_bid',
        'permission_callback' => function() {
            return is_user_logged_in();
        }
    ));
    
    register_rest_route('bidspace/v1', '/auction/(?P<id>\d+)/current-price', array(
        'methods' => 'GET',
        'callback' => function ($request) {
            $auction_id = $request['id'];
            $current_price = get_post_meta($auction_id, 'auction_price', true);
            return new WP_REST_Response(['price' => $current_price], 200);
        },
        'permission_callback' => '__return_true'
    ));
});