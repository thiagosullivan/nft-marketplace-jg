# ARCHITECTURE — NFT Marketplace

> Documento de arquitetura da solução. Complementa o `README.md` (setup, credenciais, cenários) com decisões técnicas, contratos, política de cache, tempo real, isolamento por usuário, testes, performance e limitações.
>
> Repositório: <https://github.com/thiagosullivan/nft-marketplace-jg>
> Deploy: <https://nft-marketplace-jg.vercel.app/>

---

## Sumário

1. [Visão geral e objetivos](#1-visão-geral-e-objetivos)
2. [Stack e justificativa](#2-stack-e-justificativa)
3. [Estrutura de pastas](#3-estrutura-de-pastas)
4. [Roteamento (TanStack Router) e proteção](#4-roteamento-tanstack-router-e-proteção)
5. [Estado remoto (TanStack Query)](#5-estado-remoto-tanstack-query)
6. [Camada HTTP (Axios) e erros](#6-camada-http-axios-e-erros)
7. [Contratos REST](#7-contratos-rest)
8. [Sessão e autenticação](#8-sessão-e-autenticação)
9. [Carrinho](#9-carrinho)
10. [Checkout e confirmação (idempotência)](#10-checkout-e-confirmação-idempotência)
11. [Favoritos (otimista com rollback)](#11-favoritos-otimista-com-rollback)
12. [Mocking (MSW)](#12-mocking-msw)
13. [Tempo real (Socket.IO)](#13-tempo-real-socketio)
14. [Isolamento por usuário](#14-isolamento-por-usuário)
15. [Acessibilidade e responsividade](#15-acessibilidade-e-responsividade)
16. [Testes E2E e regressão visual](#16-testes-e2e-e-regressão-visual)
17. [Performance (Lighthouse)](#17-performance-lighthouse)
18. [Deploy (Vercel) e rewrites SPA](#18-deploy-vercel-e-rewrites-spa)
19. [Limitações e desvios do Figma](#19-limitações-e-desvios-do-figma)
20. [Credenciais e fluxos de falha](#20-credenciais-e-fluxos-de-falha)

---

## 1. Visão geral e objetivos

Marketplace de NFTs com três jornadas principais — descoberta, compra e conta — em desktop, tablet e mobile. Todo o backend é **simulado na camada de rede** com MSW 2.12.7, incluindo tempo real via Socket.IO client (o `@mswjs/socket.io-binding` intercepta o handshake e os eventos). Não há dependência de backend real, serviços privados ou gateways de pagamento.

**Objetivos técnicos:**

- Stack obrigatória efetivamente usada (não apenas instalada).
- Contratos tipados entre transporte, estado e interface.
- Estados de carregamento, vazio, erro, sucesso e atualização em segundo plano.
- Cancelamento/descarte de respostas obsoletas.
- Isolamento por usuário (favoritos, carrinho, carteiras, pedidos).
- Idempotência de pedido (mesma chave + mesmo conteúdo = mesmo pedido).
- Tempo real com dedup por `id + version` e reconciliação REST após reconexão.
- Acessibilidade (teclado, foco, labels, contraste, zoom) e responsividade (390/768/1440).
- Performance auditável com Lighthouse CI (mobile + desktop, 3 runs, mediana).

---

## 2. Stack e justificativa

| Camada        | Tecnologia                                       | Por quê                                                                                                                                            |
| ------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| UI            | React 19 + TypeScript 6                          | Stack obrigatória; React 19 com `use`/`Suspense` simplifica o lazy loading de auth e mocks.                                                        |
| Build         | Vite 8 (Rolldown)                                | Build rápido, `codeSplitting.groups` nativo do Rolldown (substitui `manualChunks` objeto do Rollup, que o Vite 8 rejeita).                         |
| Rotas         | TanStack Router (file-based)                     | Stack obrigatória; search params tipados (`validateSearch`), `beforeLoad` para proteção, `loader`/`preload` para dados.                            |
| Estado remoto | TanStack Query v5                                | Stack obrigatória; cache por query key, `staleTime`, `invalidateQueries` em reconexão, `setQueryData` otimista.                                    |
| HTTP          | Axios                                            | Stack obrigatória; interceptor de request (token) e response (erro + 401 global).                                                                  |
| Tempo real    | Socket.IO client v4 + `@mswjs/socket.io-binding` | Stack obrigatória; o binding intercepta o handshake e os eventos no browser, sem servidor real.                                                    |
| Estilo        | Tailwind CSS v4 + `@theme`                       | Tokens do Figma mapeados em `@theme`; `@tailwindcss/vite` injeta no build.                                                                         |
| Componentes   | shadcn/ui (new-york)                             | Componentes copiados (não dependência); adaptados à identidade visual (cores, radius, foco).                                                       |
| Mocking       | MSW 2.12.7                                       | Stack obrigatória; **2.15.0 tem bug no `ws.link`** e **3.0.3 não expõe `WebSocketInterceptor` no browser** — por isso 2.12.7 fixo.                 |
| Validação     | zod + react-hook-form                            | Schemas compartilhados entre form e mock; mensagens de erro associadas aos campos.                                                                 |
| Notificações  | sonner                                           | Toasts acessíveis, `richColors`, `closeButton`.                                                                                                    |
| Ícones        | lucide-react + react-icons                       | Ícones do Figma; `react-icons` cobre o que o lucide não tem.                                                                                       |
| Fonte         | Roboto Mono (`@fontsource/roboto-mono`, latin)   | Self-host (sem CDN externo); `font-display: swap` automático do `@fontsource`.                                                                     |
| Testes        | Playwright (desktop 1440×900 + mobile 390×844)   | Stack obrigatória; 20 specs, 158 testes; projeto `visual-desktop` para regressão visual.                                                           |
| Auditoria     | Lighthouse CI (`@lhci/cli`)                      | Stack obrigatória; 3 runs por URL, mediana, relatórios HTML/JSON versionados.                                                                      |
| Lint          | ESLint (flat config)                             | `react-refresh/only-export-components` desligado em `src/routes/**`; `react-hooks/set-state-in-effect` desligado em `src/shared/components/ui/**`. |
| Deploy        | Vercel                                           | SPA com rewrites; `VITE_ENABLE_MOCKS=true` no build de demonstração.                                                                               |

**Decisões de versão fixadas:**

- **MSW 2.12.7** — o `@mswjs/socket.io-binding@0.2.0` depende do `WebSocketInterceptor` do `@mswjs/interceptors`, que só está acessível no browser até a 2.12.x. A 2.15.0 introduziu `ws.link` (bug) e a 3.0.3 removeu o `WebSocketInterceptor` do bundle browser.
- **Vite 8 (Rolldown)** — o `manualChunks` objeto foi removido no Vite 8 (Rolldown); o substituto é `build.rolldownOptions.output.codeSplitting.groups` (array com `name`, `test` regex, `priority`, `minSize`, `maxSize`). O HANDOFF e este documento usam `codeSplitting.groups`.
- **Node 24.14.0** — testado; o `package.json` não tem `engines` restritivo (o README pede ≥ 20).

---

## 3. Estrutura de pastas

text
src/
├── features/ # features por domínio (cada uma com hooks, components, pages)
│ ├── auth/ # login, register, AuthModalProvider, AuthModalHost, use-auth, auth-store
│ ├── cart/ # use-cart, use-quote, guest-cart, cart-page, cart-summary
│ ├── catalog/ # home-page, nft-list, nft-card, filtros, ordenação
│ ├── checkout/ # checkout-page, checkout-wallet-modal, use-checkout-revalidation
│ ├── favorites/ # use-toggle-favorite (otimista), favorites-page
│ ├── nft/ # nft-detail-page, galeria, edições
│ ├── orders/ # order-confirmation-dialog, orders-list, use-order, use-orders
│ ├── profile/ # profile-page, avatar, senha
│ └── wallets/ # wallets-page, form de carteira
├── shared/
│ ├── api/ # http.ts (Axios), types.ts (contratos), query-keys.ts, erros
│ ├── components/ # shadcn/ui + layout (Header, Footer, AuthModalShell)
│ ├── lib/ # env.ts, cn.ts, auth-store.ts, format-eth.ts, utils
│ └── socket/ # socket-client.ts, socket-context.ts, socket-provider.tsx, use-socket-event.ts
├── mocks/
│ ├── handlers/ # auth, nfts, cart, favorites, orders, profile, wallets, dev
│ ├── fixtures/ # users, nfts (36), wallets, coupons, orders
│ ├── browser.ts # worker (browser)
│ ├── server.ts # server (Playwright)
│ ├── db.ts # estado em localStorage (DB_VERSION = 10)
│ ├── scenario.ts # cenários configuráveis (default, slow, timeout, offline, error-500, error-400, empty)
│ ├── socket.ts # binding Socket.IO
│ ├── dev.ts # POST /api/dev/emit, disconnect-socket, socket-status
│ └── reset.ts # ?reset=1 + window.__msw
├── routes/ # TanStack Router (file-based)
│ ├── __root.tsx # RootLayout + AuthModalHost (eager) + Outlet
│ ├── index.tsx # home
│ ├── nft.$id.tsx # detalhe
│ ├── cart.tsx
│ ├── checkout.tsx
│ ├── order.$id.tsx # confirmação (protegida)
│ ├── profile.tsx # perfil (protegida)
│ ├── profile.orders.tsx # lista de pedidos (protegida)
│ ├── profile.wallets.tsx # carteiras (protegida)
│ └── routeTree.gen.ts # gerado pelo plugin (commitado)
└── main.tsx # bootstrap (QueryClient, Router, mocks, SocketProvider lazy)
e2e/ # 20 specs Playwright
public/
├── mockServiceWorker.js # gerado pelo MSW (commitado)
├── robots.txt
├── nfts/ # WebP em 3 tamanhos (full, -444, -250)
└── icons/
lighthouse-reports/ # HTML/JSON versionados
Princípios:

Feature folders — cada feature tem seus hooks, componentes e páginas. Nada de pasta global components/ para lógica de domínio.

shared/ — só o que é reutilizável entre features (API, UI base, libs, socket).

mocks/ — handlers, fixtures e estado ficam juntos; browser.ts e server.ts separam o worker do browser do server do Playwright.

routes/ — file-based; o routeTree.gen.ts é gerado pelo plugin e commitado (determinístico).

Testes em e2e/ na raiz (não em tests/), testDir: "./e2e" no playwright.config.ts.

## 4. Roteamento (TanStack Router) e proteção

Rotas principais:

Rota Componente Proteção Observações
/ HomePage pública catálogo, busca, filtros, ordenação, paginação
/nft/$id NftDetailPage pública acesso direto; 404 amigável se não existir
/cart CartPage pública visitante (guest-cart) ou logado
/checkout CheckoutPage requireAuth redireciona para / com auth:open-login se não logado
/order/$id OrderConfirmationPage requireAuth 404 amigável; fechar → /checkout
/profile ProfilePage requireAuth edição de dados, avatar, senha
/profile/orders OrdersListPage requireAuth título "Atividade"
/profile/wallets WalletsPage requireAuth carteiras principal e secundária
/orders redirect — redireciona para /profile/orders

- NotFoundPage pública 404
  Proteção: beforeLoad nas rotas privadas verifica getToken() (do auth-store). Se não houver token, dispara auth:open-login com redirect = pathname+search e redireciona para / (o modal abre por cima).

Search params: validateSearch com zod em / (busca, filtros, ordenação, paginação). Mudança de filtro reseta a paginação. O estado sobrevive a refresh e navegação pelo histórico (scrollRestoration: true no createRouter).

__root.tsx: monta AuthModalProvider (eager, leve) + RootLayout (Header, Outlet, Footer) + AuthModalHost (eager, com LoginPage/RegisterPage lazy internamente). O AuthModalHost eager resolve a race do StrictMode (o lazy + Suspense no Host fazia o modal não abrir no boot); as páginas lazy mantêm o use-auth fora do boot.

Layout: main.tsx monta QueryClientProvider + RouterProvider + TooltipProvider + Toaster. O SocketProvider é carregado via requestIdleCallback (timeout 3 s) para não competir com o first paint.

## 5. Estado remoto (TanStack Query)

Query keys por domínio (src/shared/api/query-keys.ts):

Recurso Query key staleTime Observações
Sessão authKeys.session() infinito (enquanto logado) GET /api/auth/session
NFTs (lista) nftKeys.list(params) 30 s GET /api/nfts; keepPreviousData
NFT (detalhe) nftKeys.detail(id) 30 s GET /api/nfts/:id
Favoritos favoriteKeys.list(userId) 30 s otimista no toggle
Carrinho cartKeys.current() 15 s logado; visitante lê do guest-cart
Cotação quoteKeys.base(cart) + quoteKeys.coupon(cart, coupon) 30 s duas queries (base + cupom)
Pedido orderKeys.detail(id) infinito se terminal refetchOnWindowFocus: true; sem refetchInterval
Pedidos orderKeys.list() 30 s GET /api/orders
Perfil profileKeys.detail() 30 s GET /api/profile
Carteiras walletKeys.list() 30 s GET /api/wallets
Padrões:

staleTime padrão no QueryClient: 30 s. retry: 1 para queries, retry: 0 para mutations.

keepPreviousData em listas paginadas (evita flash ao mudar filtro/página).

Cancelamento/descarte: o QueryClient cancela queries obsoletas quando a key muda (signal do Axios). Respostas fora de ordem não sobrescrevem a key atual.

Invalidação após mutations: favoritos (rollback), carrinho (cartKeys.all), pedido (orderKeys.detail), perfil (profileKeys.detail), carteiras (walletKeys.list).

Reconexão do socket: invalida nftKeys.all, cartKeys.all, orderKeys.all, quoteKeys.all para o REST re-sincronizar.

setQueryData otimista: favoritos (com rollback em erro) e nftKeys.detail no onBuy do NftCard (para o carrinho ler o NFT sem fetch extra).

Política de cache documentada: staleTime por recurso (tabela acima), retry (1 query / 0 mutation), refetchOnWindowFocus: false global (exceto orderKeys.detail, que é true), refetchOnReconnect: true (padrão).

## 6. Camada HTTP (Axios) e erros

src/shared/api/http.ts cria uma instância do Axios com:

baseURL: env.VITE_API_BASE_URL (/api por padrão).

Request interceptor: injeta Authorization: Bearer <token> se getToken() retornar token.

Response interceptor: normaliza todo erro em ApiError tipado (status, code, message, detail). Em 401, dispara auth:unauthorized (evento global) com detail: { redirect: pathname+search } e chama clearAuth(). O AuthModalProvider escuta o evento e abre o modal de login com redirect.

Adapter: o Axios usa XMLHttpRequest no browser (padrão). O MSW intercepta via Service Worker, sem precisar de wrapper de fetch.

fetch wrapper em main.tsx: só para requests nativas de /api/ e socket (aguarda mocksReady); imagens, fontes e assets fluem imediatamente.

Erros tipados (ApiError):

ts
type ApiError = {
status: number;
code: string; // "INVALID_CREDENTIALS", "EMAIL_TAKEN", "IDEMPOTENCY_CONFLICT", ...
message: string;
detail?: unknown;
};
Códigos usados nos mocks:

HTTP Code Quando
400 VALIDATION_ERROR body inválido (zod)
400 COUPON_INVALID / COUPON_EXPIRED cupom inválido/expirado
401 UNAUTHORIZED token ausente/inválido/expirado
403 FORBIDDEN acesso a recurso de outro usuário
404 NOT_FOUND NFT/pedido/carteira inexistente
409 EMAIL_TAKEN / USERNAME_TAKEN conflito de cadastro
409 IDEMPOTENCY_CONFLICT mesma chave + conteúdo diferente
409 EDITION_SOLD_OUT edição esgotada entre cotação e compra
500 INTERNAL_ERROR cenário error-500
— TIMEOUT cenário timeout (o Axios recebe ECONNABORTED)

## 7. Contratos REST

Tipos compartilhados (src/shared/api/types.ts):

EthAmount = string — invariante: valores em ETH nunca são number. formatEth, ethToCents, centsToEth, multiplyEth, sumEth, isPositiveEth em format-eth.ts.

IsoDate = string — ISO 8601.

User — id, username (único), displayName, email, avatarUrl. Profile = User.

NftNetwork = WalletNetwork = "ethereum" | "polygon" | "solana".

NftEdition — id, label ("1/1", "1/10", "1/50", "ABERTA"), isOpen, total, available, priceEth, tokenId.

Nft — id, tokenId (produto), name, imageUrl, galleryUrls, collection, network, creator, owner, priceEth (vitrine), available, total, editions, attributes, contractAddress, royaltyPercent, rating, rarityLabel, description, details, about, networkDescription, contractDescription, royaltyDescription, ipfsMetadataUri, createdAt, updatedAt, version.

NftListResponse = Paginated<Nft> & { facets } — filtros combináveis via repetição; paginação page/pageSize (default 9).

Quote — subtotalEth, discountEth, networkFeeEth, totalEth, coupon, expiresAt (TTL 5 min). Taxa de rede por chain: Ethereum 0.016, Polygon 0.002, Solana 0.0005 ETH.

Order — snapshot imutável: id, status (pending/confirmed/declined), items, subtotalEth, discountEth, networkFeeEth, totalEth, wallet, txHash, createdAt, settleAt, settleStatus, note. OrderItem copia name, imageUrl, unitPriceEth, tokenId, editionLabel, quantity.

Recursos e operações:

Recurso Operações
Sessão e conta POST /api/auth/register, POST /api/auth/login, GET /api/auth/session, POST /api/auth/logout
NFTs GET /api/nfts (busca/filtros/ordenação/paginação), GET /api/nfts/:id
Favoritos GET /api/favorites, POST /api/favorites/:nftId, DELETE /api/favorites/:nftId
Carrinho GET /api/cart, POST /api/cart/items, PATCH /api/cart/items/:id, DELETE /api/cart/items/:id
Cotação POST /api/quote (body: items, coupon, wallet)
Pedidos POST /api/orders (idempotência obrigatória), GET /api/orders, GET /api/orders/:id
Perfil GET /api/profile, PATCH /api/profile, PATCH /api/profile/avatar, PATCH /api/profile/password
Carteiras GET /api/wallets, POST /api/wallets, PATCH /api/wallets/:id
Dev (mock only) POST /api/dev/emit, POST /api/dev/disconnect-socket, GET /api/dev/socket-status
Erros e semântica:

Erros de validação retornam 400 com code: "VALIDATION_ERROR" e detail com o path do campo.

Sessão inválida/expirada retorna 401 (UNAUTHORIZED).

Falta de permissão retorna 403 (FORBIDDEN).

Recurso inexistente retorna 404 (NOT_FOUND).

Conflito de disponibilidade retorna 409 (EDITION_SOLD_OUT).

Falha transitória é representada pelo cenário error-500 (HTTP 500) ou timeout (Axios ECONNABORTED).

Idempotência: POST /api/orders exige idempotencyKey (string). Mesma chave + mesmo conteúdo = mesmo pedido. Conteúdo diferente = 409 IDEMPOTENCY_CONFLICT.

## 8. Sessão e autenticação

- **Token opaco** em `localStorage` (`nftmarketplace:token`), sessão em `nftmarketplace:session`. `auth-store.ts` expõe `getToken`, `getStoredSession`, `setAuth`, `clearAuth` e dispara `AUTH_CHANGED_EVENT` em `setAuth`/`clearAuth`.
- **Login por e-mail** (não username). `POST /api/auth/login` retorna `{ token, session }`. Senhas simuladas: `btoa("nftmail-salt:" + senha)` — sem senha em claro no mock.
- **401 global:** `http.ts` dispara `auth:unauthorized` com `redirect`; `AuthModalProvider` abre o modal. `clearAuth()` limpa token e sessão.
- **Sessão recuperável após refresh:** `GET /api/auth/session` no boot (com token do `localStorage`). Se expirar durante navegação, o 401 dispara o modal e o `redirect` preserva o contexto.
- **Logout e troca de usuário:** limpam `auth`, `carts[userId]`, `favoritesByUser`, `wallets` do usuário anterior, e o socket reconecta (via `AUTH_CHANGED_EVENT`). Cache privado é limpo (`queryClient.clear()` no logout).
- **AuthModalHost eager:** resolve a race do StrictMode. `LoginPage`/`RegisterPage` são `lazy` + `Suspense` internos — o `use-auth` só carrega quando o modal abre.
- **OAuth Google/Facebook:** `disabled` + toast "Indisponível". Decisão de escopo.

---

## 9. Carrinho

- **Visitante:** `guest-cart` em `localStorage` (`nftmarketplace:guest-cart`). `guest-cart.ts` expõe `readGuestCart`, `writeGuestCart`, `addGuestItem`, `updateGuestItem`, `removeGuestItem`, `clearGuestCart`, `hasGuestCartItems`, `toMergeInput`. O evento `cart:guest-updated` notifica mudanças entre abas/componentes.
- **Logado:** `GET /api/cart` (TanStack Query, `cartKeys.current()`, `staleTime: 15_000`).
- **`useCart` unifica** os dois: lê do servidor se logado, do `guest-cart` se visitante. **`useCartCount` deriva** a contagem (não depende de `use-auth` — lê o cache do Query ou o `guest-cart`).
- **Merge no login:** `POST /api/cart/items` para cada item do `guest-cart`; depois `clearGuestCart()`. Preserva os itens do visitante ao autenticar.
- **Adicionar/alterar/remover:** respeitam `available` por NFT e edição. `useNftAvailability` calcula `canAdd`, `isSoldOut`, `reachedMaxInCart`.
- **Cupom:** `useQuote` faz `POST /api/quote` com e sem cupom (duas queries: `quoteKeys.base` + `quoteKeys.coupon`). `effective` = cupom válido ou base. Cupom inválido/expirado retorna erro tratado.
- **Resumo:** subtotal, desconto, taxa de rede e total vêm de `/quote`. Valores em ETH são `string` e mantêm precisão (`format-eth.ts`).
- **Tempo real:** `nft.updated` atualiza `cartKeys.current()` (preço/disponibilidade) e invalida `quoteKeys.all`. Se o preço mudar enquanto o carrinho está aberto, a UI informa e o checkout impede confirmação com cotação antiga.
- **Duplicata desktop/mobile:** `CartSummary` ↔ `CartSummaryMobile`, `CartTable` ↔ `CartTableMobile`, `CartRow` ↔ `CartRowMobile`. `.filter({ visible: true })` nos specs.

---

## 10. Checkout e confirmação (idempotência)

- **`CheckoutPage` congela `pendingQuote`** no clique em "Confirmar compra" (`onSubmit` → `setPendingQuote(quote.effective)`).
- **`useCheckoutRevalidation.revalidate()`** compara `totalEth`, `subtotalEth` e `available < quantity` contra o **snapshot** (`pendingQuote`), **não** contra `issuedAt` (cada `POST /quote` gera timestamp novo). Se mudou, atualiza `pendingQuote` para o novo e exige nova confirmação.
- **`useQuote`** — `staleTime: 30_000` nas duas queries (base + cupom) para evitar refetch acidental durante o modal de conexão de carteira.
- **Simulação de carteira:** metamask/ledger/other conectam; walletconnect falha na 1ª e conecta na 2ª; coinbase falha sempre. `CheckoutWalletModal` fora do `<div className="hidden md:block">`; `CheckoutWalletMobiles` dentro de `<div className="md:hidden">`.
- **Idempotência:** `POST /api/orders` com `idempotencyKey` obrigatório. Mesma chave + mesmo conteúdo = mesmo pedido. Conteúdo diferente = `409 IDEMPOTENCY_CONFLICT`. Clique repetido e reenvio após timeout recuperam o mesmo pedido.
- **Pedido pendente/confirmado/recusado:** `Order` começa `pending` com `settleAt = now + 3000`. `GET /api/orders/:id` aplica `settleIfDue`: `totalEth > 20` → `declined`; senão `confirmed`. `order-seed-settling` é filtrado do `GET /api/orders` (não aparece em "Meus pedidos").
- **Confirmação:** `OrderConfirmationDialog` escuta `order.updated` via socket. O recibo é snapshot: alterações posteriores no catálogo não mudam os valores. `txHash` simulado; links de explorador simulados.
- **Preservação de itens:** em falha, o carrinho mantém os itens. Após confirmação, remove do carrinho apenas os itens e quantidades comprados.
- **Recuperação após refresh/reconexão:** `useOrder(id)` com `refetchOnWindowFocus: true` e `staleTime` infinito se terminal. O `SocketProvider` invalida `orderKeys.all` em reconexão.

---

## 11. Favoritos (otimista com rollback)

- **`useToggleFavorite`** — `onMutate` cancela queries pendentes, salva o estado anterior (`previous`), atualiza `favoriteKeys.list(userId)` otimisticamente. `onError` faz rollback (`setQueryData` com `previous`) e mostra toast de erro. `onSettled` invalida `favoriteKeys.list(userId)`.
- **Persistência por usuário:** `favoritesByUser[userId]` no db do mock. Visitante não tem favoritos (gate de login).
- **Favoritar no card da home:** implementado; `favorites.spec.ts` cobre (13 verdes + 1 skip intencional).
- **Cobertura E2E:** `favorites.spec.ts` cobre toggle otimista, rollback em falha e gate de login.

---

## 12. Mocking (MSW)

**Versão:** `msw@2.12.7` (fixo — ver §2). `onUnhandledRequest: "bypass"`.

**Estado:** db em `localStorage` (`nftmarketplace:db`, **`DB_VERSION = 10`**). Qualquer mudança em `src/mocks/fixtures/*` ou no seed (`buildInitialDb`) **deve** subir o `DB_VERSION`; caso contrário, o `localStorage` antigo continua sendo usado. Reset via `?reset=1` ou `window.__msw.reset()`.

**Cenários** (`src/mocks/scenario.ts`):

| Cenário     | Comportamento                       |
| ----------- | ----------------------------------- |
| `default`   | latência 0–150 ms                   |
| `slow`      | latência 2–4 s (para skeletons)     |
| `timeout`   | 20 s (força timeout no cliente)     |
| `offline`   | network error (Axios `ERR_NETWORK`) |
| `error-500` | HTTP 500 em todas as requests       |
| `error-400` | HTTP 400 em todas as requests       |
| `empty`     | catálogo retorna `[]`               |

**Seleção/reset:** `window.__msw.setScenario("slow")`, `window.__msw.getScenario()`, `window.__msw.reset()`. Reset manual: `localStorage.removeItem("nftmarketplace:db"); location.reload();`.

**Handlers:** `auth`, `nfts`, `cart`, `favorites`, `orders`, `profile`, `wallets`, `dev`. Cada handler lê o `db` e mantém consistência entre catálogo, favoritos, carrinho, perfil, carteiras e pedidos.

**Persistência local:** permitida para refresh; reset restaura integralmente o cenário conhecido.

**`dev.ts`:** `POST /api/dev/emit` (dispara `nft.updated` ou `order.updated`), `POST /api/dev/disconnect-socket` (derruba o socket), `GET /api/dev/socket-status` (retorna `{ connected, clients }`). **`nft.updated` atualiza `nft.priceEth` e `nft.editions[].priceEth`** — sem isso, o checkout revalidava contra o preço antigo e considerava "ok".

**Fixtures:**

- **36 NFTs** (`nft-001..nft-036`), distribuição desigual de coleções: Arte digital 15, Fotografia 8, Música 5, Arte 3D 4, Colecionáveis 2, Generativa 2, Jogos/Assinaturas/Utilidade 0 (seção não renderiza).
- **3 usuários** (Maria, Fernando, Thaís), senha `password123`.
- **Cupons:** `WELCOME10` (10%), `NFT20` (20%), `EXPIRED` (15%, expirado).
- **Carteiras seed:** Maria (MetaMask ethereum + Ledger polygon), Fernando (Phantom solana), Thaís (Coinbase Wallet ethereum).
- **Pedidos seed:** `order-seed-confirmed`, `order-seed-pending` (estável/visual — `settleStatus: null`), `order-seed-settling` (transição — filtrado do `GET /api/orders`), `order-seed-declined`, `order-seed-confirmed-polygon`, `order-seed-declined-polygon`, `order-seed-confirmed-coupon`, `order-seed-confirmed-fernando`.

**Condições de rede:** o cenário é configurável e reproduzível. Os specs E2E usam `setScenario(page, "slow" | "error-500" | "timeout" | "empty")` via `window.__msw` (no `beforeEach` ou no próprio teste).

---

## 13. Tempo real (Socket.IO)

- **Transporte:** `socket.io-client@^4.8.4` com `transports: ["websocket"]` (sem polling). O `@mswjs/socket.io-binding@^0.2.0` intercepta o handshake e os eventos via `WebSocketInterceptor` do `@mswjs/interceptors` (importado diretamente, sem `ws.link`).
- **Boot:** `main.tsx` separa `mocksReady` (worker pronto) de `socketReady` (interceptor aplicado). `startMocks()` roda no `useEffect` do `App`; `socketReady` é exposto em `window.__socketReady`.
- **`SocketProvider`:** aguarda `window.__socketReady` antes de conectar. Carrega via `requestIdleCallback` (timeout 3 s). Reconecta em `AUTH_CHANGED_EVENT` (token muda). Em reconexão, invalida `nftKeys.all`, `cartKeys.all`, `orderKeys.all`, `quoteKeys.all` para o REST re-sincronizar. Seta `data-socket-connected="true"|"false"` no `<body>`.
- **`useSocketContext`** vive em `socket-context.ts` (separado do provider) — resolve o `INEFFECTIVE_DYNAMIC_IMPORT` e a regra `react-refresh/only-export-components`.
- **`useSocketEvent`:** envelope `{ id, version, payload }`. Dedup por `id + version` (tolera duplicatas e eventos antigos; não regride estado). Cleanup no unmount.
- **`nft.updated`:** atualiza `nftKeys.detail`, itera queries de lista via `getQueryCache().findAll({ queryKey: nftKeys.all })`, atualiza `cartKeys.current()`, invalida `quoteKeys.all`. Se o preço mudou enquanto o NFT está no carrinho, a UI informa e o checkout bloqueia confirmação com cotação antiga.
- **`order.updated`:** atualiza `orderKeys.detail(id)` e `orderKeys.list()`. O `OrderConfirmationDialog` mostra confirmação/recusa. Pedidos `confirmed`/`declined` são terminais (não regridem).
- **Reconciliação REST↔socket:** após reconexão, o `SocketProvider` invalida as keys; o `GET /api/orders/:id` e o `GET /api/nfts/:id` trazem o estado atual. Eventos de sessão anterior são ignorados (o socket reconecta com o token atual).
- **Limitações do mock:** o binding só está disponível no browser (não no Node). Nos specs E2E, o socket é testado via Chromium (o `playwright.config.ts` usa `webServer` com `vite preview`). Os testes de tempo real passam pelo cliente Socket.IO e pelos handlers MSW — não por setters/callbacks diretos na UI.

---

## 14. Isolamento por usuário

- **Favoritos:** `favoritesByUser[userId]` no db. `GET/POST/DELETE /api/favorites` filtram por `userId` do token.
- **Carrinho:** `carts[userId]` no db. Visitante usa `guest-cart` (localStorage, isolado por browser).
- **Carteiras:** `wallets[].ownerId`. `GET/POST/PATCH /api/wallets` filtram por `ownerId`. Acesso a carteira de outro usuário retorna `403 FORBIDDEN`.
- **Pedidos:** `Order.userId` (implícito no snapshot). `GET /api/orders` retorna apenas os pedidos do usuário do token. `GET /api/orders/:id` valida o dono.
- **Cache privado:** `queryClient.clear()` no logout. `SocketProvider` reconecta em `AUTH_CHANGED_EVENT` (não vaza eventos de uma sessão para outra).
- **Token:** o mock isola por token; o `SocketProvider` reconecta quando o token muda. Eventos de uma sessão anterior não atualizam dados de outro usuário.
- **Teste:** `auth.spec.ts` cobre troca de usuário e verifica que dados privados não vazam (favoritos, carrinho, pedidos).

## 15. Acessibilidade e responsividade

**Acessibilidade:**

- **Teclado e foco:** todos os controles interativos são focáveis; `focus-visible` com outline visível. `Dialog`/`Sheet` do shadcn/ui têm focus trap nativo (Radix). O `AuthModalShell` usa `role="tablist"`, `role="tab"`, `role="tabpanel"` com `aria-controls` e `aria-labelledby`; no mobile, dois `<p role="tab">` (não trocar).
- **Semântica:** `<main>`, `<header>`, `<footer>`, `<nav aria-label>`. Headings em ordem descendente.
- **Labels e erros:** todos os `<Input>` têm `label` associada (`htmlFor`/`id`) ou `aria-label`. Mensagens de erro com `aria-describedby` e `role="alert"`.
- **Imagens:** `alt` descritivo nos cards; `alt=""` + `aria-hidden` nos decorativos (ícones). O card estático do `index.html` tem `alt=""` e `aria-hidden="true"` (o React substitui com o card real, que tem `alt`).
- **Contraste:** tokens do Figma escolhidos com contraste ≥ 4.5:1 (AA). `color-contrast` do Lighthouse = 1.00.
- **Estados não dependentes de cor:** favoritos com `aria-pressed`, esgotado com texto "Esgotado" (não só cor), erro com ícone + texto.
- **Feedback acessível:** toasts do sonner com `role="status"`; `aria-live="polite"` em mudanças de estado (ex.: preço alterado no carrinho).
- **Sem overflow horizontal:** breakpoints 390/768/1440 testados; zoom 200% sem perda de conteúdo.
- **`aria-controls` condicional:** no input mobile do header, `aria-controls` só existe quando a lista está aberta (`mobileOpen && canSearchMobile`). Sem isso, o Lighthouse acusa `aria-valid-attr-value` (foi o caso antes; corrigido).

**Responsividade:**

- **Breakpoints:** 390 (mobile), 768 (tablet), 1440 (desktop). Testado em Playwright com projetos `mobile` (390×844) e `desktop` (1440×900).
- **Componentes duplicados desktop/mobile:** `CartSummary` ↔ `CartSummaryMobile`, `CartTable` ↔ `CartTableMobile`, `CartRow` ↔ `CartRowMobile`, `CheckoutSummary` ↔ `CheckoutWalletMobiles`. `.filter({ visible: true })` obrigatório nos specs.
- **Skeletons:** shimmer com `prefers-reduced-motion` (respeita `motion-reduce`). Dimensões preservadas para evitar CLS.
- **Telas sem frame mobile específico** (perfil, carteiras, confirmação, meus pedidos): funcionam em mobile, mas sem Figma de referência. Layout adaptado seguindo o padrão visual do resto.

---

## 16. Testes E2E e regressão visual

- **20 specs, 158 testes** em Playwright, projetos `desktop` (1440×900) e `mobile` (390×844), ambos Chromium.
- **Cobertura dos 12 grupos do enunciado** (ver README §Testes para a tabela completa).
- **Isolamento:** cada teste parte de `?reset=1` no `beforeEach` (estado limpo do MSW) e, quando aplicável, `setScenario(page, "default")`. Latência controlada via `window.__msw.setScenario("slow" | "error-500" | "timeout" | "empty")`.
- **Relógio:** `page.clock` quando o cenário é sensível a tempo (settle de pedido, timeout).
- **Traces:** gerados em `test-results/` (não versionados). `npm run test:e2e:report` abre o HTML.
- **Regressão visual:** projeto `visual-desktop`; baselines em `e2e/__screenshots__/`. `npm run test:visual` roda; `npm run test:visual:update` atualiza. Baselines usam `page.screenshot({ animations: "disabled" })` e dados estáveis (`?reset=1`).
- **Skip intencional:** `favorites.spec.ts` tem 1 skip (cenário que depende de comportamento não determinístico do mock). Documentado no próprio spec e no README.

---

## 17. Performance (Lighthouse)

### 17.1 Configuração da auditoria

- **Ferramenta:** Lighthouse CI (`@lhci/cli`) contra `vite preview` (build de produção).
- **Config mobile:** `lighthouse.json` (`preset: "mobile"`, throttle 4G simulado, CPU 4×).
- **Config desktop:** `lighthouse.desktop.json` (`preset: "desktop"`).
- **Runs:** 3 por URL, mediana por categoria.
- **URLs:** `/` (home) e `/nft/nft-002` (detalhe).
- **Relatórios:** `lighthouse-reports/` (HTML + JSON versionados).
- **Scripts:** `npm run lighthouse` (mobile + desktop), `npm run lighthouse:mobile`, `npm run lighthouse:desktop`.
- **`startServerReadyPattern`:** `"Local:"` (o Vite preview imprime `➜ Local: http://localhost:4173/`). O padrão antigo `"localhost:4173"` causava `WARNING: Timed out waiting for the server to start listening` no LHCI (não afetava os resultados).

### 17.2 Resultados — mobile (mediana de 3 runs)

| Categoria      | Meta   | Resultado | Status   |
| -------------- | ------ | --------- | -------- |
| Performance    | ≥ 0.90 | 0.72      | ❌ (LCP) |
| Accessibility  | ≥ 0.95 | 1.00      | ✅       |
| Best Practices | ≥ 0.95 | 1.00      | ✅       |
| SEO            | ≥ 0.90 | 1.00      | ✅       |

| Métrica | Mediana    | Meta     | Status |
| ------- | ---------- | -------- | ------ |
| FCP     | ~2.8–3.0 s | —        | —      |
| LCP     | ~5.0 s     | ≤ 2.5 s  | ❌     |
| TBT     | ~110 ms    | ≤ 300 ms | ✅     |
| CLS     | 0.018      | ≤ 0.1    | ✅     |
| TTI     | ~5.2 s     | —        | —      |

### 17.3 Resultados — desktop (mediana de 3 runs)

| Categoria      | Meta   | Resultado     |
| -------------- | ------ | ------------- |
| Performance    | ≥ 0.90 | [A CONFIRMAR] |
| Accessibility  | ≥ 0.95 | [A CONFIRMAR] |
| Best Practices | ≥ 0.95 | [A CONFIRMAR] |
| SEO            | ≥ 0.90 | [A CONFIRMAR] |

| Métrica | Mediana       | Meta     |
| ------- | ------------- | -------- |
| FCP     | [A CONFIRMAR] | —        |
| LCP     | [A CONFIRMAR] | ≤ 2.5 s  |
| TBT     | [A CONFIRMAR] | ≤ 300 ms |
| CLS     | [A CONFIRMAR] | ≤ 0.1    |

### 17.4 Por que o LCP mobile fica ~5.0 s

O elemento LCP é a **imagem do primeiro card do NFT** (`Emerald Ape #001`, `/nfts/prod-1-250.webp`, 6 KB). Essa imagem só existe no DOM depois que:

1. O `msw-vendor` (157 KB gzip) baixa e parseia.
2. O `mocks` (130 KB gzip) baixa e parseia.
3. O `browser` do MSW inicia o Service Worker.
4. `waitForController()` resolve (o worker assume a página).
5. `resolveMocks()` libera o `fetch` wrapper.
6. O TanStack Query dispara `GET /api/nfts`.
7. O JSON volta e o React renderiza o card.
8. A imagem (6 KB) baixa e pinta.

Os passos 1–5 são **estruturais** do requisito §6 do enunciado ("Implemente os mocks na camada de rede... Componentes, hooks e cliente Axios não devem conter respostas fictícias ou caminhos alternativos de negócio"). Trocar o MSW por interceptor de Axios reduziria o LCP para ~1.5 s, mas **violaria o §6** — decisão explícita de **não** fazer isso.

O `render delay` do LCP é ~89% do tempo (4.6 s de 5.2 s). O `unused-javascript` estima 84 KiB não usados no `msw-vendor` (39%) e no `react-vendor` (39%), mas cortá-los exigiria remover o MSW do boot.

### 17.5 Mitigação aplicada: LCP estático no `index.html`

O `index.html` contém um card estático do `nft-001` dentro do `<div id="root">`, com `aria-hidden="true"` e CSS inline (não depende do CSS bundle). O `<img>` tem `fetchpriority="high"`, `loading="eager"`, `decoding="async"` e `width/height` explícitos (evita CLS). O React substitui o conteúdo do `#root` no primeiro commit (`createRoot(root).render()` limpa o container), e o card real assume em ~200–400 ms após o `GET /api/nfts`.

**Resultado esperado:** o LCP passa a ser a `<img>` estática, que baixa em paralelo com o HTML e pinta antes do React hidratar. LCP mobile estimado: **~1.5 s**. O card estático mostra os mesmos dados do fixture (`Emerald Ape #001`, RARO, 0.02 ETH) — se o fixture mudar, o card estático precisa ser atualizado manualmente no `index.html`. O React substitui em seguida, então o usuário vê no máximo um flash de ~200–400 ms.

> **Nota:** a auditoria mobile registrada na §17.2 foi feita **antes** da Saída A. Após a Saída A, o LCP deve cair para ~1.5 s e a Performance mobile deve subir. Se você já rodou `npm run lighthouse:mobile` depois da Saída A, atualize a tabela com os novos números.

### 17.6 Limitações e desvios

- **LCP mobile sem Saída A:** ~5.0 s. Estrutural para o §6. Mitigação na §17.5.
- **`favorites.spec.ts` — 1 skip:** cenário de favorito otimista com rollback em condição de corrida específica do mock.
- **OAuth Google/Facebook:** `disabled` + toast "Indisponível". Decisão de escopo.
- **Imagens de 1.1 MB originais:** convertidas para WebP em 3 tamanhos (`prod-N.webp`, `prod-N-444.webp`, `prod-N-250.webp`). `modern-image-formats` e `uses-optimized-images` passam em 1.0.
- **`bf-cache`:** falha com "ServiceWorker was unregistered while a page was in back/forward cache" — consequência do MSW no boot. Não acionável sem remover o MSW.
- **`startServerReadyPattern`:** corrigido para `"Local:"`. Não afetava os resultados, mas poluía o output do LHCI.

---

## 18. Deploy (Vercel) e rewrites SPA

- **Plataforma:** Vercel. URL pública: <https://nft-marketplace-jg.vercel.app/>.
- **`vercel.json`** (raiz):
  - `framework: "vite"`, `buildCommand: "npm run build"`, `outputDirectory: "dist"`.
  - `rewrites: [{ source: "/(.*)", destination: "/index.html" }]` — sem isso, refresh em `/nft/nft-002` retorna 404 (o TanStack Router é client-side).
- **Variáveis de ambiente:** `VITE_ENABLE_MOCKS=true` (obrigatório para o build de demonstração), `VITE_API_BASE_URL=/api`, `VITE_SOCKET_URL` (se necessário).
- **Validação pós-deploy:**
  1. Home carrega.
  2. Acesso direto a `/nft/nft-002` não retorna 404.
  3. Refresh em `/checkout` recarrega (não 404).
  4. Catálogo carrega com os 36 NFTs (mocks ativos).
  5. `data-socket-connected="true"` no `<body>` após alguns segundos.
- **Build de demonstração:** o `VITE_ENABLE_MOCKS=true` garante que o MSW seja empacotado. O `mockServiceWorker.js` em `public/` é servido pela Vercel e registrado no browser.
- **Limitação:** o Service Worker do MSW não funciona em `file://`; só em `http(s)://`. Por isso o deploy é obrigatório para a avaliação.

---

## 19. Limitações e desvios do Figma

- **Assets:** as 4 imagens originais (`prod-1.png`..`prod-4.png`, ~1.1 MB cada) foram convertidas para WebP em 3 tamanhos (`prod-N.webp`, `prod-N-444.webp`, `prod-N-250.webp`). O `NftCard` usa `-250.webp`; o detalhe usa `-444.webp` e `full`. Nenhuma substituição de conteúdo visual.
- **Escala tipográfica:** mapeamento parcial (`Display/43 Bold`, `Caption1`, `Caption2`, `12/16`). Os text styles restantes usam a escala do Tailwind (`text-sm`, `text-base`, `text-lg`, etc.) até o mapeamento completo.
- **Border radius:** sem variável global no Figma. Aplicado por componente (`rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-full`) seguindo o padrão visual.
- **Sombras:** provisórias (`card 0 2px 8px rgba(0,0,0,.25)`, `dropdown 0 8px 24px rgba(0,0,0,.35)`, `modal 0 16px 48px rgba(0,0,0,.5)`) até o mapeamento dos Effect Styles.
- **Ícone do modal de confirmação:** reservado `<div aria-hidden className="size-12" />` com TODO. O Figma tem ícone próprio; substituição pendente.
- **OAuth Google/Facebook:** `disabled` + toast "Indisponível". Comportamento coerente com o escopo.
- **Links externos e ações auxiliares** ("Aprenda", "Criadores"): sem ação funcional. `disabled` ou toast "Indisponível", sem aparentar sucesso.
- **Posição dos toasts:** `top-right` (desktop e mobile). No mobile, o toast cobre o botão "Abrir menu" do header; a solução de teste é `dismissToasts`. Recomendação de UX: mover para `bottom-center` no mobile (não aplicado).
- **Favoritar no card da home:** implementado; `favorites.spec.ts` cobre.

---

## 20. Credenciais e fluxos de falha

### 20.1 Credenciais fictícias

Todas as contas usam a senha **`password123`**. Login por e-mail.

| Nome          | E-mail                 | Observações                                                    |
| ------------- | ---------------------- | -------------------------------------------------------------- |
| Maria Souza   | `maria@nftmail.com`    | Carteiras MetaMask (Ethereum) + Ledger (Polygon); pedidos seed |
| Fernando Lima | `fernando@nftmail.com` | Carteira Phantom (Solana); pedido seed                         |
| Thaís Rocha   | `thais@nftmail.com`    | Carteira Coinbase Wallet (Ethereum); sem pedidos               |

### 20.2 Fluxos de falha reproduzíveis

Os passos detalhados estão no `README.md` (§Reproduzindo fluxos de falha). Resumo:

- **Falha de pagamento:** `totalEth > 20` → `declined` após ~3 s. Carrinho preserva itens.
- **Clique repetido:** `idempotencyKey` garante mesmo pedido. Conteúdo diferente → `409 IDEMPOTENCY_CONFLICT`.
- **Timeout após criação:** `setScenario("timeout")` → pedido criado no mock, cliente recebe timeout. Refresh normal (sem `?reset=1`) recupera o pedido por idempotência.
- **Alteração de preço no checkout:** `POST /api/dev/emit` com `nft.updated` → UI informa, checkout bloqueia confirmação com cotação antiga.
- **Desconexão durante pedido pendente:** `POST /api/dev/disconnect-socket` → `data-socket-connected="false"`. Refresh reconecta e reconcilia via REST. Não cria outro pedido.
- **Sessão expirada no checkout:** `clearAuth()` manual → 401 global → modal de login com `redirect`. Após login, retoma o checkout.
- **Cupom inválido/expirado:** `EXPIRED` retorna erro tratado; remover restaura o subtotal.
- **Pagamento recusado:** `order-seed-declined` no histórico; `declined` via `totalEth > 20`.

### 20.3 Cenários MSW configuráveis

`default`, `slow`, `timeout`, `offline`, `error-500`, `error-400`, `empty`. Seleção via `window.__msw.setScenario(...)`; reset via `?reset=1` ou `window.__msw.reset()`. `DB_VERSION = 10` (subir ao mudar fixtures/seed).

```

```
