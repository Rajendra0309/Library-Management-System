import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  useEffect(() => {
    const handleScroll = () => {
      const nav = document.getElementById('mainNav');
      if (nav) {
        if (window.scrollY > 20) {
          nav.classList.add('bg-bg-surface/90', 'backdrop-blur-md', 'shadow-sm', 'border-border-subtle', 'py-sm');
          nav.classList.remove('border-transparent', 'py-md');
        } else {
          nav.classList.remove('bg-bg-surface/90', 'backdrop-blur-md', 'shadow-sm', 'border-border-subtle', 'py-sm');
          nav.classList.add('border-transparent', 'py-md');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-bg-page text-on-surface antialiased overflow-x-hidden relative font-body-base min-h-screen">
      {/* Sticky Nav */}
      <nav id="mainNav" className="fixed top-0 left-0 w-full z-50 transition-all duration-300 py-md px-page-padding border-b border-transparent">
        <div className="max-w-content-max-width mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 text-primary font-display-3xl text-display-3xl">
            <span className="material-symbols-outlined text-4xl">local_library</span>
            <span>LibraVault</span>
          </div>
          <div className="hidden md:flex items-center gap-4xl font-body-base text-body-base text-text-secondary">
            <a className="hover:text-primary transition-colors" href="#">Products</a>
            <a className="hover:text-primary transition-colors" href="#">Solutions</a>
            <a className="hover:text-primary transition-colors" href="#">Resources</a>
            <a className="hover:text-primary transition-colors" href="#">Pricing</a>
          </div>
          <div className="flex items-center gap-xl">
            <Link to="/login" className="hidden md:block text-text-secondary hover:text-primary font-body-base text-body-base transition-colors">Sign In</Link>
            <Link to="/register" className="bg-brand-gradient text-on-primary px-lg py-sm rounded-md shadow-sm hover:shadow-brand-glow hover:scale-95 transition-all duration-150 font-body-base text-body-base">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 px-page-padding overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] hero-blob-1 rounded-full -translate-x-1/2 -translate-y-1/4 pointer-events-none"></div>
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] hero-blob-2 rounded-full translate-x-1/4 pointer-events-none"></div>
        
        <div className="max-w-content-max-width mx-auto relative z-10 text-center">
          <h1 className="font-display-7xl text-display-7xl max-w-4xl mx-auto mb-lg text-on-surface">
            The New Standard for a <br/>
            <span className="brand-text-gradient">Modern Platform</span>
          </h1>
          <p className="font-body-base text-body-base text-text-secondary max-w-2xl mx-auto mb-4xl text-lg">
            Experience unparalleled performance and seamless integration. Built for scale, designed for simplicity. Elevate your workflow with our advanced institutional access tools.
          </p>
          <div className="flex justify-center gap-xl mb-32">
            <Link to="/register" className="bg-primary text-on-primary px-2xl py-md rounded-md shadow-md hover:shadow-brand-glow hover:-translate-y-1 hover:scale-95 transition-all duration-150 font-headline-lg text-headline-lg">
              Start Free Trial
            </Link>
            <a className="border border-border-default text-primary px-2xl py-md rounded-md hover:bg-bg-hover transition-colors font-headline-lg text-headline-lg flex items-center gap-sm" href="#">
              <span className="material-symbols-outlined">play_circle</span>
              Watch Demo
            </a>
          </div>

          {/* 3D Perspective Browser Mockup */}
          <div className="relative mx-auto max-w-5xl perspective-1000">
            <div 
              className="bg-bg-surface rounded-xl shadow-xl border border-border-subtle overflow-hidden transform rotate-x-12 scale-105 hover:rotate-x-0 hover:scale-100 transition-all duration-700 ease-out" 
              style={{ transform: "perspective(1000px) rotateX(5deg) translateY(-20px)" }}
            >
              {/* Browser Header */}
              <div className="bg-surface-container-highest px-md py-sm flex items-center gap-sm border-b border-border-subtle">
                <div className="w-3 h-3 rounded-full bg-error"></div>
                <div className="w-3 h-3 rounded-full bg-secondary-container"></div>
                <div className="w-3 h-3 rounded-full bg-tertiary-fixed-dim"></div>
                <div className="mx-auto bg-bg-surface rounded px-xl py-xs text-xs text-text-tertiary font-code-mono shadow-sm border border-border-subtle">app.libravault.io/dashboard</div>
              </div>
              
              {/* App Content Mock */}
              <div className="h-[500px] bg-bg-page p-md flex gap-md relative overflow-hidden">
                {/* Sidebar */}
                <div className="w-48 bg-bg-surface rounded-lg shadow-sm border border-border-subtle p-md flex flex-col gap-sm relative z-10">
                  <div className="flex items-center gap-2 mb-lg">
                    <div className="w-6 h-6 rounded bg-primary text-white flex items-center justify-center text-[10px] font-bold">LV</div>
                    <div className="h-4 bg-surface-container rounded w-20"></div>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5 bg-surface-container-low rounded">
                    <span className="material-symbols-outlined text-[14px] text-primary">dashboard</span>
                    <div className="h-2.5 bg-primary/20 rounded w-16"></div>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5">
                    <span className="material-symbols-outlined text-[14px] text-text-tertiary">menu_book</span>
                    <div className="h-2.5 bg-surface-container rounded w-14"></div>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5">
                    <span className="material-symbols-outlined text-[14px] text-text-tertiary">group</span>
                    <div className="h-2.5 bg-surface-container rounded w-16"></div>
                  </div>
                  <div className="mt-auto flex items-center gap-2 px-2 py-1.5">
                    <span className="material-symbols-outlined text-[14px] text-text-tertiary">settings</span>
                    <div className="h-2.5 bg-surface-container rounded w-12"></div>
                  </div>
                </div>
                {/* Main Content */}
                <div className="flex-1 flex flex-col gap-md relative z-10">
                  {/* Topbar */}
                  <div className="h-12 bg-bg-surface rounded-lg shadow-sm border border-border-subtle w-full flex items-center justify-between px-md">
                    <div className="h-6 bg-surface-container-low rounded-md w-48 border border-border-default flex items-center px-2">
                      <span className="material-symbols-outlined text-[12px] text-text-tertiary mr-1">search</span>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-surface-container border border-border-default"></div>
                  </div>
                  {/* Dashboard Content */}
                  <div className="flex gap-md">
                    <div className="flex-1 h-24 bg-bg-surface rounded-lg shadow-sm border border-border-subtle p-md flex flex-col justify-between hover:-translate-y-0.5 transition-transform">
                      <div className="h-2.5 bg-surface-container rounded w-20"></div>
                      <div className="text-2xl font-bold text-on-surface">1,248</div>
                    </div>
                    <div className="flex-1 h-24 bg-bg-surface rounded-lg shadow-sm border border-border-subtle p-md flex flex-col justify-between hover:-translate-y-0.5 transition-transform">
                      <div className="h-2.5 bg-surface-container rounded w-24"></div>
                      <div className="text-2xl font-bold text-on-surface">342</div>
                    </div>
                    <div className="flex-1 h-24 bg-bg-surface rounded-lg shadow-sm border border-border-subtle p-md flex flex-col justify-between hover:-translate-y-0.5 transition-transform">
                      <div className="h-2.5 bg-surface-container rounded w-16"></div>
                      <div className="text-2xl font-bold text-on-surface">$85</div>
                    </div>
                  </div>
                  {/* Table area */}
                  <div className="flex-1 bg-bg-surface rounded-lg shadow-sm border border-border-subtle p-md flex flex-col gap-sm overflow-hidden">
                    <div className="flex justify-between items-center mb-xs">
                      <div className="h-3 bg-surface-container rounded w-32"></div>
                      <div className="h-5 bg-surface-container rounded w-20"></div>
                    </div>
                    <div className="h-px bg-border-subtle w-full"></div>
                    {[1,2,3,4].map(i => (
                      <div key={i} className="flex justify-between items-center py-1 border-b border-border-subtle animate-pulse" style={{ animationDelay: `${i * 150}ms` }}>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-surface-container"></div>
                          <div className="flex flex-col gap-1">
                            <div className="h-2 bg-surface-container rounded w-24"></div>
                            <div className="h-1.5 bg-surface-container rounded w-32"></div>
                          </div>
                        </div>
                        <div className="h-4 bg-surface-container-low rounded-full w-12 border border-border-subtle"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-page-padding bg-bg-surface">
        <div className="max-w-content-max-width mx-auto">
          <div className="text-center mb-24">
            <h2 className="font-display-4xl text-display-4xl mb-sm text-on-surface">Powerful Capabilities</h2>
            <p className="font-body-base text-body-base text-text-secondary">Everything you need to manage your complex institutional workflows.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-xl">
            {[
              { icon: 'analytics', title: 'Advanced Analytics', desc: 'Gain deep insights into your circulation data with real-time reporting and predictive modeling.' },
              { icon: 'security', title: 'Enterprise Security', desc: 'Bank-grade encryption and granular role-based access controls keep your inventory safe.' },
              { icon: 'sync_alt', title: 'Seamless Integration', desc: 'Connect effortlessly with existing LMS and institutional databases via our robust API.' },
              { icon: 'inventory_2', title: 'Smart Inventory', desc: 'Automated tracking, RFID support, and smart categorization for massive collections.' },
              { icon: 'groups', title: 'Member Portal', desc: 'A self-service portal for members to manage holds, renewals, and view circulation history.' },
              { icon: 'bolt', title: 'Lightning Fast', desc: 'Optimized architecture ensures sub-second query responses even with millions of records.' }
            ].map((feature, i) => (
              <div key={i} className="bg-bg-page p-card-padding rounded-xl border border-border-subtle hover:-translate-y-1 hover:shadow-md hover:border-border-default transition-all duration-300 group">
                <div className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center mb-lg group-hover:bg-brand-gradient transition-colors">
                  <span className="material-symbols-outlined text-primary group-hover:text-on-primary">{feature.icon}</span>
                </div>
                <h3 className="font-headline-xl text-headline-xl mb-sm">{feature.title}</h3>
                <p className="font-body-sm text-body-sm text-text-secondary">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-inverse-surface text-surface-container-lowest py-24 px-page-padding">
        <div className="max-w-content-max-width mx-auto grid grid-cols-1 md:grid-cols-4 gap-4xl">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 font-display-3xl text-display-3xl mb-lg">
              <span className="material-symbols-outlined text-4xl text-primary-fixed">local_library</span>
              <span>LibraVault</span>
            </div>
            <p className="font-body-sm text-body-sm text-text-tertiary mb-xl max-w-xs">
              Institutional access tools built for the modern era. Secure, scalable, and refined.
            </p>
            <div className="flex gap-sm">
              <a className="w-10 h-10 rounded bg-surface-variant flex items-center justify-center hover:bg-primary-fixed transition-colors text-inverse-surface" href="#">
                <span className="material-symbols-outlined">language</span>
              </a>
              <a className="w-10 h-10 rounded bg-surface-variant flex items-center justify-center hover:bg-primary-fixed transition-colors text-inverse-surface" href="#">
                <span className="material-symbols-outlined">mail</span>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-label-xs text-label-xs uppercase tracking-widest text-text-tertiary mb-lg">Product</h4>
            <ul className="space-y-md font-body-sm text-body-sm text-surface-dim">
              <li><a className="hover:text-primary-fixed transition-colors" href="#">Features</a></li>
              <li><a className="hover:text-primary-fixed transition-colors" href="#">Integrations</a></li>
              <li><a className="hover:text-primary-fixed transition-colors" href="#">Pricing</a></li>
              <li><a className="hover:text-primary-fixed transition-colors" href="#">Changelog</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-label-xs text-label-xs uppercase tracking-widest text-text-tertiary mb-lg">Resources</h4>
            <ul className="space-y-md font-body-sm text-body-sm text-surface-dim">
              <li><a className="hover:text-primary-fixed transition-colors" href="#">Documentation</a></li>
              <li><a className="hover:text-primary-fixed transition-colors" href="#">API Reference</a></li>
              <li><a className="hover:text-primary-fixed transition-colors" href="#">Community</a></li>
              <li><a className="hover:text-primary-fixed transition-colors" href="#">Blog</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-label-xs text-label-xs uppercase tracking-widest text-text-tertiary mb-lg">Company</h4>
            <ul className="space-y-md font-body-sm text-body-sm text-surface-dim">
              <li><a className="hover:text-primary-fixed transition-colors" href="#">About</a></li>
              <li><a className="hover:text-primary-fixed transition-colors" href="#">Careers</a></li>
              <li><a className="hover:text-primary-fixed transition-colors" href="#">Privacy Policy</a></li>
              <li><a className="hover:text-primary-fixed transition-colors" href="#">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-content-max-width mx-auto mt-24 pt-lg border-t border-surface-variant/20 flex flex-col md:flex-row justify-between items-center text-text-tertiary font-body-sm text-body-sm">
          <p>© 2024 LibraVault Inc. All rights reserved.</p>
          <div className="flex items-center gap-sm mt-sm md:mt-0">
            <span className="w-2 h-2 rounded-full bg-tertiary-fixed"></span>
            <span>All systems operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
