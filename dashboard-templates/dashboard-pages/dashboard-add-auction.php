<?php
/*
Template Name: Dashboard Add Auction
*/

function dashboard_content() {
    $post_id = null;
    $post_url = '';
    $success_message = '';

    if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['add_auction'])) {
        // Validate and sanitize input
        $title = sanitize_text_field($_POST['title']);
        $category = sanitize_text_field($_POST['category']);
        $ticket_category = sanitize_text_field($_POST['ticket_category']);
        $start_date = sanitize_text_field($_POST['start_date']);
        $city = sanitize_text_field($_POST['city']);
        $ticket_price = floatval($_POST['ticket_price']);
        $ticket_quantity = intval($_POST['ticket_quantity']);
        $ticket_information = wp_kses_post($_POST['ticket_information']);
        
        // Category-specific fields
        $hall = isset($_POST['hall']) ? sanitize_text_field($_POST['hall']) : '';
        $row = isset($_POST['row']) ? sanitize_text_field($_POST['row']) : '';
        $place = isset($_POST['place']) ? sanitize_text_field($_POST['place']) : '';
        $sector = isset($_POST['sector']) ? sanitize_text_field($_POST['sector']) : '';

        // Auction details
        $start_time = sanitize_text_field($_POST['start_time']);
        $due_time = sanitize_text_field($_POST['due_time']);
        $auction_price = floatval($_POST['auction_price']);
        $buy_now = floatval($_POST['buy_now']);
        $min_bid_price = floatval($_POST['min_bid_price']);

        // Create post object
        $auction_post = array(
            'post_title'    => $title,
            'post_content'  => $ticket_information,
            'post_status'   => 'publish',
            'post_type'     => 'auction',
        );

        // Insert the post into the database
        $post_id = wp_insert_post($auction_post);

        if (!is_wp_error($post_id)) {
            // Add custom fields
            update_post_meta($post_id, 'category', $category);
            update_post_meta($post_id, 'ticket_category', $ticket_category);
            
            // Set the category taxonomy
            wp_set_object_terms($post_id, $category, 'auction_category');
            wp_set_object_terms($post_id, $ticket_category, 'ticket-category');
            
            update_post_meta($post_id, 'start_date', $start_date);
            update_post_meta($post_id, 'city', $city);
            update_post_meta($post_id, 'ticket_price', $ticket_price);
            update_post_meta($post_id, 'ticket_quantity', $ticket_quantity);
            
            // Category-specific fields
            if ($hall) update_post_meta($post_id, 'hall', $hall);
            if ($row) update_post_meta($post_id, 'row', $row);
            if ($place) update_post_meta($post_id, 'place', $place);
            if ($sector) update_post_meta($post_id, 'sector', $sector);

            // Auction details
            update_post_meta($post_id, 'start_time', $start_time);
            update_post_meta($post_id, 'due_time', $due_time);
            update_post_meta($post_id, 'auction_price', $auction_price);
            update_post_meta($post_id, 'buy_now', $buy_now);
            update_post_meta($post_id, 'min_bid_price', $min_bid_price);

            // Handle featured image upload
            if (!empty($_FILES['featured_image']['name'])) {
                require_once(ABSPATH . 'wp-admin/includes/image.php');
                require_once(ABSPATH . 'wp-admin/includes/file.php');
                require_once(ABSPATH . 'wp-admin/includes/media.php');

                $attachment_id = media_handle_upload('featured_image', $post_id);
                if (!is_wp_error($attachment_id)) {
                    set_post_thumbnail($post_id, $attachment_id);
                }
            }

            ?>
            <script>
                window.location.href = '<?php echo add_query_arg(array(
                    'status' => 'success',
                    'auction_id' => $post_id
                ), $_SERVER['REQUEST_URI']); ?>';
            </script>
            <?php
            exit;
        } else {
            echo '<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">შეცდომა აუქციონის დამატებისას.</div>';
        }
    }

    // Check for success parameters in URL
    if (isset($_GET['status']) && $_GET['status'] === 'success' && isset($_GET['auction_id'])) {
        $auction_id = intval($_GET['auction_id']);
        $post_url = '/auction/' . $auction_id;
        $success_message = '<div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div class="bg-white p-8 rounded-lg max-w-md w-full mx-4 text-center">
                <svg class="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <h2 class="text-2xl font-bold mt-4 mb-2">გილოცავთ!</h2>
                <p class="text-gray-600 mb-6">თქვენი აუქციონი წარმატებით დაემატა</p>
                <div class="flex justify-center gap-4">
                    <a href="' . esc_url($post_url) . '" class="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500">
                        ნახეთ აუქციონი
                    </a>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500">
                        დახურვა
                    </button>
                </div>
            </div>
        </div>';
    }
    ?>

    <?php echo $success_message; ?>

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
    </style>

    <div class="flex flex-row -mx-3 justify-between gap-6" style="height: 100%">
        <!-- Left side - Form -->
        <div class="w-full lg:w-8/12 px-3 scrollable-content">
            <h2 class="text-2xl font-bold mb-6">აუქციონის დამატება</h2>
            <form method="post" action="" enctype="multipart/form-data" class="space-y-6" id="add-auction-form">
                <!-- Step 1: Title -->
                <div id="step1">
                    <div>
                        <label for="title" class="block text-sm font-medium text-gray-700">სათაური</label>
                        <input type="text" id="title" name="title" required class="settings-field-style mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                    </div>
                </div>

                <!-- Step 2: Category Selection -->
                <div id="step2" style="display: none;">
                    <h3 class="text-lg font-medium mb-4">აირჩიეთ კატეგორია</h3>
                    <div class="category-buttons">
                        <button type="button" class="category-btn" data-category="თეატრი-კინო">თეატრი-კინო</button>
                        <button type="button" class="category-btn" data-category="ივენთები">ივენთები</button>
                        <button type="button" class="category-btn" data-category="სპორტი">სპორტი</button>
                        <button type="button" class="category-btn" data-category="მოგზაურობა">მოგზაურობა</button>
                    </div>
                </div>

                <!-- Step 3: Category Fields -->
                <div id="step3" style="display: none;">
                    <div id="category-fields" class="mt-4">
                        <!-- Category-specific fields will be dynamically inserted here -->
                    </div>
                </div>

                <!-- Step 4: Auction Details -->
                <div id="step4" style="display: none;">
                    <h3 class="text-lg font-medium mb-4">აუქციონის დეტალები</h3>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label for="start_time" class="block text-sm font-medium text-gray-700">დაწყების დრო</label>
                            <input type="datetime-local" id="start_time" name="start_time" required class="settings-field-style mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                        </div>
                        <div>
                            <label for="due_time" class="block text-sm font-medium text-gray-700">დსრულების დრო</label>
                            <input type="datetime-local" id="due_time" name="due_time" required class="settings-field-style mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                        </div>
                    </div>
                    <div class="mt-4">
                        <label for="auction_price" class="block text-sm font-medium text-gray-700">აუქციონის ფასი</label>
                        <input type="number" step="0.01" id="auction_price" name="auction_price" required class="settings-field-style mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                    </div>
                    <div class="mt-4">
                        <label for="min_bid_price" class="block text-sm font-medium text-gray-700">მინიალური ბიდი</label>
                        <input type="number" step="0.01" id="min_bid_price" name="min_bid_price" required class="settings-field-style mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                    </div>
                    <div class="mt-4">
                        <label for="buy_now" class="block text-sm font-medium text-gray-700">ახლავე ყიდვის ფასი</label>
                        <input type="number" step="0.01" id="buy_now" name="buy_now" class="settings-field-style mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                    </div>
                    <div class="mt-4">
                        <label for="featured_image" class="block text-sm font-medium text-gray-700">მთავარი სურათი</label>
                        <input type="file" id="featured_image" name="featured_image" accept="image/*" class="settings-field-style mt-1 block w-full">
                    </div>
                    <input type="submit" name="add_auction" value="დამატება" class="mt-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                </div>
            </form>
        </div>

        <!-- Right side - Preview -->
        <div class="w-full lg:w-4/12 px-6 border-l">
            <h2 class="text-2xl font-bold mb-6">ვიზუალი</h2>
            <div id="auction-preview" class="bg-white rounded-2xl p-4 shadow-lg flex flex-col justify-between">
                <!-- Preview content here -->
            </div>
        </div>
    </div>

    <script>
    document.addEventListener('DOMContentLoaded', function() {
        const form = document.getElementById('add-auction-form');
        const steps = [
            document.getElementById('step1'),
            document.getElementById('step2'),
            document.getElementById('step3'),
            document.getElementById('step4')
        ];
        const categoryButtons = document.querySelectorAll('.category-btn');
        const categoryFields = document.getElementById('category-fields');
        const titleInput = document.getElementById('title');

        // Initially hide all steps except first
        steps.slice(1).forEach(step => step.style.display = 'none');

        // Store common fields values
        let commonFieldsValues = {};

        function showStep(stepIndex) {
            for (let i = 0; i <= stepIndex; i++) {
                steps[i].style.display = 'block';}
        }

        titleInput.addEventListener('input', function() {
            if (this.value.trim() !== '') {
                showStep(1);
            } else {
                steps.slice(1).forEach(step => step.style.display = 'none');
            }
        });

        function saveCommonFieldsValues() {
            const commonFields = ['start_date', 'city', 'ticket_price', 'ticket_quantity', 'ticket_information'];
            commonFields.forEach(fieldName => {
                const field = document.getElementById(fieldName);
                if (field) {
                    commonFieldsValues[fieldName] = field.value;
                }
            });
        }

        function restoreCommonFieldsValues() {
            Object.keys(commonFieldsValues).forEach(fieldName => {
                const field = document.getElementById(fieldName);
                if (field && commonFieldsValues[fieldName]) {
                    field.value = commonFieldsValues[fieldName];
                }
            });
        }

        categoryButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Save common fields values before changing category
                saveCommonFieldsValues();
                
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                const category = button.dataset.category;
                showCategoryFields(category);
                showStep(2);
            });
        });

        function showCategoryFields(category) {
            const fields = getCategoryFields(category);
            categoryFields.innerHTML = fields;
            
            // Restore common fields values
            restoreCommonFieldsValues();
            
            // Set both category and ticket_category values
            let categoryInput = document.querySelector('input[name="category"]');
            let ticketCategoryInput = document.querySelector('input[name="ticket_category"]');
            
            if (!categoryInput) {
                categoryInput = document.createElement('input');
                categoryInput.type = 'hidden';
                categoryInput.name = 'category';
                form.appendChild(categoryInput);
            }
            
            if (!ticketCategoryInput) {
                ticketCategoryInput = document.createElement('input');
                ticketCategoryInput.type = 'hidden';
                ticketCategoryInput.name = 'ticket_category';
                form.appendChild(ticketCategoryInput);
            }
            
            categoryInput.value = category;
            ticketCategoryInput.value = category;
            
            addCategoryFieldListeners();
            updatePreview();
        }

        function addCategoryFieldListeners() {
            const fields = categoryFields.querySelectorAll('input, textarea');
            fields.forEach(field => {
                field.addEventListener('input', checkCategoryFieldsCompletion);
            });
        }

        function checkCategoryFieldsCompletion() {
            const fields = categoryFields.querySelectorAll('input, textarea');
            const allFilled = Array.from(fields).every(field => field.value.trim() !== '');
            if (allFilled) {
                showStep(3);
            }
        }

        function getCategoryFields(category) {
            const commonFields = `
                <div>
                    <label for="start_date" class="block text-sm font-medium text-gray-700">დაწყების თარიღი</label>
                    <input type="datetime-local" id="start_date" name="start_date" required class="settings-field-style mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                </div>
                <div>
                    <label for="city" class="block text-sm font-medium text-gray-700">ქალაქი</label>
                    <input type="text" id="city" name="city" required class="settings-field-style mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                </div>
                <div>
                    <label for="ticket_price" class="block text-sm font-medium text-gray-700">ბილეთის ფასი</label>
                    <input type="number" step="0.01" id="ticket_price" name="ticket_price" required class="settings-field-style mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                </div>
                <div>
                    <label for="ticket_quantity" class="block text-sm font-medium text-gray-700">ბილეთების რაოდენობა</label>
                    <input type="number" id="ticket_quantity" name="ticket_quantity" required class="settings-field-style mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                </div>
            `;

            const categorySpecificFields = {
                'თეატრი-კინო': `
                    <div>
                        <label for="hall" class="block text-sm font-medium text-gray-700">დარბაზი</label>
                        <input type="text" id="hall" name="hall" required class="settings-field-style mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                    </div>
                    <div>
                        <label for="row" class="block text-sm font-medium text-gray-700">რიგი</label>
                        <input type="text" id="row" name="row" required class="settings-field-style mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                    </div>
                    <div>
                        <label for="place" class="block text-sm font-medium text-gray-700">ადგილი</label>
                        <input type="text" id="place" name="place" required class="settings-field-style mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                    </div>
                `,
                'ივენთები': ``,
                'სპორტი': `
                    <div>
                        <label for="sector" class="block text-sm font-medium text-gray-700">სექტორი</label>
                        <input type="text" id="sector" name="sector" required class="settings-field-style mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                    </div>
                    <div>
                        <label for="row" class="block text-sm font-medium text-gray-700">რიგი</label>
                        <input type="text" id="row" name="row" required class="settings-field-style mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                    </div>
                    <div>
                        <label for="place" class="block text-sm font-medium text-gray-700">ადგილი</label>
                        <input type="text" id="place" name="place" required class="settings-field-style mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                    </div>
                `,
                'მოგზაურობა': `
                    <div>
                        <label for="hall" class="block text-sm font-medium text-gray-700">დარბაზი</label>
                        <input type="text" id="hall" name="hall" required class="settings-field-style mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                    </div>
                    <div>
                        <label for="row" class="block text-sm font-medium text-gray-700">რიგი</label>
                        <input type="text" id="row" name="row" required class="settings-field-style mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                    </div>
                    <div>
                        <label for="place" class="block text-sm font-medium text-gray-700">ადგილი</label>
                        <input type="text" id="place" name="place" required class="settings-field-style mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                    </div>
                `
            };

            return `
                ${commonFields}
                ${categorySpecificFields[category] || ''}
                <div>
                    <label for="ticket_information" class="block text-sm font-medium text-gray-700">ბილეთის ინფორმაცია</label>
                    <textarea id="ticket_information" name="ticket_information" rows="4" class="settings-field-style mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"></textarea>
                </div>
                <input type="hidden" name="category" value="${category}">
                <input type="hidden" name="ticket_category" value="${category}">
            `;
        }

        function updatePreview() {
            const previewElement = document.getElementById('auction-preview');
            const title = document.getElementById('title').value || 'აუქციონის სათაური';
            const activeButton = document.querySelector('.category-btn.active');
            const category = activeButton ? activeButton.dataset.category : 'არ არის არჩეული';
            const startDate = document.getElementById('start_date')?.value || 'არ არის მითითებული';
            const ticketPrice = document.getElementById('ticket_price')?.value || '0';
            const auctionPrice = document.getElementById('auction_price')?.value || '0';

            previewElement.innerHTML = `
                <div class="relative" style="height: 180px;">
                    <img id="preview-image" src="${document.getElementById('featured_image')?.files[0] ? URL.createObjectURL(document.getElementById('featured_image').files[0]) : '<?php echo get_stylesheet_directory_uri(); ?>/images/placeholder.jpg'}" alt="Preview" class="w-full h-full object-cover rounded-xl">
                    <div id="preview-status" class="absolute top-2 left-2 px-2 py-1 rounded-full text-white text-sm bg-gray-500">
                        სტატუსი
                    </div>
                </div>
                <div class="flex justify-between gap-6 items-center mt-4">
                    <h4 id="preview-title" class="text-lg font-bold">${title}</h4>
                    <img src="<?php echo get_stylesheet_directory_uri(); ?>/icons/heart_icon.svg" alt="heart icon"> 
                </div>
                <div class="flex justify-between gap-6 items-center mt-4">
                    <div class="w-1/2 flex flex-col items-start">
                        <h5 class="text-black font-normal text-lg">ბილეთის ფასი</h5>
                        <span id="preview-ticket-price" class="text-black font-normal text-lg">${ticketPrice}₾</span>
                    </div>
                    <div class="w-1/2 flex flex-col items-start">
                        <h5 class="text-black font-normal text-lg">მიმდინარე ფასი</h5>
                        <span id="preview-auction-price" class="text-black font-normal text-lg" style="color: #00AEEF">${auctionPrice}₾</span>
                    </div>
                </div>
                <p class="mt-4">კატეგორია: ${category}</p>
                <p>დაწყების თარიღი: ${startDate}</p>
            `;
        }

        // Add event listeners for preview updates
        form.addEventListener('input', updatePreview);
        categoryButtons.forEach(button => {
            button.addEventListener('click', updatePreview);
        });

        // Initial preview update
        updatePreview();
    });
    </script>

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