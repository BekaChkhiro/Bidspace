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

// Add auction capabilities to administrator role
function bidspace_add_auction_caps() {
    // Get the administrator role
    $admin = get_role('administrator');
    
    // Add auction capabilities
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
    $auction_price = get_post_meta($post->ID, 'auction_price', true);
    $start_time = get_post_meta($post->ID, 'start_time', true);
    $due_time = get_post_meta($post->ID, 'due_time', true);
    $buy_now = get_post_meta($post->ID, 'buy_now', true);
    $min_bid_price = get_post_meta($post->ID, 'min_bid_price', true);
    $price_limit = get_post_meta($post->ID, 'price_limit', true);
    $ticket_status = get_post_meta($post->ID, 'ticket_status', true);
    $bids_list = get_post_meta($post->ID, 'bids_list', true);
    $last_bid_price = get_post_meta($post->ID, 'last_bid_price', true);
    $last_bid_author = get_post_meta($post->ID, 'last_bid_author', true);
    $last_bid_time = get_post_meta($post->ID, 'last_bid_time', true);
    $last_bid_author_id = get_post_meta($post->ID, 'last_bid_author_id', true);
    $city = get_post_meta($post->ID, 'city', true);
    $skhva_qalaqebi = get_post_meta($post->ID, 'skhva_qalaqebi', true);
    $sazgvargaret = get_post_meta($post->ID, 'sazgvargaret', true);
    $ticket_price = get_post_meta($post->ID, 'ticket_price', true);
    $ticket_quantity = get_post_meta($post->ID, 'ticket_quantity', true);
    $start_date = get_post_meta($post->ID, 'start_date', true);
    $hall = get_post_meta($post->ID, 'hall', true);
    $row = get_post_meta($post->ID, 'row', true);
    $place = get_post_meta($post->ID, 'place', true);
    $sector = get_post_meta($post->ID, 'sector', true);
    $ticket_information = get_post_meta($post->ID, 'ticket_information', true);
    $comments_list = get_post_meta($post->ID, 'comments_list', true);
    $ticket_category = get_post_meta($post->ID, 'ticket_category', true);
    $phone_number = get_post_meta($post->ID, 'phone_number', true);
    $piradi_nomeri = get_post_meta($post->ID, 'piradi_nomeri', true);
    
    if (empty($ticket_status)) {
        $ticket_status = 'დაგეგმილი';
    }
    
    if (empty($bids_list)) {
        $bids_list = array();
    }
    
    if (empty($comments_list)) {
        $comments_list = array();
    }
    
    wp_nonce_field('save_auction_details', 'auction_details_nonce');
    ?>
    <div class="auction-meta-box">
        <div class="auction-tabs">
            <button type="button" class="tab-button active" onclick="openTab(event, 'auction-info')">Auction Info</button>
            <button type="button" class="tab-button" onclick="openTab(event, 'bids-list')">Bids List</button>
            <button type="button" class="tab-button" onclick="openTab(event, 'last-bid-info')">Last Bid Info</button>
            <button type="button" class="tab-button" onclick="openTab(event, 'ticket-info')">Ticket Info</button>
            <button type="button" class="tab-button" onclick="openTab(event, 'comments-tab')">Comments</button>
            <button type="button" class="tab-button" onclick="openTab(event, 'ticket-category-tab')">Ticket Category</button>
            <button type="button" class="tab-button" onclick="openTab(event, 'user-info')">User Info</button>
        </div>

        <div id="auction-info" class="tab-content" style="display: block;">
            <h3>Auction Info</h3>
            <p>
                <label for="auction_price">Auction Price:</label>
                <input type="number" id="auction_price" name="auction_price" 
                       value="<?php echo esc_attr($auction_price); ?>" class="widefat">
            </p>
            <p>
                <label for="start_time">Start Time:</label>
                <input type="datetime-local" id="start_time" name="start_time" 
                       value="<?php echo esc_attr($start_time); ?>" class="widefat">
            </p>
            <p>
                <label for="due_time">Due Time:</label>
                <input type="datetime-local" id="due_time" name="due_time" 
                       value="<?php echo esc_attr($due_time); ?>" class="widefat">
            </p>
            <p>
                <label for="buy_now">Buy Now Price:</label>
                <input type="number" id="buy_now" name="buy_now" 
                       value="<?php echo esc_attr($buy_now); ?>" class="widefat">
            </p>
            <p>
                <label for="min_bid_price">Min Bid Price:</label>
                <input type="number" id="min_bid_price" name="min_bid_price" 
                       value="<?php echo esc_attr($min_bid_price); ?>" class="widefat">
            </p>
            <p>
                <label for="price_limit">Price Limit:</label>
                <input type="number" id="price_limit" name="price_limit" 
                       value="<?php echo esc_attr($price_limit); ?>" class="widefat">
            </p>
            <p>
                <label for="ticket_status">Status:</label>
                <select name="ticket_status" id="ticket_status" class="widefat">
                    <option value="დაგეგმილი" <?php selected($ticket_status, 'დაგეგმილი'); ?>>დაგეგმილი</option>
                    <option value="აქტიური" <?php selected($ticket_status, 'აქტიური'); ?>>აქტიური</option>
                    <option value="დასრულებული" <?php selected($ticket_status, 'დასრულებული'); ?>>დასრულებული</option>
                </select>
            </p>
        </div>

        <div id="bids-list" class="tab-content">
            <h3>Bids List</h3>
            <div class="bids-list-container">
                <table class="widefat">
                    <thead>
                        <tr>
                            <th>Bid Price</th>
                            <th>Author</th>
                            <th>Time</th>
                            <th>Price Increase</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="bids-list-body">
                        <?php
                        if (!empty($bids_list)) {
                            foreach ($bids_list as $index => $bid) {
                                ?>
                                <tr>
                                    <td>
                                        <input type="number" 
                                               name="bids_list[<?php echo $index; ?>][bid_price]" 
                                               value="<?php echo esc_attr($bid['bid_price']); ?>" 
                                               class="widefat">
                                    </td>
                                    <td>
                                        <input type="text" 
                                               name="bids_list[<?php echo $index; ?>][bid_author]" 
                                               value="<?php echo esc_attr($bid['bid_author']); ?>" 
                                               class="widefat">
                                    </td>
                                    <td>
                                        <input type="datetime-local" 
                                               name="bids_list[<?php echo $index; ?>][bid_time]" 
                                               value="<?php echo esc_attr($bid['bid_time']); ?>" 
                                               class="widefat">
                                    </td>
                                    <td>
                                        <input type="number" 
                                               name="bids_list[<?php echo $index; ?>][price_increase]" 
                                               value="<?php echo esc_attr($bid['price_increase']); ?>" 
                                               class="widefat">
                                    </td>
                                    <td>
                                        <button type="button" class="button" onclick="removeBid(this)">Remove</button>
                                    </td>
                                </tr>
                                <?php
                            }
                        }
                        ?>
                    </tbody>
                </table>
                <p>
                    <button type="button" class="button" onclick="addNewBid()">Add New Bid</button>
                </p>
            </div>
        </div>

        <div id="last-bid-info" class="tab-content">
            <h3>Last Bid Information</h3>
            <p>
                <label for="last_bid_price">Last Bid Price:</label>
                <input type="text" id="last_bid_price" name="last_bid_price" 
                       value="<?php echo esc_attr($last_bid_price); ?>" class="widefat">
            </p>
            <p>
                <label for="last_bid_author">Last Bid Author:</label>
                <input type="text" id="last_bid_author" name="last_bid_author" 
                       value="<?php echo esc_attr($last_bid_author); ?>" class="widefat">
            </p>
            <p>
                <label for="last_bid_time">Last Bid Time:</label>
                <input type="text" id="last_bid_time" name="last_bid_time" 
                       value="<?php echo esc_attr($last_bid_time); ?>" class="widefat">
            </p>
            <p>
                <label for="last_bid_author_id">Last Bid Author ID:</label>
                <input type="text" id="last_bid_author_id" name="last_bid_author_id" 
                       value="<?php echo esc_attr($last_bid_author_id); ?>" class="widefat">
            </p>
        </div>

        <div id="ticket-info" class="tab-content">
            <h3>Ticket Information</h3>
            <p>
                <label for="city">City:</label>
                <select name="city" id="city" class="widefat">
                    <option value="tbilisi" <?php selected($city, 'tbilisi'); ?>>თბილისი</option>
                    <option value="batumi" <?php selected($city, 'batumi'); ?>>ბათუმი</option>
                    <option value="kutaisi" <?php selected($city, 'kutaisi'); ?>>ქუთაისი</option>
                    <option value="skhva_qalaqebi" <?php selected($city, 'skhva_qalaqebi'); ?>>სხვა ქალაქები</option>
                    <option value="sazgvargaret" <?php selected($city, 'sazgvargaret'); ?>>საზღვარგარეთ</option>
                </select>
            </p>
            <p>
                <label for="skhva_qalaqebi">სხვა ქალაქები:</label>
                <input type="text" id="skhva_qalaqebi" name="skhva_qalaqebi" 
                       value="<?php echo esc_attr($skhva_qalaqebi); ?>" class="widefat">
            </p>
            <p>
                <label for="sazgvargaret">საზღვარგარეთ:</label>
                <input type="text" id="sazgvargaret" name="sazgvargaret" 
                       value="<?php echo esc_attr($sazgvargaret); ?>" class="widefat">
            </p>
            <p>
                <label for="ticket_price">Ticket Price:</label>
                <input type="text" id="ticket_price" name="ticket_price" 
                       value="<?php echo esc_attr($ticket_price); ?>" class="widefat">
            </p>
            <p>
                <label for="ticket_quantity">Ticket Quantity:</label>
                <input type="text" id="ticket_quantity" name="ticket_quantity" 
                       value="<?php echo esc_attr($ticket_quantity); ?>" class="widefat">
            </p>
            <p>
                <label for="start_date">Start Date:</label>
                <input type="datetime-local" id="start_date" name="start_date" 
                       value="<?php echo esc_attr($start_date); ?>" class="widefat">
            </p>
            <p>
                <label for="hall">Hall:</label>
                <input type="text" id="hall" name="hall" 
                       value="<?php echo esc_attr($hall); ?>" class="widefat">
            </p>
            <p>
                <label for="row">Row:</label>
                <input type="text" id="row" name="row" 
                       value="<?php echo esc_attr($row); ?>" class="widefat">
            </p>
            <p>
                <label for="place">Place:</label>
                <input type="text" id="place" name="place" 
                       value="<?php echo esc_attr($place); ?>" class="widefat">
            </p>
            <p>
                <label for="sector">Sector:</label>
                <input type="text" id="sector" name="sector" 
                       value="<?php echo esc_attr($sector); ?>" class="widefat">
            </p>
            <p>
                <label for="ticket_information">Ticket Information:</label>
                <textarea id="ticket_information" name="ticket_information" class="widefat" rows="5"><?php echo esc_textarea($ticket_information); ?></textarea>
            </p>
        </div>

        <div id="ticket-category-tab" class="tab-content">
            <h3>Ticket Category</h3>
            <p>
                <label for="ticket_category">Category:</label>
                <select name="ticket_category" id="ticket_category" class="widefat">
                    <option value="თეატრი-კინო" <?php selected($ticket_category, 'თეატრი-კინო'); ?>>თეატრი-კინო</option>
                    <option value="ივენთები" <?php selected($ticket_category, 'ივენთები'); ?>>ივენთები</option>
                    <option value="სპორტი" <?php selected($ticket_category, 'სპორტი'); ?>>სპორტი</option>
                    <option value="მოგზაურობა" <?php selected($ticket_category, 'მოგზაურობა'); ?>>მოგზაურობა</option>
                </select>
            </p>
        </div>

        <div id="comments-tab" class="tab-content">
            <h3>Comments</h3>
            <div class="comments-container">
                <table class="widefat">
                    <thead>
                        <tr>
                            <th>Author</th>
                            <th>Author Name</th>
                            <th>Date</th>
                            <th>Comment</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="comments-list-body">
                        <?php
                        if (!empty($comments_list)) {
                            foreach ($comments_list as $index => $comment) {
                                ?>
                                <tr>
                                    <td>
                                        <input type="text" 
                                               name="comments_list[<?php echo $index; ?>][comment_author]" 
                                               value="<?php echo esc_attr($comment['comment_author']); ?>" 
                                               class="widefat">
                                    </td>
                                    <td>
                                        <input type="text" 
                                               name="comments_list[<?php echo $index; ?>][comment_author_name]" 
                                               value="<?php echo esc_attr($comment['comment_author_name']); ?>" 
                                               class="widefat">
                                    </td>
                                    <td>
                                        <input type="text" 
                                               name="comments_list[<?php echo $index; ?>][comment_date]" 
                                               value="<?php echo esc_attr($comment['comment_date']); ?>" 
                                               class="widefat">
                                    </td>
                                    <td>
                                        <textarea name="comments_list[<?php echo $index; ?>][comment_area]" 
                                                  class="widefat" rows="3"><?php echo esc_textarea($comment['comment_area']); ?></textarea>
                                    </td>
                                    <td>
                                        <button type="button" class="button" onclick="removeComment(this)">Remove</button>
                                    </td>
                                </tr>
                                <?php
                            }
                        }
                        ?>
                    </tbody>
                </table>
                <p>
                    <button type="button" class="button" onclick="addNewComment()">Add New Comment</button>
                </p>
            </div>
        </div>

        <div id="user-info" class="tab-content">
            <h3>User Information</h3>
            <p>
                <label for="phone_number">Phone Number:</label>
                <input type="text" id="phone_number" name="phone_number" 
                       value="<?php echo esc_attr($phone_number); ?>" class="widefat">
            </p>
            <p>
                <label for="piradi_nomeri">Personal ID Number:</label>
                <input type="text" id="piradi_nomeri" name="piradi_nomeri" 
                       value="<?php echo esc_attr($piradi_nomeri); ?>" class="widefat">
            </p>
        </div>
    </div>

    <style>
    .auction-tabs {
        margin-bottom: 20px;
    }
    .tab-button {
        background-color: #f1f1f1;
        border: none;
        padding: 10px 20px;
        cursor: pointer;
    }
    .tab-button.active {
        background-color: #ffffff;
        border: 1px solid #ccc;
        border-bottom: none;
    }
    .tab-content {
        display: none;
        padding: 20px;
        border: 1px solid #ccc;
    }
    </style>

    <script>
    function openTab(evt, tabName) {
        var i, tabcontent, tabbuttons;
        
        tabcontent = document.getElementsByClassName("tab-content");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }
        
        tabbuttons = document.getElementsByClassName("tab-button");
        for (i = 0; i < tabbuttons.length; i++) {
            tabbuttons[i].className = tabbuttons[i].className.replace(" active", "");
        }
        
        document.getElementById(tabName).style.display = "block";
        evt.currentTarget.className += " active";
    }

    function addNewBid() {
        var tbody = document.getElementById('bids-list-body');
        var rowCount = tbody.getElementsByTagName('tr').length;
        var newRow = document.createElement('tr');
        
        newRow.innerHTML = `
            <td>
                <input type="number" name="bids_list[${rowCount}][bid_price]" class="widefat">
            </td>
            <td>
                <input type="text" name="bids_list[${rowCount}][bid_author]" class="widefat">
            </td>
            <td>
                <input type="datetime-local" name="bids_list[${rowCount}][bid_time]" class="widefat">
            </td>
            <td>
                <input type="number" name="bids_list[${rowCount}][price_increase]" class="widefat">
            </td>
            <td>
                <button type="button" class="button" onclick="removeBid(this)">Remove</button>
            </td>
        `;
        
        tbody.appendChild(newRow);
    }

    function removeBid(button) {
        var row = button.parentNode.parentNode;
        row.parentNode.removeChild(row);
    }

    function addNewComment() {
        var tbody = document.getElementById('comments-list-body');
        var rowCount = tbody.getElementsByTagName('tr').length;
        var newRow = document.createElement('tr');
        
        newRow.innerHTML = `
            <td>
                <input type="text" name="comments_list[${rowCount}][comment_author]" class="widefat">
            </td>
            <td>
                <input type="text" name="comments_list[${rowCount}][comment_author_name]" class="widefat">
            </td>
            <td>
                <input type="text" name="comments_list[${rowCount}][comment_date]" class="widefat">
            </td>
            <td>
                <textarea name="comments_list[${rowCount}][comment_area]" class="widefat" rows="3"></textarea>
            </td>
            <td>
                <button type="button" class="button" onclick="removeComment(this)">Remove</button>
            </td>
        `;
        
        tbody.appendChild(newRow);
    }

    function removeComment(button) {
        var row = button.parentNode.parentNode;
        row.parentNode.removeChild(row);
    }
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
        'piradi_nomeri'
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

    // Get all registered meta keys
    $registered_meta = get_registered_meta_keys('post', 'auction');
    
    foreach ($registered_meta as $meta_key => $meta_value) {
        // Add meta value to response if it exists
        $meta_data = get_post_meta($post->ID, $meta_key, true);
        if ($meta_data) {
            $response->data['meta'][$meta_key] = $meta_data;
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
    if (!is_admin() && $query->is_main_query() && is_post_type_archive('auction')) {
        $meta_query = array('relation' => 'AND');

        // Fix auction price filter
        if (isset($_GET['auctionPriceMin']) && isset($_GET['auctionPriceMax'])) {
            $meta_query[] = array(
                'relation' => 'AND',
                array(
                    'key' => 'auction_price',
                    'value' => (int)$_GET['auctionPriceMin'],
                    'type' => 'NUMERIC',
                    'compare' => '>='
                ),
                array(
                    'key' => 'auction_price',
                    'value' => (int)$_GET['auctionPriceMax'],
                    'type' => 'NUMERIC',
                    'compare' => '<='
                )
            );
        } elseif (isset($_GET['auctionPriceMin'])) {
            $meta_query[] = array(
                'key' => 'auction_price',
                'value' => (int)$_GET['auctionPriceMin'],
                'type' => 'NUMERIC',
                'compare' => '>='
            );
        } elseif (isset($_GET['auctionPriceMax'])) {
            $meta_query[] = array(
                'key' => 'auction_price',
                'value' => (int)$_GET['auctionPriceMax'],
                'type' => 'NUMERIC',
                'compare' => '<='
            );
        }

        // Keep existing buy now filter
        if (isset($_GET['buyNowMin']) && isset($_GET['buyNowMax'])) {
            $meta_query[] = array(
                'relation' => 'AND',
                array(
                    'key' => 'buy_now',
                    'value' => (int)$_GET['buyNowMin'],
                    'type' => 'NUMERIC',
                    'compare' => '>='
                ),
                array(
                    'key' => 'buy_now',
                    'value' => (int)$_GET['buyNowMax'],
                    'type' => 'NUMERIC',
                    'compare' => '<='
                )
            );
        } elseif (isset($_GET['buyNowMin'])) {
            $meta_query[] = array(
                'key' => 'buy_now',
                'value' => (int)$_GET['buyNowMin'],
                'type' => 'NUMERIC',
                'compare' => '>='
            );
        } elseif (isset($_GET['buyNowMax'])) {
            $meta_query[] = array(
                'key' => 'buy_now',
                'value' => (int)$_GET['buyNowMax'],
                'type' => 'NUMERIC',
                'compare' => '<='
            );
        }

        $query->set('meta_query', $meta_query);
    }
}
add_action('pre_get_posts', 'bidspace_filter_auctions');