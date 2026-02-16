
import React, { useState, useEffect, useRef } from 'react';
import { Mic, Send, Bot, Sparkles, MoreVertical, FileAudio, Keyboard, X, Download, Play, Square, Pause, BrainCircuit, FileText, MessageSquare, ChevronRight, History, FileJson } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMessage {
    role: 'user' | 'agent';
    type: 'text' | 'audio';
    text?: string;
    audioSrc?: string;
    duration?: string;
    timestamp: number;
}

const AIAgentPanel = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [showVoiceMenu, setShowVoiceMenu] = useState(false);
    const [voiceMode, setVoiceMode] = useState<'idle' | 'transcribing' | 'recording'>('idle');
    const [recordingTime, setRecordingTime] = useState(0);

    // Smart Assistant Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'summary' | 'grok' | 'history'>('summary');
    const [summaryPoints, setSummaryPoints] = useState<string[]>([]);
    const [grokQuery, setGrokQuery] = useState('');
    const [grokResponse, setGrokResponse] = useState('');
    const [isGrokThinking, setIsGrokThinking] = useState(false);

    const bottomRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem('agency_client_chat');
        if (saved) {
            setMessages(JSON.parse(saved));
        } else {
            const welcomeMsg: ChatMessage = {
                role: 'agent',
                type: 'text',
                text: 'Hello! I am your SecureShare assistant. Use voice or text to document your needs.',
                timestamp: Date.now()
            };
            setMessages([welcomeMsg]);
            localStorage.setItem('agency_client_chat', JSON.stringify([welcomeMsg]));
        }

        const handleStorage = () => {
            const updated = localStorage.getItem('agency_client_chat');
            if (updated) setMessages(JSON.parse(updated));
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (isModalOpen && activeTab === 'summary') {
            const points = [
                `Session started at ${new Date(messages[0]?.timestamp || Date.now()).toLocaleTimeString()}`,
                `Total interactions: ${messages.length}`,
                messages.filter(m => m.type === 'audio').length > 0 ? "Voice notes detected and transcribed." : "Text-based communication preferred.",
                "Key Topics: Content Security, Licensing, Digital Asset Management."
            ];
            setSummaryPoints(points);
        }
    }, [isModalOpen, activeTab, messages]);

    const handleGrokAsk = () => {
        if (!grokQuery.trim()) return;
        setIsGrokThinking(true);
        setTimeout(() => {
            setGrokResponse(`[Grok API] Based on your project context, I recommend using dynamic watermarking for your video assets. The "Project Alpha" files seem critical—ensure you set a 24-hour expiration on the shared links.`);
            setIsGrokThinking(false);
        }, 1500);
    };

    const downloadTranscript = () => {
        const textContent = messages.map(m => {
            const time = new Date(m.timestamp).toLocaleString();
            const sender = m.role === 'user' ? 'Client' : 'Nexus AI';
            const content = m.type === 'audio' ? `[Voice Message - Duration: ${m.duration || 'N/A'}]` : m.text;
            return `[${time}] ${sender}: ${content}`;
        }).join('\n\n');

        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Nexus_Session_Transcript_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const downloadJSON = () => {
        const jsonContent = JSON.stringify(messages, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Nexus_Session_Data_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // ... (Voice Logic same as before) ...
    const saveMessage = (newMsg: ChatMessage) => {
        setMessages(prev => {
            const updated = [...prev, newMsg];
            localStorage.setItem('agency_client_chat', JSON.stringify(updated));
            window.dispatchEvent(new Event('storage'));
            return updated;
        });
    };

    const handleSend = () => {
        if (!inputValue.trim()) return;
        const userMsg: ChatMessage = { role: 'user', type: 'text', text: inputValue, timestamp: Date.now() };
        saveMessage(userMsg);
        setInputValue('');
        setTimeout(() => {
            const responses = [
                "I've logged that note in the secure ledger.",
                "Understood. This conversation is being archived for the Agency Admin.",
                "Processing your request securely."
            ];
            saveMessage({
                role: 'agent',
                type: 'text',
                text: responses[Math.floor(Math.random() * responses.length)],
                timestamp: Date.now()
            });
        }, 1000);
    };

    const startVoiceToText = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) { alert("Browser not supported"); return; }
        setShowVoiceMenu(false);
        setVoiceMode('transcribing');
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.onresult = (e: any) => setInputValue(e.results[0][0].transcript);
        recognitionRef.current.onend = () => setVoiceMode('idle');
        recognitionRef.current.start();
    };

    const stopVoiceToText = () => { recognitionRef.current?.stop(); setVoiceMode('idle'); };

    const startRecording = async () => {
        if (!navigator.mediaDevices) return;
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];
        mediaRecorderRef.current.ondataavailable = e => audioChunksRef.current.push(e.data);
        mediaRecorderRef.current.onstop = () => {
            const url = URL.createObjectURL(new Blob(audioChunksRef.current, { type: 'audio/mp3' }));
            const duration = `${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')}`;
            saveMessage({ role: 'user', type: 'audio', audioSrc: url, duration, timestamp: Date.now() });
            stream.getTracks().forEach(t => t.stop());
        };
        mediaRecorderRef.current.start();
        setVoiceMode('recording');
        setShowVoiceMenu(false);
        setRecordingTime(0);
        timerRef.current = setInterval(() => setRecordingTime(p => p + 1), 1000);
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        if (timerRef.current) clearInterval(timerRef.current);
        setVoiceMode('idle');
    };

    const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

    return (
        <div className="flex flex-col h-full bg-[#111] border-l border-white/5 relative">
            {/* Agent Avatar Area */}
            <div className="h-28 border-b border-white/5 relative overflow-hidden flex items-center justify-center bg-gradient-to-b from-cyan-900/10 to-transparent flex-shrink-0">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                <div className="relative text-center z-10 cursor-pointer group" onClick={() => setIsModalOpen(true)}>
                    <div className={`w-14 h-14 mx-auto rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-1 transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] ${voiceMode !== 'idle' ? 'scale-110 shadow-[0_0_30px_rgba(6,182,212,0.4)]' : ''}`}>
                        <Bot className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h3 className="text-white font-bold flex items-center justify-center gap-2 text-xs">Nexus AI <Sparkles className="w-3 h-3 text-yellow-400" /></h3>
                    <span className="text-[9px] text-green-400 font-mono block mt-0.5 group-hover:text-cyan-300 transition-colors">
                        Click for Assistant
                    </span>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-cyan-600 text-white rounded-br-none border border-cyan-500' : 'bg-gray-800 text-gray-100 rounded-bl-none border border-gray-700'}`}>
                            {msg.type === 'text' && msg.text}
                            {msg.type === 'audio' && (
                                <div className="flex items-center gap-3 min-w-[200px]">
                                    <div className="p-2 bg-black/20 rounded-full cursor-pointer" onClick={() => msg.audioSrc && new Audio(msg.audioSrc).play()}><Play className="w-4 h-4 fill-current" /></div>
                                    <div className="flex-1"><div className="h-1 bg-white/30 rounded-full w-full mb-1"><div className="h-1 bg-white rounded-full w-2/3" /></div><span className="text-xs opacity-70">{msg.duration} Voice Note</span></div>
                                    <a href={msg.audioSrc} download className="p-1 hover:bg-white/10 rounded"><Download className="w-4 h-4" /></a>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-white/5 relative z-20">
                {showVoiceMenu && (
                    <div className="absolute bottom-14 right-4 bg-[#1a1a20] border border-white/10 rounded-xl shadow-2xl min-w-[200px] z-50">
                        <button onClick={startRecording} className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3 text-sm text-cyan-400 border-b border-white/5"><FileAudio className="w-4 h-4" /> Send Voice Message</button>
                        <button onClick={startVoiceToText} className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3 text-sm text-white"><Keyboard className="w-4 h-4" /> Voice to Text</button>
                    </div>
                )}
                {voiceMode === 'idle' ? (
                    <div className="relative">
                        <input value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Ask Nexus..." className="w-full bg-black/40 border border-white/10 rounded-xl pl-4 pr-20 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50" />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <button onClick={() => setShowVoiceMenu(!showVoiceMenu)} className="p-1.5 text-gray-400 hover:text-white"><Mic className="w-4 h-4" /></button>
                            <button onClick={handleSend} className="p-1.5 text-cyan-400 hover:text-cyan-300"><Send className="w-4 h-4" /></button>
                        </div>
                    </div>
                ) : (
                    <div className="w-full bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 flex items-center justify-between text-white animate-pulse">
                        <span className="flex items-center gap-2 text-sm font-medium"><div className="w-2 h-2 rounded-full bg-red-500 animate-ping" /> {voiceMode === 'transcribing' ? 'Listening...' : `Recording ${formatTime(recordingTime)}`}</span>
                        <button onClick={voiceMode === 'transcribing' ? stopVoiceToText : stopRecording} className="p-1 hover:bg-white/10 rounded"><Square className="w-4 h-4 fill-white" /></button>
                    </div>
                )}
                {showVoiceMenu && <div className="fixed inset-0 z-10" onClick={() => setShowVoiceMenu(false)} />}
            </div>

            {/* SMART ASSISTANT MODAL */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-lg bg-[#111] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[600px]">
                            {/* Header */}
                            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-cyan-950/20">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-cyan-500/20 rounded-lg"><BrainCircuit className="w-5 h-5 text-cyan-400" /></div>
                                    <div>
                                        <h3 className="text-white font-bold">Nexus Smart Assistant</h3>
                                        <p className="text-[10px] text-cyan-400/70 uppercase tracking-wider">Powered by Grok API</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
                            </div>

                            {/* Tabs */}
                            <div className="flex border-b border-white/10">
                                <button onClick={() => setActiveTab('summary')} className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'summary' ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5' : 'border-transparent text-gray-400 hover:text-white'}`}>
                                    <div className="flex items-center justify-center gap-2"><FileText className="w-4 h-4" /> Summary</div>
                                </button>
                                <button onClick={() => setActiveTab('grok')} className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'grok' ? 'border-purple-500 text-purple-400 bg-purple-500/5' : 'border-transparent text-gray-400 hover:text-white'}`}>
                                    <div className="flex items-center justify-center gap-2"><Sparkles className="w-4 h-4" /> Ask Grok</div>
                                </button>
                                <button onClick={() => setActiveTab('history')} className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'history' ? 'border-green-500 text-green-400 bg-green-500/5' : 'border-transparent text-gray-400 hover:text-white'}`}>
                                    <div className="flex items-center justify-center gap-2"><History className="w-4 h-4" /> History</div>
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 p-6 overflow-y-auto no-scrollbar">
                                {activeTab === 'summary' && (
                                    <div className="space-y-4">
                                        <h4 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Current Session Intelligence</h4>
                                        {summaryPoints.map((point, i) => (
                                            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex gap-3 p-3 bg-white/5 rounded-lg border border-white/5">
                                                <div className="mt-1"><div className="w-1.5 h-1.5 rounded-full bg-cyan-500" /></div>
                                                <p className="text-sm text-gray-300 leading-relaxed">{point}</p>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}

                                {activeTab === 'grok' && (
                                    <div className="flex flex-col h-full">
                                        {grokResponse ? (
                                            <div className="flex-1 mb-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                                                <div className="flex items-center gap-2 mb-2 text-purple-400 text-xs font-bold uppercase"><Bot className="w-3 h-3" /> Grok Response</div>
                                                <p className="text-sm text-gray-200 leading-relaxed">{grokResponse}</p>
                                            </div>
                                        ) : (
                                            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                                                <BrainCircuit className="w-12 h-12 text-purple-500 mb-3" />
                                                <p className="text-sm text-gray-400">Ask me anything about your secure files.</p>
                                            </div>
                                        )}
                                        <div className="relative mt-auto">
                                            <input value={grokQuery} onChange={e => setGrokQuery(e.target.value)} placeholder="Ask a question..." className="w-full bg-black/50 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-purple-500/50" onKeyDown={e => e.key === 'Enter' && handleGrokAsk()} />
                                            <button onClick={handleGrokAsk} disabled={isGrokThinking} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-purple-400 hover:text-purple-300 disabled:opacity-50">
                                                {isGrokThinking ? <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'history' && (
                                    <div className="h-full flex flex-col">
                                        <div className="flex-1 space-y-2 mb-4 overflow-y-auto pr-2 no-scrollbar">
                                            {messages.map((m, i) => (
                                                <div key={i} className="text-xs p-2 rounded bg-white/5 border border-white/5">
                                                    <span className="text-gray-500 font-mono">[{new Date(m.timestamp).toLocaleTimeString()}]</span> <span className={m.role === 'user' ? 'text-green-400' : 'text-cyan-400'}>{m.role === 'user' ? 'Client' : 'Nexus'}:</span> {m.type === 'audio' ? <span className="italic text-gray-400">[Voice Message]</span> : m.text}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-white/10">
                                            <button onClick={downloadTranscript} className="flex items-center justify-center gap-2 py-3 bg-green-600/20 text-green-400 border border-green-500/30 rounded-xl hover:bg-green-600/30 transition-colors">
                                                <FileText className="w-4 h-4" /> Download Transcript
                                            </button>
                                            <button onClick={downloadJSON} className="flex items-center justify-center gap-2 py-3 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl hover:bg-blue-600/30 transition-colors">
                                                <FileJson className="w-4 h-4" /> Export JSON Data
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AIAgentPanel;
