<?php

function add_forum_question($category, $title, $question, $photo) {
    // Validate inputs
    if (empty($category) || empty($title) || empty($question)) {
        return 'All fields except photo are required.';
    }

    // Define categories
    $categories = ['კინო-თეატრი', 'ივენთები', 'სპორტი', 'მოგზაურობა'];

    // Check if category is valid
    if (!in_array($category, $categories)) {
        return 'Invalid category.';
    }

    // Process photo upload if provided
    $photo_url = '';
    if (!empty($photo)) {
        // Assuming $photo is a file upload array
        $upload_dir = wp_upload_dir();
        $upload_file = $upload_dir['path'] . '/' . basename($photo['name']);

        if (move_uploaded_file($photo['tmp_name'], $upload_file)) {
            $photo_url = $upload_dir['url'] . '/' . basename($photo['name']);
        } else {
            return 'Photo upload failed.';
        }
    }

    // Insert question into the database (assuming a custom table 'forum_questions')
    global $wpdb;
    $table_name = $wpdb->prefix . 'forum_questions';
    $wpdb->insert(
        $table_name,
        [
            'category' => $category,
            'title' => $title,
            'question' => $question,
            'photo_url' => $photo_url,
            'created_at' => current_time('mysql', 1)
        ]
    );

    return 'Question added successfully.';
}

function register_forum_question_endpoint() {
    register_rest_route('custom/v1', '/add-forum-question', array(
        'methods' => 'POST',
        'callback' => 'handle_add_forum_question',
        'permission_callback' => '__return_true',
    ));
}
add_action('rest_api_init', 'register_forum_question_endpoint');

function handle_add_forum_question(WP_REST_Request $request) {
    $category = sanitize_text_field($request->get_param('category'));
    $title = sanitize_text_field($request->get_param('title'));
    $question = sanitize_textarea_field($request->get_param('question'));
    $photo = $request->get_file_params()['photo'];

    $result = add_forum_question($category, $title, $question, $photo);

    return new WP_REST_Response(['message' => $result], 200);
}

?>