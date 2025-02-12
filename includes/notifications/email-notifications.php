<?php
/**
 * Email Notifications Functions
 */

function send_auction_winner_notification($auction_id, $winner_id) {
    // Get auction and winner details
    $auction = get_post($auction_id);
    $winner = get_user_by('id', $winner_id);
    
    if (!$auction || !$winner) {
        error_log("Failed to send winner notification - auction or winner not found. Auction ID: $auction_id, Winner ID: $winner_id");
        return false;
    }

    $auction_title = $auction->post_title;
    $auction_link = get_permalink($auction_id);
    $winner_email = $winner->user_email;
    $winner_name = $winner->display_name;

    // Get winning bid details
    $bids_list = get_post_meta($auction_id, 'bids_list', true);
    $winning_bid = null;
    
    if (is_array($bids_list) && !empty($bids_list)) {
        $winning_bid = current($bids_list);
    }

    $winning_amount = $winning_bid ? $winning_bid['bid_price'] : get_post_meta($auction_id, 'last_bid_price', true);
    
    // Get auction image
    $featured_image_url = get_the_post_thumbnail_url($auction_id, 'large');
    if (!$featured_image_url) {
        $featured_image_url = get_template_directory_uri() . '/src/assets/images/default-auction.jpg';
    }

    // Email subject
    $subject = sprintf('🎉 გილოცავთ! თქვენ მოიგეთ აუქციონი: %s', $auction_title);

    // HTML Email template
    $message = '
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333333;
                margin: 0;
                padding: 0;
            }
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
            }
            .email-header {
                background-color: #00AEEF;
                color: #ffffff;
                text-align: center;
                padding: 20px;
            }
            .email-body {
                padding: 30px;
                background-color: #f9f9f9;
            }
            .auction-card {
                background-color: #ffffff;
                border-radius: 10px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                padding: 20px;
                margin: 20px 0;
            }
            .auction-image {
                width: 100%;
                max-height: 300px;
                object-fit: cover;
                border-radius: 5px;
                margin-bottom: 15px;
            }
            .auction-details {
                margin: 15px 0;
                padding: 15px;
                background-color: #f5f5f5;
                border-radius: 5px;
            }
            .button {
                display: inline-block;
                padding: 12px 25px;
                background-color: #00AEEF;
                color: #ffffff;
                text-decoration: none;
                border-radius: 5px;
                margin: 15px 0;
            }
            .footer {
                text-align: center;
                padding: 20px;
                background-color: #333333;
                color: #ffffff;
            }
            .price {
                font-size: 24px;
                color: #00AEEF;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="email-header">
                <h1>🎉 გილოცავთ!</h1>
            </div>
            <div class="email-body">
                <h2>ძვირფასო ' . esc_html($winner_name) . ',</h2>
                <p>გილოცავთ! თქვენ წარმატებით მოიგეთ აუქციონი:</p>
                
                <div class="auction-card">
                    <img src="' . esc_url($featured_image_url) . '" alt="' . esc_attr($auction_title) . '" class="auction-image">
                    <h3>' . esc_html($auction_title) . '</h3>
                    
                    <div class="auction-details">
                        <p><strong>მოგებული თანხა:</strong> <span class="price">' . number_format($winning_amount, 2) . ' ₾</span></p>
                        <p><strong>აუქციონის დასრულების დრო:</strong> ' . date_i18n('d F Y, H:i', strtotime(get_post_meta($auction_id, 'due_time', true))) . '</p>
                    </div>

                    <a href="' . esc_url($auction_link) . '" class="button">ნახეთ აუქციონის დეტალები</a>
                </div>

                <p><strong>შემდეგი ნაბიჯები:</strong></p>
                <ol>
                    <li>გადადით აუქციონის გვერდზე ზემოთ მოცემული ღილაკით</li>
                    <li>დაუკავშირდით გამყიდველს დეტალების დასაზუსტებლად</li>
                    <li>მოილაპარაკეთ მიწოდების დეტალებზე</li>
                </ol>
            </div>
            
            <div class="footer">
                <p>პატივისცემით,<br>Bidspace გუნდი</p>
                <p><small>თუ გაქვთ კითხვები, დაგვიკავშირდით: support@bidspace.ge</small></p>
            </div>
        </div>
    </body>
    </html>';

    // Email headers
    $headers = array(
        'Content-Type: text/html; charset=UTF-8',
        'From: Bidspace <noreply@bidspace.ge>'
    );

    // Log before sending
    error_log("Attempting to send winner notification email to: $winner_email");

    // Send email
    $sent = wp_mail($winner_email, $subject, $message, $headers);
    
    if ($sent) {
        error_log("Successfully sent winner notification email to: $winner_email");
        update_post_meta($auction_id, 'winner_notified', true);
        update_post_meta($auction_id, 'winner_notification_sent_at', current_time('mysql'));
    } else {
        error_log("Failed to send winner notification email to: $winner_email");
    }

    return $sent;
}

// Function to check if auction has ended and notify winner
function check_auction_end_and_notify($auction_id) {
    // Get auction end time
    $due_time = get_post_meta($auction_id, 'due_time', true);
    
    if (!$due_time) {
        error_log("No due time found for auction: $auction_id");
        return false;
    }

    $now = current_time('timestamp');
    $due_timestamp = strtotime($due_time);

    // If auction has ended
    if ($now > $due_timestamp) {
        // Check if notification was already sent
        $notification_sent = get_post_meta($auction_id, 'winner_notified', true);
        if ($notification_sent) {
            error_log("Winner notification already sent for auction: $auction_id");
            return true;
        }

        // Get the last bid (winner)
        $bids_list = get_post_meta($auction_id, 'bids_list', true);
        
        if (!empty($bids_list) && is_array($bids_list)) {
            $winner_bid = current($bids_list); // Get the first/latest bid
            if ($winner_bid && isset($winner_bid['bid_author'])) {
                $winner_id = $winner_bid['bid_author'];

                // Send notification to winner
                $result = send_auction_winner_notification($auction_id, $winner_id);
                
                if ($result) {
                    error_log("Winner notification sent successfully for auction: $auction_id");
                    return true;
                } else {
                    error_log("Failed to send winner notification for auction: $auction_id");
                }
            } else {
                error_log("No valid winner bid found for auction: $auction_id");
            }
        } else {
            error_log("No bids found for auction: $auction_id");
        }
    } else {
        error_log("Auction has not ended yet: $auction_id");
    }

    return false;
}

// Test function for email notification
function test_auction_winner_email($auction_id = null) {
    if (!current_user_can('administrator')) {
        return new WP_Error('permission_denied', 'Only administrators can test emails');
    }

    if (!$auction_id) {
        // Get the most recent auction
        $auctions = get_posts(array(
            'post_type' => 'auction',
            'posts_per_page' => 1,
            'orderby' => 'date',
            'order' => 'DESC'
        ));

        if (empty($auctions)) {
            return new WP_Error('no_auction', 'No auctions found');
        }

        $auction_id = $auctions[0]->ID;
    }

    $current_user_id = get_current_user_id();
    return send_auction_winner_notification($auction_id, $current_user_id);
}

// Add test endpoint for administrators
add_action('rest_api_init', function() {
    register_rest_route('bidspace/v1', '/test-winner-email', array(
        'methods' => 'POST',
        'callback' => function($request) {
            $auction_id = $request->get_param('auction_id');
            return test_auction_winner_email($auction_id);
        },
        'permission_callback' => function() {
            return current_user_can('administrator');
        }
    ));
});
