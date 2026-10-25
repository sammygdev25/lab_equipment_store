import { useEffect, useRef, useState } from 'react';
import { api } from '../api';
import { Button } from './ui';
import { Icon } from './icons';

interface GoogleLoginButtonProps {
  onSuccess: (data: any) => void;
  onError: (message: string) => void;
}

declare global {
  interface Window {
    google?: any;
  }
}

const GOOGLE_CLIENT_ID = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID as string | undefined;

function GoogleLoginButton({ onSuccess, onError }: GoogleLoginButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const handleCredential = async (response: { credential: string }) => {
      try {
        const data = await api.post('/auth/google/', { credential: response.credential });
        onSuccess(data);
      } catch (err: any) {
        onError(err?.message || 'Google sign-in failed. Please try again.');
      }
    };

    const initialize = () => {
      if (!window.google || !buttonRef.current) return;
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredential,
        });
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'filled_black',
          size: 'large',
          shape: 'pill',
          text: 'continue_with',
          logo_alignment: 'center',
          width: 280,
        });
        setReady(true);
      } catch {
        onError('Could not initialize Google sign-in.');
      }
    };

    if (window.google) {
      initialize();
    } else {
      const existing = document.getElementById('google-identity-script');
      if (existing) {
        existing.addEventListener('load', initialize);
        return;
      }
      const script = document.createElement('script');
      script.id = 'google-identity-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initialize;
      script.onerror = () => onError('Could not load Google sign-in.');
      document.head.appendChild(script);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFallbackClick = () => {
    onError('Google sign-in is not available right now. Please use email and password.');
  };

  return (
    <div className="ds-stack" style={{ alignItems: 'center', width: '100%' }}>
      <div ref={buttonRef} style={{ display: GOOGLE_CLIENT_ID ? 'block' : 'none' }} />
      {!GOOGLE_CLIENT_ID || !ready ? (
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={handleFallbackClick}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <Icon name="login" size={18} /> Continue with Google
        </Button>
      ) : null}
    </div>
  );
}

export default GoogleLoginButton;
export { GoogleLoginButton };