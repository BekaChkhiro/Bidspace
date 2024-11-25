<?php
/**
 * Main functions file
 */

// Include all functionality files
require_once get_template_directory() . '/includes/setup.php';
require_once get_template_directory() . '/includes/auth.php';
require_once get_template_directory() . '/includes/auction.php';
require_once get_template_directory() . '/includes/comments.php';
require_once get_template_directory() . '/includes/admin.php';

// Add CORS headers
function add_cors_headers() {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-WP-Nonce');
}
add_action('init', 'add_cors_headers');

// Add AJAX URL to page
function add_ajax_url_to_head() {
    ?>
    <script type="text/javascript">
        var ajaxurl = '<?php echo admin_url('admin-ajax.php'); ?>';
    </script>
    <?php
}
add_action('wp_head', 'add_ajax_url_to_head');