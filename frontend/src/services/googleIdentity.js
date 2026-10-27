const GOOGLE_IDENTITY_SCRIPT = 'https://accounts.google.com/gsi/client';

let googleIdentityPromise;

export const loadGoogleIdentity = () => {
  if (window.google?.accounts?.id) {
    return Promise.resolve(window.google);
  }

  if (!googleIdentityPromise) {
    googleIdentityPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = GOOGLE_IDENTITY_SCRIPT;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google?.accounts?.id) {
          resolve(window.google);
        } else {
          reject(new Error('Google Identity Services did not load'));
        }
      };
      script.onerror = () => reject(new Error('Google Identity Services could not be loaded'));
      document.head.appendChild(script);
    }).catch((error) => {
      googleIdentityPromise = undefined;
      throw error;
    });
  }

  return googleIdentityPromise;
};
