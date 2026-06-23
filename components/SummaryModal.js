/**
 * Components/SummaryModal.js
 * Modal de Resumo Pré-Consulta da Sofia.
 * Compila cronologicamente os relatos clínicos em formato de prontuário estruturado para médicos.
 * Agrupa os sintomas por especialidade recomendada e calcula um score de prioridade com base nos riscos.
 */

import { api } from '../services/api.js';

const SPECIALIST_MAPPING = [
    {
        keywords: ['pressão', 'peito', 'hipertensão', 'losartana', 'cardíaco', 'palpitação', 'arterial', 'médica', 'médico'],
        specialists: ['Cardiologista', 'Clínico Geral'],
        term: 'Cardiovascular'
    },
    {
        keywords: ['dor de cabeça', 'tontura', 'tonto', 'cabeça', 'desmaio', 'escorregou', 'fraqueza', 'perna', 'pernas', 'queda', 'cair'],
        specialists: ['Neurologista', 'Geriatra'],
        term: 'Neurológico / Locomotor'
    },
    {
        keywords: ['febre', 'temperatura', 'térmico', 'infecção', 'calafrio', 'axilar', 'quente', 'dipirona'],
        specialists: ['Infectologista', 'Clínico Geral'],
        term: 'Infeccioso / Inflamatório'
    },
    {
        keywords: ['mancha', 'perna', 'pele', 'coceira', 'eritema', 'vermelhidão', 'dermatologia', 'panturrilha'],
        specialists: ['Dermatologista'],
        term: 'Dermatológico'
    }
];

export class SummaryModal {
    constructor(app) {
        this.app = app;
    }

    analyzeSymptoms(symptoms, events) {
        const groups = {};
        const allSpecialists = new Set();
        let baseScore = 1;
        const reasons = [];

        // Check for specific severe symptoms
        const textContent = events.map(e => e.description.toLowerCase()).join(' ');

        if (textContent.includes('dor no peito') || textContent.includes('peito apertado')) {
            baseScore += 5;
            reasons.push('Dor/desconforto torácico ou dor no peito relatada');
        }
        if (textContent.includes('pressão') || textContent.includes('hipertensão') || textContent.includes('14 por 9') || textContent.includes('138/85')) {
            baseScore += 2;
            reasons.push('Flutuação ou níveis elevados de Pressão Arterial');
        }
        if (textContent.includes('febre') || textContent.includes('temperatura') || textContent.includes('37.9')) {
            baseScore += 2;
            reasons.push('Pico febril registrado');
        }
        if (textContent.includes('tontura') || textContent.includes('tonto')) {
            baseScore += 2;
            reasons.push('Relato de tontura ou instabilidade postural');
        }
        if (textContent.includes('escorregou') || textContent.includes('fraqueza') || textContent.includes('queda')) {
            baseScore += 2;
            reasons.push('Fraqueza motora ou relato de escorregão/queda');
        }

        // Check for multiple authors reporting symptoms (Consensus)
        const symptomAuthors = new Set(events.filter(e => e.type === 'sintoma').map(e => e.authorName));
        if (symptomAuthors.size > 1) {
            baseScore += 1;
            reasons.push(`Consenso clínico: ${symptomAuthors.size} observadores registraram queixas`);
        }

        const score = Math.max(1, Math.min(10, baseScore));
        let priorityLevel = 'Baixa';
        let priorityColor = '#10B981'; // Green
        
        if (score >= 4 && score <= 6) {
            priorityLevel = 'Média';
            priorityColor = '#F59E0B'; // Amber
        } else if (score >= 7 && score <= 8) {
            priorityLevel = 'Alta';
            priorityColor = '#EA580C'; // Orange
        } else if (score >= 9) {
            priorityLevel = 'Crítica / Urgente';
            priorityColor = '#EF4444'; // Red
        }

        // Map symptoms to specialties
        symptoms.forEach(s => {
            const descLower = s.desc.toLowerCase();
            let matched = false;
            
            SPECIALIST_MAPPING.forEach(map => {
                const matchesKeyword = map.keywords.some(keyword => descLower.includes(keyword));
                if (matchesKeyword) {
                    matched = true;
                    if (!groups[map.term]) {
                        groups[map.term] = {
                            specialists: map.specialists,
                            symptoms: []
                        };
                    }
                    groups[map.term].symptoms.push(s);
                    map.specialists.forEach(spec => allSpecialists.add(spec));
                }
            });

            if (!matched) {
                const generalTerm = 'Geral / Outros';
                if (!groups[generalTerm]) {
                    groups[generalTerm] = {
                        specialists: ['Clínico Geral'],
                        symptoms: []
                    };
                }
                groups[generalTerm].symptoms.push(s);
                allSpecialists.add('Clínico Geral');
            }
        });

        // Default reasons if empty
        if (reasons.length === 0) {
            reasons.push('Nenhum fator crítico de urgência detectado. Queixas leves.');
        }

        return {
            groups,
            score,
            priorityLevel,
            priorityColor,
            reasons,
            specialists: Array.from(allSpecialists)
        };
    }

    async show() {
        const patient = await api.getActiveProfile();
        const events = await api.getEvents(patient.id);
        
        const modal = document.getElementById('global-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body-content');
        
        modalTitle.textContent = "Resumo Pré-Consulta da Sofia";
        
        // Categorize logs dynamically
        const symptoms = [];
        const medications = [];
        const exams = [];
        const timelineLogs = [];

        events.forEach(evt => {
            const dateObj = new Date(evt.date);
            const formattedDate = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
            
            timelineLogs.push(`[${formattedDate}] ${evt.authorName} (${evt.authorRole}): ${evt.description}`);

            if (evt.type === 'sintoma') {
                symptoms.push({
                    date: formattedDate,
                    desc: evt.description,
                    author: `${evt.authorName} (${evt.authorRole})`
                });
            } else if (evt.type === 'medicamento') {
                medications.push({
                    date: formattedDate,
                    desc: evt.description,
                    author: `${evt.authorName} (${evt.authorRole})`
                });
            } else if (evt.type === 'exame') {
                exams.push({
                    date: formattedDate,
                    desc: evt.description,
                    author: `${evt.authorName} (${evt.authorRole})`
                });
            }
        });

        // Run Clinical Triage and Specialty Engine
        const analysis = this.analyzeSymptoms(symptoms, events);

        // HTML templates for sections
        const symptomsHtml = symptoms.length > 0 
            ? symptoms.map(s => `<li class="report-list-item"><span>${s.date}</span>: ${s.desc} <em>(Relatado por: ${s.author})</em></li>`).join('')
            : '<li class="report-list-item" style="list-style:none; color:var(--color-neutral-muted);">Nenhum sintoma observado registrado no período.</li>';

        const medicationsHtml = medications.length > 0
            ? medications.map(m => `<li class="report-list-item"><span>${m.date}</span>: ${m.desc} <em>(Relatado por: ${m.author})</em></li>`).join('')
            : '<li class="report-list-item" style="list-style:none; color:var(--color-neutral-muted);">Nenhuma medicação registrada no período.</li>';

        const examsHtml = exams.length > 0
            ? exams.map(e => `<li class="report-list-item"><span>${e.date}</span>: ${e.desc} <em>(Relatado por: ${e.author})</em></li>`).join('')
            : '<li class="report-list-item" style="list-style:none; color:var(--color-neutral-muted);">Nenhum exame ou anexo fotográfico no período.</li>';

        // HTML templates for grouped specialty cards
        let groupedSpecialtyCards = '';
        if (symptoms.length > 0) {
            Object.keys(analysis.groups).forEach(groupName => {
                const group = analysis.groups[groupName];
                groupedSpecialtyCards += `
                    <div style="background-color: var(--color-neutral-light); border: 1px solid var(--color-neutral-border); border-radius: var(--radius-sm); padding: 12px; margin-bottom: 10px; font-size: 12px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                            <strong style="color: var(--color-neutral-dark); text-transform: uppercase; font-size: 11px;">📦 ${groupName}</strong>
                            <span style="background-color: var(--color-primary-light); color: var(--color-primary-dark); font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: var(--radius-sm);">
                                ${group.specialists.join(' / ')}
                            </span>
                        </div>
                        <ul style="padding-left: 16px; margin: 0; color: var(--color-neutral-muted); line-height: 1.4;">
                            ${group.symptoms.map(s => `<li>[${s.date}] ${s.desc} <em>(por: ${s.author})</em></li>`).join('')}
                        </ul>
                    </div>
                `;
            });
        }

        modalBody.innerHTML = `
            <div class="summary-report">
                
                <!-- Report Header -->
                <div class="report-header">
                    <div class="report-title-row">
                        <div class="report-logo">
                            <i data-lucide="shield-plus"></i>
                            SOFIA MEMÓRIA CLÍNICA
                        </div>
                        <span class="report-badge">Histórico Clínico Observado</span>
                    </div>
                    
                    <div class="report-patient-meta">
                        <div class="report-meta-item"><span>Paciente:</span> ${patient.name}</div>
                        <div class="report-meta-item"><span>Idade:</span> ${patient.age} anos</div>
                        <div class="report-meta-item"><span>Convênio:</span> ${patient.healthPlan || 'Não informado'}</div>
                        <div class="report-meta-item"><span>Tipo Sanguíneo:</span> ${patient.bloodType || 'Desconhecido'}</div>
                    </div>
                </div>

                <!-- Safe Disclaimer Banner -->
                <div class="report-disclaimer">
                    <strong>ISENÇÃO DE RESPONSABILIDADE MÉDICA (COMPLIANCE):</strong> 
                    Este documento é uma compilação de relatos inseridos por familiares, cuidadores e pelo próprio paciente. A Sofia não realiza diagnósticos, conclusões clínicas ou recomendações de tratamentos. O intuito deste resumo é fornecer suporte descritivo para guiar e otimizar a avaliação do médico responsável.
                </div>

                <!-- Triage and Direction Dashboard -->
                ${symptoms.length > 0 ? `
                <div class="report-section" style="border: 1px solid var(--color-neutral-border); background-color: var(--color-white); padding: 16px; border-radius: var(--radius-lg); margin-bottom: 16px; box-shadow: var(--shadow-sm);">
                    <h4 class="report-section-title" style="color: var(--color-secondary-dark); display: flex; align-items: center; gap: 6px; margin-bottom: 12px; border:none; padding: 0;">
                        <i data-lucide="activity" style="width: 18px; height: 18px;"></i>
                        Triagem de Sintomas e Direcionamento
                    </h4>
                    
                    <div style="display: grid; grid-template-columns: 100px 1fr; gap: 16px; margin-bottom: 14px;">
                        <!-- Priority Card -->
                        <div style="background-color: ${analysis.priorityColor}10; border: 1px solid ${analysis.priorityColor}; border-radius: var(--radius-md); padding: 12px; text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center; height: 90px; width: 100px;">
                            <span style="font-size: 8px; font-weight: 700; color: ${analysis.priorityColor}; text-transform: uppercase; letter-spacing: 0.5px;">Prioridade</span>
                            <strong style="font-size: 26px; color: ${analysis.priorityColor}; font-family: var(--font-heading); line-height: 1.1; margin: 2px 0;">${analysis.score}/10</strong>
                            <span style="background-color: ${analysis.priorityColor}; color: white; font-size: 8px; font-weight: 700; padding: 1px 6px; border-radius: var(--radius-xl); text-transform: uppercase;">
                                ${analysis.priorityLevel}
                            </span>
                        </div>
                        
                        <!-- Factors -->
                        <div style="font-size: 11px; line-height: 1.4; color: var(--color-neutral-dark); display: flex; flex-direction: column; justify-content: center; gap: 4px;">
                            <strong style="font-size: 10px; text-transform: uppercase; color: var(--color-neutral-muted); letter-spacing: 0.5px;">Gatilhos de Alerta Detectados:</strong>
                            <ul style="padding-left: 14px; margin: 0; color: var(--color-neutral-muted); font-size: 11px;">
                                ${analysis.reasons.map(r => `<li>${r}</li>`).join('')}
                            </ul>
                        </div>
                    </div>

                    <div style="font-size: 11px; color: var(--color-neutral-dark); margin-bottom: 12px; line-height: 1.4; padding: 6px 10px; background-color: var(--color-neutral-light); border-radius: var(--radius-sm); border: 1px solid var(--color-neutral-border);">
                        <strong>Especialistas Indicados:</strong> ${analysis.specialists.join(', ')}
                    </div>
                    
                    <div>
                        <strong style="font-size: 10px; text-transform: uppercase; color: var(--color-neutral-muted); display: block; margin-bottom: 8px; letter-spacing: 0.5px;">Agrupamento por Especialidade Recomendada:</strong>
                        ${groupedSpecialtyCards}
                    </div>
                </div>
                ` : ''}

                <!-- Section 1: Symptoms -->
                <div class="report-section">
                    <h4 class="report-section-title">1. Lista Completa de Sintomas Observados</h4>
                    <ul class="report-list">
                        ${symptomsHtml}
                    </ul>
                </div>

                <!-- Section 2: Medications -->
                <div class="report-section">
                    <h4 class="report-section-title">2. Histórico de Medicamentos Citados</h4>
                    <ul class="report-list">
                        ${medicationsHtml}
                    </ul>
                </div>

                <!-- Section 3: Exams & Attachments -->
                <div class="report-section">
                    <h4 class="report-section-title">3. Exames e Registro de Imagens</h4>
                    <ul class="report-list">
                        ${examsHtml}
                    </ul>
                </div>

                <!-- Interactive Actions buttons -->
                <div class="report-actions">
                    <button class="report-btn secondary" id="btn-print-report">
                        <i data-lucide="printer"></i>
                        Imprimir Resumo
                    </button>
                    <button class="report-btn primary" id="btn-share-report">
                        <i data-lucide="share-2"></i>
                        Compartilhar
                    </button>
                </div>

            </div>
        `;

        modal.classList.remove('hidden');
        if (window.lucide) window.lucide.createIcons();

        // Share/Copy function
        const shareBtn = document.getElementById('btn-share-report');
        shareBtn.addEventListener('click', () => {
            const rawText = this.generateShareText(patient, symptoms, medications, exams, analysis);
            navigator.clipboard.writeText(rawText).then(() => {
                const originalText = shareBtn.innerHTML;
                shareBtn.innerHTML = `<i data-lucide="check"></i> Copiado!`;
                if (window.lucide) window.lucide.createIcons();
                
                alert('O prontuário da Sofia foi copiado para a sua área de transferência (Pronto para enviar por WhatsApp!).');
                
                setTimeout(() => {
                    shareBtn.innerHTML = originalText;
                    if (window.lucide) window.lucide.createIcons();
                }, 2000);
            }).catch(err => {
                console.error('Falha ao copiar:', err);
            });
        });

        // Print function
        document.getElementById('btn-print-report').addEventListener('click', () => {
            window.print();
        });
        
        document.getElementById('close-modal-x').addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }

    generateShareText(patient, symptoms, meds, exams, analysis) {
        let text = `🩺 *SOFIA - MEMÓRIA CLÍNICA INTELIGENTE*\n`;
        text += `*Resumo Pré-Consulta (Histórico Informado)*\n\n`;
        text += `👤 *Paciente:* ${patient.name} (${patient.age} anos)\n`;
        text += `-------------------------------------------\n\n`;

        if (symptoms.length > 0) {
            text += `📈 *Score de Triagem:* ${analysis.score}/10 (${analysis.priorityLevel})\n`;
            text += `👨‍⚕️ *Especialistas Indicados:* ${analysis.specialists.join(', ')}\n`;
            text += `🚨 *Fatores Clínicos:* ${analysis.reasons.join('; ')}\n\n`;
        }
        
        text += `🚨 *Sintomas e Fatos Observados:*\n`;
        if (symptoms.length > 0) {
            symptoms.forEach(s => {
                text += `- [${s.date}] ${s.desc} (por: ${s.author})\n`;
            });
        } else {
            text += `Nenhum sintoma registrado no período.\n`;
        }
        text += `\n`;

        text += `💊 *Medicamentos Citados:*\n`;
        if (meds.length > 0) {
            meds.forEach(m => {
                text += `- [${m.date}] ${m.desc} (por: ${m.author})\n`;
            });
        } else {
            text += `Nenhum medicamento registrado.\n`;
        }
        text += `\n`;

        text += `📄 *Exames e Laudos:*\n`;
        if (exams.length > 0) {
            exams.forEach(e => {
                text += `- [${e.date}] ${e.desc} (por: ${e.author})\n`;
            });
        } else {
            text += `Nenhum anexo registrado.\n`;
        }
        
        text += `\n⚠️ *Aviso:* Este resumo foi compilado de forma automática com base em relatos de familiares e cuidadores. A Sofia não realiza diagnósticos médicos.`;
        return text;
    }
}
