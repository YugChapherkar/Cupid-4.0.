import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Save, X, Loader2, Camera, Github } from 'lucide-react';
import { Button, Input, Select, TextArea, Card } from '../components/UI';
import { AppContext } from '../context/AppContext';
import { supabase } from '../services/supabaseClient';
import { Layout } from '../components/Layout';

const ProfileEditor = () => {
  const { state, setState } = React.useContext(AppContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{type: 'success'|'error', text: string} | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: '',
    city: '',
    level: 'Intermediate',
    github: '',
    bio: '',
    avatarSeed: ''
  });

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Initialize form with current user data
  useEffect(() => {
    if (state.user) {
      setFormData({
        name: state.user.name,
        city: state.user.city,
        level: state.user.level,
        github: state.user.github || '',
        bio: state.user.bio || '',
        avatarSeed: state.user.name // Simple seed based generation
      });
      setTags(state.user.tags || []);
    }
  }, [state.user]);

  const handleAddTag = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 8) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
      if (errors.tags) {
        setErrors(prev => ({ ...prev, tags: '' }));
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.avatarSeed.trim()) {
      newErrors.avatarSeed = 'Avatar seed is required';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Display Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City / Location is required';
    }

    if (formData.github && !/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(formData.github)) {
      newErrors.github = 'Invalid GitHub username';
    }

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }

    if (tags.length === 0) {
      newErrors.tags = 'Please add at least one technology to your tech stack';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!state.user) return;
    
    if (!validateForm()) {
      setMsg({ type: 'error', text: 'Please fix the errors in the form.' });
      return;
    }

    setLoading(true);
    setMsg(null);

    const updatedProfile = {
      name: formData.name,
      city: formData.city,
      level: formData.level,
      github: formData.github,
      bio: formData.bio,
      tags: tags,
      // Regenerate avatar URL based on name if they want, or keep existing. 
      // For simplicity here we update it based on name seed to allow "changing" it by changing name/seed.
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.avatarSeed}`
    };

    try {
      // 1. Update Supabase
      if (state.user.id !== 'u1') {
        const { error } = await supabase
          .from('profiles')
          .update(updatedProfile)
          .eq('id', state.user.id);
        
        if (error) throw error;
      }

      // 2. Update Local State
      setState((prev) => ({
        ...prev,
        user: {
          ...prev.user!,
          ...updatedProfile,
          avatarUrl: updatedProfile.avatar_url,
          level: updatedProfile.level as "Beginner" | "Intermediate" | "Advanced" | "Senior" | "Staff/Principal"
        }
      }));

      setMsg({ type: 'success', text: 'Profile updated successfully!' });
      
      // Auto clear success message
      setTimeout(() => setMsg(null), 3000);

    } catch (err: any) {
      console.error(err);
      setMsg({ type: 'error', text: 'Failed to update profile. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
           <div>
             <h1 className="text-3xl font-bold text-slate-900">Edit Profile</h1>
             <p className="text-slate-500">Update your developer persona and matching preferences.</p>
           </div>
           <Button variant="outline" onClick={() => navigate('/dashboard')}>Cancel</Button>
        </div>

        {msg && (
          <div className={`p-4 rounded-xl mb-6 flex items-center gap-2 ${msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
             {msg.type === 'success' ? <User size={18}/> : <X size={18}/>}
             {msg.text}
          </div>
        )}

        <div className="grid gap-6">
          {/* Avatar Section */}
          <Card className="p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
             <div className="relative group flex-shrink-0">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.avatarSeed}`} 
                  className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-md"
                  alt="Avatar Preview"
                />
                <div className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-md border border-slate-100 text-slate-500">
                  <Camera size={14} />
                </div>
             </div>
             <div className="flex-grow w-full">
               <label className="block text-sm font-medium text-slate-700 mb-1">Avatar Seed</label>
               <div className="flex flex-col sm:flex-row gap-2">
                 <div className="flex-grow w-full">
                   <input 
                     className={`w-full px-3 py-2 bg-white border ${errors.avatarSeed ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-brand-500 focus:border-brand-500'} rounded-lg text-sm outline-none transition-all`}
                     value={formData.avatarSeed}
                     onChange={e => {
                       setFormData({...formData, avatarSeed: e.target.value});
                       if (errors.avatarSeed) setErrors(prev => ({ ...prev, avatarSeed: '' }));
                     }}
                     placeholder="Type anything to generate new avatar..."
                   />
                   {errors.avatarSeed && <p className="text-red-500 text-xs mt-1">{errors.avatarSeed}</p>}
                 </div>
                 <Button variant="ghost" className="w-full sm:w-auto" onClick={() => {
                   setFormData({...formData, avatarSeed: Math.random().toString(36)});
                   if (errors.avatarSeed) setErrors(prev => ({ ...prev, avatarSeed: '' }));
                 }}>Randomize</Button>
               </div>
               <p className="text-xs text-slate-400 mt-1 text-center sm:text-left">We use DiceBear to generate privacy-friendly avatars.</p>
             </div>
          </Card>

          {/* Basic Info */}
          <Card className="p-6 space-y-4">
             <h2 className="font-bold text-lg text-slate-900 mb-2">Basic Info</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Input 
                 label="Display Name" 
                 value={formData.name}
                 onChange={e => {
                   setFormData({...formData, name: e.target.value});
                   if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                 }}
                 error={errors.name}
               />
               <Input 
                 label="City / Location" 
                 value={formData.city}
                 onChange={e => {
                   setFormData({...formData, city: e.target.value});
                   if (errors.city) setErrors(prev => ({ ...prev, city: '' }));
                 }}
                 error={errors.city}
               />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select 
                   label="Experience Level"
                   options={['Junior', 'Intermediate', 'Senior', 'Staff/Principal']}
                   value={formData.level}
                   onChange={e => {
                     setFormData({...formData, level: e.target.value});
                     if (errors.level) setErrors(prev => ({ ...prev, level: '' }));
                   }}
                   error={errors.level}
                />
                <div className="relative">
                   <Input 
                      label="GitHub Username" 
                      value={formData.github}
                      onChange={e => {
                        setFormData({...formData, github: e.target.value});
                        if (errors.github) setErrors(prev => ({ ...prev, github: '' }));
                      }}
                      placeholder="e.g. torvalds"
                      error={errors.github}
                   />
                   <Github size={16} className={`absolute right-3 ${errors.github ? 'top-[34px]' : 'top-[34px]'} text-slate-400 pointer-events-none`} />
                </div>
             </div>
             
             <TextArea 
                label="Bio"
                value={formData.bio}
                onChange={e => {
                  setFormData({...formData, bio: e.target.value});
                  if (errors.bio) setErrors(prev => ({ ...prev, bio: '' }));
                }}
                placeholder="Share a bit about your coding journey and what you're looking for..."
                error={errors.bio}
             />
          </Card>

          {/* Skills & Tags */}
          <Card className="p-6">
             <h2 className="font-bold text-lg text-slate-900 mb-2">Tech Stack</h2>
             <p className="text-sm text-slate-500 mb-4">Add up to 8 technologies you work with or want to learn.</p>
             
             <div className={`flex flex-wrap gap-2 mb-1 p-3 bg-slate-50 border ${errors.tags ? 'border-red-500' : 'border-slate-200'} rounded-lg min-h-[50px]`}>
                {tags.map(tag => (
                  <span key={tag} className="bg-white border border-slate-200 text-slate-700 px-3 py-1 rounded-full text-sm flex items-center gap-1 shadow-sm">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors"><X size={14}/></button>
                  </span>
                ))}
                <input 
                  type="text" 
                  className="flex-grow outline-none text-sm bg-transparent min-w-[120px] placeholder:text-slate-400"
                  placeholder={tags.length === 0 ? "Type tag & hit Enter..." : ""}
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddTag(e)}
                />
             </div>
             {errors.tags && <p className="text-red-500 text-xs mb-3">{errors.tags}</p>}
             
             <div className="flex flex-wrap gap-2">
                 {['React', 'TypeScript', 'Node.js', 'Python', 'Go', 'Rust', 'AWS', 'Docker', 'GraphQL'].map(rec => (
                   !tags.includes(rec) && (
                     <button 
                       key={rec} 
                       onClick={() => {
                         if (tags.length < 8) {
                           setTags([...tags, rec]);
                           if (errors.tags) setErrors(prev => ({ ...prev, tags: '' }));
                         }
                       }}
                       className="text-xs border border-slate-200 px-2 py-1 rounded hover:bg-slate-100 text-slate-500 transition-colors"
                     >
                       + {rec}
                     </button>
                   )
                 ))}
             </div>
          </Card>

          <div className="flex gap-4 pt-4">
             <Button fullWidth onClick={handleSave} disabled={loading} className="py-3 text-lg shadow-lg shadow-brand-500/20">
               {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} className="mr-2"/> Save Changes</>}
             </Button>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default ProfileEditor;