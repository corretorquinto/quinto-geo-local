/**
 * Quinto Geo Local — Engine v1.2.0
 *
 * Sistema de carregamento sob demanda de dados geográficos (cidades, bairros,
 * sub-bairros) para Quinto Imóveis.
 *
 * NOVIDADES v1.2.0:
 *  ✅ Detecção de URLs ImobiBrasil no padrão /bairro/[slug]-id-XXXX
 *  ✅ Match inteligente pelo nome do bairro dentro do slug (longest-match)
 *  ✅ Cobertura ampliada: 18 bairros + 1 sub-bairro (era 7 + 1)
 *  ✅ Mantém compatibilidade com URLs custom (/bairros/icarai, /charitas, etc.)
 *
 * RECURSOS HERDADOS DA v1.1.0:
 *  ✅ Detecção da Quinto GTM Schema Enricher v4.3 (evita duplicação)
 *  ✅ Renderização condicional: só atua em páginas dedicadas de bairro
 *  ✅ @id cruzado com Organization da v4.3 (grafo Schema.org conectado)
 *
 * ARQUITETURA — divisão de responsabilidades:
 *
 *   v4.3 (GTM Schema Enricher) cuida de:
 *     - /imovel/{id}/...    → RealEstateListing, Product, BuyAction, FAQ
 *     - /imovel/...         → ItemList (listagens)
 *     - /noticias/...       → Article + Breadcrumb
 *     - /sobre              → Person + ProfilePage
 *     - /                   → Organization + WebSite
 *
 *   Quinto Geo Local v1.2.0 cuida APENAS de:
 *     - /bairro/...-id-XXXX  → Páginas "Bairros que Amamos" do ImobiBrasil
 *     - /bairros/{slug}      → URLs custom (alternativa)
 *     - /icarai, /charitas   → URLs diretas (alternativa)
 *     - Páginas com <meta name="quinto-geo-neighborhood">
 *
 * Hospedagem: GitHub Pages + jsDelivr CDN
 *
 * Uso básico:
 *   <script src="https://cdn.jsdelivr.net/gh/SEU_USUARIO/quinto-geo-local@v1.2.0/core.js" defer></script>
 *   <script>
 *     QuintoGeo.init({
 *       baseUrl: 'https://cdn.jsdelivr.net/gh/SEU_USUARIO/quinto-geo-local@v1.2.0/',
 *       autoRender: true
 *     });
 *   </script>
 *
 * Autor: Quinto Imóveis (Antônio Quinto, CRECI-RJ 040171)
 * Licença: Uso interno Quinto Imóveis
 */

(function (window) {
  'use strict';

  /* Constantes da v4.3 — usadas para conectar o grafo Schema.org */
  var V43_ORGANIZATION_ID = 'https://www.quintoimoveis.com.br/#organization';
  var V43_WEBSITE_ID = 'https://www.quintoimoveis.com.br/#website';
  var V43_FOUNDER_ID = 'https://www.quintoimoveis.com.br/#antonio-quinto';
  var V43_SITE_BASE = 'https://www.quintoimoveis.com.br';

  /**
   * Mapa de slugs conhecidos → IDs de bairros.
   * IMPORTANTE: ordem dos slugs longos PRIMEIRO (longest-match).
   * Sem isso, "jardim-icarai" seria detectado como "icarai".
   */
  var SLUG_MAP = [
    /* === SUB-BAIRROS E NOMES COMPOSTOS (longest-match — vem primeiro) === */
    { slug: 'jardim-icarai', id: 'niteroi-jardim-icarai' },
    { slug: 'engenho-do-mato', id: 'niteroi-engenho-do-mato' },
    { slug: 'santa-rosa', id: 'niteroi-santa-rosa' },
    { slug: 'sao-francisco', id: 'niteroi-sao-francisco' },
    { slug: 'sao-domingos', id: 'niteroi-sao-domingos' },
    { slug: 'boa-viagem', id: 'niteroi-boa-viagem' },
    { slug: 'centro-niteroi', id: 'niteroi-centro' },

    /* === NOMES SIMPLES === */
    { slug: 'icarai', id: 'niteroi-icarai' },
    { slug: 'charitas', id: 'niteroi-charitas' },
    { slug: 'inga', id: 'niteroi-inga' },
    { slug: 'piratininga', id: 'niteroi-piratininga' },
    { slug: 'camboinhas', id: 'niteroi-camboinhas' },
    { slug: 'itacoatiara', id: 'niteroi-itacoatiara' },
    { slug: 'itaipu', id: 'niteroi-itaipu' },
    { slug: 'cafuba', id: 'niteroi-cafuba' },
    { slug: 'pendotiba', id: 'niteroi-pendotiba' },
    { slug: 'badu', id: 'niteroi-badu' },
    { slug: 'barreto', id: 'niteroi-barreto' },
    { slug: 'fonseca', id: 'niteroi-fonseca' },
    { slug: 'centro', id: 'niteroi-centro' }
  ];

  var QuintoGeo = {
    version: '1.2.0',
    config: {
      baseUrl: '',
      autoRender: false,
      neighborhoodId: null,
      includeNeighbors: true,
      maxNeighbors: 3,
      renderTarget: '#quinto-geo-container',
      jsonScriptId: 'quinto-geo-local',
      microdataContainerId: 'quinto-geo-microdata',
      jsonLdScriptId: 'quinto-geo-jsonld',
      forceRender: false,
      /* Padrões de URL que ativam a engine */
      activationPatterns: [
        /^\/bairro\/[^\/]+/i,                       /* ImobiBrasil: /bairro/viva-em-icarai-...-id-XXXX */
        /^\/bairros\/[^\/]+/i,                      /* Custom: /bairros/icarai */
        /^\/(icarai|charitas|inga|santa-rosa|sao-francisco|jardim-icarai|centro-niteroi|boa-viagem|sao-domingos|piratininga|camboinhas|itaipu|itacoatiara|cafuba|engenho-do-mato|pendotiba|badu|barreto|fonseca)\/?$/i
      ],
      v43GuardSelectors: [
        'script[data-quinto-organization]',
        'script[data-quinto-website]',
        'script[data-quinto-enriched]',
        'script[data-quinto-itemlist]',
        'script[data-quinto-article]',
        'script[data-quinto-faq]',
        'script[data-quinto-profilepage]',
        'script[data-quinto-webpage]'
      ]
    },
    cache: {
      manifest: null,
      neighborhoods: {}
    },

    /**
     * Inicializa o sistema
     */
    init: function (userConfig) {
      Object.assign(this.config, userConfig || {});

      if (!this.config.baseUrl) {
        console.error('[QuintoGeo] baseUrl é obrigatório');
        return;
      }

      if (!this.config.baseUrl.endsWith('/')) {
        this.config.baseUrl += '/';
      }

      /* Decisão de renderização */
      if (!this.config.forceRender) {
        var decision = this._shouldRender();
        if (!decision.render) {
          if (window.console && console.debug) {
            console.debug('[QuintoGeo v1.2.0] Não renderizou: ' + decision.reason);
          }
          return;
        }
      }

      /* Detecta neighborhoodId — prioridade: meta tag > URL */
      if (!this.config.neighborhoodId) {
        this.config.neighborhoodId = this._detectFromMeta() || this._detectFromUrl();
      }

      if (this.config.autoRender && this.config.neighborhoodId) {
        this.render(this.config.neighborhoodId);
      } else if (this.config.autoRender && !this.config.neighborhoodId) {
        if (window.console && console.warn) {
          console.warn('[QuintoGeo v1.2.0] Página candidata mas neighborhoodId não identificado.');
        }
      }
    },

    /**
     * Decide se deve renderizar nesta página
     */
    _shouldRender: function () {
      var path = window.location.pathname;

      /* Bloqueia páginas cobertas pela v4.3 */
      if (/^\/imovel\/\d+/i.test(path)) {
        return { render: false, reason: 'página de imóvel individual (cuidada pela v4.3)' };
      }
      if (/^\/imovel(\/|$|\/(venda|locacao|aluguel|alugar))/i.test(path)) {
        return { render: false, reason: 'página de listagem (cuidada pela v4.3)' };
      }
      if (/^\/noticias\//i.test(path)) {
        return { render: false, reason: 'página de notícia (cuidada pela v4.3)' };
      }
      if (/^\/sobre/i.test(path)) {
        return { render: false, reason: 'página /sobre (cuidada pela v4.3)' };
      }
      if (path === '/' || path === '') {
        return { render: false, reason: 'página inicial (cuidada pela v4.3)' };
      }

      /* Meta tag explícita tem prioridade máxima */
      if (this._detectFromMeta()) {
        return { render: true, reason: 'meta tag quinto-geo-neighborhood presente' };
      }

      /* Testa padrões de URL de ativação */
      for (var i = 0; i < this.config.activationPatterns.length; i++) {
        if (this.config.activationPatterns[i].test(path)) {
          return { render: true, reason: 'URL corresponde a padrão de página de bairro' };
        }
      }

      return { render: false, reason: 'página fora do escopo da Quinto Geo Local' };
    },

    /**
     * Detecta bairro pela meta tag
     */
    _detectFromMeta: function () {
      var meta = document.querySelector('meta[name="quinto-geo-neighborhood"]');
      return meta ? meta.getAttribute('content') : null;
    },

    /**
     * Detecta bairro pela URL (slug match).
     * Funciona para múltiplos padrões: /bairro/..., /bairros/..., /icarai, etc.
     */
    _detectFromUrl: function () {
      var path = window.location.pathname.toLowerCase();

      /* Tenta cada slug do mapa (longest-match first) */
      for (var i = 0; i < SLUG_MAP.length; i++) {
        var slug = SLUG_MAP[i].slug;
        /* Boundary check: slug deve ser palavra completa, não fragmento */
        var pattern = new RegExp('(^|/|-)' + this._escapeRegex(slug) + '(/|-|$|\\?)');
        if (pattern.test(path)) {
          return SLUG_MAP[i].id;
        }
      }

      return null;
    },

    /**
     * Escapa caracteres especiais de regex
     */
    _escapeRegex: function (str) {
      return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    /**
     * Detecta se a v4.3 está ativa
     */
    _isV43Active: function () {
      if (window.__quintoSchemaEnrichedV43) return true;
      for (var i = 0; i < this.config.v43GuardSelectors.length; i++) {
        if (document.querySelector(this.config.v43GuardSelectors[i])) return true;
      }
      return false;
    },

    /**
     * Carrega o manifest mestre
     */
    loadManifest: function () {
      if (this.cache.manifest) {
        return Promise.resolve(this.cache.manifest);
      }

      return fetch(this.config.baseUrl + 'manifest.json')
        .then(function (r) {
          if (!r.ok) throw new Error('Falha ao carregar manifest');
          return r.json();
        })
        .then(function (data) {
          QuintoGeo.cache.manifest = data;
          return data;
        });
    },

    /**
     * Carrega dados de um bairro específico
     */
    loadNeighborhood: function (id) {
      var self = this;
      if (this.cache.neighborhoods[id]) {
        return Promise.resolve(this.cache.neighborhoods[id]);
      }

      return this.loadManifest().then(function (manifest) {
        var cityId = null;
        var neighborhoodSlug = null;

        var cityIds = Object.keys(manifest.cities);
        for (var i = 0; i < cityIds.length; i++) {
          var cid = cityIds[i];
          if (id.indexOf(cid + '-') === 0) {
            cityId = cid;
            neighborhoodSlug = id.substring(cid.length + 1);
            break;
          }
        }

        if (!cityId) {
          throw new Error('Cidade não identificada para ID: ' + id);
        }

        var url = self.config.baseUrl + 'data/' + cityId + '/' + neighborhoodSlug + '.json';

        return fetch(url)
          .then(function (r) {
            if (!r.ok) throw new Error('Falha ao carregar ' + id);
            return r.json();
          })
          .then(function (data) {
            self.cache.neighborhoods[id] = data;
            return data;
          });
      });
    },

    /**
     * Carrega bairros limítrofes
     */
    loadNeighbors: function (neighborhoodData) {
      var self = this;
      if (!neighborhoodData.boundaries || !neighborhoodData.boundaries.all) {
        return Promise.resolve([]);
      }

      var max = this.config.maxNeighbors;
      var validPrefixes = ['niteroi-', 'sao-goncalo-', 'marica-', 'rio-de-janeiro-'];

      var neighborIds = neighborhoodData.boundaries.all
        .filter(function (id) {
          for (var i = 0; i < validPrefixes.length; i++) {
            if (id.indexOf(validPrefixes[i]) === 0) return true;
          }
          return false;
        })
        .slice(0, max);

      var promises = neighborIds.map(function (id) {
        return self.loadNeighborhood(id).catch(function () {
          if (window.console && console.warn) {
            console.warn('[QuintoGeo v1.2.0] Vizinho não disponível: ' + id);
          }
          return null;
        });
      });

      return Promise.all(promises).then(function (results) {
        return results.filter(function (r) { return r; });
      });
    },

    /**
     * Renderiza
     */
    render: function (neighborhoodId) {
      var self = this;

      return this.loadNeighborhood(neighborhoodId).then(function (data) {
        var neighborsPromise = self.config.includeNeighbors
          ? self.loadNeighbors(data)
          : Promise.resolve([]);

        return neighborsPromise.then(function (neighbors) {
          self._injectJSONLD(data, neighbors);
          self._injectJSON(data, neighbors);
          self._injectMicrodata(data, neighbors);
          return { primary: data, neighbors: neighbors };
        });
      }).catch(function (err) {
        if (window.console && console.error) {
          console.error('[QuintoGeo v1.2.0] Erro ao renderizar:', err);
        }
      });
    },

    /**
     * Injeta JSON-LD com Schema.org Place + @id cruzado com v4.3
     */
    _injectJSONLD: function (primary, neighbors) {
      var existing = document.getElementById(this.config.jsonLdScriptId);
      if (existing) existing.remove();

      var placeId = V43_SITE_BASE + '/#place-' + primary.id;
      var cityName = primary.city_name || 'Niterói';

      var place = {
        '@context': 'https://schema.org',
        '@type': 'Place',
        '@id': placeId,
        'name': primary.name,
        'description': primary.description,
        'url': window.location.href.split('#')[0],
        'containedInPlace': {
          '@type': 'City',
          'name': cityName,
          'containedInPlace': {
            '@type': 'State',
            'name': 'Rio de Janeiro',
            'containedInPlace': {
              '@type': 'Country',
              'name': 'Brasil'
            }
          }
        }
      };

      /* Sub-bairro: referência ao bairro oficial */
      if (primary.type === 'sub_neighborhood' && primary.official_neighborhood_name) {
        place.containedInPlace = {
          '@type': 'Place',
          'name': primary.official_neighborhood_name,
          'description': 'Bairro oficial pelo Plano Diretor de Niterói',
          'containedInPlace': place.containedInPlace
        };
      }

      /* Marcos / pontos de interesse */
      if (primary.landmarks && primary.landmarks.length) {
        place.containsPlace = primary.landmarks.map(function (l) {
          return {
            '@type': 'LandmarksOrHistoricalBuildings',
            'name': l
          };
        });
      }

      /* Bairros limítrofes via geoTouches */
      if (neighbors && neighbors.length) {
        place.geoTouches = neighbors.map(function (n) {
          var neighborObj = {
            '@type': 'Place',
            '@id': V43_SITE_BASE + '/#place-' + n.id,
            'name': n.name
          };
          if (n.description) {
            neighborObj.description = n.description.substring(0, 200);
          }
          return neighborObj;
        });
      }

      /* Conexão com Organization da v4.3 */
      place.knownByOrganization = { '@id': V43_ORGANIZATION_ID };

      /* WebPage */
      var webPage = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': window.location.href.split('#')[0] + '#webpage',
        'url': window.location.href.split('#')[0],
        'name': document.title,
        'isPartOf': { '@id': V43_WEBSITE_ID },
        'about': { '@id': placeId },
        'mainEntity': { '@id': placeId },
        'publisher': { '@id': V43_ORGANIZATION_ID },
        'inLanguage': 'pt-BR'
      };

      var graph = {
        '@context': 'https://schema.org',
        '@graph': [place, webPage]
      };

      var script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = this.config.jsonLdScriptId;
      script.setAttribute('data-quinto-geo', 'v1.2.0');
      script.textContent = JSON.stringify(graph, null, 2);
      document.head.appendChild(script);
    },

    /**
     * Injeta JSON estruturado para LLMs
     */
    _injectJSON: function (primary, neighbors) {
      var existing = document.getElementById(this.config.jsonScriptId);
      if (existing) existing.remove();

      var script = document.createElement('script');
      script.type = 'application/json';
      script.id = this.config.jsonScriptId;
      script.setAttribute('data-quinto-geo', 'v1.2.0');
      script.textContent = JSON.stringify({
        publisher: this.cache.manifest ? this.cache.manifest.publisher : null,
        organization_ref: V43_ORGANIZATION_ID,
        primary: primary,
        neighbors: neighbors,
        generated_at: new Date().toISOString()
      }, null, 2);

      document.head.appendChild(script);
    },

    /**
     * Injeta Microdata HTML visível (opcional)
     */
    _injectMicrodata: function (primary, neighbors) {
      var target = document.querySelector(this.config.renderTarget);
      if (!target) return;

      var existing = document.getElementById(this.config.microdataContainerId);
      if (existing) existing.remove();

      var container = document.createElement('div');
      container.id = this.config.microdataContainerId;
      container.setAttribute('itemscope', '');
      container.setAttribute('itemtype', 'https://schema.org/Place');
      container.innerHTML = this._buildMicrodataHTML(primary, neighbors);

      target.appendChild(container);
    },

    _buildMicrodataHTML: function (primary, neighbors) {
      var cityName = primary.city_name || 'Niterói';
      var stateName = 'Rio de Janeiro';
      var escape = this._escapeHTML;

      var html = '';
      html += '<meta itemprop="name" content="' + escape(primary.name) + '">';
      html += '<meta itemprop="description" content="' + escape(primary.description) + '">';

      html += '<div itemprop="containedInPlace" itemscope itemtype="https://schema.org/City">';
      html += '<meta itemprop="name" content="' + escape(cityName) + '">';
      html += '<div itemprop="containedInPlace" itemscope itemtype="https://schema.org/State">';
      html += '<meta itemprop="name" content="' + escape(stateName) + '">';
      html += '<div itemprop="containedInPlace" itemscope itemtype="https://schema.org/Country">';
      html += '<meta itemprop="name" content="Brasil">';
      html += '</div></div></div>';

      if (primary.type === 'sub_neighborhood' && primary.official_neighborhood_name) {
        html += '<div itemprop="containedInPlace" itemscope itemtype="https://schema.org/Place">';
        html += '<meta itemprop="name" content="' + escape(primary.official_neighborhood_name) + '">';
        html += '<meta itemprop="description" content="Bairro oficial pelo Plano Diretor de Niterói">';
        html += '</div>';
      }

      if (primary.landmarks && primary.landmarks.length) {
        primary.landmarks.forEach(function (landmark) {
          html += '<div itemprop="containsPlace" itemscope itemtype="https://schema.org/LandmarksOrHistoricalBuildings">';
          html += '<meta itemprop="name" content="' + escape(landmark) + '">';
          html += '</div>';
        });
      }

      if (neighbors && neighbors.length) {
        neighbors.forEach(function (n) {
          html += '<div itemprop="geoTouches" itemscope itemtype="https://schema.org/Place">';
          html += '<meta itemprop="name" content="' + escape(n.name) + '">';
          if (n.description) {
            html += '<meta itemprop="description" content="' + escape(n.description.substring(0, 200)) + '">';
          }
          html += '</div>';
        });
      }

      return html;
    },

    _escapeHTML: function (str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }
  };

  window.QuintoGeo = QuintoGeo;
})(window);
