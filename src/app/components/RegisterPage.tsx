"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import NavBar from "./NavBar";
import { registerUser } from "../../../services/auth";
import { usePieceContext } from "./PieceContext";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    username: "", // Aggiunto campo username
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  const { t, darkMode } = usePieceContext();

  interface Errors {
    [key: string]: string | undefined;
    name?: string;
    username?: string; // Aggiunto errore per username
    email?: string;
    password?: string;
    confirmPassword?: string;
  }

  const [errors, setErrors] = useState<Errors>({});

  // Gestione della responsività
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    // Set iniziale
    handleResize();

    // Listener per il ridimensionamento
    window.addEventListener('resize', handleResize);

    // Pulizia
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const style = document.getElementById("check-border-style");
    if (style) {
      document.head.removeChild(style);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Reset error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validate = () => {
    const newErrors: Errors = {};

    if (!formData.name.trim()) {
      newErrors.name = `${t.errorNameRequired}`;
    }

    if (!formData.username.trim()) {
      newErrors.username = `${t.errorUsernameRequired}`;
    } else if (formData.username.length < 3) {
      newErrors.username = `${t.errorUsernameTooShort}`;
    }

    if (!formData.email.trim()) {
      newErrors.email = `${t.errorEmailRequired}`;
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = `${t.errorEmailInvalid}`;
    }

    if (!formData.password) {
      newErrors.password = `${t.errorPasswordRequired}`;
    } else if (formData.password.length < 6) {
      newErrors.password = `${t.errorPasswordTooShort}`;
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = `${t.errorPasswordUppercase}`;
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = `${t.errorPasswordNumber}`;
    } else if (!/[!@#$%^&*]/.test(formData.password)) {
      newErrors.password = `${t.errorPasswordSpecial}`;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = `${t.errorPasswordsMismatch}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      await registerUser(formData); // Chiama la funzione di registrazione
      window.location.href = "/"; // Reindirizzamento dopo successo
    } catch (error) {
      console.error("Errore nella registrazione:", error);
      setErrors(prev => ({ ...prev, email: `${t.errorRegistrationFailed}` }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={`fixed top-0 left-0 w-full shadow-md z-50 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
      <NavBar current={-1} />
      </div>
      <div className={`inset-0 flex items-center justify-center ${darkMode ? 'bg-slate-900' : 'bg-gradient-to-br from-green-100 via-amber-50 to-green-100'} pt-24 min-h-screen`}>
      <div className="relative flex flex-col items-center justify-center w-full px-4 md:px-0">
        {/* Elementi di sfondo animati */}
        <div className="absolute inset-0">
        <div className={`absolute top-1/4 left-1/4 w-40 md:w-80 h-40 md:h-80 ${darkMode ? 'bg-slate-700' : 'bg-green-200'} rounded-full mix-blend-multiply filter blur-lg opacity-60 animate-pulse`}></div>
        <div className={`absolute top-1/3 right-1/3 w-40 md:w-80 h-40 md:h-80 ${darkMode ? 'bg-slate-600' : 'bg-amber-200'} rounded-full mix-blend-multiply filter blur-lg opacity-60 animate-pulse delay-700`}></div>
        <div className={`absolute bottom-1/4 left-1/3 w-40 md:w-80 h-40 md:h-80 ${darkMode ? 'bg-slate-500' : 'bg-green-300'} rounded-full mix-blend-multiply filter blur-lg opacity-60 animate-pulse delay-1000`}></div>
        </div>

        {/* Container principale */}
        <div className={`z-10 p-6 md:p-10 ${darkMode ? 'bg-slate-800 text-white' : 'bg-white/30'} backdrop-blur-md rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-500 w-full max-w-md md:max-w-2xl`}>
        <h1 className={`text-2xl md:text-3xl font-bold ${darkMode ? 'text-white' : 'text-green-800'} mb-6 tracking-tight text-center`}>
          {t.joinBoardverse}
        </h1>

        <form onSubmit={handleSubmit} className={`${isSmallScreen ? 'space-y-4' : 'grid grid-cols-2 gap-x-6 gap-y-4'}`}>
          {/* Nome */}
          <div className={`space-y-1 ${isSmallScreen ? '' : 'col-span-1'}`}>
          <label htmlFor="name" className={`block text-sm font-medium ${darkMode ? 'text-white' : 'text-green-700'}`}>
            {t.fullName}
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-3 ${darkMode ? 'bg-slate-700 text-white' : 'bg-white/50'} border ${errors.name ? 'border-red-300' : 'border-green-200'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all`}
            placeholder={t.yourName}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Username */}
          <div className={`space-y-1 ${isSmallScreen ? '' : 'col-span-1'}`}>
          <label htmlFor="username" className={`block text-sm font-medium ${darkMode ? 'text-white' : 'text-green-700'}`}>
            {t.username}
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className={`w-full px-4 py-3 ${darkMode ? 'bg-slate-700 text-white' : 'bg-white/50'} border ${errors.username ? 'border-red-300' : 'border-green-200'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all`}
            placeholder={t.yourUsername}
          />
          {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
          </div>

          {/* Email */}
          <div className={`space-y-1 ${isSmallScreen ? '' : 'col-span-2'}`}>
          <label htmlFor="email" className={`block text-sm font-medium ${darkMode ? 'text-white' : 'text-green-700'}`}>
            {t.email}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-3 ${darkMode ? 'bg-slate-700 text-white' : 'bg-white/50'} border ${errors.email ? 'border-red-300' : 'border-green-200'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all`}
            placeholder={t.yourEmail}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className={`space-y-1 ${isSmallScreen ? '' : 'col-span-1'}`}>
          <label htmlFor="password" className={`block text-sm font-medium ${darkMode ? 'text-white' : 'text-green-700'}`}>
            {t.password}
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-4 py-3 ${darkMode ? 'bg-slate-700 text-white' : 'bg-white/50'} border ${errors.password ? 'border-red-300' : 'border-green-200'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all`}
            placeholder={t.yourPassword}
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Conferma Password */}
          <div className={`space-y-1 ${isSmallScreen ? '' : 'col-span-1'}`}>
          <label htmlFor="confirmPassword" className={`block text-sm font-medium ${darkMode ? 'text-white' : 'text-green-700'}`}>
            {t.confirmPassword}
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`w-full px-4 py-3 ${darkMode ? 'bg-slate-700 text-white' : 'bg-white/50'} border ${errors.confirmPassword ? 'border-red-300' : 'border-green-200'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all`}
            placeholder={t.confirmYourPassword}
          />
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          {/* Pulsante di invio */}
          <div className={`pt-2 ${isSmallScreen ? '' : 'col-span-2'}`}>
          <button
            type="submit"
            disabled={isLoading}
            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-full text-white ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 active:translate-y-0`}
          >
            {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t.registering}
            </span>
            ) : (
            <span className="relative">
              {t.register}
              <span className="absolute bottom-0 left-0 w-full h-px bg-white transform origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></span>
            </span>
            )}
          </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className={`text-sm ${darkMode ? 'text-white' : 'text-green-700'}`}>
          {t.alreadyHaveAccount}{" "}
          <Link href="/login" className={`font-medium ${darkMode ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-700'}`}>
            {t.login}
          </Link>
          </p>
        </div>
        </div>

        {/* Anelli decorativi */}
        <div className="absolute inset-0 -z-10">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[500px] h-[300px] md:h-[500px] border ${darkMode ? 'border-slate-700/30' : 'border-green-200/30'} rounded-full animate-pulse`}></div>
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] md:w-[400px] h-[250px] md:h-[400px] border ${darkMode ? 'border-slate-600/30' : 'border-amber-200/30'} rounded-full animate-pulse delay-300`}></div>
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] md:w-[300px] h-[200px] md:h-[300px] border ${darkMode ? 'border-slate-500/30' : 'border-green-300/30'} rounded-full animate-pulse delay-500`}></div>
        </div>
      </div>
      </div>
    </>
  );
};

export default RegisterPage;