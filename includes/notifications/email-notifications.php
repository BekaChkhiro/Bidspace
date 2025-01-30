<?php
/**
 * Email Notifications Functions
 */

function send_auction_winner_notification($auction_id, $winner_id) {
    // Get auction and winner details
    $auction = get_post($auction_id);
    $winner = get_user_by('id', $winner_id);
    
    if (!$auction || !$winner) {
        return false;
    }

    $auction_title = $auction->post_title;
    $auction_link = get_permalink($auction_id);
    $winner_email = $winner->user_email;
    $winner_name = $winner->display_name;

    // Email subject
    $subject = sprintf('გილოცავთ! თქვენ მოიგეთ აუქციონი: %s', $auction_title);

    // Email message
    $message = sprintf(
        'ძვირფასო %s,

გილოცავთ! თქვენ მოიგეთ აუქციონი: "%s"

აუქციონის დეტალების სანახავად გადადით ბმულზე:
%s

მადლობა, რომ სარგებლობთ ჩვენი სერვისით.

პატივისცემით,
Bidspace გუნდი',
        $winner_name,
        $auction_title,
        $auction_link
    );

    // Email headers
    $headers = array(
        'Content-Type: text/plain; charset=UTF-8',
        'From: Bidspace <noreply@bidspace.ge>'
    );

    // Send email
    return wp_mail($winner_email, $subject, $message, $headers);
}

// Function to check if auction has ended and notify winner
function check_auction_end_and_notify($auction_id) {
    // Get auction end time
    $due_time = get_post_meta($auction_id, 'due_time', true);
    
    if (!$due_time) {
        return false;
    }

    $now = current_time('timestamp');
    $due_timestamp = strtotime($due_time);

    // If auction has ended
    if ($now > $due_timestamp) {
        // Get the last bid (winner)
        $bids_list = get_post_meta($auction_id, 'bids_list', true);
        
        if (!empty($bids_list) && is_array($bids_list)) {
            $winner_bid = $bids_list[0]; // First bid is the latest
            $winner_id = $winner_bid['bid_author'];

            // Send notification to winner
            send_auction_winner_notification($auction_id, $winner_id);
            
            // Mark notification as sent to prevent duplicate emails
            update_post_meta($auction_id, 'winner_notified', true);
            
            return true;
        }
    }

    return false;
}
