# Casos de falha e resiliência de integração gerados/revisados com apoio de GenAI

**Status:** propostas; não executadas neste commit.  
**Ambiente:** isolado, com dados sintéticos.

| ID | Categoria | Cenário / execução | Resultado esperado ou estado do contrato | Prioridade |
|---|---|---|---|---|
| INT-R01 | Validação de entrada | GET /api/events sem profileId | Implementado: HTTP 400 e mensagem de parâmetro obrigatório | Alta |
| INT-R02 | Perfil inexistente | GET /api/events?profileId=perfil-inexistente | A consulta SQL deve retornar lista vazia se não houver eventos; confirmar em ambiente de teste | Média |
| INT-R03 | Payload incompleto | POST /api/profiles sem campos obrigatórios de negócio | A rota não contém validação explícita desses campos; status e comportamento esperado precisam ser definidos antes de exigir rejeição específica | Alta |
| INT-R04 | Evento incompleto | POST /api/events com campos ausentes | A rota aplica tipo padrão “geral” e metadata padrão vazia, mas outros campos não são validados explicitamente; documentar contrato desejado | Alta |
| INT-R05 | API indisponível | Frontend chama endpoint enquanto servidor está parado | A requisição deve falhar; apresentação de erro amigável e recuperação no frontend são comportamentos a definir/verificar | Alta |
| INT-R06 | Falha no banco | Induzir falha controlada de leitura/gravação no SQLite em ambiente de teste | As rotas capturam erros e respondem HTTP 500 com objeto de erro; verificar sem expor dados sensíveis em ambiente real | Alta |
| INT-R07 | Persistência de configuração | POST /api/settings, reiniciar servidor e executar GET /api/settings | A configuração deve continuar disponível se a gravação tiver sido concluída; confirmar persistência entre processos | Alta |
| INT-R08 | Integridade do metadata | Gravar evento com metadata sintética e consultar evento | A consulta converte metadata JSON armazenado em objeto; metadata malformado no banco pode levar a erro 500. Corrupção deve ser simulada somente em banco descartável | Média |
| INT-R09 | Operação destrutiva | POST /api/reset em banco de teste e consultar perfis/eventos/configurações | O endpoint elimina e recria tabelas e semeia dados; confirmar retorno de sucesso e dados padrão. Nunca executar em produção | Alta |
| INT-R10 | Timeout/retry | Simular resposta lenta ou conexão interrompida entre frontend e API | Política de timeout, retry e mensagem ao usuário não está especificada no contrato; registrar decisão antes de fixar expectativa | Média |
| INT-R11 | Consistência de associação | Criar evento com profileId inexistente e consultar esse profileId | O código não valida explicitamente a existência do perfil; definir se o comportamento desejado é rejeitar ou permitir associação órfã | Alta |
| INT-R12 | Serviço de voz/câmera | Negar permissão de navegador ou tornar recurso indisponível | Testar somente os fluxos presentes no frontend. Tratamento esperado de permissão/indisponibilidade precisa ser confirmado no código e documentado | Média |

## Observações

A tabela separa o que o código permite observar das decisões de produto ainda ausentes. Não se deve converter automaticamente recomendações de resiliência em critérios de aprovação sem definir o contrato.
