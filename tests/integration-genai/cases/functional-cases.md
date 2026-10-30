# Casos funcionais de integração gerados/revisados com apoio de GenAI

**Status:** casos propostos para execução; não executados neste commit.  
**Ambiente:** servidor de teste e SQLite isolado; utilizar dados sintéticos.

| ID | Cenário | Ação | Resultado esperado / verificações | Prioridade |
|---|---|---|---|---|
| INT-F01 | Listar perfis | GET /api/profiles | HTTP 200 e corpo JSON com lista de perfis, conforme implementação atual | Alta |
| INT-F02 | Criar e recuperar perfil | POST /api/profiles e depois GET /api/profiles | Perfil criado deve aparecer na consulta; comparar os campos enviados e retornados. A rota não documenta validação completa de campos | Alta |
| INT-F03 | Consultar eventos sem profileId | GET /api/events sem query parameter | HTTP 400 e mensagem indicando que profileId é obrigatório | Alta |
| INT-F04 | Consultar eventos de um perfil | GET /api/events?profileId=<id existente> | HTTP 200; eventos devem pertencer ao profileId solicitado e vir ordenados por data decrescente | Alta |
| INT-F05 | Registrar e recuperar evento | POST /api/events com profileId e dados sintéticos; depois GET /api/events?profileId=<id> | Evento deve ser recuperável; verificar perfil associado, descrição, tipo e metadata. A rota não valida explicitamente a existência do perfil | Alta |
| INT-F06 | Consultar configurações | GET /api/settings | HTTP 200 e objeto JSON; quando não houver configuração persistida, o código retorna valores padrão | Média |
| INT-F07 | Atualizar e consultar configurações | POST /api/settings e depois GET /api/settings | Configuração enviada deve ser persistida e recuperada; verificar campos e valores | Alta |
| INT-F08 | Reset em banco descartável | POST /api/reset e depois GET /api/profiles | Resposta de sucesso e banco reinicializado com dados padrão; executar exclusivamente em banco descartável | Média |
| INT-F09 | Isolamento de eventos entre perfis | Criar eventos para dois IDs de perfil e consultar cada um separadamente | Cada consulta deve retornar somente eventos cujo profileId corresponda ao filtro | Alta |

## Observações

- Para INT-F02 e INT-F05, usar campos de acordo com as colunas e parâmetros observados em `server.js`.
- O código atual não especifica validação de negócio completa para cadastro de perfil/evento. Não presumir HTTP 400 para todo payload inválido.
- Os resultados acima são expectativas de teste derivadas do código, não evidência de execução bem-sucedida.
