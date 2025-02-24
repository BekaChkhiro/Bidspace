<?php
if (!defined('ABSPATH')) exit;

// Initialize the forum system immediately
function initialize_bidspace_forum() {
    BidSpace_Forum::get_instance();
}
add_action('init', 'initialize_bidspace_forum', -999);

class BidSpace_Forum {
    private static $instance = null;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        // Register post types and taxonomies at the earliest possible moment
        add_action('init', [$this, 'register_post_type'], 0);
        add_action('init', [$this, 'register_taxonomy'], 0);
        
        // Register meta fields
        add_action('init', [$this, 'register_meta_fields']);
        
        // Register REST API endpoints
        add_action('rest_api_init', [$this, 'register_rest_api_endpoints']);
        add_action('rest_api_init', [$this, 'register_rest_fields']);
        add_action('rest_api_init', [$this, 'register_rest_routes']);
        add_action('rest_api_init', [$this, 'register_comment_routes']);
        add_action('rest_api_init', [$this, 'register_like_endpoints']);
        add_filter('rest_pre_insert_comment', [$this, 'validate_forum_comment'], 10, 2);
        
        // Flush rewrite rules on activation
        add_action('admin_init', [$this, 'flush_rewrite_rules_maybe']);
    }

    public function register_post_type() {
        $labels = [
            'name'               => __('Forum', 'bidspace'),
            'singular_name'      => __('Forum Post', 'bidspace'),
            'menu_name'          => __('Forum', 'bidspace'),
            'name_admin_bar'     => __('Forum Post', 'bidspace'),
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
            'rest_controller_class' => 'WP_REST_Posts_Controller',
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
            'rewrite'            => ['slug' => 'forum'],
            'capability_type'    => 'post',
            'map_meta_cap'       => true,
        ];

        register_post_type('forum', $args);
    }

    public function register_taxonomy() {
        $labels = [
            'name'              => __('Forum Categories', 'bidspace'),
            'singular_name'     => __('Forum Category', 'bidspace'),
            'search_items'      => __('Search Categories', 'bidspace'),
            'all_items'         => __('All Categories', 'bidspace'),
            'parent_item'       => __('Parent Category', 'bidspace'),
            'parent_item_colon' => __('Parent Category:', 'bidspace'),
            'edit_item'         => __('Edit Category', 'bidspace'),
            'update_item'       => __('Update Category', 'bidspace'),
            'add_new_item'      => __('Add New Category', 'bidspace'),
            'new_item_name'     => __('New Category Name', 'bidspace'),
            'menu_name'         => __('Categories', 'bidspace'),
        ];

        $args = [
            'labels'            => $labels,
            'hierarchical'      => true,
            'public'            => true,
            'show_ui'          => true,
            'show_admin_column' => true,
            'show_in_rest'      => true,
            'rest_base'         => 'forum-categories',
            'rest_controller_class' => 'WP_REST_Terms_Controller',
            'query_var'         => true,
            'rewrite'           => ['slug' => 'forum-category'],
        ];

        register_taxonomy('forum_category', ['forum'], $args);

        // Register default categories
        $default_categories = [
            'cinema-theatre' => 'კინო-თეატრი',
            'events' => 'ივენთები',
            'sports' => 'სპორტი',
            'travel' => 'მოგზაურობა'
        ];

        foreach ($default_categories as $slug => $name) {
            if (!term_exists($slug, 'forum_category')) {
                wp_insert_term($name, 'forum_category', [
                    'slug' => $slug,
                    'description' => $name
                ]);
            }
        }
    }

    public function register_meta_fields() {
        register_post_meta('forum', '_like_count', [
            'show_in_rest' => true,
            'single' => true,
            'type' => 'integer',
            'auth_callback' => function() {
                return current_user_can('edit_posts');
            },
            'default' => 0
        ]);

        register_post_meta('forum', '_liked_users', [
            'show_in_rest' => true,
            'single' => true,
            'type' => 'array',
            'auth_callback' => function() {
                return current_user_can('edit_posts');
            },
            'default' => []
        ]);

        register_post_meta('forum', 'views_count', [
            'show_in_rest' => true,
            'single' => true,
            'type' => 'integer',
            'auth_callback' => function() {
                return current_user_can('edit_posts');
            },
            'default' => 0
        ]);

        register_post_meta('forum', 'user_has_liked', [
            'show_in_rest' => true,
            'single' => true,
            'type' => 'boolean',
            'auth_callback' => function() {
                return true;
            },
            'get_callback' => function($post_id) {
                $user_id = get_current_user_id();
                if (!$user_id) return false;
                
                $liked_users = get_post_meta($post_id, '_liked_users', true);
                return is_array($liked_users) && in_array($user_id, $liked_users);
            }
        ]);
    }

    public function register_rest_fields() {
        // Register like count field
        register_rest_field('forum', 'like_count', [
            'get_callback' => [$this, 'get_like_count'],
            'update_callback' => null,
            'schema' => [
                'type' => 'integer',
                'description' => 'Number of likes for this forum post',
                'context' => ['view', 'edit'],
            ],
        ]);

        // Register user like status field
        register_rest_field('forum', 'user_has_liked', [
            'get_callback' => [$this, 'get_user_like_status'],
            'schema' => [
                'type' => 'boolean',
                'description' => 'Whether the current user has liked this post',
                'context' => ['view'],
            ],
        ]);
    }

    public function register_rest_routes() {
        // Like/Unlike endpoint
        register_rest_route('bidspace/v1', '/forum/(?P<id>\d+)/like', [
            'methods' => 'POST',
            'callback' => [$this, 'toggle_like'],
            'permission_callback' => function() {
                return is_user_logged_in();
            },
            'args' => [
                'id' => [
                    'validate_callback' => function($param) {
                        return is_numeric($param);
                    }
                ],
            ],
        ]);
    }

    public function register_comment_routes() {
        register_rest_route('bidspace/v1', '/forum/(?P<post_id>\d+)/comments', [
            'methods' => 'GET',
            'callback' => [$this, 'get_forum_comments'],
            'permission_callback' => '__return_true',
            'args' => [
                'post_id' => [
                    'validate_callback' => function($param) {
                        return is_numeric($param) && get_post_type($param) === 'forum';
                    }
                ],
            ],
        ]);

        register_rest_route('bidspace/v1', '/forum/(?P<post_id>\d+)/comments', [
            'methods' => 'POST',
            'callback' => [$this, 'add_forum_comment'],
            'permission_callback' => function() {
                return is_user_logged_in();
            },
            'args' => [
                'post_id' => [
                    'validate_callback' => function($param) {
                        return is_numeric($param) && get_post_type($param) === 'forum';
                    }
                ],
                'content' => [
                    'required' => true,
                    'type' => 'string',
                ],
            ],
        ]);

        register_rest_route('bidspace/v1', '/forum/comments/(?P<comment_id>\d+)', [
            'methods' => ['PUT', 'DELETE'],
            'callback' => [$this, 'manage_forum_comment'],
            'permission_callback' => [$this, 'can_manage_comment'],
            'args' => [
                'comment_id' => [
                    'validate_callback' => function($param) {
                        return is_numeric($param);
                    }
                ],
            ],
        ]);
    }

    public function get_forum_comments($request) {
        $post_id = $request['post_id'];
        
        $args = [
            'post_id' => $post_id,
            'status' => 'approve',
            'orderby' => 'comment_date',
            'order' => 'DESC',
        ];

        $comments = get_comments($args);
        $formatted_comments = [];

        foreach ($comments as $comment) {
            $formatted_comments[] = $this->format_comment($comment);
        }

        return rest_ensure_response($formatted_comments);
    }

    public function add_forum_comment($request) {
        $post_id = $request['post_id'];
        $user_id = get_current_user_id();
        $content = $request['content'];

        $comment_data = [
            'comment_post_ID' => $post_id,
            'user_id' => $user_id,
            'comment_content' => $content,
            'comment_approved' => 1,
        ];

        $comment_id = wp_insert_comment($comment_data);

        if (!$comment_id) {
            return new WP_Error('comment_failed', 'Failed to add comment', ['status' => 500]);
        }

        $comment = get_comment($comment_id);
        return rest_ensure_response($this->format_comment($comment));
    }

    public function manage_forum_comment($request) {
        $comment_id = $request['comment_id'];
        $method = $request->get_method();

        if ($method === 'DELETE') {
            $result = wp_delete_comment($comment_id, true);
            return rest_ensure_response(['success' => $result]);
        }

        if ($method === 'PUT') {
            $content = $request->get_param('content');
            if (empty($content)) {
                return new WP_Error('invalid_content', 'Comment content is required', ['status' => 400]);
            }

            $result = wp_update_comment([
                'comment_ID' => $comment_id,
                'comment_content' => $content,
            ]);

            if (!$result) {
                return new WP_Error('update_failed', 'Failed to update comment', ['status' => 500]);
            }

            $comment = get_comment($comment_id);
            return rest_ensure_response($this->format_comment($comment));
        }
    }

    public function can_manage_comment($request) {
        if (!is_user_logged_in()) {
            return false;
        }

        $comment_id = $request['comment_id'];
        $comment = get_comment($comment_id);
        
        if (!$comment) {
            return false;
        }

        $user_id = get_current_user_id();
        return ($comment->user_id == $user_id) || current_user_can('moderate_comments');
    }

    private function format_comment($comment) {
        return [
            'id' => $comment->comment_ID,
            'content' => $comment->comment_content,
            'date' => mysql_to_rfc3339($comment->comment_date),
            'author' => [
                'id' => $comment->user_id,
                'name' => get_user_by('id', $comment->user_id)->display_name,
            ],
            'can_edit' => $this->can_manage_comment(['comment_id' => $comment->comment_ID]),
        ];
    }

    public function validate_forum_comment($prepared_comment, $request) {
        if (get_post_type($prepared_comment->comment_post_ID) === 'forum') {
            // Add any forum-specific validation here
            if (empty($prepared_comment->comment_content)) {
                return new WP_Error('empty_comment', 'Comment content cannot be empty', ['status' => 400]);
            }
        }
        return $prepared_comment;
    }

    public function get_like_count($post) {
        return (int) get_post_meta($post['id'], '_like_count', true);
    }

    public function get_user_like_status($post) {
        if (!is_user_logged_in()) {
            return false;
        }
        $user_id = get_current_user_id();
        $liked_users = get_post_meta($post['id'], '_liked_users', true);
        return is_array($liked_users) && in_array($user_id, $liked_users);
    }

    public function toggle_like($request) {
        $post_id = $request['id'];
        $user_id = get_current_user_id();

        if (!$post_id || get_post_type($post_id) !== 'forum') {
            return new WP_Error('invalid_post', 'Invalid forum post', ['status' => 404]);
        }

        $liked_users = get_post_meta($post_id, '_liked_users', true);
        if (!is_array($liked_users)) {
            $liked_users = [];
        }

        $like_count = (int) get_post_meta($post_id, '_like_count', true);

        if (in_array($user_id, $liked_users)) {
            // Unlike
            $liked_users = array_diff($liked_users, [$user_id]);
            $like_count = max(0, $like_count - 1);
            $action = 'unliked';
        } else {
            // Like
            $liked_users[] = $user_id;
            $like_count++;
            $action = 'liked';
        }

        update_post_meta($post_id, '_liked_users', array_values($liked_users));
        update_post_meta($post_id, '_like_count', $like_count);

        return [
            'success' => true,
            'action' => $action,
            'like_count' => $like_count,
            'user_has_liked' => in_array($user_id, $liked_users),
        ];
    }

    public function flush_rewrite_rules_maybe() {
        // Check if our flag is set
        if (get_option('bidspace_forum_needs_rewrite_flush')) {
            flush_rewrite_rules();
            delete_option('bidspace_forum_needs_rewrite_flush');
        }
    }

    public function register_rest_api_endpoints() {
        // Register existing endpoint for creating posts
        register_rest_route('wp/v2', '/forum', [
            'methods' => 'POST',
            'callback' => [$this, 'create_forum_post'],
            'permission_callback' => function() {
                return is_user_logged_in();
            },
            'args' => [
                'title' => [
                    'required' => true,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                ],
                'content' => [
                    'required' => true,
                    'type' => 'string',
                    'sanitize_callback' => 'wp_kses_post',
                ],
                'forum_category' => [
                    'required' => true,
                    'type' => 'array',
                    'items' => [
                        'type' => 'string',
                    ],
                ],
            ],
        ]);

        // Add endpoint to get posts liked by a specific user
        register_rest_route('wp/v2', '/forum', [
            'methods' => 'GET',
            'callback' => [$this, 'get_forum_posts'],
            'permission_callback' => '__return_true',
            'args' => [
                'liked_by' => [
                    'type' => 'integer',
                    'description' => 'User ID to fetch liked posts for',
                ],
            ],
        ]);

        // Add filter to modify the query parameters for forum posts
        add_filter('rest_forum_query', [$this, 'modify_forum_query'], 10, 2);
    }

    public function get_forum_posts($request) {
        $args = [
            'post_type' => 'forum',
            'posts_per_page' => 10,
            'orderby' => 'date',
            'order' => 'DESC',
        ];

        // If liked_by parameter is present, filter by liked posts
        if ($request->get_param('liked_by')) {
            $user_id = (int)$request->get_param('liked_by');
            $args['meta_query'] = [
                [
                    'key' => '_liked_users',
                    'value' => sprintf(':"%d";', $user_id),
                    'compare' => 'LIKE',
                ],
            ];
        }

        $query = new WP_Query($args);
        $posts = [];

        foreach ($query->posts as $post) {
            $response = $this->prepare_forum_post_for_response($post, $request);
            $posts[] = $this->prepare_response_for_collection($response);
        }

        return rest_ensure_response($posts);
    }

    private function prepare_forum_post_for_response($post, $request) {
        $post_data = [];

        // Basic post data
        $post_data['id'] = $post->ID;
        $post_data['date'] = mysql_to_rfc3339($post->post_date);
        $post_data['title'] = [
            'rendered' => get_the_title($post->ID),
        ];
        $post_data['content'] = [
            'rendered' => apply_filters('the_content', $post->post_content),
        ];
        $post_data['excerpt'] = [
            'rendered' => get_the_excerpt($post),
        ];

        // Meta data
        $post_data['meta'] = [
            'like_count' => (int)get_post_meta($post->ID, '_like_count', true),
            'views_count' => (int)get_post_meta($post->ID, 'views_count', true),
            'liked_users' => get_post_meta($post->ID, '_liked_users', true) ?: [],
        ];

        // Author data
        $author_id = (int)$post->post_author;
        $post_data['author'] = $author_id;
        $post_data['author_name'] = get_the_author_meta('display_name', $author_id);

        return $post_data;
    }

    private function prepare_response_for_collection($response) {
        if (!($response instanceof WP_REST_Response)) {
            return $response;
        }

        $data = (array)$response->get_data();
        $server = rest_get_server();

        if (method_exists($server, 'get_compact_response_links')) {
            $links = call_user_func([$server, 'get_compact_response_links'], $response);
        } else {
            $links = [];
        }

        if (!empty($links)) {
            $data['_links'] = $links;
        }

        return $data;
    }

    public function create_forum_post($request) {
        $user_id = get_current_user_id();
        
        $post_data = [
            'post_title' => $request['title'],
            'post_content' => $request['content'],
            'post_status' => 'publish',
            'post_author' => $user_id,
            'post_type' => 'forum',
        ];

        $post_id = wp_insert_post($post_data);

        if (is_wp_error($post_id)) {
            return new WP_Error(
                'forum_create_failed',
                'Failed to create forum post',
                ['status' => 500]
            );
        }

        // Set forum category
        if (!empty($request['forum_category'])) {
            wp_set_object_terms($post_id, $request['forum_category'], 'forum_category');
        }

        // Initialize meta values
        update_post_meta($post_id, '_like_count', 0);
        update_post_meta($post_id, '_liked_users', []);
        update_post_meta($post_id, 'views_count', 0);

        $post = get_post($post_id);
        
        return rest_ensure_response([
            'id' => $post->ID,
            'title' => $post->post_title,
            'content' => $post->post_content,
            'author' => (int)$post->post_author,
            'date' => $post->post_date,
            'status' => $post->post_status,
            'type' => $post->post_type,
            'link' => get_permalink($post->ID),
            'categories' => wp_get_post_terms($post->ID, 'forum_category', ['fields' => 'names']),
            'meta' => [
                'like_count' => (int)get_post_meta($post->ID, '_like_count', true),
                'views_count' => (int)get_post_meta($post->ID, 'views_count', true),
            ],
        ]);
    }

    public function register_like_endpoints() {
        // Existing like endpoint registration...

        // Add view count endpoint
        register_rest_route('bidspace/v1', '/forum/(?P<id>\d+)/view', [
            'methods' => 'POST',
            'callback' => [$this, 'increment_view_count'],
            'permission_callback' => '__return_true',
            'args' => [
                'id' => [
                    'validate_callback' => function($param) {
                        return is_numeric($param) && get_post_type($param) === 'forum';
                    }
                ],
            ],
        ]);
    }

    public function increment_view_count($request) {
        $post_id = $request['id'];
        
        if (!$post_id || get_post_type($post_id) !== 'forum') {
            return new WP_Error(
                'invalid_post',
                'Invalid forum post',
                ['status' => 404]
            );
        }

        $views = (int) get_post_meta($post_id, 'views_count', true);
        update_post_meta($post_id, 'views_count', $views + 1);

        return rest_ensure_response([
            'success' => true,
            'views_count' => $views + 1
        ]);
    }

    public function modify_forum_query($args, $request) {
        $orderby = $request->get_param('orderby');
        
        switch ($orderby) {
            case 'likes':
                $args['meta_key'] = '_like_count';
                $args['orderby'] = 'meta_value_num';
                break;
            case 'views':
                $args['meta_key'] = 'views_count';
                $args['orderby'] = 'meta_value_num';
                break;
            case 'comments':
                $args['orderby'] = 'comment_count';
                break;
            default: // 'date'
                $args['orderby'] = 'date';
        }
        
        $args['order'] = 'DESC';
        return $args;
    }
}

// Force rewrite rules to be regenerated
function bidspace_force_rewrite_rules() {
    // Get the stored version number
    $version = get_option('bidspace_forum_version', '0');
    
    // If this is a new version, flush rewrite rules
    if (version_compare($version, '1.0.1', '<')) {
        flush_rewrite_rules(true);
        update_option('bidspace_forum_version', '1.0.1');
    }
}
add_action('init', 'bidspace_force_rewrite_rules', 1000);

// Flush rewrite rules on plugin activation and theme activation
function bidspace_forum_activation() {
    flush_rewrite_rules();
}
register_activation_hook(__FILE__, 'bidspace_forum_activation');
add_action('after_switch_theme', 'bidspace_forum_activation');