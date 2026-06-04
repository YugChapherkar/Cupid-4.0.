import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Heart, Download, FileText, Printer, ArrowRight, Loader2 } from 'lucide-react';
import { Button, Card } from '../components/UI';
import { AppContext } from '../context/AppContext';
import { rewriteProposal } from '../services/geminiService';
import { Layout } from '../components/Layout';

const ProposalBuilder = () => {
  const { setState } = React.useContext(AppContext);
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Inputs, 2: Preview
  const [inputs, setInputs] = useState({ name: '', memory: '', message: '' });
  const [generatedProposal, setGeneratedProposal] = useState('');
  const [loading, setLoading] = useState(false);

  // Unlock logic simulation
  useEffect(() => {
    setState(prev => ({ ...prev, proposalUnlocked: true }));
  }, [setState]);

  const handleGenerate = async () => {
    if (!inputs.name || !inputs.memory || !inputs.message) return;
    setLoading(true);
    const text = await rewriteProposal(inputs.name, inputs.memory, inputs.message);
    setGeneratedProposal(text);
    setLoading(false);
    setStep(2);
  };

  return (
    <Layout>
      <div className="max-w-4xl w-full mx-auto">
        <div className="text-center mb-10 animate-fade-in-up">
           <div className="inline-flex items-center justify-center w-20 h-20 bg-rose-50 rounded-full mb-6 border border-rose-100 shadow-sm transition-transform duration-500 hover:scale-110 group cursor-default">
              <Heart className="text-rose-500 fill-rose-500 group-hover:animate-pulse-soft" size={40} />
           </div>
           <h1 className="text-4xl md:text-5xl font-serif text-slate-900 mb-4 tracking-tight">Proposal Builder</h1>
           <p className="text-slate-500 text-lg max-w-xl mx-auto leading-relaxed">
             Turn your connection into a beautiful, lasting moment. Share your story, and let our AI craft the perfect words.
           </p>
        </div>

        <Card className="shadow-2xl shadow-rose-200/40 overflow-hidden border-rose-100 bg-white transition-all duration-500 hover:shadow-rose-300/50 min-h-[600px] flex flex-col">
           {step === 1 ? (
             <div className="p-8 md:p-12 animate-fade-in flex-grow flex flex-col justify-center">
               <div className="max-w-2xl w-full mx-auto space-y-8">
                 
                 <div className="space-y-6">
                   <div className="group transition-all duration-300 focus-within:translate-x-1 animate-fade-in-up [animation-delay:100ms] opacity-0 [animation-fill-mode:forwards]">
                     <label className="block text-sm font-bold text-slate-700 mb-2 ml-1 transition-colors group-focus-within:text-rose-600">Who is this for?</label>
                     <input 
                       className="w-full p-4 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 outline-none transition-all placeholder:text-slate-300 hover:border-slate-300 shadow-sm"
                       value={inputs.name}
                       onChange={e => setInputs({...inputs, name: e.target.value})}
                       placeholder="e.g. Taylor"
                     />
                   </div>
                   
                   <div className="group transition-all duration-300 focus-within:translate-x-1 animate-fade-in-up [animation-delay:200ms] opacity-0 [animation-fill-mode:forwards]">
                     <label className="block text-sm font-bold text-slate-700 mb-2 ml-1 transition-colors group-focus-within:text-rose-600">Favorite shared memory</label>
                     <input 
                       className="w-full p-4 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 outline-none transition-all placeholder:text-slate-300 hover:border-slate-300 shadow-sm"
                       value={inputs.memory}
                       onChange={e => setInputs({...inputs, memory: e.target.value})}
                       placeholder="e.g. When we stayed up all night debugging the auth service..."
                     />
                   </div>
                   
                   <div className="group transition-all duration-300 focus-within:translate-x-1 animate-fade-in-up [animation-delay:300ms] opacity-0 [animation-fill-mode:forwards]">
                     <label className="block text-sm font-bold text-slate-700 mb-2 ml-1 transition-colors group-focus-within:text-rose-600">Your message (draft)</label>
                     <textarea 
                       className="w-full p-4 bg-white text-slate-900 border border-slate-200 rounded-xl h-48 focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 outline-none transition-all resize-none placeholder:text-slate-300 hover:border-slate-300 shadow-sm leading-relaxed"
                       value={inputs.message}
                       onChange={e => setInputs({...inputs, message: e.target.value})}
                       placeholder="Write from the heart... our AI will help polish it into something magical."
                     />
                   </div>
                 </div>
                 
                 <div className="bg-rose-50/80 border border-rose-100 p-5 rounded-xl flex gap-4 items-start transform transition-all hover:scale-[1.01] hover:bg-rose-50 animate-fade-in-up [animation-delay:400ms] opacity-0 [animation-fill-mode:forwards]">
                   <div className="bg-white p-2 rounded-full shadow-sm text-rose-500 mt-0.5 animate-pulse-soft">
                     <Sparkles size={18} />
                   </div>
                   <div>
                     <h4 className="font-bold text-rose-900 text-sm mb-1">AI Magic</h4>
                     <p className="text-sm text-rose-700/80 leading-relaxed">
                       Our Gemini AI will refine your draft to make it flow perfectly while keeping your personal touch and authentic voice.
                     </p>
                   </div>
                 </div>

                 <div className="pt-4 animate-fade-in-up [animation-delay:500ms] opacity-0 [animation-fill-mode:forwards]">
                   <Button 
                     onClick={handleGenerate} 
                     fullWidth 
                     className="py-4 text-lg bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-500/30 transition-all active:scale-[0.98] hover:shadow-rose-500/50 hover:-translate-y-0.5" 
                     disabled={loading || !inputs.name || !inputs.message}
                   >
                     {loading ? (
                       <span className="flex items-center gap-2">
                         <Loader2 className="animate-spin" /> Polishing your words...
                       </span>
                     ) : (
                       <span className="flex items-center gap-2">
                         Generate Proposal <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
                       </span>
                     )}
                   </Button>
                 </div>

               </div>
             </div>
           ) : (
             <div className="flex flex-col md:flex-row flex-grow animate-fade-in">
               {/* Preview Side */}
               <div className="flex-grow p-8 md:p-16 bg-white flex flex-col justify-center items-center text-center relative overflow-hidden">
                 {/* Decorative background elements */}
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-300 via-pink-400 to-rose-300"></div>
                 <div className="absolute top-10 left-10 opacity-5 pointer-events-none animate-float"><Heart size={100} /></div>
                 <div className="absolute bottom-10 right-10 opacity-5 pointer-events-none animate-float-delayed"><Heart size={80} /></div>
                 
                 <div className="max-w-lg w-full relative z-10 animate-fade-in-up">
                   <div className="mb-10 inline-block animate-pop-in [animation-delay:200ms] opacity-0 [animation-fill-mode:forwards]">
                      <div className="relative group cursor-pointer">
                        <Heart className="fill-rose-500 text-rose-600 w-20 h-20 drop-shadow-lg transition-transform duration-500 group-hover:scale-110" />
                        <Sparkles className="absolute -top-2 -right-4 text-amber-400 animate-pulse" size={24} />
                      </div>
                   </div>
                   
                   <div className="font-serif text-xl md:text-2xl text-slate-800 leading-loose whitespace-pre-wrap italic animate-fade-in [animation-delay:400ms] opacity-0 [animation-fill-mode:forwards]">
                     "{generatedProposal}"
                   </div>
                   
                   <div className="mt-16 flex flex-col items-center gap-4 opacity-0 animate-fade-in [animation-delay:800ms] [animation-fill-mode:forwards]">
                     <div className="h-px w-24 bg-rose-200"></div>
                     <p className="text-sm text-rose-400 font-medium uppercase tracking-widest">For {inputs.name}</p>
                   </div>
                 </div>

                 {/* Download/Print Actions (Floating) */}
                 <div className="absolute bottom-8 left-0 w-full flex justify-center gap-4 px-8 opacity-0 animate-fade-in-up [animation-delay:1000ms] [animation-fill-mode:forwards]">
                   <Button variant="outline" onClick={() => window.print()} className="bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm border-slate-200 transition-transform hover:scale-105 active:scale-95">
                      <Printer size={18} /> Print
                   </Button>
                   <Button onClick={() => alert("Downloaded PDF!")} className="shadow-lg shadow-rose-500/20 transition-transform hover:scale-105 active:scale-95 hover:shadow-rose-500/40">
                      <Download size={18} /> Download PDF
                   </Button>
                 </div>
               </div>
               
               {/* Sidebar Controls */}
               <div className="md:w-80 bg-slate-50 border-l border-slate-100 p-8 flex flex-col gap-6 relative z-20 animate-fade-in [animation-delay:200ms] opacity-0 [animation-fill-mode:forwards]">
                 <div>
                   <h3 className="font-bold text-slate-900 mb-1 text-lg">Actions</h3>
                   <p className="text-sm text-slate-500">Refine or export your proposal.</p>
                 </div>
                 
                 <div className="space-y-3">
                   <Button variant="outline" fullWidth onClick={() => setStep(1)} className="bg-white justify-start h-12 text-slate-600 border-slate-200 hover:border-rose-300 hover:text-rose-600 transition-all hover:translate-x-1 hover:shadow-sm">
                     <FileText size={18}/> Edit Inputs
                   </Button>
                   <Button variant="ghost" fullWidth onClick={handleGenerate} className="justify-start h-12 text-slate-600 hover:bg-white hover:text-brand-600 transition-all hover:translate-x-1 hover:shadow-sm">
                     <Sparkles size={18}/> Regenerate
                   </Button>
                 </div>

                 <div className="mt-auto pt-6 border-t border-slate-200">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <p className="text-xs text-blue-800 text-center leading-relaxed">
                        <strong>Privacy Note:</strong><br/>
                        This page is private. We do not store this generated text permanently after you leave this page.
                      </p>
                    </div>
                 </div>
               </div>
             </div>
           )}
        </Card>
      </div>
    </Layout>
  );
};

export default ProposalBuilder;