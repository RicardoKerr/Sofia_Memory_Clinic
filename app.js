/**
 * App.js
 * Orquestrador Central da SPA - Sofia.
 * Gerencia roteamento, estado global reativo, sincronização de cabeçalhos
 * e eventos globais do ciclo de vida da aplicação.
 */

import { api } from './services/api.js';
import { voice } from './services/voice.js';

// Import Screens
import { DashboardScreen } from './components/DashboardScreen.js';
import { ProfilesScreen } from './components/ProfilesScreen.js';
import { SofiaScreen } from './components/SofiaScreen.js';
import { DiaryScreen } from './components/DiaryScreen.js';
import { SettingsScreen } from './components/SettingsScreen.js';

class AppController {
    constructor() {
        this.activeScreen = null;
        this.pendingNavOptions = null;
        this.screens = {
            home: new DashboardScreen(this),
            profiles: new ProfilesScreen(this),
            sofia: new SofiaScreen(this),
            diary: new DiaryScreen(this),
            settings: new SettingsScreen(this)
        };
    }

    async init() {
        console.log('Sofia App Initializing...');
        
        // Start simulated status bar clock updating
        this.startStatusClock();
        
        // Load initial patient context in header
        await this.updateHeaderPatientContext();

        // Setup bottom navigation bar listeners
        this.setupNavigation();

        // Setup global modal events
        this.setupGlobalModal();

        // Setup theme system listener (Visible on all pages)
        this.setupThemeSystem();

        // Setup Header Shortcuts
        document.getElementById('header-patient-trigger').addEventListener('click', () => {
            this.navigateTo('profiles');
        });

        document.getElementById('header-bell-btn').addEventListener('click', () => {
            alert('Não há novas notificações no momento.');
        });

        // Navigate to initial screen
        this.navigateTo('home');
    }

    /**
     * Initializes the theme selector popover and loads default saved theme.
     */
    setupThemeSystem() {
        const themeBtn = document.getElementById('header-theme-btn');
        const popover = document.getElementById('theme-selector-popover');
        
        // Load and apply initial saved theme (or fallback to light)
        const savedTheme = localStorage.getItem('sofia_theme') || 'light';
        this.applyTheme(savedTheme);

        // Toggle dropdown display
        themeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            popover.classList.toggle('hidden');
        });

        // Bind theme click buttons
        const options = popover.querySelectorAll('.theme-select-option');
        options.forEach(opt => {
            opt.addEventListener('click', () => {
                const theme = opt.getAttribute('data-theme');
                this.applyTheme(theme);
                popover.classList.add('hidden');
            });
        });

        // Close selector when clicking outside
        document.addEventListener('click', (e) => {
            if (popover && !popover.contains(e.target) && e.target !== themeBtn) {
                popover.classList.add('hidden');
            }
        });
    }

    /**
     * Dynamically swaps the class names on the main phone frame wrapper
     * @param {string} themeName 'light' | 'dark' | 'casual' | 'retro'
     */
    applyTheme(themeName) {
        const phoneFrame = document.getElementById('phone-frame');
        if (phoneFrame) {
            phoneFrame.classList.remove('theme-light', 'theme-dark', 'theme-casual', 'theme-retro');
            phoneFrame.classList.add(`theme-${themeName}`);
            localStorage.setItem('sofia_theme', themeName);
        }
    }

    /**
     * Updates simulated status bar time to match local system time
     */
    startStatusClock() {
        const updateTime = () => {
            const timeEl = document.getElementById('status-time');
            if (timeEl) {
                const now = new Date();
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                timeEl.textContent = `${hours}:${minutes}`;
            }
        };
        updateTime();
        setInterval(updateTime, 60000); // update every minute
    }

    /**
     * Updates the patient context in the header (Name, age, avatar)
     */
    async updateHeaderPatientContext() {
        try {
            const activePatient = await api.getActiveProfile();
            
            const avatarEl = document.getElementById('header-patient-avatar');
            const nameEl = document.getElementById('header-patient-name');
            const ageEl = document.getElementById('header-patient-age');
            
            if (avatarEl) avatarEl.src = activePatient.avatar;
            if (nameEl) nameEl.textContent = activePatient.name;
            if (ageEl) ageEl.textContent = `${activePatient.age} anos`;
        } catch (error) {
            console.error('Erro ao atualizar cabeçalho do paciente:', error);
        }
    }

    /**
     * Registers active navigation bar routing triggers
     */
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const screenId = item.getAttribute('data-screen');
                this.navigateTo(screenId);
            });
        });
    }

    /**
     * Navigates to a specific screen index
     * @param {string} screenId 'home' | 'profiles' | 'sofia' | 'diary' | 'settings'
     * @param {Object} options Optional navigation state payload
     */
    async navigateTo(screenId, options = null) {
        if (!this.screens[screenId]) {
            console.error(`Tela desconhecida: ${screenId}`);
            return;
        }

        // Cancel speech synthesis if navigating away from Sofia screen
        if (this.activeScreen === 'sofia' && screenId !== 'sofia') {
            voice.stopSpeaking();
            if (this.screens.sofia) {
                this.screens.sofia.stopListeningFlow();
                this.screens.sofia.stopSpeakingFlow();
            }
        }

        this.activeScreen = screenId;
        this.pendingNavOptions = options;

        // Toggle active style in nav-bar buttons
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            if (item.getAttribute('data-screen') === screenId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Mount container reference
        const contentContainer = document.getElementById('app-content');
        if (screenId === 'sofia') {
            contentContainer.classList.add('sofia-active');
        } else {
            contentContainer.classList.remove('sofia-active');
        }
        
        // Show temporary smooth loader
        contentContainer.innerHTML = `
            <div class="loading-screen">
                <div class="spinner"></div>
            </div>
        `;

        try {
            // Render the screen class dynamically
            await this.screens[screenId].render(contentContainer);
        } catch (error) {
            console.error(`Erro ao carregar a tela ${screenId}:`, error);
            contentContainer.innerHTML = `
                <div style="padding: 40px 20px; text-align: center; color: var(--color-danger);">
                    <i data-lucide="alert-triangle" style="width: 48px; height: 48px; margin-bottom: 12px;"></i>
                    <p style="font-weight: 600;">Falha ao abrir a tela</p>
                    <p style="font-size: 12px; color: var(--color-neutral-muted); margin-top: 4px;">${error.message}</p>
                </div>
            `;
            if (window.lucide) window.lucide.createIcons();
        }
    }

    /**
     * Globally registers modal listeners
     */
    setupGlobalModal() {
        const modal = document.getElementById('global-modal');
        const closeX = document.getElementById('close-modal-x');

        const closeModal = () => {
            modal.classList.add('hidden');
            // If camera was running under modal, stop it
            if (this.activeScreen === 'sofia' && this.screens.sofia) {
                // Import of vision is done in sofia component
            }
        };

        if (closeX) closeX.addEventListener('click', closeModal);
        
        // Close on clicking outside modal-container
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
}

// Global bootstrap on window load
window.addEventListener('DOMContentLoaded', () => {
    const app = new AppController();
    app.init();
});
