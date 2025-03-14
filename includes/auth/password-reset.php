<?php

function bidspace_register_password_reset_endpoints() {
    register_rest_route('bidspace/v1', '/request-password-reset', array(
        'methods' => 'POST',
        'callback' => 'bidspace_request_password_reset',
        'permission_callback' => '__return_true'
    ));

    register_rest_route('bidspace/v1', '/verify-code', array(
        'methods' => 'POST',
        'callback' => 'bidspace_verify_code',
        'permission_callback' => '__return_true'
    ));

    register_rest_route('bidspace/v1', '/reset-password', array(
        'methods' => 'POST',
        'callback' => 'bidspace_reset_password',
        'permission_callback' => '__return_true'
    ));
}

function bidspace_request_password_reset($request) {
    $email = sanitize_email($request->get_param('email'));
    $phone = sanitize_text_field($request->get_param('phone'));

    if ($email) {
        $user = get_user_by('email', $email);
        if (!$user) {
            return new WP_Error('user_not_found', 'მომხმარებელი ვერ მოიძებნა', array('status' => 404));
        }
        
        $verification_code = wp_rand(100000, 999999);
        $code_data = array(
            'code' => $verification_code,
            'expires' => time() + (30 * 60) // 30 minutes
        );
        
        update_user_meta($user->ID, 'password_reset_code', $code_data);

        $to = $email;
        $subject = 'პაროლის აღდგენა - Bidspace';
        
        // HTML version of the email
        $message_html = '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <img src="' . get_template_directory_uri() . '/src/assets/images/bidspace_logo.png" alt="Bidspace Logo" style="max-width: 150px;">
            </div>
            
            <div style="background: #f9f9f9; border-radius: 10px; padding: 30px; margin-bottom: 30px;">
                <h2 style="color: #000; margin-bottom: 20px; text-align: center;">პაროლის აღდგენა</h2>
                
                <p style="margin-bottom: 20px;">გამარჯობა,</p>
                
                <p style="margin-bottom: 20px;">მივიღეთ თქვენი მოთხოვნა Bidspace-ზე პაროლის აღდგენის შესახებ.</p>
                
                <div style="background: #fff; padding: 20px; border-radius: 5px; text-align: center; margin: 30px 0;">
                    <p style="font-size: 18px; margin-bottom: 10px;">თქვენი დადასტურების კოდია:</p>
                    <div style="position: relative; display: inline-block;">
                        <h1 style="color: #000; font-size: 32px; margin: 0; padding: 10px 20px; background: #f5f5f5; border-radius: 5px; letter-spacing: 3px;">' . $verification_code . '</h1>
                        <button onclick="navigator.clipboard.writeText(\'' . $verification_code . '\')" style="position: absolute; top: 50%; right: -40px; transform: translateY(-50%); background: none; border: none; cursor: pointer; padding: 5px;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                            </svg>
                        </button>
                    </div>
                    <p style="font-size: 12px; color: #666; margin-top: 10px;">დააჭირეთ კოდს ან ღილაკს კოპირებისთვის</p>
                </div>
                
                <p style="color: #666; font-size: 14px;">კოდი მოქმედებს 30 წუთის განმავლობაში.</p>
                
                <p style="color: #666; margin-top: 30px;">თუ თქვენ არ მოგითხოვიათ პაროლის აღდგენა, გთხოვთ უგულებელყოთ ეს შეტყობინება.</p>
            </div>
            
            <div style="text-align: center; color: #666; font-size: 12px;">
                <p>ეს არის ავტომატური შეტყობინება, გთხოვთ არ უპასუხოთ.</p>
                <p>&copy; ' . date('Y') . ' Bidspace. ყველა უფლება დაცულია.</p>
            </div>
        </body>
        </html>
        ';
        
        // Plain text version of the email
        $message_text = sprintf(
            "პაროლის აღდგენა - Bidspace\n\n" .
            "გამარჯობა,\n\n" .
            "მივიღეთ თქვენი მოთხოვნა Bidspace-ზე პაროლის აღდგენის შესახებ.\n\n" .
            "თქვენი დადასტურების კოდია: %s\n\n" .
            "კოდი მოქმედებს 30 წუთის განმავლობაში.\n\n" .
            "თუ თქვენ არ მოგითხოვიათ პაროლის აღდგენა, გთხოვთ უგულებელყოთ ეს შეტყობინება.\n\n" .
            "ეს არის ავტომატური შეტყობინება, გთხოვთ არ უპასუხოთ.",
            $verification_code
        );

        // Email headers for HTML email
        $headers = array(
            'Content-Type: text/html; charset=UTF-8',
            'From: Bidspace <noreply@bidspace.ge>'
        );

        // Send email with both HTML and plain text versions
        add_filter('wp_mail_content_type', function() { return "text/html"; });
        $mail_sent = wp_mail($to, $subject, $message_html, $headers);
        remove_filter('wp_mail_content_type', function() { return "text/html"; });

        if ($mail_sent) {
            return array(
                'success' => true,
                'message' => 'კოდი გამოგზავნილია'
            );
        }

        return new WP_Error('email_failed', 'კოდის გაგზავნა ვერ მოხერხდა', array('status' => 500));
    } elseif ($phone) {
        // For phone verification, we don't need to send SMS here
        // Firebase handles SMS sending on the frontend
        $users = get_users(array(
            'meta_key' => 'phone_number',
            'meta_value' => $phone,
            'number' => 1
        ));

        if (empty($users)) {
            return new WP_Error('user_not_found', 'მომხმარებელი ვერ მოიძებნა', array('status' => 404));
        }

        $user = $users[0];
        
        // Store phone number in user meta for later verification
        update_user_meta($user->ID, 'password_reset_phone', $phone);
        update_user_meta($user->ID, 'password_reset_timestamp', time());

        return array(
            'success' => true,
            'message' => 'მომხმარებელი ნაპოვნია'
        );
    }

    return new WP_Error('invalid_request', 'გთხოვთ მიუთითოთ ელ-ფოსტა ან ტელეფონის ნომერი', array('status' => 400));
}

function bidspace_verify_code($request) {
    $email = sanitize_email($request->get_param('email'));
    $code = $request->get_param('code');
    $phone = sanitize_text_field($request->get_param('phone'));
    
    if ($email) {
        $user = get_user_by('email', $email);
        if (!$user) {
            return new WP_Error('user_not_found', 'მომხმარებელი ვერ მოიძებნა', array('status' => 404));
        }

        $code_data = get_user_meta($user->ID, 'password_reset_code', true);
        
        if (!$code_data || time() > $code_data['expires']) {
            return new WP_Error('code_expired', 'კოდს ვადა გაუვიდა', array('status' => 400));
        }

        if ($code !== (string)$code_data['code']) {
            return new WP_Error('invalid_code', 'არასწორი კოდი', array('status' => 400));
        }
    } elseif ($phone) {
        // For phone verification, we trust Firebase's verification
        // We just check if the phone matches the one stored during request
        $users = get_users(array(
            'meta_key' => 'password_reset_phone',
            'meta_value' => $phone,
            'number' => 1
        ));

        if (empty($users)) {
            return new WP_Error('user_not_found', 'მომხმარებელი ვერ მოიძებნა', array('status' => 404));
        }

        $user = $users[0];
        $timestamp = get_user_meta($user->ID, 'password_reset_timestamp', true);
        
        // Check if the request is not older than 30 minutes
        if (!$timestamp || (time() - $timestamp) > 1800) {
            return new WP_Error('request_expired', 'მოთხოვნას ვადა გაუვიდა', array('status' => 400));
        }
    } else {
        return new WP_Error('invalid_request', 'გთხოვთ მიუთითოთ ელ-ფოსტა ან ტელეფონის ნომერი', array('status' => 400));
    }

    return array(
        'success' => true,
        'message' => 'კოდი დადასტურებულია'
    );
}

function bidspace_reset_password($request) {
    $email = sanitize_email($request->get_param('email'));
    $phone = sanitize_text_field($request->get_param('phone'));
    $code = $request->get_param('code');
    $new_password = $request->get_param('new_password');
    
    if (!$new_password) {
        return new WP_Error('missing_password', 'გთხოვთ მიუთითოთ ახალი პაროლი', array('status' => 400));
    }

    if ($email) {
        $user = get_user_by('email', $email);
        if (!$user) {
            return new WP_Error('user_not_found', 'მომხმარებელი ვერ მოიძებნა', array('status' => 404));
        }

        $code_data = get_user_meta($user->ID, 'password_reset_code', true);
        
        if (!$code_data || time() > $code_data['expires']) {
            return new WP_Error('code_expired', 'კოდს ვადა გაუვიდა', array('status' => 400));
        }

        if ($code !== (string)$code_data['code']) {
            return new WP_Error('invalid_code', 'არასწორი კოდი', array('status' => 400));
        }
    } elseif ($phone) {
        $users = get_users(array(
            'meta_key' => 'password_reset_phone',
            'meta_value' => $phone,
            'number' => 1
        ));

        if (empty($users)) {
            return new WP_Error('user_not_found', 'მომხმარებელი ვერ მოიძებნა', array('status' => 404));
        }

        $user = $users[0];
        $timestamp = get_user_meta($user->ID, 'password_reset_timestamp', true);
        
        // Check if the request is not older than 30 minutes
        if (!$timestamp || (time() - $timestamp) > 1800) {
            return new WP_Error('request_expired', 'მოთხოვნას ვადა გაუვიდა', array('status' => 400));
        }
    } else {
        return new WP_Error('invalid_request', 'გთხოვთ მიუთითოთ ელ-ფოსტა ან ტელეფონის ნომერი', array('status' => 400));
    }

    // Update password
    wp_set_password($new_password, $user->ID);

    // Clean up meta
    delete_user_meta($user->ID, 'password_reset_code');
    delete_user_meta($user->ID, 'password_reset_phone');
    delete_user_meta($user->ID, 'password_reset_timestamp');

    return array(
        'success' => true,
        'message' => 'პაროლი წარმატებით შეიცვალა'
    );
}

add_action('rest_api_init', 'bidspace_register_password_reset_endpoints');
