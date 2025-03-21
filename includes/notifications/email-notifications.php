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
    // Generate absolute URL for auction
    $auction_link = 'https://bidspace.webin.ge/auction/' . $auction_id;
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

    // Get additional ticket details
    $sector = get_post_meta($auction_id, 'sector', true);
    $row = get_post_meta($auction_id, 'row', true);
    $place = get_post_meta($auction_id, 'place', true);
    $hall = get_post_meta($auction_id, 'hall', true);
    $ticket_information = get_post_meta($auction_id, 'ticket_information', true);

    // Get seller info
    $seller = get_user_by('id', $auction->post_author);
    $seller_phone = get_user_meta($seller->ID, 'phone', true);
    $seller_email = $seller->user_email;
    $seller_name = $seller->display_name;

    // Get payment status
    $payment_status = get_post_meta($auction_id, 'payment_status', true) ?: 'pending';
    
    // Generate QR code URL using Google Charts API
    $qr_code_url = 'https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=' . urlencode($auction_link);

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
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                line-height: 1.6;
                color: #333333;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
            }
            .email-container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 15px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .email-header {
                background: linear-gradient(135deg, #00AEEF 0%, #0096CC 100%);
                color: #ffffff;
                text-align: center;
                padding: 30px 20px;
                position: relative;
            }
            .email-header h1 {
                margin: 0;
                font-size: 32px;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .email-header .confetti {
                position: absolute;
                top: 10px;
                left: 20px;
                font-size: 40px;
            }
            .email-body {
                padding: 40px 30px;
                background-color: #ffffff;
            }
            .winner-name {
                color: #00AEEF;
                font-size: 24px;
                margin: 0 0 20px 0;
            }
            .auction-card {
                background-color: #ffffff;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                padding: 25px;
                margin: 25px 0;
                border: 1px solid #eaeaea;
            }
            .auction-image {
                width: 100%;
                height: 300px;
                object-fit: cover;
                border-radius: 8px;
                margin-bottom: 20px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .auction-title {
                font-size: 22px;
                color: #333;
                margin: 0 0 20px 0;
                padding-bottom: 15px;
                border-bottom: 2px solid #f0f0f0;
            }
            .auction-details {
                margin: 20px 0;
                padding: 20px;
                background: linear-gradient(145deg, #f9f9f9 0%, #f3f3f3 100%);
                border-radius: 10px;
                border-left: 4px solid #00AEEF;
            }
            .price-tag {
                display: inline-block;
                font-size: 28px;
                color: #00AEEF;
                font-weight: bold;
                background: rgba(0, 174, 239, 0.1);
                padding: 10px 20px;
                border-radius: 50px;
                margin: 10px 0;
            }
            .button {
                display: inline-block;
                padding: 15px 30px;
                background: linear-gradient(135deg, #00AEEF 0%, #0096CC 100%);
                color: #ffffff;
                text-decoration: none;
                border-radius: 50px;
                margin: 20px 0;
                font-weight: bold;
                text-align: center;
                box-shadow: 0 4px 6px rgba(0, 174, 239, 0.2);
                transition: transform 0.2s ease;
            }
            .button:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 8px rgba(0, 174, 239, 0.3);
            }
            .steps-container {
                background-color: #f8f9fa;
                border-radius: 10px;
                padding: 20px;
                margin: 25px 0;
            }
            .step-item {
                display: flex;
                align-items: flex-start;
                margin: 15px 0;
                padding: 10px;
                background-color: #fff;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }
            .step-number {
                background-color: #00AEEF;
                color: white;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 12px;
                flex-shrink: 0;
            }
            .step-text {
                flex: 1;
                margin: 0;
            }
            .footer {
                text-align: center;
                padding: 30px 20px;
                background: #2C3E50;
                color: #ffffff;
            }
            .footer p {
                margin: 5px 0;
            }
            .support-text {
                font-size: 14px;
                color: rgba(255, 255, 255, 0.8);
                margin-top: 15px;
            }
            .social-links {
                margin: 20px 0;
            }
            .social-link {
                display: inline-block;
                margin: 0 10px;
                color: #ffffff;
                text-decoration: none;
            }
            .divider {
                height: 2px;
                background: rgba(255, 255, 255, 0.1);
                margin: 20px 0;
            }
            .ticket-details {
                background: #fff;
                border: 2px dashed #00AEEF;
                border-radius: 12px;
                padding: 20px;
                margin: 20px 0;
            }
            .ticket-info-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
                margin-top: 15px;
            }
            .ticket-info-item {
                background: #f8f9fa;
                padding: 12px;
                border-radius: 8px;
            }
            .ticket-info-label {
                color: #666;
                font-size: 14px;
                margin-bottom: 5px;
            }
            .ticket-info-value {
                color: #333;
                font-weight: 500;
                font-size: 16px;
            }
            .seller-info {
                background: linear-gradient(145deg, #f9f9f9 0%, #f3f3f3 100%);
                border-radius: 10px;
                padding: 20px;
                margin: 20px 0;
                border-left: 4px solid #2C3E50;
            }
            .seller-info h4 {
                color: #2C3E50;
                margin: 0 0 15px 0;
            }
            .contact-item {
                display: flex;
                align-items: center;
                margin: 10px 0;
            }
            .contact-icon {
                margin-right: 10px;
                color: #00AEEF;
                font-size: 18px;
            }
            .qr-container {
                text-align: center;
                margin: 30px 0;
                padding: 20px;
                background: #fff;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            }
            .qr-code {
                width: 200px;
                height: 200px;
                margin: 10px auto;
            }
            .qr-text {
                color: #666;
                font-size: 14px;
                margin-top: 10px;
            }
            .payment-status {
                display: inline-block;
                padding: 8px 16px;
                border-radius: 20px;
                font-weight: 500;
                font-size: 14px;
                text-transform: uppercase;
                margin: 10px 0;
            }
            .payment-status.pending {
                background-color: #fff3cd;
                color: #856404;
                border: 1px solid #ffeeba;
            }
            .payment-status.completed {
                background-color: #d4edda;
                color: #155724;
                border: 1px solid #c3e6cb;
            }
            .payment-status.failed {
                background-color: #f8d7da;
                color: #721c24;
                border: 1px solid #f5c6cb;
            }
            .info-box {
                background-color: #e7f5ff;
                border-left: 4px solid #00AEEF;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
            }
            .policy-section {
                background: #f8f9fa;
                border-radius: 12px;
                padding: 20px;
                margin: 20px 0;
                border: 1px solid #e9ecef;
            }
            .policy-item {
                display: flex;
                align-items: flex-start;
                margin: 12px 0;
                padding: 10px;
                background: #fff;
                border-radius: 8px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            }
            .policy-icon {
                flex-shrink: 0;
                width: 24px;
                height: 24px;
                margin-right: 12px;
                text-align: center;
            }
            .safety-tips {
                background: linear-gradient(145deg, #fff5f5 0%, #fff0f0 100%);
                border-radius: 12px;
                padding: 20px;
                margin: 20px 0;
                border-left: 4px solid #dc3545;
            }
            .safety-tip {
                margin: 10px 0;
                padding: 8px;
                background: rgba(255,255,255,0.7);
                border-radius: 6px;
            }
            .support-card {
                background: linear-gradient(135deg, #00AEEF 0%, #0096CC 100%);
                color: white;
                padding: 20px;
                border-radius: 12px;
                margin: 20px 0;
                text-align: center;
            }
            .support-card a {
                color: white;
                text-decoration: underline;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="email-header">
                <span class="confetti">🎉</span>
                <h1>გილოცავთ!</h1>
                <span class="confetti" style="right: 20px; left: auto;">🎊</span>
            </div>
            <div class="email-body">
                <h2 class="winner-name">ძვირფასო ' . esc_html($winner_name) . '</h2>
                <p style="font-size: 18px;">თქვენ წარმატებით მოიგეთ აუქციონი!</p>
                
                <div class="auction-card">
                    <img src="' . esc_url($featured_image_url) . '" alt="' . esc_attr($auction_title) . '" class="auction-image">
                    <h3 class="auction-title">' . esc_html($auction_title) . '</h3>
                    
                    <div class="auction-details">
                        <div style="margin-bottom: 15px;">
                            <strong style="display: block; margin-bottom: 5px;">მოგებული თანხა:</strong>
                            <span class="price-tag">' . number_format($winning_amount, 2) . ' ₾</span>
                        </div>
                        <div>
                            <strong style="display: block; margin-bottom: 5px;">აუქციონის დასრულების დრო:</strong>
                            <span style="font-size: 16px;">' . date_i18n('d F Y, H:i', strtotime(get_post_meta($auction_id, 'due_time', true))) . '</span>
                        </div>
                    </div>

                    <div style="text-align: center;">
                        <a href="' . esc_url($auction_link) . '" class="button">
                            ნახეთ აუქციონის დეტალები →
                        </a>
                    </div>
                </div>

                <div class="qr-container">
                    <h4 style="margin-top: 0; color: #2C3E50;">სწრაფი წვდომა</h4>
                    <img src="' . esc_url($qr_code_url) . '" alt="აუქციონის QR კოდი" class="qr-code">
                    <p class="qr-text">დაასკანერეთ QR კოდი აუქციონის გვერდზე გადასასვლელად</p>
                </div>

                <div class="info-box">
                    <strong>გადახდის სტატუსი:</strong>
                    <div class="payment-status ' . esc_attr($payment_status) . '">
                        ' . esc_html(($payment_status === 'completed' ? 'გადახდილია' : 
                            ($payment_status === 'failed' ? 'გადახდა ვერ მოხერხდა' : 'გადახდის მოლოდინში'))) . '
                    </div>
                    <p style="margin: 10px 0 0 0; font-size: 14px;">
                        ' . ($payment_status === 'pending' ? 
                            'გთხოვთ გადახადოთ მოგებული აუქციონის თანხა 24 საათის განმავლობაში' : 
                            ($payment_status === 'failed' ? 
                                'გთხოვთ სცადოთ გადახდა თავიდან ან დაგვიკავშირდით' : 
                                'გადახდა წარმატებით განხორციელდა')) . '
                    </p>
                </div>

                <div class="ticket-details">
                    <h4 style="margin-top: 0; color: #00AEEF;">ბილეთის დეტალები:</h4>
                    <div class="ticket-info-grid">
                        ' . ($sector ? '
                        <div class="ticket-info-item">
                            <div class="ticket-info-label">სექტორი:</div>
                            <div class="ticket-info-value">' . esc_html($sector) . '</div>
                        </div>' : '') . '
                        
                        ' . ($row ? '
                        <div class="ticket-info-item">
                            <div class="ticket-info-label">რიგი:</div>
                            <div class="ticket-info-value">' . esc_html($row) . '</div>
                        </div>' : '') . '
                        
                        ' . ($place ? '
                        <div class="ticket-info-item">
                            <div class="ticket-info-label">ადგილი:</div>
                            <div class="ticket-info-value">' . esc_html($place) . '</div>
                        </div>' : '') . '
                        
                        ' . ($hall ? '
                        <div class="ticket-info-item">
                            <div class="ticket-info-label">დარბაზი:</div>
                            <div class="ticket-info-value">' . esc_html($hall) . '</div>
                        </div>' : '') . '
                    </div>
                    ' . ($ticket_information ? '
                    <div style="margin-top: 15px;">
                        <div class="ticket-info-label">დამატებითი ინფორმაცია:</div>
                        <div class="ticket-info-value">' . nl2br(esc_html($ticket_information)) . '</div>
                    </div>' : '') . '
                </div>

                <div class="seller-info">
                    <h4>გამყიდველის საკონტაქტო ინფორმაცია:</h4>
                    <div class="contact-item">
                        <span class="contact-icon">👤</span>
                        <span>' . esc_html($seller_name) . '</span>
                    </div>
                    ' . ($seller_phone ? '
                    <div class="contact-item">
                        <span class="contact-icon">📞</span>
                        <span>' . esc_html($seller_phone) . '</span>
                    </div>' : '') . '
                    <div class="contact-item">
                        <span class="contact-icon">✉️</span>
                        <span>' . esc_html($seller_email) . '</span>
                    </div>
                </div>

                <div class="policy-section">
                    <h4 style="margin-top: 0; color: #2C3E50;">ბილეთის გაცვლის პოლიტიკა:</h4>
                    <div class="policy-item">
                        <span class="policy-icon">📅</span>
                        <div>
                            <strong>ვადა:</strong>
                            <p style="margin: 5px 0;">ბილეთის გაცვლა ან დაბრუნება შესაძლებელია ღონისძიებამდე 48 საათით ადრე</p>
                        </div>
                    </div>
                    <div class="policy-item">
                        <span class="policy-icon">💰</span>
                        <div>
                            <strong>თანხის დაბრუნება:</strong>
                            <p style="margin: 5px 0;">ბილეთის ღირებულების 100% უბრუნდება მომხმარებელს პირველი 24 საათის განმავლობაში</p>
                        </div>
                    </div>
                    <div class="policy-item">
                        <span class="policy-icon">🔄</span>
                        <div>
                            <strong>გაცვლის პროცედურა:</strong>
                            <p style="margin: 5px 0;">დაგვიკავშირდით support@bidspace.ge-ზე ბილეთის გაცვლის ან დაბრუნების მოთხოვნისთვის</p>
                        </div>
                    </div>
                </div>

                <div class="safety-tips">
                    <h4 style="margin-top: 0; color: #dc3545;">უსაფრთხოების რჩევები:</h4>
                    <div class="safety-tip">
                        <strong>🔒 გადახდის უსაფრთხოება:</strong>
                        <p style="margin: 5px 0;">გამოიყენეთ მხოლოდ Bidspace-ის ოფიციალური გადახდის სისტემა</p>
                    </div>
                    <div class="safety-tip">
                        <strong>✉️ კომუნიკაცია:</strong>
                        <p style="margin: 5px 0;">ნუ გააზიარებთ პირად ინფორმაციას პლატფორმის გარეთ</p>
                    </div>
                    <div class="safety-tip">
                        <strong>⚠️ გაფრთხილება:</strong>
                        <p style="margin: 5px 0;">მოერიდეთ პლატფორმის გარეთ გარიგებების დადებას</p>
                    </div>
                </div>

                <div class="support-card">
                    <h4 style="margin-top: 0;">დაგჭირდათ დახმარება?</h4>
                    <p style="margin: 10px 0;">ჩვენი მხარდაჭერის გუნდი მზადაა დაგეხმაროთ 24/7</p>
                    <div style="margin-top: 15px;">
                        <a href="tel:+995322000000" style="margin: 0 10px;">📞 032 2 000 000</a>
                        <a href="mailto:support@bidspace.ge" style="margin: 0 10px;">✉️ support@bidspace.ge</a>
                    </div>
                </div>

                <div class="steps-container">
                    <h4 style="margin-top: 0; color: #2C3E50;">შემდეგი ნაბიჯები:</h4>
                    <div class="step-item">
                        <span class="step-number">1</span>
                        <p class="step-text">გადადით აუქციონის გვერდზე ზემოთ მოცემული ღილაკით</p>
                    </div>
                    <div class="step-item">
                        <span class="step-number">2</span>
                        <p class="step-text">გაიარეთ ავტორიზაცია თუ არ ხართ შესული სისტემაში</p>
                    </div>
                    <div class="step-item">
                        <span class="step-number">3</span>
                        <p class="step-text">აუქციონის გვერდზე დააჭირეთ ღილაკ "გადახდას"</p>
                    </div>
                </div>
            </div>
            
            <div class="footer">
                <img src="https://bidspace.webin.ge/wp-content/themes/Bidspace-Main-Theme/src/assets/images/bidspace_logo.png" 
                     alt="Bidspace Logo" 
                     style="height: 40px; margin-bottom: 15px;">
                <div class="divider"></div>
                <p>პატივისცემით,<br><strong>Bidspace გუნდი</strong></p>
                <div class="social-links">
                    <a href="https://facebook.com/bidspace" class="social-link">Facebook</a>
                    <a href="https://instagram.com/bidspace.ge" class="social-link">Instagram</a>
                </div>
                <p class="support-text">თუ გაქვთ კითხვები, დაგვიკავშირდით:<br>
                    <a href="mailto:support@bidspace.ge" style="color: #00AEEF; text-decoration: none;">support@bidspace.ge</a>
                </p>
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

// Payment notifications
add_action('bidspace_payment_completed', 'send_payment_success_notification');
add_action('bidspace_payment_failed', 'send_payment_failed_notification');
add_action('bidspace_payment_cancelled', 'send_payment_cancelled_notification');

function send_payment_success_notification($auction_id) {
    $auction = get_post($auction_id);
    if (!$auction) return;

    $user_id = get_current_user_id();
    $user = get_userdata($user_id);
    if (!$user) return;

    $amount = get_post_meta($auction_id, 'payment_amount', true);
    $order_id = get_post_meta($auction_id, 'payment_order_id', true);

    $subject = 'გადახდა წარმატებით დასრულდა';
    $message = sprintf(
        'გამარჯობა %s,<br><br>' .
        'თქვენი გადახდა აუქციონისთვის "%s" წარმატებით დასრულდა.<br>' .
        'გადახდის დეტალები:<br>' .
        'თანხა: %s₾<br>' .
        'გადახდის ID: %s<br><br>' .
        'გმადლობთ Bidspace-ით სარგებლობისთვის!',
        $user->display_name,
        $auction->post_title,
        number_format($amount, 2),
        $order_id
    );

    $headers = array('Content-Type: text/html; charset=UTF-8');
    wp_mail($user->user_email, $subject, $message, $headers);
}

function send_payment_failed_notification($auction_id) {
    $auction = get_post($auction_id);
    if (!$auction) return;

    $user_id = get_current_user_id();
    $user = get_userdata($user_id);
    if (!$user) return;

    $amount = get_post_meta($auction_id, 'payment_amount', true);

    $subject = 'გადახდა ვერ განხორციელდა';
    $message = sprintf(
        'გამარჯობა %s,<br><br>' .
        'სამწუხაროდ, თქვენი გადახდა აუქციონისთვის "%s" ვერ განხორციელდა.<br>' .
        'გთხოვთ სცადოთ ხელახლა.<br>' .
        'თანხა: %s₾<br><br>' .
        'თუ პრობლემა განმეორდება, დაგვიკავშირდით.',
        $user->display_name,
        $auction->post_title,
        number_format($amount, 2)
    );

    $headers = array('Content-Type: text/html; charset=UTF-8');
    wp_mail($user->user_email, $subject, $message, $headers);
}

function send_payment_cancelled_notification($auction_id) {
    $auction = get_post($auction_id);
    if (!$auction) return;

    $user_id = get_current_user_id();
    $user = get_userdata($user_id);
    if (!$user) return;

    $amount = get_post_meta($auction_id, 'payment_amount', true);

    $subject = 'გადახდა გაუქმდა';
    $message = sprintf(
        'გამარჯობა %s,<br><br>' .
        'თქვენი გადახდა აუქციონისთვის "%s" გაუქმდა.<br>' .
        'თანხა: %s₾<br><br>' .
        'შეგიძლიათ ნებისმიერ დროს სცადოთ გადახდა ხელახლა.',
        $user->display_name,
        $auction->post_title,
        number_format($amount, 2)
    );

    $headers = array('Content-Type: text/html; charset=UTF-8');
    wp_mail($user->user_email, $subject, $message, $headers);
}
