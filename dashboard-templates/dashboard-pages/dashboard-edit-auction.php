<?php
/*
Template Name: Dashboard Edit Auction
*/

function dashboard_content() {
    $auction_id = isset($_GET['auction_id']) ? intval($_GET['auction_id']) : 0;
    $auction = get_post($auction_id);

    if (!$auction || $auction->post_author != get_current_user_id() || $auction->post_type != 'auction') {
        echo '<p>არასწორი აუქციონის ID ან თქვენ არ გაქვთ ამ აუქციონის რედაქტირების უფლება.</p>';
        return;
    }

    // Handle auction deletion
    if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['delete_auction'])) {
        wp_delete_post($auction_id, true);
        echo '<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">აუქციონი წარმატებით წაიშალა.</div>';
        echo '<p><a href="' . esc_url(home_url('/dashboard')) . '" class="text-blue-500 hover:underline">დაბრუნდით დეშბორდზე</a></p>';
        return;
    }

    // Handle auction update
    if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['update_auction'])) {
        // Validate and sanitize input
        $title = sanitize_text_field($_POST['title']);
        $category = isset($_POST['category']) ? sanitize_text_field($_POST['category']) : '';
        
        // Update post
        $updated_auction = array(
            'ID' => $auction_id,
            'post_title' => $title,
            'post_content' => wp_kses_post($_POST['ticket_information']),
            'post_type' => 'auction'
        );
        wp_update_post($updated_auction);

        // Update category with debugging
        if (!empty($category)) {
            // შევამოწმოთ არსებული კატეგორია
            $current_terms = wp_get_object_terms($auction_id, 'auction_category');
            error_log('Current terms: ' . print_r($current_terms, true));
            
            // წავშალოთ ყველა არსებული კატეგორია
            wp_remove_object_terms($auction_id, wp_get_object_terms($auction_id, 'auction_category', array('fields' => 'ids')), 'auction_category');
            
            // დავამატოთ ახალი კატეგორია
            $result = wp_set_object_terms($auction_id, array($category), 'auction_category');
            error_log('Set terms result: ' . print_r($result, true));
            
            // განვაახლოთ მეტა ველი
            update_post_meta($auction_id, 'category', $category);
            
            // შევამოწმოთ განახლებული კატეგორია
            $updated_terms = wp_get_object_terms($auction_id, 'auction_category');
            error_log('Updated terms: ' . print_r($updated_terms, true));
            
            // დავამატოთ შეტყობინება მომხმარებლისთვის
            echo '<div class="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4" role="alert">
                    კატეგორია: ' . esc_html($category) . ' 
                  </div>';
        }

        // Update meta fields
        $meta_fields = array(
            'start_date' => sanitize_text_field($_POST['start_date']),
            'city' => sanitize_text_field($_POST['city']),
            'ticket_price' => floatval($_POST['ticket_price']),
            'ticket_quantity' => intval($_POST['ticket_quantity']),
            'start_time' => sanitize_text_field($_POST['start_time']),
            'due_time' => sanitize_text_field($_POST['due_time']),
            'auction_price' => floatval($_POST['auction_price']),
            'min_bid_price' => floatval($_POST['min_bid_price']),
            'buy_now' => floatval($_POST['buy_now'])
        );

        // Add skhva_qalaqebi if city is 'skhva_qalaqebi'
        if ($_POST['city'] === 'skhva_qalaqebi' && isset($_POST['skhva_qalaqebi'])) {
            $meta_fields['skhva_qalaqebi'] = sanitize_text_field($_POST['skhva_qalaqebi']);
        }

        // Add sazgvargaret if city is 'sazgvargaret'
        if ($_POST['city'] === 'sazgvargaret' && isset($_POST['sazgvargaret'])) {
            $meta_fields['sazgvargaret'] = sanitize_text_field($_POST['sazgvargaret']);
        }

        // Category-specific fields
        if (isset($_POST['hall'])) $meta_fields['hall'] = sanitize_text_field($_POST['hall']);
        if (isset($_POST['row'])) $meta_fields['row'] = sanitize_text_field($_POST['row']);
        if (isset($_POST['place'])) $meta_fields['place'] = sanitize_text_field($_POST['place']);
        if (isset($_POST['sector'])) $meta_fields['sector'] = sanitize_text_field($_POST['sector']);

        // Update all meta fields
        foreach ($meta_fields as $key => $value) {
            update_post_meta($auction_id, $key, $value);
        }

        // Handle featured image update
        if (!empty($_FILES['featured_image']['name'])) {
            require_once(ABSPATH . 'wp-admin/includes/image.php');
            require_once(ABSPATH . 'wp-admin/includes/file.php');
            require_once(ABSPATH . 'wp-admin/includes/media.php');

            $attachment_id = media_handle_upload('featured_image', $auction_id);
            if (!is_wp_error($attachment_id)) {
                set_post_thumbnail($auction_id, $attachment_id);
            }
        }

        echo '<div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                აუქციონი წარმატებით განახლდა.
              </div>';
    }

    // Get current category
    $current_category = '';
    $current_terms = wp_get_object_terms($auction_id, 'auction_category');
    if (!empty($current_terms) && !is_wp_error($current_terms)) {
        $current_category = $current_terms[0]->slug;
    } else {
        $current_category = get_post_meta($auction_id, 'category', true);
    }
    ?>

    <style>
        .category-btn {
            padding: 10px 20px;
            margin: 5px;
            background-color: #f0f0f0;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
        .category-btn.active {
            background-color: #00AEEF;
            color: white;
        }
        .scrollable-content {
            max-height: calc(100vh - 100px);
            overflow-y: auto;
            padding-right: 20px;
        }
        .scrollable-content::-webkit-scrollbar {
            width: 6px;
        }
        .scrollable-content::-webkit-scrollbar-track {
            background: #f1f1f1;
        }
        .scrollable-content::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 3px;
        }
        .scrollable-content::-webkit-scrollbar-thumb:hover {
            background: #555;
        }
        .city-btn {
            padding: 8px 16px;
            background-color: #f0f0f0;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .city-btn.active {
            background-color: #00AEEF;
            color: white;
        }
    </style>

    <div class="flex flex-row -mx-3 justify-between gap-6" style="height: 100%">
        <!-- Left side - Form -->
        <div class="w-full lg:w-8/12 px-3 scrollable-content">
            <h2 class="text-2xl font-bold mb-6">აუქციონის რედაქტირება</h2>
            <form method="post" action="" enctype="multipart/form-data" class="space-y-6" id="edit-auction-form">
                <!-- Title -->
                <div>
                    <label for="title" class="block text-sm font-medium text-gray-700">სათაური</label>
                    <input type="text" id="title" name="title" value="<?php echo esc_attr($auction->post_title); ?>" required 
                           class="settings-field-style mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                </div>

                <!-- Category Selection -->
                <div>
                    <h3 class="text-lg font-medium mb-4">კატეგორია</h3>
                    <div class="category-buttons">
                        <?php
                        $categories = array(
                            'cinema_theater' => 'კინო & თეატრი',
                            'events' => 'ივენთები',
                            'sport' => 'სპორტი',
                            'travel' => 'მოგზაურობა'
                        );
                        
                        foreach ($categories as $value => $label) {
                            $isActive = $current_category === $value ? 'active' : '';
                            echo "<button type='button' 
                                          class='category-btn {$isActive}' 
                                          data-category='{$value}'>{$label}</button>";
                        }
                        ?>
                    </div>
                    <input type="hidden" name="category" id="category-input" value="<?php echo esc_attr($current_category); ?>">
                </div>

                <!-- Category Fields -->
                <div id="category-fields" class="mt-4">
                    <!-- Category-specific fields will be dynamically inserted here -->
                </div><!-- Auction Details -->
                <div>
                    <h3 class="text-lg font-medium mb-4">აუქციონის დეტალები</h3>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label for="start_time" class="block text-sm font-medium text-gray-700">დაწყების დრო</label>
                            <input type="datetime-local" id="start_time" name="start_time" 
                                   value="<?php echo esc_attr(get_post_meta($auction_id, 'start_time', true)); ?>" required 
                                   class="settings-field-style mt-1 block w-full">
                        </div>
                        <div>
                            <label for="due_time" class="block text-sm font-medium text-gray-700">დასრულების დრო</label>
                            <input type="datetime-local" id="due_time" name="due_time" 
                                   value="<?php echo esc_attr(get_post_meta($auction_id, 'due_time', true)); ?>" required 
                                   class="settings-field-style mt-1 block w-full">
                        </div>
                    </div>

                    <div class="mt-4">
                        <label for="auction_price" class="block text-sm font-medium text-gray-700">აუქციონის ფასი</label>
                        <input type="number" step="0.01" id="auction_price" name="auction_price" 
                               value="<?php echo esc_attr(get_post_meta($auction_id, 'auction_price', true)); ?>" required 
                               class="settings-field-style mt-1 block w-full">
                    </div>

                    <div class="mt-4">
                        <label for="min_bid_price" class="block text-sm font-medium text-gray-700">მინიმალური ბიდი</label>
                        <input type="number" step="0.01" id="min_bid_price" name="min_bid_price" 
                               value="<?php echo esc_attr(get_post_meta($auction_id, 'min_bid_price', true)); ?>" required 
                               class="settings-field-style mt-1 block w-full">
                    </div>

                    <div class="mt-4">
                        <label for="buy_now" class="block text-sm font-medium text-gray-700">ახლავე ყიდვის ფასი</label>
                        <input type="number" step="0.01" id="buy_now" name="buy_now" 
                               value="<?php echo esc_attr(get_post_meta($auction_id, 'buy_now', true)); ?>" 
                               class="settings-field-style mt-1 block w-full">
                    </div>

                    <div class="mt-4">
                        <label for="featured_image" class="block text-sm font-medium text-gray-700">მთავარი სურათი</label>
                        <?php if (has_post_thumbnail($auction_id)): ?>
                            <div class="mb-2">
                                <?php echo get_the_post_thumbnail($auction_id, 'thumbnail'); ?>
                            </div>
                        <?php endif; ?>
                        <input type="file" id="featured_image" name="featured_image" accept="image/*" 
                               class="settings-field-style mt-1 block w-full">
                    </div>

                    <div class="flex justify-between items-center mt-6">
                        <input type="submit" name="update_auction" value="განახლება" 
                               class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" 
                               style="background-color: #00AEEF;">
                        <button type="button" id="delete-auction-btn" 
                                class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                            წაშლა
                        </button>
                    </div>
                </div>
            </form>
        </div>

        <!-- Right side - Preview -->
        <div class="w-full lg:w-4/12 px-6 border-l">
            <h2 class="text-2xl font-bold mb-6">ვიზუალი</h2>
            <div id="auction-preview" class="bg-white rounded-2xl p-4 shadow-lg flex flex-col justify-between">
                <!-- Preview content will be dynamically inserted here -->
            </div>
        </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div id="delete-modal" class="fixed z-10 inset-0 overflow-y-auto hidden" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <!-- Modal content -->
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
                                    დარწმუნებული ხართ, რომ გსურთ ამ აუქციონის წაშლა? ეს მოქმედება შეუქცევადია.
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
        const form = document.getElementById('edit-auction-form');
        const categoryButtons = document.querySelectorAll('.category-btn');
        const categoryFields = document.getElementById('category-fields');
        const categoryInput = document.getElementById('category-input');
        const deleteBtn = document.getElementById('delete-auction-btn');
        const deleteModal = document.getElementById('delete-modal');
        const confirmDeleteBtn = document.getElementById('confirm-delete');
        const cancelDeleteBtn = document.getElementById('cancel-delete');

        // Initialize with current category
        const currentCategory = '<?php echo $current_category; ?>';
        if (currentCategory) {
            showCategoryFields(currentCategory);
        }

        // Category button functionality
        categoryButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Update button states
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Update hidden input
                const selectedCategory = button.dataset.category;
                categoryInput.value = selectedCategory;
                console.log('Selected category:', selectedCategory);
                
                // Update fields and preview
                showCategoryFields(selectedCategory);
                updatePreview();
            });
        });

        function showCategoryFields(category) {
            const fields = getCategoryFields(category);
            categoryFields.innerHTML = fields;
            populateCategoryFields(category);
            addCategoryFieldListeners();
            initializeCityButtons();
        }

        function populateCategoryFields(category) {
            // Common fields population
            document.getElementById('start_date').value = '<?php echo esc_attr(get_post_meta($auction_id, "start_date", true)); ?>';
            document.getElementById('city').value = '<?php echo esc_attr(get_post_meta($auction_id, "city", true)); ?>';
            document.getElementById('ticket_price').value = '<?php echo esc_attr(get_post_meta($auction_id, "ticket_price", true)); ?>';
            document.getElementById('ticket_quantity').value = '<?php echo esc_attr(get_post_meta($auction_id, "ticket_quantity", true)); ?>';
            document.getElementById('ticket_information').value = `<?php echo esc_textarea($auction->post_content); ?>`;

            // Category-specific fields population
            const categoryFields = {
                cinema_theater: ['hall', 'row', 'place'],
                sport: ['sector', 'row', 'place'],
                travel: ['hall', 'row', 'place']
            };

            categoryFields[category]?.forEach(field => {
                const element = document.getElementById(field);
                if (element) {
                    element.value = '<?php echo addslashes(esc_attr(get_post_meta($auction_id, "' + field + '", true))); ?>';
                }
            });
        }

        function getCategoryFields(category) {
            const commonFields = `
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">ქალაქი</label>
                    <div class="city-buttons flex flex-wrap gap-2">
                        <button type="button" class="city-btn" data-value="tbilisi">თბილისი</button>
                        <button type="button" class="city-btn" data-value="batumi">ბათუმი</button>
                        <button type="button" class="city-btn" data-value="kutaisi">ქუთაისი</button>
                        <button type="button" class="city-btn" data-value="skhva_qalaqebi">სხვა ქალაქები</button>
                        <button type="button" class="city-btn" data-value="sazgvargaret">საზღვარგარეთ</button>
                    </div>
                    <input type="hidden" id="city" name="city" required>
                    <div id="other-city-field" class="mt-2" style="display: none;">
                        <input type="text" 
                               id="skhva_qalaqebi" 
                               name="skhva_qalaqebi" 
                               placeholder="ჩაწერეთ ქალაქი"
                               class="settings-field-style mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                    </div>
                    <div id="sazgvargaret-field" class="mt-2" style="display: none;">
                        <input type="text" 
                               id="sazgvargaret" 
                               name="sazgvargaret" 
                               placeholder="ჩაწერეთ ქვეყანა"
                               class="settings-field-style mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                    </div>
                </div>
                <div class="mt-4 grid grid-cols-1 gap-4">
                    <div>
                        <label for="start_date" class="block text-sm font-medium text-gray-700">დაწყების თარიღი</label>
                        <input type="datetime-local" id="start_date" name="start_date" required class="settings-field-style mt-1 block w-full">
                    </div>
                    <div>
                        <label for="ticket_price" class="block text-sm font-medium text-gray-700">ბილეთის ფასი</label>
                        <input type="number" step="0.01" id="ticket_price" name="ticket_price" required class="settings-field-style mt-1 block w-full">
                    </div>
                    <div>
                        <label for="ticket_quantity" class="block text-sm font-medium text-gray-700">ბილეთების რაოდენობა</label>
                        <input type="number" id="ticket_quantity" name="ticket_quantity" required class="settings-field-style mt-1 block w-full">
                    </div>
                </div>
            `;

            const categorySpecificFields = {
                cinema_theater: `
                    <div class="mt-4 grid grid-cols-1 gap-4">
                        <div>
                            <label for="hall" class="block text-sm font-medium text-gray-700">დარბაზი</label>
                            <input type="text" id="hall" name="hall" required class="settings-field-style mt-1 block w-full">
                        </div>
                        <div>
                            <label for="row" class="block text-sm font-medium text-gray-700">რიგი</label>
                            <input type="text" id="row" name="row" required class="settings-field-style mt-1 block w-full">
                        </div>
                        <div>
                            <label for="place" class="block text-sm font-medium text-gray-700">ადგილი</label>
                            <input type="text" id="place" name="place" required class="settings-field-style mt-1 block w-full">
                        </div>
                    </div>
                `,
                sport: `
                    <div class="mt-4 grid grid-cols-1 gap-4">
                        <div>
                            <label for="sector" class="block text-sm font-medium text-gray-700">სექტრი</label>
                            <input type="text" id="sector" name="sector" required class="settings-field-style mt-1 block w-full">
                        </div>
                        <div>
                            <label for="row" class="block text-sm font-medium text-gray-700">რიგი</label>
                            <input type="text" id="row" name="row" required class="settings-field-style mt-1 block w-full">
                        </div>
                        <div>
                            <label for="place" class="block text-sm font-medium text-gray-700">ადგილი</label>
                            <input type="text" id="place" name="place" required class="settings-field-style mt-1 block w-full">
                        </div>
                    </div>
                `,
                travel: `
                    <div class="mt-4 grid grid-cols-1 gap-4">
                        <div>
                            <label for="hall" class="block text-sm font-medium text-gray-700">დარბაზი</label>
                            <input type="text" id="hall" name="hall" required class="settings-field-style mt-1 block w-full">
                        </div>
                        <div>
                            <label for="row" class="block text-sm font-medium text-gray-700">რიგი</label>
                            <input type="text" id="row" name="row" required class="settings-field-style mt-1 block w-full">
                        </div>
                        <div>
                            <label for="place" class="block text-sm font-medium text-gray-700">ადგილი</label>
                            <input type="text" id="place" name="place" required class="settings-field-style mt-1 block w-full">
                        </div>
                    </div>
                `,
                events: ``
            };

            return `
                ${commonFields}
                ${categorySpecificFields[category] || ''}
                <div class="mt-4">
                    <label for="ticket_information" class="block text-sm font-medium text-gray-700">ბილეთის ინფორმაცია</label>
                    <textarea id="ticket_information" name="ticket_information" rows="4" class="settings-field-style mt-1 block w-full"></textarea>
                </div>
            `;
        }

        function addCategoryFieldListeners() {
            const fields = categoryFields.querySelectorAll('input, textarea');
            fields.forEach(field => {
                field.addEventListener('input', updatePreview);
            });
        }

        function updatePreview() {
            const previewElement = document.getElementById('auction-preview');
            const title = document.getElementById('title').value;
            const category = categoryInput.value;
            const startDate = document.getElementById('start_date')?.value;
            const ticketPrice = document.getElementById('ticket_price')?.value;
            const auctionPrice = document.getElementById('auction_price')?.value;

            const categoryNames = {
                cinema_theater: 'კინო & თატრი',
                events: 'ივენთები',
                sport: 'სპორტი',
                travel: 'მოგზაურობა'
            };

            previewElement.innerHTML = `
                <div class="relative" style="height: 180px;">
                    <img src="${document.getElementById('featured_image')?.files[0] 
                        ? URL.createObjectURL(document.getElementById('featured_image').files[0])
                        : '<?php echo has_post_thumbnail($auction_id) ? get_the_post_thumbnail_url($auction_id) : get_stylesheet_directory_uri() . "/images/placeholder.jpg"; ?>'}" 
                    alt="Preview" class="w-full h-full object-cover rounded-xl">
                    <div class="absolute top-2 left-2 px-2 py-1 rounded-full text-white text-sm bg-gray-500">
                        ${categoryNames[category] || ''}
                    </div>
                </div>
                <div class="flex justify-between items-center mt-4">
                    <h4 class="text-lg font-bold">${title}</h4>
                    <img src="<?php echo get_stylesheet_directory_uri(); ?>/icons/heart_icon.svg" alt="heart icon">
                </div>
                <div class="flex justify-between items-center mt-4">
                    <div class="w-1/2">
                        <h5 class="text-black font-normal text-lg">ბილეთის ფასი</h5>
                        <span class="text-black font-normal text-lg">${ticketPrice || 0}₾</span>
                    </div>
                    <div class="w-1/2">
                        <h5 class="text-black font-normal text-lg">მიმდინარე ფასი</h5>
                        <span class="text-black font-normal text-lg" style="color: #00AEEF">${auctionPrice || 0}₾</span>
                    </div>
                </div>
                <p class="mt-4">დაწყების თარიღი: ${startDate || ''}</p>
            `;
        }

        // Delete functionality
        deleteBtn?.addEventListener('click', () => deleteModal.classList.remove('hidden'));
        cancelDeleteBtn?.addEventListener('click', () => deleteModal.classList.add('hidden'));
        confirmDeleteBtn?.addEventListener('click', () => {
            const deleteForm = document.createElement('form');
            deleteForm.method = 'POST';
            deleteForm.innerHTML = '<input type="hidden" name="delete_auction" value="1">';
            document.body.appendChild(deleteForm);
            deleteForm.submit();
        });

        // Initial preview
        updatePreview();

        function initializeCityButtons() {
            const cityButtons = document.querySelectorAll('.city-btn');
            const cityInput = document.getElementById('city');
            const otherCityField = document.getElementById('other-city-field');
            const sazgvargaretField = document.getElementById('sazgvargaret-field');
            const skhvaQalaqebiInput = document.getElementById('skhva_qalaqebi');
            const sazgvargaretInput = document.getElementById('sazgvargaret');
            
            // Get current values from database
            const currentCity = '<?php echo esc_attr(get_post_meta($auction_id, "city", true)); ?>';
            const currentSkhvaQalaqebi = '<?php echo esc_attr(get_post_meta($auction_id, "skhva_qalaqebi", true)); ?>';
            const currentSazgvargaret = '<?php echo esc_attr(get_post_meta($auction_id, "sazgvargaret", true)); ?>';

            cityButtons.forEach(button => {
                // Set initial active state based on saved value
                if (currentCity === 'skhva_qalaqebi') {
                    if (button.dataset.value === 'skhva_qalaqebi') {
                        button.classList.add('active');
                        otherCityField.style.display = 'block';
                        skhvaQalaqebiInput.value = currentSkhvaQalaqebi;
                        skhvaQalaqebiInput.required = true;
                        cityInput.value = 'skhva_qalaqebi';
                    }
                } else if (currentCity === 'sazgvargaret') {
                    if (button.dataset.value === 'sazgvargaret') {
                        button.classList.add('active');
                        sazgvargaretField.style.display = 'block';
                        sazgvargaretInput.value = currentSazgvargaret;
                        sazgvargaretInput.required = true;
                        cityInput.value = 'sazgvargaret';
                    }
                } else if (button.dataset.value === currentCity) {
                    button.classList.add('active');
                    cityInput.value = currentCity;
                }

                button.addEventListener('click', () => {
                    cityButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    cityInput.value = button.dataset.value;

                    // Hide both fields first
                    otherCityField.style.display = 'none';
                    sazgvargaretField.style.display = 'none';
                    skhvaQalaqebiInput.required = false;
                    sazgvargaretInput.required = false;
                    
                    // Show appropriate field based on selection
                    if (button.dataset.value === 'skhva_qalaqebi') {
                        otherCityField.style.display = 'block';
                        skhvaQalaqebiInput.required = true;
                    } else if (button.dataset.value === 'sazgvargaret') {
                        sazgvargaretField.style.display = 'block';
                        sazgvargaretInput.required = true;
                    }

                    updatePreview();
                });
            });

            // Add input event listeners
            if (skhvaQalaqebiInput) {
                skhvaQalaqebiInput.addEventListener('input', updatePreview);
            }
            if (sazgvargaretInput) {
                sazgvargaretInput.addEventListener('input', updatePreview);
            }
        }
    });
    </script>

    <?php
}

// Include dashboard layout
include(get_template_directory() . '/dashboard-templates/dashboard-layout.php');
?>