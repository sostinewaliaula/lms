'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Users,
  Award,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  PlayCircle,
  BarChart3,
  Shield,
  Globe,
  Zap,
  Star,
  Building2,
  Target,
  GraduationCap,
  MessageSquare,
  Clock,
  FileText,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Video,
  Download,
  Calendar,
  Sparkles,
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

// Counter animation component
function AnimatedCounter({ end, duration = 2000 }: { end: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const numericValue = parseInt(end.replace(/\D/g, ''));
    const suffix = end.replace(/\d/g, '');
    const startTime = Date.now();

    const updateCount = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(easeOutQuart * numericValue);

      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        setCount(numericValue);
      }
    };

    requestAnimationFrame(updateCount);
  }, [isVisible, end, duration]);

  const suffix = end.replace(/\d/g, '');

  return (
    <div ref={ref} className="text-center fade-in-on-scroll hover-lift p-6 rounded-lg bg-background/50">
      <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
        {count}{suffix}
      </div>
    </div>
  );
}

// Scroll reveal component wrapper
function ScrollReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`fade-in-on-scroll ${isVisible ? 'visible' : ''}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

export default function LandingPage() {
  // Global scroll reveal observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.fade-in-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const features = [
    {
      icon: BookOpen,
      title: 'Training Courses',
      description: 'Access department-specific and company-wide training materials for skill development',
      color: 'text-primary',
    },
    {
      icon: Users,
      title: 'Expert Instructors',
      description: 'Learn from experienced colleagues and subject matter experts within Caava Group',
      color: 'text-secondary',
    },
    {
      icon: Award,
      title: 'Completion Certificates',
      description: 'Receive certificates upon course completion to track your achievements',
      color: 'text-primary',
    },
    {
      icon: TrendingUp,
      title: 'Progress Tracking',
      description: 'Monitor your learning progress and track completed courses and modules',
      color: 'text-secondary',
    },
    {
      icon: BarChart3,
      title: 'Learning Analytics',
      description: 'View your learning statistics and track your professional development journey',
      color: 'text-primary',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your learning data is secure and accessible only within the organization',
      color: 'text-secondary',
    },
  ];

  const stats = [
    { number: '500+', label: 'Active Learners' },
    { number: '200+', label: 'Courses Available' },
    { number: '50+', label: 'Expert Instructors' },
    { number: '95%', label: 'Completion Rate' },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Global Background Graphics */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="background-grid"></div>
        <div className="background-dots"></div>
        
        {/* Decorative floating blobs */}
        <div
          className="decorative-blob absolute"
          style={{ top: '6%', left: '5%', width: '26rem', height: '26rem', background: 'rgba(16, 185, 129, 0.35)', animationDelay: '0s' }}
        ></div>
        <div
          className="decorative-blob-2 absolute"
          style={{ top: '15%', right: '8%', width: '22rem', height: '22rem', background: 'rgba(139, 92, 246, 0.3)', animationDelay: '4s' }}
        ></div>
        <div
          className="decorative-blob absolute"
          style={{ bottom: '8%', left: '20%', width: '20rem', height: '20rem', background: 'rgba(16, 185, 129, 0.25)', animationDelay: '8s' }}
        ></div>
        <div
          className="decorative-blob-2 absolute"
          style={{ bottom: '12%', right: '25%', width: '18rem', height: '18rem', background: 'rgba(139, 92, 246, 0.25)', animationDelay: '12s' }}
        ></div>

        {/* Animated geometric shapes */}
        <div
          className="geometric-shape shape-circle"
          style={{ top: '18%', left: '10%', width: '160px', height: '160px', animationDelay: '0s' }}
        ></div>
        <div
          className="geometric-shape shape-circle"
          style={{ top: '55%', right: '18%', width: '110px', height: '110px', animationDelay: '2s' }}
        ></div>
        <div
          className="geometric-shape shape-diamond"
          style={{ top: '32%', right: '20%', animationDelay: '1s' }}
        ></div>
        <div
          className="geometric-shape shape-diamond"
          style={{ bottom: '18%', left: '12%', animationDelay: '3s' }}
        ></div>
        <div
          className="geometric-shape shape-triangle"
          style={{ bottom: '10%', right: '8%', animationDelay: '2s' }}
        ></div>
        <div
          className="geometric-shape shape-star"
          style={{ top: '24%', right: '12%', width: '90px', height: '90px', animationDelay: '1.5s' }}
        ></div>
        <div
          className="geometric-shape shape-star"
          style={{ top: '65%', left: '8%', width: '60px', height: '60px', animationDelay: '2.5s' }}
        ></div>
        <div
          className="geometric-shape shape-ring"
          style={{ top: '48%', left: '32%', width: '220px', height: '220px', animationDelay: '0.5s' }}
        ></div>
        <div
          className="geometric-shape shape-ring"
          style={{ top: '12%', right: '30%', width: '160px', height: '160px', animationDelay: '1.2s' }}
        ></div>

        {/* Animated lines */}
        <div
          className="animated-line"
          style={{ width: '30%', top: '18%', left: '5%', animationDelay: '0s' }}
        ></div>
        <div
          className="animated-line"
          style={{ width: '25%', top: '70%', right: '5%', animationDelay: '2s' }}
        ></div>
        <div
          className="animated-line-vertical"
          style={{ height: '50%', top: '20%', right: '28%', animationDelay: '1s' }}
        ></div>
        <div
          className="animated-line-vertical"
          style={{ height: '35%', bottom: '12%', left: '25%', animationDelay: '3s' }}
        ></div>
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 navbar-background border-b border-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img 
                src="/assets/logo.png" 
                alt="Caava Group Logo" 
                className="h-20 w-20 object-contain"
              />
              <div>
                <div className="text-lg font-bold">
                  <span className="text-primary">Knowledge</span>{' '}
                  <span className="text-secondary">Center</span>
                </div>
                <div className="text-sm text-text-muted brand-subtitle">TQ Academy</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link
                href="/login"
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 hero-gradient relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        
        {/* Animated SVG lines and shapes */}
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10" style={{ zIndex: 1 }}>
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0" />
              <stop offset="50%" stopColor="var(--primary)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M 0,100 Q 200,50 400,100 T 800,100"
            stroke="url(#lineGradient)"
            strokeWidth="2"
            fill="none"
            className="animate-pulse-slow"
            style={{ animationDuration: '4s' }}
          />
          <path
            d="M 100,300 Q 300,250 500,300 T 900,300"
            stroke="url(#lineGradient)"
            strokeWidth="2"
            fill="none"
            className="animate-pulse-slow"
            style={{ animationDuration: '5s', animationDelay: '1s' }}
          />
          <circle cx="200" cy="150" r="3" fill="var(--primary)" className="animate-pulse-slow" />
          <circle cx="700" cy="250" r="2" fill="var(--secondary)" className="animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </svg>
        
        <div className="max-w-7xl mx-auto text-center relative" style={{ zIndex: 10 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary/30 rounded-full text-primary mb-6 animate-fade-in-up">
            <Zap size={16} className="animate-pulse" />
            <span className="text-sm font-medium">Empowering Your Learning Journey</span>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <span className="text-text-primary">Welcome to</span>
            <br />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-gradient">
              Caava Knowledge Center
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-text-muted max-w-3xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            Your internal learning platform for professional development, skills enhancement, and continuous growth. 
            Access training programs and resources designed for Caava Group employees.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <Link
              href="/login"
              className="px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all transform hover:scale-105 font-semibold text-lg flex items-center gap-2 shadow-lg hover:shadow-primary/50"
            >
              Access Knowledge Center
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-background-card border-2 border-primary text-primary rounded-lg hover:bg-primary/10 transition-all font-semibold text-lg flex items-center gap-2 hover-lift"
            >
              <PlayCircle size={20} />
              Browse Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background-card border-y border-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <AnimatedCounter end={stat.number} />
                <div className="text-text-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 section-with-bg relative">
        <div className="max-w-7xl mx-auto relative" style={{ zIndex: 10 }}>
          <div className="text-center mb-16 fade-in-on-scroll">
            <h2 className="text-4xl sm:text-5xl font-bold text-text-primary mb-4">
              Your <span className="text-primary">Learning Hub</span>
            </h2>
            <p className="text-xl text-text-muted max-w-2xl mx-auto">
              Comprehensive training resources and courses designed to support your professional development at Caava Group.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <ScrollReveal key={index} delay={index * 0.1}>
                  <div className="bg-background-card p-6 rounded-lg border border-secondary/30 hover:border-primary/50 transition-all hover-lift">
                    <div className={`${feature.color} mb-4 transform transition-transform hover:scale-110`}>
                      <Icon size={40} />
                    </div>
                    <h3 className="text-xl font-semibold text-text-primary mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-text-muted">{feature.description}</p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background-card section-with-bg relative">
        <div className="max-w-7xl mx-auto relative" style={{ zIndex: 10 }}>
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-text-primary mb-4">
                How It <span className="text-primary">Works</span>
              </h2>
              <p className="text-xl text-text-muted max-w-2xl mx-auto">
                Get started with your learning journey in just a few simple steps.
              </p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <ScrollReveal delay={0.1}>
              <div className="text-center hover-lift">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 transform transition-transform hover:scale-110">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">Sign In</h3>
                <p className="text-text-muted">
                  Access the platform using your Caava Group employee credentials
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="text-center hover-lift">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4 transform transition-transform hover:scale-110">
                  <span className="text-2xl font-bold text-secondary">2</span>
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">Browse Courses</h3>
                <p className="text-text-muted">
                  Explore courses by department, category, or search for specific topics
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <div className="text-center hover-lift">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 transform transition-transform hover:scale-110">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">Enroll & Learn</h3>
                <p className="text-text-muted">
                  Enroll in courses, complete modules, and track your progress
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.4}>
              <div className="text-center hover-lift">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4 transform transition-transform hover:scale-110">
                  <span className="text-2xl font-bold text-secondary">4</span>
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">Get Certified</h3>
                <p className="text-text-muted">
                  Earn certificates upon completion and showcase your achievements
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 section-with-bg relative">
        <div className="max-w-7xl mx-auto relative" style={{ zIndex: 10 }}>
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-text-primary mb-4">
                What Our <span className="text-primary">Learners Say</span>
              </h2>
              <p className="text-xl text-text-muted max-w-2xl mx-auto">
                Hear from employees who have enhanced their skills through Caava Knowledge Center.
              </p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollReveal delay={0.1}>
              <div className="bg-background-card p-6 rounded-lg border border-secondary/30 hover-lift">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-text-muted mb-4 italic">
                "The platform has been instrumental in helping me develop new skills for my role. The courses are well-structured and the progress tracking keeps me motivated."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <Users size={20} className="text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-text-primary">Sarah Johnson</div>
                  <div className="text-sm text-text-muted">IT Department</div>
                </div>
              </div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="bg-background-card p-6 rounded-lg border border-secondary/30 hover-lift">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-text-muted mb-4 italic">
                  "I love how easy it is to find relevant training for my department. The certificates I've earned have been great additions to my professional portfolio."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center">
                    <Users size={20} className="text-secondary" />
                  </div>
                  <div>
                    <div className="font-semibold text-text-primary">Michael Chen</div>
                    <div className="text-sm text-text-muted">Engineering Department</div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <div className="bg-background-card p-6 rounded-lg border border-secondary/30 hover-lift">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-text-muted mb-4 italic">
                  "As a new employee, this platform helped me get up to speed quickly. The discussion forums are also great for connecting with colleagues."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <Users size={20} className="text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-text-primary">Emily Rodriguez</div>
                    <div className="text-sm text-text-muted">LMS Department</div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Course Categories Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background-card section-with-bg relative">
        <div className="max-w-7xl mx-auto relative" style={{ zIndex: 10 }}>
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-text-primary mb-4">
              Explore by <span className="text-primary">Category</span>
            </h2>
            <p className="text-xl text-text-muted max-w-2xl mx-auto">
              Find training courses organized by topic and skill area.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              { name: 'IT & Technology', icon: Globe, color: 'text-primary' },
              { name: 'Leadership', icon: Target, color: 'text-secondary' },
              { name: 'Communication', icon: MessageSquare, color: 'text-primary' },
              { name: 'Project Management', icon: BarChart3, color: 'text-secondary' },
              { name: 'Compliance', icon: Shield, color: 'text-primary' },
              { name: 'Soft Skills', icon: Users, color: 'text-secondary' },
            ].map((category, index) => {
              const Icon = category.icon;
              return (
                <Link
                  key={index}
                  href="/login"
                  className="bg-background p-6 rounded-lg border border-secondary/30 hover:border-primary transition-all hover:shadow-lg text-center group"
                >
                  <div className={`${category.color} mb-3 flex justify-center`}>
                    <Icon size={32} />
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Getting Started Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background-card section-with-bg relative">
        <div className="max-w-7xl mx-auto relative" style={{ zIndex: 10 }}>
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-text-primary mb-4">
              Get Started with <span className="text-primary">Your Learning</span>
            </h2>
            <p className="text-xl text-text-muted max-w-2xl mx-auto">
              Quick access to essential resources and training areas to help you begin your learning journey.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              href="/login"
              className="bg-background rounded-lg border border-secondary/30 hover:border-primary transition-all hover:shadow-lg p-8 group"
            >
              <div className="p-4 bg-primary/10 rounded-lg w-fit mb-6 group-hover:bg-primary/20 transition-colors">
                <BookOpen size={40} className="text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-text-primary mb-3 group-hover:text-primary transition-colors">
                Browse Courses
              </h3>
              <p className="text-text-muted mb-4">
                Explore all available training courses organized by category and department. Find courses relevant to your role.
              </p>
              <div className="flex items-center gap-2 text-primary font-semibold">
                <span>Explore Courses</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/login"
              className="bg-background rounded-lg border border-secondary/30 hover:border-secondary transition-all hover:shadow-lg p-8 group"
            >
              <div className="p-4 bg-secondary/10 rounded-lg w-fit mb-6 group-hover:bg-secondary/20 transition-colors">
                <Target size={40} className="text-secondary" />
              </div>
              <h3 className="text-2xl font-semibold text-text-primary mb-3 group-hover:text-secondary transition-colors">
                My Learning Path
              </h3>
              <p className="text-text-muted mb-4">
                Track your enrolled courses, view your progress, and see what's next in your learning journey.
              </p>
              <div className="flex items-center gap-2 text-secondary font-semibold">
                <span>View Progress</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/login"
              className="bg-background rounded-lg border border-secondary/30 hover:border-primary transition-all hover:shadow-lg p-8 group"
            >
              <div className="p-4 bg-primary/10 rounded-lg w-fit mb-6 group-hover:bg-primary/20 transition-colors">
                <Award size={40} className="text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-text-primary mb-3 group-hover:text-primary transition-colors">
                My Certificates
              </h3>
              <p className="text-text-muted mb-4">
                View and download certificates for completed courses. Showcase your achievements and professional development.
              </p>
              <div className="flex items-center gap-2 text-primary font-semibold">
                <span>View Certificates</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/login"
              className="bg-background rounded-lg border border-secondary/30 hover:border-secondary transition-all hover:shadow-lg p-8 group"
            >
              <div className="p-4 bg-secondary/10 rounded-lg w-fit mb-6 group-hover:bg-secondary/20 transition-colors">
                <Users size={40} className="text-secondary" />
              </div>
              <h3 className="text-2xl font-semibold text-text-primary mb-3 group-hover:text-secondary transition-colors">
                Discussion Forums
              </h3>
              <p className="text-text-muted mb-4">
                Engage with colleagues, ask questions, share insights, and collaborate on course topics and projects.
              </p>
              <div className="flex items-center gap-2 text-secondary font-semibold">
                <span>Join Discussions</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/login"
              className="bg-background rounded-lg border border-secondary/30 hover:border-primary transition-all hover:shadow-lg p-8 group"
            >
              <div className="p-4 bg-primary/10 rounded-lg w-fit mb-6 group-hover:bg-primary/20 transition-colors">
                <BarChart3 size={40} className="text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-text-primary mb-3 group-hover:text-primary transition-colors">
                Learning Analytics
              </h3>
              <p className="text-text-muted mb-4">
                Review your learning statistics, completion rates, time spent, and achievements across all courses.
              </p>
              <div className="flex items-center gap-2 text-primary font-semibold">
                <span>View Analytics</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/login"
              className="bg-background rounded-lg border border-secondary/30 hover:border-secondary transition-all hover:shadow-lg p-8 group"
            >
              <div className="p-4 bg-secondary/10 rounded-lg w-fit mb-6 group-hover:bg-secondary/20 transition-colors">
                <GraduationCap size={40} className="text-secondary" />
              </div>
              <h3 className="text-2xl font-semibold text-text-primary mb-3 group-hover:text-secondary transition-colors">
                Help & Support
              </h3>
              <p className="text-text-muted mb-4">
                Get help with using the platform, find answers to common questions, and access support resources.
              </p>
              <div className="flex items-center gap-2 text-secondary font-semibold">
                <span>Get Help</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 section-with-bg relative">
        <div className="max-w-4xl mx-auto relative" style={{ zIndex: 10 }}>
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-text-primary mb-4">
              Frequently Asked <span className="text-primary">Questions</span>
            </h2>
            <p className="text-xl text-text-muted">
              Common questions about using Caava Knowledge Center.
            </p>
          </div>
          <div className="space-y-4">
            {[
              {
                question: 'How do I access the Knowledge Center?',
                answer: 'Simply sign in with your Caava Group employee credentials. New employees will have their accounts created by administrators.',
              },
              {
                question: 'Are all courses free for employees?',
                answer: 'Yes, all courses in Caava Knowledge Center are completely free for all Caava Group employees. There are no charges or fees.',
              },
              {
                question: 'Can I access courses from any device?',
                answer: 'Yes, the platform is fully responsive and can be accessed from desktop computers, tablets, and mobile devices.',
              },
              {
                question: 'How do I get a certificate after completing a course?',
                answer: 'Certificates are automatically generated when you complete a course. You can view and download them from your Certificates section.',
              },
              {
                question: 'Can I track my learning progress?',
                answer: 'Yes, you can view detailed analytics about your learning progress, completed courses, time spent, and achievements in your dashboard.',
              },
              {
                question: 'Who can I contact for support?',
                answer: 'For technical support or questions about courses, please contact your department manager or the Knowledge Center support team.',
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-background-card border border-secondary/30 rounded-lg overflow-hidden"
              >
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-2 flex items-center gap-2">
                    <HelpCircle size={20} className="text-primary" />
                    {faq.question}
                  </h3>
                  <p className="text-text-muted pl-8">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Resources Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background-card section-with-bg relative">
        <div className="max-w-7xl mx-auto relative" style={{ zIndex: 10 }}>
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-text-primary mb-4">
              Additional <span className="text-primary">Resources</span>
            </h2>
            <p className="text-xl text-text-muted max-w-2xl mx-auto">
              Access supplementary learning materials and tools to enhance your training experience.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Video,
                title: 'Video Library',
                description: 'Access recorded training sessions and video tutorials',
                color: 'text-primary',
              },
              {
                icon: FileText,
                title: 'Documentation',
                description: 'Download guides, manuals, and reference materials',
                color: 'text-secondary',
              },
              {
                icon: MessageSquare,
                title: 'Discussion Forums',
                description: 'Engage with colleagues and instructors in course discussions',
                color: 'text-primary',
              },
              {
                icon: Calendar,
                title: 'Training Calendar',
                description: 'View upcoming live sessions and training events',
                color: 'text-secondary',
              },
            ].map((resource, index) => {
              const Icon = resource.icon;
              return (
                <Link
                  key={index}
                  href="/login"
                  className="bg-background p-6 rounded-lg border border-secondary/30 hover:border-primary transition-all hover:shadow-lg group"
                >
                  <div className={`${resource.color} mb-4`}>
                    <Icon size={32} />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-primary transition-colors">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-text-muted">{resource.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 section-with-bg relative">
        <div className="max-w-4xl mx-auto text-center relative" style={{ zIndex: 10 }}>
          <h2 className="text-4xl sm:text-5xl font-bold text-text-primary mb-6">
            Ready to Access Your Training?
          </h2>
          <p className="text-xl text-text-muted mb-10">
            Sign in with your Caava Group credentials to access all available training courses and resources.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all transform hover:scale-105 font-semibold text-lg flex items-center gap-2"
            >
              Sign In to Knowledge Center
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

        {/* Footer */}
        <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-background border-t border-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src="/assets/logo.png" 
                  alt="Caava Group Logo" 
                  className="h-20 w-20 object-contain"
                />
                <div>
                  <div className="font-bold">
                    <span className="text-primary">Knowledge</span>{' '}
                    <span className="text-secondary">Center</span>
                  </div>
                  <div className="text-sm text-text-muted brand-subtitle">TQ Academy</div>
                </div>
              </div>
              <p className="text-text-muted text-sm">
                Internal learning and development platform for Caava Group employees.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-text-primary mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-text-muted">
                <li>
                  <Link href="/login" className="hover:text-primary transition-colors">
                    Courses
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-primary transition-colors">
                    Instructors
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-primary transition-colors">
                    Certificates
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-text-primary mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-text-muted">
                <li>
                  <Link href="/login" className="hover:text-primary transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-primary transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-primary transition-colors">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-text-primary mb-4">Access</h4>
              <ul className="space-y-2 text-sm text-text-muted">
                <li>
                  <Link href="/login" className="hover:text-primary transition-colors">
                    Employee Sign In
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-secondary/30 text-center text-sm text-text-muted">
            <p>&copy; {new Date().getFullYear()} Caava Group. All rights reserved.</p>
          </div>
        </div>
        </footer>
      </div>
    </div>
  );
}
