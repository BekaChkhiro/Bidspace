<?php
/**
 * Register Custom Post Types
 */

if (!function_exists('bidspace_register_auction_post_type')) {
    function bidspace_register_auction_post_type() {
        $labels = array(
            'name'                  => _x('Auctions', 'Post type general name', 'bidspace'),
            'singular_name'         => _x('Auction', 'Post type singular name', 'bidspace'),
            'menu_name'            => _x('Auctions', 'Admin Menu text', 'bidspace'),
            'add_new'              => __('Add New', 'bidspace'),
            'add_new_item'         => __('Add New Auction', 'bidspace'),
            'edit_item'            => __('Edit Auction', 'bidspace'),
            'new_item'             => __('New Auction', 'bidspace'),
            'view_item'            => __('View Auction', 'bidspace'),
            'search_items'         => __('Search Auctions', 'bidspace'),
            'not_found'            => __('No auctions found', 'bidspace'),
            'not_found_in_trash'   => __('No auctions found in Trash', 'bidspace'),
        );

        $capabilities = array(
            'edit_post'          => 'edit_auction',
            'read_post'          => 'read_auction',
            'delete_post'        => 'delete_auction',
            'edit_posts'         => 'edit_auctions',
            'edit_others_posts'  => 'edit_others_auctions',
            'publish_posts'      => 'publish_auctions',
            'read_private_posts' => 'read_private_auctions',
            'delete_posts'       => 'delete_auctions',
            'delete_private_posts' => 'delete_private_auctions',
            'delete_published_posts' => 'delete_published_auctions',
            'delete_others_posts' => 'delete_others_auctions',
            'edit_private_posts' => 'edit_private_auctions',
            'edit_published_posts' => 'edit_published_auctions',
        );

        $args = array(
            'labels'             => $labels,
            'public'             => true,
            'publicly_queryable' => true,
            'show_ui'            => true,
            'show_in_menu'       => true,
            'query_var'          => true,
            'rewrite'            => array('slug' => 'auction'),
            'capability_type'    => array('auction', 'auctions'),
            'capabilities'       => $capabilities,
            'map_meta_cap'       => true,
            'has_archive'        => true,
            'hierarchical'       => false,
            'menu_position'      => 5,
            'menu_icon'          => 'dashicons-tag',
            'supports'           => array('title', 'editor', 'thumbnail', 'author'),
            'show_in_rest'       => true,
            'rest_base'          => 'auction',
            'rest_controller_class' => 'WP_REST_Posts_Controller',
        );

        register_post_type('auction', $args);

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
}
add_action('init', 'bidspace_register_auction_post_type');

// Register Forum Post Type
if (!function_exists('bidspace_register_forum_post_type')) {
    function bidspace_register_forum_post_type() {
        $labels = [
            'name'               => _x('Forum', 'Post type general name', 'bidspace'),
            'singular_name'      => _x('Forum Post', 'Post type singular name', 'bidspace'),
            'menu_name'          => _x('Forum', 'Admin Menu text', 'bidspace'),
            'name_admin_bar'     => _x('Forum Post', 'Add New on Toolbar', 'bidspace'),
            'add_new'           => __('Add New', 'bidspace'),
            'add_new_item'      => __('Add New Forum Post', 'bidspace'),
            'edit_item'         => __('Edit Forum Post', 'bidspace'),
            'new_item'          => __('New Forum Post', 'bidspace'),
            'view_item'         => __('View Forum Post', 'bidspace'),
            'search_items'      => __('Search Forum Posts', 'bidspace'),
            'not_found'         => __('No forum posts found', 'bidspace'),
            'not_found_in_trash'=> __('No forum posts found in trash', 'bidspace'),
            'all_items'         => __('All Forum Posts', 'bidspace'),
            'archives'          => __('Forum Archives', 'bidspace'),
            'attributes'        => __('Forum Attributes', 'bidspace'),
        ];

        $args = [
            'labels'              => $labels,
            'description'         => __('Forum posts for discussion', 'bidspace'),
            'public'             => true,
            'publicly_queryable' => true,
            'show_ui'            => true,
            'show_in_menu'       => true,
            'show_in_nav_menus'  => true,
            'show_in_admin_bar'  => true,
            'show_in_rest'       => true,
            'rest_base'          => 'forum',
            'menu_position'      => 5,
            'menu_icon'          => 'dashicons-format-chat',
            'hierarchical'       => false,
            'supports'           => [
                'title',
                'editor',
                'author',
                'thumbnail',
                'excerpt',
                'comments',
                'revisions',
            ],
            'taxonomies'         => ['forum_category'],
            'has_archive'        => true,
            'rewrite'            => ['slug' => 'forum', 'with_front' => true],
            'capability_type'    => 'post',
            'map_meta_cap'       => true,
        ];

        register_post_type('forum', $args);

        // Register forum category taxonomy
        $taxonomy_labels = [
            'name'              => __('Forum Categories', 'bidspace'),
            'singular_name'     => __('Forum Category', 'bidspace'),
            'search_items'      => __('Search Categories', 'bidspace'),
            'all_items'         => __('All Categories', 'bidspace'),
            'edit_item'         => __('Edit Category', 'bidspace'),
            'update_item'       => __('Update Category', 'bidspace'),
            'add_new_item'      => __('Add New Category', 'bidspace'),
            'new_item_name'     => __('New Category Name', 'bidspace'),
            'menu_name'         => __('Categories', 'bidspace'),
        ];

        $taxonomy_args = [
            'labels'            => $taxonomy_labels,
            'hierarchical'      => true,
            'public'            => true,
            'show_ui'          => true,
            'show_admin_column' => true,
            'show_in_rest'      => true,
            'rest_base'         => 'forum-categories',
            'query_var'         => true,
        ];

        register_taxonomy('forum_category', ['forum'], $taxonomy_args);

        // Register default categories
        $default_categories = [
            'cinema-theatre' => 'კინო-თეატრი',
            'events' => 'ივენთები',
            'sports' => 'სპორტი',
            'travel' => 'მოგზაურობა'
        ];

        foreach ($default_categories as $slug => $name) {
            if (!term_exists($slug, 'forum_category')) {
                wp_insert_term($name, 'forum_category', ['slug' => $slug]);
            }
        }
    }
}
add_action('init', 'bidspace_register_forum_post_type', 0); // Priority 0 to ensure it runs early

// Add auction capabilities to roles
function bidspace_add_auction_caps() {
    // Get roles
    $admin = get_role('administrator');
    $editor = get_role('editor');
    $author = get_role('author');
    $contributor = get_role('contributor');
    $subscriber = get_role('subscriber');
    
    // Admin gets all capabilities
    $admin->add_cap('edit_auction');
    $admin->add_cap('read_auction');
    $admin->add_cap('delete_auction');
    $admin->add_cap('edit_auctions');
    $admin->add_cap('edit_others_auctions');
    $admin->add_cap('publish_auctions');
    $admin->add_cap('read_private_auctions');
    $admin->add_cap('delete_auctions');
    $admin->add_cap('delete_private_auctions');
    $admin->add_cap('delete_published_auctions');
    $admin->add_cap('delete_others_auctions');
    $admin->add_cap('edit_private_auctions');
    $admin->add_cap('edit_published_auctions');

    // Other roles get limited capabilities
    $roles = array($editor, $author, $contributor, $subscriber);
    foreach($roles as $role) {
        if($role) {
            // Basic auction capabilities
            $role->add_cap('read_auction');
            $role->add_cap('publish_auctions');
            $role->add_cap('delete_auction');
            $role->add_cap('edit_auction'); // Can edit own auctions only
            $role->add_cap('delete_published_auctions'); // Can delete own published auctions
            
            // Remove capabilities for editing others' auctions
            $role->remove_cap('edit_others_auctions');
            $role->remove_cap('delete_others_auctions');
            $role->remove_cap('edit_published_auctions');
        }
    }
}
add_action('admin_init', 'bidspace_add_auction_caps');

// Add Meta Boxes
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

// Render Meta Box
function render_auction_details_meta_box($post) {
    // Get current values
    $ticket_category = get_post_meta($post->ID, 'ticket_category', true);
    $city = get_post_meta($post->ID, 'city', true);
    $start_date = get_post_meta($post->ID, 'start_date', true);
    $ticket_price = get_post_meta($post->ID, 'ticket_price', true);
    $ticket_quantity = get_post_meta($post->ID, 'ticket_quantity', true);
    $hall = get_post_meta($post->ID, 'hall', true);
    $row = get_post_meta($post->ID, 'row', true);
    $place = get_post_meta($post->ID, 'place', true);
    $sector = get_post_meta($post->ID, 'sector', true);
    
    wp_nonce_field('save_auction_details', 'auction_details_nonce');
    ?>
    <div class="auction-meta-box">
        <style>
            .category-specific-fields { display: none; }
            .category-specific-fields.active { display: block; }
            .form-table th { width: 200px; }
        </style>

        <table class="form-table">
            <tr>
                <th><label for="ticket_category">კატეგორია</label></th>
                <td>
                    <select name="ticket_category" id="ticket_category" class="widefat">
                        <option value="თეატრი-კინო" <?php selected($ticket_category, 'თეატრი-კინო'); ?>>თეატრი-კინო</option>
                        <option value="ივენთები" <?php selected($ticket_category, 'ივენთები'); ?>>ივენთები</option>
                        <option value="სპორტი" <?php selected($ticket_category, 'სპორტი'); ?>>სპორტი</option>
                        <option value="მოგზაურობა" <?php selected($ticket_category, 'მოგზაურობა'); ?>>მოგზაურობა</option>
                    </select>
                </td>
            </tr>
            <tr>
                <th><label for="city">ქალაქი</label></th>
                <td>
                    <select name="city" id="city" class="widefat">
                        <option value="tbilisi" <?php selected($city, 'tbilisi'); ?>>თბილისი</option>
                        <option value="batumi" <?php selected($city, 'batumi'); ?>>ბათუმი</option>
                        <option value="kutaisi" <?php selected($city, 'kutaisi'); ?>>ქუთაისი</option>
                        <option value="skhva_qalaqebi" <?php selected($city, 'skhva_qalaqebi'); ?>>სხვა ქალაქები</option>
                        <option value="sazgvargaret" <?php selected($city, 'sazgvargaret'); ?>>საზღვარგარეთ</option>
                    </select>
                </td>
            </tr>
            <tr>
                <th><label for="start_date">დაწყების თარიღი</label></th>
                <td>
                    <input type="datetime-local" id="start_date" name="start_date" value="<?php echo esc_attr($start_date); ?>" class="widefat">
                </td>
            </tr>
            <tr>
                <th><label for="ticket_price">ბილეთის ფასი</label></th>
                <td>
                    <input type="number" id="ticket_price" name="ticket_price" value="<?php echo esc_attr($ticket_price); ?>" class="widefat">
                </td>
            </tr>
            <tr>
                <th><label for="ticket_quantity">ბილეთების რაოდენობა</label></th>
                <td>
                    <input type="number" id="ticket_quantity" name="ticket_quantity" value="<?php echo esc_attr($ticket_quantity); ?>" class="widefat">
                </td>
            </tr>
        </table>

        <!-- Theater and Cinema specific fields -->
        <div id="theater-cinema-fields" class="category-specific-fields <?php echo $ticket_category === 'თეატრი-კინო' ? 'active' : ''; ?>">
            <table class="form-table">
                <tr>
                    <th><label for="hall">დარბაზი</label></th>
                    <td>
                        <input type="text" id="hall" name="hall" value="<?php echo esc_attr($hall); ?>" class="widefat">
                    </td>
                </tr>
                <tr>
                    <th><label for="row">რიგი</label></th>
                    <td>
                        <input type="text" id="row" name="row" value="<?php echo esc_attr($row); ?>" class="widefat">
                    </td>
                </tr>
                <tr>
                    <th><label for="place">ადგილი</label></th>
                    <td>
                        <input type="text" id="place" name="place" value="<?php echo esc_attr($place); ?>" class="widefat">
                    </td>
                </tr>
            </table>
        </div>

        <!-- Sports specific fields -->
        <div id="sports-fields" class="category-specific-fields <?php echo $ticket_category === 'სპორტი' ? 'active' : ''; ?>">
            <table class="form-table">
                <tr>
                    <th><label for="sector">სექტორი</label></th>
                    <td>
                        <input type="text" id="sector" name="sector" value="<?php echo esc_attr($sector); ?>" class="widefat">
                    </td>
                </tr>
                <tr>
                    <th><label for="row">რიგი</label></th>
                    <td>
                        <input type="text" id="row" name="row" value="<?php echo esc_attr($row); ?>" class="widefat">
                    </td>
                </tr>
                <tr>
                    <th><label for="place">ადგილი</label></th>
                    <td>
                        <input type="text" id="place" name="place" value="<?php echo esc_attr($place); ?>" class="widefat">
                    </td>
                </tr>
            </table>
        </div>
    </div>

    <script>
    jQuery(document).ready(function($) {
        $('#ticket_category').on('change', function() {
            $('.category-specific-fields').removeClass('active');
            
            if (this.value === 'თეატრი-კინო') {
                $('#theater-cinema-fields').addClass('active');
            } else if (this.value === 'სპორტი') {
                $('#sports-fields').addClass('active');
            }
        });
    });
    </script>
    <?php
}

// Save Meta Box data
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
        'start_time',
        'due_time',
        'buy_now',
        'min_bid_price',
        'price_limit',
        'ticket_status',
        'last_bid_price',
        'last_bid_author',
        'last_bid_time',
        'last_bid_author_id',
        'city',
        'skhva_qalaqebi',
        'sazgvargaret',
        'ticket_price',
        'ticket_quantity',
        'start_date',
        'hall',
        'row',
        'place',
        'sector',
        'ticket_information',
        'ticket_category',
        'phone_number',
        'piradi_nomeri',
        'visibility'  // Add this line
    );

    foreach ($fields as $field) {
        if (isset($_POST[$field])) {
            update_post_meta(
                $post_id,
                $field,
                sanitize_text_field($_POST[$field])
            );
        }
    }

    // Save bids list
    if (isset($_POST['bids_list'])) {
        $bids_list = array();
        foreach ($_POST['bids_list'] as $bid) {
            if (!empty($bid['bid_price']) || !empty($bid['bid_author'])) {
                $bids_list[] = array(
                    'bid_price' => sanitize_text_field($bid['bid_price']),
                    'bid_author' => sanitize_text_field($bid['bid_author']),
                    'bid_time' => sanitize_text_field($bid['bid_time']),
                    'price_increase' => sanitize_text_field($bid['price_increase'])
                );
            }
        }
        update_post_meta($post_id, 'bids_list', $bids_list);
    }

    // Save comments list
    if (isset($_POST['comments_list'])) {
        $comments_list = array();
        foreach ($_POST['comments_list'] as $comment) {
            if (!empty($comment['comment_author']) || !empty($comment['comment_area'])) {
                $comments_list[] = array(
                    'comment_author' => sanitize_text_field($comment['comment_author']),
                    'comment_author_name' => sanitize_text_field($comment['comment_author_name']),
                    'comment_date' => sanitize_text_field($comment['comment_date']),
                    'comment_area' => sanitize_textarea_field($comment['comment_area'])
                );
            }
        }
        update_post_meta($post_id, 'comments_list', $comments_list);
    }
}
add_action('save_post_auction', 'save_auction_meta');

// Register meta for REST API
function bidspace_register_auction_meta() {
    $meta_fields = array(
        'auction_price' => array(
            'type' => 'number',
            'description' => 'Auction starting price',
            'single' => true,
            'default' => 0
        ),
        'start_time' => array(
            'type' => 'string',
            'description' => 'Auction start time',
            'single' => true
        ),
        'due_time' => array(
            'type' => 'string',
            'description' => 'Auction end time',
            'single' => true
        ),
        'buy_now' => array(
            'type' => 'number',
            'description' => 'Buy now price',
            'single' => true,
            'default' => 0
        ),
        'min_bid_price' => array(
            'type' => 'number',
            'description' => 'Minimum bid price',
            'single' => true,
            'default' => 0
        ),
        'price_limit' => array(
            'type' => 'number',
            'description' => 'Price limit',
            'single' => true,
            'default' => 0
        ),
        'ticket_status' => array(
            'type' => 'string',
            'description' => 'Ticket Status',
            'single' => true,
            'default' => 'დაგეგმილი',
            'enum' => array('დაგეგმილი', 'აქტიური', 'დასრულებული')
        ),
        'bids_list' => array(
            'type' => 'array',
            'description' => 'List of bids',
            'single' => true,
            'default' => array(),
            'show_in_rest' => array(
                'schema' => array(
                    'items' => array(
                        'type' => 'object',
                        'properties' => array(
                            'bid_price' => array(
                                'type' => 'string'
                            ),
                            'bid_author' => array(
                                'type' => 'string'
                            ),
                            'bid_time' => array(
                                'type' => 'string'
                            ),
                            'price_increase' => array(
                                'type' => 'string'
                            )
                        )
                    )
                )
            )
        ),
        'last_bid_price' => array(
            'type' => 'string',
            'description' => 'Last bid price',
            'single' => true
        ),
        'last_bid_author' => array(
            'type' => 'string',
            'description' => 'Last bid author name',
            'single' => true
        ),
        'last_bid_time' => array(
            'type' => 'string',
            'description' => 'Last bid time',
            'single' => true
        ),
        'last_bid_author_id' => array(
            'type' => 'string',
            'description' => 'Last bid author ID',
            'single' => true
        ),
        'city' => array(
            'type' => 'string',
            'description' => 'City',
            'single' => true,
            'enum' => array('tbilisi', 'batumi', 'kutaisi', 'skhva_qalaqebi', 'sazgvargaret')
        ),
        'skhva_qalaqebi' => array(
            'type' => 'string',
            'description' => 'Other cities',
            'single' => true
        ),
        'sazgvargaret' => array(
            'type' => 'string',
            'description' => 'Abroad',
            'single' => true
        ),
        'ticket_price' => array(
            'type' => 'string',
            'description' => 'Ticket price',
            'single' => true
        ),
        'ticket_quantity' => array(
            'type' => 'string',
            'description' => 'Ticket quantity',
            'single' => true
        ),
        'start_date' => array(
            'type' => 'string',
            'description' => 'Start date',
            'single' => true
        ),
        'hall' => array(
            'type' => 'string',
            'description' => 'Hall',
            'single' => true
        ),
        'row' => array(
            'type' => 'string',
            'description' => 'Row',
            'single' => true
        ),
        'place' => array(
            'type' => 'string',
            'description' => 'Place',
            'single' => true
        ),
        'sector' => array(
            'type' => 'string',
            'description' => 'Sector',
            'single' => true
        ),
        'ticket_information' => array(
            'type' => 'string',
            'description' => 'Ticket information',
            'single' => true
        ),
        'ticket_category' => array(
            'type' => 'string',
            'description' => 'Ticket category',
            'single' => true,
            'enum' => array('თეატრი-კინო', 'ივენთები', 'სპორტი', 'მოგზაურობა')
        ),
        'phone_number' => array(
            'type' => 'string',
            'description' => 'User phone number',
            'single' => true
        ),
        'piradi_nomeri' => array(
            'type' => 'string',
            'description' => 'User personal ID number',
            'single' => true
        ),
        'comments_list' => array(
            'type' => 'array',
            'description' => 'List of comments',
            'single' => true,
            'default' => array(),
            'show_in_rest' => array(
                'schema' => array(
                    'items' => array(
                        'type' => 'object',
                        'properties' => array(
                            'comment_author' => array(
                                'type' => 'string'
                            ),
                            'comment_author_name' => array(
                                'type' => 'string'
                            ),
                            'comment_date' => array(
                                'type' => 'string'
                            ),
                            'comment_area' => array(
                                'type' => 'string'
                            )
                        )
                    )
                )
            )
        ),
        'visibility' => array(
            'type' => 'boolean',
            'description' => 'Auction visibility status',
            'single' => true,
            'default' => false,
            'sanitize_callback' => function($value) {
                return (bool) $value;
            },
        ),
    );

    foreach ($meta_fields as $field => $args) {
        $args = array_merge($args, array(
            'show_in_rest' => true,
            'sanitize_callback' => 'sanitize_text_field',
            'auth_callback' => function() {
                return current_user_can('edit_posts');
            }
        ));

        register_post_meta('auction', $field, $args);
    }
}
add_action('init', 'bidspace_register_auction_meta');

// Ensure all meta fields are visible in REST API
function bidspace_rest_prepare_auction($response, $post, $request) {
    if (empty($response->data)) {
        return $response;
    }

    // აუცილებლად დავამატოთ ყველა მეტა ველი პასუხში
    $meta_fields = get_post_meta($post->ID);
    $response->data['meta'] = array();
    
    foreach ($meta_fields as $key => $value) {
        // Boolean ველების სწორი კონვერტაცია
        if ($key === 'visibility') {
            $response->data['meta'][$key] = (bool) $value[0];
        } else {
            $response->data['meta'][$key] = $value[0];
        }
    }

    return $response;
}
add_filter('rest_prepare_auction', 'bidspace_rest_prepare_auction', 10, 3);

// Register user meta fields
function bidspace_register_user_meta() {
    register_meta('user', 'phone_number', array(
        'type' => 'string',
        'description' => 'User phone number',
        'single' => true,
        'show_in_rest' => true,
        'auth_callback' => function() {
            return current_user_can('edit_user');
        }
    ));

    register_meta('user', 'piradi_nomeri', array(
        'type' => 'string',
        'description' => 'User personal ID number',
        'single' => true,
        'show_in_rest' => true,
        'auth_callback' => function() {
            return current_user_can('edit_user');
        }
    ));
}
add_action('init', 'bidspace_register_user_meta');

// Add extra fields to user profile
function bidspace_extra_user_profile_fields($user) {
    ?>
    <h3><?php _e("დამატებითი ინფორმაცია", "bidspace"); ?></h3>
    <table class="form-table">
        <tr>
            <th>
                <label for="phone_number"><?php _e("ტელეფონის ნომერი", "bidspace"); ?></label>
            </th>
            <td>
                <input type="text" name="phone_number" id="phone_number" 
                       value="<?php echo esc_attr(get_user_meta($user->ID, 'phone_number', true)); ?>" 
                       class="regular-text" />
            </td>
        </tr>
        <tr>
            <th>
                <label for="piradi_nomeri"><?php _e("პირადი ნომერი", "bidspace"); ?></label>
            </th>
            <td>
                <input type="text" name="piradi_nomeri" id="piradi_nomeri" 
                       value="<?php echo esc_attr(get_user_meta($user->ID, 'piradi_nomeri', true)); ?>" 
                       class="regular-text" />
            </td>
        </tr>
    </table>
    <?php
}

// Save extra user profile fields
function bidspace_save_extra_user_profile_fields($user_id) {
    if (!current_user_can('edit_user', $user_id)) {
        return false;
    }

    if (isset($_POST['phone_number'])) {
        update_user_meta($user_id, 'phone_number', sanitize_text_field($_POST['phone_number']));
    }

    if (isset($_POST['piradi_nomeri'])) {
        update_user_meta($user_id, 'piradi_nomeri', sanitize_text_field($_POST['piradi_nomeri']));
    }
}

// Add the fields to user profile
add_action('show_user_profile', 'bidspace_extra_user_profile_fields');
add_action('edit_user_profile', 'bidspace_extra_user_profile_fields');
add_action('user_new_form', 'bidspace_extra_user_profile_fields');

// Save the fields
add_action('personal_options_update', 'bidspace_save_extra_user_profile_fields');
add_action('edit_user_profile_update', 'bidspace_save_extra_user_profile_fields');
add_action('user_register', 'bidspace_save_extra_user_profile_fields');

// Register REST API fields for users
function bidspace_register_user_rest_fields() {
    register_rest_field('user', 'first_name', array(
        'get_callback' => function($user) {
            return get_user_meta($user['id'], 'first_name', true);
        },
        'update_callback' => function($value, $user) {
            return update_user_meta($user->ID, 'first_name', $value);
        },
        'schema' => array(
            'type' => 'string',
            'context' => array('view', 'edit')
        )
    ));

    register_rest_field('user', 'last_name', array(
        'get_callback' => function($user) {
            return get_user_meta($user['id'], 'last_name', true);
        },
        'update_callback' => function($value, $user) {
            return update_user_meta($user->ID, 'last_name', $value);
        },
        'schema' => array(
            'type' => 'string',
            'context' => array('view', 'edit')
        )
    ));

    register_rest_field('user', 'nickname', array(
        'get_callback' => function($user) {
            return get_user_meta($user['id'], 'nickname', true);
        },
        'update_callback' => function($value, $user) {
            return update_user_meta($user->ID, 'nickname', $value);
        },
        'schema' => array(
            'type' => 'string',
            'context' => array('view', 'edit')
        )
    ));

    // Make sure email is exposed in the REST API
    register_rest_field('user', 'email', array(
        'get_callback' => function($user) {
            $userdata = get_userdata($user['id']);
            return $userdata ? $userdata->user_email : '';
        },
        'update_callback' => function($value, $user) {
            $userdata = array(
                'ID' => $user->ID,
                'user_email' => $value
            );
            return wp_update_user($userdata);
        },
        'schema' => array(
            'type' => 'string',
            'format' => 'email',
            'context' => array('view', 'edit')
        )
    ));
}
add_action('rest_api_init', 'bidspace_register_user_rest_fields');

function bidspace_filter_auctions($query) {
    // Skip filter for admin area
    if (is_admin()) {
        return;
    }

    // Skip filter for admin REST API requests
    if (defined('REST_REQUEST') && REST_REQUEST && 
        (isset($_SERVER['HTTP_X_WP_ADMIN']) || 
         (isset($_SERVER['HTTP_REFERER']) && strpos($_SERVER['HTTP_REFERER'], '/wp-admin/') !== false) ||
         current_user_can('administrator'))) {
        return;
    }

    // Only apply filter for auction post type queries
    if ($query->get('post_type') === 'auction') {
        $meta_query = array('relation' => 'AND');

        // Price filter logic
        if (isset($_GET['min_price']) || isset($_GET['max_price'])) {
            $price_query = array();

            if (isset($_GET['min_price']) && is_numeric($_GET['min_price'])) {
                $price_query[] = array(
                    'key' => 'auction_price',
                    'value' => floatval($_GET['min_price']),
                    'type' => 'NUMERIC',
                    'compare' => '>='
                );
            }

            if (isset($_GET['max_price']) && is_numeric($_GET['max_price'])) {
                $price_query[] = array(
                    'key' => 'auction_price',
                    'value' => floatval($_GET['max_price']),
                    'type' => 'NUMERIC',
                    'compare' => '<='
                );
            }

            if (!empty($price_query)) {
                if (count($price_query) > 1) {
                    $price_query['relation'] = 'AND';
                }
                $meta_query[] = $price_query;
            }
        }

        // Add visibility filter for non-admin users
        if (!current_user_can('administrator')) {
            $meta_query[] = array(
                'key' => 'visibility',
                'value' => '1',
                'compare' => '='
            );
        }

        // City filter logic (keep existing)
        if (isset($_GET['city']) && $_GET['city'] !== '') {
            $meta_query[] = array(
                'key' => 'city',
                'value' => sanitize_text_field($_GET['city']),
                'compare' => '='
            );
        }

        // Apply meta query if not empty
        if (count($meta_query) > 1) {
            $query->set('meta_query', $meta_query);
        }
    }
}
add_action('pre_get_posts', 'bidspace_filter_auctions');

// Add this new function after bidspace_register_auction_meta()
function bidspace_customize_auction_rest_api() {
    // Add custom permissions for REST API
    add_filter('rest_auction_query', function($args, $request) {
        if (current_user_can('edit_others_auctions')) {
            // Allow administrators to view all auctions
            unset($args['author']);
        }
        return $args;
    }, 10, 2);

    // Add custom permissions check for editing auctions
    add_filter('rest_pre_dispatch', function($result, $server, $request) {
        if (strpos($request->get_route(), '/wp/v2/auction') === false) {
            return $result;
        }

        // Get the request method
        $method = $request->get_method();
        
        // For POST (create) and DELETE methods
        if ($method === 'POST' || $method === 'DELETE') {
            if (!is_user_logged_in()) {
                return new WP_Error(
                    'rest_forbidden',
                    'You must be logged in to perform this action.',
                    array('status' => rest_authorization_required_code())
                );
            }
            return $result;
        }
        
        // For PUT/PATCH (edit) methods
        if ($method === 'PUT' || $method === 'PATCH') {
            if (!current_user_can('edit_others_auctions')) {
                return new WP_Error(
                    'rest_forbidden',
                    'Sorry, you are not allowed to edit auctions.',
                    array('status' => rest_authorization_required_code())
                );
            }
        }

        return $result;
    }, 10, 3);
    
    // Add filter for own auctions
    add_filter('rest_auction_permissions_check', function($response, $request) {
        if ($request->get_method() === 'PUT' || $request->get_method() === 'PATCH') {
            $post = get_post($request['id']);
            if (!current_user_can('edit_others_auctions') && $post->post_author != get_current_user_id()) {
                return new WP_Error(
                    'rest_forbidden',
                    'Sorry, you can only edit your own auctions.',
                    array('status' => rest_authorization_required_code())
                );
            }
        }
        return $response;
    }, 10, 2);
}
add_action('rest_api_init', 'bidspace_customize_auction_rest_api');

// Add filter to modify auction queries based on visibility
function bidspace_filter_auctions_by_visibility($query) {
    // Skip filter for admin area
    if (is_admin()) {
        return;
    }

    // Skip filter for admin REST API requests
    if (defined('REST_REQUEST') && REST_REQUEST && 
        (isset($_SERVER['HTTP_X_WP_ADMIN']) || 
         (isset($_SERVER['HTTP_REFERER']) && strpos($_SERVER['HTTP_REFERER'], '/wp-admin/') !== false) ||
         current_user_can('administrator'))) {
        return;
    }

    // Only apply filter for frontend queries and non-admin users
    if (!current_user_can('administrator') && $query->is_main_query() && is_post_type_archive('auction')) {
        $meta_query = $query->get('meta_query', array());
        
        $meta_query[] = array(
            'key' => 'visibility',
            'value' => '1',
            'compare' => '='
        );
        
        $query->set('meta_query', $meta_query);
    }
}
add_action('pre_get_posts', 'bidspace_filter_auctions_by_visibility');

// დავამატოთ REST API-ის query ფილტრი
add_filter('rest_auction_query', function($args, $request) {
    // ადმინისტრატორებისთვის ყველა აუქციონის ჩვენება
    if (!current_user_can('administrator')) {
        $meta_query = array(
            array(
                'key'     => 'visibility',
                'value'   => '1',
                'compare' => '='
            )
        );
        
        $args['meta_query'] = isset($args['meta_query']) 
            ? array_merge($args['meta_query'], $meta_query) 
            : $meta_query;
    }
    
    return $args;
}, 10, 2);

// Add rewrite rules flush on theme activation
add_action('after_switch_theme', function() {
    add_option('bidspace_needs_rewrite_flush', 'true');
});

// Flush rewrite rules if needed
add_action('init', function() {
    if (get_option('bidspace_needs_rewrite_flush') === 'true') {
        flush_rewrite_rules();
        delete_option('bidspace_needs_rewrite_flush');
    }
}, 20);