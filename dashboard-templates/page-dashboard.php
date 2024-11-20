<?php
/*
Template Name: Dashboard Parameters
*/

function dashboard_content() {
    ?>
    <div class="w-full flex flex-col gap-3 p-6 bg-white rounded-2xl">
                <span class="text-lg font-bold">დღეს</span>
                <div class="w-full flex justify-between items-center gap-4">
                    <div class="w-1/3 flex flex-col gap-6 p-4 rounded-2xl" 
                    style="background: url('<?php echo get_stylesheet_directory_uri() ?>/icons/dashboard/win_auctions_with_bg.svg'), #DCFCE7;
                        background-repeat: no-repeat;
                        background-size: 55px 55px;
                        background-position: bottom 10px right 10px;
                    ">
                        <span class="text-lg font-bold">მოგებული აუქციონები</span>
                        <span class="font-bold text-3xl">10</span>
                    </div>

                    <div class="w-1/3 flex flex-col gap-6 p-4 rounded-2xl" 
                    style="background: url('<?php echo get_stylesheet_directory_uri() ?>/icons/dashboard/active_auctions_icon.svg'), #FFF4DE;
                        background-repeat: no-repeat; 
                        background-size: 55px 55px;
                        background-position: bottom 10px right 10px;
                    ">
                        <span class="text-lg font-bold">მიმდინარე აუქციონები</span>
                        <span class="font-bold text-3xl">11</span>
                    </div>

                    <div class="w-1/3 flex flex-col gap-4 p-6 rounded-2xl" 
                    style="background: url('<?php echo get_stylesheet_directory_uri() ?>/icons/dashboard/end_auctions_icon.svg'), #F3E8FF;
                        background-repeat: no-repeat; 
                        background-size: 55px 55px;
                        background-position: bottom 10px right 10px;
                    ">
                        <span class="text-lg font-bold">დასრულებული აუქციონები</span>
                        <span class="font-bold text-3xl">16</span>
                    </div>
            </div>
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
