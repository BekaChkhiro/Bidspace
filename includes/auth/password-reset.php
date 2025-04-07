<?php

function bidspace_register_password_reset_endpoints() {
    register_rest_route('bidspace/v1', '/request-password-reset', array(
        'methods' => 'POST',
        'callback' => 'bidspace_request_password_reset',
        'permission_callback' => '__return_true',
        'args' => array(
            'email' => array(
                'required' => true,
                'type' => 'string',
                'validate_callback' => function($param) {
                    return is_email($param);
                }
            )
        )
    ));

    register_rest_route('bidspace/v1', '/verify-code', array(
        'methods' => 'POST',
        'callback' => 'bidspace_verify_code',
        'permission_callback' => '__return_true',
        'args' => array(
            'email' => array(
                'required' => true,
                'type' => 'string'
            ),
            'code' => array(
                'required' => true,
                'type' => 'string'
            )
        )
    ));

    register_rest_route('bidspace/v1', '/reset-password', array(
        'methods' => 'POST',
        'callback' => 'bidspace_reset_password',
        'permission_callback' => '__return_true',
        'args' => array(
            'email' => array(
                'required' => true,
                'type' => 'string'
            ),
            'code' => array(
                'required' => true,
                'type' => 'string'
            ),
            'password' => array(
                'required' => true,
                'type' => 'string'
            ),
            'password_confirm' => array(
                'required' => true,
                'type' => 'string'
            )
        )
    ));
}

function bidspace_request_password_reset($request) {
    $email = sanitize_email($request->get_param('email'));
    
    if (!$email) {
        return new WP_Error('invalid_request', 'გთხოვთ მიუთითოთ ელ-ფოსტა', array('status' => 400));
    }

    $user = get_user_by('email', $email);
    if (!$user) {
        return new WP_Error('user_not_found', 'მომხმარებელი ვერ მოიძებნა', array('status' => 404));
    }
    
    // Add rate limiting
    $last_request_time = get_user_meta($user->ID, 'password_reset_last_request', true);
    if ($last_request_time && (time() - $last_request_time < 60)) { // 1 minute cooldown
        return new WP_Error(
            'too_many_requests', 
            'გთხოვთ მოიცადოთ 1 წუთი ახალი კოდის მოთხოვნამდე', 
            array('status' => 429)
        );
    }
    
    $verification_code = wp_rand(100000, 999999);
    
    $code_data = array(
        'code' => $verification_code,
        'expires' => time() + (30 * 60), // 30 minutes
        'attempts' => 0 // Track failed attempts
    );
    
    update_user_meta($user->ID, 'password_reset_code', $code_data);
    update_user_meta($user->ID, 'password_reset_last_request', time());

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
                <h1 style="color: #000; font-size: 32px; margin: 0; padding: 10px 20px; background: #f5f5f5; border-radius: 5px; letter-spacing: 3px;">' . $verification_code . '</h1>
            </div>
            
            <p style="color: #666; font-size: 14px;">კოდი მოქმედებს 30 წუთის განმავლობაში.</p>
            
            <p style="color: #666; margin-top: 30px;">თუ თქვენ არ მოგითხოვიათ პაროლის აღდგენა, გთხოვთ უგულებელყოთ ეს შეტყობინება.</p>
        </div>
        
        <div style="text-align: center; color: #666; font-size: 12px;">
            <p>ეს არის ავტომატური შეტყობინება, გთხოვთ არ უპასუხოთ.</p>
            <p>&copy; ' . date('Y') . ' Bidspace. ყველა უფლება დაცულია.</p>
        </div>
    </body>
    </html>';

    $headers = array(
        'Content-Type: text/html; charset=UTF-8',
        'From: Bidspace <noreply@bidspace.ge>',
        'Reply-To: noreply@bidspace.ge'
    );

    // Try to send the email
    add_filter('wp_mail_content_type', function() { return "text/html"; });
    $mail_sent = wp_mail($to, $subject, $message_html, $headers);
    remove_filter('wp_mail_content_type', function() { return "text/html"; });

    if ($mail_sent) {
        return array(
            'success' => true,
            'message' => 'კოდი გამოგზავნილია'
        );
    }

    return new WP_Error(
        'email_failed', 
        'კოდის გაგზავნა ვერ მოხერხდა', 
        array('status' => 500)
    );
}

function bidspace_verify_code($request) {
    $email = sanitize_email($request->get_param('email'));
    $code = $request->get_param('code');
    
    if (!$email || !$code) {
        return new WP_Error('invalid_request', 'გთხოვთ მიუთითოთ ელ-ფოსტა და კოდი', array('status' => 400));
    }

    $user = get_user_by('email', $email);
    if (!$user) {
        return new WP_Error('user_not_found', 'მომხმარებელი ვერ მოიძებნა', array('status' => 404));
    }

    $code_data = get_user_meta($user->ID, 'password_reset_code', true);
    
    if (!$code_data || !is_array($code_data)) {
        return new WP_Error('invalid_code', 'კოდი არ არის ვალიდური', array('status' => 400));
    }

    // Check for too many failed attempts
    if (isset($code_data['attempts']) && $code_data['attempts'] >= 5) {
        delete_user_meta($user->ID, 'password_reset_code');
        return new WP_Error('too_many_attempts', 'ძალიან ბევრი მცდელობა. გთხოვთ მოითხოვოთ ახალი კოდი', array('status' => 400));
    }
    
    if (time() > $code_data['expires']) {
        delete_user_meta($user->ID, 'password_reset_code');
        return new WP_Error('code_expired', 'კოდს ვადა გაუვიდა', array('status' => 400));
    }

    if ($code !== (string)$code_data['code']) {
        // Increment failed attempts
        $code_data['attempts'] = isset($code_data['attempts']) ? $code_data['attempts'] + 1 : 1;
        update_user_meta($user->ID, 'password_reset_code', $code_data);
        
        return new WP_Error('invalid_code', 'არასწორი კოდი', array('status' => 400));
    }

    return array(
        'success' => true,
        'message' => 'კოდი დადასტურებულია'
    );
}

function bidspace_reset_password($request) {
    error_log('Password reset request received');
    
    $params = $request->get_json_params();
    error_log('Decoded params: ' . print_r($params, true));
    
    $email = isset($params['email']) ? sanitize_email($params['email']) : '';
    $code = isset($params['code']) ? sanitize_text_field($params['code']) : '';
    $password = isset($params['password']) ? sanitize_text_field($params['password']) : '';
    $password_confirm = isset($params['password_confirm']) ? sanitize_text_field($params['password_confirm']) : '';

    error_log('Sanitized inputs received:');
    error_log('Email: ' . ($email ? $email : 'missing'));
    error_log('Code: ' . ($code ? $code : 'missing'));
    error_log('Password present: ' . (!empty($password) ? 'yes' : 'no'));
    error_log('Password confirm present: ' . (!empty($password_confirm) ? 'yes' : 'no'));

    if (empty($email) || empty($code) || empty($password) || empty($password_confirm)) {
        return new WP_Error(
            'missing_data',
            'გთხოვთ მიუთითოთ ყველა საჭირო ველი',
            array(
                'status' => 400,
                'debug' => array(
                    'email_present' => !empty($email),
                    'code_present' => !empty($code),
                    'password_present' => !empty($password),
                    'password_confirm_present' => !empty($password_confirm)
                )
            )
        );
    }

    if ($password !== $password_confirm) {
        return new WP_Error('password_mismatch', 'პაროლები არ ემთხვევა', array('status' => 400));
    }

    if (strlen($password) < 6) {
        return new WP_Error('password_too_short', 'პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს', array('status' => 400));
    }

    $user = get_user_by('email', $email);
    if (!$user) {
        error_log('User not found for email: ' . $email);
        return new WP_Error('user_not_found', 'მომხმარებელი ვერ მოიძებნა', array('status' => 404));
    }

    $code_data = get_user_meta($user->ID, 'password_reset_code', true);
    error_log('Retrieved code data: ' . print_r($code_data, true));
    
    if (!$code_data || !is_array($code_data) || !isset($code_data['code']) || !isset($code_data['expires'])) {
        error_log('Invalid code data structure');
        return new WP_Error('invalid_code', 'კოდი არ არის ვალიდური', array('status' => 400));
    }
    
    if (time() > $code_data['expires']) {
        error_log('Code expired. Current time: ' . time() . ', Expiry: ' . $code_data['expires']);
        delete_user_meta($user->ID, 'password_reset_code');
        return new WP_Error('code_expired', 'კოდს ვადა გაუვიდა', array('status' => 400));
    }

    if ($code !== (string)$code_data['code']) {
        error_log('Code mismatch - Received: ' . $code . ', Stored: ' . $code_data['code']);
        return new WP_Error('invalid_code', 'კოდი არასწორია', array('status' => 400));
    }

    // Reset the password
    wp_set_password($password, $user->ID);
    error_log('Password successfully reset for user: ' . $email);
    
    // Clear the reset code
    delete_user_meta($user->ID, 'password_reset_code');

    return array(
        'success' => true,
        'message' => 'პაროლი წარმატებით შეიცვალა'
    );
}

add_action('rest_api_init', 'bidspace_register_password_reset_endpoints');

// Add AJAX handler for password reset
function reset_password_ajax_handler() {
    // Get parameters from POST
    $email = isset($_POST['email']) ? sanitize_email($_POST['email']) : '';
    $code = isset($_POST['code']) ? sanitize_text_field($_POST['code']) : '';
    $password = isset($_POST['password']) ? sanitize_text_field($_POST['password']) : '';
    
    // Log received parameters
    error_log('AJAX Password reset request received');
    error_log('Email: ' . ($email ? $email : 'missing'));
    error_log('Code: ' . ($code ? $code : 'missing'));
    error_log('Password length: ' . ($password ? strlen($password) : 0));
    
    // Check if required parameters are present
    if (empty($email) || empty($code) || empty($password)) {
        wp_send_json_error(array(
            'message' => 'გთხოვთ მიუთითოთ ყველა საჭირო ველი',
            'debug' => array(
                'email_present' => !empty($email),
                'code_present' => !empty($code),
                'password_present' => !empty($password)
            )
        ), 400);
        wp_die();
    }
    
    $user = get_user_by('email', $email);
    if (!$user) {
        error_log('User not found for email: ' . $email);
        wp_send_json_error(array('message' => 'მომხმარებელი ვერ მოიძებნა'), 404);
        wp_die();
    }

    $code_data = get_user_meta($user->ID, 'password_reset_code', true);
    error_log('Retrieved code data: ' . print_r($code_data, true));
    
    if (!$code_data || !is_array($code_data) || !isset($code_data['code']) || !isset($code_data['expires'])) {
        error_log('Invalid or missing code data structure');
        wp_send_json_error(array('message' => 'კოდი არასწორია'), 400);
        wp_die();
    }
    
    if (time() > $code_data['expires']) {
        error_log('Code expired. Current time: ' . time() . ', Expiry: ' . $code_data['expires']);
        wp_send_json_error(array('message' => 'კოდს ვადა გაუვიდა'), 400);
        wp_die();
    }

    if ($code !== (string)$code_data['code']) {
        error_log('Code mismatch - Received: ' . $code . ', Stored: ' . $code_data['code']);
        wp_send_json_error(array('message' => 'კოდი არასწორია'), 400);
        wp_die();
    }

    // Reset the password
    wp_set_password($password, $user->ID);
    
    // Clear the reset code
    delete_user_meta($user->ID, 'password_reset_code');

    error_log('Password successfully reset for user: ' . $email);
    wp_send_json_success(array('message' => 'პაროლი წარმატებით შეიცვალა'));
    wp_die();
}

add_action('wp_ajax_reset_password_ajax', 'reset_password_ajax_handler');
add_action('wp_ajax_nopriv_reset_password_ajax', 'reset_password_ajax_handler');
