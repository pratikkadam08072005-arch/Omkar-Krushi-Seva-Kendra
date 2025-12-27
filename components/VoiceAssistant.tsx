
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';

export const VoiceAssistant: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [transcriptions, setTranscriptions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const createBlob = (data: Float32Array) => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const startSession = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              const ctx = outputAudioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.onended = () => sourcesRef.current.delete(source);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }

            if (message.serverContent?.outputTranscription) {
              setTranscriptions(prev => [...prev, "Owner: " + message.serverContent?.outputTranscription?.text]);
            }
          },
          onerror: (e) => setError("Audio session error: " + e.message),
          onclose: () => setIsConnected(false),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } } },
          systemInstruction: 'You are Bhagwan Kadam, the experienced and authoritative OWNER of Omkar Krushi Udhyog. You speak with wisdom, care, and a practical understanding of Indian agriculture. You help farmers with crop choices, market trends, irrigation equipment, and government subsidies. Your tone is like a respected village elder—helpful, firm, but very encouraging.',
          outputAudioTranscription: {}
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      setError(err.message);
    }
  };

  const stopSession = () => {
    if (sessionRef.current) sessionRef.current.close();
    if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach(track => track.stop());
    setIsConnected(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-emerald-900">Talk to OWNER</h2>
        <p className="text-stone-500 mt-2">Get direct agricultural guidance from Prop. Bhagwan Kadam.</p>
      </div>

      <div className="bg-white p-12 rounded-3xl shadow-sm border border-stone-100 flex flex-col items-center">
        <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-8 relative ${
          isConnected ? 'bg-emerald-100' : 'bg-stone-100'
        }`}>
          {isConnected && (
            <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-25"></div>
          )}
          <i className={`fas fa-microphone text-4xl ${
            isConnected ? 'text-emerald-600' : 'text-stone-300'
          }`}></i>
        </div>

        <button
          onClick={isConnected ? stopSession : startSession}
          className={`px-12 py-4 rounded-full font-bold text-white shadow-xl transition-all active:scale-95 ${
            isConnected ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-600 hover:bg-emerald-700'
          }`}
        >
          {isConnected ? 'End Conversation' : 'Start Talking'}
        </button>

        {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}

        <div className="mt-12 w-full">
           <p className="text-xs font-bold text-stone-400 uppercase mb-4 text-center tracking-widest">Conversation Log</p>
           <div className="bg-stone-50 rounded-2xl p-6 h-64 overflow-y-auto space-y-4 border border-stone-100">
             {transcriptions.length === 0 ? (
               <p className="text-stone-400 text-center text-sm italic py-10">Waiting to start conversation with the owner...</p>
             ) : (
               transcriptions.map((t, i) => (
                 <div key={i} className="text-stone-700 text-sm border-l-2 border-emerald-300 pl-3 py-1">
                   {t}
                 </div>
               ))
             )}
           </div>
        </div>
      </div>
    </div>
  );
};
