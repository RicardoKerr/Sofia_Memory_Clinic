# Análise comparativa dos prompts

## Prompt 1 — Cenários funcionais com few-shot

**Influência esperada na qualidade:** o contexto da aplicação, a lista de endpoints e o exemplo estruturado tendem a produzir casos mais rastreáveis e fáceis de transformar em testes automatizados. O exemplo de cadastro seguido de consulta incentiva a validar o fluxo completo, e não somente a resposta isolada da requisição.

**Diversidade:** cobre fluxos positivos de perfis, eventos, configurações e persistência. Sem restrições, uma LLM pode repetir variações superficiais do mesmo cenário; por isso o prompt solicita fluxos encadeados, isolamento por perfil e verificação do banco.

## Prompt 2 — Falhas e resiliência

**Influência esperada na qualidade:** organizar a análise por categorias de falha direciona a atenção para parâmetros ausentes, indisponibilidade, persistência e consistência. A instrução para marcar lacunas como “a definir” reduz a tendência de inventar status HTTP, retries e políticas não implementadas.

**Diversidade:** amplia a cobertura para cenários negativos e riscos de integridade. Alguns cenários, como timeout e payload inválido, não possuem contrato totalmente definido no código; devem virar perguntas de especificação, e não critérios de aprovação presumidos.

## Ajustes de prompt adotados

1. Informar a stack e os arquivos reais relevantes.
2. Enumerar endpoints observados para limitar invenções.
3. Exigir dados sintéticos e ambiente de teste isolado.
4. Incluir um exemplo few-shot no prompt funcional.
5. Separar comportamento implementado de comportamento desejado/a definir.
6. Proibir alegações de execução quando os testes ainda não foram rodados.
7. Destacar o caráter destrutivo de `POST /api/reset`.

## Limitação metodológica

Os arquivos registram prompts e casos propostos/revisados com apoio de GenAI. Para afirmar que houve experimento empírico comparável, ainda é necessário executar os dois prompts em uma LLM, registrar o modelo/versão, preservar as respostas originais e comparar os resultados. Os casos deste diretório não são evidência de execução de testes automatizados.
