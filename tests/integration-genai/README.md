# Testes de integração apoiados por GenAI

Atividade da especialização AKCIT/UFG — Testes de Software Automatizados com Inteligência Artificial Generativa.

## Objetivo

Registrar dois tipos de prompt e os casos de teste de integração derivados para a Sofia Memory Clinic, com foco na comunicação entre a API Express e o SQLite e nos fluxos consumidores da API.

## Escopo observado no código

O arquivo `server.js` implementa:

- `GET /api/profiles`
- `POST /api/profiles`
- `GET /api/events?profileId=...`
- `POST /api/events`
- `GET /api/settings`
- `POST /api/settings`
- `POST /api/reset`

A persistência é feita em SQLite. O endpoint `GET /api/events` retorna HTTP 400 quando `profileId` está ausente. As rotas capturam erros de execução e retornam HTTP 500. O frontend consome essas rotas por meio de `services/api.js`.

## Tipos de prompt experimentais

1. **Cenários funcionais com contexto e exemplo (few-shot):** orienta a LLM a gerar fluxos encadeados, verificar respostas HTTP e confirmar a persistência por meio de uma consulta posterior.
2. **Análise de falhas e resiliência:** solicita cenários negativos nas fronteiras HTTP/SQLite, payloads incompletos, indisponibilidade e consistência, separando comportamento observado de requisitos ainda não definidos.

Os prompts completos estão em `prompts/`; os casos de teste derivados estão em `cases/`.

## Como interpretar os casos

- **Implementado/observável:** expectativa sustentada pelo código atual.
- **A definir:** comportamento desejável que não está suficientemente especificado; não deve ser tratado como contrato aprovado.
- Os casos são propostas de teste; **não significa que foram executados**.
- Use banco de dados e dados sintéticos isolados. Não execute `POST /api/reset` em ambiente com dados que precisem ser preservados.

## Como executar o experimento

1. Forneça à LLM o prompt em `prompts/` e os arquivos relevantes do repositório (`server.js`, `services/api.js` e inicialização do banco).
2. Registre a versão/modelo da LLM e a resposta original.
3. Compare os casos gerados com os casos deste diretório, removendo endpoints inventados e marcando expectativas sem suporte no código.
4. Execute os casos somente em ambiente de teste isolado e registre resultados reais antes de declarar aprovação.

## Limitações identificadas

- As rotas não definem validação explícita completa para os campos de perfil/evento.
- Não há contrato explícito para timeout/retry nem tratamento uniforme de falhas no frontend.
- `POST /api/reset` é destrutivo e requer ambiente isolado.
- A existência de serviços de voz/visão no frontend não comprova, por si só, integração de backend com um provedor externo.

## Estrutura

- `prompts/01-cenarios-funcionais.md`
- `prompts/02-falhas-resiliencia.md`
- `cases/functional-cases.md`
- `cases/resilience-cases.md`
- `analysis/prompt-comparison.md`
