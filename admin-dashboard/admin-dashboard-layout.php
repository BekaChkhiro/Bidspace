<?php
// File: admin-dashboard/admin-dashboard-layout.php

// Check access
if (!current_user_can('manage_options')) {
    wp_redirect(home_url());
    exit;
}

get_header('admin'); // Optional custom header for admin
?>

<div class="admin-dashboard-wrapper">
    <!-- Sidebar -->
    <div class="admin-sidebar">
        <div class="sidebar-header">
            <img src="<?php echo get_template_directory_uri(); ?>/admin-dashboard/assets/images/logo.png" alt="Logo">
            <h2>ადმინ პანელი</h2>
        </div>
        
        <nav class="sidebar-nav">
            <ul>
                <li class="<?php echo !get_query_var('admin_page') ? 'active' : ''; ?>">
                    <a href="<?php echo home_url('admin/dashboard'); ?>">
                        <i class="fas fa-home"></i>
                        მთავარი
                    </a>
                </li>
                <li class="<?php echo get_query_var('admin_page') === 'auctions' ? 'active' : ''; ?>">
                    <a href="<?php echo home_url('admin/dashboard/auctions'); ?>">
                        <i class="fas fa-gavel"></i>
                        აუქციონები
                    </a>
                </li>
                <li class="<?php echo get_query_var('admin_page') === 'users' ? 'active' : ''; ?>">
                    <a href="<?php echo home_url('admin/dashboard/users'); ?>">
                        <i class="fas fa-users"></i>
                        მომხმარებლები
                    </a>
                </li>
                <li class="<?php echo get_query_var('admin_page') === 'categories' ? 'active' : ''; ?>">
                    <a href="<?php echo home_url('admin/dashboard/categories'); ?>">
                        <i class="fas fa-tags"></i>
                        კატეგორიები
                    </a>
                </li>
                <li class="<?php echo get_query_var('admin_page') === 'settings' ? 'active' : ''; ?>">
                    <a href="<?php echo home_url('admin/dashboard/settings'); ?>">
                        <i class="fas fa-cogs"></i>
                        პარამეტრები
                    </a>
                </li>
            </ul>
        </nav>
    </div>

    <!-- Main Content -->
    <div class="admin-main-content">
        <!-- Top Bar -->
        <div class="admin-topbar">
            <div class="search-box">
                <input type="text" placeholder="ძებნა...">
                <button type="submit">
                    <i class="fas fa-search"></i>
                </button>
            </div>
            
            <div class="admin-profile">
                <?php $current_user = wp_get_current_user(); ?>
                <div class="notifications">
                    <i class="fas fa-bell"></i>
                    <span class="badge">3</span>
                </div>
                <div class="profile-dropdown">
                    <img src="<?php echo get_avatar_url($current_user->ID); ?>" alt="Profile">
                    <span><?php echo esc_html($current_user->display_name); ?></span>
                    <div class="dropdown-content">
                        <a href="<?php echo admin_url('profile.php'); ?>">პროფილი</a>
                        <a href="<?php echo wp_logout_url(home_url()); ?>">გასვლა</a>
                    </div>
                </div>
            </div>
        </div>

        <!-- Page Content -->
        <div class="admin-content">
            <?php
            $admin_page = get_query_var('admin_page', 'dashboard');
            $template_path = get_template_directory() . '/admin-dashboard/pages/admin-' . $admin_page . '.php';
            
            if (file_exists($template_path)) {
                include $template_path;
            } else {
                // Default dashboard view
                include get_template_directory() . '/admin-dashboard/pages/admin-dashboard.php';
            }
            ?>
        </div>
    </div>
</div>

<?php get_footer('admin'); // Optional custom footer for admin ?>