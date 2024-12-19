import React, { useState, useEffect } from 'react';
import { auth } from '../../firebase-config';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const SMSTest = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationId, setVerificationId] = useState(null);
    const [message, setMessage] = useState('');
    const [debug, setDebug] = useState('');

    // Phone number validation and formatting
    const formatPhoneNumber = (number) => {
        // Remove all non-digit characters
        let cleaned = number.replace(/\D/g, '');
        
        // Remove 995 prefix if exists
        if (cleaned.startsWith('995')) {
            cleaned = cleaned.slice(3);
        }
        
        // Only allow max 9 digits
        cleaned = cleaned.slice(0, 9);
        
        return cleaned;
    };

    // Phone number validation
    const isValidPhoneNumber = (number) => {
        // Remove any non-digit characters first
        const cleaned = number.replace(/\D/g, '');
        
        // If it has the country code, remove it
        const numberWithoutCountry = cleaned.startsWith('995') ? 
            cleaned.slice(3) : cleaned;
        
        // Check if it's exactly 9 digits and starts with 5
        return /^5\d{8}$/.test(numberWithoutCountry);
    };

    useEffect(() => {
        if (!auth) {
            setDebug('Auth is not initialized!');
            return;
        }
        setDebug('Auth is initialized successfully');

        return () => {
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            }
        };
    }, []);

    // Handle phone number input
    const handlePhoneChange = (e) => {
        const formatted = formatPhoneNumber(e.target.value);
        setPhoneNumber(formatted);
        setMessage('');
    };

    // Form submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setDebug(prev => prev + '\nStarting SMS send process');
        setDebug(prev => prev + '\nChecking phone number: ' + phoneNumber);

        if (!isValidPhoneNumber(phoneNumber)) {
            const error = 'Please enter a valid Georgian mobile number (e.g., 555123456)';
            setMessage(error);
            setDebug(prev => prev + '\nValidation failed: ' + error);
            return;
        }

        try {
            // Initialize RecaptchaVerifier if not exists
            if (!window.recaptchaVerifier) {
                window.recaptchaVerifier = new RecaptchaVerifier(auth, 'send-code-button', {
                    size: 'invisible',
                    callback: async (response) => {
                        setDebug(prev => prev + '\nRecaptcha verified successfully: ' + response);
                        await handleSendSMS();
                    }
                });
            }
            
            await window.recaptchaVerifier.verify();
        } catch (error) {
            handleError('Recaptcha error', error);
        }
    };

    // Handle SMS sending
    const handleSendSMS = async () => {
        try {
            // Ensure the number starts with +995
            const formattedNumber = phoneNumber.startsWith('995') ? 
                `+${phoneNumber}` : 
                `+995${phoneNumber}`;
            
            setDebug(prev => prev + '\nFormatted phone number: ' + formattedNumber);
            
            const confirmationResult = await signInWithPhoneNumber(
                auth,
                formattedNumber,
                window.recaptchaVerifier
            );
            
            setVerificationId(confirmationResult);
            setMessage('Verification code has been sent!');
            setDebug(prev => prev + '\nSMS sent successfully');
        } catch (error) {
            handleError('SMS send error', error);
        }
    };

    // Error handler
    const handleError = (context, error) => {
        console.error(`${context}:`, error);
        const errorMessage = error.message || 'Unknown error occurred';
        setMessage(`Error: ${errorMessage}`);
        setDebug(prev => prev + `\n${context}: ${errorMessage}`);
        
        if (window.recaptchaVerifier) {
            window.recaptchaVerifier.clear();
            window.recaptchaVerifier = null;
        }
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
            handleError('Code verification error', error);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-5">
            <h2 className="text-2xl font-bold mb-6">SMS Verification Test</h2>
            
            <form onSubmit={handleSubmit} className="mb-6">
                <div className="mb-4">
                    <label className="block mb-2">
                        Phone Number
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
                            +995
                        </span>
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={handlePhoneChange}
                            placeholder="555123456"
                            className="w-full px-16 py-2 border rounded text-lg"
                        />
                    </div>
                    <small className="text-gray-600 mt-1 block">
                        Enter your 9-digit mobile number (e.g., 555123456)
                    </small>
                </div>
                <button 
                    id="send-code-button"
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded text-lg hover:bg-blue-600"
                >
                    Send Verification Code
                </button>
            </form>

            <form onSubmit={verifyCode} className="mb-6">
                <div className="mb-4">
                    <label className="block mb-2">
                        Verification Code
                    </label>
                    <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="Enter 6-digit code"
                        className="w-full px-4 py-2 border rounded text-lg"
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={!verificationId}
                    className={`w-full py-2 px-4 rounded text-lg text-white ${
                        verificationId ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 cursor-not-allowed'
                    }`}
                >
                    Verify Code
                </button>
            </form>

            {message && (
                <div className={`p-4 rounded mb-4 ${
                    message.includes('Error') || message.includes('Invalid')
                        ? 'bg-red-100 border border-red-200'
                        : 'bg-green-100 border border-green-200'
                }`}>
                    {message}
                </div>
            )}

            <div className="bg-gray-100 p-4 rounded">
                <h3 className="font-bold mb-2">Debug Information:</h3>
                <pre className="whitespace-pre-wrap break-words text-sm">
                    {debug}
                </pre>
            </div>
        </div>
    );
};

export default SMSTest;