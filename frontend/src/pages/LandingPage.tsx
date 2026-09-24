import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Lock,
  ArrowRight,
  X,
  Key,
  Mail,
  User,
  Phone,
  Loader2,
  AlertCircle,
  LogIn,
  UserPlus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

// Inverted corner fillet SVG for seamless organic tab cutouts
const InvertedFillet: React.FC<{
  type: 'tl' | 'tr' | 'bl' | 'br';
  className?: string;
  fill?: string;
  size?: number;
}> = ({ type, className = 'w-6 h-6 sm:w-7 sm:h-7', fill = '#0E1013', size = 28 }) => {
  const paths = {
    tl: `M0,0 H${size} A${size},${size} 0 0,0 0,${size} Z`,
    tr: `M0,0 H${size} V${size} A${size},${size} 0 0,0 0,0 Z`,
    bl: `M0,${size} H${size} A${size},${size} 0 0,0 0,0 Z`,
    br: `M${size},${size} H0 A${size},${size} 0 0,0 ${size},0 Z`,
  };

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className={`${className} pointer-events-none select-none`}
      aria-hidden="true"
    >
      <path d={paths[type]} fill={fill} />
    </svg>
  );
};

interface HeroSlide {
  id: number;
  image: string;
  tag: string;
  title: string;
  description: string;
}

const heroSlides: HeroSlide[] = [
  {
    id: 1,
    image: '/images/bd_command_center.jpg',
    tag: 'DHAKA COMMAND',
    title: 'National 999 Police Response Network',
    description: 'Real-time Dhaka metropolitan tactical dispatch, automated officer routing, and telemetry command.'
  },
  {
    id: 2,
    image: '/images/bd_police_patrol.jpg',
    tag: 'PATROL FLEET',
    title: 'Bangladesh Police Quick Response Patrol',
    description: 'Rapid incident interception, city highway monitoring, and 24/7 civic protection.'
  },
  {
    id: 3,
    image: '/images/bd_digital_gd.jpg',
    tag: 'DIGITAL GD',
    title: 'Citizen Digital General Diary (GD)',
    description: 'Official digital GD filing with instant cryptographically verified receipts and legal status tracking.'
  },
  {
    id: 4,
    image: '/images/bd_smart_city.jpg',
    tag: 'SMART SURVEILLANCE',
    title: 'Metropolitan Safe Zones & Threat Matrix',
    description: 'Automated danger zone geofencing, community sanctuary hubs, and real-time aerial dispatch.'
  }
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, isLoading } = useAuthStore();

  // Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authError, setAuthError] = useState<string | null>(null);

  // Slideshow State
  const [currentSlide, setCurrentSlide] = useState<number>(1); // Default to Bangladesh Police Quick Response Patrol (Slide 2 in array)
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  // Form State
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');

  const openAuth = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setAuthError(null);
    setIsAuthModalOpen(true);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (authMode === 'signin') {
      const result = await login({ email, password });
      if (result.success) {
        setIsAuthModalOpen(false);
        if (result.role === 'POLICE_OFFICER') {
          navigate('/police');
        } else {
          navigate('/citizen');
        }
      } else {
        setAuthError(result.error || 'Authentication failed. Please verify credentials.');
      }
    } else {
      const result = await register({
        full_name: name,
        email,
        phone,
        password
      });
      if (result.success) {
        setIsAuthModalOpen(false);
        navigate('/citizen');
      } else {
        setAuthError(result.error || 'Registration failed');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0E1013] text-slate-900 p-2.5 sm:p-4 lg:p-6 flex flex-col justify-between selection:bg-blue-600 selection:text-white font-sans antialiased">

      {/* LARGE ROUNDED-FRAME OUTER CONTAINER */}
      <div className="relative flex-1 w-full bg-[#FAF7F2] rounded-[28px] sm:rounded-[42px] lg:rounded-[52px] overflow-hidden border border-slate-800/60 shadow-2xl flex flex-col justify-between">

        {/* Subtle Warm Ambient Lighting */}
        <div
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{
            background: 'radial-gradient(ellipse at 75% 35%, rgba(254, 243, 199, 0.45) 0%, transparent 65%), radial-gradient(ellipse at 20% 80%, rgba(241, 245, 249, 0.5) 0%, transparent 50%)'
          }}
        />

        {/* TOP REFINED NAVIGATION WITH DISTINCTIVE ORGANIC CORNER TABS */}
        <header className="relative z-30 flex items-start justify-between w-full">

          {/* Top-Left Dark Tab: Protego Brand Identity */}
          <div className="relative flex items-center">
            <div className="bg-[#0E1013] text-white px-3.5 sm:px-8 h-11 sm:h-[60px] rounded-br-[18px] sm:rounded-br-[28px] flex items-center space-x-2 sm:space-x-3 shadow-sm">
              <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4 fill-blue-500/20 text-blue-400" />
              </div>
              <span className="font-extrabold text-sm sm:text-lg tracking-tight text-white">
                Protego
              </span>
            </div>

            {/* Inverted Fillet Curve connecting Logo Tab to Canvas */}
            <div className="hidden sm:block absolute left-full top-0">
              <InvertedFillet type="tl" size={28} />
            </div>
          </div>

          {/* Top-Center Refined Pill Navigation (Interactive Protego Slide Categories) */}
          <div className="hidden lg:flex items-center justify-center pt-3 sm:pt-4 px-2">
            <nav className="bg-white/80 border border-slate-300/80 backdrop-blur-md px-6 py-2 rounded-full shadow-xs">
              <ul className="flex items-center space-x-6 text-xs font-semibold text-slate-700">
                {heroSlides.map((slide, idx) => (
                  <li key={slide.id}>
                    <button
                      onClick={() => setCurrentSlide(idx)}
                      className={`transition-colors cursor-pointer flex items-center space-x-1.5 ${idx === currentSlide ? 'text-blue-600 font-bold' : 'hover:text-slate-950'
                        }`}
                    >
                      {idx === currentSlide && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      )}
                      <span>{slide.tag}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Top-Right Dark Tab: Get Started Action */}
          <div className="relative flex items-center">
            {/* Inverted Fillet Curve connecting Canvas to Right Tab */}
            <div className="hidden sm:block absolute right-full top-0">
              <InvertedFillet type="tr" size={28} />
            </div>

            <div className="bg-[#0E1013] text-white px-3 sm:px-8 h-11 sm:h-[60px] rounded-bl-[18px] sm:rounded-bl-[28px] flex items-center shadow-sm">
              <button
                onClick={() => openAuth('signup')}
                className="flex items-center space-x-1.5 sm:space-x-2 bg-blue-600 hover:bg-blue-500 text-white text-[11px] sm:text-sm font-bold px-3 sm:px-5 py-1.5 sm:py-2 rounded-full transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98] border border-blue-400/30 cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

        </header>

        {/* HERO SECTION: EDITORIAL COMPOSITION (LEFT) & INTEGRATED CAROUSEL (RIGHT) */}
        <main className="relative z-10 flex-1 px-4 sm:px-10 lg:px-16 pt-6 sm:pt-12 pb-12 sm:pb-20 max-w-[1440px] mx-auto w-full flex flex-col justify-center">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">

            {/* LEFT COLUMN: HERO TYPOGRAPHY & ACTIONS */}
            <div className="lg:col-span-6 space-y-5 sm:space-y-8 text-left">

              {/* Enterprise Security Badge */}
              <div className="inline-flex items-center space-x-2 bg-white/90 border border-slate-300/80 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-slate-700 shadow-xs">
                <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 fill-current" />
                <span className="text-[9px] sm:text-[11px] font-extrabold uppercase tracking-widest text-slate-800">
                  LIVE CONNECTED COMMAND NETWORK
                </span>
              </div>

              {/* Editorial Hero Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-[74px] font-black text-slate-950 tracking-tight leading-[1.08] sm:leading-[1.06]">
                Your Shield in <br />
                <span className="text-slate-950">Public Safety</span>
              </h1>

              {/* Exact Description Text */}
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal max-w-xl">
                The unified emergency intelligence and incident response command network. File digital General Diaries, report criminal offenses with instant evidence verification, and trigger real-time tactical SOS alerts.
              </p>

              {/* Sophisticated Action Buttons & Divider Line (Matching Reference Aesthetic) */}
              <div className="pt-2 space-y-4">
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <button
                    onClick={() => openAuth('signin')}
                    className="group inline-flex items-center space-x-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm py-3 px-5 sm:px-6 rounded-full transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    <span className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center text-[10px] group-hover:translate-x-0.5 transition-transform">
                      <LogIn className="w-3 h-3" />
                    </span>
                    <span>Sign In</span>
                  </button>

                  <button
                    onClick={() => openAuth('signup')}
                    className="group inline-flex items-center space-x-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm py-3 px-5 sm:px-6 rounded-full transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer border border-blue-400/30"
                  >
                    <span className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center text-[10px] group-hover:translate-x-0.5 transition-transform">
                      <UserPlus className="w-3 h-3" />
                    </span>
                    <span>Sign Up</span>
                  </button>
                </div>

                <div className="w-64 sm:w-72 h-[1px] bg-slate-300/80" />
              </div>

            </div>

            {/* RIGHT COLUMN: RESTYLED INTEGRATED SLIDESHOW COMPOSITION */}
            <div
              className="lg:col-span-6 flex items-center justify-center"
              onMouseEnter={() => setIsAutoPlaying(false)}
              onMouseLeave={() => setIsAutoPlaying(true)}
            >
              <div className="relative w-full max-w-[560px] rounded-[28px] sm:rounded-[36px] overflow-hidden border border-slate-300/80 shadow-[0_20px_50px_rgba(15,23,42,0.15)] group bg-slate-950">

                {/* Slides Container */}
                <div className="relative h-[260px] sm:h-[380px] lg:h-[420px] w-full overflow-hidden">
                  {heroSlides.map((slide, index) => (
                    <div
                      key={slide.id}
                      className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                        }`}
                    >
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover transform scale-102 group-hover:scale-105 transition-transform duration-1000"
                      />

                      {/* Gradient Overlays */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#040812] via-[#040812]/55 to-transparent opacity-95"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#040812]/60 via-transparent to-transparent"></div>

                      {/* Slide Caption Overlay with Exact Text */}
                      <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6 z-20 space-y-1 sm:space-y-1.5 text-left">
                        <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-blue-600/90 border border-blue-400/40 text-[9px] sm:text-[10px] font-black text-white uppercase tracking-wider backdrop-blur-xs">
                          <span>{slide.tag}</span>
                        </div>
                        <h3 className="text-sm sm:text-lg lg:text-xl font-black text-white drop-shadow-md leading-tight">
                          {slide.title}
                        </h3>
                        <p className="text-[11px] sm:text-sm text-slate-300 line-clamp-2 max-w-md drop-shadow-sm font-normal">
                          {slide.description}
                        </p>
                      </div>

                    </div>
                  ))}
                </div>

                {/* Minimalist Navigation Arrows */}
                <button
                  onClick={prevSlide}
                  className="absolute left-2 sm:left-3.5 top-1/2 -translate-y-1/2 z-30 p-1.5 sm:p-2.5 rounded-full bg-slate-950/70 hover:bg-slate-900 text-white border border-slate-700/70 backdrop-blur-md transition-all opacity-80 hover:opacity-100 hover:scale-105 active:scale-95 shadow-md cursor-pointer"
                  title="Previous Slide"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>

                <button
                  onClick={nextSlide}
                  className="absolute right-2 sm:right-3.5 top-1/2 -translate-y-1/2 z-30 p-1.5 sm:p-2.5 rounded-full bg-slate-950/70 hover:bg-slate-900 text-white border border-slate-700/70 backdrop-blur-md transition-all opacity-80 hover:opacity-100 hover:scale-105 active:scale-95 shadow-md cursor-pointer"
                  title="Next Slide"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>

                {/* Top Pagination Dots */}
                <div className="absolute top-4 left-4 z-30 flex items-center space-x-1.5">
                  {heroSlides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${idx === currentSlide
                        ? 'w-6 bg-blue-500'
                        : 'w-1.5 bg-slate-400/60 hover:bg-slate-300'
                        }`}
                      title={`Go to slide ${idx + 1}`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>

              </div>
            </div>

          </div>

        </main>

        {/* BOTTOM FOOTER INSIDE WHITE MAIN BOX */}
        <footer className="relative z-20 w-full px-6 sm:px-10 lg:px-16 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3 border-t border-slate-200/80 mt-auto">

          {/* Copyright */}
          <div className="font-semibold text-slate-700 text-center sm:text-left">
            © 2026 Protego Emergency Systems. All rights reserved.
          </div>

          {/* Legal & Policy Links */}
          <div className="flex flex-wrap items-center justify-center space-x-4 text-slate-500 font-medium">
            <button
              onClick={() => openAuth('signin')}
              className="hover:text-slate-900 transition cursor-pointer"
            >
              Privacy Policy
            </button>
            <span className="text-slate-300">·</span>
            <button
              onClick={() => openAuth('signin')}
              className="hover:text-slate-900 transition cursor-pointer"
            >
              Terms of Service
            </button>
            <span className="text-slate-300">·</span>
            <button
              onClick={() => openAuth('signin')}
              className="hover:text-slate-900 transition cursor-pointer"
            >
              Data Protection
            </button>
            <span className="text-slate-300">·</span>
            <button
              onClick={() => openAuth('signin')}
              className="hover:text-slate-900 transition cursor-pointer"
            >
              Security Protocol
            </button>
          </div>

        </footer>

      </div>

      {/* AUTH MODAL (SIGN IN / SIGN UP) - PRESERVED 100% FUNCTIONALITY */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-5 sm:p-8 relative overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto my-auto">

            {/* Close Button */}
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 text-slate-400 hover:text-slate-700 transition-colors p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <div className="flex items-center space-x-3 mb-5 sm:mb-6 pr-6">
              <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-600">
                <Shield className="w-5 h-5" />
              </div>
              <div className="border-l border-slate-200 pl-3">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
                  {authMode === 'signin' ? 'Sign In' : 'Create Account'}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  {authMode === 'signin' ? 'Access your account' : 'Join public safety network'}
                </p>
              </div>
            </div>

            {/* Error Message */}
            {authError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {/* Tab Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-xl mb-5 sm:mb-6 text-xs font-bold">
              <button
                onClick={() => { setAuthMode('signin'); setAuthError(null); }}
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${authMode === 'signin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setAuthMode('signup'); setAuthError(null); }}
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${authMode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                Sign Up
              </button>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-3.5 sm:space-y-4">

              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-base sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address / Identifier
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="citizen@protego.org or officer@protego.org"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-base sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-base sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-base sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900"
                  />
                  <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm py-3 sm:py-3.5 rounded-xl transition-all shadow-md mt-4 sm:mt-6 flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>{authMode === 'signin' ? 'Sign In to Dashboard' : 'Complete Registration'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default LandingPage;
