/**
 * Services/API.js
 * Camada de dados e API desacoplada para Sofia
 * Simula persistência no LocalStorage e prepara integração futura com Supabase/n8n.
 */

// SVG Avatars self-contained to avoid network dependencies
export const AVATARS = {
    maria: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23ECFDF5"/><path d="M50 25a18 18 0 0 0-18 18c0 4 1 8 3 11a18 18 0 0 0 30 0c2-3 3-7 3-11a18 18 0 0 0-18-18z" fill="%2310B981"/><path d="M50 15c-15 0-22 8-22 18 0 1 1 3 2 3s2-2 3-3c2-2 6-4 10-4 1 0 2 1 3 2a2 2 0 0 0 4 0c1-1 2-2 3-2s2 1 3 2a2 2 0 0 0 4 0c1-1 2-2 3-2c4 0 8 2 10 4 1 1 2 3 3 3s2-2 2-3c0-10-7-18-22-18z" fill="%2394A3B8"/><circle cx="42" cy="43" r="3" fill="%230F172A"/><circle cx="58" cy="43" r="3" fill="%230F172A"/><path d="M40 45h6v2h-6zm14 0h6v2h-6z" fill="none" stroke="%230F172A" stroke-width="1.5"/><path d="M48 43h4v4h-4z" fill="none" stroke="%230F172A" stroke-width="1.5"/><path d="M44 54s2 3 6 3 6-3 6-3" fill="none" stroke="%23E11D48" stroke-width="2" stroke-linecap="round"/><path d="M18 85c0-15 12-25 32-25s32 10 32 25z" fill="%230284C7"/></svg>`,
    mercedes: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23F5F3FF"/><path d="M50 22c-12 0-18 6-18 18a18 18 0 0 0 36 0c0-12-6-18-18-18z" fill="%238B5CF6"/><path d="M50 10c-18 0-25 10-25 24 0 5 12 2 16 0 4-2 6-5 9-5s5 3 9 5c4 2 16 5 16 0 0-14-7-24-25-24z" fill="%23CBD5E1"/><circle cx="40" cy="40" r="3.5" fill="%231E293B"/><circle cx="60" cy="40" r="3.5" fill="%231E293B"/><path d="M37 42h7v2h-7zm19 0h7v2h-7z" fill="none" stroke="%231E293B" stroke-width="2"/><path d="M45 52s2 3 5 3 5-3 5-3" fill="none" stroke="%231E293B" stroke-width="2" stroke-linecap="round"/><path d="M16 88c0-16 14-26 34-26s34 10 34 26z" fill="%237C3AED"/></svg>`,
    geraldo: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23EFF6FF"/><path d="M50 20a16 16 0 0 0-16 16c0 5 2 9 4 12a16 16 0 0 0 24 0c2-3 4-7 4-12a16 16 0 0 0-16-16z" fill="%233B82F6"/><path d="M50 12c-15 0-20 8-20 18a4 4 0 0 0 4 4 4 4 0 0 0 4-4c0-5 3-8 12-8s12 3 12 8a4 4 0 0 0 4 4 4 4 0 0 0 4-4c0-10-5-18-20-18z" fill="%2364748B"/><circle cx="42" cy="38" r="3" fill="%231E293B"/><circle cx="58" cy="38" r="3" fill="%231E293B"/><path d="M39 40h7v2h-7zm15 0h7v2h-7z" fill="none" stroke="%231E293B" stroke-width="2"/><path d="M45 48s2 2 5 2 5-2 5-2" fill="none" stroke="%231E293B" stroke-width="2" stroke-linecap="round"/><path d="M15 85c0-15 15-25 35-25s35 10 35 25z" fill="%231E3A8A"/></svg>`,
    pedro: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23ECFDF5"/><path d="M50 25a16 16 0 0 0-16 16c0 3 1 7 3 10a16 16 0 0 0 26 0c2-3 3-7 3-10a16 16 0 0 0-16-16z" fill="%2310B981"/><path d="M50 15c-12 0-17 6-17 12a10 10 0 0 0 8 4c2 0 4-2 5-3s2-2 4-2 3 1 4 2 3 3 5 3a10 10 0 0 0 8-4c0-6-5-12-17-12z" fill="%23F59E0B"/><circle cx="42" cy="42" r="3" fill="%231E293B"/><circle cx="58" cy="42" r="3" fill="%231E293B"/><path d="M46 50s1 2 4 2 4-2 4-2" fill="none" stroke="%231E293B" stroke-width="2" stroke-linecap="round"/><path d="M18 85c0-12 12-20 32-20s32 8 32 20z" fill="%23047857"/></svg>`,
    ana: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23F0FDFA"/><path d="M50 25a16 16 0 0 0-16 16c0 3 1 7 3 10a16 16 0 0 0 26 0c2-3 3-7 3-10a16 16 0 0 0-16-16z" fill="%230D9488"/><path d="M50 12c-15 0-19 12-19 22 0 6 3 12 5 14 3-2 5-9 6-12 1-3 4-5 8-5s7 2 8 5c1 3 3 10 6 12 2-2 5-8 5-14 0-10-4-22-19-22z" fill="%231E293B"/><circle cx="42" cy="40" r="3" fill="%231E293B"/><circle cx="58" cy="40" r="3" fill="%231E293B"/><path d="M44 48s2 3 6 3 6-3 6-3" fill="none" stroke="%23E11D48" stroke-width="2" stroke-linecap="round"/><path d="M18 85c0-12 12-20 32-20s32 8 32 20z" fill="%230F766E"/></svg>`,
    joao: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23EEF2F6"/><path d="M50 25a16 16 0 0 0-16 16c0 4 1 8 3 10a16 16 0 0 0 26 0c2-2 3-6 3-10a16 16 0 0 0-16-16z" fill="%23475569"/><path d="M30 35c0-15 10-18 20-18s20 3 20 18c0 2-4 2-6 0s-4-4-14-4-12 2-14 4-6 2-6 0z" fill="%230F172A"/><circle cx="42" cy="41" r="3.5" fill="%231E293B"/><circle cx="58" cy="41" r="3.5" fill="%231E293B"/><path d="M45 49s2 2 5 2 5-2 5-2" fill="none" stroke="%231E293B" stroke-width="2" stroke-linecap="round"/><path d="M18 85c0-13 13-22 32-22s32 9 32 22z" fill="%23334155"/></svg>`,
    maria_cuidadora: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23FFF7ED"/><path d="M50 24a16 16 0 0 0-16 16c0 3 1 7 3 10a16 16 0 0 0 26 0c2-3 3-7 3-10a16 16 0 0 0-16-16z" fill="%23F97316"/><path d="M28 24h44v8H28z" fill="%23FFFFFF"/><path d="M46 20h8v16h-8z" fill="%23EF4444"/><path d="M42 28h16v4H42z" fill="%23EF4444"/><circle cx="42" cy="40" r="3" fill="%231E293B"/><circle cx="58" cy="40" r="3" fill="%231E293B"/><path d="M45 48s2 2 5 2 5-2 5-2" fill="none" stroke="%23E11D48" stroke-width="2" stroke-linecap="round"/><path d="M18 85c0-13 13-22 32-22s32 9 32 22z" fill="%23EA580C"/></svg>`,
    sofia_ia: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="url(%23sofiaGrad)"/><defs><linearGradient id="sofiaGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2310B981"/><stop offset="100%" stop-color="%230284C7"/></linearGradient></defs><circle cx="50" cy="50" r="28" fill="%23FFFFFF" opacity="0.15"/><circle cx="50" cy="50" r="20" fill="%23FFFFFF" opacity="0.25"/><path d="M50 35c-8 0-15 7-15 15s7 15 15 15 15-7 15-15-7-15-15-15zm-2 24v-6h4v6zm0-10v-10h4v10z" fill="%23FFFFFF"/></svg>`
};

// Simulated mock database images (base64 SVG representation of leg spot and exams)
export const CLINICAL_IMAGES = {
    leg_spot: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 150" fill="%23F1F5F9"><rect width="300" height="150" fill="%23F3E8FF"/><path d="M20 75 Q150 20 280 75 Q150 130 20 75 Z" fill="%23FFE4E6" stroke="%23FDA4AF" stroke-width="2"/><ellipse cx="140" cy="70" rx="30" ry="18" fill="%23F43F5E" opacity="0.6"/><ellipse cx="160" cy="80" rx="20" ry="12" fill="%23E11D48" opacity="0.5"/><ellipse cx="125" cy="65" rx="15" ry="10" fill="%23FDA4AF" opacity="0.8"/><text x="10" y="25" fill="%237E22CE" font-family="sans-serif" font-size="12" font-weight="bold">Foto Clínica: Dermatologia (Mancha na Perna)</text></svg>`,
    blood_exam: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 150" fill="%23F8FAFC"><rect width="300" height="150" fill="%23F0F9FF" stroke="%23BAE6FD" stroke-width="3"/><text x="20" y="30" fill="%230369A1" font-family="monospace" font-size="12" font-weight="bold">LABORATÓRIO ANALISAR - HEMOGRAMA</text><line x1="20" y1="45" x2="280" y2="45" stroke="%23E2E8F0" stroke-width="2"/><text x="20" y="65" fill="%23334155" font-family="monospace" font-size="11">Hemoglobina ...... 12.8 g/dL (Ref: 12.0 - 15.5)</text><text x="20" y="85" fill="%23334155" font-family="monospace" font-size="11">Plaquetas ......... 245.000 /uL (Ref: 150-450k)</text><text x="20" y="105" fill="%23334155" font-family="monospace" font-size="11">Creatinina ........ 0.90 mg/dL (Ref: 0.50 - 1.10)</text><rect x="210" y="120" width="70" height="20" rx="4" fill="%2310B981"/><text x="220" y="133" fill="white" font-family="sans-serif" font-size="9" font-weight="bold">NORMAL</text></svg>`,
    prescription: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 150" fill="%23FFFFFF"><rect width="300" height="150" fill="%23ECFDF5" stroke="%23A7F3D0" stroke-width="2"/><path d="M20 15 H50 V45 H20 Z" fill="%2310B981" opacity="0.1"/><text x="28" y="37" fill="%23047857" font-family="sans-serif" font-size="24" font-weight="bold">Rx</text><text x="70" y="28" fill="%230F172A" font-family="sans-serif" font-size="12" font-weight="bold">Dr. Roberto Silva - CRM SP 12345</text><text x="70" y="42" fill="%2364748B" font-family="sans-serif" font-size="10">Clínica Médica Integrada</text><line x1="20" y1="55" x2="280" y2="55" stroke="%23A7F3D0" stroke-width="1.5"/><text x="20" y="75" fill="%231E293B" font-family="sans-serif" font-size="11" font-weight="bold">1. Losartana Potássica 50mg</text><text x="32" y="90" fill="%2364748B" font-family="sans-serif" font-size="10">Tomar 1 comprimido por via oral pela manhã.</text><text x="20" y="115" fill="%231E293B" font-family="sans-serif" font-size="11" font-weight="bold">2. Paracetamol 750mg</text><text x="32" y="130" fill="%2364748B" font-family="sans-serif" font-size="10">Tomar 1 comprimido em caso de dor de cabeça forte (Máx 4x/dia).</text></svg>`
};

const DEFAULT_PROFILES = [
    {
        id: 'maria_aparecida',
        name: 'Maria Aparecida',
        age: 74,
        relation: 'Minha Mãe', // Relative context
        avatar: AVATARS.maria,
        gender: 'Feminino',
        healthPlan: 'Capivara Med',
        bloodType: 'O+'
    },
    {
        id: 'mercedes',
        name: 'Dona Mercedes',
        age: 95,
        relation: 'Minha Avó',
        avatar: AVATARS.mercedes,
        gender: 'Feminino',
        healthPlan: 'Particular',
        bloodType: 'A-'
    },
    {
        id: 'geraldo',
        name: 'Sr. Geraldo',
        age: 78,
        relation: 'Meu Pai',
        avatar: AVATARS.geraldo,
        gender: 'Masculino',
        healthPlan: 'SUS',
        bloodType: 'B+'
    },
    {
        id: 'pedro',
        name: 'Pedro',
        age: 12,
        relation: 'Meu Filho',
        avatar: AVATARS.pedro,
        gender: 'Masculino',
        healthPlan: 'Plano Escolar',
        bloodType: 'O+'
    }
];

const DEFAULT_EVENTS = [
    // Events for Maria Aparecida (Distributed over 30 days up to June 22, 2026)
    {
        id: 'evt_1',
        profileId: 'maria_aparecida',
        date: '2026-05-24T08:00:00-03:00',
        type: 'medicamento', // medicamento, sintoma, exame, geral
        authorName: 'Ana (Filha)',
        authorRole: 'Familiar',
        authorAvatar: AVATARS.ana,
        description: 'Paciente iniciou uso contínuo de Losartana Potássica 50mg pela manhã para controle da hipertensão arterial, conforme nova receita do Dr. Roberto Silva.',
        attachment: CLINICAL_IMAGES.prescription,
        metadata: {
            medicationName: 'Losartana Potássica',
            dosage: '50mg',
            frequency: '1x ao dia (manhã)'
        }
    },
    {
        id: 'evt_2',
        profileId: 'maria_aparecida',
        date: '2026-05-28T15:30:00-03:00',
        type: 'sintoma',
        authorName: 'Cuidadora Maria',
        authorRole: 'Cuidador',
        authorAvatar: AVATARS.maria_cuidadora,
        description: 'Relatou dor de cabeça moderada na região frontal durante a tarde. Realizada aferição da pressão arterial com resultado de 138/85 mmHg. Paciente foi orientada a descansar.',
        metadata: {
            symptom: 'Dor de cabeça',
            severity: 'Moderada',
            bloodPressure: '13.8 x 8.5'
        }
    },
    {
        id: 'evt_3',
        profileId: 'maria_aparecida',
        date: '2026-06-02T07:15:00-03:00',
        type: 'exame',
        authorName: 'João (Filho)',
        authorRole: 'Familiar',
        authorAvatar: AVATARS.joao,
        description: 'Realizada coleta de sangue domiciliar pela equipe do laboratório (Hemograma completo, Creatinina, Glicose em jejum). Paciente encontrava-se em jejum de 10 horas.',
        metadata: {
            examType: 'Exame de Sangue',
            provider: 'Analisar Domiciliar'
        }
    },
    {
        id: 'evt_4',
        profileId: 'maria_aparecida',
        date: '2026-06-05T18:00:00-03:00',
        type: 'exame',
        authorName: 'João (Filho)',
        authorRole: 'Familiar',
        authorAvatar: AVATARS.joao,
        description: 'Anexado resultado dos exames de sangue coletados no dia 02/06. Hemoglobina em 12.8 g/dL (normal) e Creatinina em 0.90 mg/dL (função renal estável).',
        attachment: CLINICAL_IMAGES.blood_exam,
        metadata: {
            examType: 'Resultado Laboratorial',
            hemoglobin: '12.8',
            creatinine: '0.90'
        }
    },
    {
        id: 'evt_5',
        profileId: 'maria_aparecida',
        date: '2026-06-10T03:15:00-03:00', // Matches the prompt 10/06/2026
        type: 'sintoma',
        authorName: 'Pai (Geraldo)',
        authorRole: 'Familiar',
        authorAvatar: AVATARS.geraldo,
        description: 'Relatou febre durante a madrugada. Medição de temperatura axilar indicou 37.9°C. Administrado 1 comprimido de Dipirona 500mg por volta das 03:30 para controle térmico.',
        metadata: {
            symptom: 'Febre',
            temperature: '37.9°C',
            intervention: 'Dipirona 500mg'
        }
    },
    {
        id: 'evt_6',
        profileId: 'maria_aparecida',
        date: '2026-06-12T10:00:00-03:00',
        type: 'medicamento',
        authorName: 'Cuidadora Maria',
        authorRole: 'Cuidador',
        authorAvatar: AVATARS.maria_cuidadora,
        description: 'Ajuste no horário dos medicamentos da manhã. Losartana agora está sendo administrado pontualmente às 08:00 com copo cheio de água, conforme tolerância gástrica do paciente.',
        metadata: {
            medicationName: 'Losartana',
            dosage: '50mg',
            time: '08:00'
        }
    },
    {
        id: 'evt_7',
        profileId: 'maria_aparecida',
        date: '2026-06-14T11:20:00-03:00', // Matches the prompt 14/06/2026
        type: 'exame', // Or visual observation
        authorName: 'Cuidadora Maria',
        authorRole: 'Cuidador',
        authorAvatar: AVATARS.maria_cuidadora,
        description: 'Registrou foto de mancha na perna esquerda. Mancha avermelhada de aproximadamente 4cm, sem coceira descrita, mas sensível ao toque. Localizada na panturrilha lateral.',
        attachment: CLINICAL_IMAGES.leg_spot,
        metadata: {
            observation: 'Mancha vermelha na perna',
            location: 'Panturrilha esquerda lateral',
            severity: 'Sensível ao toque'
        }
    },
    {
        id: 'evt_8',
        profileId: 'maria_aparecida',
        date: '2026-06-17T09:45:00-03:00', // Matches the prompt 17/06/2026
        type: 'sintoma',
        authorName: 'Própria paciente (Maria)',
        authorRole: 'Paciente',
        authorAvatar: AVATARS.maria,
        description: 'Relatou tontura leve ao se levantar rapidamente da cama pela manhã. O episódio durou cerca de 2 minutos e passou após ela sentar-se na cadeira. Pressão medida logo após: 118/76 mmHg (estável).',
        metadata: {
            symptom: 'Tontura leve',
            duration: '2 minutos',
            bloodPressure: '11.8 x 7.6'
        }
    }
];

const DEFAULT_SETTINGS = {
    audioFeedback: true,
    networkDelay: false,
    apiKeyElevenLabs: '',
    apiKeyOpenAI: '',
    apiEndpointSupabase: '',
    selectedVoice: 'rachel',
    selectedLlm: 'gpt-4o'
};

class ApiService {
    constructor() {
        if (!localStorage.getItem('sofia_active_profile')) {
            localStorage.setItem('sofia_active_profile', 'maria_aparecida');
        }
    }

    async resetDatabase() {
        await this.simulateNetworkDelay();
        const response = await fetch('/api/reset', { method: 'POST' });
        return await response.json();
    }

    async getProfiles() {
        await this.simulateNetworkDelay();
        const response = await fetch('/api/profiles');
        return await response.json();
    }

    async addProfile(profileData) {
        await this.simulateNetworkDelay();
        const response = await fetch('/api/profiles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData)
        });
        return await response.json();
    }

    async getActiveProfile() {
        const activeId = localStorage.getItem('sofia_active_profile') || 'maria_aparecida';
        const profiles = await this.getProfiles();
        return profiles.find(p => p.id === activeId) || profiles[0];
    }

    async setActiveProfile(id) {
        localStorage.setItem('sofia_active_profile', id);
        return this.getActiveProfile();
    }

    async getEvents(profileId) {
        await this.simulateNetworkDelay();
        const response = await fetch(`/api/events?profileId=${profileId}`);
        return await response.json();
    }

    async addEvent(profileId, eventData) {
        await this.simulateNetworkDelay();
        const response = await fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profileId, ...eventData })
        });
        return await response.json();
    }

    async getSettings() {
        const response = await fetch('/api/settings');
        return await response.json();
    }

    async saveSettings(settings) {
        const response = await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        });
        return await response.json();
    }

    async simulateNetworkDelay() {
        try {
            const settingsResponse = await fetch('/api/settings');
            const settings = await settingsResponse.json();
            if (settings.networkDelay) {
                await new Promise(resolve => setTimeout(resolve, 1500));
            }
        } catch (e) {
            console.error('Error in simulateNetworkDelay:', e);
        }
    }
}

export const api = new ApiService();

