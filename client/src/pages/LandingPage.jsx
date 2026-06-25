import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/ui/Logo';
import { Button } from '../components/ui/button';
import { 
  BarChart3, 
  ShieldCheck, 
  RefreshCcw, 
  BookMarked, 
  Users, 
  Zap, 
  PlayCircle,
  Globe,
  Mail,
  Menu,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-background text-foreground min-h-screen selection:bg-primary/20">
      {/* Navbar */}
      <nav 
        className={cn(
          "fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b",
          scrolled 
            ? "bg-background/80 backdrop-blur-md border-border/40 py-4 shadow-sm" 
            : "bg-transparent border-transparent py-6"
        )}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Logo className="h-8 w-8 text-primary" withText={true} textClassName="font-bold text-xl tracking-tight" />
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a className="hover:text-foreground transition-colors" href="#features">Features</a>
            <a className="hover:text-foreground transition-colors" href="#solutions">Solutions</a>
            <a className="hover:text-foreground transition-colors" href="#pricing">Pricing</a>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Button asChild>
              <Link to="/register">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden p-2 text-muted-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[72px] z-40 bg-background/95 backdrop-blur-sm md:hidden p-6 animate-in slide-in-from-top-4">
          <div className="flex flex-col gap-6 text-lg font-medium">
            <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#solutions" onClick={() => setMobileMenuOpen(false)}>Solutions</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            <hr className="border-border" />
            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
            <Button asChild size="lg" className="w-full">
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
            </Button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 w-full h-[600px] -translate-x-1/2 overflow-hidden pointer-events-none opacity-40">
          <div className="absolute -top-[10%] left-[20%] w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute top-[20%] right-[20%] w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-[100px]" />
        </div>
        
        <div className="max-w-5xl mx-auto relative z-10 text-center flex flex-col items-center">
          <div className="inline-flex items-center rounded-full border border-border bg-muted/50 px-3 py-1 text-sm font-medium mb-8 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            LibraVault 2.0 is now available
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter max-w-4xl mb-6">
            The Modern Standard for <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Library Management</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
            Experience unparalleled performance and seamless integration. Built for scale, designed for simplicity. Elevate your institution's workflow with advanced digital access tools.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-20 w-full sm:w-auto">
            <Button asChild size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/25">
              <Link to="/register">Start Free Trial</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
              <a href="#demo">
                <PlayCircle className="mr-2 h-5 w-5" />
                Watch Demo
              </a>
            </Button>
          </div>

          {/* Browser Mockup */}
          <div className="relative w-full max-w-5xl mx-auto">
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-b from-border to-transparent opacity-50 blur-sm"></div>
            <div className="relative rounded-xl border bg-card shadow-2xl overflow-hidden">
              {/* Browser Header */}
              <div className="h-12 border-b bg-muted/30 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="w-full max-w-sm h-7 bg-background rounded-md border flex items-center justify-center text-xs text-muted-foreground font-mono">
                    app.libravault.io
                  </div>
                </div>
              </div>
              {/* Browser Content */}
              <div className="aspect-[16/9] md:aspect-[21/9] bg-muted/10 relative">
                 <img 
                   src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop" 
                   alt="App Dashboard Preview" 
                   className="w-full h-full object-cover opacity-80 mix-blend-luminosity grayscale hover:grayscale-0 transition-all duration-700"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-muted/30 border-y border-border/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Powerful Capabilities</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Everything you need to manage complex institutional workflows effortlessly.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: BarChart3, title: 'Advanced Analytics', desc: 'Gain deep insights into your circulation data with real-time reporting and predictive modeling.' },
              { icon: ShieldCheck, title: 'Enterprise Security', desc: 'Bank-grade encryption and granular role-based access controls keep your inventory safe.' },
              { icon: RefreshCcw, title: 'Seamless Integration', desc: 'Connect effortlessly with existing LMS and institutional databases via our robust API.' },
              { icon: BookMarked, title: 'Smart Inventory', desc: 'Automated tracking, metadata fetching, and smart categorization for massive collections.' },
              { icon: Users, title: 'Member Portal', desc: 'A self-service portal for members to manage holds, renewals, and view circulation history.' },
              { icon: Zap, title: 'Lightning Fast', desc: 'Optimized architecture ensures sub-second query responses even with millions of records.' }
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-2xl bg-card border shadow-sm hover:shadow-md transition-all group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
                  <feature.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4 text-foreground">
              <Logo className="h-6 w-6 text-primary" withText={true} textClassName="font-bold text-lg" />
            </div>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              Institutional access tools built for the modern era. Secure, scalable, and refined.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Globe className="h-5 w-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Mail className="h-5 w-5" /></a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Integrations</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Changelog</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Community</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto pt-8 border-t flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground gap-4">
          <p>© {new Date().getFullYear()} LibraVault Inc. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span>All systems operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
