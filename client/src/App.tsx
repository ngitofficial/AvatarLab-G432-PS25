import React from 'react';
// import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { HomePage } from './pages/Home';
import { CreatePage } from './pages/Create';
import HeygenPage from "./pages/HeygenPage";
import { PostLoginDashboard } from './pages/Dashboard'; // Import the new component
import HistoryDisplay from './pages/History';


// import Lenis from '@studio-freight/lenis';

function App() {
  // useEffect(() => {
  //   const lenis = new Lenis({
  //     duration: 1.2,
  //     easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://easings.net
  //     orientation: 'vertical', // or 'horizontal'
  //     gestureOrientation: 'vertical', // or 'horizontal', or 'both'
  //     smoothWheel: true,
  //     smoothTouch: false,
  //     wheelMultiplier: 1,
  //     touchMultiplier: 2,
  //     infinite: false,
  //   });

  //   function raf(time: DOMHighResTimeStamp) {
  //     lenis.raf(time);
  //     requestAnimationFrame(raf);
  //   }
  //   requestAnimationFrame(raf);

  //   return () => {
  //     lenis.destroy();
  //   };
  // }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/history" element={<HistoryDisplay />} />
          <Route path="/create" element={<CreatePage />} />
         <Route path="/dashboard" element={<PostLoginDashboard />} /> {/* ✅ NEW */}
            <Route path="/heygen" element={<HeygenPage />} /> {/* ✅ NEW */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
