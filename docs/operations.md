# Operação da V1

Manutenção no Dashboard + scripts pelo Bernardo com apoio de agentes; sem admin separado na V1. Slug/import_key são identidade estável; mudança editorial em slug exige revisar links internos já divulgados. Link de afiliado é versionado: use links:replace, não sobrescreva histórico.

## Publicação

1. Configurar chave privada do projeto no servidor/script.
2. Executar dry-run, upload/import, segundo dry-run; conferir 47 ativos e 47 objetos.
3. Homologar HTTP com APP_ENV=preview e flags true; eventos test.
4. Configurar domínio e SITE_URL exato, segredos e WAF do hosting.
5. Confirmar compatibilidade comercial do redirect antes de habilitar em produção; link direto funciona com flag false.
6. Validar aviso de afiliado, disponibilidade de imagens e estado editorial. WhatsApp só com URL real fornecida.

Não foi feito deploy/push, não há domínio nem WAF configurados. Flags habilitadas em preview não autorizam lançamento de produção. Segredos só no arquivo ignorado/secret manager; trocar chave se exposta. Preview não deve misturar eventos accepted com produção.

## Retenção e recuperação

```powershell
npm run events:maintain
npm run events:maintain -- --apply
```

Sem apply: conta eventos anteriores a 90 dias. Apply: exporta lotes privados de até 500 eventos, confirma gravação do arquivo antes de excluir somente IDs exportados e anteriores ao cutoff. Não é exclusão global. Falha preserva export e interrompe. Operador executa mensalmente; nenhum scheduler foi provisionado.

Exports ficam em `private/event-exports`; manter acesso privado e remover arquivos exportados após 90 dias segundo a política escolhida. Esse descarte de arquivos ainda é operacional/manual. Não enviar exports ao Git. Antes de mudança de schema, backup do projeto e plano de rollback; migrations são incrementais, não resetar public.

Relatórios de importação em `private/reports`. Rollback lógico conserva versões e eventos, rejeita edições posteriores; não use DELETE de produtos para desfazer importação. Backup privado do manifesto/checkpoints evita perda de conciliação. Nenhuma imagem órfã é removida automaticamente na V1.

## Diagnóstico

- RPC/catálogo: erro deve aparecer como indisponibilidade, não array vazio.
- Upload: bucket público product-images, somente image/webp, limite 2 MiB; objetos com hash e cache imutável.
- Cache: revalidate autenticado depois de commit, TTL 60s; snapshot acima de 300s exige leitura fresca.
- Eventos: referências inválidas são rejeitadas; dedup por UUID; preview test; timeout 1500ms.
- Auditoria de runtime: `npm audit --omit=dev`; ferramentas de lint têm advisory transitivo conhecido em braces/fast-glob, sem fix compatível apontado no audit atual. Não rodar lint com padrões de glob não confiáveis. [Advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).
