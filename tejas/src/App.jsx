import React, { useState, useEffect } from 'react';
import Lenis from 'lenis';
import { Menu, X, Landmark, Compass, HelpCircle, FileBarChart, Zap, Leaf, BarChart3, Sun, Moon, Activity } from 'lucide-react';
import TejasLogo from './components/TejasLogo';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import OperationalAnalysis from './pages/OperationalAnalysis';
import RouteAnalysis from './pages/RouteAnalysis';
import CostAnalysis from './pages/CostAnalysis';
import EmissionAnalysis from './pages/EmissionAnalysis';
import ChargingInfra from './pages/ChargingInfra';
import PredictionCentre from './pages/PredictionCentre';
import ReportsPage from './pages/ReportsPage';
import AboutPage from './pages/AboutPage';

import Preloader from './components/Preloader';
import InteractiveBackground from './components/InteractiveBackground';

const navItems = [
  { id: 'home', label: 'Home', icon: Compass },
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'operational-analysis', label: 'Operational & Demand', icon: Activity },
  { id: 'depot-analysis', label: 'Depot Analysis', icon: BarChart3 },
  { id: 'route-analysis', label: 'Route Analysis', icon: Zap },
  { id: 'cost-analysis', label: 'Cost Analysis', icon: Landmark },
  { id: 'emission-analysis', label: 'Emissions', icon: Leaf },
  { id: 'prediction-centre', label: 'Prediction Centre', icon: FileBarChart },
  { id: 'charging-infra', label: 'Charging Grid', icon: Zap },
  { id: 'reports', label: 'Reports', icon: FileBarChart },
  { id: 'about', label: 'About', icon: HelpCircle },
];

export default function App() {
  const [page, setPage] = useState('landing');
  const [activeSection, setActiveSection] = useState('home');
  const [scrollTarget, setScrollTarget] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Lenis Smooth Scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 2.0
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  // Handle navigation from Landing Page or Portal Header
  const handleNav = (target) => {
    setMobileMenuOpen(false);
    if (target === 'landing') {
      setPage('landing');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setPage('portal');
      setScrollTarget(target);
    }
  };

  // Scroll to section inside portal
  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    setActiveSection(id);
    const targetId = id === 'depot-analysis' ? 'depot-analysis-section' : id;
    const element = document.getElementById(targetId);
    if (element) {
      // Calculate offset manually to account for sticky header height
      const headerOffset = 85;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Trigger scroll to target section when entering portal mode
  useEffect(() => {
    if (page === 'portal' && scrollTarget) {
      const timer = setTimeout(() => {
        scrollToSection(scrollTarget);
        setScrollTarget(null);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [page, scrollTarget]);

  // Scroll Spy to detect and highlight active section on scroll
  useEffect(() => {
    if (page !== 'portal') return;

    const handleScrollSpy = () => {
      const scrollPosition = window.scrollY + 180; // offset for detection line

      for (const item of navItems) {
        const targetId = item.id === 'depot-analysis' ? 'depot-analysis-section' : item.id;
        const element = document.getElementById(targetId);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;

          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(item.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScrollSpy, { passive: true });
    handleScrollSpy(); // run once on mount or page switch

    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, [page]);

  if (isLoading) {
    return <Preloader onComplete={() => setIsLoading(false)} />;
  }

  if (page === 'landing') {
    return (
      <LandingPage
        setPage={handleNav}
        theme={theme}
        toggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
      />
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'theme-light' : 'theme-dark'} text-gray-100 flex flex-col relative`}>
      
      {/* Interactive Canvas Background */}
      <InteractiveBackground theme={theme} />
      
      {/* Top Banner Grid background line */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-grid-pattern opacity-10 pointer-events-none z-0"></div>

      {/* Main Header Navbar */}
      <header className="sticky top-0 z-40 bg-charcoal-dark/70 border-b border-white/5 backdrop-blur-md px-6 lg:px-12 py-4 flex items-center justify-between">
        
        {/* Logo redirecting to landing */}
        <div className="cursor-pointer" onClick={() => handleNav('landing')}>
          <TejasLogo className="h-9" />
        </div>

        {/* Desktop Navbar */}
        <nav className="hidden xl:flex items-center gap-1 font-montserrat text-xs font-semibold text-gray-400">
          {navItems.map((item) => {
            const isSelected = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`px-4 py-2 rounded-xl transition-all ${
                  isSelected 
                    ? 'text-electric bg-emerald-500/10 border border-emerald-500/20 font-bold shadow-glass' 
                    : 'hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white transition-all"
            aria-label="Toggle dark and light theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <div className="xl:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white transition-all"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

      </header>

      {/* Mobile Drawer Menu overlay */}
      {mobileMenuOpen && (
        <div className="xl:hidden fixed inset-x-0 top-[73px] bottom-0 z-30 bg-charcoal-dark/95 backdrop-blur-lg border-b border-white/10 flex flex-col p-6 space-y-4">
          <nav className="flex flex-col gap-2 font-montserrat text-sm font-semibold">
            {navItems.map((item) => {
              const isSelected = activeSection === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                    isSelected 
                      ? 'text-electric bg-emerald-500/15 border border-emerald-500/30' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* Main Pages Content slot */}
      <main className="flex-grow relative z-10 overflow-x-hidden pb-24">
        <div className="flex flex-col gap-12 md:gap-16">
          <section id="home" className="scroll-mt-24">
            <HomePage setPage={scrollToSection} />
          </section>
          
          <div className="w-full max-w-7xl mx-auto px-6 lg:px-12">
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          </div>

          <section id="dashboard" className="scroll-mt-24">
            <DashboardPage />
          </section>

          <div className="w-full max-w-7xl mx-auto px-6 lg:px-12">
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          </div>

          <section id="operational-analysis" className="scroll-mt-24">
            <OperationalAnalysis />
          </section>

          <div className="w-full max-w-7xl mx-auto px-6 lg:px-12">
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          </div>

          <section id="route-analysis" className="scroll-mt-24">
            <RouteAnalysis />
          </section>

          <div className="w-full max-w-7xl mx-auto px-6 lg:px-12">
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          </div>

          <section id="cost-analysis" className="scroll-mt-24">
            <CostAnalysis />
          </section>

          <div className="w-full max-w-7xl mx-auto px-6 lg:px-12">
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          </div>

          <section id="emission-analysis" className="scroll-mt-24">
            <EmissionAnalysis />
          </section>

          <div className="w-full max-w-7xl mx-auto px-6 lg:px-12">
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          </div>

          <section id="prediction-centre" className="scroll-mt-24">
            <PredictionCentre />
          </section>

          <div className="w-full max-w-7xl mx-auto px-6 lg:px-12">
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          </div>

          <section id="charging-infra" className="scroll-mt-24">
            <ChargingInfra />
          </section>

          <div className="w-full max-w-7xl mx-auto px-6 lg:px-12">
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          </div>

          <section id="reports" className="scroll-mt-24">
            <ReportsPage />
          </section>

          <div className="w-full max-w-7xl mx-auto px-6 lg:px-12">
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          </div>

          <section id="about" className="scroll-mt-24">
            <AboutPage />
          </section>
        </div>
      </main>

      {/* App Shell Footer */}
      <footer className="border-t border-white/5 py-6 px-6 lg:px-12 bg-charcoal-dark/20 text-center md:text-left md:flex justify-between items-center text-[10px] text-gray-500 font-mono relative z-10 uppercase">
        <span className="flex items-center justify-center md:justify-start gap-2">
          <span>TEJAS PLATFORM — TRANSPORT ELECTRIFICATION PORTAL</span>
        </span>
        <div className="flex gap-4 mt-2 md:mt-0 justify-center">
          <span className="text-emerald-500">GRID SECURE v2.4.0</span>
          <span>© KSRTC KERALA</span>
        </div>
      </footer>

    </div>
  );
}
