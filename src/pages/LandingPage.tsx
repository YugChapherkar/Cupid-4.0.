import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Video, Shield, Terminal, MapPin, Quote, Menu, X, Code2, Sparkles, Check, Star, RefreshCcw, Headphones, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

// Custom components internal to this page to match the specific "Lovely" design specs
const SectionHeader = ({ title, subtitle }: { title: string, subtitle?: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6 }}
    className="text-center max-w-3xl mx-auto mb-16 px-4"
  >
    <h2 className="text-3xl md:text-4xl font-bold text-lovely-text mb-4 leading-tight">
      {title}
    </h2>
    {subtitle && <p className="text-lovely-muted text-lg">{subtitle}</p>}
  </motion.div>
);

const FeatureCard = ({ icon: Icon, title, desc, delay }: { icon: any, title: string, desc: string, delay?: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.5, delay: parseFloat(delay || "0") }}
    className={`bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-center border border-lovely-surface group relative overflow-hidden`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-lovely-surface/0 to-lovely-surface/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    <div className="w-16 h-16 rounded-full bg-lovely-surface flex items-center justify-center mx-auto mb-6 text-lovely-pink group-hover:scale-110 transition-transform duration-300 relative z-10">
      <Icon size={32} />
    </div>
    <h3 className="text-xl font-bold text-lovely-text mb-3 relative z-10">{title}</h3>
    <p className="text-lovely-muted leading-relaxed relative z-10">{desc}</p>
  </motion.div>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home', id: 'home' },
    { name: 'Features', id: 'features' },
    { name: 'How it Works', id: 'how-it-works' },
    { name: 'About Us', id: 'about-us' }
  ];

  const scrollToSection = (id: string) => {
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen font-sans text-lovely-text bg-white overflow-x-hidden selection:bg-lovely-pink selection:text-white">
      
      {/* 1. Navbar */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-lovely-border transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => scrollToSection('home')}>
              <div className="bg-lovely-pink p-2 rounded-lg text-white group-hover:rotate-12 transition-transform duration-300">
                <Heart fill="currentColor" size={20} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl leading-none tracking-tight text-lovely-pink">Cupid 4.0</span>
                <span className="text-[10px] font-medium text-lovely-muted tracking-widest uppercase">Your Partner</span>
              </div>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <button 
                  key={item.name} 
                  onClick={() => scrollToSection(item.id)}
                  className="text-sm font-medium text-lovely-muted hover:text-lovely-pink transition-colors relative group"
                >
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-lovely-pink transition-all duration-300 group-hover:w-full"></span>
                </button>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <button 
                onClick={() => navigate('/signup')} 
                className="text-sm font-semibold text-lovely-pink hover:text-lovely-deep px-4 py-2 transition-colors"
              >
                Sign In
              </button>
              <button 
                onClick={() => navigate('/signup')} 
                className="bg-lovely-pink hover:bg-lovely-deep text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow-md shadow-lovely-pink/30 transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
              >
                Sign Up For Free
              </button>
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-lovely-muted p-2 hover:bg-lovely-surface rounded-lg transition-colors">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Nav Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-lovely-border absolute w-full left-0 shadow-lg animate-fade-in z-50">
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.id)}
                  className="block w-full text-left px-4 py-3 rounded-lg text-base font-medium text-lovely-muted hover:bg-lovely-surface hover:text-lovely-pink transition-colors"
                >
                  {item.name}
                </button>
              ))}
              <div className="h-px bg-lovely-border my-2"></div>
              <button 
                onClick={() => { navigate('/signup'); setIsMenuOpen(false); }}
                className="block w-full text-left px-4 py-3 rounded-lg text-base font-medium text-lovely-pink hover:bg-lovely-surface transition-colors"
              >
                Sign In
              </button>
              <button 
                onClick={() => { navigate('/signup'); setIsMenuOpen(false); }}
                className="block w-full text-center px-4 py-3 rounded-full text-base font-bold text-white bg-lovely-pink hover:bg-lovely-deep transition-colors mt-2"
              >
                Sign Up For Free
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* 2. Hero Section */}
      <section id="home" className="pt-32 pb-20 lg:pt-40 lg:pb-32 bg-[#F5F5F5] relative overflow-hidden">
        
        {/* Animated Background Elements */}
        {/* <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div> */}


        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Left Column */}
            <div className="text-center lg:text-left animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-white text-lovely-deep text-sm font-semibold mb-6 shadow-sm hover:scale-105 transition-transform cursor-default">
                <Heart size={14} fill="currentColor" className="animate-pulse" />
                <span>Find your perfect pair partner</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold text-lovely-text mb-6 leading-[1.1] tracking-tight">
                Find Your Match With <span className="bg-[#e91e63] text-white px-6 py-2 inline-block rounded-xl border-4 border-white shadow-xl transform -rotate-2 ml-2">Cupid 4.0</span>
              </h1>
              
              <p className="text-lg md:text-xl text-lovely-muted mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                A 4-step journey to love: Match & Chat, connect over a Video Call, meet in person or at our Virtual Café, and finally craft the perfect Proposal.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
                <button 
                  onClick={() => navigate('/signup')}
                  className="bg-[#c2185b] hover:bg-[#a3144c] text-white px-8 py-4 rounded-full text-lg font-bold shadow-lg shadow-[#c2185b]/30 transition-all hover:-translate-y-1 hover:shadow-[#c2185b]/50 flex items-center justify-center gap-2 group"
                >
                  Find Your Match
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => { document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }) }}
                  className="bg-white/80 backdrop-blur-sm hover:bg-white text-lovely-text border border-lovely-border px-8 py-4 rounded-full text-lg font-bold shadow-sm transition-all hover:border-lovely-pink hover:text-lovely-pink"
                >
                  How It Works
                </button>
              </div>

              {/* User Avatars */}
              <div className="flex items-center justify-center lg:justify-start gap-4">
                <div className="flex -space-x-4 hover:space-x-1 transition-all duration-300">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="relative group/avatar">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 55}`} className="w-12 h-12 rounded-full border-2 border-white bg-slate-100 shadow-sm" />
                    </div>
                  ))}
                </div>
                <div className="text-sm font-medium text-lovely-muted">
                  <span className="text-lovely-pink font-bold">200k+</span> Active users
                </div>
              </div>
            </div>

            {/* Right Column - Hero Image Card */}
            <div className="relative animate-float-delayed lg:ml-auto perspective-1000">
              <div className="relative z-10 bg-white p-3 rounded-[2.5rem] shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700 ease-out group">
                <div className="relative overflow-hidden rounded-[2rem]">
                  <img 
                    src="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1000&auto=format&fit=crop" 
                    alt="Couple Coding" 
                    className="w-full max-w-md object-cover h-[500px] transform group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60"></div>
                </div>
                
                {/* Floating Badge 1 - Top Right */}
                <div className="absolute top-10 right-[-15px] bg-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-float" style={{ animationDelay: '0.5s' }}>
                  <div className="bg-green-100 p-2 rounded-full text-green-600"><Shield size={18} /></div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Verified</p>
                    <p className="text-sm font-bold text-lovely-text leading-none">100% Secure</p>
                  </div>
                </div>

                {/* Floating Badge 2 - Bottom Left */}
                <div className="absolute bottom-12 left-[-20px] bg-white px-5 py-4 rounded-2xl shadow-xl flex items-center gap-4 animate-float" style={{ animationDelay: '1.5s' }}>
                   <div className="bg-lovely-surface p-2.5 rounded-full text-lovely-pink relative">
                     <Heart fill="currentColor" size={24} />
                     <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                   </div>
                   <div>
                      <p className="text-base font-bold text-lovely-text">It's a Match!</p>
                      <p className="text-xs text-lovely-muted">95% Compatibility</p>
                   </div>
                   <div className="bg-green-50 p-1.5 rounded-full text-green-600">
                     <Check size={16} />
                   </div>
                </div>
              </div>
              
              {/* Decorative elements behind image */}
              <div className="absolute -z-10 top-10 right-10 w-full h-full border-2 border-white/50 rounded-[2.5rem] rotate-6"></div>
              <div className="absolute -z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-white/20 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Why Choose Us */}
      <section id="features" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SectionHeader 
            title="Why Choose Cupid 4.0?" 
            subtitle="Our matchmaking platform is designed to help you find meaningful connections through a curated 4-step journey." 
          />
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={Heart} 
              title="Match & Chat" 
              desc="Swipe through curated profiles and chat instantly in real-time when you find a match." 
              delay="0s"
            />
            <FeatureCard 
              icon={Video} 
              title="Secure Video Call" 
              desc="Take the next step with our built-in, secure virtual video calls—no third-party apps needed." 
              delay="0.1s"
            />
            <FeatureCard 
              icon={MapPin} 
              title="AI Date Planner" 
              desc="Use AI to curate a physical date nearby, or connect in a Pair Programming Virtual Café." 
              delay="0.2s"
            />
            <FeatureCard 
              icon={Sparkles} 
              title="Proposal Builder" 
              desc="Ready to commit? Craft and send a personalized digital proposal to make it official." 
              delay="0.3s"
            />
          </div>
        </div>
      </section>

      {/* 4. Content Highlight - Walk */}
      <section id="how-it-works" className="py-24 bg-lovely-surface/50 overflow-hidden relative group">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/80 to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 animate-fade-in-up">
               <div className="inline-block px-3 py-1 bg-lovely-pink/10 text-lovely-pink rounded-full text-xs font-bold uppercase tracking-wider mb-4">Real Connections</div>
               <h2 className="text-3xl md:text-5xl font-bold text-lovely-text mb-6">
                 Keep the connection <span className="text-lovely-pink">active</span> and happy — take it offline!
               </h2>
               <p className="text-lovely-muted text-lg mb-8 leading-relaxed">
                 Meeting for a walk or coffee isn't just about exercise—it's about creating opportunities to talk, connect, and enjoy each other's company in a relaxed setting away from the keyboard.
               </p>
               <button onClick={() => navigate('/date-planner')} className="bg-lovely-orange hover:bg-orange-600 text-white px-8 py-3 rounded-full font-bold shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5">
                 Plan a Date
               </button>
            </div>
            <div className="order-1 lg:order-2 relative group-hover:scale-[1.02] transition-transform duration-700">
               <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                 <img 
                   src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800" 
                   className="w-full object-cover h-[400px] hover:scale-105 transition-transform duration-700" 
                   alt="Couple Walking"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
               </div>
               
               <div className="absolute -bottom-6 -left-6 bg-white p-5 rounded-2xl shadow-xl max-w-xs hidden md:block border border-lovely-surface animate-float">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 shadow-sm"><MapPin size={24}/></div>
                    <div>
                      <p className="font-bold text-slate-900">Nearby Café Found</p>
                      <p className="text-xs text-gray-500 font-medium">0.2 miles away • 4.8★</p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Relationship Advice Blocks */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32">
          
          {/* Block 1 */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
             <div className="relative group perspective-1000">
                <div className="absolute inset-0 bg-lovely-pink/20 rounded-[2rem] transform rotate-3 scale-105 group-hover:rotate-1 transition-transform duration-500"></div>
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000&auto=format&fit=crop" 
                  className="rounded-[2rem] shadow-xl w-full object-cover h-[500px] relative z-10 transform group-hover:-translate-y-2 transition-transform duration-500" 
                  alt="Couple Coding"
                />
                <div className="absolute -right-6 top-12 bg-white p-4 rounded-2xl shadow-xl border border-lovely-surface z-20 animate-bounce">
                   <Heart className="text-lovely-pink fill-lovely-pink" size={32} />
                </div>
             </div>
             <div className="animate-fade-in-up">
                <h2 className="text-3xl md:text-5xl font-bold text-lovely-text mb-6">
                  Build a deeper relationship with <span className="text-lovely-pink underline decoration-4 decoration-lovely-pink/30 underline-offset-4">code</span> each day
                </h2>
                <p className="text-lovely-muted text-lg mb-8 leading-relaxed">
                  Every relationship needs nurturing. Through meaningful pair programming sessions and shared debugging experiences, you'll build a foundation of trust and understanding that will help your relationship thrive.
                </p>
                <button onClick={() => navigate('/signup')} className="bg-white text-lovely-orange border-2 border-lovely-orange hover:bg-lovely-orange hover:text-white px-8 py-3 rounded-full font-bold shadow-sm transition-all duration-300">
                  Start Coding Together
                </button>
             </div>
          </div>

          {/* Block 2 */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
             <div className="order-2 lg:order-1 animate-fade-in-up">
                <h2 className="text-3xl md:text-5xl font-bold text-lovely-text mb-6">
                  Every moment is a chance—use it to be <span className="text-lovely-pink">close</span> to them.
                </h2>
                <p className="text-lovely-muted text-lg mb-8 leading-relaxed">
                  Can't meet in person? Our Virtual Café offers a cozy, low-pressure environment with lo-fi beats and icebreakers so you can spend quality time together, no matter the distance.
                </p>
                <button onClick={() => navigate('/signup')} className="bg-lovely-pink hover:bg-lovely-deep text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-lovely-pink/30 transition-all hover:scale-105">
                  Try Virtual Café
                </button>
             </div>
             <div className="order-1 lg:order-2 relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full opacity-50 blur-3xl group-hover:opacity-75 transition-opacity duration-700"></div>
                <img 
                  src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1000&auto=format&fit=crop" 
                  className="rounded-3xl shadow-2xl w-full object-cover h-[500px] relative z-10" 
                  alt="Virtual Meeting"
                />
                <div className="absolute bottom-8 right-8 bg-white/90 backdrop-blur px-6 py-3 rounded-xl shadow-lg z-20 flex items-center gap-3">
                   <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                   <span className="font-bold text-slate-800">Live Session Active</span>
                </div>
             </div>
          </div>

        </div>
      </section>

      {/* 6. Testimonials */}
      <section id="about-us" className="py-24 bg-lovely-surface/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <SectionHeader 
             title="Loved By So Many People Around The World" 
             subtitle="Read what our users have to say about their experience with our platform." 
           />

           <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: "Sarah Jenkins",
                  role: "Frontend Dev",
                  text: "I honestly had been on many regular dates and was doubting sure I was meeting a fling. Cupid 4.0 helped me find someone who gets my passion.",
                  img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
                },
                {
                  name: "Mike Johnson",
                  role: "Full Stack",
                  text: "I've been using Cupid for about 6 months now, and I've met some really great people. The interface is so easy to use and the matches are spot on!",
                  img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
                },
                {
                  name: "Emily Chen",
                  role: "Data Scientist",
                  text: "The Proposal Builder is genius. It helped me craft the perfect message to ask my partner to move in together. Highly recommended!",
                  img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150"
                }
              ].map((t, i) => (
                <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-lovely-border hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                   <div className="flex items-center gap-4 mb-6">
                      <img src={t.img} className="w-14 h-14 rounded-full object-cover border-2 border-lovely-surface" alt={t.name} />
                      <div>
                        <h4 className="font-bold text-lovely-text">{t.name}</h4>
                        <p className="text-xs text-lovely-muted">{t.role}</p>
                      </div>
                      <div className="ml-auto flex gap-0.5">
                        {[1,2,3,4,5].map(s => <Star key={s} size={14} className="fill-yellow-400 text-yellow-400" />)}
                      </div>
                   </div>
                   <p className="text-lovely-muted italic leading-relaxed">"{t.text}"</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* 7. Pricing Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader 
             title="Get Started With Your Basic Plan Now" 
             subtitle="Choose the plan that fits your journey." 
          />
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
             {/* Basic */}
             <div className="bg-white rounded-2xl p-8 border border-lovely-border shadow-sm flex flex-col hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
               <h3 className="text-lg font-bold text-lovely-muted mb-2">Basic Plan</h3>
               <div className="text-4xl font-bold text-lovely-pink mb-6">$0<span className="text-base font-normal text-lovely-muted">/month</span></div>
               <ul className="space-y-4 mb-8 flex-grow">
                 {['Unlimited Matching', 'Live Chat only', 'Limited Date Requests', '1 Profile Photo'].map(f => (
                   <li key={f} className="flex items-center gap-3 text-sm text-lovely-text">
                     <div className="w-5 h-5 rounded-full bg-lovely-surface flex items-center justify-center text-lovely-pink"><Check size={12} /></div> {f}
                   </li>
                 ))}
               </ul>
               <button onClick={() => navigate('/signup')} className="w-full py-3 rounded-full border border-lovely-pink text-lovely-pink font-bold hover:bg-lovely-surface transition-colors group-hover:bg-lovely-pink group-hover:text-white">
                 Get Started
               </button>
             </div>

             {/* Standard */}
             <div className="bg-white rounded-2xl p-8 border-2 border-lovely-pink shadow-xl relative transform md:-translate-y-4 flex flex-col hover:-translate-y-6 transition-transform duration-300 z-10">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-lovely-pink text-white text-xs font-bold px-4 py-1.5 rounded-b-xl uppercase tracking-wider shadow-md">
                 Most Popular
               </div>
               <h3 className="text-lg font-bold text-lovely-muted mb-2 mt-2">Standard Plan</h3>
               <div className="text-4xl font-bold text-lovely-pink mb-6">$12<span className="text-base font-normal text-lovely-muted">/month</span></div>
               <ul className="space-y-4 mb-8 flex-grow">
                 {['Unlimited Live Coding', 'Virtual Café Access', 'Unlimited Date Requests', 'Verified Badge'].map(f => (
                   <li key={f} className="flex items-center gap-3 text-sm text-lovely-text">
                     <div className="w-5 h-5 rounded-full bg-lovely-pink text-white flex items-center justify-center"><Check size={12} /></div> {f}
                   </li>
                 ))}
               </ul>
               <button onClick={() => navigate('/signup')} className="w-full py-3 rounded-full bg-lovely-pink text-white font-bold hover:bg-lovely-deep transition-colors shadow-lg shadow-lovely-pink/30 hover:shadow-lovely-pink/50">
                 Get Most Popular
               </button>
             </div>

             {/* Premium */}
             <div className="bg-white rounded-2xl p-8 border border-lovely-border shadow-sm flex flex-col hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
               <h3 className="text-lg font-bold text-lovely-muted mb-2">Premium Plan</h3>
               <div className="text-4xl font-bold text-lovely-pink mb-6">$90<span className="text-base font-normal text-lovely-muted">/year</span></div>
               <ul className="space-y-4 mb-8 flex-grow">
                 {['Everything in Standard', 'Proposal Builder AI', 'Priority Support', 'Unlimited Rewinds'].map(f => (
                   <li key={f} className="flex items-center gap-3 text-sm text-lovely-text">
                     <div className="w-5 h-5 rounded-full bg-lovely-surface flex items-center justify-center text-lovely-pink"><Check size={12} /></div> {f}
                   </li>
                 ))}
               </ul>
               <button onClick={() => navigate('/signup')} className="w-full py-3 rounded-full border border-lovely-pink text-lovely-pink font-bold hover:bg-lovely-surface transition-colors group-hover:bg-lovely-pink group-hover:text-white">
                 Buy Now
               </button>
             </div>
          </div>
        </div>
      </section>

      {/* 8. App Download CTA */}
      <section className="bg-lovely-pink py-20 text-white overflow-hidden relative group">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-8">For The Best Experience<br/>Download App Now</h2>
          <p className="text-white/80 mb-10 max-w-2xl mx-auto text-lg">
            Stay connected with your partner on the go. Code reviews, chat, and date planning right from your pocket.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <button className="bg-white text-lovely-pink px-8 py-3 rounded-full font-bold flex items-center justify-center gap-3 hover:bg-gray-50 transition-all hover:scale-105 shadow-lg group">
               <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 384 512" className="fill-current group-hover:scale-110 transition-transform"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 24 184.5 15.6 245.9c-15.6 111.4 31.1 199.1 71.6 257.6 19.7 28.3 43.6 44 69.1 43.4 25.5-.6 34.6-15.3 64.9-15.3 30.3 0 38.6 15.3 64.9 15.3 26.1 0 47.9-17 66.8-44.5 19.4-28.7 29.8-56.7 30.5-58.3-2.2-1-54.6-20.9-54.6-75.4zM245.9 83.2c13.7-16.7 23.3-39.6 20.8-62.9-20.3 1-43.6 13.9-57.9 31.1-12 14.4-23 37.7-19.8 60 22.3.9 44.5-11.7 56.9-28.2z"/></svg>
               <div className="flex flex-col items-start leading-none gap-1">
                 <span className="text-[10px] font-medium uppercase tracking-wider text-lovely-pink/70">Download on the</span>
                 <span className="text-lg">App Store</span>
               </div>
             </button>
             <button className="bg-transparent border border-white text-white px-8 py-3 rounded-full font-bold flex items-center justify-center gap-3 hover:bg-white/10 transition-all hover:scale-105 group">
               <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 512 512" className="fill-current group-hover:scale-110 transition-transform"><path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/></svg>
               <div className="flex flex-col items-start leading-none gap-1">
                 <span className="text-[10px] font-medium uppercase tracking-wider text-white/80">Get it on</span>
                 <span className="text-lg">Google Play</span>
               </div>
             </button>
          </div>
        </div>
      </section>

      {/* 9. Footer */}
      <footer className="bg-white pt-16 pb-8 border-t border-lovely-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid md:grid-cols-4 gap-8 mb-12">
              <div className="col-span-1 md:col-span-1">
                 <div className="flex items-center gap-2 mb-4">
                    <Heart className="fill-lovely-pink text-lovely-pink" />
                    <span className="font-bold text-xl text-lovely-text">Cupid 4.0</span>
                 </div>
                 <p className="text-sm text-lovely-muted leading-relaxed">
                   The world's first dating platform designed specifically for developers. Open source your heart.
                 </p>
              </div>
              
              {['Company', 'Resources', 'Legal'].map(col => (
                <div key={col}>
                   <h4 className="font-bold text-lovely-text mb-4">{col}</h4>
                   <ul className="space-y-2 text-sm text-lovely-muted">
                      {['About Us', 'Careers', 'Blog', 'Contact'].map(link => (
                        <li key={link}><a href="#" className="hover:text-lovely-pink transition-colors">{link}</a></li>
                      ))}
                   </ul>
                </div>
              ))}
           </div>
           
           <div className="pt-8 border-t border-lovely-surface text-center text-sm text-lovely-muted flex flex-col md:flex-row justify-between items-center">
              <p>© 2025 Cupid 4.0. All rights reserved.</p>
              <div className="flex gap-4 mt-4 md:mt-0">
                 <div className="w-8 h-8 rounded-full bg-lovely-surface flex items-center justify-center text-lovely-pink hover:bg-lovely-pink hover:text-white transition-colors cursor-pointer hover:scale-110"><Heart size={16}/></div>
                 <div className="w-8 h-8 rounded-full bg-lovely-surface flex items-center justify-center text-lovely-pink hover:bg-lovely-pink hover:text-white transition-colors cursor-pointer hover:scale-110"><Terminal size={16}/></div>
                 <div className="w-8 h-8 rounded-full bg-lovely-surface flex items-center justify-center text-lovely-pink hover:bg-lovely-pink hover:text-white transition-colors cursor-pointer hover:scale-110"><Code2 size={16}/></div>
              </div>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;