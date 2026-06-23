/**
 * Services/Vision.js
 * Serviço de gerenciamento de câmera, captura de imagem e processamento visual (OCR/IA).
 * Pronto para conexões futuras com GPT-4o, Claude 3.5 Sonnet ou n8n pipelines.
 */

class VisionService {
    constructor() {
        this.stream = null;
    }

    /**
     * Tenta iniciar a webcam do dispositivo e parear com um elemento HTML <video>
     * @param {HTMLVideoElement} videoElement Elemento video do HTML
     * @returns {Promise<boolean>} Sucesso da ativação
     */
    async startCamera(videoElement) {
        try {
            // Tenta obter stream de vídeo do usuário
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }, // Prefere câmera traseira em celulares
                audio: false
            });
            videoElement.srcObject = this.stream;
            videoElement.play();
            return true;
        } catch (error) {
            console.warn('Erro ao acessar webcam, usando simulador de câmera:', error);
            return false;
        }
    }

    /**
     * Desativa a câmera liberando a webcam
     */
    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
    }

    /**
     * Captura um frame do elemento vídeo e converte para base64 JPEG
     * @param {HTMLVideoElement} videoElement
     * @param {HTMLCanvasElement} canvasElement
     * @returns {string} Base64 Data URL da foto
     */
    takeSnapshot(videoElement, canvasElement) {
        if (!videoElement) return null;
        
        const context = canvasElement.getContext('2d');
        canvasElement.width = videoElement.videoWidth || 640;
        canvasElement.height = videoElement.videoHeight || 480;
        
        // Espelha a imagem se for câmera frontal (opcional, aqui tiramos direto)
        context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
        
        return canvasElement.toDataURL('image/jpeg', 0.85);
    }

    /**
     * Processa a imagem (tirada da câmera ou carregada via arquivo) e simula uma resposta de IA (OCR/Dermatologia)
     * @param {string} base64Image Imagem em base64
     * @param {string} fileType 'sintoma' | 'exame' | 'medicamento' | 'geral' (especificado ou detectado)
     * @returns {Promise<Object>} Análise simulada da IA
     */
    async analyzeImage(base64Image, type = 'geral') {
        // Simulação de delay de processamento de rede/IA (ex: 2 segundos)
        await new Promise(resolve => setTimeout(resolve, 1500));

        let description = '';
        let extractedMetadata = {};

        switch (type) {
            case 'sintoma':
                description = 'Registro visual de alteração cutânea na pele. Observa-se área de vermelhidão (eritema) localizada. Histórico clínico registrado para acompanhamento de evolução.';
                extractedMetadata = {
                    observationType: 'Dermatológica',
                    symptom: 'Eritema cutâneo',
                    severity: 'Sob observação'
                };
                break;
            case 'exame':
                description = 'OCR completo da imagem de exame laboratorial. Detectado: Hemograma e níveis glicêmicos estáveis. Valores inseridos no histórico clínico com sucesso.';
                extractedMetadata = {
                    observationType: 'Laudo/Laboratório',
                    examType: 'Exame de Sangue',
                    detectedValues: { glucose: '92 mg/dL', platelets: '260.000/uL' }
                };
                break;
            case 'medicamento':
                description = 'Detecção de receita médica via OCR. Receitado: Paracetamol 750mg e Dipirona 500mg. Tratamento inserido na linha do tempo clínica.';
                extractedMetadata = {
                    observationType: 'Receituário',
                    detectedMedication: 'Paracetamol 750mg',
                    signatureVerified: 'Sim'
                };
                break;
            default:
                description = 'Documento ou foto geral de saúde registrada com sucesso na memória clínica da Sofia.';
                extractedMetadata = {
                    observationType: 'Registro Geral'
                };
        }

        return {
            success: true,
            description,
            type,
            metadata: extractedMetadata,
            analyzedAt: new Date().toISOString()
        };
    }
}

export const vision = new VisionService();
