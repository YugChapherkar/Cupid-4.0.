import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import { AppContext, AppState } from './context/AppContext';
import { User, Match } from './types';
import { supabase } from './services/supabaseClient';
import { MOCK_MATCHES, CURRENT_USER } from './services/mockBackend';

// Import Pages
import LandingPage from './pages/LandingPage';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import MatcherDeck from './pages/MatcherDeck';
import SessionView from './pages/SessionView';
import DatePlanner from './pages/DatePlanner';
import ProposalBuilder from './pages/ProposalBuilder';
import VirtualCafe from './pages/VirtualCafe';
import ProfileEditor from './pages/ProfileEditor';

// --- App Container with State Logic ---

const AppContent = () => {
  const { state, loading } = React.useContext(AppContext);

  if (loading) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-brand-500 w-12 h-12"/></div>;
  }

  return (
    <Routes>
      <Route path="/" element={state.user ? <Navigate to="/dashboard" /> : <LandingPage />} />
      <Route path="/signup" element={state.user ? <Navigate to="/dashboard" /> : <SignUp />} />
      <Route path="/dashboard" element={state.user ? <Dashboard /> : <Navigate to="/" />} />
      <Route path="/matcher" element={state.user ? <MatcherDeck /> : <Navigate to="/" />} />
      <Route path="/session/:id" element={state.user ? <SessionView /> : <Navigate to="/" />} />
      <Route path="/date-planner" element={state.user ? <DatePlanner /> : <Navigate to="/" />} />
      <Route path="/proposal" element={state.user ? <ProposalBuilder /> : <Navigate to="/" />} />
      <Route path="/virtual-cafe" element={state.user ? <VirtualCafe /> : <Navigate to="/" />} />
      <Route path="/profile" element={state.user ? <ProfileEditor /> : <Navigate to="/" />} />
    </Routes>
  );
};

const App = () => {
  const [state, setState] = useState<AppState>({
    user: null,
    session: null,
    activeMatches: [],
    proposalUnlocked: false
  });
  const [loading, setLoading] = useState(true);

  // Initialize Auth Listener & Initial Data Fetch
  useEffect(() => {
    // 1. Check for Demo Mode Persistence
    const isDemo = localStorage.getItem('cupid_demo_mode') === 'true';
    if (isDemo) {
       login(CURRENT_USER);
       return;
    }

    // 2. Check for Supabase Session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSession = async (session: any) => {
    try {
      if (session) {
        // Fetch Profile
        let { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        // AUTO-RECOVERY: If profile is missing (e.g. trigger failed or manual insert missed), create it from metadata
        if (!profile) {
          console.warn("Profile not found, attempting auto-creation...");
          const metadata = session.user.user_metadata || {};
          const newProfile = {
             id: session.user.id,
             name: metadata.name || session.user.email?.split('@')[0] || 'Developer',
             email: session.user.email,
             avatar_url: metadata.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`,
             city: metadata.city || 'Remote',
             level: metadata.level || 'Beginner',
             tags: metadata.tags || ['JavaScript'],
             social_opt_in: true
          };
          
          // Use UPSERT to prevent race conditions with SignUp.tsx
          const { error: insertError } = await supabase.from('profiles').upsert(newProfile);
          
          if (!insertError) {
             profile = newProfile;
          } else {
             // If upsert failed, try fetching one last time (maybe it existed but we missed it)
             const { data: retryProfile } = await supabase
               .from('profiles')
               .select('*')
               .eq('id', session.user.id)
               .single();
             
             if (retryProfile) {
               profile = retryProfile;
             } else {
               console.error("Critical: Failed to auto-create profile.", insertError);
             }
          }
        }

        if (profile) {
          // Fetch Matches
          const { data: matches } = await supabase
            .from('matches')
            .select(`id, user_a, user_b, created_at`)
            .or(`user_a.eq.${session.user.id},user_b.eq.${session.user.id}`);
          
          let enrichedMatches: Match[] = [];
          if (matches) {
             // For each match, fetch the OTHER profile
             const matchPromises = matches.map(async (m) => {
               const partnerId = m.user_a === session.user.id ? m.user_b : m.user_a;
               const { data: partner } = await supabase.from('profiles').select('*').eq('id', partnerId).single();
               
               if (!partner) return null; // Handle deleted users

               return {
                 id: m.id,
                 userId: session.user.id,
                 user: {
                   id: partner.id,
                   name: partner.name,
                   email: partner.email,
                   avatarUrl: partner.avatar_url,
                   tags: partner.tags,
                   level: partner.level,
                   timezone: 'UTC',
                   city: partner.city,
                   socialOptIn: false
                 },
                 score: 85, 
                 reasons: ['Already Connected'],
                 status: 'chatting'
               } as Match;
             });
             
             const results = await Promise.all(matchPromises);
             enrichedMatches = results.filter(m => m !== null) as Match[];
          }

          setState({
            user: {
              id: profile.id,
              name: profile.name,
              email: session.user.email,
              avatarUrl: profile.avatar_url,
              tags: profile.tags,
              level: profile.level,
              timezone: 'UTC',
              city: profile.city,
              socialOptIn: false,
              bio: profile.bio || '',
              github: profile.github || ''
            },
            session,
            activeMatches: enrichedMatches,
            proposalUnlocked: false
          });
        }
      } else {
        // Only clear state if we aren't in Demo Mode
        if (localStorage.getItem('cupid_demo_mode') !== 'true') {
           setState({ user: null, session: null, activeMatches: [], proposalUnlocked: false });
        }
      }
    } catch (error) {
      console.error("Session initialization error:", error);
      setState({ user: null, session: null, activeMatches: [], proposalUnlocked: false });
    } finally {
      setLoading(false);
    }
  };

  // Realtime Matches Listener
  useEffect(() => {
    if (!state.user) return;
    
    // Skip subscription if demo user
    if (state.user.id === 'u1') return;
    
    const channel = supabase
      .channel('public_matches')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'matches', filter: `user_a=eq.${state.user.id}` }, refreshMatches)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'matches', filter: `user_b=eq.${state.user.id}` }, refreshMatches)
      .subscribe();

    return () => { supabase.removeChannel(channel); }
  }, [state.user]);

  const refreshMatches = async () => {
    // We can rely on handleSession to refresh
    const { data: { session } } = await supabase.auth.getSession();
    if(session) handleSession(session);
  };

  const login = (mockUser: User) => {
    localStorage.setItem('cupid_demo_mode', 'true');
    // Manually inject state for demo purposes to bypass Supabase
    setState({
      user: mockUser,
      session: { user: { id: mockUser.id, email: mockUser.email } },
      activeMatches: MOCK_MATCHES.map(m => ({...m, status: 'chatting'})),
      proposalUnlocked: false
    });
    setLoading(false);
  };

  const logout = async () => {
    localStorage.removeItem('cupid_demo_mode');
    if (state.user?.id !== 'u1') {
      await supabase.auth.signOut();
    }
    setState({ user: null, session: null, activeMatches: [], proposalUnlocked: false });
  };

  return (
    <AppContext.Provider value={{ state, setState, login, logout, loading }}>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AppContext.Provider>
  );
};

export default App;