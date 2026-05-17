import { useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Providers } from './providers';
import { router } from './router';
import { SplashScreen } from '../components/brand/SplashScreen';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <Providers>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <RouterProvider router={router} />
    </Providers>
  );
}
