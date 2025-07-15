// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Navbar } from '../components/Navbar';
// import { Button } from '../components/ui/button';
// import { useAuth } from '../auth/AuthContext';
// import { ArrowRight } from 'lucide-react';

// export const HomePage: React.FC = () => {
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const [scrolled, setScrolled] = useState(false);

//   const handleGetStarted = () => {
//     if (user) {
//       navigate('/create');
//     } else {
//       navigate('/login');
//     }
//   };

//   return (
//     <div className="min-h-screen bg-black text-white relative">
//       {/* Enhanced gradient background */}
//       <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-black" />
//       <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
//       <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl" />
      
//       <Navbar scrolled={scrolled} />

//       <div className="relative grid grid-cols-1 md:grid-cols-2 min-h-screen px-6 md:px-12 lg:px-16 gap-12 items-center max-w-7xl mx-auto">
//         {/* Left Content */}
//         <div className="flex flex-col justify-center pt-20 md:pt-0">
//           <div className="space-y-8">
//             <div className="space-y-2">
//               <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight font-display">
//                 Create
//               </h1>
//               <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight font-display">
//                 Your Own
//               </h1>
//               <h2 className="text-6xl md:text-7xl lg:text-8xl font-bold italic tracking-tight text-blue-600 font-display">
//                 Digital Twin
//               </h2>
//             </div>

//             <p className="text-2xl md:text-3xl text-gray-300 max-w-xl leading-relaxed">
//              An Avatar That Looks and
//               <span className="font-medium"> Acts Like You!</span>
//             </p>

//             <Button
//               onClick={handleGetStarted}
//               className="group bg-blue-600 hover:bg-blue-700 text-white 
//                        px-8 py-4 mt-6 rounded-xl text-xl font-medium 
//                        transition-all duration-300 
//                        shadow-lg shadow-blue-500/20 
//                        flex items-center gap-3 w-fit"
//             >
//               Get Started
//               <ArrowRight className="group-hover:translate-x-1 transition-transform" />
//             </Button>
//           </div>
//         </div>

//         {/* Right Content - Image */}
//         <div className="relative h-full w-full flex items-center justify-center">
//           <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent z-10 md:hidden" />
//           <div className="relative w-full max-w-2xl mx-auto">
//             {/* Decorative elements */}
//             <div className="absolute -inset-1 bg-blue-500/20 rounded-3xl blur-xl" />
//             <div className="absolute -inset-2 bg-blue-600/10 rounded-3xl blur-2xl" />
            
//             {/* Image container */}
//             <div className=" m-3 relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm margin-40">
//               <img 
//                 // src="src\assets\images\neil-avatar.png" // Place your image here
//                 src="src\assets\images\ChatGPT Image Jun 9, 2025, 03_58_09 PM.png" // Place your image here
//                 alt="AI Avatar Demo"
//                 // className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { useAuth } from '../auth/AuthContext';
import { ArrowRight } from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard'); // Redirect to dashboard if user is logged in
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Enhanced gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl" />
      
      <Navbar scrolled={scrolled} />

      <div className="relative grid grid-cols-1 md:grid-cols-2 min-h-screen px-6 md:px-12 lg:px-16 gap-12 items-center max-w-7xl mx-auto">
        {/* Left Content */}
        <div className="flex flex-col justify-center pt-20 md:pt-0">
          <div className="space-y-8">
            <div className="space-y-2">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight font-display">
                Create
              </h1>
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight font-display">
                Your Own
              </h1>
              <h2 className="text-6xl md:text-7xl lg:text-8xl font-bold italic tracking-tight text-blue-600 font-display">
                Digital Twin
              </h2>
            </div>

            <p className="text-2xl md:text-3xl text-gray-300 max-w-xl leading-relaxed">
             An Avatar That Looks and
              <span className="font-medium"> Acts Like You!</span>
            </p>

            <Button
              onClick={handleGetStarted}
              className="group bg-blue-600 hover:bg-blue-700 text-white 
                       px-8 py-4 mt-6 rounded-xl text-xl font-medium 
                       transition-all duration-300 
                       shadow-lg shadow-blue-500/20 
                       flex items-center gap-3 w-fit"
            >
              Get Started
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        {/* Right Content - Image */}
        <div className="relative h-full w-full flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent z-10 md:hidden" />
          <div className="relative w-full max-w-2xl mx-auto">
            {/* Decorative elements */}
            <div className="absolute -inset-1 bg-blue-500/20 rounded-3xl blur-xl" />
            <div className="absolute -inset-2 bg-blue-600/10 rounded-3xl blur-2xl" />
            
            {/* Image container */}
            <div 
              className="m-3 relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm margin-40 cursor-pointer"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <img 
                src={isHovered ? "src/assets/57-18d7158d-unscreen.gif" : "src/assets/images/ChatGPT Image Jun 9, 2025, 03_58_09 PM.png"}
                alt="AI Avatar Demo"
                className="w-full h-full object-cover transition-all duration-300"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Navbar } from '../components/Navbar';
// import { Button } from '../components/ui/button';
// import { useAuth } from '../auth/AuthContext';
// import { ArrowRight, ChevronDown } from 'lucide-react';

// export const HomePage: React.FC = () => {
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const [scrolled, setScrolled] = useState(false);
//   const [isHovered, setIsHovered] = useState(false);

//   const handleGetStarted = () => {
//     if (user) {
//       navigate('/create');
//     } else {
//       navigate('/login');
//     }
//   };

//   const scrollToUseCases = () => {
//     document.getElementById('use-cases')?.scrollIntoView({ 
//       behavior: 'smooth' 
//     });
//   };

//   return (
//     <div className="min-h-screen bg-black text-white">
//       {/* Hero Section */}
//       <div className="min-h-screen relative">
//         {/* Enhanced gradient background */}
//         <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-black" />
//         <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
//         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl" />
        
//         <Navbar scrolled={scrolled} />

//         <div className="relative grid grid-cols-1 md:grid-cols-2 min-h-screen px-6 md:px-12 lg:px-16 gap-12 items-center max-w-7xl mx-auto">
//           {/* Left Content */}
//           <div className="flex flex-col justify-center pt-20 md:pt-0">
//             <div className="space-y-8">
//               <div className="space-y-2">
//                 <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight font-display">
//                   Create
//                 </h1>
//                 <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight font-display">
//                   Your Own
//                 </h1>
//                 <h2 className="text-6xl md:text-7xl lg:text-8xl font-bold italic tracking-tight text-blue-600 font-display">
//                   Digital Twin
//                 </h2>
//               </div>

//               <p className="text-2xl md:text-3xl text-gray-300 max-w-xl leading-relaxed">
//                An Avatar That Looks and
//                 <span className="font-medium"> Acts Like You!</span>
//               </p>

//               <Button
//                 onClick={handleGetStarted}
//                 className="group bg-blue-600 hover:bg-blue-700 text-white 
//                          px-8 py-4 mt-6 rounded-xl text-xl font-medium 
//                          transition-all duration-300 
//                          shadow-lg shadow-blue-500/20 
//                          flex items-center gap-3 w-fit"
//               >
//                 Get Started
//                 <ArrowRight className="group-hover:translate-x-1 transition-transform" />
//               </Button>
//             </div>
//           </div>

//           {/* Right Content - Image */}
//           <div className="relative h-full w-full flex items-center justify-center">
//             <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent z-10 md:hidden" />
//             <div className="relative w-full max-w-2xl mx-auto">
//               {/* Decorative elements */}
//               <div className="absolute -inset-1 bg-blue-500/20 rounded-3xl blur-xl" />
//               <div className="absolute -inset-2 bg-blue-600/10 rounded-3xl blur-2xl" />
              
//               {/* Image container */}
//               <div 
//                 className="m-3 relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm margin-40 cursor-pointer"
//                 onMouseEnter={() => setIsHovered(true)}
//                 onMouseLeave={() => setIsHovered(false)}
//               >
//                 <img 
//                   src={isHovered ? "src/assets/57-18d7158d-unscreen.gif" : "src/assets/images/ChatGPT Image Jun 9, 2025, 03_58_09 PM.png"}
//                   alt="AI Avatar Demo"
//                   className="w-full h-full object-cover transition-all duration-300"
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Swipe to know more indicator */}
//         <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce cursor-pointer" onClick={scrollToUseCases}>
//           <span className="text-gray-400 text-sm mb-2 font-medium">Swipe to know more</span>
//           <ChevronDown className="w-6 h-6 text-blue-400" />
//         </div>
//       </div>

//       {/* Use Cases Section */}
//       <div id="use-cases" className="relative py-20">
//         {/* Background */}
//         <div className="absolute inset-0 bg-gradient-to-br from-black via-blue-950/10 to-black" />
//         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full filter blur-3xl" />

//         <div className="relative max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
//           {/* Section Header */}
//           <div className="text-center mb-16">
//             <div className="space-y-4">
//               <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight font-display">
//                 Where Avatar Lab
//               </h2>
//               <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold italic tracking-tight text-blue-600 font-display">
//                 Helps You Shine
//               </h3>
//               <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mt-8">
//                 Transform your digital presence across platforms with AI-powered avatars that capture your essence
//               </p>
//             </div>
//           </div>

//           {/* Use Cases Grid */}
//           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
//             {/* Social Media */}
//             <div className="group relative">
//               <div className="absolute -inset-1 bg-blue-500/20 rounded-3xl blur-xl group-hover:bg-blue-500/30 transition-all duration-500" />
//               <div className="relative p-8 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm hover:from-white/10 hover:to-white/15 transition-all duration-500">
//                 <div className="space-y-6">
//                   <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
//                     <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10M5 4h14l-1 15H6L5 4zm5 5v6m4-6v6" />
//                     </svg>
//                   </div>
//                   <div>
//                     <h4 className="text-2xl font-bold mb-3 group-hover:text-blue-400 transition-colors duration-300">Social Media</h4>
//                     <p className="text-gray-300 leading-relaxed">Create engaging content for Instagram, TikTok, YouTube, and other platforms with your personalized AI avatar</p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Brand Ambassador */}
//             <div className="group relative">
//               <div className="absolute -inset-1 bg-white/10 rounded-3xl blur-xl group-hover:bg-white/15 transition-all duration-500" />
//               <div className="relative p-8 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm hover:from-white/10 hover:to-white/15 transition-all duration-500">
//                 <div className="space-y-6">
//                   <div className="w-16 h-16 bg-gray-700 rounded-2xl flex items-center justify-center shadow-lg shadow-white/10">
//                     <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
//                     </svg>
//                   </div>
//                   <div>
//                     <h4 className="text-2xl font-bold mb-3 group-hover:text-gray-300 transition-colors duration-300">Brand Ambassador</h4>
//                     <p className="text-gray-300 leading-relaxed">Represent your brand consistently across all marketing materials and customer touchpoints</p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Online Courses */}
//             <div className="group relative">
//               <div className="absolute -inset-1 bg-blue-500/20 rounded-3xl blur-xl group-hover:bg-blue-500/30 transition-all duration-500" />
//               <div className="relative p-8 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm hover:from-white/10 hover:to-white/15 transition-all duration-500">
//                 <div className="space-y-6">
//                   <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
//                     <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
//                     </svg>
//                   </div>
//                   <div>
//                     <h4 className="text-2xl font-bold mb-3 group-hover:text-blue-400 transition-colors duration-300">Online Courses</h4>
//                     <p className="text-gray-300 leading-relaxed">Create educational content and tutorials with your AI avatar as the instructor, making learning more personal</p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Customer Service */}
//             <div className="group relative">
//               <div className="absolute -inset-1 bg-white/10 rounded-3xl blur-xl group-hover:bg-white/15 transition-all duration-500" />
//               <div className="relative p-8 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm hover:from-white/10 hover:to-white/15 transition-all duration-500">
//                 <div className="space-y-6">
//                   <div className="w-16 h-16 bg-gray-700 rounded-2xl flex items-center justify-center shadow-lg shadow-white/10">
//                     <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
//                     </svg>
//                   </div>
//                   <div>
//                     <h4 className="text-2xl font-bold mb-3 group-hover:text-gray-300 transition-colors duration-300">Customer Service</h4>
//                     <p className="text-gray-300 leading-relaxed">Provide 24/7 customer support with your AI avatar, maintaining personal connection at scale</p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Virtual Meetings */}
//             <div className="group relative">
//               <div className="absolute -inset-1 bg-blue-500/20 rounded-3xl blur-xl group-hover:bg-blue-500/30 transition-all duration-500" />
//               <div className="relative p-8 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm hover:from-white/10 hover:to-white/15 transition-all duration-500">
//                 <div className="space-y-6">
//                   <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
//                     <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
//                     </svg>
//                   </div>
//                   <div>
//                     <h4 className="text-2xl font-bold mb-3 group-hover:text-blue-400 transition-colors duration-300">Virtual Meetings</h4>
//                     <p className="text-gray-300 leading-relaxed">Attend meetings and presentations with your AI avatar when you can't be there in person</p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Content Creation */}
//             <div className="group relative">
//               <div className="absolute -inset-1 bg-white/10 rounded-3xl blur-xl group-hover:bg-white/15 transition-all duration-500" />
//               <div className="relative p-8 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm hover:from-white/10 hover:to-white/15 transition-all duration-500">
//                 <div className="space-y-6">
//                   <div className="w-16 h-16 bg-gray-700 rounded-2xl flex items-center justify-center shadow-lg shadow-white/10">
//                     <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                     </svg>
//                   </div>
//                   <div>
//                     <h4 className="text-2xl font-bold mb-3 group-hover:text-gray-300 transition-colors duration-300">Content Creation</h4>
//                     <p className="text-gray-300 leading-relaxed">Scale your content production for blogs, podcasts, and video content with consistent messaging</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
