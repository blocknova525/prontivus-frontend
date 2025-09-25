import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  MicOff, 
  Square, 
  Play, 
  Pause,
  Trash2,
  Volume2,
  VolumeX
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface VoiceRecorderProps {
  onTranscript: (transcript: string) => void;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
  className?: string;
}

interface AudioChunk {
  id: string;
  blob: Blob;
  duration: number;
  timestamp: Date;
  transcript?: string;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscript,
  isRecording,
  setIsRecording,
  className
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioChunks, setAudioChunks] = useState<AudioChunk[]>([]);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Check for browser support
  const isSupported = typeof navigator !== 'undefined' && 
    navigator.mediaDevices && 
    navigator.mediaDevices.getUserMedia;

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    if (!isSupported) {
      toast.error('Gravação de voz não suportada neste navegador');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const duration = recordingTime;
        
        const newChunk: AudioChunk = {
          id: Date.now().toString(),
          blob: audioBlob,
          duration,
          timestamp: new Date(),
        };
        
        setAudioChunks(prev => [...prev, newChunk]);
        processAudioToText(audioBlob, newChunk.id);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      
      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast.success('Gravação iniciada');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Erro ao iniciar gravação. Verifique as permissões do microfone.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      toast.info('Gravação pausada');
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      
      // Resume timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast.info('Gravação retomada');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      toast.success('Gravação finalizada');
    }
  };

  const processAudioToText = async (audioBlob: Blob, chunkId: string) => {
    setIsProcessing(true);
    
    try {
      // Simulate speech-to-text processing
      // In a real implementation, you would use a service like Google Speech-to-Text, Azure Speech, or Web Speech API
      
      // For now, we'll simulate a delay and provide a placeholder transcript
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const simulatedTranscript = `[Transcrição automática - ${new Date().toLocaleTimeString('pt-BR')}] 
      
Nota de voz gravada durante a consulta. O conteúdo será processado e convertido em texto automaticamente.

Esta é uma funcionalidade de demonstração. Em uma implementação real, o áudio seria enviado para um serviço de reconhecimento de voz para conversão em texto.`;

      // Update the chunk with transcript
      setAudioChunks(prev => 
        prev.map(chunk => 
          chunk.id === chunkId 
            ? { ...chunk, transcript: simulatedTranscript }
            : chunk
        )
      );

      // Automatically add transcript to the form
      onTranscript(simulatedTranscript);
      
      toast.success('Áudio processado e texto adicionado');
    } catch (error) {
      console.error('Error processing audio:', error);
      toast.error('Erro ao processar áudio');
    } finally {
      setIsProcessing(false);
    }
  };

  const playAudio = (chunk: AudioChunk) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    const audioUrl = URL.createObjectURL(chunk.blob);
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    
    audio.onplay = () => setIsPlaying(chunk.id);
    audio.onpause = () => setIsPlaying(null);
    audio.onended = () => setIsPlaying(null);
    
    audio.play();
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const deleteChunk = (chunkId: string) => {
    setAudioChunks(prev => prev.filter(chunk => chunk.id !== chunkId));
    toast.success('Gravação removida');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isSupported) {
    return (
      <Card className={cn("border-dashed border-2", className)}>
        <CardContent className="p-6 text-center">
          <MicOff className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Gravação de voz não suportada neste navegador
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Recording Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={isProcessing}
                >
                  <Mic className="w-4 h-4 mr-2" />
                  Iniciar Gravação
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  {!isPaused ? (
                    <Button
                      onClick={pauseRecording}
                      variant="outline"
                      className="border-orange-500 text-orange-600 hover:bg-orange-50"
                    >
                      <Pause className="w-4 h-4 mr-2" />
                      Pausar
                    </Button>
                  ) : (
                    <Button
                      onClick={resumeRecording}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Retomar
                    </Button>
                  )}
                  <Button
                    onClick={stopRecording}
                    variant="outline"
                    className="border-red-500 text-red-600 hover:bg-red-50"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Parar
                  </Button>
                </div>
              )}
            </div>

            {isRecording && (
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="animate-pulse">
                  <Mic className="w-3 h-3 mr-1" />
                  Gravando
                </Badge>
                <span className="text-sm font-mono text-red-600">
                  {formatTime(recordingTime)}
                </span>
              </div>
            )}

            {isProcessing && (
              <Badge variant="secondary" className="animate-pulse">
                <Volume2 className="w-3 h-3 mr-1" />
                Processando...
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Audio Chunks List */}
      {audioChunks.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Gravações ({audioChunks.length})
            </h4>
            <div className="space-y-2">
              {audioChunks.map((chunk) => (
                <div
                  key={chunk.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {isPlaying === chunk.id ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={pauseAudio}
                        >
                          <Pause className="w-3 h-3" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => playAudio(chunk)}
                        >
                          <Play className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {chunk.timestamp.toLocaleTimeString('pt-BR')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Duração: {formatTime(chunk.duration)}
                      </p>
                      {chunk.transcript && (
                        <p className="text-xs text-green-600 mt-1">
                          ✓ Texto processado
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteChunk(chunk.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden audio element */}
      <audio ref={audioRef} />
    </div>
  );
};

export default VoiceRecorder;
