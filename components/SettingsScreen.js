/**
 * Components/SettingsScreen.js
 * Tela de Configurações / Ajustes da demonstração.
 * Permite gerenciar chaves de API, simular delays de servidor e resetar o banco de dados.
 * Suporta carga dinâmica de vozes do ElevenLabs com base na API Key configurada.
 */

import { api } from '../services/api.js';

export class SettingsScreen {
    constructor(app) {
        this.app = app;
    }

    async render(container) {
        const settings = await api.getSettings();

        container.innerHTML = `
            <div class="screen settings-screen">
                <div class="welcome-section">
                    <h1>Configurações</h1>
                    <p>Ajustes de integrações e preferências para a apresentação da demo</p>
                </div>
 
                <!-- Preference Settings -->
                <div class="settings-group">
                    <h3 class="settings-group-title">Preferências Locais</h3>
                    
                    <div class="settings-row">
                        <div class="settings-row-label">
                            <span class="settings-title">Síntese de Voz (Áudio)</span>
                            <span class="settings-desc">Permite que a Sofia responda lendo o texto em voz alta</span>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="sett-audio-toggle" ${settings.audioFeedback ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>

                    <div class="settings-row">
                        <div class="settings-row-label">
                            <span class="settings-title">Simular Latência de Rede</span>
                            <span class="settings-desc">Adiciona atrasos de 1.5s para emular chamadas reais em nuvem</span>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="sett-delay-toggle" ${settings.networkDelay ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>

                <!-- API Keys & Integrations -->
                <div class="settings-group">
                    <h3 class="settings-group-title">Chaves de API (Integrações)</h3>
                    <p style="font-size: 10px; color: var(--color-neutral-muted); margin-bottom: 12px; line-height: 1.3;">Chaves salvas localmente no navegador. Prontas para conexão com servidores de IA.</p>
                    
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        <div>
                            <label style="font-size: 11px; font-weight: 600; color: var(--color-neutral-muted);">ElevenLabs API Key</label>
                            <div style="display: flex; gap: 8px; align-items: center; margin-top: 4px;">
                                <input type="password" id="sett-api-eleven" value="${settings.apiKeyElevenLabs || ''}" placeholder="Ex: el_key_..." class="settings-api-input" style="margin-top: 0; flex: 1;">
                                <button class="report-btn secondary" id="btn-load-voices" style="height: 38px; font-size: 11px; padding: 0 12px; white-space: nowrap; margin-top: 0; margin-bottom: 0;">
                                    Carregar Vozes
                                </button>
                            </div>
                        </div>

                        <div>
                            <label style="font-size: 11px; font-weight: 600; color: var(--color-neutral-muted);">Agente de Voz Ativo (ElevenLabs)</label>
                            <select id="sett-voice-agent" style="width: 100%; height: 38px; border: 1px solid var(--color-neutral-border); border-radius: var(--radius-sm); font-size: 12px; padding: 0 8px; outline: none; background-color: white; margin-top: 4px;">
                                <option value="21m00Tcm4TlvDq8ikWAM" ${(settings.selectedVoice || '21m00Tcm4TlvDq8ikWAM') === '21m00Tcm4TlvDq8ikWAM' ? 'selected' : ''}>Rachel (Feminina - Acolhedora)</option>
                                <option value="29vD33N1CtxCmqQRPOHJ" ${(settings.selectedVoice || '21m00Tcm4TlvDq8ikWAM') === '29vD33N1CtxCmqQRPOHJ' ? 'selected' : ''}>Drew (Masculino - Profissional/Médico)</option>
                                <option value="2EiwWnXF2V4jofwvRn1m" ${(settings.selectedVoice || '21m00Tcm4TlvDq8ikWAM') === '2EiwWnXF2V4jofwvRn1m' ? 'selected' : ''}>Clyde (Masculino - Narrativa Calma)</option>
                                <option value="5Q0t7uMcpie8Y9ZrBhCD" ${(settings.selectedVoice || '21m00Tcm4TlvDq8ikWAM') === '5Q0t7uMcpie8Y9ZrBhCD' ? 'selected' : ''}>Paul (Masculino - Diálogo Neutro)</option>
                            </select>
                        </div>
                        
                        <div>
                            <label style="font-size: 11px; font-weight: 600; color: var(--color-neutral-muted);">OpenAI API Key (Whisper/GPT)</label>
                            <input type="password" id="sett-api-openai" value="${settings.apiKeyOpenAI || ''}" placeholder="Ex: sk-proj-..." class="settings-api-input">
                        </div>

                        <div>
                            <label style="font-size: 11px; font-weight: 600; color: var(--color-neutral-muted);">Modelo de LLM Ativo</label>
                            <select id="sett-llm-model" style="width: 100%; height: 38px; border: 1px solid var(--color-neutral-border); border-radius: var(--radius-sm); font-size: 12px; padding: 0 8px; outline: none; background-color: white; margin-top: 4px;">
                                <option value="gpt-4o" ${(settings.selectedLlm || 'gpt-4o') === 'gpt-4o' ? 'selected' : ''}>GPT-4o (Completo & Recomendado)</option>
                                <option value="gpt-4o-mini" ${(settings.selectedLlm || 'gpt-4o') === 'gpt-4o-mini' ? 'selected' : ''}>GPT-4o Mini (Mais rápido)</option>
                                <option value="o1-mini" ${(settings.selectedLlm || 'gpt-4o') === 'o1-mini' ? 'selected' : ''}>o1-mini (Raciocínio Clínico Rápido)</option>
                                <option value="o1-preview" ${(settings.selectedLlm || 'gpt-4o') === 'o1-preview' ? 'selected' : ''}>o1-preview (Complexidade Médica)</option>
                                <option value="claude-3-5-sonnet" ${(settings.selectedLlm || 'gpt-4o') === 'claude-3-5-sonnet' ? 'selected' : ''}>Claude 3.5 Sonnet (Antropia - Escrita)</option>
                            </select>
                        </div>

                        <div>
                            <label style="font-size: 11px; font-weight: 600; color: var(--color-neutral-muted);">Supabase Endpoint URL</label>
                            <input type="text" id="sett-api-supabase" value="${settings.apiEndpointSupabase || ''}" placeholder="Ex: https://xxxx.supabase.co" class="settings-api-input">
                        </div>
                        
                        <button class="report-btn primary" id="btn-save-settings" style="height: 38px; font-size: 12px; margin-top: 6px;">
                            Salvar Configurações
                        </button>
                    </div>
                </div>

                <!-- System Reset -->
                <div class="settings-group" style="border-color: #FCA5A5; background-color: #FFF5F5;">
                    <h3 class="settings-group-title" style="color: var(--color-danger);">Zerar Demonstração</h3>
                    <p style="font-size: 11px; color: var(--color-neutral-muted); margin-bottom: 12px; line-height: 1.3;">Apaga todos os eventos e perfis criados e restaura o histórico mockado padrão de 30 dias de Maria Aparecida.</p>
                    
                    <button class="danger-btn" id="btn-reset-database">
                        Restaurar Dados Mockados
                    </button>
                </div>

            </div>
        `;

        if (window.lucide) {
            window.lucide.createIcons();
        }

        // Toggle changes
        document.getElementById('sett-audio-toggle').addEventListener('change', async (e) => {
            const current = await api.getSettings();
            current.audioFeedback = e.target.checked;
            await api.saveSettings(current);
        });

        document.getElementById('sett-delay-toggle').addEventListener('change', async (e) => {
            const current = await api.getSettings();
            current.networkDelay = e.target.checked;
            await api.saveSettings(current);
        });

        // Load voices function
        const loadVoices = async (apiKey) => {
            if (!apiKey || apiKey.trim() === '') return;
            const selectEl = document.getElementById('sett-voice-agent');
            if (!selectEl) return;
            
            const originalHtml = selectEl.innerHTML;
            selectEl.innerHTML = '<option value="">Carregando vozes do ElevenLabs...</option>';
            
            try {
                const response = await fetch('https://api.elevenlabs.io/v1/voices', {
                    headers: { 'xi-api-key': apiKey }
                });
                
                if (!response.ok) throw new Error('Erro na API da ElevenLabs');
                
                const data = await response.json();
                if (data.voices && data.voices.length > 0) {
                    let html = '';
                    data.voices.forEach(v => {
                        const gender = v.labels && v.labels.gender ? ` - ${v.labels.gender}` : '';
                        const isSelected = (settings.selectedVoice || '21m00Tcm4TlvDq8ikWAM') === v.voice_id ? 'selected' : '';
                        html += `<option value="${v.voice_id}" ${isSelected}>${v.name}${gender}</option>`;
                    });
                    selectEl.innerHTML = html;
                } else {
                    selectEl.innerHTML = originalHtml;
                }
            } catch (err) {
                console.error('Falha ao obter vozes da ElevenLabs:', err);
                selectEl.innerHTML = originalHtml;
            }
        };

        // Click handler to load voices
        document.getElementById('btn-load-voices').addEventListener('click', () => {
            const key = document.getElementById('sett-api-eleven').value.trim();
            if (!key) {
                alert('Por favor, insira a ElevenLabs API Key primeiro.');
                return;
            }
            loadVoices(key);
        });

        // Automatic voice load on Settings screen launch
        if (settings.apiKeyElevenLabs && settings.apiKeyElevenLabs.trim() !== '') {
            setTimeout(() => {
                loadVoices(settings.apiKeyElevenLabs.trim());
            }, 100);
        }

        // Save settings handler
        document.getElementById('btn-save-settings').addEventListener('click', async () => {
            const current = await api.getSettings();
            current.apiKeyElevenLabs = document.getElementById('sett-api-eleven').value.trim();
            current.apiKeyOpenAI = document.getElementById('sett-api-openai').value.trim();
            current.apiEndpointSupabase = document.getElementById('sett-api-supabase').value.trim();
            
            current.selectedVoice = document.getElementById('sett-voice-agent').value;
            current.selectedLlm = document.getElementById('sett-llm-model').value;
            
            await api.saveSettings(current);
            alert('Configurações salvas com sucesso!');
        });

        // Reset Database
        document.getElementById('btn-reset-database').addEventListener('click', async () => {
            if (confirm('Deseja mesmo redefinir todos os registros de saúde da demo para o estado original de 30 dias?')) {
                await api.resetDatabase();
                this.app.updateHeaderPatientContext();
                alert('Histórico redefinido com sucesso!');
                this.app.navigateTo('home');
            }
        });
    }
}
