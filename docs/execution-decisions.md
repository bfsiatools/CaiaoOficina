# Decisões tomadas na execução

Registro integral das decisões do ledger, na ordem em que foram tomadas. Custos são consequências se a decisão estiver errada.

- usar o clone novo em branch dedicada como workspace isolado — repo sem commits ou checkout anterior para preservar; ferramenta nativa do chat não tem repo no cwd de materiais — custo se errado: outro agente deve usar este checkout ou coordenar branch, não criar código no OneDrive.
- 47 produtos substituem 50 — correção explícita de Bernardo — custo se errado: critério de aceite precisa ser corrigido antes de importar material novo.
- implementar /go requisitado no Prompt 3 com habilitação configurável; produção começa com flag desligada conforme restrição de lançamento do plano — cobre a implementação e os testes autorizados sem presumir autorização comercial do programa — custo se errado: habilitação de produção pode exigir ajuste.
- formato real Nome:https://... também aceito pelo parser, preservando URL original — TXT recebido diverge do separador planejado — custo se errado: linhas ambíguas são recusadas em vez de adivinhadas.
- descrições iniciais reutilizam somente os títulos fornecidos no relatório; categorias são curadoria inferida dos nomes — completa os campos exigidos sem inventar especificações — custo se errado: ajustar editorialmente no Dashboard/manifest, sem trocar identidade.
- continuar Task 5 com o banco real validado e fixtures locais de teste enquanto Task 4 aguarda upload — tarefas independentes podem avançar conforme Fase 3 — custo se errado: homologação final permanece incompleta até credenciais e importação.
- limitar eventos em memória como proteção complementar, mantendo exigência de WAF antes de produção — não há hosting configurado e a V1 dispensa Redis — custo se errado: limite não se distribui entre instâncias e depende do proxy confiar no cabeçalho de IP.
- importar os 47 dados reais como inativos via MCP enquanto falta chave de Storage — avança cadastro autorizado sem publicar imagens inacessíveis; ativação continua pelo importador após upload — custo se errado: é necessário preservar checkpoint de origem para não interpretar o estado de staging como edição manual.
- shell visual é descartável e será substituído pelo frontend — base mínima foi necessária para homologação, sem redesenhar — custo se errado: resolver conflitos desses arquivos ao integrar a branch do frontend.
- WAF e confiança no proxy são requisitos de lançamento, não garantias do limite em memória — infraestrutura não está configurada — custo se errado: spam distribuído pode afetar métricas.
- /go de aba antiga resolve a versão vigente; clique direto mantém a versão exibida — fluxo condicional aprovado consulta destino atual e evento registra a versão efetivamente usada — custo se errado: comportamento comercial precisa ser reavaliado antes de habilitar produção.
- exports e imagens órfãs têm limpeza operacional manual — limitação explicitamente documentada, sem scheduler provisionado — custo se errado: operador pode acumular arquivos além da política.
- manter advisory de lint documentado, sem downgrade incompatível — dependência de ferramenta com globs controlados e runtime audit limpo — custo se errado: DoS do lint deve ser reavaliado quando houver patch compatível.
- evidência remota é verificação do executor, não repetida pelo revisor read-only — SQL, imports e HTTP efetivos foram inspecionados e repetidos depois da fix pass — custo se errado: produção em outro ambiente ainda exige homologação.
- preservar branch local sem merge/push — repo começou vazio, não há base existente para merge e a entrega é handoff para outro worktree; não inventar integração compartilhada — custo se errado: sincronização Git dependerá da etapa seguinte.

## Minors adiados

Nenhum: a revisão encontrou cinco Important, todos corrigidos com regressões RED→GREEN.
