/**
 * Services/Voice.js
 * Serviço de áudio e reconhecimento de voz da Sofia.
 * Encapsula a Web Speech API com detecção de silêncio de 3.5s
 * e integra o ElevenLabs com seleção dinâmica de voz.
 */

import { api } from './api.js';

class VoiceService {
    constructor() {
        this.recognition = null;
        this.isRecording = false;
        this.synth = window.speechSynthesis;
        this.silenceTimeout = null;
        this.accumulatedTranscript = '';
        this.hasProcessedResult = false;
        
        // Iniciar Web Speech Recognition se disponível
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true; // Mantém ativo para que possamos controlar o silêncio
            this.recognition.lang = 'pt-BR';
            this.recognition.interimResults = false;
            this.recognition.maxAlternatives = 1;
        } else {
            console.warn('Reconhecimento de fala não suportado neste navegador. Usando fallback de simulação.');
        }
    }

    /**
     * Inicia a escuta por voz
     * @param {Object} callbacks { onStart, onResult, onError, onEnd }
     */
    startListening(callbacks = {}) {
        if (this.isRecording) return;
        
        this.isRecording = true;
        this.stopSpeaking(); // Interrompe fala se estiver falando
        this.accumulatedTranscript = '';
        this.hasProcessedResult = false;
        if (this.silenceTimeout) clearTimeout(this.silenceTimeout);

        if (this.recognition) {
            this.recognition.continuous = true; // Garante contínuo

            this.recognition.onstart = () => {
                if (callbacks.onStart) callbacks.onStart();
            };

            this.recognition.onresult = (event) => {
                if (this.silenceTimeout) clearTimeout(this.silenceTimeout);

                // Acumula todas as partes finais reconhecidas
                let currentTranscript = '';
                for (let i = 0; i < event.results.length; i++) {
                    currentTranscript += event.results[i][0].transcript + ' ';
                }
                this.accumulatedTranscript = currentTranscript.trim();

                // Define o timeout de silêncio: se ficar 3.5s sem falar, encerra automaticamente
                this.silenceTimeout = setTimeout(() => {
                    console.log('Silêncio de 3.5s detectado. Finalizando áudio automaticamente...');
                    if (!this.hasProcessedResult) {
                        this.hasProcessedResult = true;
                        this.stopListening();
                        if (callbacks.onResult && this.accumulatedTranscript) {
                            callbacks.onResult(this.accumulatedTranscript);
                        }
                    }
                }, 3500);
            };

            this.recognition.onerror = (event) => {
                console.error('Speech Recognition Error:', event.error);
                if (this.silenceTimeout) clearTimeout(this.silenceTimeout);
                if (callbacks.onError) callbacks.onError(event.error);
            };

            this.recognition.onend = () => {
                this.isRecording = false;
                if (this.silenceTimeout) clearTimeout(this.silenceTimeout);
                
                // Se terminou e ainda não processou o resultado, envia o que foi acumulado
                if (!this.hasProcessedResult) {
                    this.hasProcessedResult = true;
                    if (callbacks.onResult && this.accumulatedTranscript) {
                        callbacks.onResult(this.accumulatedTranscript);
                    }
                }
                if (callbacks.onEnd) callbacks.onEnd();
            };

            try {
                this.recognition.start();
            } catch (err) {
                console.error('Failed to start SpeechRecognition:', err);
                this.isRecording = false;
                if (callbacks.onEnd) callbacks.onEnd();
            }
        } else {
            // Fallback de Simulação se o navegador não tiver suporte
            if (callbacks.onStart) callbacks.onStart();
            
            this.silenceTimeout = setTimeout(() => {
                const mockPhrases = [
                    "Maria sentiu dor de cabeça forte hoje de manhã e tomou paracetamol.",
                    "Cuidadora registrou que a pressão de Maria estava 14 por 9 às 16 horas.",
                    "Relato de tontura leve após o almoço que passou depois de beber água.",
                    "Paciente tomou a losartana pontualmente às 8 horas hoje."
                ];
                const text = mockPhrases[Math.floor(Math.random() * mockPhrases.length)];
                this.accumulatedTranscript = text;
                this.hasProcessedResult = true;
                this.isRecording = false;
                if (callbacks.onResult) callbacks.onResult(text);
                if (callbacks.onEnd) callbacks.onEnd();
            }, 4000);
        }
    }

    /**
     * Interrompe a escuta por voz
     */
    stopListening() {
        if (!this.isRecording) return;
        if (this.silenceTimeout) clearTimeout(this.silenceTimeout);
        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch (e) {
                console.error('Erro ao parar reconhecimento de fala:', e);
            }
        }
        this.isRecording = false;
    }

    /**
     * Fala uma resposta em voz alta usando SpeechSynthesis local ou ElevenLabs
     * @param {string} text Texto para ser sintetizado em voz
     * @param {Function} onSpeakEnd Callback chamado ao finalizar a fala
     */
    async speak(text, onSpeakEnd = null) {
        const settings = await api.getSettings();
        
        if (!settings.audioFeedback) {
            if (onSpeakEnd) onSpeakEnd();
            return;
        }

        // Se houver API Key do ElevenLabs configurada
        if (settings.apiKeyElevenLabs && settings.apiKeyElevenLabs.trim() !== '') {
            console.log('Utilizando integração ElevenLabs para síntese de áudio...');
            try {
                const audioBlob = await this.synthesizeWithElevenLabs(text, settings.apiKeyElevenLabs);
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = new Audio(audioUrl);
                audio.onended = () => {
                    if (onSpeakEnd) onSpeakEnd();
                };
                await audio.play();
                return;
            } catch (error) {
                console.error('Falha na síntese do ElevenLabs, usando fallback nativo:', error);
            }
        }

        // Fallback: Web Speech API (Nativo do navegador)
        if (this.synth) {
            this.stopSpeaking(); // Cancela falas anteriores
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'pt-BR';
            
            // Tenta obter uma voz em português de melhor qualidade
            const voices = this.synth.getVoices();
            const ptVoice = voices.find(voice => voice.lang.includes('pt-BR') || voice.lang.includes('pt_BR'));
            if (ptVoice) {
                utterance.voice = ptVoice;
            }

            utterance.onend = () => {
                if (onSpeakEnd) onSpeakEnd();
            };

            utterance.onerror = (err) => {
                console.error('SpeechSynthesis Error:', err);
                if (onSpeakEnd) onSpeakEnd();
            };

            this.synth.speak(utterance);
        } else {
            console.warn('SpeechSynthesis não suportada neste navegador.');
            if (onSpeakEnd) onSpeakEnd();
        }
    }

    /**
     * Cancela qualquer áudio em reprodução
     */
    stopSpeaking() {
        if (this.synth) {
            this.synth.cancel();
        }
    }

    /**
     * Integração com ElevenLabs
     */
    async synthesizeWithElevenLabs(text, apiKey) {
        const settings = await api.getSettings();
        // Usa a voz selecionada no painel ou cai de volta para a voz Rachel
        const voiceId = settings.selectedVoice || '21m00Tcm4TlvDq8ikWAM'; 
        const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'accept': 'audio/mpeg',
                'content-type': 'application/json',
                'xi-api-key': apiKey
            },
            body: JSON.stringify({
                text: text,
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75
                }
            })
        });

        if (!response.ok) {
            throw new Error(`ElevenLabs API retornou erro ${response.status}`);
        }

        return await response.blob();
    }
}

export const voice = new VoiceService();
