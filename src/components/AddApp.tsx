import { useState, useEffect, useContext } from 'react';
import { Button } from './ui/button';
import { ScreenContext } from '@/context/ScreenContext';

export default function AppCreateButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const {setCurrentScreen} = useContext(ScreenContext)
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log("Event fired");
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      (deferredPrompt as any).prompt();
      (deferredPrompt as any).userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        setDeferredPrompt(null);
        setCurrentScreen("videofeed")
      });
    }
  };

  return (
    <div>
      {/* <h1>Welcome to EduMint</h1> */}
      {deferredPrompt && (
        <Button onClick={handleInstallClick} variant="outline" className='rounded-full bg-white text-black'>Install App</Button>
      )}
    </div>
  );
}