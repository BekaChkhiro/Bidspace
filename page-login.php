<?php
/*
Template Name: Custom Login
*/

// Start session if not already started
if (!session_id()) {
    session_start();
}

// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['login'])) {
        // Handle login
        $username = sanitize_user($_POST['username']);
        $password = $_POST['password'];
        $user = wp_signon(array(
            'user_login' => $username,
            'user_password' => $password,
            'remember' => isset($_POST['remember_me'])
        ), false);
        if (is_wp_error($user)) {
            $_SESSION['error_message'] = $user->get_error_message();
        } else {
            // Redirect to dashboard after successful login
            wp_redirect(home_url('/dashboard'));
            exit;
        }
    } elseif (isset($_POST['register'])) {
        // Handle registration
        $userdata = array(
            'user_login' => sanitize_user($_POST['reg_username']),
            'user_pass' => $_POST['reg_password'],
            'user_email' => sanitize_email($_POST['reg_email']),
            'first_name' => sanitize_text_field($_POST['reg_first_name']),
            'last_name' => sanitize_text_field($_POST['reg_last_name']),
            'role' => 'auction_user'
        );
        $user_id = wp_insert_user($userdata);
        if (is_wp_error($user_id)) {
            $_SESSION['error_message'] = $user_id->get_error_message();
        } else {
            // Check if the 'auction_user' role exists, if not, create it
            if (!get_role('auction_user')) {
                add_role('auction_user', 'Auction User', array(
                    'read' => true,
                    // Add other capabilities as needed
                ));
            }
            
            // Assign the 'auction_user' role
            $user = new WP_User($user_id);
            $user->set_role('auction_user');
            
            // Add phone number and personal number as user meta
            update_user_meta($user_id, 'phone_number', sanitize_text_field($_POST['phone_number']));
            update_user_meta($user_id, 'piradi_nomeri', sanitize_text_field($_POST['piradi_nomeri']));
            
            $_SESSION['success_message'] = "რეგისტრაცია წარმატებით დასრულდა. თქვენ დარეგისტრირდით როგორც Auction User. გთხოვთ, გაიაროთ ავტორიზაცია.";
        }
    }
    // Redirect to the same page to avoid form resubmission
    wp_redirect($_SERVER['REQUEST_URI']);
    exit;
}

get_header();

// Enqueue Tailwind CSS
wp_enqueue_style('tailwind', 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css', array(), null);

?>

<div class="container mx-auto px-4 py-8">
    <div class="max-w-md mx-auto bg-white rounded-3xl overflow-hidden shadow-lg">
        <div class="px-9 pb-9 pt-12">
            <div id="login-form">
                <h3 class="text-xl font-semibold text-center mb-6">ავტორიზაცია</h3>
                
                <?php
                if (isset($_SESSION['error_message'])) {
                    echo '<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">';
                    echo '<span class="block sm:inline">' . $_SESSION['error_message'] . '</span>';
                    echo '</div>';
                    unset($_SESSION['error_message']);
                }

                if (isset($_SESSION['success_message'])) {
                    echo '<div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">';
                    echo '<span class="block sm:inline">' . $_SESSION['success_message'] . '</span>';
                    echo '</div>';
                    unset($_SESSION['success_message']);
                }
                ?>

                <form action="" method="post">
                    <div class="mb-4">
                        <label for="username" class="block text-sm font-medium text-gray-700 mb-2">ელ-ფოსტა</label>
                        <input type="text" id="username" name="username" required
                               class="w-full px-3 py-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    <div class="mb-6">
                        <label for="password" class="block text-sm font-medium text-gray-700 mb-2">პაროლი</label>
                        <input type="password" id="password" name="password" required
                               class="w-full px-3 py-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    <div class="flex items-center justify-between mb-6">
                        <div class="flex items-center">
                            <input type="checkbox" id="remember_me" name="remember_me" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                            <label for="remember_me" class="ml-2 block text-sm text-gray-900">
                                დამახსოვრება
                            </label>
                        </div>
                        <div class="text-sm">
                            <a href="<?php echo wp_lostpassword_url(); ?>" class="font-bold text-black">
                                დაგავიწყდა პაროლი?
                            </a>
                        </div>
                    </div>
                    <div>
                        <button type="submit" name="login" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-stone-950 hover:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            შესვლა
                        </button>
                    </div>
                </form>
                
                <div class="mt-6">
                    <div class="relative">
                        <div class="absolute inset-0 flex items-center">
                            <div class="w-full border-t border-gray-300"></div>
                        </div>
                        <div class="relative flex justify-center text-sm">
                            <span class="px-2 bg-white text-gray-500">
                                ან
                            </span>
                        </div>
                    </div>

                    <div class="mt-6 text-center">
                        <p class="text-sm" style="color: #333;">
                            არ გაქვს ანგარიში? <a href="#" id="show-registration" style="color: #333;" class="font-bold hover:underline">დარეგისტრირდი</a>
                        </p>
                    </div>
                </div>
            </div>

            <div id="registration-form" style="display: none;">
                <h3 class="text-xl font-semibold text-center mb-6">რეგისტრაცია</h3>
                <form action="" method="post">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="col-span-1">
                            <label for="reg_first_name" class="block text-sm font-medium text-gray-700 mb-2">სახელი</label>
                            <input type="text" id="reg_first_name" name="reg_first_name" required
                                   class="w-full px-3 py-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                        </div>
                        <div class="col-span-1">
                            <label for="reg_last_name" class="block text-sm font-medium text-gray-700 mb-2">გვარი</label>
                            <input type="text" id="reg_last_name" name="reg_last_name" required
                                   class="w-full px-3 py-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4 mt-4">
                        <div class="col-span-1">
                            <label for="reg_email" class="block text-sm font-medium text-gray-700 mb-2">ელ-ფოსტა</label>
                            <input type="email" id="reg_email" name="reg_email" required
                                   class="w-full px-3 py-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                        </div>
                        <div class="col-span-1">
                            <label for="phone_number" class="block text-sm font-medium text-gray-700 mb-2">ტელეფონის ნომერი</label>
                            <input type="tel" id="phone_number" name="phone_number" required
                                   class="w-full px-3 py-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4 mt-4">
                        <div class="col-span-1">
                            <label for="reg_username" class="block text-sm font-medium text-gray-700 mb-2">მომხმარებლის სახელი</label>
                            <input type="text" id="reg_username" name="reg_username" required
                                   class="w-full px-3 py-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                        </div>
                        <div class="col-span-1">
                            <label for="piradi_nomeri" class="block text-sm font-medium text-gray-700 mb-2">პირადი ნომერი</label>
                            <input type="text" id="piradi_nomeri" name="piradi_nomeri" required
                                   class="w-full px-3 py-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                        </div>
                    </div>
                    <div class="mt-4">
                        <label for="reg_password" class="block text-sm font-medium text-gray-700 mb-2">პაროლი</label>
                        <input type="password" id="reg_password" name="reg_password" required
                               class="w-full px-3 py-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    <div class="mt-4">
                        <label for="reg_confirm_password" class="block text-sm font-medium text-gray-700 mb-2">გაიმეორეთ პაროლი</label>
                        <input type="password" id="reg_confirm_password" name="reg_confirm_password" required
                               class="w-full px-3 py-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    <div class="mt-4">
                        <label class="inline-flex items-center">
                            <input type="checkbox" name="terms_agreed" required class="form-checkbox h-5 w-5 text-blue-600">
                            <span class="ml-2 text-sm text-gray-700">ვეთანხმები წესებს და პირობებს</span>
                        </label>
                    </div>
                    <div class="mt-6">
                        <button type="submit" name="register" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-stone-950 hover:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            რეგისტრაცია
                        </button>
                    </div>
                </form>
                <div class="mt-6 text-center">
                    <p class="text-sm" style="color: #333;">
                        უკვე გაქვს ანგარიში? <a href="#" id="back-to-login-link" style="color: #333;" class="font-bold text-sm hover:underline">შესვლა</a>
                    </p>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const registrationForm = document.getElementById('registration-form');
    const showRegistrationButton = document.getElementById('show-registration');
    const backToLoginLink = document.getElementById('back-to-login-link');

    function showRegistration() {
        loginForm.style.display = 'none';
        registrationForm.style.display = 'block';
    }

    function showLogin() {
        loginForm.style.display = 'block';
        registrationForm.style.display = 'none';
    }

    showRegistrationButton.addEventListener('click', function(e) {
        e.preventDefault();
        showRegistration();
    });

    backToLoginLink.addEventListener('click', function(e) {
        e.preventDefault();
        showLogin();
    });
});
</script>

<?php get_footer(); ?>