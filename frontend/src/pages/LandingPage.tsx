import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
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
import Footer from '../components/layout/Footer';
import Logo from '../components/common/Logo';

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
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authError, setAuthError] = useState<string | null>(null);

  // Slideshow State
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4500);
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
        if (result.role === 'POLICE_OFFICER' || email.includes('officer')) {
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
    <div className="min-h-screen bg-[#070e1c] text-white font-sans antialiased selection:bg-blue-600 selection:text-white flex flex-col justify-between">
      
      {/* Dark Header Navbar (Matching Footer Theme) */}
      <nav className="bg-[#040812] text-white px-4 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between sticky top-0 z-40 border-b border-slate-800/80 backdrop-blur-md">
        
        {/* Brand Logo */}
        <Logo variant="dark" onClick={() => navigate('/')} />

        {/* Sign In & Sign Up Navbar Actions (Hidden on mobile) */}
        <div className="hidden sm:flex items-center space-x-2 sm:space-x-3">
          <button 
            onClick={() => openAuth('signin')}
            className="flex items-center space-x-1.5 text-xs sm:text-sm font-extrabold text-slate-300 hover:text-white px-3.5 py-2 rounded-xl transition-colors hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700"
          >
            <LogIn className="w-3.5 h-3.5 text-slate-400" />
            <span>Sign In</span>
          </button>

          <button 
            onClick={() => openAuth('signup')}
            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-black px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] border border-blue-400/30"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Sign Up</span>
          </button>
        </div>

      </nav>

      {/* Hero Section */}
      <section className="bg-[#0b1329] pt-10 sm:pt-16 pb-14 sm:pb-24 px-4 sm:px-8 border-b border-slate-800/60 relative overflow-hidden flex-1 flex items-center">
        
        {/* Subtle background glow circles */}
        <div className="absolute top-1/4 left-10 w-72 sm:w-96 h-72 sm:h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-72 sm:w-[500px] h-72 sm:h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center w-full">
          
          {/* Left Column Text Content */}
          <div className="lg:col-span-6 space-y-4 sm:space-y-6 text-center lg:text-left">
            
            {/* Enterprise Security Badge */}
            <div className="inline-flex items-center space-x-2 bg-slate-800/80 border border-slate-700/80 px-3 sm:px-3.5 py-1.5 rounded-full text-slate-300">
              <Lock className="w-3.5 h-3.5 text-blue-400 fill-current" />
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-slate-300">
                LIVE CONNECTED COMMAND NETWORK
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15] sm:leading-[1.1]">
              Your Shield in <br className="hidden sm:inline" />Public Safety
            </h1>

            {/* Subtitle */}
            <p className="text-slate-400 text-sm sm:text-base md:text-lg leading-relaxed font-normal max-w-xl mx-auto lg:mx-0">
              The unified emergency intelligence and incident response command network. File digital General Diaries, report criminal offenses with instant evidence verification, and trigger real-time tactical SOS alerts.
            </p>

            {/* Clear Distinct CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-5 pt-3">
              
              {/* Primary Sign In Button */}
              <button 
                onClick={() => openAuth('signin')}
                className="flex items-center justify-center space-x-0 sm:space-x-2.5 bg-blue-600 sm:bg-white hover:bg-blue-500 sm:hover:bg-slate-100 text-white sm:text-slate-950 font-bold sm:font-black text-sm sm:text-base py-3.5 sm:py-4 px-8 rounded-full sm:rounded-xl transition-all shadow-lg sm:shadow-xl hover:shadow-xl sm:hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] w-full max-w-[320px] sm:max-w-none sm:w-auto border border-transparent sm:border-white group"
              >
                <LogIn className="hidden sm:block w-4 h-4 text-slate-900 group-hover:translate-x-0.5 transition-transform" />
                <span>Sign In</span>
              </button>

              {/* Secondary Sign Up Button */}
              <button 
                onClick={() => openAuth('signup')}
                className="flex items-center justify-center space-x-0 sm:space-x-2.5 bg-[#eef2ff] sm:bg-blue-600 hover:bg-[#e0e7ff] sm:hover:bg-blue-500 text-blue-700 sm:text-white font-bold sm:font-black text-sm sm:text-base py-3.5 sm:py-4 px-8 rounded-full sm:rounded-xl transition-all shadow-md sm:shadow-xl hover:shadow-lg sm:hover:shadow-blue-500/40 sm:shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] border border-blue-100 sm:border-blue-400/40 w-full max-w-[320px] sm:max-w-none sm:w-auto group"
              >
                <UserPlus className="hidden sm:block w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                <span>Sign Up</span>
              </button>

            </div>

          </div>

          {/* Right Column Interactive Auto-Play Slideshow */}
          <div 
            className="lg:col-span-6"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            <div className="relative rounded-2xl overflow-hidden border border-slate-700/70 shadow-[0_20px_50px_rgba(0,0,0,0.6)] group bg-slate-950">
              
              {/* Slides Container */}
              <div className="relative h-[280px] sm:h-[380px] lg:h-[420px] w-full overflow-hidden">
                {heroSlides.map((slide, index) => (
                  <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                      index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                    }`}
                  >
                    <img 
                      src={slide.image} 
                      alt={slide.title}
                      className="w-full h-full object-cover transform scale-105 group-hover:scale-110 transition-transform duration-1000"
                    />
                    
                    {/* Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#040812] via-[#040812]/50 to-transparent opacity-90"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#040812]/70 via-transparent to-transparent"></div>

                    {/* Slide Caption Overlay */}
                    <div className="absolute bottom-5 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 z-20 space-y-1.5">
                      <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md bg-blue-600/80 border border-blue-400/40 text-[10px] font-black text-white uppercase tracking-wider backdrop-blur-xs">
                        <span>{slide.tag}</span>
                      </div>
                      <h3 className="text-base sm:text-lg lg:text-xl font-black text-white drop-shadow-md leading-tight">
                        {slide.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 max-w-md drop-shadow-sm font-normal">
                        {slide.description}
                      </p>
                    </div>

                  </div>
                ))}
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white border border-slate-700/70 backdrop-blur-md transition-all opacity-80 hover:opacity-100 hover:scale-105 active:scale-95 shadow-lg"
                title="Previous Slide"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <button
                onClick={nextSlide}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white border border-slate-700/70 backdrop-blur-md transition-all opacity-80 hover:opacity-100 hover:scale-105 active:scale-95 shadow-lg"
                title="Next Slide"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Bottom Pagination Dots */}
              <div className="absolute top-4 left-4 z-30 flex items-center space-x-1.5">
                {heroSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentSlide 
                        ? 'w-6 bg-blue-500' 
                        : 'w-1.5 bg-slate-600/70 hover:bg-slate-400'
                    }`}
                    title={`Go to slide ${idx + 1}`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

            </div>
          </div>

        </div>

      </section>

      {/* Rich Responsive Footer */}
      <Footer onOpenAuth={(mode) => {
        setAuthMode(mode);
        setIsAuthModalOpen(true);
      }} />

      {/* Auth Modal (Sign In / Sign Up) */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-5 sm:p-8 relative overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto my-auto">
            
            {/* Close Button */}
            <button 
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 text-slate-400 hover:text-slate-700 transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <div className="flex items-center space-x-3 mb-5 sm:mb-6 pr-6">
              <Logo size="md" />
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
                className={`flex-1 py-2 rounded-lg transition-all ${
                  authMode === 'signin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sign In
              </button>
              <button 
                onClick={() => { setAuthMode('signup'); setAuthError(null); }}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  authMode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
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
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900"
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
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900"
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
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900"
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
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900"
                  />
                  <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm py-3 sm:py-3.5 rounded-xl transition-all shadow-md mt-4 sm:mt-6 flex items-center justify-center space-x-2 disabled:opacity-60"
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
