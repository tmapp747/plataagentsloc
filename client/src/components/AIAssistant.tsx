import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, MessageSquare, Languages, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  dialect?: string;
}

interface AIAssistantProps {
  applicationId?: string;
  currentStep?: string;
  className?: string;
  defaultOpen?: boolean;
}

const supportedDialects = {
  english: 'English',
  tagalog: 'Tagalog',
  cebuano: 'Cebuano (Bisaya)',
  ilocano: 'Ilocano',
  bicolano: 'Bicolano'
};

const AIAssistant = ({ 
  applicationId, 
  currentStep = '', 
  className,
  defaultOpen = false
}: AIAssistantProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [dialect, setDialect] = useState<keyof typeof supportedDialects>('english');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your PlataPay assistant. I can help answer questions about becoming a PlataPay agent, explain the application process, or provide information about our services and franchise packages. How can I help you today?',
      dialect: 'english'
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // AI chat mutation
  const chatMutation = useMutation({
    mutationFn: async (prompt: string) => {
      return apiRequest('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          dialect,
          applicationId,
          currentStep
        }),
      });
    },
    onSuccess: (data) => {
      if (data?.response) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: data.response,
            dialect
          }
        ]);
      }
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to get a response. Please try again.',
        variant: 'destructive',
      });
    }
  });
  
  // Translate mutation
  const translateMutation = useMutation({
    mutationFn: async ({ 
      messageId, 
      message, 
      toDialect 
    }: { 
      messageId: string; 
      message: string; 
      toDialect: keyof typeof supportedDialects;
    }) => {
      return apiRequest('/api/assistant/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          fromDialect: dialect,
          toDialect
        }),
      });
    },
    onSuccess: (data, variables) => {
      if (data?.translated) {
        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === variables.messageId 
              ? { ...msg, content: data.translated, dialect: variables.toDialect }
              : msg
          )
        );
        
        // Update current dialect for future messages
        setDialect(variables.toDialect);
        
        toast({
          title: 'Message Translated',
          description: `Translated to ${supportedDialects[variables.toDialect]}`,
        });
      }
    },
    onError: () => {
      toast({
        title: 'Translation Error',
        description: 'Failed to translate message. Please try again.',
        variant: 'destructive',
      });
    }
  });
  
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (input.trim() === '') return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      dialect
    };
    
    setMessages((prev) => [...prev, userMessage]);
    
    // Send to AI
    chatMutation.mutate(input);
    
    // Clear input
    setInput('');
  };
  
  const handleTranslate = (messageId: string, content: string, toDialect: keyof typeof supportedDialects) => {
    if (toDialect === dialect) return; // Skip if already in the target dialect
    
    translateMutation.mutate({
      messageId,
      message: content,
      toDialect
    });
  };
  
  const renderMessages = () => {
    return messages.map((message) => (
      <div
        key={message.id}
        className={cn(
          'flex flex-col p-3 rounded-lg my-2 max-w-[80%]',
          message.role === 'user' 
            ? 'ml-auto bg-primary text-primary-foreground' 
            : 'mr-auto bg-muted'
        )}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium">
            {message.role === 'user' ? 'You' : 'PlataPay Assistant'}
          </span>
          {message.dialect && message.role === 'assistant' && (
            <span className="text-xs opacity-70">
              ({supportedDialects[message.dialect as keyof typeof supportedDialects]})
            </span>
          )}
        </div>
        
        <p className="text-sm">{message.content}</p>
        
        {message.role === 'assistant' && (
          <div className="flex items-center gap-2 mt-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button size="icon" variant="ghost" className="h-6 w-6">
                  <Languages className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-52 p-2" align="start">
                <div className="grid gap-1">
                  {Object.entries(supportedDialects).map(([key, label]) => (
                    <Button
                      key={key}
                      size="sm"
                      variant="ghost"
                      className="justify-start font-normal"
                      onClick={() => handleTranslate(
                        message.id,
                        message.content,
                        key as keyof typeof supportedDialects
                      )}
                      disabled={translateMutation.isPending || key === message.dialect}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            
            <Button size="icon" variant="ghost" className="h-6 w-6">
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    ));
  };
  
  const content = (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 border-b">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h3 className="font-medium">PlataPay Assistant</h3>
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          <label className="text-sm">Language:</label>
          <Select
            value={dialect}
            onValueChange={(value) => setDialect(value as keyof typeof supportedDialects)}
          >
            <SelectTrigger className="h-8 w-40">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(supportedDialects).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {renderMessages()}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <form onSubmit={handleSend} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={chatMutation.isPending || !input.trim()}
            variant="default"
          >
            {chatMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
  
  if (isMobile) {
    return (
      <>
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerTrigger asChild>
            <Button 
              className="fixed bottom-4 right-4 rounded-full shadow-lg"
              size="icon"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-[85vh]">
            <DrawerHeader className="p-0">
              <DrawerTitle className="sr-only">AI Assistant</DrawerTitle>
              <DrawerDescription className="sr-only">
                Get help with your application
              </DrawerDescription>
            </DrawerHeader>
            {content}
            <DrawerFooter className="p-0">
              <DrawerClose className="sr-only" />
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </>
    );
  }
  
  return (
    <div className={cn('border rounded-md shadow-sm overflow-hidden', className)}>
      <div className="h-[450px] flex flex-col">
        {content}
      </div>
    </div>
  );
};

export default AIAssistant;