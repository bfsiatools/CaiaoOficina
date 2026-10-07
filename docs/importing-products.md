# Importação real e preservação editorial

Entrada recebida: `linkenomeprodutos.txt` e `image/relatorio.json` com PNGs. Cópia privada: `private/imports/v1/`. Quantidade esperada **47**. Correspondência por URL/relatório e arquivo explícito, sem associar pela posição de anexos.

`assets:prepare` aceita TXT `Nome:https://...` ou `Nome | https://...`, BOM/CRLF, ignora separadores `===`, normaliza nomes e gera slugs ASCII. URL é preservada exatamente depois do trim de borda. Duplicações divergentes são recusadas. IDs de produto e checkpoints são mantidos no manifesto existente.

Imagem recebida → validação de bytes/dimensões → WebP até 1600px sem ampliar → hash SHA-256 → `<product_uuid>/<hash>.webp`. Limites: 10 MiB de entrada, 40 MP, 2 MiB de saída. Metadados não são copiados. Cada imagem tem alt e dimensões reais; arquivo estático de fallback não substitui imagem de produto na importação.

```powershell
npm run assets:prepare
npx tsx scripts/audit-assets.ts
npm run import:products -- --dry-run --file private/imports/v1/products.txt
npm run import:products -- --apply --file private/imports/v1/products.txt
npm run import:products -- --dry-run --file private/imports/v1/products.txt
```

Sem chave privada, é possível planejar usando o último snapshot, **somente dry-run**:

```powershell
npm run import:products -- --dry-run --state private/imports/v1/staging-state.json
```

`--state` nunca autoriza apply. Esse snapshot é administrativo e pode ficar desatualizado. O apply sempre consulta o banco real. TXT informado e manifesto precisam corresponder. `--manifest` seleciona outro manifesto explicitamente; ausência de `--apply` mantém dry-run.

Resultados: modo, expected/valid/created/updated/ignored/errors. Exit 0 sucesso, 1 falha operacional, 2 entrada parcialmente inválida, 3 conflitos. Linhas inválidas não entram no lote válido. DB aplica o lote inteiro ou reverte a transação; erro de upload impede o lote. Imagens pré-enviadas podem ficar órfãs após falha de DB, sem publicação; nunca são apagadas automaticamente porque podem estar em uso.

Reimportação compara origem anterior e estado aplicado: preserva mudanças manuais em nome, descrição, slug, estado, posição, imagem, categoria e link quando a origem não mudou. Mudança simultânea incompatível vira conflito. Sem baseline, divergência de dados existentes é recusada. Upload de origem nunca sobrescreve uma imagem manual preservada. Reutilização de objeto existente verifica seu hash por download.

## Checkpoint atual

Primeiro lote `733452e5-2706-4c3e-919f-6ab86da36ecb`: cadastro de 47 inativos por MCP enquanto faltava a chave privada; retry 47 ignored. Depois da chave, importador executou o lote `6c17f7bf-35cf-4b63-94c3-ab9cbb30056e`: 47 uploads e 47 updates para active. Segunda execução `c58e1123-d227-44ba-9274-4791c016db80`: 0 created / 0 updated / 47 ignored. Cache invalidado em ambas. Banco confirma 47 ativos, 47 links, 47 objetos e zero imagem sem objeto correspondente. Manifesto guarda baseline final.

Dry-run de rollback do lote de publicação: 47 elegíveis, zero conflitos; nenhuma alteração foi desfeita na homologação.

Backup obrigatório de `private/imports/v1/manifest.json` e `private/reports/`. O manifesto guarda origem e estado aplicado; removê-lo perde a capacidade automática de conciliar edições.

## Rollback e troca de link

```powershell
npm run import:rollback -- --report private/reports/ARQUIVO.json
npm run import:rollback -- --report private/reports/ARQUIVO.json --apply
npm run links:replace -- --slug SLUG --url https://meli.la/LINK_REAL
npm run links:replace -- --slug SLUG --url https://meli.la/LINK_REAL --apply
```

Rollback exige relatório committed com proofVersion=1 e snapshot atômico devolvido pela RPC. Relatórios anteriores à migration import_atomic_proof exigem revisão manual, pois uma leitura posterior não prova o estado no commit. Recusa qualquer edição posterior ao lote e não desfaz linhas que a RPC ignorou. Produtos criados são desativados, não deletados; anteriores recuperam estado editorial e link por nova versão. Se antes não havia link, o produto volta ao estado anterior e a versão criada permanece histórica/atual porém não publicável enquanto inativo. Imagens e eventos não são apagados. Troca de link valida URL e usa CAS da versão atual; --expected-link-id opcional verifica uma versão que o operador já conhece.

Depois de commit, invalidação de cache é best-effort: falha não reverte dados. Endpoint interno autenticado pode ser chamado com `npm run catalog:revalidate`; TTL 60s e idade máxima de snapshot 300s limitam staleness.
