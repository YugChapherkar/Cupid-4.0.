import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Terminal, CheckCircle, Loader2, X, ArrowRight, ChevronLeft } from 'lucide-react';
import { Button, Input, Select, TextArea } from '../components/UI';
import { AppContext } from '../context/AppContext';
import { supabase } from '../services/supabaseClient';
import { CURRENT_USER } from '../services/mockBackend';

const SignUp = () => {
  const navigate = useNavigate();
  const { login } = React.useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  
  // Onboarding State
  const [step, setStep] = useState(1); // 1: Auth, 2: Profile Details
  
  // Form Data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    city: '',
    level: 'Intermediate',
    github: '',
    bio: '',
  });

  // Tags State
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 8) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleDemoLogin = () => {
    login(CURRENT_USER);
  };

  // Aggressive email cleaning to remove hidden characters/spaces
  const sanitizeEmail = (email: string) => {
    if (!email) return '';
    return email.replace(/\s/g, '').toLowerCase();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const email = sanitizeEmail(formData.email);
    const password = formData.password.trim();

    if (!email) {
      setError("Please enter your email.");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      // Navigation handled by App listener
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('security purposes') || err.message?.includes('seconds')) {
        setError("Too many attempts. Please wait 15s or use Demo Mode.");
      } else if (err.message?.includes('Invalid login')) {
         setError("Invalid email or password.");
      } else if (err.message?.includes("invalid")) {
         setError(`Email issue: ${err.message}`);
      } else {
        setError(err.message || "Login failed.");
      }
      setLoading(false);
    }
  };

  const handleSignupStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanEmail = sanitizeEmail(formData.email);
    
    if (!cleanEmail || !formData.password) {
      setError("Please fill in all fields.");
      return;
    }
    
    // Robust Regex Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError("Please enter a valid email address (e.g. name@example.com).");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError('');
    setStep(2);
  };

  const handleFinalSignup = async () => {
    setLoading(true);
    setError('');

    const email = sanitizeEmail(formData.email);
    const password = formData.password.trim();
    
    try {
      // 1. Create Auth User
      // We explicitly enable email confirmation handling if needed, but usually we just want to know if it failed.
      let { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: formData.name,
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`,
            city: formData.city,
            level: formData.level,
            tags: tags.length > 0 ? tags : ['JavaScript']
          }
        }
      });
      
      // Handle "User already exists" gracefully
      if (authError) {
         if (authError.message.includes("already registered") || authError.message.includes("User already exists")) {
            setError("Account already exists. Please switch to the 'Log In' tab.");
            setLoading(false);
            return;
         }
         throw authError;
      }

      // 2. Check for Session (Email Confirmation logic)
      if (authData.user && !authData.session) {
         setError("Signup successful! Please check your email to confirm your account.");
         setLoading(false);
         return;
      }

      // 3. Explicitly create/update profile to ensure dashboard loads correctly
      if (authData.user) {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: authData.user.id,
          name: formData.name || 'Developer',
          email,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`,
          city: formData.city || 'Remote',
          level: formData.level || 'Intermediate',
          tags: tags.length > 0 ? tags : ['JavaScript'],
          social_opt_in: true
        });

        if (profileError) {
          console.error("Profile upsert failed (non-critical if App.tsx recovers):", profileError);
        }
      }
      
      // Wait a moment for App.tsx to pick up the session
      setTimeout(() => {
        if (window.location.hash.includes('signup')) {
            // If still here, maybe manual navigation is needed, or just stop loading
            setLoading(false);
        }
      }, 3000);

    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('security purposes') || err.message?.includes('seconds') || err.status === 429) {
         setError("Rate limit hit. Please use 'Enter Demo Mode' to skip auth.");
      } else if (err.message?.includes("invalid") || err.message?.includes("validation")) {
         // Clean up specific email invalid errors
         setError(`Invalid email format: ${email}`);
      } else {
         setError(err.message || "An unexpected error occurred.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Left Panel - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 bg-code-900 opacity-50 pattern-grid-lg"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-20 translate-y-1/2 -translate-x-1/3"></div>
        
        <div className="relative z-10 max-w-lg">
          <div className="mb-8 flex items-center gap-3">
             <div className="w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/30">
                <Heart className="text-white fill-white" size={24} />
             </div>
             <h1 className="text-3xl font-bold text-white tracking-tight">Cupid 4.0</h1>
          </div>
          
          <h2 className="text-4xl font-extrabold text-white mb-6 leading-tight">
            Commit to someone <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-rose-400">who gets your code.</span>
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700 backdrop-blur-sm">
              <CheckCircle className="text-green-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-white">Smart Algorithm</h3>
                <p className="text-slate-400 text-sm">We match based on tech stack, skill level, and coding style.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700 backdrop-blur-sm">
              <Terminal className="text-purple-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-white">Live Collaboration</h3>
                <p className="text-slate-400 text-sm">Skip the small talk. Solve a problem together to see if there's a spark.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 flex items-center gap-4 text-slate-500 text-sm">
            <div className="flex -space-x-3">
               {[1,2,3,4].map(i => (
                 <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800" />
               ))}
            </div>
            <p>Join 10,000+ developers today.</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
        <Button variant="ghost" className="absolute top-6 left-6 lg:hidden" onClick={() => navigate('/')}>
          <ChevronLeft size={20} /> Back
        </Button>

        <div className="w-full max-w-md">
          {/* Centered Logo for All Screens (Essential for Mobile) */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/30 mb-4 animate-pulse-soft">
              <Heart className="text-white fill-white" size={28} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Cupid 4.0</h1>
          </div>

          {/* Segmented Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-lg mb-8">
            <button
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${isLogin ? 'bg-white shadow text-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => { setIsLogin(true); setError(''); }}
            >
              Log In
            </button>
            <button
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${!isLogin ? 'bg-white shadow text-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => { setIsLogin(false); setStep(1); setError(''); }}
            >
              Sign Up
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {isLogin ? 'Welcome Back' : (step === 1 ? 'Create Account' : 'Build Profile')}
            </h2>
            <p className="text-slate-500">
              {isLogin ? 'Enter your details to access your account.' : (step === 1 ? 'Start your journey to find a coding partner.' : 'Tell us about your dev persona.')}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 text-red-700 text-sm animate-fade-in">
              <X size={16} className="flex-shrink-0" /> 
              <div>
                 {error}
                 {error.includes("Demo Mode") && (
                    <button onClick={handleDemoLogin} className="block mt-1 underline font-bold hover:text-red-800">
                      Click here to switch to Demo Mode
                    </button>
                 )}
              </div>
            </div>
          )}

          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
              <Input 
                label="Email" 
                type="email" 
                placeholder="you@example.com"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                required
              />
              <Input 
                label="Password" 
                type="password" 
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                required
              />
              <Button type="submit" fullWidth className="py-3" disabled={loading}>
                 {loading ? <Loader2 className="animate-spin" /> : 'Sign In'}
              </Button>
            </form>
          ) : (
            <>
              {step === 1 && (
                <form onSubmit={handleSignupStep1} className="space-y-4 animate-fade-in">
                  <Input 
                    label="Email" 
                    type="email" 
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    required
                  />
                  <Input 
                    label="Password" 
                    type="password" 
                    placeholder="Create a strong password (6+ chars)"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    required
                  />
                  
                  <div className="pt-2">
                    <Button type="submit" fullWidth className="py-3 group">
                       Continue <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform"/>
                    </Button>
                  </div>
                </form>
              )}

              {step === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input 
                      label="Full Name" 
                      placeholder="Grace Hopper"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                    <Input 
                      label="City / Timezone" 
                      placeholder="New York (EST)"
                      value={formData.city}
                      onChange={e => setFormData({...formData, city: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <Select 
                        label="Experience Level"
                        options={['Junior', 'Intermediate', 'Senior', 'Staff/Principal']}
                        value={formData.level}
                        onChange={e => setFormData({...formData, level: e.target.value})}
                     />
                     <Input 
                        label="Github Username" 
                        placeholder="@username"
                        value={formData.github}
                        onChange={e => setFormData({...formData, github: e.target.value})}
                     />
                  </div>

                  {/* Interactive Tags */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tech Stack (Top 5)</label>
                    <div className="flex flex-wrap gap-2 mb-2 p-3 bg-white border border-slate-300 rounded-lg min-h-[50px] focus-within:ring-2 focus-within:ring-brand-500">
                      {tags.map(tag => (
                        <span key={tag} className="bg-brand-50 text-brand-700 px-2 py-1 rounded-md text-sm flex items-center gap-1">
                          {tag}
                          <button onClick={() => removeTag(tag)} className="hover:text-brand-900"><X size={12}/></button>
                        </span>
                      ))}
                      <input 
                        type="text" 
                        className="flex-grow outline-none text-sm bg-transparent min-w-[80px]"
                        placeholder={tags.length === 0 ? "Type & Enter (e.g. React)" : ""}
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddTag(e)}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                       {['React', 'Node.js', 'Python', 'Rust', 'Go'].map(rec => (
                         <button key={rec} onClick={() => { if(!tags.includes(rec)) setTags([...tags, rec]) }} className="text-xs border border-slate-200 px-2 py-1 rounded hover:bg-slate-50 text-slate-500">
                           + {rec}
                         </button>
                       ))}
                    </div>
                  </div>

                  <TextArea 
                    label="Bio / What are you looking for?"
                    placeholder="I'm a frontend dev looking for a backend partner to build side projects with..."
                    value={formData.bio}
                    onChange={e => setFormData({...formData, bio: e.target.value})}
                  />

                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                    <Button fullWidth className="flex-[2] py-3" onClick={handleFinalSignup} disabled={loading}>
                       {loading ? <Loader2 className="animate-spin" /> : 'Complete Profile'}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

           <div className="mt-8 pt-6 border-t border-slate-200">
              <Button variant="outline" fullWidth onClick={handleDemoLogin} className="border-dashed border-slate-300 text-slate-500 hover:text-brand-600 hover:border-brand-400">
                 Enter Demo Mode (Skip Auth)
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;