'use client';

import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

type Message = {
  id: number;
  text: string;
  sender: 'user' | 'bot';
};

const initialMessages: Message[] = [
    { id: 1, text: 'Hello! I am MediAI\'s health assistant. You can ask me questions about your skin condition or blood report analysis. How can I help you today?', sender: 'bot' }
];

export default function ChatClient() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Mock bot response
    setTimeout(() => {
        const botResponse: Message = {
            id: Date.now() + 1,
            text: "Thank you for your question. The AI chatbot is currently in a demonstration phase. For specific medical advice, please consult with a qualified healthcare professional.",
            sender: 'bot',
          };
      setMessages((prev) => [...prev, botResponse]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex flex-1 flex-col rounded-lg border bg-card">
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
            {messages.map((message) => (
            <div
                key={message.id}
                className={cn(
                'flex items-start gap-3',
                message.sender === 'user' ? 'justify-end' : 'justify-start'
                )}
            >
                {message.sender === 'bot' && (
                <Avatar className="h-8 w-8">
                    <AvatarFallback><Bot/></AvatarFallback>
                </Avatar>
                )}
                <div
                className={cn(
                    'max-w-xs rounded-lg px-4 py-2 md:max-w-md',
                    message.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
                >
                <p className="text-sm">{message.text}</p>
                </div>
                {message.sender === 'user' && (
                <Avatar className="h-8 w-8">
                    <AvatarFallback><User /></AvatarFallback>
                </Avatar>
                )}
            </div>
            ))}
            {isLoading && (
            <div className="flex items-start gap-3 justify-start">
                <Avatar className="h-8 w-8">
                <AvatarFallback><Bot /></AvatarFallback>
                </Avatar>
                <div className="max-w-xs rounded-lg px-4 py-2 md:max-w-md bg-muted flex items-center">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s] mx-1"></div>
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
                </div>
            </div>
            )}
            <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      <div className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
