<?php
/*
Template Name: Dashboard Parameters
*/

function dashboard_content() {
    ?>
    <h2>სურვილების სიის გვერდი</h2>
    <!-- Add your parameters content here -->
    
    <?php
}

// Include any specific styles or scripts for this page
function dashboard_styles() {
    // Add your specific styles here
}

function dashboard_scripts() {
    // Add your specific scripts here
}

dashboard_styles();
dashboard_scripts();

include(get_template_directory() . '/dashboard-templates/dashboard-layout.php');
?>