# Prompt 01 — Geração de cenários funcionais de integração

Atue como engenheiro(a) de QA sênior, especialista em testes de integração de aplicações JavaScript, Node.js e Express.

## Contexto

Analise o repositório Sofia Memory Clinic. O backend implementa uma API REST Express com persistência SQLite. O frontend chama a API por meio de `services/api.js`.

## Tarefa

Inspecione o código real e proponha cenários de integração para:

- Consulta e cadastro de perfis;
- Consulta de eventos por perfil;
- Registro de evento e recuperação posterior;
- Consulta e atualização de configurações;
- Reinicialização do banco, somente em ambiente isolado.

Inclua fluxos encadeados e verifique tanto a resposta HTTP quanto o estado persistido. Considere o isolamento entre perfis.

## Exemplo de formato (few-shot)

- ID: INT-001
- Nome: Cadastro e recuperação de perfil
- Pré-condições: servidor ativo e banco de teste isolado
- Ação: enviar POST /api/profiles e depois consultar GET /api/profiles
- Resultado esperado: o perfil criado aparece na lista retornada
- Verificações: status HTTP, campos JSON e persistência
- Risco coberto: perda de dados entre camada HTTP e banco

## Restrições

1. Utilize apenas rotas, campos e comportamentos encontrados no código.
2. Não invente regras de negócio ou status HTTP.
3. Separe comportamento implementado de requisito ainda não definido.
4. Use somente dados sintéticos.
5. Não afirme que os testes foram executados.

## Saída

Produza tabela Markdown com: ID, cenário, pré-condições, ação, resultado esperado, verificações, prioridade e risco. Ao final, liste lacunas de contrato.
