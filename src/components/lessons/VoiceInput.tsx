import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscript, disabled, className }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check for Web Speech API support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast({
        title: 'Voice Input Not Supported',
        description: 'Your browser does not support voice input. Please try Chrome or Edge.',
        variant: 'destructive',
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = '';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        onTranscript(finalTranscript.trim());
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      if (event.error === 'not-allowed') {
        toast({
          title: 'Microphone Access Denied',
          description: 'Please allow microphone access to use voice input.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Voice Input Error',
          description: 'Something went wrong. Please try again.',
          variant: 'destructive',
        });
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      if (finalTranscript) {
        onTranscript(finalTranscript.trim());
      }
    };

    // Store recognition instance for stopping
    (window as any).currentRecognition = recognition;
    recognition.start();
  }, [onTranscript, toast]);

  const stopListening = useCallback(() => {
    const recognition = (window as any).currentRecognition;
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <Button
      type="button"
      variant={isListening ? 'destructive' : 'outline'}
      size="icon"
      onClick={toggleListening}
      disabled={disabled}
      className={cn(
        'shrink-0 transition-all',
        isListening && 'animate-pulse-subtle',
        className
      )}
      title={isListening ? 'Stop voice input' : 'Start voice input'}
    >
      {isListening ? (
        <MicOff className="h-4 w-4" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </Button>
  );
};

export default VoiceInput;
