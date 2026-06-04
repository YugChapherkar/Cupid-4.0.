import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Coffee, Check, CheckCheck, Send, Loader2, MessageCircle, AlertCircle, ShieldAlert, X, Video, PhoneOff, Phone } from 'lucide-react';
import { Button, Card } from '../components/UI';
import { AppContext } from '../context/AppContext';
import { supabase } from '../services/supabaseClient';
import { generateSessionSummary } from '../services/geminiService';
import { Message } from '../types';

// Regex patterns for sensitive info
const SENSITIVE_PATTERNS = [
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/, // Email
  /(\+\d{1,3}[- ]?)?\d{10}/, // Phone simple
  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // Phone format
  /\b(credit|debit)\s?card\b/i,
  /\b(password|pwd|secret)\b/i
];

const SessionView = () => {
  const { state } = React.useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const matchId = location.pathname.split('/').pop() || '';
  const match = state.activeMatches.find(m => m.id === matchId);

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [sending, setSending] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  
  // WebRTC State
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'receiving' | 'connected'>('idle');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const channelRef = useRef<any>(null);
  const iceCandidateQueue = useRef<RTCIceCandidateInit[]>([]);
  const userIdRef = useRef(state.user?.id);
  const matchUserIdRef = useRef(match?.user.id);

  useEffect(() => {
    userIdRef.current = state.user?.id;
    matchUserIdRef.current = match?.user.id;
  }, [state.user?.id, match?.user.id]);
  
  // New State Features
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [showSensitiveWarning, setShowSensitiveWarning] = useState(false);
  const [pendingMessage, setPendingMessage] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);
  const lastTypingSentRef = useRef<number>(0);

  // WebRTC Functions
  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    
    pc.onicecandidate = (event) => {
      if (event.candidate && channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'webrtc',
          payload: {
            targetUserId: matchUserIdRef.current,
            type: 'ice-candidate',
            candidate: event.candidate
          }
        });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    return pc;
  };

  const startCall = async () => {
    setCallStatus('calling');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      localStreamRef.current = stream;

      const pc = createPeerConnection();
      pcRef.current = pc;

      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'webrtc',
          payload: {
            targetUserId: matchUserIdRef.current,
            type: 'offer',
            sdp: offer
          }
        });
      }
    } catch (err) {
      console.error("Error starting call:", err);
      setCallStatus('idle');
    }
  };

  const acceptCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      localStreamRef.current = stream;

      const pc = pcRef.current;
      if (!pc) return;

      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'webrtc',
          payload: {
            targetUserId: matchUserIdRef.current,
            type: 'answer',
            sdp: answer
          }
        });
      }
      setCallStatus('connected');
    } catch (err) {
      console.error("Error accepting call:", err);
      endCall(true);
    }
  };

  const endCall = (broadcast = true) => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
    setCallStatus('idle');

    if (broadcast && channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'webrtc',
        payload: {
          targetUserId: matchUserIdRef.current,
          type: 'end-call'
        }
      });
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async (msgs: Message[]) => {
    if (!state.user || !match) return;

    // Find unread messages from partner
    const unreadIds = msgs
      .filter(m => m.senderId !== state.user?.id && !m.readAt)
      .map(m => m.id);

    if (unreadIds.length > 0) {
      // Optimistic update
      setMessages(prev => prev.map(m => 
        unreadIds.includes(m.id) ? { ...m, readAt: new Date().toISOString() } : m
      ));

      // DB Update
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .in('id', unreadIds);
    }
  };

  // Realtime Chat Subscription & Logic
  useEffect(() => {
    if (!matchId || !state.user) return;

    let mounted = true;

    // 1. Fetch Chat History
    const fetchMessages = async () => {
      setLoadingMessages(true);
      setFetchError(false);
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.warn("Supabase not set up, using local state for demo.");
        if (mounted) {
          setMessages([
            { id: 'demo1', senderId: match.user.id, text: `Hey! I saw your profile and would love to pair up.`, timestamp: Date.now() - 60000 }
          ]);
          setLoadingMessages(false);
        }
        return;
      }

      if (data && mounted) {
        const mappedMessages = data.map(m => ({
          id: m.id,
          senderId: m.sender_id,
          text: m.text,
          timestamp: new Date(m.created_at).getTime(),
          readAt: m.read_at
        }));
        
        setMessages(mappedMessages);
        markMessagesAsRead(mappedMessages);
      }
      if (mounted) setLoadingMessages(false);
    };
    
    fetchMessages();

    // 2. Realtime Subscriptions (Broadcast for typing + Postgres Changes)
    const channel = supabase.channel(`session:${matchId}`);
    channelRef.current = channel;

    channel
      // Listen for typing events
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.userId !== state.user?.id) {
          setIsPartnerTyping(true);
          // Auto clear typing indicator after 3 seconds of no events
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setIsPartnerTyping(false), 3000);
        }
      })
      // Listen for WebRTC signaling
      .on('broadcast', { event: 'webrtc' }, async (payload) => {
        const data = payload.payload;
        if (data.targetUserId !== userIdRef.current) return;

        if (data.type === 'offer') {
          setCallStatus('receiving');
          pcRef.current = createPeerConnection();
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
          iceCandidateQueue.current.forEach(candidate => {
            pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
          });
          iceCandidateQueue.current = [];
        } else if (data.type === 'answer') {
          if (pcRef.current) {
            await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
            setCallStatus('connected');
            iceCandidateQueue.current.forEach(candidate => {
              pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
            });
            iceCandidateQueue.current = [];
          }
        } else if (data.type === 'ice-candidate') {
          if (pcRef.current && pcRef.current.remoteDescription) {
            pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(console.error);
          } else {
            iceCandidateQueue.current.push(data.candidate);
          }
        } else if (data.type === 'end-call') {
          endCall(false);
        }
      })
      // Listen for new messages
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `match_id=eq.${matchId}` }, (payload) => {
        const newMsg = payload.new;
        if (!mounted) return;
        
        // If partner sent a message, stop typing indicator
        if (newMsg.sender_id !== state.user?.id) {
          setIsPartnerTyping(false);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        }

        const formattedMsg: Message = {
            id: newMsg.id,
            senderId: newMsg.sender_id,
            text: newMsg.text,
            timestamp: new Date(newMsg.created_at).getTime(),
            readAt: newMsg.read_at
        };

        setMessages(prev => {
           if (prev.some(m => m.id === newMsg.id)) return prev;
           // If incoming message is from partner, mark it read immediately since we are viewing
           if (newMsg.sender_id !== state.user?.id) {
             markMessagesAsRead([formattedMsg]);
           }
           return [...prev, formattedMsg];
        });
      })
      // Listen for updates (Read Receipts)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter: `match_id=eq.${matchId}` }, (payload) => {
        const updatedMsg = payload.new;
        setMessages(prev => prev.map(m => m.id === updatedMsg.id ? { ...m, readAt: updatedMsg.read_at } : m));
      })
      .subscribe();

    return () => { 
      mounted = false;
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      supabase.removeChannel(channel); 
      endCall(false);
    };
  }, [matchId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loadingMessages, isPartnerTyping]);

  // Handle Typing Broadcast
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    
    // Throttle typing events to once per second
    const now = Date.now();
    if (now - lastTypingSentRef.current > 1000) {
      lastTypingSentRef.current = now;
      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'typing',
          payload: { userId: state.user?.id }
        });
      }
    }
  };

  const handlePreSend = () => {
    if (!input.trim() || sending) return;

    // Check for sensitive info
    const hasSensitiveInfo = SENSITIVE_PATTERNS.some(regex => regex.test(input));

    if (hasSensitiveInfo) {
      setPendingMessage(input);
      setShowSensitiveWarning(true);
    } else {
      performSend(input);
    }
  };

  const performSend = async (textToSend: string) => {
    if (!state.user) return;
    
    setInput('');
    setSending(true);
    setShowSensitiveWarning(false);
    setPendingMessage('');
    
    const { error } = await supabase.from('messages').insert({
      match_id: matchId,
      sender_id: state.user.id,
      text: textToSend
    });

    setSending(false);

    if (error) {
      console.warn("Supabase not set up, falling back to local state.");
      const demoMsg: Message = {
        id: Math.random().toString(),
        senderId: state.user.id,
        text: textToSend,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, demoMsg]);
    }
  };

  const handleEndSession = async () => {
    if (!match) return;
    setLoadingSummary(true);
    setShowSummary(true);
    
    const transcript = messages.length > 0 
        ? messages.map(m => `${m.senderId === state.user?.id ? 'Me' : match.user.name}: ${m.text}`).join('\n')
        : "No conversation yet.";
        
    const summary = await generateSessionSummary(transcript);
    setSummaryText(summary);
    setLoadingSummary(false);
  };

  // --- Sub-Components ---

  const SensitiveWarningModal = () => {
    if (!showSensitiveWarning) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-pop-in border-t-4 border-amber-500">
           <div className="flex items-center gap-3 mb-4 text-amber-600">
             <div className="bg-amber-100 p-2 rounded-full">
               <ShieldAlert size={28} />
             </div>
             <h3 className="font-bold text-lg text-slate-900">Safety Check</h3>
           </div>
           <p className="text-slate-600 mb-6 leading-relaxed text-sm">
             This message appears to contain sensitive information (like phone numbers, emails, or passwords). 
             <br/><br/>
             <strong>Are you sure you want to send this now?</strong>
           </p>
           <div className="flex gap-3">
             <Button variant="outline" fullWidth onClick={() => setShowSensitiveWarning(false)} className="border-slate-200 hover:bg-slate-50">
               Edit Message
             </Button>
             <Button fullWidth onClick={() => performSend(pendingMessage)} className="bg-amber-500 hover:bg-amber-600 border-none text-white shadow-md shadow-amber-500/20">
               Send Anyway
             </Button>
           </div>
        </div>
      </div>
    );
  };

  // --- Render ---

  if (!match) {
      return (
        <div className="h-screen flex flex-col items-center justify-center p-8 text-center bg-slate-50">
           <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4 animate-pulse">
             <MessageCircle className="text-slate-400" />
           </div>
           <h2 className="text-xl font-bold text-slate-700 mb-2">Finding Match...</h2>
           <Button variant="outline" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      );
  }

  if (showSummary) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl bg-white p-8 animate-fade-in shadow-xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Check className="text-green-600" size={32} />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Session Complete!</h2>
            <p className="text-slate-500">Great conversation. Here is a summary.</p>
          </div>

          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">AI Summary</h3>
            {loadingSummary ? (
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded"></div>
                  <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                </div>
              </div>
            ) : (
              <p className="text-slate-700 leading-relaxed">{summaryText}</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate('/dashboard')} variant="outline">Back to Dashboard</Button>
            <Button onClick={() => navigate('/date-planner')}>
              <Coffee size={18} /> Plan a Date
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      <SensitiveWarningModal />
      
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="p-2 -ml-2 text-slate-500 hover:text-brand-600" onClick={() => navigate('/dashboard')}>
             <ArrowRight className="rotate-180" size={20} />
          </Button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={match.user.avatarUrl} className="w-10 h-10 rounded-full object-cover border border-slate-200" alt={match.user.name} />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h1 className="font-bold text-slate-900 leading-tight">{match.user.name}</h1>
              <p className="text-xs text-slate-500">Online</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          {callStatus === 'idle' && (
            <Button variant="outline" className="text-sm hidden sm:flex" onClick={startCall}>
               <Video size={16} className="mr-2" /> Video Call
            </Button>
          )}
          <Button variant="outline" className="text-sm hidden sm:flex" onClick={() => navigate('/date-planner')}>
             <Coffee size={16} className="mr-2" /> Plan Date
          </Button>
          <Button variant="danger" className="text-sm" onClick={handleEndSession}>
            End Chat
          </Button>
        </div>
      </header>

      {/* Main Chat Area */}
      <div className="flex-grow flex flex-col max-w-5xl mx-auto w-full bg-white shadow-2xl md:my-6 md:rounded-2xl overflow-hidden border border-slate-200">
        
        {/* Video Call Area */}
        {callStatus !== 'idle' && (
          <div className="bg-slate-900 p-4 flex flex-col items-center justify-center relative border-b border-slate-800 shrink-0">
            <div className="relative w-full max-w-3xl aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
              <video 
                ref={video => { if (video) video.srcObject = remoteStream; }} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover" 
              />
              <video 
                ref={video => { if (video) video.srcObject = localStream; }} 
                autoPlay 
                playsInline 
                muted 
                className="absolute bottom-4 right-4 w-1/4 aspect-video bg-slate-800 rounded-lg object-cover border-2 border-white shadow-md" 
              />
              
              {callStatus === 'calling' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 text-white">
                  <Loader2 className="animate-spin w-12 h-12 mb-4" />
                  <h3 className="text-xl font-bold">Calling {match.user.name}...</h3>
                  <Button variant="danger" className="mt-6" onClick={() => endCall(true)}>
                    <PhoneOff size={18} className="mr-2" /> Cancel
                  </Button>
                </div>
              )}

              {callStatus === 'receiving' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-white">
                  <div className="w-20 h-20 rounded-full overflow-hidden mb-4 border-4 border-brand-500 animate-pulse">
                    <img src={match.user.avatarUrl} alt={match.user.name} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-xl font-bold mb-6">{match.user.name} is calling...</h3>
                  <div className="flex gap-4">
                    <Button className="bg-green-500 hover:bg-green-600 border-none" onClick={acceptCall}>
                      <Phone size={18} className="mr-2" /> Accept
                    </Button>
                    <Button variant="danger" onClick={() => endCall(true)}>
                      <PhoneOff size={18} className="mr-2" /> Decline
                    </Button>
                  </div>
                </div>
              )}

              {callStatus === 'connected' && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
                  <Button variant="danger" className="rounded-full px-6" onClick={() => endCall(true)}>
                    <PhoneOff size={18} className="mr-2" /> End Call
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Messages List */}
        <div className="flex-grow p-4 md:p-6 overflow-y-auto space-y-6 bg-slate-50/50">
           {loadingMessages && (
              <div className="flex justify-center pt-20 text-slate-400">
                <Loader2 className="animate-spin w-8 h-8" />
              </div>
           )}
           
           {!loadingMessages && messages.length === 0 && (
             <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 opacity-80">
               <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                 <MessageCircle size={32} className="text-slate-300" />
               </div>
               <p className="font-medium text-slate-600">No messages yet</p>
               <p className="text-sm max-w-xs mt-1">Start the conversation with {match.user.name}.</p>
             </div>
           )}

           {messages.map((msg, index) => {
             const isMe = msg.senderId === state.user?.id;
             const showAvatar = !isMe && (index === 0 || messages[index-1].senderId !== msg.senderId);
             
             return (
               <div key={msg.id} className={`flex gap-3 ${isMe ? 'justify-end' : 'justify-start'}`}>
                 {!isMe && (
                   <div className="w-8 flex-shrink-0 flex flex-col justify-end">
                     {showAvatar ? (
                       <img src={match.user.avatarUrl} className="w-8 h-8 rounded-full border border-slate-200" alt={match.user.name} />
                     ) : <div className="w-8" />}
                   </div>
                 )}
                 
                 <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%] sm:max-w-[70%]`}>
                   <div className={`px-4 py-3 text-sm shadow-sm leading-relaxed ${
                     isMe 
                       ? 'bg-brand-500 text-white rounded-2xl rounded-br-none' 
                       : 'bg-white text-slate-700 border border-slate-100 rounded-2xl rounded-bl-none'
                   }`}>
                     {msg.text}
                   </div>
                   
                   {/* Metadata & Read Receipts */}
                   <div className="flex items-center gap-1 mt-1 px-1">
                      <span className="text-[10px] text-slate-400 opacity-80">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isMe && (
                        <span title={msg.readAt ? `Read at ${new Date(msg.readAt).toLocaleTimeString()}` : 'Sent'}>
                          {msg.readAt ? (
                            <CheckCheck size={14} className="text-brand-500" />
                          ) : (
                            <Check size={14} className="text-slate-300" />
                          )}
                        </span>
                      )}
                   </div>
                 </div>
               </div>
             );
           })}
           
           {/* Typing Indicator Bubble */}
           {isPartnerTyping && (
             <div className="flex gap-3 justify-start animate-fade-in">
                <div className="w-8 flex-shrink-0 flex flex-col justify-end">
                  <img src={match.user.avatarUrl} className="w-8 h-8 rounded-full border border-slate-200" alt={match.user.name} />
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-none px-4 py-4 shadow-sm flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                   <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                   <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
             </div>
           )}

           <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100">
          <div className="relative flex items-center gap-2">
            <input 
              type="text" 
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === 'Enter' && handlePreSend()}
              placeholder="Type your message..."
              disabled={sending}
              className="flex-grow bg-slate-100 text-slate-900 placeholder:text-slate-400 border-none rounded-full px-6 py-3.5 focus:ring-2 focus:ring-brand-500 outline-none transition-all disabled:opacity-50"
            />
            <button 
              onClick={handlePreSend} 
              disabled={!input.trim() || sending}
              className={`p-3.5 rounded-full transition-all shadow-md flex-shrink-0 ${
                !input.trim() || sending
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                  : 'bg-brand-500 text-white hover:bg-brand-600 hover:scale-105'
              }`}
            >
              {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="ml-0.5" />}
            </button>
          </div>
          <div className="text-center mt-2 flex justify-center items-center gap-2">
            <p className="text-[10px] text-slate-400">
              Messages are secured and encrypted end-to-end.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionView;