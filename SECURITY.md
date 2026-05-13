# Política de Segurança — Quinto Geo Local

## Sobre este projeto

Este repositório contém **dados geográficos públicos** (informações sobre bairros de Niterói/RJ) e **código JavaScript de renderização** servido via CDN público (jsDelivr). Não há servidor de aplicação, banco de dados ou credenciais armazenadas.

Os dados são intencionalmente públicos: nomes de bairros, descrições históricas, marcos urbanos, fontes oficiais. Tudo o que está aqui pode (e deve) ser indexado por buscadores e LLMs.

---

## Versões com suporte de segurança

| Versão | Suporte de segurança |
|---|---|
| 1.2.x | ✅ Sim |
| 1.1.x | ⚠️ Suporte limitado — recomenda-se migrar para 1.2.x |
| 1.0.x | ❌ Descontinuada |

Use sempre a versão mais recente: https://github.com/corretorquinto/quinto-geo-local/releases

---

## Como reportar uma vulnerabilidade

Se você identificar:

- Adulteração de dados no repositório
- Comportamento suspeito do `core.js`
- URL do jsDelivr servindo conteúdo diferente do esperado
- Qualquer outra preocupação de segurança

**Não abra issue pública.** Em vez disso:

1. Acesse o site oficial: https://quintoimoveis.com.br
2. Use o canal de contato disponível no site
3. Indique no assunto: `[SEGURANÇA] Quinto Geo Local`
4. Descreva o problema e, se possível, como reproduzi-lo

Resposta esperada em até 7 dias úteis.

---

## Boas práticas para quem usa este projeto

### Sempre fixe a versão no jsDelivr

```html
<!-- ✅ CORRETO: versão imutável -->
<script src="https://cdn.jsdelivr.net/gh/corretorquinto/quinto-geo-local@v1.2.0/core.js"></script>

<!-- ❌ NUNCA: versão mutável -->
<script src="https://cdn.jsdelivr.net/gh/corretorquinto/quinto-geo-local@latest/core.js"></script>
<script src="https://cdn.jsdelivr.net/gh/corretorquinto/quinto-geo-local@main/core.js"></script>
```

Versão fixa garante que mesmo em caso de comprometimento futuro do repositório, o site continua servindo o código auditado da versão escolhida.

### Considere usar Subresource Integrity (SRI)

Para uma camada adicional de segurança, adicione hash SRI à tag de script. Calcule depois de publicar:

```bash
curl -s https://cdn.jsdelivr.net/gh/corretorquinto/quinto-geo-local@v1.2.0/core.js \
  | openssl dgst -sha384 -binary | openssl base64 -A
```

E use na tag:

```html
<script
  src="https://cdn.jsdelivr.net/gh/corretorquinto/quinto-geo-local@v1.2.0/core.js"
  integrity="sha384-HASH_CALCULADO_AQUI"
  crossorigin="anonymous"
  defer></script>
```

**Atenção:** o hash precisa ser atualizado a cada nova versão.

---

## Garantias do mantenedor

O mantenedor deste repositório se compromete a:

- ✅ Manter 2FA habilitado na conta GitHub
- ✅ Usar tags de versão imutáveis no jsDelivr (`@v1.x.x`)
- ✅ Não armazenar credenciais, tokens, senhas ou dados pessoais de terceiros
- ✅ Auditar o histórico de commits periodicamente
- ✅ Publicar mudanças apenas via tags de versão
- ✅ Documentar mudanças relevantes no histórico de releases

---

## Política de dependências

Este projeto **não tem dependências externas em tempo de execução**:

- Sem `node_modules`
- Sem `package.json` em runtime
- Sem bibliotecas JavaScript externas
- Apenas `fetch` nativo do navegador

Isto elimina a superfície de ataque típica de projetos JavaScript modernos.

---

## O que NÃO está coberto

Este projeto **não cobre**:

- Segurança do site `quintoimoveis.com.br` em si (responsabilidade do CMS ImobiBrasil)
- Segurança da infraestrutura GitHub ou jsDelivr (responsabilidade dos provedores)
- Configurações de segurança do servidor que serve `quintoimoveis.com.br`

Para questões nesses domínios, consulte os provedores correspondentes.

---

## Histórico de incidentes

Nenhum incidente registrado.

---

**Última atualização:** v1.2.0 — 2026-05-09
