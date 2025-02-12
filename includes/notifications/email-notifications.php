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
        $winning_bid = current($bids_list); // Get the first/latest bid
    }

    $winning_amount = $winning_bid ? $winning_bid['bid_price'] : get_post_meta($auction_id, 'last_bid_price', true);

    // Email subject
    $subject = sprintf('გილოცავთ! თქვენ მოიგეთ აუქციონი: %s', $auction_title);

    // Email message
    $message = sprintf(
        'ძვირფასო %s,

გილოცავთ! თქვენ მოიგეთ აუქციონი: "%s"

აუქციონის დეტალები:
- მოგებული თანხა: %s ₾
- აუქციონის ბმული: %s

გთხოვთ, დაუკავშირდით გამყიდველს დეტალების დასაზუსტებლად.

პატივისცემით,
Bidspace გუნდი',
        $winner_name,
        $auction_title,
        number_format($winning_amount, 2),
        $auction_link
    );

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
