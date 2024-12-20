<?php
/**
 * Custom Fonts Management
 * 
 * @package BidSpace
 */

// Add Font Management Menu to WordPress Admin
function add_font_management_menu() {
    add_menu_page(
        'Font Management',
        'Font Management',
        'manage_options',
        'font-management',
        'render_font_management_page',
        'dashicons-editor-textcolor',
        30
    );
}
add_action('admin_menu', 'add_font_management_menu');

// Add support for font file types
function add_font_mime_types($mime_types) {
    $mime_types['ttf'] = 'application/x-font-ttf';
    $mime_types['otf'] = 'application/x-font-opentype';
    $mime_types['woff'] = 'application/font-woff';
    $mime_types['woff2'] = 'application/font-woff2';
    return $mime_types;
}
add_filter('upload_mimes', 'add_font_mime_types');

// Allow font file uploads
function allow_font_upload($data, $file, $filename, $mimes) {
    $wp_filetype = wp_check_filetype($filename, $mimes);

    $ext = $wp_filetype['ext'];
    $type = $wp_filetype['type'];

    if (in_array($ext, ['ttf', 'otf', 'woff', 'woff2'])) {
        $data['ext'] = $ext;
        $data['type'] = $type;
    }

    return $data;
}
add_filter('wp_check_filetype_and_ext', 'allow_font_upload', 10, 4);

// Create Font Management Page
function render_font_management_page() {
    // Check user capabilities
    if (!current_user_can('manage_options')) {
        return;
    }

    // Save font settings
    if (isset($_POST['save_font_settings']) && check_admin_referer('font_upload_action')) {
        if (!empty($_FILES['custom_font']['name'])) {
            if (!function_exists('wp_handle_upload')) {
                require_once(ABSPATH . 'wp-admin/includes/file.php');
            }

            $uploaded_file = $_FILES['custom_font'];
            $upload_overrides = array('test_form' => false);
            $movefile = wp_handle_upload($uploaded_file, $upload_overrides);

            if ($movefile && !isset($movefile['error'])) {
                update_option('custom_font_url', $movefile['url']);
                echo '<div class="notice notice-success"><p>ფონტი წარმატებით აიტვირთა!</p></div>';
            } else {
                echo '<div class="notice notice-error"><p>შეცდომა ფონტის ატვირთვისას: ' . $movefile['error'] . '</p></div>';
            }
        }
    }

    $current_font_url = get_option('custom_font_url', '');
    ?>
    <div class="wrap">
        <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
        <form method="post" enctype="multipart/form-data">
            <?php wp_nonce_field('font_upload_action'); ?>
            <table class="form-table">
                <tr>
                    <th scope="row">ფონტის ატვირთვა</th>
                    <td>
                        <input type="file" name="custom_font" accept=".woff,.woff2,.ttf,.otf" />
                        <p class="description">ატვირთეთ თქვენი ფონტის ფაილი (მხარდაჭერილი ფორმატები: .woff, .woff2, .ttf, .otf)</p>
                    </td>
                </tr>
                <?php if ($current_font_url): ?>
                <tr>
                    <th scope="row">მიმდინარე ფონტი</th>
                    <td>
                        <p>მიმდინარე ფონტი აქტიურია</p>
                    </td>
                </tr>
                <?php endif; ?>
            </table>
            <p class="submit">
                <input type="submit" name="save_font_settings" class="button button-primary" value="ფონტის პარამეტრების შენახვა" />
            </p>
        </form>
    </div>
    <?php
}

// Apply custom font to the website
function apply_custom_font() {
    $custom_font_url = get_option('custom_font_url', '');
    if (!empty($custom_font_url)) {
        $font_extension = pathinfo($custom_font_url, PATHINFO_EXTENSION);
        $font_format = 'truetype';
        if ($font_extension === 'woff') $font_format = 'woff';
        if ($font_extension === 'woff2') $font_format = 'woff2';
        if ($font_extension === 'otf') $font_format = 'opentype';
        ?>
        <style>
            @font-face {
                font-family: 'CustomFont';
                src: url('<?php echo esc_url($custom_font_url); ?>') format('<?php echo $font_format; ?>');
                font-weight: normal;
                font-style: normal;
                font-display: swap;
            }
            
            /* ყველა ტექსტისთვის ფონტის გამოყენება */
            :not(.dashicons):not(.dashicons-before):not([class^="dashicons-"]):not([class*=" dashicons-"]) {
                font-family: 'CustomFont', sans-serif !important;
            }

            /* WordPress ადმინ აიქონების გამონაკლისი */
            .dashicons,
            .dashicons-before:before,
            [class^="dashicons-"]:before,
            [class*=" dashicons-"]:before,
            #wpadminbar *:before,
            .wp-admin select,
            #adminmenu .wp-menu-image:before {
                font-family: dashicons !important;
            }
        </style>
        <?php
    }
}

// ფრონტენდზე ფონტის გამოყენება
add_action('wp_head', 'apply_custom_font');

// ადმინ პანელში ფონტის გამოყენება
add_action('admin_head', 'apply_custom_font');
