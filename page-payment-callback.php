<?php
/**
 * Template Name: Payment Callback
 */

// Initialize BOG Payments
require_once get_template_directory() . '/includes/features/bog-payments.php';

// Get callback data
$callback_data = file_get_contents('php://input');
$data = json_decode($callback_data, true);

// Log callback data
error_log('Payment Callback Data: ' . $callback_data);

// Handle callback
if ($data) {
    try {
        $bog_payments = new BOG_Payments();
        $result = $bog_payments->handle_callback($data);
        
        if ($result['success']) {
            http_response_code(200);
            echo json_encode([
                'status' => 'success',
                'message' => 'Callback processed successfully'
            ]);
        } else {
            throw new Exception($result['error']);
        }
    } catch (Exception $e) {
        error_log('Payment Callback Error: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => $e->getMessage()
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid callback data'
    ]);
}

// Stop WordPress from rendering the page template
exit;