class PhoneVerificationService {
    constructor(maxRetries = 3) {
        this.maxRetries = maxRetries;
    }

    async sendVerificationCode(phoneNumber, retryCount = 0) {
        try {
            // Configure reCAPTCHA
            const appVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
                'size': 'invisible',
                'callback': (response) => {
                    console.log('reCAPTCHA verified');
                },
                'expired-callback': () => {
                    console.log('reCAPTCHA expired');
                }
            });

            // Send verification code
            const confirmationResult = await firebase.auth().signInWithPhoneNumber(
                phoneNumber,
                appVerifier
            );

            // Store the confirmation result for later verification
            window.confirmationResult = confirmationResult;
            return { success: true };

        } catch (error) {
            console.error('Error sending verification code:', error);

            if (retryCount < this.maxRetries && this.shouldRetry(error)) {
                console.log(`Retrying... Attempt ${retryCount + 1} of ${this.maxRetries}`);
                // Wait for 1 second before retrying
                await new Promise(resolve => setTimeout(resolve, 1000));
                return this.sendVerificationCode(phoneNumber, retryCount + 1);
            }

            return {
                success: false,
                error: this.getErrorMessage(error)
            };
        }
    }

    async verifyCode(code) {
        try {
            const result = await window.confirmationResult.confirm(code);
            return {
                success: true,
                user: result.user
            };
        } catch (error) {
            console.error('Error verifying code:', error);
            return {
                success: false,
                error: this.getErrorMessage(error)
            };
        }
    }

    shouldRetry(error) {
        // Retry on network errors or service unavailable (503)
        return error.code === 'auth/network-request-failed' ||
               error.message.includes('503');
    }

    getErrorMessage(error) {
        switch (error.code) {
            case 'auth/invalid-phone-number':
                return 'Invalid phone number format';
            case 'auth/too-many-requests':
                return 'Too many attempts. Please try again later';
            case 'auth/network-request-failed':
                return 'Network error. Please check your connection';
            default:
                return 'An error occurred. Please try again';
        }
    }
}

// Initialize the service
const phoneVerificationService = new PhoneVerificationService();

// Example usage
document.addEventListener('DOMContentLoaded', () => {
    const sendCodeButton = document.querySelector('#send-code-button');
    const verifyCodeButton = document.querySelector('#verify-code-button');

    if (sendCodeButton) {
        sendCodeButton.addEventListener('click', async () => {
            const phoneNumber = document.querySelector('#phone-input').value;
            const result = await phoneVerificationService.sendVerificationCode(phoneNumber);
            
            if (result.success) {
                // Show verification code input
                document.querySelector('#verification-section').style.display = 'block';
            } else {
                // Show error message
                alert(result.error);
            }
        });
    }

    if (verifyCodeButton) {
        verifyCodeButton.addEventListener('click', async () => {
            const code = document.querySelector('#code-input').value;
            const result = await phoneVerificationService.verifyCode(code);
            
            if (result.success) {
                // Handle successful verification
                console.log('Phone verified successfully');
            } else {
                // Show error message
                alert(result.error);
            }
        });
    }
});
