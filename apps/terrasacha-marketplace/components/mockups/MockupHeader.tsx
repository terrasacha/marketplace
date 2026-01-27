'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { signOutAuth } from '@terrasacha/backend';
import { useRouter } from 'next/router';

const MockupHeader = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setIsLoggedIn(true);
          setUserName(user.username || 'Usuario');
        }
      } catch (error) {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOutAuth();
    setIsLoggedIn(false);
    setShowDropdown(false);
    router.push('/');
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50 shadow-sm animate-slide-down">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 group transition-transform hover:scale-105"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-custom-marca-boton to-custom-marca-boton-variante rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:rotate-12">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <span className="text-2xl font-jostBold text-custom-marca-boton tracking-tight">
              Terrasacha
            </span>
            <span className="text-xs font-champane text-custom-marca-boton-variante2 ml-2 opacity-70">
              Pioneros del Mañana
            </span>
          </Link>

          {/* Navegación */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-gray-700 hover:text-custom-marca-boton transition-all duration-300 font-jostRegular relative group"
            >
              Proyectos
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-custom-marca-boton group-hover:w-full transition-all duration-300"></span>
            </Link>

            {/* User Menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg hover:scale-110 ${
                  isLoggedIn
                    ? 'bg-gradient-to-br from-custom-marca-boton to-custom-marca-boton-variante'
                    : 'bg-gradient-to-br from-gray-100 to-gray-200 hover:from-custom-marca-boton-alterno hover:to-custom-marca-boton-alterno2'
                }`}
                aria-label="Perfil de usuario"
                tabIndex={0}
              >
                <svg
                  className={`w-6 h-6 transition-colors ${isLoggedIn ? 'text-white' : 'text-gray-600'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </button>

              {/* Dropdown */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-fade-in z-50">
                  {isLoggedIn ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm text-gray-500 font-jostRegular">Conectado como</p>
                        <p className="text-sm font-jostBold text-custom-marca-boton truncate">{userName}</p>
                      </div>
                      <Link
                        href="/wallet"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50 font-jostRegular transition-colors"
                        onClick={() => setShowDropdown(false)}
                      >
                        Mi Billetera
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 font-jostRegular transition-colors"
                      >
                        Cerrar Sesión
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/auth/login"
                        className="block px-4 py-2 text-custom-marca-boton hover:bg-gray-50 font-jostBold transition-colors"
                        onClick={() => setShowDropdown(false)}
                      >
                        Iniciar Sesión
                      </Link>
                      <Link
                        href="/auth/signup"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50 font-jostRegular transition-colors"
                        onClick={() => setShowDropdown(false)}
                      >
                        Registrarse
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default MockupHeader;
