import React, { useState } from 'react';
import { auth } from '../../firebase-config';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import './PhoneVerification.css';

const PhoneVerification = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' or 'code'
  const [error, setError] = useState('');

  // Recaptcha-ს ინიციალიზაცია
  const generateRecaptcha = () => {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'invisible',
      'callback': (response) => {
        // reCAPTCHA solved
      }
    });
  };

  // SMS-ის გაგზავნა
  const sendVerificationCode = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (!window.recaptchaVerifier) {
        generateRecaptcha();
      }
      
      const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      const appVerifier = window.recaptchaVerifier;
      
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhoneNumber, appVerifier);
      setVerificationId(confirmationResult);
      setStep('code');
    } catch (err) {
      setError('SMS-ის გაგზავნა ვერ მოხერხდა: ' + err.message);
      console.error('Error sending SMS:', err);
    }
  };

  // კოდის შემოწმება
  const verifyCode = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const result = await verificationId.confirm(verificationCode);
      // წარმატებული ვერიფიკაცია
      console.log('Successfully verified', result.user);
      // აქ შეგიძლიათ დაამატოთ წარმატებული ვერიფიკაციის ლოგიკა
    } catch (err) {
      setError('არასწორი კოდი: ' + err.message);
      console.error('Error verifying code:', err);
    }
  };

  return (
    <div className="phone-verification">
      <div id="recaptcha-container"></div>
      
      {step === 'phone' ? (
        <form onSubmit={sendVerificationCode}>
          <h2>ტელეფონის ნომრის დადასტურება</h2>
          <div className="form-group">
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="შეიყვანეთ ტელეფონის ნომერი (+995...)"
              required
            />
          </div>
          <button type="submit">კოდის გაგზავნა</button>
        </form>
      ) : (
        <form onSubmit={verifyCode}>
          <h2>შეიყვანეთ დადასტურების კოდი</h2>
          <div className="form-group">
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="შეიყვანეთ კოდი"
              required
            />
          </div>
          <button type="submit">დადასტურება</button>
          <button 
            type="button" 
            className="back-button"
            onClick={() => setStep('phone')}
          >
            უკან დაბრუნება
          </button>
        </form>
      )}

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default PhoneVerification;
