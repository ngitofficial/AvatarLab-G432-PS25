import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

export const PostLoginDashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleCreateOwn = () => navigate('/create');
  const handleUsePretrained = () => navigate('/heygen');

  return (
    <div className="min-h-screen bg-black text-white relative">
      <Navbar scrolled />

      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-black z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent z-0" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full filter blur-2xl z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-500/5 rounded-full filter blur-xl z-0" />

      <div className="relative z-10 flex flex-col items-center justify-start min-h-screen px-6 md:px-12 lg:px-16 max-w-7xl mx-auto pt-32 pb-20">
        {/* Heading */}
        <div className="text-center mb-16 max-w-4xl">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight font-display">
            Welcome <span className="italic text-blue-600">Back!</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mt-6 max-w-2xl mx-auto leading-relaxed">
            What would you like to <span className="font-medium text-blue-400">create today?</span>
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl w-full">
          {/* Shared card wrapper for consistent sizing */}
          <div className="h-full flex">
            <div onClick={handleCreateOwn} className="group relative cursor-pointer w-full flex flex-col">
              {/* Background blur */}
              <div className="absolute -inset-1 bg-blue-500/10 rounded-3xl blur-lg group-hover:bg-blue-500/15 transition-all duration-300" />
              
              {/* Card */}
              <div className="relative p-8 md:p-10 flex flex-col justify-between rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm hover:from-white/10 hover:to-white/15 transition-all duration-300 transform hover:scale-[1.015] hover:-translate-y-1 h-full">
                <div className="space-y-6">
                  <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-500 transition-colors duration-300 shadow-md shadow-blue-500/10">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-3xl md:text-4xl font-bold tracking-tight font-display transition-colors duration-300 group-hover:text-blue-400">
                      Create Your Own
                      <span className="block text-blue-600 italic">AI Avatar</span>
                    </h3>
                    <p className="text-lg text-gray-300 leading-relaxed">
                      Build a custom AI avatar from scratch with advanced personalization tools and make it truly yours.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center text-blue-400 font-medium text-lg group-hover:text-blue-300 transition-colors duration-300">
                  <span>Get Started</span>
                  <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Second card */}
          <div className="h-full flex">
            <div onClick={handleUsePretrained} className="group relative cursor-pointer w-full flex flex-col">
              <div className="absolute -inset-1 bg-white/10 rounded-3xl blur-lg group-hover:bg-white/15 transition-all duration-300" />

              <div className="relative p-8 md:p-10 flex flex-col justify-between rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm hover:from-white/10 hover:to-white/15 transition-all duration-300 transform hover:scale-[1.015] hover:-translate-y-1 h-full">
                <div className="space-y-6">
                  <div className="w-16 h-16 bg-gray-700 rounded-2xl flex items-center justify-center group-hover:bg-gray-600 transition-colors duration-300 shadow-md shadow-white/10">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-3xl md:text-4xl font-bold tracking-tight font-display group-hover:text-gray-300 transition-colors duration-300">
                      Use Pre-trained
                      <span className="block text-gray-400 italic">Avatars</span>
                    </h3>
                    <p className="text-lg text-gray-300 leading-relaxed">
                      Choose from our collection of ready-made AI avatars and start creating content immediately.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center text-gray-400 font-medium text-lg group-hover:text-gray-300 transition-colors duration-300">
                  <span>Browse Collection</span>
                  <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
