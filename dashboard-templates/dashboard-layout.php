<?php
/*
Template Name: Dashboard Layout
*/

if (!is_user_logged_in()) {
    wp_redirect(wp_login_url(get_permalink()));
    exit;
}

wp_head();

// Function to check if the current page is active and return appropriate classes
function get_dashboard_menu_item_classes($page) {
    $current_page = get_query_var('dashboard_page');
    // Check if it's the main dashboard page or profile page
    if (($page === 'profile' && ($current_page === '' || $current_page === 'profile')) || $current_page === $page) {
        return 'dashboard-menu-item-active';
    }
    return 'dashboard-menu-item';
}

// Get current user info
$current_user = wp_get_current_user();
$user_name = $current_user->display_name;
$user_initial = mb_substr($user_name, 0, 1, 'UTF-8');
?>

<style>
    .user-dropdown {
        display: none;
        position: absolute;
        right: 0;
        top: 100%;
        background-color: white;
        border: 1px solid #E5E5E5;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        z-index: 1000;
    }

    .user-dropdown a {
        display: block;
        padding: 10px 20px;
        color: #6F7181;
        text-decoration: none;
    }

    .user-dropdown a:hover {
        background-color: #f7f7f7;
    }
</style>

<div class="w-full h-full flex justify-center" style="background-color: #F9F9F9">
    <div class="w-1/6 h-full bg-white flex flex-col justify-between border-r pb-6" style="border-color: #E5E5E5;">
        <div class="flex flex-col gap-11">
            <div class="w-full h-24 p-6" style="height: 10%;">
                <a href="<?php echo esc_url(home_url('/')); ?>"><img src="http://bidspace.local/wp-content/themes/brads-boilerplate-theme-tailwind/build/images/bidspace_logo.0f990384.png" alt="Logo Icon"></a>
            </div> 

            <div class="w-full flex flex-col gap-4">
                <nav class="w-full flex flex-col gap-2">
                    <a href="<?php echo esc_url(home_url('/dashboard')); ?>" class="w-full flex gap-2 items-center hover:border-l <?php echo get_dashboard_menu_item_classes('profile'); ?>">
                        <img src="<?php echo get_stylesheet_directory_uri() ?>/icons/dashboard/profile_icon.svg" alt="Profile Icon">
                        <span class="font-normal text-base" style="color: #6F7181">პროფილი</span>
                    </a>

                    <a href="<?php echo esc_url(home_url('/dashboard/add-auction')); ?>" class="w-full flex gap-2 items-center <?php echo get_dashboard_menu_item_classes('add-auction'); ?>">
                        <img src="<?php echo get_stylesheet_directory_uri() ?>/icons/dashboard/add_to_auction_icon.svg" alt="Add Auction Icon">
                        <span class="font-normal text-base" style="color: #6F7181">აუქციონის დამატება</span>
                    </a>

                    <a href="<?php echo esc_url(home_url('/dashboard/my-auctions')); ?>" class="w-full flex gap-2 items-center <?php echo get_dashboard_menu_item_classes('my-auctions'); ?>">
                        <img src="<?php echo get_stylesheet_directory_uri() ?>/icons/dashboard/my_auctions_icon.svg" alt="My Auctions Icon">
                        <span class="font-normal text-base" style="color: #6F7181">ჩემი აუქციონები</span>
                    </a>

                    <a href="<?php echo esc_url(home_url('/dashboard/won-auctions')); ?>" class="w-full flex gap-2 items-center <?php echo get_dashboard_menu_item_classes('won-auctions'); ?>">
                        <img src="<?php echo get_stylesheet_directory_uri() ?>/icons/dashboard/win_auctions_icon.svg" alt="Won Auctions Icon">
                        <span class="font-normal text-base" style="color: #6F7181">მოგებული აუქციონები</span>
                    </a>

                    <a href="<?php echo esc_url(home_url('/dashboard/wishlist')); ?>" class="w-full flex gap-2 items-center <?php echo get_dashboard_menu_item_classes('wishlist'); ?>">
                        <img src="<?php echo get_stylesheet_directory_uri() ?>/icons/dashboard/my_wishlist_icon.svg" alt="Wishlist Icon">
                        <span class="font-normal text-base" style="color: #6F7181">სურვილების სია</span>
                    </a>
                </nav>
                <hr>
                <nav class="w-full flex flex-col gap-2">
                    <a href="<?php echo esc_url(home_url('/dashboard/archive')); ?>" class="w-full flex gap-2 items-center hover:border-l <?php echo get_dashboard_menu_item_classes('archive'); ?>">
                        <img src="<?php echo get_stylesheet_directory_uri() ?>/icons/dashboard/archive_icon.svg" alt="Archive Icon">
                        <span class="font-normal text-base" style="color: #6F7181">არქივი</span>
                    </a>

                    <a href="<?php echo esc_url(home_url('/dashboard/settings')); ?>" class="w-full flex gap-2 items-center <?php echo get_dashboard_menu_item_classes('settings'); ?>">
                        <img src="<?php echo get_stylesheet_directory_uri() ?>/icons/dashboard/setting_icon.svg" alt="Settings Icon">
                        <span class="font-normal text-base" style="color: #6F7181">პარამეტრები</span>
                    </a>

                    <a href="<?php echo esc_url(home_url('/dashboard/verification')); ?>" class="w-full flex gap-2 items-center <?php echo get_dashboard_menu_item_classes('verification'); ?>" style="padding: 8px 24px; background: #00AEEF;">
                        <img src="<?php echo get_stylesheet_directory_uri() ?>/icons/dashboard/verification_icon.svg" alt="Verification Icon">
                        <span class="font-normal text-base text-white">ვერიფიკაცია</span>
                    </a>
                </nav>
            </div>
        </div>
        <div class="flex justify-center items-center">
            <?php
            if ( is_user_logged_in() ) :
            ?>
                <a href="<?php echo esc_url( wp_logout_url( home_url() ) ); ?>" class="flex gap-2">
                    <img src="<?php echo esc_url( get_stylesheet_directory_uri() . '/icons/dashboard/logout_icon.svg' ); ?>" alt="Logout Icon">
                    <span class="font-normal text-base" style="color: #FB6B63;">გასვლა</span>
                </a>
            <?php
            endif;
            ?>
        </div>
    </div>
    <div class="w-5/6">
        <div class="w-full p-6 border-b flex justify-end items-center gap-6" style="border-color: #E5E5E5; height: 10%;">
            <!-- Search input -->
            <div class="relative w-1/3">
                <input type="text" id="auction-search" placeholder="ძებნა" class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <div class="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <img src="<?php echo get_stylesheet_directory_uri() ?>/icons/search_icon.svg" alt="ძებნის ხატულა" class="w-5 h-5">
                </div>
                <div id="search-results" class="absolute left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10"></div>
            </div>
            
            <!-- User info -->
            <div class="relative">
                <div id="userDropdownToggle" class="flex items-center bg-white rounded-full p-1" style="cursor: pointer; box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background: #00AEEF;">
                        <span class="text-white font-bold"><?php echo esc_html($user_initial); ?></span>
                    </div>
                </div>
                <div id="userDropdown" class="user-dropdown mt-2 flex gap-2 flex-col py-2" style="width: 280px">
                    <a href="<?php echo esc_url(home_url()); ?>" class="w-full flex flex-row gap-2 items-center" style="display: flex;">
                        <img src="<?php echo get_stylesheet_directory_uri() ?>/icons/dashboard/arrow_icon.svg" alt="Add Auction Icon" style="width: 25px">
                        <span class="font-normal text-base" style="color: #6F7181">ვებ-გვერდზე დაბრუნება</span>
                    </a>
                    <a href="<?php echo esc_url(home_url('/dashboard')); ?>" class="w-full flex flex-row gap-2 items-center" style="display: flex;">
                        <img src="<?php echo get_stylesheet_directory_uri() ?>/icons/dashboard/profile_icon.svg" alt="Add Auction Icon">
                        <span class="font-normal text-base" style="color: #6F7181">პროფილი</span>
                    </a>
                    <a href="<?php echo esc_url(home_url('/dashboard/add-auction')); ?>" class="w-full flex flex-row gap-2 items-center" style="display: flex;">
                        <img src="<?php echo get_stylesheet_directory_uri() ?>/icons/dashboard/add_to_auction_icon.svg" alt="Add Auction Icon">
                        <span class="font-normal text-base" style="color: #6F7181">აუქციონის დამატება</span>
                    </a>
                    <a href="<?php echo esc_url(home_url('/dashboard/settings')); ?>" class="w-full flex flex-row gap-2 items-center" style="display: flex;">
                        <img src="<?php echo get_stylesheet_directory_uri() ?>/icons/dashboard/setting_icon.svg" alt="Add Auction Icon">
                        <span class="font-normal text-base" style="color: #6F7181">პარამეტრები</span>
                    </a>
                    <a href="<?php echo esc_url( wp_logout_url( home_url() ) ); ?>" class="flex flex-row gap-2 items-center" style="display: flex;">
                        <img src="<?php echo esc_url( get_stylesheet_directory_uri() . '/icons/dashboard/logout_icon.svg' ); ?>" alt="Logout Icon">
                        <span class="font-normal text-base" style="color: #FB6B63;">გასვლა</span>
                    </a>
                </div>
            </div>
        </div>

        <div class="w-full p-6 overflow-y-scroll" style="border-color: #E5E5E5; height: 90%">
            <?php
            if (function_exists('dashboard_content')) {
                dashboard_content();
            }
            ?>
        </div>
    </div>
</div>

<script type="text/javascript">
    var ajaxurl = "<?php echo admin_url('admin-ajax.php'); ?>";
</script>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const userDropdownToggle = document.getElementById('userDropdownToggle');
    const userDropdown = document.getElementById('userDropdown');

    userDropdownToggle.addEventListener('click', function(event) {
        event.stopPropagation();
        userDropdown.style.display = userDropdown.style.display === 'flex' ? 'none' : 'flex';
    });

    document.addEventListener('click', function(event) {
        if (!userDropdownToggle.contains(event.target) && !userDropdown.contains(event.target)) {
            userDropdown.style.display = 'none';
        }
    });

    // Search functionality
    var searchTimer;
    var searchInput = document.getElementById('auction-search');
    var searchResults = document.getElementById('search-results');

    if (searchInput && searchResults) {
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimer);
            var query = this.value;
            
            if (query.length > 2) {
                searchTimer = setTimeout(function() {
                    var formData = new FormData();
                    formData.append('action', 'search_auctions');
                    formData.append('query', query);

                    fetch(ajaxurl, {
                        method: 'POST',
                        body: formData
                    })
                    .then(response => response.text())
                    .then(html => {
                        searchResults.innerHTML = html;
                        searchResults.style.display = 'block';
                    })
                    .catch(error => {
                        console.error('Search error:', error);
                        searchResults.innerHTML = '<div class="p-3">ძებნისას დაფიქსირდა შეცდომა</div>';
                        searchResults.style.display = 'block';
                    });
                }, 300);
            } else if (query.length === 0) {
                searchResults.style.display = 'none';
            }
        });

        // Hide search results when clicking outside
        document.addEventListener('click', function(e) {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.style.display = 'none';
            }
        });

        // Show results on focus if input has value
        searchInput.addEventListener('focus', function() {
            if (this.value.length > 2) {
                searchResults.style.display = 'block';
            }
        });

        // Handle click on search result
        searchResults.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                e.preventDefault();
                window.location.href = e.target.href;
            }
        });
    }
});
</script>