'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ClaudeChatInput, ChatInputPayload } from './ui/claude-style-chat-input';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import apiClient from '@/lib/apiClient';
import { useAuthStore } from '@/store/authStore';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    isTyping?: boolean;
}

const TypewriterText = ({ text, delay = 10, onComplete }: { text: string, delay?: number, onComplete?: () => void }) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        let i = 0;
        setDisplayedText('');
        const interval = setInterval(() => {
            setDisplayedText(text.slice(0, i + 1));
            i++;
            if (i >= text.length) {
                clearInterval(interval);
                if (onComplete) onComplete();
            }
        }, delay);
        return () => clearInterval(interval);
    }, [text, delay, onComplete]);

    return (
        <div className="prose dark:prose-invert prose-sm max-w-[100%] leading-[1.6] prose-p:my-2 prose-pre:my-2 prose-pre:bg-surface-800 prose-pre:text-surface-100 prose-code:text-accent prose-code:bg-surface-100 dark:prose-code:bg-surface-800 prose-code:px-1 prose-code:rounded">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {displayedText + '▍'}
            </ReactMarkdown>
        </div>
    );
};

interface ChatModalProps {
    onClose: () => void;
}

export default function ChatModal({ onClose }: ChatModalProps) {
    const { user } = useAuthStore();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (payload: ChatInputPayload) => {
        if (!payload.message.trim() && payload.files.length === 0 && payload.pastedContent.length === 0) return;

        // Compile content (For MVP, we just send the text, since the backend might not support files yet)
        let finalMessage = payload.message;
        if (payload.pastedContent.length > 0) {
            finalMessage += '\n\n' + payload.pastedContent.map(p => `Attached Snippet:\n\`\`\`\n${p.content}\n\`\`\``).join('\n\n');
        }

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: finalMessage };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const { data } = await apiClient.post('/chat', {
                message: finalMessage,
                history: messages.map(({ role, content }) => ({ role, content })).slice(-10),
            });

            const assistantMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.reply,
                isTyping: true
            };
            setMessages(prev => [...prev, assistantMsg]);
        } catch (error) {
            setMessages(prev => [
                ...prev,
                { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Sorry, I could not process your request right now.', isTyping: true },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTypingComplete = (id: string) => {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, isTyping: false } : m));
    };

    const currentHour = new Date().getHours();
    let greeting = 'Good morning';
    if (currentHour >= 12 && currentHour < 18) {
        greeting = 'Good afternoon';
    } else if (currentHour >= 18) {
        greeting = 'Good evening';
    }

    const userName = user?.name ? user.name.split(' ')[0] : 'Guest';

    return (
        <div className="fixed inset-0 z-[100] bg-bg-0 dark:bg-bg-000 flex flex-col items-center p-4 pt-10 font-sans text-text-100 transition-colors duration-200 overflow-y-auto w-full h-full animate-fade-in">

            {/* Close Button overlay top right */}
            <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-full text-text-400 hover:text-text-200 hover:bg-bg-200 transition-colors duration-200 z-50"
                aria-label="Close Chat"
            >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            {messages.length === 0 ? (
                /* Empty State Greeting Section */
                <div className="flex-1 w-full flex flex-col items-center justify-center max-w-3xl mb-8 sm:mb-12 text-center animate-fade-in">
                    <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center bg-accent/10 rounded-3xl text-accent">
                        <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
                        </svg>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-serif font-light text-text-200 mb-3 tracking-tight">
                        {greeting}, <span className="relative inline-block pb-2">
                            {userName}
                            <svg className="absolute w-[140%] h-[20px] -bottom-1 -left-[5%] text-accent" viewBox="0 0 140 24" fill="none" preserveAspectRatio="none" aria-hidden="true">
                                <path d="M6 16 Q 70 24, 134 14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
                            </svg>
                        </span>
                    </h1>
                </div>
            ) : (
                /* Chat Messages List */
                <div className="flex-1 w-full max-w-3xl mb-8 overflow-y-auto px-4 lg:px-0 scroll-smooth pb-20 custom-scrollbar">
                    <div className="flex flex-col gap-6">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {/* Avatar */}
                                    <div className="flex-shrink-0 mt-1">
                                        {msg.role === 'user' ? (
                                            <div className="w-8 h-8 rounded-full bg-surface-200 dark:bg-surface-700 flex items-center justify-center text-text-300 font-medium text-sm">
                                                {userName.charAt(0).toUpperCase()}
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center text-white">
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    {/* Bubble */}
                                    <div className={`px-5 py-3.5 rounded-2xl ${msg.role === 'user'
                                        ? 'bg-bg-200 dark:bg-[#30302E] text-text-100 dark:text-text-100 rounded-tr-sm'
                                        : 'bg-transparent text-text-100 dark:text-text-100'
                                        }`}>
                                        {msg.role === 'user' ? (
                                            <div className="whitespace-pre-wrap text-[15px]">{msg.content}</div>
                                        ) : (
                                            msg.isTyping ? (
                                                <TypewriterText text={msg.content} onComplete={() => handleTypingComplete(msg.id)} />
                                            ) : (
                                                <div className="prose dark:prose-invert prose-sm max-w-[100%] w-full leading-[1.6] overflow-x-auto prose-p:my-2 prose-pre:my-2 prose-pre:bg-surface-800 prose-pre:text-surface-100 prose-code:text-accent prose-code:bg-surface-100 dark:prose-code:bg-surface-800 prose-code:px-1 prose-code:rounded">
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                        {msg.content}
                                                    </ReactMarkdown>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
            )}

            {/* Input Fixed at Bottom */}
            <div className="w-full max-w-3xl mt-auto pb-6 relative z-10 px-4 lg:px-0">
                <ClaudeChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
            </div>

        </div>
    );
}
