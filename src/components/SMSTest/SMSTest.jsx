import React, { useState, useEffect } from 'react';
import { auth } from '../../firebase-config';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const SMSTest = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationId, setVerificationId] = useState(null);
    const [message, setMessage] = useState('');
    const [debug, setDebug] = useState('');

    useEffect(() => {
        // Log auth object on component mount
        console.log('Auth object:', auth);
        if (!auth) {
            setDebug('Auth is not initialized!');
            return;
        }
        setDebug('Auth is initialized successfully');

        // Initialize RecaptchaVerifier
        if (!window.recaptchaVerifier) {
            try {
                window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                    size: 'normal',
                    callback: (response) => {
                        setDebug(prev => prev + '\nRecaptcha verified successfully: ' + response);
                        // Automatically trigger SMS send after successful verification
                        handleSendSMS();
                    },
                    'expired-callback': () => {
                        setMessage('Recaptcha expired. Please try again.');
                        setDebug(prev => prev + '\nRecaptcha expired');
                    }
                });
                
                // Render the reCAPTCHA widget
                window.recaptchaVerifier.render().then(() => {
                    setDebug(prev => prev + '\nRecaptcha widget rendered');
                });
            } catch (error) {
                setDebug(prev => prev + '\nRecaptcha init error: ' + error.message);
            }
        }

        // Cleanup on unmount
        return () => {
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            }
        };
    }, []);

    // Handle SMS sending after reCAPTCHA verification
    const handleSendSMS = async () => {
        try {
            const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
            setDebug(prev => prev + '\nFormatted phone number: ' + formattedPhoneNumber);
            
            const confirmationResult = await signInWithPhoneNumber(
                auth,
                formattedPhoneNumber,
                window.recaptchaVerifier
            );
            setVerificationId(confirmationResult);
            setMessage('Verification code has been sent!');
            setDebug(prev => prev + '\nSMS sent successfully');
        } catch (error) {
            console.error('Error sending SMS:', error);
            setMessage(`Error: ${error.message}`);
            setDebug(prev => prev + '\nSMS send error: ' + error.message);
            
            // Reset recaptcha on error
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            }
        }
    };

    // Form submit handler
    const onSubmit = (e) => {
        e.preventDefault();
        setDebug(prev => prev + '\nStarting SMS send process');
    };

    // Verify SMS code
    const verifyCode = async (e) => {
        e.preventDefault();
        if (!verificationId) {
            setMessage('Please send SMS first');
            return;
        }
        try {
            setDebug(prev => prev + '\nStarting code verification');
            const result = await verificationId.confirm(verificationCode);
            setMessage('Phone number verified successfully!');
            setDebug(prev => prev + '\nCode verified successfully');
            console.log('Verification result:', result);
        } catch (error) {
            console.error('Error verifying code:', error);
            setMessage(`Error: ${error.message}`);
            setDebug(prev => prev + '\nCode verification error: ' + error.message);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px' }}>
            <h2>SMS Verification Test</h2>
            
            {/* Phone number form */}
            <form onSubmit={onSubmit} style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter phone number (e.g., +995555123456)"
                    style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                />
                <div id="recaptcha-container" style={{ marginBottom: '10px' }}></div>
            </form>

            {/* Verification code form */}
            <form onSubmit={verifyCode}>
                <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter verification code"
                    style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                />
                <button type="submit" style={{ padding: '8px 16px' }}>
                    Verify Code
                </button>
            </form>

            {/* Display messages */}
            {message && (
                <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
                    {message}
                </div>
            )}

            {/* Debug information */}
            <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f5f5f5' }}>
                <h3>Debug Information:</h3>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {debug}
                </pre>
            </div>
        </div>
    );
};

export default SMSTest;
