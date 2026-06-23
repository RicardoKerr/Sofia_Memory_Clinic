/**
 * Components/DiaryScreen.js
 * Tela do Diário Clínico (Linha do Tempo).
 * Exibe os eventos cronológicos detalhados com filtros de autoria/categoria
 * e integra o botão gerador de prontuário clínico pré-consulta.
 */

import { api } from '../services/api.js';
import { SummaryModal } from './SummaryModal.js';

export class DiaryScreen {
    constructor(app) {
        this.app = app;
        this.activeFilterType = 'todos'; // todos, sintoma, medicamento, exame, geral
        this.activeFilterAuthor = 'todos'; // name of author or todos
    }

    async render(container) {
        const patient = await api.getActiveProfile();
        const events = await api.getEvents(patient.id);
        
        // Compute unique list of authors for the filter row
        const authors = new Set();
        events.forEach(e => {
            if (e.authorName) authors.add(e.authorName);
        });

        // Filter events based on active tab filters
        const filteredEvents = events.filter(e => {
            const matchesType = this.activeFilterType === 'todos' || e.type === this.activeFilterType;
            const matchesAuthor = this.activeFilterAuthor === 'todos' || e.authorName === this.activeFilterAuthor;
            return matchesType && matchesAuthor;
        });

        // Create filter buttons HTML
        const filterTypes = [
            { id: 'todos', label: 'Todos os Eventos' },
            { id: 'sintoma', label: 'Sintomas' },
            { id: 'medicamento', label: 'Medicamentos' },
            { id: 'exame', label: 'Exames' },
            { id: 'geral', label: 'Geral' }
        ];

        let typeFiltersHtml = filterTypes.map(f => `
            <button class="filter-tab ${this.activeFilterType === f.id ? 'active' : ''}" data-filter-type="${f.id}">
                ${f.label}
            </button>
        `).join('');

        let authorFiltersHtml = `<option value="todos" ${this.activeFilterAuthor === 'todos' ? 'selected' : ''}>Todos os Autores</option>`;
        authors.forEach(author => {
            authorFiltersHtml += `<option value="${author}" ${this.activeFilterAuthor === author ? 'selected' : ''}>${author}</option>`;
        });

        // Create timeline cards HTML
        let timelineCardsHtml = '';
        if (filteredEvents.length === 0) {
            timelineCardsHtml = `
                <div style="padding: 40px 20px; text-align: center; color: var(--color-neutral-muted);">
                    <i data-lucide="calendar-range" style="width: 48px; height: 48px; stroke-width: 1.5; color: var(--color-neutral-border); margin-bottom: 12px;"></i>
                    <p style="font-size: 14px; font-weight: 600;">Nenhum registro encontrado</p>
                    <p style="font-size: 11px; margin-top: 4px;">Tente ajustar os filtros ou fale com a Sofia para registrar novas informações.</p>
                </div>
            `;
        } else {
            filteredEvents.forEach(evt => {
                const dateObj = new Date(evt.date);
                const timeLabel = `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
                const dateLabel = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;
                
                let attachmentHtml = '';
                if (evt.attachment) {
                    attachmentHtml = `
                        <div class="timeline-card-attachment">
                            <img src="${encodeURI(evt.attachment)}" alt="Anexo Clínico">
                            <div class="attachment-badge">
                                <i data-lucide="image"></i> Ver Imagem
                            </div>
                        </div>
                    `;
                }

                timelineCardsHtml += `
                    <div class="timeline-card ${evt.type}">
                        <div class="timeline-node"></div>
                        <div class="timeline-card-header">
                            <div class="timeline-card-author">
                                <img src="${encodeURI(evt.authorAvatar)}" class="author-avatar" alt="Avatar">
                                <div class="author-name-role">
                                    <span class="author-name">${evt.authorName}</span>
                                    <span class="author-role">${evt.authorRole}</span>
                                </div>
                            </div>
                            <div class="timeline-card-meta">
                                <span class="timeline-card-date">${dateLabel} às ${timeLabel}</span>
                                <span class="timeline-tag">${evt.type}</span>
                            </div>
                        </div>
                        <div class="timeline-card-desc">
                            ${evt.description}
                        </div>
                        ${attachmentHtml}
                    </div>
                `;
            });
        }

        container.innerHTML = `
            <div class="screen diary-screen">
                
                <!-- Action Header and CTA -->
                <div class="diary-controls">
                    <div class="diary-summary-banner">
                        <div class="diary-summary-left">
                            <span class="diary-summary-title">Próxima Consulta Médica?</span>
                            <span class="diary-summary-desc">Gere um prontuário clínico estruturado em PDF dos relatos.</span>
                        </div>
                        <button class="generate-summary-btn" id="btn-generate-summary">
                            <i data-lucide="file-text"></i>
                            Gerar Resumo
                        </button>
                    </div>

                    <!-- Category Filter Tabs -->
                    <div class="filter-tabs-container">
                        ${typeFiltersHtml}
                    </div>

                    <!-- Author Dropdown Filter -->
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <i data-lucide="filter" style="width: 14px; height: 14px; color: var(--color-neutral-muted);"></i>
                        <select id="filter-author-select" style="flex: 1; height: 32px; border: 1px solid var(--color-neutral-border); border-radius: var(--radius-sm); font-size: 11px; padding: 0 8px; outline: none; background-color: white;">
                            ${authorFiltersHtml}
                        </select>
                    </div>
                </div>

                <!-- Timeline Core -->
                <div class="timeline-container">
                    ${timelineCardsHtml}
                </div>
            </div>
        `;

        if (window.lucide) {
            window.lucide.createIcons();
        }

        // Hook filters listeners
        const tabs = container.querySelectorAll('.filter-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.activeFilterType = tab.getAttribute('data-filter-type');
                this.render(container);
            });
        });

        const select = document.getElementById('filter-author-select');
        select.addEventListener('change', (e) => {
            this.activeFilterAuthor = e.target.value;
            this.render(container);
        });

        // Hook Generate Summary Button
        document.getElementById('btn-generate-summary').addEventListener('click', () => {
            this.generateSummary();
        });

        // Attachment full preview listener
        const attachments = container.querySelectorAll('.timeline-card-attachment');
        attachments.forEach(attachment => {
            attachment.addEventListener('click', () => {
                const img = attachment.querySelector('img').src;
                this.showImagePreviewModal(img);
            });
        });
    }

    generateSummary() {
        const summary = new SummaryModal(this.app);
        summary.show();
    }

    showImagePreviewModal(imgSrc) {
        const modal = document.getElementById('global-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body-content');
        
        modalTitle.textContent = "Anexo Clínico";
        modalBody.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
                <img src="${imgSrc}" style="width: 100%; border-radius: var(--radius-lg); border: 1px solid var(--color-neutral-border); box-shadow: var(--shadow-sm);">
                <button class="report-btn secondary" id="close-img-preview-btn" style="width: 100%;">Fechar</button>
            </div>
        `;
        
        modal.classList.remove('hidden');
        if (window.lucide) window.lucide.createIcons();

        document.getElementById('close-img-preview-btn').addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }
}
