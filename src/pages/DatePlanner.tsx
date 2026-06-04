import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Video, Sparkles, Shield, ArrowLeft, Calendar, Clock, Sun, CloudRain, Filter, Wifi, Coffee, Music, Code, Send, Check, Copy, X, Camera, Mic } from 'lucide-react';
import { Button, Card, Badge, Input } from '../components/UI';
import { AppContext } from '../context/AppContext';
import { generateDateItinerary } from '../services/geminiService';
import { MOCK_CAFES } from '../services/mockBackend';
import { Layout } from '../components/Layout';

// Mock Virtual Themes
const VIRTUAL_THEMES = [
  { id: 'v1', title: 'Lo-Fi Coding Lounge', icon: <Coffee size={24}/>, color: 'bg-amber-100 text-amber-700', desc: 'Chill beats, muted video, focus mode.' },
  { id: 'v2', title: 'Pair Prog. Dojo', icon: <Code size={24}/>, color: 'bg-blue-100 text-blue-700', desc: 'Screen share first, high-res audio, timer.' },
  { id: 'v3', title: 'Late Night Talks', icon: <Music size={24}/>, color: 'bg-purple-100 text-purple-700', desc: 'Cozy dark mode, icebreaker cards, jazz.' },
];

const DatePlanner = () => {
  const { state } = React.useContext(AppContext);
  const navigate = useNavigate();
  
  // State
  const [activeType, setActiveType] = useState<'real' | 'virtual'>('real');
  const [itinerary, setItinerary] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState<any>(null); // Place or Theme
  const [checkingPermissions, setCheckingPermissions] = useState(false);

  // Mock Weather
  const weather = { temp: 28, condition: 'Humid', icon: <CloudRain className="text-blue-400" /> };

  const handleGenerateItinerary = async () => {
    setGenerating(true);
    const result = await generateDateItinerary(state.user?.city || "Mumbai", "Cozy and quiet", "Moderate");
    setItinerary(result);
    setGenerating(false);
  };

  const handleSelectOption = (option: any) => {
    setSelectedOption(option);
    setShowInviteModal(true);
  };

  const handleQuickStartSession = () => {
    setCheckingPermissions(true);
    setTimeout(() => {
        setCheckingPermissions(false);
        navigate('/virtual-cafe');
    }, 2500);
  };

  const InviteModal = () => {
    if (!showInviteModal || !selectedOption) return null;

    const isVirtual = activeType === 'virtual';
    const locationName = isVirtual ? selectedOption.title : selectedOption.name;
    const address = isVirtual ? 'Online (Link will be generated)' : selectedOption.address;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-pop-in">
          <div className={`p-6 ${isVirtual ? 'bg-purple-50' : 'bg-brand-50'} border-b border-slate-100 flex justify-between items-start`}>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Send Invitation</h3>
              <p className="text-sm text-slate-500">Customize your invite message.</p>
            </div>
            <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
          </div>
          
          <div className="p-6 space-y-4">
            {/* Ticket / Card Preview */}
            <div className="bg-white border-2 border-slate-100 rounded-xl p-4 shadow-sm relative overflow-hidden group">
              <div className={`absolute top-0 left-0 w-1 h-full ${isVirtual ? 'bg-purple-500' : 'bg-brand-500'}`}></div>
              <div className="flex justify-between items-start mb-4 pl-3">
                 <div>
                   <h4 className="font-bold text-lg text-slate-800">{locationName}</h4>
                   <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin size={10}/> {address}</p>
                 </div>
                 {isVirtual ? <Video className="text-purple-400 shrink-0"/> : <Coffee className="text-brand-400 shrink-0"/>}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pl-3 text-sm">
                <div className="bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100 flex-1">
                  <span className="block text-[10px] text-slate-400 uppercase font-bold mb-0.5">Date</span>
                  <span className="font-semibold text-slate-700">{date || 'TBD'}</span>
                </div>
                <div className="bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100 flex-1">
                  <span className="block text-[10px] text-slate-400 uppercase font-bold mb-0.5">Time</span>
                  <span className="font-semibold text-slate-700">{time || 'TBD'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Message</label>
              <textarea 
                className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                rows={3}
                defaultValue={`Hey! I found this great ${isVirtual ? 'virtual space' : 'spot'} for us to connect. How does ${date || 'this weekend'} look for you?`}
              ></textarea>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
               <Button fullWidth onClick={() => { setShowInviteModal(false); alert("Invitation Sent!"); }} className="order-1 sm:order-none">
                 <Send size={16} className="mr-2" /> Send Invite
               </Button>
               <Button variant="outline" className="w-full sm:w-auto px-3 flex justify-center order-2 sm:order-none" title="Copy Link">
                 <Copy size={16} className="mr-2 sm:mr-0"/> <span className="sm:hidden">Copy Link</span>
               </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <InviteModal />
      
      <div className="max-w-5xl mx-auto">
        {/* Header & Weather */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Plan a Date</h1>
            <p className="text-slate-500">Design the perfect moment for you and your match.</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3 w-full md:w-auto">
             <div className="p-2 bg-blue-50 rounded-full">{weather.icon}</div>
             <div>
               <p className="text-xs text-slate-400 font-bold uppercase">{state.user?.city || 'Local'} Weather</p>
               <p className="font-bold text-slate-700">{weather.temp}°C • {weather.condition}</p>
             </div>
          </div>
        </div>

        {/* Configuration Bar */}
        <div className="bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row gap-3 md:gap-4 items-center">
           <div className="flex bg-slate-100 p-1 rounded-lg w-full md:w-auto">
             <button 
               onClick={() => setActiveType('real')}
               className={`flex-1 md:w-32 py-2 rounded-md text-sm font-bold transition-all ${activeType === 'real' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               In Person
             </button>
             <button 
               onClick={() => setActiveType('virtual')}
               className={`flex-1 md:w-32 py-2 rounded-md text-sm font-bold transition-all ${activeType === 'virtual' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               Virtual
             </button>
           </div>
           
           <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

           <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full md:w-auto">
             <div className="relative flex-1">
               <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
               <input 
                 type="date" 
                 className="pl-10 pr-4 py-2 bg-slate-50 border-transparent rounded-lg text-sm text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-brand-200 w-full"
                 value={date}
                 onChange={(e) => setDate(e.target.value)}
               />
             </div>
             <div className="relative flex-1">
               <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
               <input 
                 type="time" 
                 className="pl-10 pr-4 py-2 bg-slate-50 border-transparent rounded-lg text-sm text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-brand-200 w-full"
                 value={time}
                 onChange={(e) => setTime(e.target.value)}
               />
             </div>
           </div>
        </div>

        {/* IN PERSON VIEW */}
        {activeType === 'real' && (
          <div className="space-y-8 animate-fade-in">
             
             {/* AI Generator Teaser */}
             <div className="bg-gradient-to-r from-brand-50 to-rose-50 rounded-2xl p-6 border border-brand-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                   <div className="bg-white p-3 rounded-full shadow-md text-brand-500 flex-shrink-0">
                     <Sparkles size={24} />
                   </div>
                   <div>
                     <h3 className="font-bold text-slate-800">Stuck on ideas?</h3>
                     <p className="text-sm text-slate-600 max-w-md">Let our AI craft a custom 3-stop itinerary based on your match's profile and local hidden gems.</p>
                   </div>
                </div>
                <Button onClick={handleGenerateItinerary} disabled={generating} className="w-full md:w-auto whitespace-nowrap shadow-lg shadow-brand-500/20">
                  {generating ? 'Dreaming up plans...' : 'Generate Itinerary'}
                </Button>
             </div>
             
             {/* Generated Result */}
             {itinerary && (
               <div className="animate-fade-in-up">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Sparkles size={18} className="text-brand-500"/> AI Suggestion
                  </h3>
                  <Card className="p-6 bg-white border-brand-200 shadow-lg relative overflow-hidden">
                    <div className="text-slate-700 whitespace-pre-line text-sm leading-relaxed">{itinerary}</div>
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" className="text-xs h-9">Save to Profile</Button>
                      <Button className="text-xs h-9" onClick={() => setSelectedOption({ name: 'AI Itinerary', address: 'Custom Plan' })}>
                        Use This Plan
                      </Button>
                    </div>
                  </Card>
               </div>
             )}

             {/* Cafe List */}
             <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
                  <h2 className="text-xl font-bold text-slate-900">Curated Spots</h2>
                  <button className="text-sm font-medium text-slate-500 hover:text-brand-600 flex items-center gap-1 self-start sm:self-auto bg-white sm:bg-transparent px-3 py-1.5 sm:p-0 rounded-lg border sm:border-none border-slate-200 shadow-sm sm:shadow-none">
                    <Filter size={16}/> Filters
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {MOCK_CAFES.map(cafe => (
                    <Card key={cafe.id} className="overflow-hidden group hover:shadow-lg transition-all border-slate-200 flex flex-col h-full">
                      <div className="h-40 md:h-48 bg-slate-200 overflow-hidden relative shrink-0">
                        <img src={cafe.image} alt={cafe.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-slate-900 shadow-sm flex items-center gap-1">
                          <Check size={12} className="text-green-500"/> Verified
                        </div>
                        <div className="absolute bottom-3 left-3 flex gap-1">
                           <span className="bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-md flex items-center gap-1">
                             <Wifi size={10}/> Fast
                           </span>
                           <span className="bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-md">
                             $$
                           </span>
                        </div>
                      </div>
                      <div className="p-4 md:p-5 flex flex-col flex-grow">
                        <div className="flex justify-between items-start mb-2 gap-2">
                           <h4 className="font-bold text-slate-900 text-base md:text-lg line-clamp-1">{cafe.name}</h4>
                           <span className="text-xs font-bold bg-green-50 text-green-700 px-1.5 py-0.5 rounded flex items-center gap-0.5 shrink-0">
                             {cafe.rating} ★
                           </span>
                        </div>
                        <p className="text-xs text-slate-500 mb-4 flex items-center gap-1 flex-grow">
                          <MapPin size={12} className="shrink-0"/> <span className="truncate">{cafe.address}</span> • <span className="text-brand-600 font-medium shrink-0">{cafe.distance}</span>
                        </p>
                        <Button fullWidth variant="outline" onClick={() => handleSelectOption(cafe)} className="hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 mt-auto">
                          Select Location
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
             </div>
             
             <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 text-sm text-blue-800 items-start">
               <Shield size={18} className="mt-0.5 flex-shrink-0" />
               <div className="leading-relaxed">
                 <strong>Safety First:</strong> Meet in public spaces. Your location data is never shared until you actively send an invite.
               </div>
             </div>
          </div>
        )}

        {/* VIRTUAL VIEW */}
        {activeType === 'virtual' && (
          <div className="animate-fade-in space-y-8">
             <div className="text-center max-w-2xl mx-auto mb-10">
               <h2 className="text-2xl font-bold text-slate-900 mb-3">Choose Your Vibe</h2>
               <p className="text-slate-500">
                 Virtual dates don't have to be awkward video calls. Pick a themed environment with curated music, interactive widgets, and guided icebreakers.
               </p>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {VIRTUAL_THEMES.map(theme => (
                  <div 
                    key={theme.id} 
                    className="bg-white rounded-2xl border-2 border-slate-100 p-5 md:p-6 cursor-pointer hover:border-purple-300 hover:shadow-xl transition-all group relative overflow-hidden flex flex-col h-full"
                    onClick={() => handleSelectOption(theme)}
                  >
                     <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${theme.color} flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform shrink-0`}>
                        {theme.icon}
                     </div>
                     <h3 className="font-bold text-base md:text-lg text-slate-900 mb-2">{theme.title}</h3>
                     <p className="text-xs md:text-sm text-slate-500 leading-relaxed mb-4 md:mb-6 flex-grow">{theme.desc}</p>
                     
                     <div className="flex items-center text-purple-600 text-sm font-bold group-hover:underline mt-auto">
                        Create Room <ArrowLeft className="rotate-180 ml-2 group-hover:translate-x-1 transition-transform" size={16}/>
                     </div>
                  </div>
                ))}
             </div>

             <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 md:p-12 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="relative z-10">
                   <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Just want to code?</h3>
                   <p className="text-sm sm:text-base text-slate-400 mb-6 sm:mb-8 max-w-md mx-auto">Skip the themes and jump straight into a simple, no-frills collaborative editor.</p>
                   
                   {checkingPermissions ? (
                      <div className="flex flex-col items-center justify-center gap-4 animate-fade-in">
                          <div className="flex gap-4 sm:gap-6">
                             <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-800 flex items-center justify-center relative">
                                <Camera className="text-green-400" size={24} />
                                <div className="absolute inset-0 border-2 border-green-500/50 rounded-full animate-ping"></div>
                             </div>
                             <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-800 flex items-center justify-center relative">
                                <Mic className="text-green-400" size={24} />
                                <div className="absolute inset-0 border-2 border-green-500/50 rounded-full animate-ping" style={{animationDelay: '0.2s'}}></div>
                             </div>
                          </div>
                          <p className="text-sm sm:text-base text-white font-medium animate-pulse">Requesting media permissions...</p>
                      </div>
                   ) : (
                       <>
                           <Button onClick={handleQuickStartSession} className="bg-white text-slate-900 hover:bg-slate-200 border-none px-6 sm:px-8 py-3 font-bold text-base sm:text-lg shadow-lg shadow-white/10 transition-transform hover:scale-105 w-full sm:w-auto">
                             <Video className="mr-2 text-slate-900" size={20}/> Enter Virtual Café
                           </Button>
                           <div className="flex items-center gap-4 mt-6 text-xs text-slate-500 justify-center">
                              <span className="flex items-center gap-1"><Camera size={14}/> Camera</span>
                              <span className="flex items-center gap-1"><Mic size={14}/> Microphone</span>
                           </div>
                       </>
                   )}
                </div>
             </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DatePlanner;