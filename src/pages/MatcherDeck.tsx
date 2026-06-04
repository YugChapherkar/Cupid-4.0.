import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, X, MapPin, Sparkles, MessageCircle, Loader2, Code2, Terminal, Github } from 'lucide-react';
import { Button, Card, Badge } from '../components/UI';
import { AppContext } from '../context/AppContext';
import { supabase } from '../services/supabaseClient';
import { Layout } from '../components/Layout';
import { calculateMatchScore } from '../utils/matchingAlgorithm';
// @ts-ignore
import confetti from 'canvas-confetti';

const MatcherDeck = () => {
  const { state, setState } = React.useContext(AppContext);
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchAnimation, setMatchAnimation] = useState<'none' | 'left' | 'right'>('none');
  const [showMatchModal, setShowMatchModal] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch Potential Matches
  useEffect(() => {
    const fetchProfiles = async () => {
      if (!state.user) return;
      
      // If demo mode (id is 'u1'), mock data
      if (state.user.id === 'u1') {
         const mockCandidates = [
           {
             id: 'demo-2',
             name: 'Jordan Lee',
             avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800',
             city: 'San Francisco',
             level: 'Senior',
             tags: ['React', 'TypeScript', 'Node.js'],
             bio: 'Building scalable web apps. Love coffee, open source, and architecture.',
             github: 'jordanlee'
           },
           {
             id: 'demo-3',
             name: 'Casey Smith',
             avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=800',
             city: 'Austin',
             level: 'Intermediate',
             tags: ['React', 'Next.js', 'TypeScript'],
             bio: 'Frontend focused developer looking for a backend partner to build side projects.',
             github: 'casey_codes'
           },
           {
             id: 'demo-4',
             name: 'Riley Dev',
             avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
             city: 'Remote',
             level: 'Beginner',
             tags: ['Rust', 'WASM', 'Python'],
             bio: 'Learning system programming. Interested in machine learning and performance.',
             github: 'riley_rust'
           }
         ];
         
         const scoredMock = mockCandidates.map(p => {
           const matchData = calculateMatchScore(state.user, p);
           return { ...p, score: matchData.score, reasons: matchData.reasons };
         }).sort((a, b) => b.score - a.score);
         
         setProfiles(scoredMock);
         setLoading(false);
         return;
      }

      // Supabase fetch logic
      const { data: swipes } = await supabase.from('swipes').select('target_id').eq('liker_id', state.user.id);
      const swipedIds = swipes?.map(s => s.target_id) || [];
      swipedIds.push(state.user.id);

      const { data: candidates } = await supabase
        .from('profiles')
        .select('*')
        .not('id', 'in', `(${swipedIds.join(',')})`)
        .limit(10);

      if (candidates) {
        const scored = candidates.map(p => {
            const matchData = calculateMatchScore(state.user, p);
            return {
              ...p, 
              score: matchData.score,
              reasons: matchData.reasons
            };
        }).sort((a, b) => b.score - a.score);
        setProfiles(scored);
      }
      setLoading(false);
    };

    fetchProfiles();
  }, [state.user]);

  const currentMatch = profiles[currentIndex];
  const nextMatch = profiles[currentIndex + 1];

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 60 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (!state.user || !currentMatch) return;
    setMatchAnimation(direction);
    
    // DB Logic
    if (state.user.id !== 'u1') {
      await supabase.from('swipes').insert({
        liker_id: state.user.id,
        target_id: currentMatch.id,
        direction
      });
    }

    if (direction === 'right') {
      const isMatch = state.user.id === 'u1' ? true : Math.random() > 0.5;

      if (isMatch) {
        // Add match to global state so it appears in Dashboard immediately
        // (Simulating the backend push for the demo)
        const newMatchObj = {
          id: `new-${Date.now()}`,
          userId: state.user.id,
          user: { 
            id: currentMatch.id,
            name: currentMatch.name,
            email: 'hidden@example.com',
            avatarUrl: currentMatch.avatar_url,
            tags: currentMatch.tags,
            level: currentMatch.level,
            timezone: 'UTC',
            city: currentMatch.city,
            socialOptIn: false
          },
          score: currentMatch.score,
          reasons: currentMatch.reasons,
          status: 'chatting' as const
        };

        // Add to local state (for instant UI update)
        setState((prev: any) => ({
          ...prev,
          activeMatches: [newMatchObj, ...prev.activeMatches]
        }));

        if (state.user.id !== 'u1') {
          await supabase.from('matches').insert({ user_a: state.user.id, user_b: currentMatch.id });
        }
        
        setTimeout(() => {
          triggerConfetti();
          setShowMatchModal(currentMatch);
        }, 300);
      }
    }
    
    // Increased timeout to match CSS transition duration (500ms) for smoother exit
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setMatchAnimation('none');
    }, 300);
  };

  // Full Screen Match Modal
  if (showMatchModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in bg-slate-900/80 backdrop-blur-xl">
        <div className="absolute inset-0 overflow-hidden pointer-events-none bg-gradient-to-br from-brand-900/40 via-slate-900/40 to-rose-900/40">
        </div>

        <div className="text-center text-white max-w-md w-full relative z-10 animate-pop-in">
          <div className="font-serif italic text-5xl md:text-6xl mb-12 text-transparent bg-clip-text bg-gradient-to-br from-white via-brand-100 to-rose-200 drop-shadow-2xl font-black tracking-tight">
            It's a Match!
          </div>

          <div className="flex justify-center items-center gap-4 md:gap-8 mb-12 relative">
            <div className="relative group z-10">
               <img src={state.user?.avatarUrl} className="w-28 h-28 md:w-36 md:h-36 rounded-full border-[6px] border-white shadow-2xl object-cover transform -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
               <div className="absolute -bottom-3 -right-3 bg-white text-brand-600 rounded-full p-2.5 shadow-xl"><Code2 size={24}/></div>
            </div>
            
            <div className="relative z-20 -mx-8 animate-bounce" style={{ animationDuration: '2s' }}>
              <div className="bg-white p-4 rounded-full shadow-2xl">
                <Heart className="fill-rose-500 text-rose-500 w-12 h-12 md:w-16 md:h-16" />
              </div>
            </div>
            
            <div className="relative group z-10">
               <img src={showMatchModal.avatar_url} className="w-28 h-28 md:w-36 md:h-36 rounded-full border-[6px] border-white shadow-2xl object-cover transform rotate-12 group-hover:rotate-0 transition-transform duration-500" />
               <div className="absolute -bottom-3 -left-3 bg-white text-brand-600 rounded-full p-2.5 shadow-xl"><Terminal size={24}/></div>
            </div>
          </div>
          
          <div className="space-y-4 mb-10">
             <p className="text-2xl md:text-3xl font-bold tracking-tight">You and {showMatchModal.name}</p>
             <div className="inline-block bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 shadow-lg">
               <p className="text-brand-50 text-base md:text-lg font-medium flex items-center gap-2">
                 <Sparkles size={18} className="text-yellow-300" />
                 {showMatchModal.reasons[0] ? `Matched on: ${showMatchModal.reasons[0]}` : 'Perfect Match!'}
               </p>
             </div>
          </div>
          
          <div className="space-y-4 px-4">
             <Button 
                fullWidth 
                onClick={() => navigate('/dashboard')} 
                className="!bg-white !text-rose-600 hover:!bg-rose-50 py-4 font-extrabold text-lg shadow-[0_0_40px_rgba(255,255,255,0.3)] border-none relative overflow-hidden group rounded-2xl"
             >
               <span className="relative z-10 flex items-center justify-center">
                 <MessageCircle size={22} className="mr-2" /> Start Chatting
               </span>
             </Button>
             
             <Button 
               fullWidth 
               variant="ghost" 
               onClick={() => { setShowMatchModal(null); }} 
               className="text-white hover:bg-white/10 py-4 font-bold rounded-2xl"
             >
               Keep Swiping
             </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout className="flex flex-col items-center overflow-hidden h-[calc(100dvh-80px)] md:h-[calc(100vh-120px)] pt-0 md:pt-4 bg-slate-50">
      {loading ? (
        <div className="flex flex-col items-center justify-center flex-grow">
          <Loader2 className="animate-spin text-brand-500 w-10 h-10 mb-4"/>
          <p className="text-slate-500 font-medium">Finding developers...</p>
        </div>
      ) : !currentMatch ? (
        <div className="flex flex-col items-center justify-center flex-grow text-center p-8 max-w-md animate-fade-in my-auto">
          <div className="w-20 h-20 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mb-6 mx-auto shadow-sm">
             <Sparkles size={32} className="text-brand-500" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">You're All Caught Up</h2>
          <p className="text-slate-500 mb-8 text-base leading-relaxed">Check back later for new developers in your area.</p>
          <Button onClick={() => navigate('/dashboard')} className="py-3 px-8 text-base font-semibold shadow-md rounded-xl bg-slate-900 hover:bg-slate-800 text-white border-none">Back to Dashboard</Button>
        </div>
      ) : (
        <div className="w-full max-w-[400px] flex flex-col h-full justify-between pb-6 pt-2 px-4 md:px-0">
          
          {/* Card Stack Container */}
          <div className="flex-grow relative perspective-1000 mb-6 flex items-center justify-center w-full mx-auto min-h-0">
            
            {/* Background Card */}
            {nextMatch && (
              <div className={`absolute inset-0 z-0 transition-transform duration-300 ease-out pointer-events-none ${
                matchAnimation !== 'none' 
                  ? 'scale-100 translate-y-0 opacity-100' 
                  : 'scale-[0.96] translate-y-3 opacity-70'
              }`}>
                 <Card className="h-full w-full bg-white rounded-3xl overflow-hidden shadow-sm flex flex-col border border-slate-200">
                    <img src={nextMatch.avatar_url} className="w-full h-full object-cover" />
                 </Card>
              </div>
            )}

            {/* Active Card */}
            <div className={`h-full w-full absolute inset-0 z-10 bg-white rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100 transform transition-transform duration-300 ease-out cursor-grab active:cursor-grabbing ${
              matchAnimation === 'left' ? '-translate-x-[120%] rotate-[-10deg]' : 
              matchAnimation === 'right' ? 'translate-x-[120%] rotate-[10deg]' : ''
            }`}>
              {/* Entire Card Scrollable Content */}
              <div className="h-full w-full overflow-y-auto flex flex-col custom-scrollbar">
                
                {/* Image Section (Proportional aspect ratio) */}
                <div className="relative aspect-square w-full shrink-0 bg-slate-100">
                  <img src={currentMatch.avatar_url} className="absolute inset-0 w-full h-full object-cover pointer-events-none" draggable={false} />
                  
                  {/* Match Score Badge */}
                  <div className="absolute top-4 left-4 z-10">
                     <div className="bg-white/90 text-slate-800 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
                       <Sparkles size={14} className="text-yellow-500" /> {currentMatch.score}% Match
                     </div>
                  </div>

                  {/* LIKE/NOPE Stamps */}
                  <div className={`absolute top-6 right-6 z-20 border-[4px] border-rose-500 rounded-lg px-3 py-1 transform rotate-12 transition-opacity duration-200 pointer-events-none ${matchAnimation === 'left' ? 'opacity-100' : 'opacity-0'}`}>
                     <span className="text-rose-500 font-black text-3xl tracking-widest">NOPE</span>
                  </div>
                  <div className={`absolute top-6 left-6 z-20 border-[4px] border-emerald-500 rounded-lg px-3 py-1 transform -rotate-12 transition-opacity duration-200 pointer-events-none ${matchAnimation === 'right' ? 'opacity-100' : 'opacity-0'}`}>
                     <span className="text-emerald-500 font-black text-3xl tracking-widest">LIKE</span>
                  </div>
                </div>

                {/* Info Section */}
                <div className="bg-white p-5 md:p-6 flex flex-col shrink-0">
                  <div className="flex justify-between items-start mb-1">
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 truncate pr-2">
                      {currentMatch.name}
                    </h2>
                    <span className="text-[11px] md:text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 border border-brand-100 mt-1.5">
                      {currentMatch.level}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-slate-500 font-medium mb-3">
                    <span className="flex items-center gap-1 shrink-0">
                      <MapPin size={14} className="text-slate-400"/> {currentMatch.city}
                    </span>
                    {currentMatch.github && (
                        <>
                          <span className="text-slate-300 shrink-0">•</span>
                          <span className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer truncate">
                            <Github size={14} className="shrink-0" /> <span className="truncate">{currentMatch.github}</span>
                          </span>
                        </>
                    )}
                  </div>

                  {currentMatch.bio && (
                    <p className="text-sm text-slate-600 leading-relaxed mb-4">
                      {currentMatch.bio}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {currentMatch.tags?.map((t: string) => (
                      <span key={t} className="px-2.5 py-1.5 rounded-lg bg-slate-50 text-slate-600 text-[11px] font-bold border border-slate-200/60">
                        {t}
                      </span>
                    ))}
                  </div>
                  
                  <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 mt-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Sparkles size={12} className="text-slate-400" /> Match Reasons
                    </p>
                    <p className="text-[13px] text-slate-700 leading-relaxed font-medium">
                      {currentMatch.reasons?.join(' • ')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex-shrink-0 flex items-center justify-center gap-6 z-20 pb-4">
            <button 
              onClick={() => handleSwipe('left')}
              className="w-[72px] h-[72px] rounded-full bg-white shadow-lg shadow-slate-200/50 border border-slate-100 text-slate-400 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 hover:-translate-y-1 active:translate-y-0 transition-all duration-200"
            >
              <X size={32} strokeWidth={3} />
            </button>
            <button 
              onClick={() => handleSwipe('right')}
              className="w-[72px] h-[72px] rounded-full bg-rose-500 shadow-xl shadow-rose-500/30 text-white flex items-center justify-center hover:bg-rose-600 hover:-translate-y-1 active:translate-y-0 transition-all duration-200"
            >
              <Heart size={32} strokeWidth={2.5} className="fill-white" />
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default MatcherDeck;