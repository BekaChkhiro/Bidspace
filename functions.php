<?php

function boilerplate_load_assets() {
  wp_enqueue_script('ourmainjs', get_theme_file_uri('/build/index.js'), array('wp-element'), '1.0', true);
  wp_enqueue_style('ourmaincss', get_theme_file_uri('/build/index.css'));
}

add_action('wp_enqueue_scripts', 'boilerplate_load_assets');

function boilerplate_add_support() {
  add_theme_support('title-tag');
  add_theme_support('post-thumbnails');
}

add_action('after_setup_theme', 'boilerplate_add_support');

/**
 * Register/enqueue custom scripts and styles
 */
function my_theme_enqueue_styles() {
  wp_enqueue_style('custom-style', get_template_directory_uri() . '/style.css');
}

add_action('wp_enqueue_scripts', 'my_theme_enqueue_styles');

/* React */
function my_react_theme_scripts() {
    wp_enqueue_script('my-react-theme-app', get_template_directory_uri() . '/build/index.js', array('wp-element'), '1.0.0', true);
    wp_enqueue_style('my-react-theme-style', get_stylesheet_uri());
}

add_action('wp_enqueue_scripts', 'my_react_theme_scripts');

/* tailwind */
function enqueue_tailwind() {
    wp_enqueue_style('tailwind-css', 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css', array(), null);
}
add_action('wp_enqueue_scripts', 'enqueue_tailwind');

function load_font_awesome() {
    wp_enqueue_style( 'font-awesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css' );
}
add_action( 'wp_enqueue_scripts', 'load_font_awesome' );

/* for all users */
add_filter( 'rest_user_query', function( $args, $request ) {
    $args['has_published_posts'] = false;
    return $args;
}, 10, 2 );

function register_my_menus() {
    register_nav_menus(
      array(
        'header-menu' => __( 'Header Menu' ),
      )
    );
}
add_action( 'init', 'register_my_menus' );

/* front page */
function force_front_page() {
    if ( is_home() ) {
        $front_page = get_stylesheet_directory() . '/front-page.php';
        if ( file_exists( $front_page ) ) {
            include( $front_page );
            exit();
        }
    }
}
add_action( 'template_redirect', 'force_front_page' );

/* login */
add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/login', array(
      'methods' => 'POST',
      'callback' => 'custom_login',
      'permission_callback' => function() {
        return true;
      }
    ));
});
  
function custom_login($request) {
    $creds = array(
      'user_login'    => $request->get_param('username'),
      'user_password' => $request->get_param('password'),
      'remember'      => true
    );
  
    $user = wp_signon($creds, false);
  
    if (is_wp_error($user)) {
      return new WP_REST_Response(array('success' => false, 'message' => $user->get_error_message()), 401);
    } else {
      return new WP_REST_Response(array('success' => true, 'message' => 'ავტორიზაცია წარმატებულია'), 200);
    }
}

// Custom REST API routes
add_action('rest_api_init', 'custom_rest_api_init');
function custom_rest_api_init() {
    register_rest_route('custom/v1', '/register', array(
        'methods' => 'POST',
        'callback' => 'custom_register_endpoint',
        'permission_callback' => '__return_true',
    ));

    register_rest_route('custom/v1', '/verify-code', array(
        'methods' => 'POST',
        'callback' => 'custom_verify_code_endpoint',
        'permission_callback' => '__return_true',
    ));
}

function custom_register_endpoint($request) {
    $firstName = $request->get_param('firstName');
    $lastName = $request->get_param('lastName');
    $email = $request->get_param('email');
    $phone = $request->get_param('phone');
    $username = $request->get_param('username');
    $personalNumber = $request->get_param('personalNumber');
    $password = $request->get_param('password');

    if (empty($firstName) || empty($lastName) || empty($email) || empty($phone) || empty($username) || empty($personalNumber) || empty($password)) {
        return [
            'success' => false,
            'message' => 'გთხოვთ შეავსოთ ყველა სავალდებულო ველი',
        ];
    }

    if (email_exists($email) || username_exists($username)) {
        return [
            'success' => false,
            'message' => 'ელ-ფოსტა ან მომხმარებლის სახელი უკვე არსებობს',
        ];
    }

    $verificationCode = generate_verification_code();
    update_user_meta(email_exists($email), 'verification_code', $verificationCode);

    $subject = 'Verification Code';
    $message = 'Your verification code is: ' . $verificationCode;
    wp_mail($email, $subject, $message);

    return [
        'success' => true,
        'message' => 'A verification code has been sent to your email address.',
    ];
}

function custom_verify_code_endpoint($request) {
    $email = $request->get_param('email');
    $code = $request->get_param('code');

    $storedCode = get_user_meta(email_exists($email), 'verification_code', true);
    if ($code === $storedCode) {
        $userId = username_exists($username);
        if (!$userId) {
            $userId = wp_create_user($username, $password, $email);
        }

        update_user_meta($userId, 'first_name', $firstName);
        update_user_meta($userId, 'last_name', $lastName);
        update_user_meta($userId, 'phone', $phone);
        update_user_meta($userId, 'personal_number', $personalNumber);
        delete_user_meta($userId, 'verification_code');

        return [
            'success' => true,
            'message' => 'Registration completed successfully.',
        ];
    } else {
        return [
            'success' => false,
            'message' => 'Invalid verification code.',
        ];
    }
}

function generate_verification_code() {
    return str_pad(strval(mt_rand(100000, 999999)), 6, '0', STR_PAD_LEFT);
}

// Create Auction User role
function create_auction_user_role() {
  add_role('auction_user', 'Auction User', array(
      'read' => true,
      'edit_auctions' => true,
      'publish_auctions' => true, 
      'upload_files' => true
  ));
}
add_action('init', 'create_auction_user_role');

function enhanced_hide_menu_items( $items, $menu, $args ) {
  error_log('enhanced_hide_menu_items function called');
  
  if ( !is_user_logged_in() ) {
      $restricted_pages = array('dashboard', 'profile', 'my-pages');
      foreach ( $items as $key => $item ) {
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
add_filter( 'wp_nav_menu_objects', 'enhanced_hide_menu_items', 10, 3 );

function redirect_login_page() {
  $login_page  = home_url('/login/');
  $page_viewed = basename($_SERVER['REQUEST_URI']);

  if($page_viewed == "wp-login.php" && $_SERVER['REQUEST_METHOD'] == 'GET') {
      wp_redirect($login_page);
      exit;
  }
}
add_action('init', 'redirect_login_page');

function login_failed() {
  $login_page  = home_url('/login/');
  wp_redirect($login_page . '?login=failed');
  exit;
}
add_action('wp_login_failed', 'login_failed');

function verify_username_password($user, $username, $password) {
  $login_page  = home_url('/login/');
  if($username == "" || $password == "") {
      wp_redirect($login_page . "?login=empty");
      exit;
  }
}
add_filter('authenticate', 'verify_username_password', 1, 3);

function logout_page() {
  $login_page  = home_url('/login/');
  wp_redirect($login_page . "?logged_out=true");
  exit;
}
add_action('wp_logout', 'logout_page');

require_once get_template_directory() . '/dashboard-templates/dashboard-functions.php';

// Allow any logged-in user to update auction meta
function custom_auction_rest_permission($permission, $context, $object_id, $post_type) {
  if ($post_type === 'auction' && is_user_logged_in()) {
      return true;
  }
  return $permission;
}
add_filter('rest_allow_anonymous_comments', '__return_true');
add_filter('rest_auction_meta_check_permissions', 'custom_auction_rest_permission', 10, 4);

// Add author information to auction post type REST API
add_action('rest_api_init', function () {
  register_rest_field('auction', 'author_data', array(
      'get_callback' => function($post_arr) {
          $post = get_post($post_arr['id']);
          if (!$post) return null;
          
          $author_id = $post->post_author;
          if (!$author_id) return null;
          
          $user = get_user_by('id', $author_id);
          if (!$user) return null;
          
          return array(
              'id' => $user->ID,
              'display_name' => $user->display_name,
              'user_nicename' => $user->user_nicename,
              'user_email' => $user->user_email,
              'user_registered' => $user->user_registered
          );
      },
      'schema' => array(
          'description' => 'Auction author information',
          'type' => 'object'
      )
  ));
});

// Create custom endpoint for auctions with additional information
add_action('rest_api_init', function () {
  register_rest_route('bidspace/v1', '/auction/(?P<id>\d+)', array(
      'methods' => 'GET',
      'callback' => 'get_auction_with_author',
      'permission_callback' => function () {
          return true;
      },
      'args' => array(
          'id' => array(
              'validate_callback' => function($param) {
                  return is_numeric($param);
              }
          )
      )
  ));
});

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

// Add CORS support
add_action('rest_api_init', function () {
  remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
  add_filter('rest_pre_serve_request', function ($value) {
      header('Access-Control-Allow-Origin: *');
      header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
      header('Access-Control-Allow-Credentials: true');
      header('Access-Control-Expose-Headers: Link');
      return $value;
  });
}, 15);

// Price update endpoint
add_action('rest_api_init', function () {
  register_rest_route('bidspace/v1', '/auction/(?P<id>\d+)/current-price', [
      'methods' => 'GET',
      'callback' => function ($request) {
          $auction_id = $request['id'];
          $current_price = get_post_meta($auction_id, 'auction_price', true);
          
          return [
              'price' => $current_price
          ];
      },
      'permission_callback' => '__return_true'
  ]);
});

// Add bid settings to page
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
add_action('wp_footer', 'add_bid_settings', 100);

// Bid handling functions
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

    // Check auction existence
    $auction = get_post($auction_id);
    if (!$auction || $auction->post_type !== 'auction') {
        return new WP_Error('invalid_auction', 'აუქციონი ვერ მოიძებნა', ['status' => 404]);
    }

    // Check time
    $due_time = get_post_meta($auction_id, 'due_time', true);
    $now = current_time('timestamp');
    $due_timestamp = strtotime($due_time);
    
    if ($due_timestamp && $now > $due_timestamp) {
        return new WP_Error('auction_ended', 'აუქციონი დასრულებულია', ['status' => 400]);
    }

    // Check if user is auction author
    if ($auction->post_author == $current_user_id) {
        return new WP_Error('author_bid', 'თქვენ არ შეგიძლიათ საკუთარ აუქციონზე ბიდის დადება', ['status' => 403]);
    }

    // Validate bid price
    $current_price = floatval(get_post_meta($auction_id, 'auction_price', true));
    $new_bid_price = floatval($params['bid_price']);
    
    if ($new_bid_price <= $current_price) {
        return new WP_Error('invalid_bid', 'ბიდი უნდა იყოს მიმდინარე ფასზე მეტი', ['status' => 400]);
    }

    // Add bid to history
    $bids_list = get_post_meta($auction_id, 'bids_list', true) ?: array();
    
    $new_bid = array(
        'bid_price' => $new_bid_price,
        'bid_author' => $current_user_id,
        'author_name' => get_the_author_meta('display_name', $current_user_id),
        'bid_time' => current_time('mysql'),
        'price_increase' => $new_bid_price - $current_price
    );
    
    array_unshift($bids_list, $new_bid);

    // Update auction price and bids
    update_post_meta($auction_id, 'auction_price', $new_bid_price);
    update_post_meta($auction_id, 'bids_list', $bids_list);

    // Check if time extension is needed
    $time_left = $due_timestamp - $now;
    $was_extended = false;
    
    if ($time_left <= 30) {
        $extended_time = date('Y-m-d H:i:s', $due_timestamp + 30);
        update_post_meta($auction_id, 'due_time', $extended_time);
        $was_extended = true;
        $due_time = $extended_time;
    }

    return new WP_REST_Response([
        'success' => true,
        'current_price' => $new_bid_price,
        'bids_list' => $bids_list,
        'due_time' => $due_time ?? $due_time,
        'was_extended' => $was_extended,
        'message' => $was_extended ? 
            'ბიდი წარმატებით განთავსდა და ქციონის დრო გაგრძელდა 30 წამით' : 
            'ბიდი წარმატებით განთავსდა'
    ], 200);
}

// Check auction author
function check_auction_author($auction_id, $user_id) {
    $post = get_post($auction_id);
    if (!$post) {
        return false;
    }
    
    error_log(sprintf(
        'Checking auction author - Auction ID: %d, User ID: %d, Author ID: %d',
        $auction_id,
        $user_id,
        $post->post_author
    ));
    
    return (int)$post->post_author === (int)$user_id;
}

// Extend auction REST API
add_filter('rest_prepare_auction', function($response, $post, $request) {
    $data = $response->get_data();
    
    $author_id = (int)$post->post_author;
    $data['author_data'] = array(
        'ID' => $author_id,
        'display_name' => get_the_author_meta('display_name', $author_id)
    );
    
    $data['post_author'] = $author_id;
    
    $response->set_data($data);
    
    return $response;
}, 10, 3);

// Extend auction time function
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
    
    error_log(sprintf(
        'Auction time extended - ID: %d, Old time: %s, New time: %s',
        $auction_id,
        $current_due_time,
        $new_due_time
    ));
    
    return $new_due_time;
}

// Add settings to frontend
add_action('wp_footer', function() {
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
}, 100);

/* react auth */

// ავტორიზაციის ჰენდლერი
add_action('wp_ajax_nopriv_custom_login', 'handle_custom_login');

function handle_custom_login() {
    $username = $_POST['username'];
    $password = $_POST['password'];
    
    $creds = array(
        'user_login'    => $username,
        'user_password' => $password,
        'remember'      => true
    );
 
    $user = wp_signon($creds, false);
 
    if (is_wp_error($user)) {
        wp_send_json_error(array(
            'message' => 'არასწორი მომხმარებელი ან პაროლი'
        ));
    }
 
    wp_set_current_user($user->ID);
    wp_set_auth_cookie($user->ID);
    
    wp_send_json_success(array(
        'message' => 'წარმატებული ავტორიზაცია'
    ));
}

// რეგისტრაციის ჰენდლერი
add_action('wp_ajax_nopriv_custom_register', 'handle_custom_register');

function handle_custom_register() {
    $username = sanitize_user($_POST['username']);
    $email = sanitize_email($_POST['email']);
    $password = $_POST['password'];
    $firstName = sanitize_text_field($_POST['firstName']);
    $lastName = sanitize_text_field($_POST['lastName']);
    $phone = sanitize_text_field($_POST['phone']);
    $personalNumber = sanitize_text_field($_POST['personalNumber']);

    if (username_exists($username)) {
        wp_send_json_error(array(
            'message' => 'მომხმარებლის სახელი დაკავებულია'
        ));
    }

    if (email_exists($email)) {
        wp_send_json_error(array(
            'message' => 'ელ-ფოსტა უკვე გამოყენებულია'
        ));
    }

    $user_id = wp_create_user($username, $password, $email);

    if (is_wp_error($user_id)) {
        wp_send_json_error(array(
            'message' => 'რეგისტრაცია ვერ მოხერხდა'
        ));
    }

    // დამატებითი ინფორმაციის შენახვა
    update_user_meta($user_id, 'first_name', $firstName);
    update_user_meta($user_id, 'last_name', $lastName);
    update_user_meta($user_id, 'phone', $phone);
    update_user_meta($user_id, 'personal_number', $personalNumber);

    // ვერიფიკაციის კოდის გენერაცია და გაგზავნა
    $verification_code = wp_rand(100000, 999999);
    update_user_meta($user_id, 'verification_code', $verification_code);

    $to = $email;
    $subject = 'ვერიფიკაციის კოდი';
    $message = "თქვენი ვერიფიკაციის კოდია: $verification_code";
    $headers = array('Content-Type: text/html; charset=UTF-8');

    wp_mail($to, $subject, $message, $headers);

    wp_send_json_success(array(
        'message' => 'რეგისტრაცია წარმატებით დასრულდა'
    ));
}

// ვერიფიკაციის ჰენდლერი
add_action('wp_ajax_nopriv_verify_code', 'handle_verification');

function handle_verification() {
    $email = sanitize_email($_POST['email']);
    $code = sanitize_text_field($_POST['code']);

    $user = get_user_by('email', $email);

    if (!$user) {
        wp_send_json_error(array(
            'message' => 'მომხმარებელი ვერ მოიძებნა'
        ));
    }

    $stored_code = get_user_meta($user->ID, 'verification_code', true);

    if ($code !== $stored_code) {
        wp_send_json_error(array(
            'message' => 'არასწორი კოდი'
        ));
    }

    update_user_meta($user->ID, 'email_verified', true);
    delete_user_meta($user->ID, 'verification_code');

    wp_send_json_success(array(
        'message' => 'ვერიფიკაცია წარმატებით დასრულდა'
    ));
}

// AJAX endpoint-ების დამატება WordPress-ის front-end-ზე
add_action('wp_enqueue_scripts', 'add_ajax_data');

function add_ajax_data() {
    wp_localize_script('wp-api', 'wpApiSettings', array(
        'root' => esc_url_raw(rest_url()),
        'nonce' => wp_create_nonce('wp_rest'),
        'ajaxurl' => admin_url('admin-ajax.php')
    ));
}

/* auction bid register */

add_action('rest_api_init', function () {
    register_rest_route('bidspace/v1', '/auction/(?P<id>\d+)/bid', array(
        'methods' => 'POST',
        'callback' => 'handle_place_bid',
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
});

add_action('rest_api_init', function () {
    register_rest_route('bidspace/v1', '/auction/(?P<id>\d+)/current-price', array(
        'methods' => 'GET',
        'callback' => function ($request) {
            $auction_id = $request['id'];
            $current_price = get_post_meta($auction_id, 'auction_price', true);
            
            return new WP_REST_Response([
                'price' => $current_price
            ], 200);
        },
        'permission_callback' => '__return_true'
    ));
});

// Add endpoint for saving final bid data
add_action('rest_api_init', function () {
    register_rest_route('bidspace/v1', '/auction/(?P<id>\d+)/end', array(
        'methods' => 'POST',
        'callback' => function ($request) {
            $auction_id = $request['id'];
            $params = $request->get_json_params();
            
            // Save final bid data as post meta
            update_post_meta($auction_id, 'last_bid_price', $params['last_bid_price']);
            update_post_meta($auction_id, 'last_bid_author', $params['last_bid_author']);
            update_post_meta($auction_id, 'last_bid_time', $params['last_bid_time']);
            update_post_meta($auction_id, 'last_bid_author_id', $params['last_bid_author_id']);
            
            // Optional: Update post status to 'completed' or similar
            wp_update_post(array(
                'ID' => $auction_id,
                'post_status' => 'completed'
            ));
            
            return new WP_REST_Response([
                'success' => true,
                'message' => 'Final bid data saved successfully'
            ], 200);
        },
        'permission_callback' => function() {
            return true; // ან შეგიძლიათ დაამატოთ უფრო მკაცრი შემოწმება
        }
    ));
});

/* comments for all users */

// Add comment capabilities for all users
function add_auction_comment_capabilities() {
    // Add capabilities to all roles
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

// Register meta fields with permissions for all users
function register_auction_meta_fields() {
    register_post_meta('auction', 'comments', array(
        'type' => 'object',
        'single' => true,
        'show_in_rest' => true,
        'auth_callback' => function() {
            return is_user_logged_in(); // Allow any logged-in user
        }
    ));
}
add_action('init', 'register_auction_meta_fields');

// REST API permissions for all logged-in users
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

// Register REST API endpoint for comments
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

    // Get existing comments
    $existing_comments = get_post_meta($auction_id, 'comments', true);
    if (!is_array($existing_comments)) {
        $existing_comments = array();
    }

    $comment_text = sanitize_textarea_field($request->get_param('comment_area'));
    
    // Create new comment
    $new_comment = array(
        'comment_author' => $user_id,
        'comment_author_name' => get_the_author_meta('display_name', $user_id),
        'comment_date' => current_time('mysql'),
        'comment_area' => $comment_text
    );
    
    // Add new comment to array
    $existing_comments[] = $new_comment;
    
    // Update post meta
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

// Add CORS headers if needed
function add_cors_headers() {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-WP-Nonce');
}
add_action('init', 'add_cors_headers');

// Add AJAX handler for auction search
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

// Add AJAX URL to page
function add_ajax_url_to_head() {
    ?>
    <script type="text/javascript">
        var ajaxurl = '<?php echo admin_url('admin-ajax.php'); ?>';
    </script>
    <?php
}
add_action('wp_head', 'add_ajax_url_to_head');

/* admin dashboard */

// Add rewrite rules for admin dashboard
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

// Register custom endpoint
function register_admin_dashboard_endpoint() {
    add_rewrite_endpoint('admin-dashboard', EP_ROOT);
}
add_action('init', 'register_admin_dashboard_endpoint');

// Template redirect for admin dashboard
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

// Flush rewrite rules on theme activation
function flush_admin_dashboard_rules() {
    add_admin_dashboard_rewrite_rules();
    flush_rewrite_rules();
}
add_action('after_switch_theme', 'flush_admin_dashboard_rules');