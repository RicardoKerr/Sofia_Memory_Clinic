# Sofia — Memória Clínica Inteligente

Sofia é uma **Prova de Conceito (PoC)** de uma assistente virtual e diário clínico inteligente desenvolvido para auxiliar famílias e cuidadores na gestão e monitoramento da rotina de saúde de pacientes (com foco especial em idosos ou indivíduos com necessidades de cuidados contínuos, como pacientes de clínicas de memória). 

O projeto foi projetado com uma experiência rica, temas dinâmicos (Dark, Light, Casual e Retro), e preparado para integrações de voz com ElevenLabs e visão computacional com OpenAI GPT-4o.

---

## 🚀 Funcionalidades Principais

*   **📊 Dashboard Completo**: Visão consolidada da saúde do paciente ativo, com atalhos de ações rápidas, resumo clínico diário do progresso, e indicadores visuais.
*   **📖 Diário Clínico Interativo**: Linha do tempo (timeline) completa e detalhada contendo eventos categorizados (medicamento, sintoma, exames e anotações gerais). Permite filtros rápidos e exibição de mídias/anexos clínicos.
*   **🎙️ Sofia Conversacional (IA)**: Uma interface de conversação por voz equipada com animação de ondas sonoras em tempo real (canvas), utilizando a Web Speech API para transcrição local e integração com **ElevenLabs** e **OpenAI** para respostas faladas realistas e inteligentes.
*   **👁️ OCR e Visão Computacional (Câmera)**: Integração com a câmera do dispositivo via canvas 2D para captura de fotos de exames, manchas na pele ou receitas médicas, estruturada para processamento com GPT-4o Vision.
*   **👥 Gestão de Múltiplos Perfis**: Cadastro e alternância rápida entre múltiplos pacientes (ex: Mãe, Avó, Pai) com informações de idade, plano de saúde, tipo sanguíneo e histórico independente.
*   **⚙️ Ajustes Avançados**: Painel de configurações para definir chaves de API externas (OpenAI, ElevenLabs, Supabase), simular latência de rede e selecionar vozes ou modelos LLM.

---

## 🛠️ Tecnologias Utilizadas

### Frontend
*   **HTML5** (Semântico e responsivo).
*   **CSS3** (Variáveis nativas para temas dinâmicos, animações fluidas e design moderno de alta fidelidade).
*   **JavaScript (ES6+)** (Arquitetura Single Page Application - SPA, estruturada de forma modular em componentes no padrão de classes).
*   **Lucide Icons** (Biblioteca de ícones vetoriais).

### Backend
*   **Node.js** com **Express** (Servidor HTTP local e roteamento de API proxy).
*   **SQLite3** (Banco de dados relacional leve em arquivo `database.db` com persistência de dados local).
*   **CORS** (Habilitação de requisições de origens cruzadas).

### Integrações Futuras & Ecossistema
*   **n8n** (Como backend integrador de Webhooks para pipelines de processamento).
*   **Supabase** (Projetado para sincronização remota nativa de dados e autenticação).
*   **ElevenLabs** (Síntese de voz realista).
*   **OpenAI** (Modelos Whisper para áudio e GPT-4o para inteligência clínica).

---

## 📁 Estrutura do Projeto

```text
POC_Dr-Consulta-22-06-2026/
├── components/                 # Componentes reativos do Frontend (SPA)
│   ├── DashboardScreen.js
│   ├── DiaryScreen.js
│   ├── ProfilesScreen.js
│   ├── SettingsScreen.js
│   ├── SofiaScreen.js
│   └── SummaryModal.js
├── services/                   # Serviços e integrações do Frontend
│   ├── api.js                  # Proxy de comunicação com a API local
│   ├── vision.js               # Gerenciamento de câmera e OCR
│   └── voice.js                # Reconhecimento e síntese de voz
├── database.db                 # Arquivo SQLite persistente (gerado localmente)
├── index.html                  # Ponto de entrada da SPA
├── index.css                   # Estilização global e sistema de design (temas)
├── app.js                      # Roteador frontend e controle de estado
├── server.js                   # Servidor Express & SQLite3 backend
├── arquitetura.html            # Diagrama e detalhes da arquitetura do sistema
├── progress-weeky.html         # Relatório de progresso de desenvolvimento
├── ToDo.html                   # Checklist interativa de tarefas do projeto
├── package.json                # Configuração do Node.js e dependências
└── README.md                   # Documentação do projeto (este arquivo)
```

---

## ⚙️ Instalação e Execução

### Pré-requisitos
*   [Node.js](https://nodejs.org/) instalado em sua máquina.

### Passo a Passo

1.  **Clone o repositório** para a sua máquina local:
    ```bash
    git clone https://github.com/RicardoKerr/Sofia_Memory_Clinic.git
    cd Sofia_Memory_Clinic
    ```

2.  **Instale as dependências** do projeto:
    ```bash
    npm install
    ```

3.  **Inicie o servidor de desenvolvimento**:
    ```bash
    npm run dev
    ```

3.  **Acesse a aplicação**:
    Abra o seu navegador de preferência e navegue até:
    ```text
    http://localhost:3000
    ```

---

## 📐 Arquitetura de Software

A arquitetura do sistema foi desenhada para ser altamente modular e de fácil transição de um ambiente local/mockado para produção na nuvem:

*   Consulte o arquivo interativo [arquitetura.html](file:///d:/Code_AntiG/POC_Dr-Consulta-22-06-2026/arquitetura.html) no navegador para visualizar o fluxo completo de dados entre o Frontend SPA, o Backend local, o n8n e os provedores de inteligência artificial (Supabase, OpenAI e ElevenLabs).

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo de licença para mais detalhes.
