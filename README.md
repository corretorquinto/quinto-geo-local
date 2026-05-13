# Quinto Geo Local — v1.2.0

Sistema modular de dados geográficos estruturados (cidades, bairros, sub-bairros) para Quinto Imóveis, projetado para conviver harmoniosamente com a **Quinto GTM Schema Enricher v4.3** e detectar automaticamente as URLs das páginas "Bairros que Amamos" do ImobiBrasil.

**Arquitetura:** Multi-cidade modular com lazy-loading via CDN externo (GitHub Pages + jsDelivr), com renderização condicional e detecção inteligente de URLs.

**Autor:** Antônio Quinto — CRECI-RJ 040171 — quintoimoveis.com.br

---

## 🆕 Novidades da v1.2.0

- ✅ **Cobertura ampliada**: 18 bairros + 1 sub-bairro (era 7 + 1)
- ✅ **Detecção automática** das URLs ImobiBrasil `/bairro/[slug]-id-XXXX`
- ✅ **Match inteligente pelo nome do bairro no slug** (longest-match)
- ✅ **Filtro de conteúdo**: removidas referências a morros, comunidades, favelas, cemitérios e termos depreciativos em todos os JSONs

---

## ⚠️ Importante: divisão de responsabilidades com a v4.3

Este sistema **não substitui** a tag GTM Schema Enricher v4.3. Os dois trabalham juntos:

### O que a v4.3 (GTM) faz

| Tipo de página | Schema.org gerado |
|---|---|
| `/imovel/{id}/...` (imóvel individual) | RealEstateListing, Product, Offer, BuyAction, FAQPage |
| `/imovel/...` (listagem de imóveis) | ItemList com filtros |
| `/noticias/...` (blog) | Article + BreadcrumbList |
| `/sobre` | Person + ProfilePage |
| `/` (home) | Organization + WebSite |

A v4.3 também gerencia Open Graph e Twitter Cards em todas as páginas.

### O que a Quinto Geo Local faz

| Tipo de página | Schema.org gerado |
|---|---|
| `/bairro/[slug]-id-XXXX` (Bairros que Amamos ImobiBrasil) | Place rico + WebPage |
| `/bairros/[slug]` (URLs custom) | Place rico + WebPage |
| `/icarai`, `/charitas`, etc. (URLs diretas) | Place rico + WebPage |
| Páginas com `<meta name="quinto-geo-neighborhood">` | Place rico + WebPage |

### Como elas se conectam

A Quinto Geo Local v1.2.0 **detecta a v4.3** e:

1. **Não renderiza** em páginas que a v4.3 já cobre
2. **Cruza `@id` com `Organization` da v4.3** (`https://www.quintoimoveis.com.br/#organization`)
3. **Cruza `@id` com `WebSite` da v4.3** (`https://www.quintoimoveis.com.br/#website`)
4. Resultado: o Google vê **um único grafo Schema.org coerente**.

### ⚠️ Onde NÃO instalar esta tag

- **Google Tag Manager** — Schema.org via GTM tem indexação atrasada (dias ou semanas)
- **Páginas de imóvel individual** — a v4.3 já cuida
- **Páginas de listagem** — a v4.3 já cuida
- **Páginas de notícia** — a v4.3 já cuida

A tag tem **proteção interna**: mesmo se acidentalmente instalada onde não deveria, ela detecta e não renderiza.

---

## Cobertura na v1.2.0

| Região | Bairros |
|---|---|
| **Zona Sul** | Centro, Icaraí, Jardim Icaraí (sub-bairro), Ingá, Santa Rosa, São Francisco, Charitas, Boa Viagem, São Domingos |
| **Região Oceânica** | Piratininga, Camboinhas, Itaipu, Itacoatiara, Cafubá, Engenho do Mato |
| **Pendotiba** | Pendotiba, Badu |
| **Zona Norte** | Barreto, Fonseca |

**Total**: 18 bairros + 1 sub-bairro = **19 entidades**

| Cidade | Status |
|---|---|
| Niterói | ✅ Ativa |
| São Gonçalo | ⏳ Placeholder |
| Maricá | ⏳ Placeholder |
| Rio de Janeiro | ⏳ Placeholder |

---

## Estrutura de arquivos

```
quinto-geo-local/
├── manifest.json                    Índice mestre de cidades e bairros
├── core.js                          Engine v1.2.0
├── tag-imobibrasil.html             Tag HTML pronta para colar no CMS
├── README.md                        Este arquivo
├── SECURITY.md                      Política de segurança
├── .gitignore                       Previne commits acidentais
└── data/
    ├── niteroi/                     19 arquivos (18 bairros + Jardim Icaraí)
    │   ├── badu.json
    │   ├── barreto.json
    │   ├── boa-viagem.json
    │   ├── cafuba.json
    │   ├── camboinhas.json
    │   ├── centro.json
    │   ├── charitas.json
    │   ├── engenho-do-mato.json
    │   ├── fonseca.json
    │   ├── icarai.json
    │   ├── inga.json
    │   ├── itacoatiara.json
    │   ├── itaipu.json
    │   ├── jardim-icarai.json
    │   ├── pendotiba.json
    │   ├── piratininga.json
    │   ├── santa-rosa.json
    │   ├── sao-domingos.json
    │   └── sao-francisco.json
    ├── sao-goncalo/                 (vazio — pronto para popular)
    ├── marica/                      (vazio — pronto para popular)
    └── rio-de-janeiro/              (vazio — pronto para popular)
```

---

## Deploy no GitHub Pages + jsDelivr (atualização da v1.1.0 → v1.2.0)

Se você já tem o repositório `quinto-geo-local` no GitHub com a v1.1.0:

### Passo 1 — Subir os arquivos novos/atualizados

1. Vá em `github.com/corretorquinto/quinto-geo-local`
2. Clique em **Add file** → **Upload files**
3. Arraste TODA a estrutura nova (`manifest.json`, `core.js`, `README.md`, `tag-imobibrasil.html`, `SECURITY.md`, `.gitignore`, pasta `data/`)
4. Mensagem de commit: `v1.2.0 — 12 novos bairros + detecção ImobiBrasil`
5. **Commit changes**

### Passo 2 — Criar a release v1.2.0

1. Releases → **Create a new release**
2. **Choose a tag** → digite `v1.2.0` → **Create new tag: v1.2.0 on publish**
3. Título: `v1.2.0 — 12 novos bairros + detecção ImobiBrasil`
4. **Publish release**

### Passo 3 — Validar URLs do jsDelivr

```
https://cdn.jsdelivr.net/gh/corretorquinto/quinto-geo-local@v1.2.0/manifest.json
https://cdn.jsdelivr.net/gh/corretorquinto/quinto-geo-local@v1.2.0/core.js
https://cdn.jsdelivr.net/gh/corretorquinto/quinto-geo-local@v1.2.0/data/niteroi/icarai.json
```

### Passo 4 — Atualizar a tag instalada no site

Se a tag v1.1.0 já estiver instalada em algum lugar, atualize a versão para `@v1.2.0`.

---

## Como funciona a detecção automática

A engine v1.2.0 reconhece páginas de bairro automaticamente nestes padrões:

### Padrão ImobiBrasil "Bairros que Amamos" ⭐
```
/bairro/viva-em-icarai-niteroi-apartamentos-a-venda-id-3282    → niteroi-icarai
/bairro/morar-em-charitas-niteroi-id-XXXX                       → niteroi-charitas
/bairro/conhecendo-jardim-icarai-id-XXXX                        → niteroi-jardim-icarai
/bairro/apartamentos-piratininga-id-XXXX                        → niteroi-piratininga
```

A engine usa **longest-match** para garantir que `jardim-icarai` seja detectado como sub-bairro (e não como Icaraí), `santa-rosa` como bairro completo, etc.

### Padrão URLs custom
```
/bairros/icarai          → niteroi-icarai
/bairros/charitas        → niteroi-charitas
/icarai                  → niteroi-icarai (direto)
/charitas                → niteroi-charitas (direto)
```

### Meta tag explícita (override)
```html
<meta name="quinto-geo-neighborhood" content="niteroi-icarai">
```

Tem prioridade máxima — funciona em qualquer URL.

### Páginas que NÃO disparam a engine
```
/                        → bloqueada (cuidada pela v4.3)
/imovel/12345/...        → bloqueada (cuidada pela v4.3)
/imovel/venda/...        → bloqueada (cuidada pela v4.3)
/noticias/post-x         → bloqueada (cuidada pela v4.3)
/sobre                   → bloqueada (cuidada pela v4.3)
```

---

## Validação

### Validar Schema.org

Use o **Schema.org Validator**: https://validator.schema.org/

Cole a URL de uma página de bairro e confirme:
- Detecção de `Place` com `containedInPlace`
- `@id` cruzado com Organization da v4.3
- `geoTouches` para bairros limítrofes

### Validar Rich Results

Use o **Google Rich Results Test**: https://search.google.com/test/rich-results

### Validar coexistência com a v4.3

Em DevTools → Console:

```javascript
QuintoGeo._isV43Active()    // true se v4.3 estiver ativa
QuintoGeo.cache             // mostra dados carregados
QuintoGeo.config.neighborhoodId    // ID detectado
```

---

## Performance

| Métrica | Valor |
|---|---|
| Tamanho do `core.js` | ~18 KB (não-minificado) |
| Tamanho médio de um JSON de bairro | ~2-3 KB |
| JSONs carregados por página | 1 manifest + 1 bairro principal + até 3 limítrofes |
| Total transferido por página de bairro | ~12 KB |
| Cache do jsDelivr | 7 dias por padrão |

Constante independente de você ter 8 ou 200 bairros.

---

## Como adicionar um novo bairro

1. Crie um novo arquivo JSON em `data/niteroi/[slug].json` (siga o template dos existentes)
2. Adicione o ID em `manifest.json` na lista `neighborhoods`
3. **Adicione o slug no array `SLUG_MAP` do `core.js`** (no topo do arquivo)
4. ⚠️ **Coloque slugs longos antes dos curtos** (longest-match)
5. Crie nova tag de versão (v1.3.0, etc.)

---

## Versionamento

- **v1.1.0** — Primeira versão pública (7 bairros + sub-bairro)
- **v1.2.0** (atual) — 12 novos bairros + detecção URLs ImobiBrasil. Cobertura total: 19 entidades
- **v1.3.0** (futuro) — Refinamentos e mais sub-bairros se houver demanda
- **v2.0.0** (futuro) — Multi-cidade ativa (São Gonçalo, Maricá, Rio de Janeiro)

---

## Segurança

Este repositório segue boas práticas documentadas em [SECURITY.md](SECURITY.md):
- 2FA habilitado na conta GitHub
- Tags de versão imutáveis no jsDelivr
- Auditoria pré-commit
- Zero dependências externas em runtime

---

## Troubleshooting

### A tag não está renderizando em uma página de bairro

1. Confirme que a URL está em um dos padrões reconhecidos
2. Abra DevTools → Console e procure por mensagens `[QuintoGeo v1.2.0]`
3. Para forçar: `QuintoGeo.init({ forceRender: true, ... })`

### A engine renderiza o bairro errado (ex: Icaraí em vez de Jardim Icaraí)

Verifique a ordem no `SLUG_MAP` do `core.js` — slugs compostos devem vir antes dos simples.

---

## Suporte

Site oficial: https://quintoimoveis.com.br
Antônio Quinto — CRECI-RJ 040171
Quinto Imóveis | Niterói, RJ
