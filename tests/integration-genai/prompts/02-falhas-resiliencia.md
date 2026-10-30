# Prompt 02 — Geração de cenários de falha e resiliência

Atue como engenheiro(a) de QA sênior especializado(a) em confiabilidade e testes de integração.

## Contexto

Analise a Sofia Memory Clinic, especialmente a fronteira entre API Express e SQLite e o consumo da API pelo frontend em `services/api.js`.

## Tarefa

Proponha testes para as seguintes categorias:

1. Parâmetro obrigatório ausente;
2. Payload incompleto ou malformado;
3. Perfil inexistente;
4. API indisponível ou conexão interrompida;
5. Falha de leitura/gravação no SQLite;
6. Respostas HTTP 4xx/5xx;
7. Consistência após gravação e consulta;
8. Operações destrutivas e recuperação após reset.

Para cada cenário, identifique fronteira de integração, condição de falha, sequência, verificações observáveis e risco.

## Restrições

- Não invente rotas, status HTTP, retries ou mecanismos de recuperação.
- Para comportamento não definido, escreva “a definir” em vez de supor o resultado.
- Distinga o comportamento atual de uma recomendação futura.
- Não use dados clínicos reais.
- Não trate chamadas a recursos de voz/câmera do navegador como integração comprovada com serviço externo sem evidência no código.
- Não afirme que os testes foram executados.

## Saída

Tabela Markdown: ID, categoria, cenário, pré-condições, execução, resultado esperado/estado do contrato, critério de aprovação e risco. Ordene por criticidade.
