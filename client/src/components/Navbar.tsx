import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { Button } from './ui/button';

interface NavbarProps {
  scrolled: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ scrolled }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Modified logout handler to ensure navigation happens after logout


  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActivePage = (path: string) => location.pathname === path;

  return (
    <nav
      className={`
        fixed top-4 left-1/2 transform -translate-x-1/2 
        w-[calc(100%-2rem)] max-w-screen-xl mx-auto z-50 
        px-6 py-4 rounded-xl transition-all duration-300
        ${scrolled ? "bg-black/70 backdrop-blur-md border border-white/10" : "bg-transparent"} 
      `}
    >
      <div className="flex justify-between items-center">
        <Link 
          to="/" 
          className="text-2xl font-bold text-white font-display tracking-tight hover:text-blue-400 transition-colors"
        >
          AI Avatar Lab
        </Link>

        <div className="flex items-center space-x-6">
          {user ? (
            <>
              <Link 
                to="/dashboard" 
                className="relative group px-4 py-2 rounded-lg hover:bg-blue-500/10 transition-all duration-300"
              >
                <span className={`text-sm font-medium ${
                  isActivePage('/dashboard') 
                    ? 'text-blue-400' 
                    : 'text-gray-300 group-hover:text-blue-400'
                } transition-colors`}>
                  Dashboard
                </span>
                {isActivePage('/dashboard') && (
                  <span className="absolute bottom-0 left-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full transform -translate-x-1/2" />
                )}
              </Link>
              
              <div className="flex items-center space-x-3 px-4 py-2 bg-white/5 rounded-lg border border-white/10 hover:bg-blue-500/10 hover:border-blue-500/20 transition-all duration-300 group">
                <User size={18} className="text-gray-400 group-hover:text-blue-400" />
                <span className="text-sm text-white font-medium">{user.name}</span>
              </div>
              
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="p-2 text-gray-300 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-300"
              >
                <LogOut size={18} className="text-gray-400 group-hover:text-blue-400" />
              </Button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="relative group px-4 py-2 rounded-lg hover:bg-blue-500/10 transition-all duration-300"
              >
                <span className={`text-sm font-medium ${
                  isActivePage('/login') 
                    ? 'text-blue-400' 
                    : 'text-gray-300 group-hover:text-blue-400'
                } transition-colors`}>
                  Login
                </span>
                {isActivePage('/login') && (
                  <span className="absolute bottom-0 left-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full transform -translate-x-1/2" />
                )}
              </Link>
              
              <Button
                asChild
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/25"
              >
                <Link to="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};