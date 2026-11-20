# Quinto Geo Local — v1.2.0

Sistema modular de dados geográficos estruturados (cidades, bairros, sub-bairros) para Quinto Imóveis, projetado para conviver com a **Quinto GTM Schema Enricher** (versão atual: v4.9; chamada de "v4.3" no código, por histórico) e detectar automaticamente as URLs das páginas "Bairros que Amamos" do ImobiBrasil.

**Arquitetura:** Multi-cidade modular com lazy-loading via GitHub Pages (`corretorquinto.github.io/quinto-geo-local`), com renderização condicional e detecção inteligente de URLs.

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
| `/noticias/...` (blog) | Só meta tags (Open Graph). Article, FAQPage e BreadcrumbList ficam na tag GTM **Quinto Article Schema Blog v1.3**, que também marca o bairro do artigo (`contentLocation`) com o mesmo `@id` do Place desta engine |
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
2. **Cruza `@id` com `Organization` da v4.3** (`https://www.quintoimoveis.com.br/#imobiliaria`)
3. **Cruza `@id` com `WebSite` da v4.3** (`https://www.quintoimoveis.com.br/#website`)
4. Resultado: o Google vê **um único grafo Schema.org coerente**.

### ⚠️ Onde NÃO instalar esta tag

- **Google Tag Manager** — Schema.org via GTM tem indexação atrasada (dias ou semanas)

**Onde está instalada hoje:** na "Tag HTML adicional" global do ImobiBrasil (cabeçalho de todas as páginas), com a meta tag padrão `niteroi-icarai` e um script que ajusta a meta conforme a página (bairro da ficha, bairro do título nas páginas `/bairro/`). O campo do ImobiBrasil apaga barras invertidas: o script instalado lá não pode usar `\`.
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
├── coordenadas.json                 Coordenadas dos imóveis (commit automático do motor_geo_v14; lido pela tag do mapa no GTM)
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
```

As pastas de São Gonçalo, Maricá e Rio de Janeiro ainda não existem: serão criadas quando houver o primeiro JSON de bairro dessas cidades.

---

## Como atualizar (GitHub Pages)

O site carrega os arquivos direto do GitHub Pages: `https://corretorquinto.github.io/quinto-geo-local/`.

1. Abra o arquivo em `github.com/corretorquinto/quinto-geo-local`
2. Clique no lápis (**Edit this file**), cole o conteúdo novo
3. **Commit changes**
4. O GitHub Pages publica em alguns minutos (o navegador pode guardar a versão anterior por até ~10 minutos)

O `coordenadas.json` é atualizado sozinho pelo motor_geo_v14 a cada imóvel geocodificado; os demais arquivos são atualizados à mão.

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
| Cache do GitHub Pages | ~10 minutos |

Constante independente de você ter 8 ou 200 bairros.

---

## Como adicionar um novo bairro

1. Crie um novo arquivo JSON em `data/niteroi/[slug].json` (siga o template dos existentes)
2. Adicione o ID em `manifest.json` na lista `neighborhoods`
3. **Adicione o slug no array `SLUG_MAP` do `core.js`** (no topo do arquivo)
4. ⚠️ **Coloque slugs longos antes dos curtos** (longest-match)
5. Faça o commit; o GitHub Pages publica em alguns minutos

---

## Versionamento

- **v1.1.0** — Primeira versão pública (7 bairros + sub-bairro)
- **v1.2.0** (atual) — 12 novos bairros + detecção URLs ImobiBrasil. Cobertura total: 19 entidades
  - nov/2026: `@id` da imobiliária passou de `#organization` para `#imobiliaria`; removida a propriedade inválida `knownByOrganization` do Place
- **v1.3.0** (futuro) — Refinamentos e mais sub-bairros se houver demanda
- **v2.0.0** (futuro) — Multi-cidade ativa (São Gonçalo, Maricá, Rio de Janeiro)

---

## Segurança

Este repositório segue boas práticas documentadas em [SECURITY.md](SECURITY.md):
- 2FA habilitado na conta GitHub
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
