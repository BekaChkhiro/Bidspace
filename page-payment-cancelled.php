<?php
/**
 * Template Name: Payment Cancelled
 */

get_header(); ?>

<div class="max-w-4xl mx-auto px-4 py-8">
    <div class="bg-white rounded-lg shadow-md p-6 text-center">
        <div class="text-yellow-500 text-5xl mb-4">
            <i class="fas fa-exclamation-circle"></i>
        </div>
        <h1 class="text-2xl font-bold mb-4">გადახდა გაუქმებულია</h1>
        <p class="text-gray-600 mb-6">
            თქვენ გააუქმეთ გადახდის პროცესი.<br>
            შეგიძლიათ დაუბრუნდეთ აუქციონებს ან სცადოთ გადახდა თავიდან.
        </p>
        <div class="space-x-4">
            <a href="<?php echo esc_url(home_url('/auctions')); ?>" 
               class="inline-block bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors">
                აუქციონებზე დაბრუნება
            </a>
        </div>
    </div>
</div>

<?php get_footer(); ?>