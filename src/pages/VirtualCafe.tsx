import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Music } from 'lucide-react';
import { Button, Card } from '../components/UI';
import { AppContext } from '../context/AppContext';
import { generateIcebreaker } from '../services/geminiService';

const VirtualCafe = () => {
  const navigate = useNavigate();
  const { state } = React.useContext(AppContext);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [musicOn, setMusicOn] = useState(false);
  const [icebreaker, setIcebreaker] = useState<string | null>(null);
  const [loadingIcebreaker, setLoadingIcebreaker] = useState(false);

  const getIcebreaker = async () => {
    setLoadingIcebreaker(true);
    const q = await generateIcebreaker("coding hobbies");
    setIcebreaker(q);
    setLoadingIcebreaker(false);
  };

  return (
    <div className="h-screen bg-slate-900 flex flex-col text-white">
      {/* Header */}
      <div className="h-16 border-b border-slate-800 flex justify-between items-center px-6">
         <div className="font-bold text-lg flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
            Virtual Café
         </div>
         <div className="text-sm text-slate-400">
           {state.user?.city || "Unknown Location"} • 72°F
         </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-grow flex flex-col md:flex-row p-4 gap-4 overflow-hidden relative">
        {/* Remote Video (Simulated) */}
        <div className="flex-1 bg-slate-800 rounded-2xl overflow-hidden relative shadow-2xl">
           <img 
             src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800" 
             className="w-full h-full object-cover opacity-90"
             alt="Partner"
           />
           <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
             Taylor Code
           </div>
        </div>

        {/* Local Video (Simulated) */}
        <div className="absolute bottom-8 right-8 w-32 h-24 md:w-48 md:h-36 bg-slate-700 rounded-xl overflow-hidden border-2 border-slate-600 shadow-xl z-10">
           {camOn ? (
             <img 
               src={state.user?.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=Me"} 
               className="w-full h-full object-cover"
               alt="You"
             />
           ) : (
             <div className="w-full h-full flex items-center justify-center text-slate-500 bg-slate-900">
               <VideoOff size={24} />
             </div>
           )}
           <div className="absolute bottom-2 left-2 text-xs font-bold text-white drop-shadow-md">You</div>
        </div>

        {/* Icebreaker Overlay */}
        {icebreaker && (
          <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl w-[90%] max-w-md text-center animate-fade-in shadow-xl z-20">
             <div className="text-xs text-brand-300 font-bold uppercase tracking-widest mb-2">Conversation Starter</div>
             <p className="text-xl font-medium">{icebreaker}</p>
             <button onClick={() => setIcebreaker(null)} className="absolute top-2 right-2 text-white/50 hover:text-white">×</button>
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="h-auto py-4 md:h-24 bg-slate-950 flex flex-wrap items-center justify-center gap-4 md:gap-6 px-4">
         <button 
           onClick={() => setMicOn(!micOn)}
           className={`p-3 md:p-4 rounded-full transition-all ${micOn ? 'bg-slate-800 hover:bg-slate-700' : 'bg-red-500/20 text-red-500'}`}
         >
           {micOn ? <Mic size={20} /> : <MicOff size={20} />}
         </button>
         
         <button 
           onClick={() => setCamOn(!camOn)}
           className={`p-3 md:p-4 rounded-full transition-all ${camOn ? 'bg-slate-800 hover:bg-slate-700' : 'bg-red-500/20 text-red-500'}`}
         >
           {camOn ? <Video size={20} /> : <VideoOff size={20} />}
         </button>

         <button 
           onClick={() => navigate('/dashboard')}
           className="p-3 md:p-4 rounded-full bg-red-600 hover:bg-red-700 text-white px-6 md:px-8 flex items-center gap-2 font-bold text-sm md:text-base"
         >
           <PhoneOff size={20} /> <span className="hidden sm:inline">End Date</span>
         </button>

         <div className="w-px h-10 bg-slate-800 mx-1 md:mx-2 hidden sm:block"></div>

         <button 
           onClick={getIcebreaker}
           disabled={loadingIcebreaker}
           className="p-3 md:p-4 rounded-full bg-brand-600 hover:bg-brand-500 text-white flex items-center gap-2 text-sm md:text-base"
           title="Get Icebreaker"
         >
           <MessageSquare size={20} />
           <span className="hidden sm:inline">{loadingIcebreaker ? "..." : "Icebreaker"}</span>
         </button>
         
         <button 
           onClick={() => setMusicOn(!musicOn)}
           className={`p-3 md:p-4 rounded-full transition-all ${musicOn ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}
           title="Lo-Fi Music"
         >
           <Music size={20} />
         </button>
      </div>
    </div>
  );
};

export default VirtualCafe;
