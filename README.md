# NFT Marketplace

Marketplace de NFTs construído como desafio técnico frontend. React + TypeScript, com fluxos completos de descoberta, compra e conta (desktop e mobile), usando dados simulados na camada de rede.

- **Repositório:** <https://github.com/thiagosullivan/nft-marketplace-jg>
- **Deploy:** [A CONFIRMAR: URL da Vercel]
- **Stack obrigatória:** React 19, TypeScript 6, TanStack Router, TanStack Query, Axios, Socket.IO client, Tailwind CSS v4, shadcn/ui, MSW 2.12.7, Playwright, Lighthouse CI.

---

## Sumário

- [Sobre o projeto](#sobre-o-projeto)
- [Stack](#stack)
- [Demonstração](#demonstração)
- [Como rodar localmente](#como-rodar-localmente)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Credenciais fictícias](#credenciais-fictícias)
- [Cenários de mock (seleção e reset)](#cenários-de-mock-seleção-e-reset)
- [Reproduzindo fluxos de falha](#reproduzindo-fluxos-de-falha)
- [Scripts disponíveis](#scripts-disponíveis)
- [Arquitetura e decisões](#arquitetura-e-decisões)
- [Testes](#testes)
- [Performance e acessibilidade](#performance-e-acessibilidade)
- [Deploy](#deploy)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Limitações e desvios](#limitações-e-desvios)

---

## Sobre o projeto

Aplicação frontend de um marketplace de NFTs com três grandes jornadas:

- **Descoberta** — catálogo com busca, filtros combináveis, ordenação e paginação refletidos na URL.
- **Compra** — detalhe do NFT, carrinho com cupom e resumo, checkout com carteiras/rede, confirmação com recibo imutável e recuperação após falhas.
- **Conta** — cadastro, login, sessão recuperável, perfil, carteiras e favoritos.

Todo o backend é **simulado via MSW** (Mock Service Worker) na camada de rede, incluindo tempo real via **Socket.IO**. Não há dependência de serviços externos nem de backend real.

---

## Stack

| Camada              | Tecnologia                                            |
| ------------------- | ----------------------------------------------------- |
| UI                  | React 19 + TypeScript 6                               |
| Build               | Vite 8 (Rolldown)                                     |
| Rotas               | TanStack Router (file-based)                          |
| Estado remoto       | TanStack Query v5                                     |
| HTTP                | Axios                                                 |
| Tempo real          | Socket.IO client v4 + `@mswjs/socket.io-binding`      |
| Estilo              | Tailwind CSS v4 (`@theme` + design tokens)            |
| Componentes         | shadcn/ui (new-york, adaptado ao tema)                |
| Mocking             | MSW 2.12.7 (worker no browser + server nos testes)    |
| Validação           | zod + react-hook-form                                 |
| Notificações        | sonner                                                |
| Ícones              | lucide-react + react-icons                            |
| Fonte               | Roboto Mono (`@fontsource/roboto-mono`, subset latin) |
| Testes E2E / visual | Playwright (desktop 1440×900 + mobile 390×844)        |
| Auditoria           | Lighthouse CI (`@lhci/cli`)                           |
| Lint                | ESLint (flat config)                                  |
| Deploy              | Vercel                                                |

---

## Demonstração

- **App em produção:** [A CONFIRMAR: URL da Vercel]
- **Repositório:** <https://github.com/thiagosullivan/nft-marketplace-jg>

---

## Como rodar localmente

Pré-requisitos: **Node.js 24.x** (testado em v24.14.0) e **npm**.

````powershell
# instalar exatamente o lockfile
npm ci

# criar arquivo de variáveis locais
Copy-Item .env.example .env.local

# rodar em modo desenvolvimento (com mocks ativos)
npm run dev
A aplicação abre em http://localhost:5173. O MSW é registrado no primeiro carregamento.

Se o mock parecer "fantasma" (handler existe mas a request dá 404/500 intermitente), faça unregister do Service Worker:

DevTools → Application → Service Workers → Unregister → Ctrl+Shift+R.

Para build de produção local:

powershell
npm run build
npm run preview
Variáveis de ambiente
Crie um arquivo .env.local na raiz a partir do exemplo:

powershell
Copy-Item .env.example .env.local
Variável	Descrição	Valor padrão
VITE_ENABLE_MOCKS	Ativa o MSW no browser	true
VITE_API_BASE_URL	Base URL das chamadas Axios	/api
VITE_SOCKET_URL	URL do servidor Socket.IO (mock)	http://localhost:5173
O build publicado na Vercel usa VITE_ENABLE_MOCKS=true (configurado no painel da Vercel).

Credenciais fictícias
Todas as contas usam a senha password123. O login é por e-mail.

Nome	E-mail	Observações
Maria Souza	maria@nftmail.com	Carteiras MetaMask (Ethereum) + Ledger (Polygon); pedidos seed
Fernando Lima	fernando@nftmail.com	Carteira Phantom (Solana); pedido seed
Thaís Rocha	thais@nftmail.com	Carteira Coinbase Wallet (Ethereum); sem pedidos
O cadastro cria uma conta nova (conflito de e-mail/username retorna erro tratado pela UI).

OAuth (Google/Facebook): botões disabled com toast "Indisponível". Decisão de escopo: o enunciado não exige OAuth real, e a simulação não deve aparentar sucesso funcional.

text

---

## README.md — Bloco 2 (de "Cenários de mock" até o final)

```markdown
## Cenários de mock (seleção e reset)

O MSW mantém o estado em `localStorage` (`nftmarketplace:db`, `DB_VERSION = 10`). Qualquer mudança em `src/mocks/fixtures/*` ou no seed (`buildInitialDb`) **deve** subir o `DB_VERSION`; caso contrário, o `localStorage` antigo continua sendo usado.

### Selecionar cenário

No console do browser (com a app aberta):

```js
window.__msw.setScenario("default");      // 0–150 ms de latência
window.__msw.setScenario("slow");         // 2–4 s de latência
window.__msw.setScenario("timeout");      // 20 s (força timeout)
window.__msw.setScenario("offline");      // network error
window.__msw.setScenario("error-500");    // HTTP 500 em todas as requests
window.__msw.setScenario("error-400");    // HTTP 400 em todas as requests
window.__msw.setScenario("empty");        // catálogo retorna []
Consultar o cenário atual:

js
window.__msw.getScenario();
Resetar o estado
js
window.__msw.reset();   // restaura o seed original
Ou, via query param (recarrega a página):

text
http://localhost:5173/?reset=1
Ou, manualmente:

js
localStorage.removeItem("nftmarketplace:db");
location.reload();
Reproduzindo fluxos de falha
Falha de pagamento (settle declined)
Pedidos com totalEth > 20 são recusados na simulação (SETTLE_DELAY_MS = 3000). Para reproduzir:

Adicione ao carrinho um NFT com preço alto (ex.: nft-036, 12.30 ETH) em quantidade suficiente para o total passar de 20 ETH.

Finalize o checkout.

A confirmação mostra pending e, após ~3 s, transita para declined.

O carrinho preserva os itens (não remove nada em falha).

Clique repetido (idempotência)
No checkout, clique em "Confirmar compra" várias vezes em sequência.

O POST /api/orders usa idempotencyKey obrigatório. A mesma chave + mesmo conteúdo retorna o mesmo pedido (não duplica).

Conteúdo diferente com a mesma chave retorna IDEMPOTENCY_CONFLICT (409).

Timeout após criação do pedido
No console: window.__msw.setScenario("timeout").

Finalize o checkout. O POST /api/orders cria o pedido no mock, mas o cliente recebe timeout.

Recarregue a página (?reset=1 não — isso limpa o db; use F5 normal).

O pedido aparece em /profile/orders (Atividade) com o estado correto. A recuperação é por idempotência: o mesmo idempotencyKey retorna o pedido existente.

Alteração de preço/disponibilidade no checkout (Socket.IO)
Adicione um NFT ao carrinho e vá para o checkout.

Em outro terminal/console, dispare o evento:

powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:5173/api/dev/emit" `
  -ContentType "application/json" `
  -Body '{"event":"nft.updated","payload":{"nftId":"nft-001","editionId":"nft-001-ed-1","priceEth":"0.99"}}'
A UI informa a alteração e atualiza o resumo do carrinho.

O checkout impede a confirmação com a cotação antiga e exige nova confirmação.

Desconexão durante pedido pendente
Finalize um checkout (pedido pending).

No console: await fetch("/api/dev/disconnect-socket", { method: "POST" }).

A UI mostra desconexão (data-socket-connected="false" no <body>).

Recarregue. O SocketProvider reconecta e invalida nftKeys.all, cartKeys.all, orderKeys.all, quoteKeys.all; o GET /api/orders/:id reconcilia o estado. Não cria outro pedido.

Sessão expirada durante checkout
Faça login e vá ao checkout.

No console: localStorage.removeItem("nftmarketplace:token"); localStorage.removeItem("nftmarketplace:session");.

Qualquer request autenticada retorna 401 e dispara auth:unauthorized.

O AuthModalProvider abre o modal de login com redirect = pathname+search atual.

Após login, o fluxo retoma no checkout (o redirect é preservado).

Cupom inválido ou expirado
WELCOME10 (10%), NFT20 (20%), EXPIRED (15%, expirado).

Aplicar EXPIRED retorna erro tratado pela UI ("Cupom inválido ou expirado"). Remover o cupom restaura o subtotal.

Scripts disponíveis
Comando	Descrição
npm run dev	Dev server com mocks ativos
npm run build	Build de produção (tsc -b && vite build)
npm run preview	Preview do build em http://localhost:4173
npm run lint	ESLint (flat config)
npm run typecheck	Checagem de tipos (tsc -b --noEmit)
npm run test:e2e	Playwright: todos os projetos (desktop + mobile)
npm run test:e2e:ui	Playwright em modo UI
npm run test:e2e:report	Abre o relatório HTML do Playwright
npm run test:visual	Regressão visual (desktop)
npm run test:visual:update	Atualiza baselines visuais
npm run lighthouse	Lighthouse CI: mobile + desktop
npm run lighthouse:mobile	Lighthouse mobile (lighthouse.json)
npm run lighthouse:desktop	Lighthouse desktop (lighthouse.desktop.json)
Teste específico:

powershell
npx playwright test e2e/auth.spec.ts
npx playwright test e2e/auth.spec.ts --project=desktop
Trace de falha:

powershell
npx playwright show-trace test-results\<pasta>\trace.zip
Arquitetura e decisões
Decisões de arquitetura, contratos REST, eventos Socket.IO, política de sessão, cache e reconciliação estão documentados em ARCHITECTURE.md.

Resumo dos pontos principais:

Sessão por token opaco em localStorage; 401 global dispara auth:unauthorized e abre o modal de login com redirect.

Carrinho unifica visitante (guest-cart em localStorage) e logado; merge no login.

Cotação com staleTime: 30_000; effective = cupom válido ou base. CheckoutPage congela pendingQuote no clique em "Confirmar compra" e revalida contra o snapshot (não contra issuedAt).

Idempotência de pedido via idempotencyKey obrigatório. Mesma chave + mesmo conteúdo = mesmo pedido. Conteúdo diferente = 409.

Otimista com rollback em favoritos (useToggleFavorite).

Tempo real com SocketProvider aguardando window.__socketReady antes de conectar; reconecta em AUTH_CHANGED_EVENT; invalida nftKeys.all, cartKeys.all, orderKeys.all, quoteKeys.all em reconexão. Eventos com envelope { id, version, payload }; dedup por id + version.

Isolamento por usuário em favoritesByUser, carts[userId], wallets[].ownerId, dono da carteira do pedido.

MSW na camada de rede (worker no browser, server nos testes); cenários em src/mocks/scenario.ts; reset via ?reset=1 ou window.__msw.reset().

Testes
20 specs, 158 testes E2E rodando em dois projetos Playwright: desktop (1440×900) e mobile (390×844). Todos os fluxos principais rodam em Chromium nos dois viewports.

Cobertura por grupo do enunciado:

Grupo	Spec(s)
1. Busca, filtros, ordenação, paginação e histórico	header-search.spec.ts
2. Acesso direto ao detalhe e recurso inexistente	nft-detail.spec.ts, smoke.spec.ts
3. Cadastro, login, expiração, logout e troca de usuário	auth.spec.ts
4. Favoritos (otimista com rollback)	favorites.spec.ts (13 verdes + 1 skip intencional)
5. Carrinho (quantidades, remoção, cupom, persistência)	cart.spec.ts
6. Compra completa	checkout.spec.ts
7. Falha de pagamento, clique repetido, timeout e idempotência	checkout.spec.ts, idempotency.spec.ts
8. Perfil, avatar, senha e carteiras	profile.spec.ts, wallets.spec.ts
9. Alteração de preço/disponibilidade via Socket.IO no checkout	realtime-checkout.spec.ts
10. Eventos duplicados/antigos, desconexão e retomada de pendente	realtime-robustness.spec.ts, realtime-reconnect-order.spec.ts
11. Navegação por teclado, foco de diálogos e validação de forms	a11y.spec.ts
12. Skeletons, feedback de falha e retry	loading.spec.ts
Skip intencional: favorites.spec.ts tem 1 skip (cenário que depende de comportamento não determinístico do mock; documentado). Todos os outros testes passam.

Baselines visuais: npm run test:visual (desktop). Para atualizar: npm run test:visual:update. As baselines ficam em e2e/__screenshots__/.

Relatório HTML: npm run test:e2e:report abre o último relatório em playwright-report/. Traces ficam em test-results/ (não versionados).

Performance e acessibilidade
Auditoria com Lighthouse CI contra o build de produção (vite preview), 3 runs por URL, mediana por categoria. Configs versionadas: lighthouse.json (mobile) e lighthouse.desktop.json (desktop).

Relatórios HTML/JSON em lighthouse-reports/.

Metas e resultados
Categoria	Meta	Mobile (mediana)	Desktop (mediana)
Performance	≥ 0.90	0.72	[A CONFIRMAR]
Accessibility	≥ 0.95	1.00	[A CONFIRMAR]
Best Practices	≥ 0.95	1.00	[A CONFIRMAR]
SEO	≥ 0.90	1.00	[A CONFIRMAR]
Métrica	Mobile (mediana)	Desktop (mediana)	Meta
FCP	~2.8–3.0 s	[A CONFIRMAR]	—
LCP	~5.0 s	[A CONFIRMAR]	≤ 2.5 s
TBT	~110 ms	[A CONFIRMAR]	≤ 300 ms
CLS	0.018	[A CONFIRMAR]	≤ 0.1
Por que o LCP mobile fica ~5.0 s: o elemento LCP é a imagem do primeiro card do NFT (Emerald Ape #001, /nfts/prod-1-250.webp, 6 KB). Ela só existe no DOM depois que o msw-vendor (157 KB) + mocks (130 KB) + browser (24 KB) baixam e o Service Worker assume a página (requisito §6 do enunciado: "mocks na camada de rede"). O render delay do LCP é ~89% do tempo. Trocar o MSW por interceptor de Axios reduziria o LCP para ~1.5 s, mas violaria o §6 — decisão explícita de não fazer isso. A mitigação aplicada está descrita no §17.5 do ARCHITECTURE.md (card estático do nft-001 no index.html, substituído pelo React no mount).

Acessibilidade
Accessibility = 1.00 no Lighthouse mobile. Cobertura manual em a11y.spec.ts (teclado, focus trap em diálogos, labels/erros associados, sem overflow com zoom, contraste).

Deploy
Aplicação publicada na Vercel: [A CONFIRMAR: URL da Vercel].

A versão publicada corresponde ao código entregue, com mocks e tempo real ativos, e suporta acesso direto e refresh de todas as rotas. O vercel.json (se existir) configura rewrites SPA para /index.html em rotas não-API.

Variáveis de ambiente na Vercel: VITE_ENABLE_MOCKS=true (obrigatório para o build de demonstração).

Estrutura do projeto
text
src/
├── features/
│   ├── auth/                # login, register, modal, use-auth, auth-store
│   ├── cart/                # cart, quote, guest-cart
│   ├── catalog/             # home, nft-list, nft-card, filtros
│   ├── checkout/            # checkout, wallet modal
│   ├── favorites/           # otimista com rollback
│   ├── nft/                 # detalhe do NFT
│   ├── orders/              # confirmação, lista, recibo
│   ├── profile/             # perfil, avatar, senha
│   └── wallets/             # carteiras
├── shared/
│   ├── api/                 # Axios, erros, contratos, query keys
│   ├── components/          # UI (shadcn/ui + layout)
│   ├── lib/                 # env, cn, auth-store, format-eth
│   └── socket/              # socket-client, socket-context, socket-provider, use-socket-event
├── mocks/
│   ├── handlers/            # auth, nfts, cart, favorites, orders, profile, wallets, dev
│   ├── fixtures/            # users, nfts, wallets, coupons, orders
│   ├── browser.ts           # worker do browser
│   ├── server.ts            # server para testes
│   ├── db.ts                # estado em localStorage (DB_VERSION = 10)
│   ├── scenario.ts          # cenários configuráveis
│   ├── socket.ts            # binding Socket.IO
│   └── reset.ts             # reset via ?reset=1 + window.__msw
├── routes/                  # TanStack Router (file-based)
│   └── routeTree.gen.ts     # gerado pelo plugin (commitado)
└── main.tsx                 # bootstrap (QueryClient, Router, mocks)
e2e/                         # 20 specs Playwright (desktop + mobile)
public/
├── mockServiceWorker.js     # gerado pelo MSW (commitado)
├── robots.txt
├── nfts/                    # WebP em 3 tamanhos (full, -444, -250)
└── icons/
lighthouse-reports/          # HTML/JSON versionados
ARCHITECTURE.md
HANDOFF.md
lighthouse.json              # config mobile
lighthouse.desktop.json      # config desktop
playwright.config.ts
vite.config.ts
package.json
Limitações e desvios
LCP mobile ~5.0 s: estrutural para o §6 do enunciado (MSW na camada de rede). Mitigação descrita no §17.5 do ARCHITECTURE.md (card estático do nft-001 no index.html). Meta mobile de Performance ≥ 0.90 não é atingida sem trocar o MSW por interceptor de Axios, o que violaria o §6. Decisão documentada.

favorites.spec.ts — 1 skip: cenário de favorito otimista com rollback em condição de corrida específica do mock. Documentado no próprio spec.

OAuth Google/Facebook: botões disabled com toast "Indisponível". Decisão de escopo, não de performance.

Ícone do modal de confirmação: reservado <div aria-hidden className="size-12" /> com TODO. O Figma tem ícone próprio; substituição pendente.

Escala tipográfica: mapeamento parcial (Display/43 Bold, Caption1, Caption2, 12/16). Border radius e sombras aplicados com defaults provisórios até o mapeamento completo do Figma.

Links externos e ações auxiliares: sem ação funcional (ex.: "Aprenda", "Criadores"). Comportamento coerente: disabled ou toast "Indisponível", sem aparentar sucesso.

bf-cache: falha com "ServiceWorker was unregistered while a page was in back/forward cache" — consequência do MSW no boot. Não acionável sem remover o MSW.

Cenários de mock sem UI dedicada: seleção e reset são feitos via console (window.__msw) ou query param (?reset=1). Não há painel visual de dev.

Licença
Projeto de desafio técnico. Sem licença definida para uso comercial.

````
