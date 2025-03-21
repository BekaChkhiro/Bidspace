<?php
/**
 * Template Name: Payment Success
 */

get_header(); ?>

<div class="max-w-4xl mx-auto px-4 py-8">
    <div class="bg-white rounded-lg shadow-md p-6 text-center">
        <div class="text-green-500 text-5xl mb-4">
            <i class="fas fa-check-circle"></i>
        </div>
        <h1 class="text-2xl font-bold mb-4">გადახდა წარმატებით დასრულდა</h1>
        <p class="text-gray-600 mb-6">გილოცავთ! თქვენი გადახდა წარმატებით დასრულდა.</p>
        <a href="<?php echo esc_url(home_url('/')); ?>" 
           class="inline-block bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors">
            მთავარ გვერდზე დაბრუნება
        </a>
    </div>
</div>

<?php get_footer(); ?>