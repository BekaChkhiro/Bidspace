import React, { useState, useEffect } from 'react';
import { auth } from '../../firebase-config';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const SMSTest = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationId, setVerificationId] = useState(null);
    const [message, setMessage] = useState('');
    const [debug, setDebug] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // ტელეფონის ნომრის ფორმატირება
    const formatPhoneNumber = (number) => {
        // არა-ციფრების წაშლა
        let cleaned = number.replace(/\D/g, '');
        
        // თუ იწყება 995-ით, წაშალე
        if (cleaned.startsWith('995')) {
            cleaned = cleaned.slice(3);
        }
        
        // მაქსიმუმ 9 ციფრი
        cleaned = cleaned.slice(0, 9);
        
        return cleaned;
    };

    // ტელეფონის ნომრის ვალიდაცია
    const isValidPhoneNumber = (number) => {
        // არა-ციფრების წაშლა
        const cleaned = number.replace(/\D/g, '');
        
        // ქვეყნის კოდის მოშორება თუ არის
        const numberWithoutCountry = cleaned.startsWith('995') ? 
            cleaned.slice(3) : cleaned;
        
        // უნდა იყოს 9 ციფრი და იწყებოდეს 5-ით
        return /^5\d{8}$/.test(numberWithoutCountry);
    };

    useEffect(() => {
        console.log('Auth object:', auth);
        if (!auth) {
            setDebug('Auth არ არის ინიციალიზებული!');
            return;
        }
        setDebug('Auth წარმატებით ინიციალიზდა');

        return () => {
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            }
        };
    }, []);

    // ინფუთის ჰენდლერი
    const handlePhoneChange = (e) => {
        const formatted = formatPhoneNumber(e.target.value);
        setPhoneNumber(formatted);
        setMessage('');
    };

    // ფორმის საბმითის ჰენდლერი
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setDebug(prev => prev + '\nSMS გაგზავნის პროცესი დაიწყო');
        setDebug(prev => prev + '\nმოწმდება ნომერი: ' + phoneNumber);

        if (!isValidPhoneNumber(phoneNumber)) {
            const error = 'გთხოვთ შეიყვანოთ ვალიდური ქართული მობილურის ნომერი (მაგ: 555123456)';
            setMessage(error);
            setDebug(prev => prev + '\nვალიდაცია ვერ გაიარა: ' + error);
            setIsLoading(false);
            return;
        }

        try {
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            }

            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'send-code-button', {
                size: 'invisible',
                callback: async (response) => {
                    setDebug(prev => prev + '\nRecaptcha წარმატებით გაიარა: ' + response);
                    await handleSendSMS();
                },
                'expired-callback': () => {
                    setMessage('Recaptcha-ს ვადა გავიდა. სცადეთ თავიდან.');
                    setDebug(prev => prev + '\nRecaptcha-ს ვადა გავიდა');
                    if (window.recaptchaVerifier) {
                        window.recaptchaVerifier.clear();
                        window.recaptchaVerifier = null;
                    }
                    setIsLoading(false);
                }
            });
            
            await window.recaptchaVerifier.verify();
        } catch (error) {
            handleError('Recaptcha შეცდომა', error);
            setIsLoading(false);
        }
    };

    // SMS-ის გაგზავნის ჰენდლერი
    const handleSendSMS = async () => {
        try {
            // ნომრის ფორმატირება +995-ით
            const formattedNumber = phoneNumber.startsWith('995') ? 
                `+${phoneNumber}` : 
                `+995${phoneNumber}`;
            
            setDebug(prev => prev + '\nფორმატირებული ნომერი: ' + formattedNumber);
            
            const confirmationResult = await signInWithPhoneNumber(
                auth,
                formattedNumber,
                window.recaptchaVerifier
            );
            
            setVerificationId(confirmationResult);
            setMessage('ვერიფიკაციის კოდი გამოგზავნილია!');
            setDebug(prev => prev + '\nSMS წარმატებით გაიგზავნა');
        } catch (error) {
            // დეტალური error logging
            console.error('Full error object:', error);
            setDebug(prev => prev + '\nError code: ' + (error.code || 'unknown'));
            setDebug(prev => prev + '\nError message: ' + error.message);
            setDebug(prev => prev + '\nError details: ' + JSON.stringify(error));
            
            if (error.customData) {
                setDebug(prev => prev + '\nCustom data: ' + JSON.stringify(error.customData));
            }

            handleError('SMS გაგზავნის შეცდომა', error);
        } finally {
            setIsLoading(false);
        }
    };

    // შეცდომების ჰენდლერი
    const handleError = (context, error) => {
        console.error(`${context}:`, error);
        const errorMessage = error.message || 'უცნობი შეცდომა';
        
        // მომხმარებლისთვის გასაგები შეცდომის მესიჯები
        let userMessage = 'დაფიქსირდა შეცდომა';
        if (error.code === 'auth/invalid-phone-number') {
            userMessage = 'არასწორი ტელეფონის ნომერი';
        } else if (error.code === 'auth/too-many-requests') {
            userMessage = 'ძალიან ბევრი მცდელობა. გთხოვთ სცადოთ მოგვიანებით';
        } else if (error.code === 'auth/quota-exceeded') {
            userMessage = 'დღიური ლიმიტი ამოწურულია. სცადეთ ხვალ';
        } else if (error.code === 'auth/error-code:-39') {
            userMessage = 'ტექნიკური ხარვეზი. გთხოვთ სცადოთ მოგვიანებით';
        }
        
        setMessage(`შეცდომა: ${userMessage}`);
        setDebug(prev => prev + `\n${context}: ${errorMessage}`);
        
        if (window.recaptchaVerifier) {
            window.recaptchaVerifier.clear();
            window.recaptchaVerifier = null;
        }
    };

    // კოდის ვერიფიკაცია
    const verifyCode = async (e) => {
        e.preventDefault();
        if (!verificationId) {
            setMessage('ჯერ გააგზავნეთ SMS');
            return;
        }
        
        setIsLoading(true);
        try {
            setDebug(prev => prev + '\nკოდის ვერიფიკაცია დაიწყო');
            const result = await verificationId.confirm(verificationCode);
            setMessage('ნომერი წარმატებით დადასტურდა!');
            setDebug(prev => prev + '\nკოდი წარმატებით დადასტურდა');
            console.log('ვერიფიკაციის შედეგი:', result);
        } catch (error) {
            handleError('კოდის ვერიფიკაციის შეცდომა', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-5">
            <h2 className="text-2xl font-bold mb-6">SMS ვერიფიკაცია</h2>
            
            <form onSubmit={handleSubmit} className="mb-6">
                <div className="mb-4">
                    <label className="block mb-2">
                        ტელეფონის ნომერი
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
                            disabled={isLoading}
                        />
                    </div>
                    <small className="text-gray-600 mt-1 block">
                        შეიყვანეთ 9-ნიშნა მობილურის ნომერი (მაგ: 555123456)
                    </small>
                </div>
                <button 
                    id="send-code-button"
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-2 px-4 rounded text-lg text-white ${
                        isLoading 
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                >
                    {isLoading ? 'იგზავნება...' : 'კოდის გაგზავნა'}
                </button>
            </form>

            <form onSubmit={verifyCode} className="mb-6">
                <div className="mb-4">
                    <label className="block mb-2">
                        ვერიფიკაციის კოდი
                    </label>
                    <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="შეიყვანეთ 6-ნიშნა კოდი"
                        className="w-full px-4 py-2 border rounded text-lg"
                        disabled={isLoading}
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={!verificationId || isLoading}
                    className={`w-full py-2 px-4 rounded text-lg text-white ${
                        !verificationId || isLoading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                >
                    {isLoading ? 'მოწმდება...' : 'კოდის შემოწმება'}
                </button>
            </form>

            {message && (
                <div className={`p-4 rounded mb-4 ${
                    message.includes('შეცდომა') || message.includes('არასწორი')
                        ? 'bg-red-100 border border-red-200'
                        : 'bg-green-100 border border-green-200'
                }`}>
                    {message}
                </div>
            )}

            <div className="bg-gray-100 p-4 rounded">
                <h3 className="font-bold mb-2">დებაგ ინფორმაცია:</h3>
                <pre className="whitespace-pre-wrap break-words text-sm">
                    {debug}
                </pre>
            </div>
        </div>
    );
};

export default SMSTest;