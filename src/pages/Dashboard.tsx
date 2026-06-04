import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Sparkles, Calendar, Heart, ArrowRight, Zap, Coffee, Code2, ChevronRight, UserCircle2, Check, Terminal, X } from 'lucide-react';
import { Button, Card, Badge } from '../components/UI';
import { AppContext } from '../context/AppContext';
import { Layout } from '../components/Layout';

const OnboardingModal = ({ onClose }: { onClose: () => void }) => {
  const [step, setStep] = useState(0);

  const slides = [
    {
      icon: <Terminal size={48} className="text-brand-500" />,
      title: "Match & Code",
      description: "Find developers who share your tech stack. Swipe right to connect, then jump into a Virtual Cafe to collaborate on real code.",
      color: "bg-brand-50 border-brand-100"
    },
    {
      icon: <Calendar size={48} className="text-purple-500" />,
      title: "Plan the Perfect Date",
      description: "Take your connection offline (or keep it virtual). Use our AI to generate custom itineraries or pick from curated local tech spots.",
      color: "bg-purple-50 border-purple-100"
    },
    {
      icon: <Heart size={48} className="text-rose-500 fill-rose-200" />,
      title: "Make it Official",
      description: "Found your perfect coding partner? Unlock the AI Proposal Builder after successful sessions to craft a personalized digital proposal.",
      color: "bg-rose-50 border-rose-100"
    }
  ];

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative flex flex-col max-h-[90vh]">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10"
        >
          <X size={20} />
        </button>

        {/* Content Area */}
        <div className="p-8 sm:p-10 flex-grow flex flex-col items-center justify-center text-center relative overflow-hidden">
          {/* Background decorative elements */}
          <div className={`absolute inset-0 opacity-30 transition-colors duration-500 ${slides[step].color}`}></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-24 h-24 rounded-2xl flex items-center justify-center mb-8 shadow-xl bg-white border transition-all duration-500 transform ${step === 0 ? 'scale-100 rotate-0' : step === 1 ? 'scale-110 -rotate-3' : 'scale-105 rotate-3'}`}>
              {slides[step].icon}
            </div>
            
            <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">
              {slides[step].title}
            </h2>
            
            <p className="text-slate-500 text-lg leading-relaxed max-w-sm">
              {slides[step].description}
            </p>
          </div>
        </div>

        {/* Footer Controls */}
        <div className="p-6 sm:p-8 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Dots Indicator */}
          <div className="flex gap-2 mb-4 sm:mb-0">
            {slides.map((_, i) => (
              <div 
                key={i} 
                className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-brand-500' : 'w-2 bg-slate-300'}`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 w-full sm:w-auto">
            {step < slides.length - 1 && (
              <Button variant="ghost" onClick={onClose} className="flex-1 sm:flex-none text-slate-500 hover:text-slate-700">
                Skip
              </Button>
            )}
            <Button onClick={handleNext} className="flex-1 sm:flex-none min-w-[120px]">
              {step === slides.length - 1 ? "Get Started" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { state } = React.useContext(AppContext);
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('cupid_onboarding_seen');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleCloseOnboarding = () => {
    localStorage.setItem('cupid_onboarding_seen', 'true');
    setShowOnboarding(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Calculate dynamic profile strength
  const calculateStrength = () => {
     let score = 50; // Base score
     if (state.user?.bio) score += 20;
     if (state.user?.github) score += 15;
     if (state.user?.tags && state.user.tags.length > 3) score += 15;
     return Math.min(score, 100);
  };
  
  const strength = calculateStrength();

  return (
    <Layout>
      {showOnboarding && <OnboardingModal onClose={handleCloseOnboarding} />}
      <div className="max-w-6xl mx-auto">
        {/* Welcome Hero */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/60">
          <div className="min-w-0 flex-1">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-brand-700 to-slate-800 bg-clip-text text-transparent mb-3 break-words break-all sm:break-normal">
              {getGreeting()},{' '}
              <span className="block sm:inline">{state.user?.name ? state.user.name.split(' ')[0] : 'Developer'}</span>
            </h1>
            <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl">
              Ready to find your next pairing partner? Explore new matches or continue your active conversations.
            </p>
          </div>
          <div className="flex items-center w-full md:w-auto shrink-0">
            <Button variant="outline" className="bg-white/80 backdrop-blur-sm shadow-sm w-full md:w-auto border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl" onClick={() => navigate('/profile')}>
              <UserCircle2 size={18} className="mr-2 text-slate-500" /> Edit Profile
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 min-w-0">
          
          {/* Left Column: Main Actions & Matches */}
          <div className="lg:col-span-8 space-y-8 min-w-0">
            
            {/* Quick Stats / Actions Row */}
            <div className="grid sm:grid-cols-2 gap-5 sm:gap-6 min-w-0">
              <div 
                className="relative overflow-hidden rounded-3xl cursor-pointer group shadow-lg hover:shadow-2xl transition-all duration-300"
                onClick={() => navigate('/matcher')}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-brand-600 to-brand-900"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-12 -translate-y-12 group-hover:scale-110 transition-transform duration-700"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-400/20 rounded-full blur-2xl transform -translate-x-10 translate-y-10"></div>
                
                <div className="relative p-8 h-full flex flex-col justify-between min-h-[220px]">
                  <div>
                    <div className="bg-white/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/20 shadow-inner">
                      <Sparkles className="text-white" size={28} />
                    </div>
                    <h3 className="font-bold text-3xl mb-3 tracking-tight text-white">Find a Match</h3>
                    <p className="text-brand-100 text-base mb-6 max-w-[250px] leading-relaxed">
                      Discover developers sharing your stack and ambitious goals.
                    </p>
                  </div>
                  <div className="flex items-center text-sm font-semibold text-white group-hover:text-brand-200 transition-colors">
                    Start Swiping <ArrowRight size={18} className="ml-2 transform group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>
              </div>

              <div 
                className="relative overflow-hidden rounded-3xl cursor-pointer group shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 bg-white"
                onClick={() => navigate('/date-planner')}
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl transform translate-x-12 -translate-y-12 group-hover:scale-110 transition-transform duration-700"></div>
                
                <div className="relative p-8 h-full flex flex-col justify-between min-h-[220px]">
                  <div>
                    <div className="bg-purple-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-purple-600 border border-purple-100 group-hover:scale-105 transition-transform duration-300 shadow-sm">
                      <Calendar size={28} />
                    </div>
                    <h3 className="font-bold text-3xl mb-3 text-slate-900 tracking-tight">Plan a Date</h3>
                    <p className="text-slate-500 text-base mb-6 max-w-[250px] leading-relaxed">
                      Schedule a virtual coffee or pair programming session.
                    </p>
                  </div>
                  <div className="flex items-center text-sm font-semibold text-purple-600 group-hover:text-purple-700 transition-colors">
                    Open Planner <ArrowRight size={18} className="ml-2 transform group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>
              </div>
            </div>

            {/* Active Matches List */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden">
              <div className="px-7 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5 tracking-tight">
                  <MessageCircle className="text-brand-500" size={24} /> Active Conversations
                </h2>
                <Badge color="brand" className="px-3 py-1 rounded-full font-bold text-sm bg-brand-100/80">{state.activeMatches.length}</Badge>
              </div>
              
              <div className="divide-y divide-slate-100">
                {state.activeMatches.length === 0 ? (
                  <div className="p-16 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-slate-200/60 shadow-sm">
                      <Code2 size={32} className="text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">No active matches yet</h3>
                    <p className="text-slate-500 text-base mb-8 max-w-sm mx-auto leading-relaxed">
                      Start matching to find developers with similar interests and tech stacks.
                    </p>
                    <Button onClick={() => navigate('/matcher')} className="text-sm font-semibold px-6 py-2.5 rounded-xl shadow-md">
                      Go to Matcher
                    </Button>
                  </div>
                ) : (
                  state.activeMatches.map(match => (
                    <div 
                      key={match.id} 
                      className="p-5 sm:p-6 hover:bg-slate-50 transition-colors cursor-pointer group flex items-center gap-4 sm:gap-5" 
                      onClick={() => navigate(`/session/${match.id}`)}
                    >
                      <div className="relative flex-shrink-0">
                        <img src={match.user.avatarUrl} className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-white shadow-md group-hover:scale-105 transition-transform" alt={match.user.name} />
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <h3 className="font-bold text-base sm:text-lg text-slate-900 truncate pr-2 sm:pr-4 group-hover:text-brand-600 transition-colors">{match.user.name}</h3>
                          <span className="text-xs font-semibold text-slate-400 flex-shrink-0">{Math.floor(Math.random() * 5) + 1}m ago</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge color="slate" className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100">{match.user.level}</Badge>
                          <span className="text-slate-300 text-xs">•</span>
                          <span className="text-xs sm:text-sm font-medium text-slate-500 truncate">{match.user.city}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 truncate font-medium">
                           {match.reasons[0] ? `Matched because: ${match.reasons[0]}` : "Start chatting..."}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-slate-400 md:text-slate-300 group-hover:text-brand-500 transition-colors transform group-hover:translate-x-1 bg-slate-50 md:bg-white rounded-full p-1.5 sm:p-2 border border-slate-200 md:border-transparent group-hover:border-slate-200 shadow-sm opacity-100 md:opacity-0 group-hover:opacity-100">
                         <ChevronRight size={18} className="sm:w-5 sm:h-5" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Status & Promos */}
          <div className="lg:col-span-4 space-y-8 min-w-0">
            {/* Profile Completion Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-7">
              <div className="flex justify-between items-end mb-5">
                 <div>
                   <h3 className="font-bold text-lg text-slate-900 mb-1">Profile Strength</h3>
                   <p className="text-sm font-medium text-slate-500">Stand out in the pool</p>
                 </div>
                 <span className={`font-black text-2xl tracking-tighter ${strength === 100 ? 'text-emerald-500' : 'text-brand-600'}`}>{strength}%</span>
              </div>
              
              <div className="w-full bg-slate-100 rounded-full h-3 mb-8 overflow-hidden shadow-inner">
                 <div 
                   className={`h-full rounded-full transition-all duration-1000 ease-out ${strength === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-brand-400 to-brand-600'}`} 
                   style={{width: `${strength}%`}}
                 ></div>
              </div>
              
              <div className="space-y-4">
                 <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/profile')}>
                   <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${state.user?.bio ? 'bg-emerald-100 text-emerald-600 shadow-sm' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                     {state.user?.bio ? <Check size={16} strokeWidth={3} /> : <div className="w-2 h-2 rounded-full bg-current"></div>}
                   </div>
                   <span className={`text-sm font-semibold ${state.user?.bio ? 'text-slate-400 line-through' : 'text-slate-700 group-hover:text-slate-900'}`}>Add a short bio</span>
                 </div>
                 
                 <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/profile')}>
                   <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${state.user?.github ? 'bg-emerald-100 text-emerald-600 shadow-sm' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                     {state.user?.github ? <Check size={16} strokeWidth={3} /> : <div className="w-2 h-2 rounded-full bg-current"></div>}
                   </div>
                   <span className={`text-sm font-semibold ${state.user?.github ? 'text-slate-400 line-through' : 'text-slate-700 group-hover:text-slate-900'}`}>Link GitHub account</span>
                 </div>
                 
                 <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/profile')}>
                   <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${(state.user?.tags?.length || 0) > 3 ? 'bg-emerald-100 text-emerald-600 shadow-sm' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                     {(state.user?.tags?.length || 0) > 3 ? <Check size={16} strokeWidth={3} /> : <div className="w-2 h-2 rounded-full bg-current"></div>}
                   </div>
                   <span className={`text-sm font-semibold ${(state.user?.tags?.length || 0) > 3 ? 'text-slate-400 line-through' : 'text-slate-700 group-hover:text-slate-900'}`}>Add 4+ skills/tags</span>
                 </div>
              </div>
            </div>

            {/* Proposal Builder Status */}
            <div className="rounded-3xl p-7 border border-rose-200/50 bg-gradient-to-br from-white to-rose-50 shadow-md relative overflow-hidden group">
               <div className="absolute -top-6 -right-6 p-4 opacity-10 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                 <Heart size={120} className="fill-rose-500 text-rose-500 transform rotate-12" />
               </div>
               <div className="relative z-10">
                 <div className="flex items-center gap-2 mb-4 text-rose-600 font-bold tracking-tight">
                   <div className="p-1.5 bg-rose-100 rounded-lg"><Heart size={18} className="fill-rose-500" /></div>
                   Proposal Builder
                 </div>
                 <p className="text-sm text-slate-600 mb-6 font-medium leading-relaxed">
                   {state.proposalUnlocked 
                     ? "Great news! You've unlocked the proposal builder. Ready to make it official?" 
                     : "Complete a coding session and a date to unlock the AI Proposal Builder."}
                 </p>
                 <Button 
                   variant={state.proposalUnlocked ? 'primary' : 'secondary'} 
                   className={`w-full py-3 rounded-xl font-bold shadow-sm ${state.proposalUnlocked ? 'bg-rose-500 hover:bg-rose-600 border-none' : 'bg-white border-slate-200 text-slate-500'}`} 
                   onClick={() => navigate('/proposal')} 
                   disabled={!state.proposalUnlocked}
                 >
                   {state.proposalUnlocked ? "Open Builder" : "Locked"}
                 </Button>
               </div>
            </div>

            {/* Daily Tip */}
            <div className="bg-blue-50/80 p-6 rounded-3xl border border-blue-100/50 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/10 blur-xl rounded-full"></div>
               <div className="flex gap-4 items-start relative z-10">
                 <div className="bg-white p-2.5 rounded-xl text-blue-500 shadow-sm border border-blue-100/50 flex-shrink-0">
                   <Zap size={20} className="fill-blue-500" />
                 </div>
                 <div>
                    <h4 className="font-bold text-blue-900 text-base mb-1.5">Pro Tip</h4>
                    <p className="text-blue-800/80 text-sm font-medium leading-relaxed">
                      Pairs who spend 5 minutes on social chat before opening the editor are 40% more likely to match long-term.
                    </p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;