<?php
/**
 * Template Name: Payment Cancelled
 */

get_header();

$order_id = isset($_GET['order_id']) ? sanitize_text_field($_GET['order_id']) : '';

// Get auction details by order ID
$args = array(
    'post_type' => 'auction',
    'meta_query' => array(
        array(
            'key' => 'payment_order_id',
            'value' => $order_id
        )
    )
);

$auctions = get_posts($args);
$auction = !empty($auctions) ? $auctions[0] : null;
?>

<div class="container mx-auto px-4 py-8">
    <div class="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div class="text-center mb-6">
            <svg class="w-16 h-16 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            <h2 class="text-2xl font-bold text-gray-800 mb-2">გადახდა გაუქმდა</h2>
            <?php if ($auction): ?>
                <p class="text-gray-600 mb-4">
                    აუქციონი: <?php echo esc_html($auction->post_title); ?>
                </p>
            <?php endif; ?>
            <p class="text-yellow-600">თქვენ გააუქმეთ გადახდის პროცესი</p>
        </div>

        <div class="space-y-4">
            <div class="text-center">
                <?php if ($auction): ?>
                    <a href="<?php echo esc_url(get_permalink($auction->ID)); ?>" 
                       class="inline-block bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors">
                        აუქციონზე დაბრუნება
                    </a>
                <?php else: ?>
                    <a href="<?php echo esc_url(home_url('/')); ?>" 
                       class="inline-block bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors">
                        მთავარ გვერდზე დაბრუნება
                    </a>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<?php get_footer(); ?>