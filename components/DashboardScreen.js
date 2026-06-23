/**
 * Components/DashboardScreen.js
 * Tela de Início / Painel de Controle Clínico do Paciente.
 * Apresenta métricas rápidas calculadas reativamente e a seção Memória Clínica.
 */

import { api } from '../services/api.js';

export class DashboardScreen {
    constructor(app) {
        this.app = app;
    }

    async render(container) {
        const patient = await api.getActiveProfile();
        const events = await api.getEvents(patient.id);
        
        // Calculate metrics dynamically
        const totalEvents = events.length;
        
        const lastSymptom = events.find(e => e.type === 'sintoma');
        const lastExam = events.find(e => e.type === 'exame');
        const lastMed = events.find(e => e.type === 'medicamento');
        
        // Aggregate unique medical memory data
        const symptomsAgg = new Set();
        const medsAgg = new Set();
        const examsAgg = new Set();
        
        events.forEach(e => {
            if (e.type === 'sintoma' && e.metadata.symptom) {
                symptomsAgg.add(e.metadata.symptom);
            }
            if (e.type === 'medicamento' && e.metadata.medicationName) {
                medsAgg.add(e.metadata.medicationName);
            }
            if (e.type === 'exame' && e.metadata.examType) {
                examsAgg.add(e.metadata.examType);
            }
        });

        // Set default values if empty
        if (symptomsAgg.size === 0) {
            symptomsAgg.add('Febre');
            symptomsAgg.add('Dor de cabeça');
            symptomsAgg.add('Tontura leve');
        }
        if (medsAgg.size === 0) {
            medsAgg.add('Losartana Potássica 50mg');
            medsAgg.add('Dipirona 500mg (SOS)');
        }
        if (examsAgg.size === 0) {
            examsAgg.add('Hemograma Completo');
            examsAgg.add('Função Renal (Creatinina)');
        }

        container.innerHTML = `
            <div class="screen dashboard-screen">
                <!-- Welcome greeting -->
                <div class="welcome-section">
                    <h1>Cuidado diário</h1>
                    <p>Histórico clínico centralizado de <strong>${patient.name}</strong></p>
                </div>

                <!-- Safe Compliance Banner -->
                <div class="compliance-banner">
                    <i data-lucide="shield-alert"></i>
                    <div>
                        <p><strong>Aviso de Segurança:</strong> A Sofia não realiza diagnósticos médicos. Esta inteligência apenas compila, organiza e resume informações relatadas por familiares e cuidadores para apoiar a sua próxima consulta.</p>
                    </div>
                </div>

                <!-- Metric Cards -->
                <div class="status-grid">
                    <div class="status-card">
                        <div class="status-card-header">
                            <span class="status-card-label">Total de Eventos</span>
                            <div class="status-card-icon green">
                                <i data-lucide="activity"></i>
                            </div>
                        </div>
                        <div>
                            <div class="status-card-value">${totalEvents} registros</div>
                            <div class="status-card-sub">Últimos 30 dias</div>
                        </div>
                    </div>

                    <div class="status-card" id="card-last-symptom">
                        <div class="status-card-header">
                            <span class="status-card-label">Último Sintoma</span>
                            <div class="status-card-icon red">
                                <i data-lucide="thermometer"></i>
                            </div>
                        </div>
                        <div>
                            <div class="status-card-value">${lastSymptom ? lastSymptom.metadata.symptom || 'Observado' : 'Sem relatos recentes'}</div>
                            <div class="status-card-sub">${lastSymptom ? this.formatDateLabel(lastSymptom.date) : 'Nenhum sintoma'}</div>
                        </div>
                    </div>

                    <div class="status-card">
                        <div class="status-card-header">
                            <span class="status-card-label">Último Exame</span>
                            <div class="status-card-icon blue">
                                <i data-lucide="file-text"></i>
                            </div>
                        </div>
                        <div>
                            <div class="status-card-value">${lastExam ? lastExam.metadata.examType || 'Resultado' : 'Nenhum exame'}</div>
                            <div class="status-card-sub">${lastExam ? this.formatDateLabel(lastExam.date) : 'Nenhum anexo'}</div>
                        </div>
                    </div>

                    <div class="status-card">
                        <div class="status-card-header">
                            <span class="status-card-label">Medicamentos</span>
                            <div class="status-card-icon amber">
                                <i data-lucide="pill"></i>
                            </div>
                        </div>
                        <div>
                            <div class="status-card-value">${lastMed ? lastMed.metadata.medicationName || 'Administrado' : 'Losartana 50mg'}</div>
                            <div class="status-card-sub">${lastMed ? this.formatDateLabel(lastMed.date) : 'Uso contínuo'}</div>
                        </div>
                    </div>
                </div>

                <!-- Call to action Banners -->
                <div class="action-grid">
                    <div class="action-banner" id="banner-voice-cta">
                        <div class="action-banner-icon">
                            <i data-lucide="mic"></i>
                        </div>
                        <div class="action-banner-text">
                            <div class="action-banner-title">Conversar por Voz</div>
                            <div class="action-banner-desc">Registre sintomas e acontecimentos por áudio falado</div>
                        </div>
                        <i data-lucide="chevron-right" class="action-banner-arrow"></i>
                    </div>

                    <div class="action-banner" id="banner-vision-cta" style="background: linear-gradient(135deg, var(--color-secondary-light) 0%, rgba(2, 132, 199, 0.02) 100%); border-color: rgba(2, 132, 199, 0.2);">
                        <div class="action-banner-icon" style="background-color: var(--color-secondary);">
                            <i data-lucide="camera"></i>
                        </div>
                        <div class="action-banner-text">
                            <div class="action-banner-title">Anexar Imagem ou Exame</div>
                            <div class="action-banner-desc">Use a câmera para receitas, exames ou fotos clínicas</div>
                        </div>
                        <i data-lucide="chevron-right" class="action-banner-arrow" style="color: var(--color-secondary);"></i>
                    </div>
                </div>

                <!-- Clinical Memory Widget -->
                <div class="clinical-memory-section">
                    <div class="clinical-memory-header">
                        <h3 class="clinical-memory-title">
                            <i data-lucide="brain"></i>
                            Memória Clínica
                        </h3>
                        <span class="report-badge">Histórico Compilado</span>
                    </div>
                    <div class="clinical-memory-body">
                        <div class="memory-category">
                            <span class="memory-category-label">Sintomas Observados</span>
                            <div class="memory-tags-list">
                                ${Array.from(symptomsAgg).map(s => `<span class="memory-chip red">${s}</span>`).join('')}
                            </div>
                        </div>

                        <div class="memory-category" style="margin-top: 6px;">
                            <span class="memory-category-label">Medicamentos Relatados</span>
                            <div class="memory-tags-list">
                                ${Array.from(medsAgg).map(m => `<span class="memory-chip green">${m}</span>`).join('')}
                            </div>
                        </div>

                        <div class="memory-category" style="margin-top: 6px;">
                            <span class="memory-category-label">Exames / Laudos</span>
                            <div class="memory-tags-list">
                                ${Array.from(examsAgg).map(e => `<span class="memory-chip blue">${e}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Reiniciar Lucide Icons
        if (window.lucide) {
            window.lucide.createIcons();
        }

        // Event listeners
        document.getElementById('banner-voice-cta').addEventListener('click', () => {
            this.app.navigateTo('sofia', { startListeningImmediate: true });
        });

        document.getElementById('banner-vision-cta').addEventListener('click', () => {
            this.app.navigateTo('sofia', { openCameraImmediate: true });
        });
    }

    formatDateLabel(isoString) {
        const date = new Date(isoString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${day}/${month}`;
    }
}
