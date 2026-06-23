/**
 * Components/SofiaScreen.js
 * Tela Conversacional da Sofia inspirada na interface do WhatsApp.
 * Gerencia envio de anotações por texto e voz, análise de fotos
 * e sintetiza respostas dinamicamente por voz.
 * Inclui um seletor de autor logado para fins de demonstração da POC.
 */

import { api, AVATARS } from '../services/api.js';
import { voice } from '../services/voice.js';
import { vision } from '../services/vision.js';

const AUTHORS_LIST = [
    { key: 'ana', name: 'Ana (Filha)', role: 'Familiar', avatar: AVATARS.ana },
    { key: 'joao', name: 'João (Filho)', role: 'Familiar', avatar: AVATARS.joao },
    { key: 'maria_cuidadora', name: 'Cuidadora Maria', role: 'Cuidador', avatar: AVATARS.maria_cuidadora },
    { key: 'maria', name: 'Própria paciente (Maria)', role: 'Paciente', avatar: AVATARS.maria }
];

export class SofiaScreen {
    constructor(app) {
        this.app = app;
        this.activeAuthorKey = 'ana'; // Autor logado padrão para demonstração
        this.chatHistory = [
            { 
                sender: 'sofia', 
                text: 'Olá! Sou a Sofia, sua Memória Clínica. O que aconteceu na saúde da sua família recentemente? Você pode falar por voz ou tirar uma foto.',
                time: this.getCurrentFormattedTime(),
                type: 'text'
            }
        ];
        this.isListening = false;
        this.isSpeaking = false;
    }

    getCurrentFormattedTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    renderAuthorPills() {
        return AUTHORS_LIST.map(auth => {
            const isActive = this.activeAuthorKey === auth.key;
            return `
                <button class="author-pill ${isActive ? 'active' : ''}" data-author-key="${auth.key}" style="
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background-color: ${isActive ? 'var(--color-primary-light)' : 'var(--color-white)'};
                    border: 1px solid ${isActive ? 'var(--color-primary)' : 'var(--color-neutral-border)'};
                    color: ${isActive ? 'var(--color-primary-dark)' : 'var(--color-neutral-muted)'};
                    padding: 4px 10px;
                    border-radius: var(--radius-xl);
                    font-size: 11px;
                    font-weight: 600;
                    cursor: pointer;
                    white-space: nowrap;
                    transition: var(--transition-fast);
                ">
                    <img src="${encodeURI(auth.avatar)}" style="width: 16px; height: 16px; border-radius: 50%;" alt="">
                    <span>${auth.name}</span>
                </button>
            `;
        }).join('');
    }

    bindAuthorPills(container) {
        const pills = container.querySelectorAll('.author-pill');
        pills.forEach(pill => {
            pill.addEventListener('click', () => {
                this.activeAuthorKey = pill.getAttribute('data-author-key');
                const pillsContainer = document.getElementById('sofia-author-pills');
                if (pillsContainer) {
                    pillsContainer.innerHTML = this.renderAuthorPills();
                    this.bindAuthorPills(container);
                }
            });
        });
    }

    async render(container) {
        const patient = await api.getActiveProfile();
        
        container.innerHTML = `
            <div class="screen sofia-screen">
                <div class="sofia-chat-container">
                    
                    <!-- Cabeçalho WhatsApp da Sofia -->
                    <div class="sofia-chat-header" id="sofia-chat-header">
                        <div class="sofia-chat-header-avatar">
                            <i data-lucide="brain-circuit"></i>
                        </div>
                        <div class="sofia-chat-header-info">
                            <span class="sofia-chat-header-name">Sofia — Memória Clínica</span>
                            <span class="sofia-chat-header-status" id="sofia-chat-status">online</span>
                        </div>
                        <div class="header-wave-pulse" id="header-visualizer">
                            <div class="header-wave-bar"></div>
                            <div class="header-wave-bar"></div>
                            <div class="header-wave-bar"></div>
                        </div>
                    </div>

                    <!-- Seletor de Autor Logado para Demonstração -->
                    <div style="background-color: var(--color-white); border-bottom: 1px solid var(--color-neutral-border); padding: 8px 12px; display: flex; align-items: center; gap: 8px; overflow-x: auto; flex-shrink: 0; scrollbar-width: none;" class="author-pills-bar">
                        <span style="font-size: 9px; font-weight: 700; color: var(--color-neutral-muted); text-transform: uppercase; white-space: nowrap; margin-right: 4px;">👤 Registrar como:</span>
                        <div style="display: flex; gap: 6px;" id="sofia-author-pills">
                            ${this.renderAuthorPills()}
                        </div>
                    </div>

                    <!-- Corpo de Mensagens Roteável -->
                    <div class="sofia-chat-messages" id="sofia-chat-messages-box">
                        ${this.renderChatTranscript()}
                        <!-- Balão de Digitando (Oculto por padrão) -->
                        <div class="chat-bubble-wrapper sofia hidden" id="sofia-typing-indicator">
                            <div class="chat-bubble typing-bubble">
                                <div class="typing-dot"></div>
                                <div class="typing-dot"></div>
                                <div class="typing-dot"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Barra de Input Estilo WhatsApp -->
                    <div class="sofia-chat-input-bar">
                        <button class="chat-action-btn" id="sofia-camera-btn" title="Anexar Foto">
                            <i data-lucide="plus"></i>
                        </button>
                        
                        <div class="chat-input-wrapper">
                            <input type="text" id="sofia-text-input" placeholder="Digite uma anotação de saúde...">
                        </div>
                        
                        <button class="chat-send-btn mic-mode" id="sofia-send-btn" title="Gravar Voz">
                            <i data-lucide="mic"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        if (window.lucide) {
            window.lucide.createIcons();
        }

        this.scrollToBottom();
        this.bindAudioButtons();
        this.bindAuthorPills(container);

        // Element Bindings
        const textInput = document.getElementById('sofia-text-input');
        const sendBtn = document.getElementById('sofia-send-btn');
        const cameraBtn = document.getElementById('sofia-camera-btn');

        // Toggle send/mic icons dynamically
        textInput.addEventListener('input', () => {
            const hasText = textInput.value.trim().length > 0;
            const icon = sendBtn.querySelector('i');
            if (hasText) {
                sendBtn.classList.remove('mic-mode');
                sendBtn.setAttribute('title', 'Enviar Mensagem');
                if (icon) icon.setAttribute('data-lucide', 'send');
            } else {
                sendBtn.classList.add('mic-mode');
                sendBtn.setAttribute('title', 'Gravar Voz');
                if (icon) icon.setAttribute('data-lucide', 'mic');
            }
            if (window.lucide) window.lucide.createIcons();
        });

        // Trigger action based on mode
        sendBtn.addEventListener('click', () => {
            if (sendBtn.classList.contains('mic-mode')) {
                if (this.isListening) {
                    this.stopListeningFlow();
                } else {
                    this.startListeningFlow();
                }
            } else {
                this.handleTextInput();
            }
        });

        textInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleTextInput();
            }
        });

        cameraBtn.addEventListener('click', () => {
            this.openCameraModal();
        });

        // Trigger CTA redirection hooks if any
        if (this.app.pendingNavOptions) {
            const options = this.app.pendingNavOptions;
            this.app.pendingNavOptions = null;

            if (options.startListeningImmediate) {
                setTimeout(() => this.startListeningFlow(), 500);
            }
            if (options.openCameraImmediate) {
                setTimeout(() => this.openCameraModal(), 500);
            }
        }
    }

    renderChatTranscript() {
        return this.chatHistory.map(msg => {
            let messageBody = '';
            
            if (msg.type === 'image') {
                messageBody = `
                    <img src="${encodeURI(msg.attachment)}" class="chat-bubble-img" alt="Anexo Clínico">
                    <div>${msg.text}</div>
                `;
            } else if (msg.type === 'audio') {
                const barsCount = 18;
                let barsHtml = '';
                for (let i = 0; i < barsCount; i++) {
                    barsHtml += `<div class="audio-wave-bar" style="height: ${Math.floor(Math.random() * 12) + 4}px"></div>`;
                }
                messageBody = `
                    <div class="audio-message-bubble">
                        <button class="audio-play-btn" data-text="${msg.text}" title="Ouvir Relato">
                            <i data-lucide="play"></i>
                        </button>
                        <div class="audio-waveform-sim">
                            ${barsHtml}
                        </div>
                        <span class="audio-duration">${msg.duration || '0:05'}</span>
                    </div>
                `;
            } else {
                messageBody = `<div>${msg.text}</div>`;
            }

            return `
                <div class="chat-bubble-wrapper ${msg.sender}">
                    <div class="chat-bubble">
                        ${messageBody}
                        <span class="chat-bubble-time">${msg.time}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    scrollToBottom() {
        const box = document.getElementById('sofia-chat-messages-box');
        if (box) {
            box.scrollTop = box.scrollHeight;
        }
    }

    bindAudioButtons() {
        const msgBox = document.getElementById('sofia-chat-messages-box');
        if (!msgBox) return;

        const playButtons = msgBox.querySelectorAll('.audio-play-btn');
        playButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const text = btn.getAttribute('data-text');
                const icon = btn.querySelector('i');
                
                if (this.isSpeaking) {
                    voice.stopSpeaking();
                    this.stopSpeakingFlow();
                    
                    const allIcons = msgBox.querySelectorAll('.audio-play-btn i');
                    allIcons.forEach(i => i.setAttribute('data-lucide', 'play'));
                    if (window.lucide) window.lucide.createIcons();
                } else {
                    icon.setAttribute('data-lucide', 'square');
                    if (window.lucide) window.lucide.createIcons();
                    
                    const waveformSim = btn.parentNode.querySelector('.audio-waveform-sim');
                    if (waveformSim) {
                        const bars = waveformSim.querySelectorAll('.audio-wave-bar');
                        const interval = setInterval(() => {
                            if (!this.isSpeaking) {
                                clearInterval(interval);
                                bars.forEach(b => b.classList.remove('active'));
                                return;
                            }
                            bars.forEach(b => {
                                if (Math.random() > 0.4) b.classList.add('active');
                                else b.classList.remove('active');
                            });
                        }, 120);
                    }

                    this.startSpeakingFlow(text, () => {
                        icon.setAttribute('data-lucide', 'play');
                        if (window.lucide) window.lucide.createIcons();
                    });
                }
            });
        });
    }

    startListeningFlow() {
        if (this.isListening) return;
        this.isListening = true;
        
        voice.stopSpeaking();
        this.isSpeaking = false;

        const sendBtn = document.getElementById('sofia-send-btn');
        const chatStatus = document.getElementById('sofia-chat-status');
        const headerVisualizer = document.getElementById('header-visualizer');
        const textInput = document.getElementById('sofia-text-input');

        sendBtn.classList.add('recording-active');
        sendBtn.innerHTML = `<i data-lucide="square"></i>`;
        chatStatus.textContent = "gravando áudio...";
        chatStatus.classList.add('listening');
        headerVisualizer.classList.add('listening');
        
        if (textInput) {
            textInput.disabled = true;
            textInput.placeholder = "Escutando relato de voz...";
        }

        if (window.lucide) window.lucide.createIcons();

        voice.startListening({
            onStart: () => {
                console.log('Reconhecimento de fala iniciado.');
            },
            onResult: (text) => {
                this.addMessageToChat('user', text, 'audio');
                this.processClinicalInput(text);
            },
            onError: (err) => {
                this.addMessageToChat('sofia', `Desculpe, tive um problema ao capturar o áudio: ${err}. Por favor, tente novamente ou digite abaixo.`, 'text');
                this.stopListeningFlow();
            },
            onEnd: () => {
                this.stopListeningFlow();
            }
        });
    }

    stopListeningFlow() {
        if (!this.isListening) return;
        this.isListening = false;

        const sendBtn = document.getElementById('sofia-send-btn');
        const chatStatus = document.getElementById('sofia-chat-status');
        const headerVisualizer = document.getElementById('header-visualizer');
        const textInput = document.getElementById('sofia-text-input');

        if (sendBtn) {
            sendBtn.classList.remove('recording-active');
            sendBtn.innerHTML = `<i data-lucide="mic"></i>`;
        }
        if (chatStatus) {
            chatStatus.textContent = "online";
            chatStatus.classList.remove('listening');
        }
        if (headerVisualizer) {
            headerVisualizer.classList.remove('listening');
        }
        if (textInput) {
            textInput.disabled = false;
            textInput.placeholder = "Digite uma anotação de saúde...";
            textInput.focus();
        }

        if (window.lucide) window.lucide.createIcons();

        voice.stopListening();
    }

    handleTextInput() {
        const input = document.getElementById('sofia-text-input');
        const text = input.value.trim();
        if (!text) return;

        input.value = '';
        
        // Restore mic button state
        const sendBtn = document.getElementById('sofia-send-btn');
        sendBtn.classList.add('mic-mode');
        sendBtn.setAttribute('title', 'Gravar Voz');
        const icon = sendBtn.querySelector('i');
        if (icon) icon.setAttribute('data-lucide', 'mic');
        if (window.lucide) window.lucide.createIcons();

        this.addMessageToChat('user', text, 'text');
        this.processClinicalInput(text);
    }

    addMessageToChat(sender, text, type = 'text', attachment = null) {
        let duration = null;
        if (type === 'audio') {
            const seconds = Math.max(3, Math.min(25, Math.floor(text.length / 10)));
            duration = `0:${String(seconds).padStart(2, '0')}`;
        }

        this.chatHistory.push({ 
            sender, 
            text, 
            time: this.getCurrentFormattedTime(), 
            type, 
            attachment, 
            duration 
        });
        
        const msgBox = document.getElementById('sofia-chat-messages-box');
        if (msgBox) {
            const typingIndicator = document.getElementById('sofia-typing-indicator');
            msgBox.innerHTML = this.renderChatTranscript();
            msgBox.appendChild(typingIndicator);
            this.scrollToBottom();
            this.bindAudioButtons();
        }
    }

    async processClinicalInput(text) {
        const typingIndicator = document.getElementById('sofia-typing-indicator');
        if (typingIndicator) typingIndicator.classList.remove('hidden');
        const chatStatus = document.getElementById('sofia-chat-status');
        if (chatStatus) chatStatus.textContent = "digitando...";
        this.scrollToBottom();

        // Obter informações do autor logado
        const selectedAuthor = AUTHORS_LIST.find(a => a.key === this.activeAuthorKey) || AUTHORS_LIST[0];

        // Inteligência de Roteamento Clínico (Análise Semântica Local)
        const textLower = text.toLowerCase();
        let type = 'geral';
        let authorName = selectedAuthor.name;
        let authorRole = selectedAuthor.role;
        let authorAvatar = selectedAuthor.avatar;
        let metadata = {};
        let speakResponse = '';

        const patient = await api.getActiveProfile();

        if (textLower.includes('dor') || textLower.includes('febre') || textLower.includes('tontura') || textLower.includes('pressão') || textLower.includes('sintoma') || textLower.includes('enjoo') || textLower.includes('tosse')) {
            type = 'sintoma';
            let symptom = 'Sintoma Relatado';
            if (textLower.includes('febre')) symptom = 'Febre';
            else if (textLower.includes('dor de cabeça')) symptom = 'Dor de cabeça';
            else if (textLower.includes('tontura')) symptom = 'Tontura leve';
            else if (textLower.includes('dor no peito')) symptom = 'Dor no peito';
            else if (textLower.includes('pressão')) symptom = 'Pressão Arterial';
            
            metadata = { symptom, severity: 'Observado' };
            speakResponse = `${patient.name}, registrei: 'um sintoma de ${symptom} observado' salvo no histórico.`;
        } 
        else if (textLower.includes('receita') || textLower.includes('losartana') || textLower.includes('remedio') || textLower.includes('remédio') || textLower.includes('comprimido') || textLower.includes('gotas') || textLower.includes('paracetamol') || textLower.includes('dipirona')) {
            type = 'medicamento';
            let medicationName = 'Medicamento';
            if (textLower.includes('losartana')) medicationName = 'Losartana Potássica';
            else if (textLower.includes('paracetamol')) medicationName = 'Paracetamol';
            else if (textLower.includes('dipirona')) medicationName = 'Dipirona';
            
            metadata = { medicationName, action: 'Administração/Ajuste' };
            speakResponse = `${patient.name}, registrei: 'uso do medicamento ${medicationName}' salvo no histórico.`;
        } 
        else if (textLower.includes('exame') || textLower.includes('sangue') || textLower.includes('laboratório') || textLower.includes('resultado') || textLower.includes('laudo') || textLower.includes('coleta')) {
            type = 'exame';
            metadata = { examType: 'Exame Geral', status: 'Anexado' };
            speakResponse = `${patient.name}, registrei: 'um exame clínico anexado' salvo no histórico.`;
        } 
        else {
            type = 'geral';
            speakResponse = `${patient.name}, registrei: 'um relato geral de saúde' salvo no histórico.`;
        }

        setTimeout(async () => {
            // Grava na base de dados SQLite
            await api.addEvent(patient.id, {
                type,
                authorName,
                authorRole,
                authorAvatar,
                description: text,
                metadata
            });

            if (typingIndicator) typingIndicator.classList.add('hidden');
            if (chatStatus) chatStatus.textContent = "online";

            this.addMessageToChat('sofia', speakResponse, 'text');
            this.startSpeakingFlow(speakResponse);
        }, 3000);
    }

    startSpeakingFlow(text, onEnd = null) {
        this.isSpeaking = true;
        const chatStatus = document.getElementById('sofia-chat-status');
        const headerVisualizer = document.getElementById('header-visualizer');

        if (chatStatus) {
            chatStatus.textContent = "reproduzindo áudio...";
            chatStatus.classList.add('speaking');
        }
        if (headerVisualizer) {
            headerVisualizer.classList.add('speaking');
        }

        voice.speak(text, () => {
            this.stopSpeakingFlow();
            if (onEnd) onEnd();
        });
    }

    stopSpeakingFlow() {
        this.isSpeaking = false;
        const chatStatus = document.getElementById('sofia-chat-status');
        const headerVisualizer = document.getElementById('header-visualizer');

        if (chatStatus) {
            chatStatus.textContent = "online";
            chatStatus.classList.remove('speaking');
        }
        if (headerVisualizer) {
            headerVisualizer.classList.remove('speaking');
        }
    }

    openCameraModal() {
        const modal = document.getElementById('global-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body-content');
        
        modalTitle.textContent = "Câmera Sofia — Registro Clínico";
        modalBody.innerHTML = `
            <div class="camera-view-container">
                <p style="font-size: 12px; color: var(--color-neutral-muted); text-align: center; margin-bottom: 6px;">Posicione a receita, exame ou sintoma na tela</p>
                <video id="camera-video" autoplay playsinline></video>
                <canvas id="camera-canvas"></canvas>
                
                <label for="file-upload-input" class="file-upload-label" id="file-upload-btn-label">
                    <i data-lucide="upload"></i>
                    Ou selecione um arquivo do rolo
                </label>
                <input type="file" id="file-upload-input" accept="image/*">
                
                <div class="camera-controls">
                    <button class="camera-btn cancel" id="camera-close-btn">Voltar</button>
                    <button class="camera-btn capture" id="camera-capture-btn">Tirar Foto</button>
                </div>
            </div>
        `;
        
        modal.classList.remove('hidden');
        if (window.lucide) window.lucide.createIcons();

        const video = document.getElementById('camera-video');
        const canvas = document.getElementById('camera-canvas');
        const captureBtn = document.getElementById('camera-capture-btn');
        const closeBtn = document.getElementById('camera-close-btn');
        const fileInput = document.getElementById('file-upload-input');
        
        let usingWebcam = false;
        vision.startCamera(video).then(success => {
            usingWebcam = success;
            if (!success) {
                video.style.display = 'none';
                const helperText = document.createElement('div');
                helperText.innerHTML = `
                    <div style="padding: 24px; text-align: center; border: 1px solid var(--color-neutral-border); background-color: var(--color-neutral-light); border-radius: var(--radius-lg); width: 100%;">
                        <i data-lucide="camera-off" style="width: 32px; height: 32px; color: var(--color-neutral-muted); margin-bottom: 8px;"></i>
                        <p style="font-size: 13px; font-weight: 600; color: var(--color-neutral-dark);">Acesso à Câmera Bloqueado</p>
                        <p style="font-size: 11px; color: var(--color-neutral-muted); margin-top: 4px;">Por favor, faça upload de uma imagem do rolo ou conceda permissão de câmera ao navegador.</p>
                    </div>
                `;
                video.parentNode.insertBefore(helperText, video);
                captureBtn.style.display = 'none';
                if (window.lucide) window.lucide.createIcons();
            }
        });

        const handleImageProcessing = async (base64Data, chosenType = 'geral') => {
            vision.stopCamera();
            
            modalBody.innerHTML = `
                <div class="loading-screen">
                    <div class="spinner"></div>
                    <p style="font-weight: 600; color: var(--color-neutral-dark);">Analisando Imagem...</p>
                    <p style="font-size: 11px; color: var(--color-neutral-muted); text-align: center; max-width: 250px;">A Inteligência da Sofia está interpretando e classificando o anexo clínico.</p>
                </div>
            `;
            
            const analysis = await vision.analyzeImage(base64Data, chosenType);
            const patient = await api.getActiveProfile();
            const selectedAuthor = AUTHORS_LIST.find(a => a.key === this.activeAuthorKey) || AUTHORS_LIST[0];

            await api.addEvent(patient.id, {
                type: chosenType,
                authorName: selectedAuthor.name,
                authorRole: selectedAuthor.role,
                authorAvatar: selectedAuthor.avatar,
                description: `Foto anexada de ${chosenType === 'sintoma' ? 'alteração física' : chosenType === 'exame' ? 'laudo médico' : 'receita'}. Detalhes: ${analysis.description}`,
                attachment: base64Data,
                metadata: analysis.metadata
            });

            modal.classList.add('hidden');
            
            const labelText = chosenType === 'sintoma' ? 'sintoma/alteração na pele' : chosenType === 'exame' ? 'exame/laudo' : 'receituário/medicamento';
            const msgText = `Imagem de ${labelText} registrada com sucesso. Detalhes detectados pela Sofia: ${analysis.description}`;
            this.addMessageToChat('user', msgText, 'image', base64Data);

            const typingIndicator = document.getElementById('sofia-typing-indicator');
            if (typingIndicator) typingIndicator.classList.remove('hidden');
            const chatStatus = document.getElementById('sofia-chat-status');
            if (chatStatus) chatStatus.textContent = "digitando...";
            this.scrollToBottom();

            setTimeout(() => {
                if (typingIndicator) typingIndicator.classList.add('hidden');
                if (chatStatus) chatStatus.textContent = "online";
                
                const confirmMsg = `${patient.name}, registrei: 'foto do anexo de ${chosenType === 'sintoma' ? 'Sintoma' : chosenType === 'exame' ? 'Exame' : 'Medicamento'}' salva no histórico.`;
                this.addMessageToChat('sofia', confirmMsg, 'text');
                this.startSpeakingFlow(confirmMsg);
            }, 3000);
        };

        captureBtn.addEventListener('click', () => {
            if (usingWebcam) {
                const classificationOptions = document.createElement('div');
                classificationOptions.innerHTML = `
                    <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 14px; width: 100%;">
                        <p style="font-size: 12px; font-weight: 700; text-align: center;">Classificar esta Imagem como:</p>
                        <button class="shortcut-btn" id="cls-sintoma" style="background-color: #FEF2F2; border-color: #FCA5A5; color: var(--color-danger);"><i data-lucide="thermometer"></i> Alteração na Pele / Sintoma</button>
                        <button class="shortcut-btn" id="cls-exame" style="background-color: #F0F9FF; border-color: #7DD3FC; color: var(--color-secondary);"><i data-lucide="file-text"></i> Exame Laboratorial / Laudo</button>
                        <button class="shortcut-btn" id="cls-med" style="background-color: var(--color-primary-light); border-color: #86EFAC; color: var(--color-primary-dark);"><i data-lucide="pill"></i> Caixa de Remédio / Receita</button>
                    </div>
                `;
                
                const base64 = vision.takeSnapshot(video, canvas);
                video.style.display = 'none';
                captureBtn.style.display = 'none';
                document.getElementById('file-upload-btn-label').style.display = 'none';
                
                const imgPreview = document.createElement('img');
                imgPreview.src = base64;
                imgPreview.style.width = '100%';
                imgPreview.style.borderRadius = 'var(--radius-lg)';
                video.parentNode.insertBefore(imgPreview, video);
                video.parentNode.insertBefore(classificationOptions, video.nextSibling);
                if (window.lucide) window.lucide.createIcons();

                document.getElementById('cls-sintoma').addEventListener('click', () => handleImageProcessing(base64, 'sintoma'));
                document.getElementById('cls-exame').addEventListener('click', () => handleImageProcessing(base64, 'exame'));
                document.getElementById('cls-med').addEventListener('click', () => handleImageProcessing(base64, 'medicamento'));
            }
        });

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const base64 = event.target.result;
                    let selectedType = 'exame';
                    if (file.name.toLowerCase().includes('pele') || file.name.toLowerCase().includes('mancha')) {
                        selectedType = 'sintoma';
                    } else if (file.name.toLowerCase().includes('receita') || file.name.toLowerCase().includes('remedio')) {
                        selectedType = 'medicamento';
                    }
                    handleImageProcessing(base64, selectedType);
                };
                reader.readAsDataURL(file);
            }
        });

        closeBtn.addEventListener('click', () => {
            vision.stopCamera();
            modal.classList.add('hidden');
        });
        
        document.getElementById('close-modal-x').addEventListener('click', () => {
            vision.stopCamera();
        });
    }
}
