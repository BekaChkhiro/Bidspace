<?php
/*
Template Name: Dashboard My Auctions
*/

function dashboard_content() {
    $current_user = wp_get_current_user();
    $paged = (get_query_var('paged')) ? get_query_var('paged') : 1;
    
    // წაშლის ლოგიკა
    if (isset($_POST['delete_auction']) && isset($_POST['auction_id'])) {
        $auction_id = intval($_POST['auction_id']);
        $auction = get_post($auction_id);
        
        if ($auction && $auction->post_author == $current_user->ID) {
            wp_delete_post($auction_id, true);
            // შეტყობინების დამატება წარმატებული წაშლის შესახებ
            add_action('wp_footer', function() {
                echo '<script>alert("აუქციონი წარმატებით წაიშალა");</script>';
            });
        }
    }
    
    $args = array(
        'post_type' => 'auction',
        'author' => $current_user->ID,
        'posts_per_page' => 10,
        'paged' => $paged
    );
    
    $auctions = new WP_Query($args);
    ?>
    
    <div class="container mx-auto p-6 bg-white rounded-2xl">
        <h2 class="text-2xl font-bold mb-6">ჩემი აუქციონები</h2>
        
        <?php if ($auctions->have_posts()) : ?>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                <?php while ($auctions->have_posts()) : $auctions->the_post(); ?>
                    <div class="w-full flex flex-col gap-4 p-4 rounded-2xl relative" style="background: #E5ECF6;">
                        <h3 class="text-xl font-semibold mb-2"><?php the_title(); ?></h3>
                        <div class="flex justify-between items-center">
                            <div class="w-2/6 flex justify-start gap-3">
                                <img src="<?php echo get_stylesheet_directory_uri() ?>/icons/dashboard/date_icon.svg" alt="date icon">
                                <span><?php echo get_post_meta(get_the_ID(), 'start_time', true); ?></span>
                            </div>
                            <div class="w-1/5 flex justify-start gap-3">
                                <img src="<?php echo get_stylesheet_directory_uri() ?>/icons/dashboard/map_icon.svg" alt="map icon">
                                <span><?php echo get_post_meta(get_the_ID(), 'city', true); ?></span>
                            </div>
                            <div class="w-2/6 flex justify-start gap-3">
                                <strong>აუქციონის ფასი:</strong> <?php echo get_post_meta(get_the_ID(), 'auction_price', true); ?> ₾
                            </div>
                            <div class="w-1/6 flex justify-end">
                                <button class="edit-button inline-flex items-center px-2 py-2 text-white rounded-full" style="background-color: #00AEEF;" data-auction-id="<?php echo get_the_ID(); ?>">
                                    <img src="<?php echo get_stylesheet_directory_uri() ?>/icons/dashboard/my_auctions_edit_icon.svg" alt="edit icon">
                                </button>
                            </div>
                        </div>
                        <div class="edit-options hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10" style="top: 100%; box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;">
                            <a href="<?php echo home_url('/auction/' . get_the_ID()); ?>" class="flex gap-4 px-4 items-center py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md" style="border-bottom-right-radius: 0px; border-bottom-left-radius: 0px;">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                                </svg>
                                <span>ნახვა</span>
                            </a>
                            <a href="<?php echo add_query_arg('auction_id', get_the_ID(), home_url('/dashboard/edit-auction')); ?>" class="flex gap-4 px-4 items-center py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <img src="<?php echo get_stylesheet_directory_uri() ?>/icons/dashboard/custom_edit_icon.svg" alt="edit icon" style="width: 20px">    
                                <span>რედაქტირება</span>
                            </a>
                            <button class="delete-auction-btn flex gap-4 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md" style="border-top-right-radius: 0px; border-top-left-radius: 0px;" data-auction-id="<?php echo get_the_ID(); ?>">
                                <img src="<?php echo get_stylesheet_directory_uri() ?>/icons/dashboard/trash_icon.svg" alt="delete icon" style="width: 20px">   
                                <span style="color: #FB6B63">წაშლა</span>
                            </button>
                        </div>
                    </div>
                <?php endwhile; ?>
            </div>
            
            <div class="mt-6">
                <?php
                echo paginate_links(array(
                    'total' => $auctions->max_num_pages,
                    'current' => $paged,
                    'prev_text' => __('&laquo; Previous'),
                    'next_text' => __('Next &raquo;'),
                ));
                ?>
            </div>
        <?php else : ?>
            <p>თქვენ ჯერ არ გაქვთ დამატებული აუქციონები.</p>
        <?php endif; ?>
        
        <?php wp_reset_postdata(); ?>
    </div>

    <!-- Delete Confirmation Modal -->
    <div id="delete-modal" class="fixed z-10 inset-0 overflow-y-auto hidden" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div class="sm:flex sm:items-start">
                        <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                            <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                            <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                აუქციონის წაშლა
                            </h3>
                            <div class="mt-2">
                                <p class="text-sm text-gray-500">
                                    დარწმუნებული ხართ, რომ გსურთ ამ აუქციონის წაშლა? ე��� მოქმედება შეუქცევადია.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button type="button" id="confirm-delete" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">
                        წაშლა
                    </button>
                    <button type="button" id="cancel-delete" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                        გაუქმება
                    </button>
                </div>
            </div>
        </div>
    </div>
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        const deleteButtons = document.querySelectorAll('.delete-auction-btn');
        const deleteModal = document.getElementById('delete-modal');
        const confirmDeleteBtn = document.getElementById('confirm-delete');
        const cancelDeleteBtn = document.getElementById('cancel-delete');
        let currentAuctionId = null;

        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                currentAuctionId = this.getAttribute('data-auction-id');
                deleteModal.classList.remove('hidden');
            });
        });

        cancelDeleteBtn.addEventListener('click', function() {
            deleteModal.classList.add('hidden');
            currentAuctionId = null;
        });

        confirmDeleteBtn.addEventListener('click', function() {
            if (currentAuctionId) {
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = '';
                
                const auctionIdInput = document.createElement('input');
                auctionIdInput.type = 'hidden';
                auctionIdInput.name = 'auction_id';
                auctionIdInput.value = currentAuctionId;
                form.appendChild(auctionIdInput);

                const deleteAuctionInput = document.createElement('input');
                deleteAuctionInput.type = 'hidden';
                deleteAuctionInput.name = 'delete_auction';
                deleteAuctionInput.value = '1';
                form.appendChild(deleteAuctionInput);

                document.body.appendChild(form);
                form.submit();
            }
        });

        // გახსნილი ოფციების მენიუს დახურვა გარე კლიკზე
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.edit-options') && !e.target.closest('.edit-button')) {
                document.querySelectorAll('.edit-options').forEach(options => {
                    options.classList.add('hidden');
                });
            }
        });

        // რედაქტირების ღილაკზე კლიკის დამუშავება
        document.querySelectorAll('.edit-button').forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const optionsElement = this.closest('.relative').querySelector('.edit-options');
                document.querySelectorAll('.edit-options').forEach(options => {
                    if (options !== optionsElement) {
                        options.classList.add('hidden');
                    }
                });
                optionsElement.classList.toggle('hidden');
            });
        });
    });
    </script>
    <?php
}

include(get_template_directory() . '/dashboard-templates/dashboard-layout.php');
?>