import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Alert from '../../../../../components/ui-elements/Alert';

const EmailChange = ({ currentEmail, onEmailChange }) => {
  const [newEmail, setNewEmail] = useState('');
  const [currentEmailVerificationCode, setCurrentEmailVerificationCode] = useState('');
  const [newEmailVerificationCode, setNewEmailVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('initial'); // initial, verifyingCurrent, enterNew, verifyingNew
  const [alert, setAlert] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timer, setTimer] = useState(null);

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  const startTimer = () => {
    setTimeLeft(60);
    if (timer) clearInterval(timer);
    
    const newTimer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(newTimer);
          setStep('initial');
          showAlert('დრო ამოიწურა. სცადეთ თავიდან', 'error');
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    setTimer(newTimer);
  };

  const sendCurrentEmailVerification = async () => {
    setLoading(true);
    try {
      const response = await fetch('/wp-json/bidspace/v1/request-email-verification', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': wpApiSettings.nonce
        }
      });

      if (!response.ok) throw new Error('Failed to send verification code');

      setStep('verifyingCurrent');
      showAlert('დადასტურების კოდი გამოგზავნილია თქვენს მიმდინარე ელ-ფოსტაზე', 'success');
      startTimer();
    } catch (error) {
      console.error('Error sending verification code:', error);
      showAlert(error.message || 'დადასტურების კოდის გაგზავნა ვერ მოხერხდა', 'error');
    }
    setLoading(false);
  };

  const verifyCurrentEmail = async () => {
    if (!currentEmailVerificationCode) {
      showAlert('გთხოვთ შეიყვანოთ დადასტურების კოდი', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/wp-json/bidspace/v1/verify-current-email', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': wpApiSettings.nonce
        },
        body: JSON.stringify({
          code: currentEmailVerificationCode
        })
      });

      if (!response.ok) throw new Error('Invalid code');

      if (timer) clearInterval(timer);
      setStep('enterNew');
      setCurrentEmailVerificationCode('');
      showAlert('მიმდინარე ელ-ფოსტა დადასტურებულია', 'success');
    } catch (error) {
      console.error('Error verifying code:', error);
      showAlert('არასწორი კოდი', 'error');
    }
    setLoading(false);
  };

  const sendNewEmailVerification = async () => {
    if (!newEmail) {
      showAlert('გთხოვთ შეიყვანოთ ახალი ელ-ფოსტის მისამართი', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/wp-json/bidspace/v1/request-new-email-verification', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': wpApiSettings.nonce
        },
        body: JSON.stringify({
          new_email: newEmail
        })
      });

      if (!response.ok) throw new Error('Failed to send verification code');

      setStep('verifyingNew');
      showAlert('დადასტურების კოდი გამოგზავნილია ახალ ელ-ფოსტაზე', 'success');
      startTimer();
    } catch (error) {
      console.error('Error sending verification code:', error);
      showAlert(error.message || 'დადასტურების კოდის გაგზავნა ვერ მოხერხდა', 'error');
    }
    setLoading(false);
  };

  const verifyNewEmail = async () => {
    if (!newEmailVerificationCode) {
      showAlert('გთხოვთ შეიყვანოთ დადასტურების კოდი', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/wp-json/bidspace/v1/verify-new-email', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': wpApiSettings.nonce
        },
        body: JSON.stringify({
          code: newEmailVerificationCode,
          new_email: newEmail
        })
      });

      if (!response.ok) throw new Error('Invalid code');

      showAlert('ელ-ფოსტა წარმატებით შეიცვალა', 'success');
      onEmailChange(newEmail);
      if (timer) clearInterval(timer);
      setStep('initial');
      setNewEmailVerificationCode('');
      setNewEmail('');
    } catch (error) {
      console.error('Error verifying code:', error);
      showAlert('არასწორი კოდი', 'error');
    }
    setLoading(false);
  };

  const handleCancel = () => {
    if (timer) clearInterval(timer);
    setStep('initial');
    setCurrentEmailVerificationCode('');
    setNewEmailVerificationCode('');
    setNewEmail('');
  };

  return (
    <div className="flex flex-col gap-4">
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}
      
      {step === 'initial' && (
        <div className="flex flex-col gap-2.5">
          <p className="text-sm text-gray-600">
            ელ-ფოსტის შესაცვლელად, ჯერ დაადასტურეთ თქვენი მიმდინარე ელ-ფოსტა ({currentEmail})
          </p>
          <button
            type="button"
            onClick={sendCurrentEmailVerification}
            disabled={loading}
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'იგზავნება...' : 'დადასტურების კოდის გაგზავნა'}
          </button>
        </div>
      )}

      {step === 'verifyingCurrent' && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2.5">
            <label htmlFor="current_verification_code" className="text-sm font-medium text-gray-700">
              დადასტურების კოდი {timeLeft > 0 && <span className="text-gray-500 ml-2">({timeLeft} წამი)</span>}
            </label>
            <input
              type="text"
              id="current_verification_code"
              value={currentEmailVerificationCode}
              onChange={(e) => setCurrentEmailVerificationCode(e.target.value)}
              maxLength={6}
              placeholder="შეიყვანეთ 6-ნიშნა კოდი"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              გაუქმება
            </button>
            <button
              type="button"
              onClick={verifyCurrentEmail}
              disabled={loading || !currentEmailVerificationCode}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-400 transition-colors"
            >
              დადასტურება
            </button>
          </div>
        </div>
      )}

      {step === 'enterNew' && (
        <div className="flex flex-col gap-2.5">
          <label htmlFor="new_email" className="text-sm font-medium text-gray-700">ახალი ელ-ფოსტა</label>
          <input
            type="email"
            id="new_email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="example@mail.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              გაუქმება
            </button>
            <button
              type="button"
              onClick={sendNewEmailVerification}
              disabled={loading || !newEmail}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-400 transition-colors"
            >
              გაგრძელება
            </button>
          </div>
        </div>
      )}

      {step === 'verifyingNew' && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2.5">
            <label htmlFor="new_verification_code" className="text-sm font-medium text-gray-700">
              დადასტურების კოდი {timeLeft > 0 && <span className="text-gray-500 ml-2">({timeLeft} წამი)</span>}
            </label>
            <input
              type="text"
              id="new_verification_code"
              value={newEmailVerificationCode}
              onChange={(e) => setNewEmailVerificationCode(e.target.value)}
              maxLength={6}
              placeholder="შეიყვანეთ 6-ნიშნა კოდი"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              გაუქმება
            </button>
            <button
              type="button"
              onClick={verifyNewEmail}
              disabled={loading || !newEmailVerificationCode}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-400 transition-colors"
            >
              დადასტურება
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailChange;
