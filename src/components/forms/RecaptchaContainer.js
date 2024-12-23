import React, { useEffect, useRef } from 'react';
import { auth } from '../core/firebase-config';
import { RecaptchaVerifier } from 'firebase/auth';

const RecaptchaContainer = ({ onVerifierCreated }) => {
  const containerRef = useRef(null);
  const verifierRef = useRef(null);

  useEffect(() => {
    const initializeRecaptcha = async () => {
      try {
        console.log('Starting reCAPTCHA initialization...');
        console.log('Current URL:', window.location.href);
        console.log('Domain:', window.location.hostname);

        // Clear any existing reCAPTCHA
        if (verifierRef.current) {
          try {
            await verifierRef.current.clear();
            console.log('Cleared existing reCAPTCHA');
          } catch (error) {
            console.error('Error clearing existing reCAPTCHA:', error);
          }
          verifierRef.current = null;
        }

        // Check if container exists
        const container = document.getElementById('recaptcha-container');
        if (!container) {
          console.error('reCAPTCHA container not found');
          throw new Error('reCAPTCHA container not found');
        }
        console.log('Found reCAPTCHA container');

        // Create new verifier
        console.log('Creating new reCAPTCHA verifier...');
        const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'normal', // Changed to normal for debugging
          callback: (response) => {
            console.log('reCAPTCHA verified successfully');
            console.log('Response token:', response);
          },
          'expired-callback': () => {
            console.log('reCAPTCHA expired');
            if (verifierRef.current) {
              verifierRef.current.clear();
              verifierRef.current = null;
            }
          },
          'error-callback': (error) => {
            console.error('reCAPTCHA error:', error);
          }
        });

        verifierRef.current = verifier;
        console.log('reCAPTCHA verifier created successfully');
        
        // Render the reCAPTCHA
        console.log('Attempting to render reCAPTCHA...');
        try {
          await verifier.render();
          console.log('reCAPTCHA rendered successfully');
        } catch (renderError) {
          console.error('Error rendering reCAPTCHA:', renderError);
          throw renderError;
        }
        
        onVerifierCreated(verifier);
      } catch (error) {
        console.error('Error initializing reCAPTCHA:', {
          name: error.name,
          message: error.message,
          stack: error.stack,
          code: error.code
        });
        throw error;
      }
    };

    initializeRecaptcha().catch(error => {
      console.error('Failed to initialize reCAPTCHA:', error);
    });

    return () => {
      if (verifierRef.current) {
        try {
          verifierRef.current.clear();
          console.log('Cleared reCAPTCHA on unmount');
        } catch (error) {
          console.error('Error clearing reCAPTCHA on unmount:', error);
        }
        verifierRef.current = null;
      }
    };
  }, [onVerifierCreated]);

  return (
    <div 
      id="recaptcha-container" 
      style={{ 
        display: 'flex',
        justifyContent: 'center',
        margin: '10px 0'
      }} 
    />
  );
};

export default RecaptchaContainer;
