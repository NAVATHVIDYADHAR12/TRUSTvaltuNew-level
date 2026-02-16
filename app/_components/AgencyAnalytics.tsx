
import React, { useState, useEffect } from 'react';
import { MessageSquare, FileText, Sparkles, User, Bot, Clock, Play, Download, Mic, Send } from 'lucide-react';
import QuickUploadSection from './QuickUploadSection';
import { motion } from 'framer-motion';

const AgencyAnalytics = () => {
    const [conversation, setConversation] = useState<any[]>([]);
    const [summary, setSummary] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const loadChat = () => {
            const saved = localStorage.getItem('agency_client_chat');
            if (saved) {
                setConversation(JSON.parse(saved));
            }
        };
        loadChat();
        window.addEventListener('storage', loadChat);
        return () => window.removeEventListener('storage', loadChat);
    }, []);

    const generateSummary = () => {
        setIsGenerating(true);
        setTimeout(() => {
            // Simulate AI summarization based on content
            const clientMsgs = conversation.filter(m => m.role === 'user').length;
            const textSummary = `
                ## Client Session Summary
                
                **Engagement Level:** ${clientMsgs > 2 ? 'High' : 'Moderate'}
                **Key Topics:** Watermarking, DRM Protection, License Inquiry.
                
                **Transcript Analysis:**
                The client engaged with the AI Assistant to discuss security protocols. 
                Voice-to-text logging indicates a preference for direct communication. 
                No critical security incidents were flagged during this conversation.
                
                **Action Items:**
                - Review requested license upgrade.
                - Follow up on custom watermark patterns.
            `;
            setSummary(textSummary);
            setIsGenerating(false);
        }, 1500);
    };

    return (
        <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex gap-6">
            {/* Left: Conversation History */}
            <div className="w-1/2 flex flex-col bg-[#111] rounded-2xl border border-white/5 overflow-hidden">
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-cyan-400" />
                        <h3 className="font-bold text-white">Client Conversation Log</h3>
                    </div>
                    <span className="text-xs text-gray-500">{conversation.length} messages</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-black/20">
                    {conversation.length === 0 ? (
                        <div className="text-center text-gray-500 mt-10">No conversation history found.</div>
                    ) : (
                        conversation.map((msg, idx) => (
                            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                </div>
                                <div className={`flex-1 p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-indigo-500/10 border border-indigo-500/20 text-gray-200' : 'bg-gray-800/50 border border-white/5 text-gray-300'}`}>
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-xs font-bold ${msg.role === 'user' ? 'text-indigo-400' : 'text-cyan-400'}`}>
                                            {msg.role === 'user' ? 'Client' : 'Nexus AI'}
                                        </span>
                                        <span className="text-[10px] text-gray-600 flex items-center gap-1">
                                            <Clock size={10} />
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>

                                    {msg.type === 'text' && <p className="leading-relaxed">{msg.text}</p>}

                                    {msg.type === 'audio' && (
                                        <div className="flex items-center gap-3 min-w-[200px] mt-1 bg-black/20 p-2 rounded-lg">
                                            <div className="p-2 bg-indigo-500/20 rounded-full cursor-pointer hover:bg-indigo-500/30 transition-colors" onClick={() => {
                                                if (msg.audioSrc) {
                                                    const audio = new Audio(msg.audioSrc);
                                                    audio.play();
                                                }
                                            }}>
                                                <Play className="w-4 h-4 fill-current text-indigo-400" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="h-1 bg-white/10 rounded-full w-full mb-1">
                                                    <div className="h-1 bg-indigo-500/50 rounded-full w-1/3" />
                                                </div>
                                                <div className="flex justify-between text-xs opacity-70">
                                                    <span>{msg.duration || '0:05'}</span>
                                                    <span>Voice Message</span>
                                                </div>
                                            </div>
                                            <a
                                                href={msg.audioSrc}
                                                download={`voice-note-${new Date(msg.timestamp).toISOString()}.mp3`}
                                                className="p-1 hover:bg-white/10 rounded transition-colors"
                                                title="Download Audio"
                                            >
                                                <Download className="w-4 h-4 text-gray-400 hover:text-white" />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Agent Reply Input */}
                <div className="p-4 border-t border-white/5 bg-[#1a1a20]">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Reply to client..."
                            className="w-full bg-black/50 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const val = e.currentTarget.value;
                                    if (!val.trim()) return;

                                    const newMsg = {
                                        role: 'agent',
                                        type: 'text',
                                        text: val,
                                        timestamp: Date.now()
                                    };

                                    const updated = [...conversation, newMsg];
                                    setConversation(updated);
                                    localStorage.setItem('agency_client_chat', JSON.stringify(updated));
                                    window.dispatchEvent(new Event('storage'));

                                    e.currentTarget.value = '';
                                }
                            }}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <button className="p-2 text-gray-400 hover:text-white"><Mic className="w-4 h-4" /></button>
                            <button className="p-2 text-cyan-400 hover:text-cyan-300"><Send className="w-4 h-4" /></button>
                        </div>
                    </div>
                </div>
            </div>


            {/* Right: Summary & Analytics */}
            <div className="w-1/2 flex flex-col gap-6">
                {/* Summary Card */}
                <div className="flex-1 bg-[#111] rounded-2xl border border-white/5 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-cyan-900/10">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-yellow-400" />
                            <h3 className="font-bold text-white">AI Session Analysis</h3>
                        </div>
                        <button
                            onClick={generateSummary}
                            disabled={isGenerating}
                            className="text-xs bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full hover:bg-cyan-500/30 transition-colors disabled:opacity-50"
                        >
                            {isGenerating ? 'Analyzing...' : 'Generate New Summary'}
                        </button>
                    </div>

                    <div className="flex-1 p-6 relative">
                        {isGenerating ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                <div className="text-center">
                                    <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                                    <p className="text-cyan-400 text-sm animate-pulse">Processing Transcript...</p>
                                </div>
                            </div>
                        ) : summary ? (
                            <div className="prose prose-invert prose-sm max-w-none">
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5 whitespace-pre-line text-gray-300 shadow-inner">
                                    {summary}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                                <FileText className="w-12 h-12 mb-3" />
                                <p>No analysis generated yet.</p>
                                <p className="text-xs">Click generate to analyze current session.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Upload Section below Analytics */}
                <QuickUploadSection />
            </div>
        </div>
    );
};

export default AgencyAnalytics;
