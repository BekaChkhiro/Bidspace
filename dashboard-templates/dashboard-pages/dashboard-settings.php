<?php
/*
Template Name: Dashboard Settings
*/

function dashboard_content() {
    $current_user = wp_get_current_user();
    $user_id = $current_user->ID;

    if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['update_profile'])) {
        // Validate and sanitize input
        $first_name = sanitize_text_field($_POST['first_name']);
        $last_name = sanitize_text_field($_POST['last_name']);
        $email = sanitize_email($_POST['email']);
        $phone_number = sanitize_text_field($_POST['phone_number']);
        $nickname = sanitize_text_field($_POST['nickname']);
        $piradi_nomeri = sanitize_text_field($_POST['piradi_nomeri']);
        
        // Update user data
        wp_update_user(array(
            'ID' => $user_id,
            'first_name' => $first_name,
            'last_name' => $last_name,
            'user_email' => $email,
            'nickname' => $nickname
        ));
        
        // Update custom user meta
        update_user_meta($user_id, 'phone_number', $phone_number);
        update_user_meta($user_id, 'piradi_nomeri', $piradi_nomeri);
        
        // Handle password change
        if (!empty($_POST['password']) && !empty($_POST['password_confirm'])) {
            if ($_POST['password'] === $_POST['password_confirm']) {
                wp_set_password($_POST['password'], $user_id);
                // Re-authenticate the user if password is changed
                wp_set_auth_cookie($user_id);
                wp_set_current_user($user_id);
                do_action('wp_login', $current_user->user_login, $current_user);
            } else {
                echo '<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">პაროლები არ ემთხვევა.</div>';
            }
        }
        
        echo '<div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">პროფილი წარმატებით განახლდა.</div>';
    }

    // Fetch current user data
    $first_name = $current_user->first_name;
    $last_name = $current_user->last_name;
    $email = $current_user->user_email;
    $phone_number = get_user_meta($user_id, 'phone_number', true);
    $nickname = $current_user->nickname;
    $piradi_nomeri = get_user_meta($user_id, 'piradi_nomeri', true);
    ?>

    <div class="flex flex-col gap-6 max-w-4xl mx-auto">
        <h2 class="text-2xl font-bold">პირადი მონაცემების რედაქტირება</h2>
        <form method="post" action="" class="space-y-6">
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label for="first_name" class="block text-sm font-medium text-gray-700">სახელი</label>
                    <input type="text" id="first_name" name="first_name" value="<?php echo esc_attr($first_name); ?>" required class="settings-field-style mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                </div>
                <div>
                    <label for="last_name" class="block text-sm font-medium text-gray-700">გვარი</label>
                    <input type="text" id="last_name" name="last_name" value="<?php echo esc_attr($last_name); ?>" required class="settings-field-style mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700">ელ-ფოსტა</label>
                    <input type="email" id="email" name="email" value="<?php echo esc_attr($email); ?>" required class="settings-field-style mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                </div>
                <div>
                    <label for="phone_number" class="block text-sm font-medium text-gray-700">ტელეფონის ნომერი</label>
                    <input type="text" id="phone_number" name="phone_number" value="<?php echo esc_attr($phone_number); ?>" class="settings-field-style mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label for="nickname" class="block text-sm font-medium text-gray-700">მომხმარებლის სახელი</label>
                    <input type="text" id="nickname" name="nickname" value="<?php echo esc_attr($nickname); ?>" required class="settings-field-style mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                </div>
                <div>
                    <label for="piradi_nomeri" class="block text-sm font-medium text-gray-700">პირადი ნომერი</label>
                    <input type="text" id="piradi_nomeri" name="piradi_nomeri" value="<?php echo esc_attr($piradi_nomeri); ?>" class="settings-field-style mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700">ახალი პაროლი (არ შეავსოთ თუ არ გსურთ შეცვლა)</label>
                    <input type="password" id="password" name="password" class="settings-field-style mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                </div>
                <div>
                    <label for="password_confirm" class="block text-sm font-medium text-gray-700">გაიმეორეთ ახალი პაროლი</label>
                    <input type="password" id="password_confirm" name="password_confirm" class="settings-field-style mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                </div>
            </div>
            <div>
                <input type="submit" name="update_profile" value="დამახსოვრება" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-full" style="background-color: #00AEEF; padding: 10px 50px; cursor: pointer">
            </div>
        </form>
    </div>
    <?php
}

include(get_template_directory() . '/dashboard-templates/dashboard-layout.php');
?>