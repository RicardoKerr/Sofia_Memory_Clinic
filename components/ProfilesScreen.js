/**
 * Components/ProfilesScreen.js
 * Tela de Perfis Clínicos.
 * Permite alternar o paciente ativo da demonstração e cadastrar novos perfis.
 */

import { api, AVATARS } from '../services/api.js';

export class ProfilesScreen {
    constructor(app) {
        this.app = app;
    }

    async render(container) {
        const profiles = await api.getProfiles();
        const activeProfile = await api.getActiveProfile();

        let profilesHtml = '';
        profiles.forEach(profile => {
            const isActive = profile.id === activeProfile.id;
            profilesHtml += `
                <div class="profile-item-card ${isActive ? 'active' : ''}" data-profile-id="${profile.id}">
                    <div class="profile-item-left">
                        <img src="${encodeURI(profile.avatar)}" class="profile-item-avatar" alt="Avatar de ${profile.name}">
                        <div class="profile-item-info">
                            <span class="profile-item-name">${profile.name}</span>
                            <span class="profile-item-rel">${profile.relation} • ${profile.age} anos</span>
                        </div>
                    </div>
                    <div class="profile-item-status">
                        ${isActive ? '<i data-lucide="check"></i>' : '<i data-lucide="chevron-right"></i>'}
                    </div>
                </div>
            `;
        });

        container.innerHTML = `
            <div class="screen profiles-screen">
                <div class="welcome-section">
                    <h1>Perfis Familiares</h1>
                    <p>Gerencie e alterne entre os históricos de saúde de sua família</p>
                </div>

                <div class="profiles-list">
                    ${profilesHtml}
                </div>

                <button class="add-profile-btn" id="btn-add-profile-trigger">
                    <i data-lucide="plus"></i>
                    Adicionar Novo Perfil
                </button>
            </div>
        `;

        if (window.lucide) {
            window.lucide.createIcons();
        }

        // Event listener to change profile
        const cards = container.querySelectorAll('.profile-item-card');
        cards.forEach(card => {
            card.addEventListener('click', async () => {
                const profileId = card.getAttribute('data-profile-id');
                await api.setActiveProfile(profileId);
                // Update global header patient context
                this.app.updateHeaderPatientContext();
                // Re-render profiles screen to show new active check
                this.render(container);
            });
        });

        // Add profile action
        document.getElementById('btn-add-profile-trigger').addEventListener('click', () => {
            this.showAddProfileModal();
        });
    }

    showAddProfileModal() {
        const modal = document.getElementById('global-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body-content');
        
        modalTitle.textContent = "Cadastrar Novo Familiar";
        
        modalBody.innerHTML = `
            <form id="add-profile-form" style="display: flex; flex-direction: column; gap: 14px;">
                <div style="display: flex; flex-direction: column; gap: 6px;">
                    <label style="font-size: 12px; font-weight: 600; color: var(--color-neutral-muted);">Nome Completo</label>
                    <input type="text" id="new-profile-name" required placeholder="Ex: Ana Souza" style="height: 42px; border: 1px solid var(--color-neutral-border); border-radius: var(--radius-md); padding: 0 12px; outline: none; font-size: 13px;">
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div style="display: flex; flex-direction: column; gap: 6px;">
                        <label style="font-size: 12px; font-weight: 600; color: var(--color-neutral-muted);">Idade (Anos)</label>
                        <input type="number" id="new-profile-age" required min="0" max="120" placeholder="Ex: 45" style="height: 42px; border: 1px solid var(--color-neutral-border); border-radius: var(--radius-md); padding: 0 12px; outline: none; font-size: 13px;">
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 6px;">
                        <label style="font-size: 12px; font-weight: 600; color: var(--color-neutral-muted);">Parentesco</label>
                        <select id="new-profile-relation" style="height: 42px; border: 1px solid var(--color-neutral-border); border-radius: var(--radius-md); padding: 0 12px; outline: none; font-size: 13px; background-color: white;">
                            <option value="Eu">Eu mesmo(a)</option>
                            <option value="Minha Mãe">Minha Mãe</option>
                            <option value="Meu Pai">Meu Pai</option>
                            <option value="Meu Filho">Meu Filho</option>
                            <option value="Minha Filha">Minha Filha</option>
                            <option value="Meu Marido">Meu Marido</option>
                            <option value="Minha Esposa">Minha Esposa</option>
                            <option value="Outro">Outro Familiar</option>
                        </select>
                    </div>
                </div>
                
                <button type="submit" class="report-btn primary" style="margin-top: 10px;">Salvar Perfil</button>
            </form>
        `;
        
        modal.classList.remove('hidden');
        
        const form = document.getElementById('add-profile-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('new-profile-name').value;
            const age = parseInt(document.getElementById('new-profile-age').value);
            const relation = document.getElementById('new-profile-relation').value;
            
            // Create a randomized avatar key from default ones
            const avatarKeys = ['ana', 'joao', 'maria_cuidadora', 'pedro'];
            const randomAvatar = AVATARS[avatarKeys[Math.floor(Math.random() * avatarKeys.length)]];
            
            const newProfile = {
                name,
                age,
                relation,
                avatar: randomAvatar,
                gender: 'Outro',
                healthPlan: 'Particular',
                bloodType: 'Desconhecido'
            };
            
            const createdProfile = await api.addProfile(newProfile);
            await api.setActiveProfile(createdProfile.id);
            
            // Update UI
            modal.classList.add('hidden');
            this.app.updateHeaderPatientContext();
            
            const activeContent = document.getElementById('app-content');
            this.render(activeContent);
        });
    }
}
