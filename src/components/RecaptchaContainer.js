import React, { useEffect, useRef } from 'react';
import { auth } from '../firebase-config';
import { RecaptchaVerifier } from 'firebase/auth';

const RecaptchaContainer = ({ onVerifierCreated }) => {
  const containerRef = useRef(null);
  const verifierRef = useRef(null);

  useEffect(() => {
    const initializeRecaptcha = () => {
      if (verifierRef.current) {
        try {
          verifierRef.current.clear();
        } catch (error) {
          console.error('Error clearing existing reCAPTCHA:', error);
        }
        verifierRef.current = null;
      }

      try {
        verifierRef.current = new RecaptchaVerifier(auth, containerRef.current, {
          size: 'invisible',
          callback: () => {
            console.log('reCAPTCHA verified successfully');
          },
          'expired-callback': () => {
            console.log('reCAPTCHA expired');
            if (verifierRef.current) {
              verifierRef.current.clear();
              verifierRef.current = null;
            }
          }
        });

        onVerifierCreated(verifierRef.current);
      } catch (error) {
        console.error('Error initializing reCAPTCHA:', error);
        throw error;
      }
    };

    initializeRecaptcha();

    return () => {
      if (verifierRef.current) {
        try {
          verifierRef.current.clear();
        } catch (error) {
          console.error('Error clearing reCAPTCHA:', error);
        }
        verifierRef.current = null;
      }
    };
  }, [onVerifierCreated]);

  return <div ref={containerRef} />;
};

export default RecaptchaContainer;
