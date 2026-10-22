# NFT Marketplace

> Marketplace de NFTs construído como desafio técnico frontend. React + TypeScript, com fluxos completos de descoberta, compra e conta (desktop e mobile), usando dados simulados na camada de rede.

<!-- TODO: substituir pelo link do screenshot principal da Home (desktop) -->

![Preview da Home](./docs/preview-home.png)

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

> Em construção — seções detalhadas serão adicionadas conforme o desenvolvimento avança.

---

## Stack

| Camada              | Tecnologia                                            |
| ------------------- | ----------------------------------------------------- |
| UI                  | React + TypeScript                                    |
| Build               | Vite                                                  |
| Rotas               | TanStack Router (file-based)                          |
| Estado remoto       | TanStack Query                                        |
| HTTP                | Axios                                                 |
| Tempo real          | Socket.IO client                                      |
| Estilo              | Tailwind CSS v4 (`@theme` + design tokens)            |
| Componentes         | shadcn/ui (new-york, adaptado ao tema)                |
| Mocking             | MSW v3 (+ `@mswjs/socket.io-binding`)                 |
| Validação           | zod + react-hook-form                                 |
| Notificações        | sonner                                                |
| Ícones              | lucide-react                                          |
| Fonte               | Roboto Mono (`@fontsource/roboto-mono`, subset latin) |
| Testes E2E / visual | Playwright (desktop 1440×900 + mobile 390×844)        |
| Auditoria           | Lighthouse                                            |
| Lint                | ESLint (flat config)                                  |
| Deploy              | Vercel                                                |

---

## Demonstração

- **App em produção:** <!-- TODO: substituir pela URL da Vercel -->
- **Repositório:** este repositório.

<!-- TODO: quando houver imagens finais, adicionar aqui um carrossel/grid com:
     - Home desktop
     - Home mobile
     - Detalhe do NFT
     - Carrinho
     - Pagamento
     - Confirmação
-->

> Em construção — screenshots e GIFs das jornadas serão adicionados ao final.

---

## Como rodar localmente

Pré-requisitos: **Node.js ≥ 20** (recomendado 22+; testado em v24) e **npm**.

```powershell
# instalar dependências
npm install

# criar arquivo de variáveis locais
Copy-Item .env.example .env.local

# rodar em modo desenvolvimento (com mocks ativos)
npm run dev
```

A aplicação abre em `http://localhost:5173`.

Para build de produção local:

```powershell
npm run build
npm run preview
```

---

## Variáveis de ambiente

Crie um arquivo `.env.local` na raiz a partir do exemplo:

```powershell
Copy-Item .env.example .env.local
```

| Variável            | Descrição                        | Valor padrão            |
| ------------------- | -------------------------------- | ----------------------- |
| `VITE_ENABLE_MOCKS` | Ativa o MSW no browser           | `true`                  |
| `VITE_API_BASE_URL` | Base URL das chamadas Axios      | `/api`                  |
| `VITE_SOCKET_URL`   | URL do servidor Socket.IO (mock) | `http://localhost:5173` |

> Em construção — pode haver ajustes conforme a integração com MSW e Socket.IO for finalizada.

---

## Credenciais fictícias

Usuários disponíveis nos mocks (serão detalhados na Fase 1):

| E-mail        | Senha         | Observação                    |
| ------------- | ------------- | ----------------------------- |
| <!-- TODO --> | <!-- TODO --> | Usuário com itens no carrinho |
| <!-- TODO --> | <!-- TODO --> | Usuário sem itens             |

> Em construção — preenchido ao final do Bloco 1.2 (fixtures).

---

## Cenários de mock (seleção e reset)

> Em construção — preenchido ao final dos Blocos 1.3 e 1.4. Aqui entrarão:
>
> - Como selecionar cenário (sucesso, vazio, latência, erro 4xx/5xx, timeout, sessão expirada, conflito, cupom inválido/expirado, preço alterado, edição esgotada, pagamento recusado).
> - Como resetar o estado dos mocks (botão em UI de dev e/ou query param e/ou script npm).

---

## Reproduzindo fluxos de falha

> Em construção — preenchido ao final da Fase 2. Aqui entrarão, passo a passo:
>
> - Como forçar falha de pagamento.
> - Como simular clique repetido e garantir que não duplica pedido.
> - Como simular timeout após criação e recuperar o mesmo pedido por idempotência.
> - Como forçar alteração de preço/disponibilidade durante o checkout (via socket).
> - Como simular sessão expirada durante checkout e retomar o contexto.

---

## Scripts disponíveis

| Comando                   | Descrição                                     |
| ------------------------- | --------------------------------------------- |
| `npm run dev`             | Dev server com mocks ativos                   |
| `npm run build`           | Build de produção (`tsc -b && vite build`)    |
| `npm run preview`         | Preview do build                              |
| `npm run lint`            | ESLint                                        |
| `npm run typecheck`       | Checagem de tipos (`tsc -b --noEmit`)         |
| `npm run test:e2e`        | Playwright (todos os projetos)                |
| `npm run test:e2e:ui`     | Playwright em modo UI                         |
| `npm run test:e2e:report` | Abre o relatório HTML do Playwright           |
| `npm run lighthouse`      | Auditoria Lighthouse (a configurar na Fase 6) |

---

## Arquitetura e decisões

Decisões de arquitetura, contratos REST, eventos Socket.IO, política de sessão, cache e reconciliação estão documentados em [`ARCHITECTURE.md`](./ARCHITECTURE.md).

> Em construção — ARCHITECTURE.md será criado ao longo das Fases 1–3.

---

## Testes

> Em construção — preenchido na Fase 5. Aqui entrarão:
>
> - Como rodar testes por viewport (desktop/mobile).
> - Como ver relatório HTML e traces.
> - Como atualizar baselines de regressão visual.
> - Escopo de cada suíte (fluxo coberto).

---

## Performance e acessibilidade

> Em construção — preenchido na Fase 6. Aqui entrarão:
>
> - Metas (Performance ≥ 90, A11y ≥ 95, Best Practices ≥ 95, SEO ≥ 90).
> - Medições (LCP, CLS, TBT) por página/perfil, com medianas.
> - Onde estão os relatórios HTML/JSON.
> - Justificativas de desvios.

---

## Deploy

Aplicação publicada na **Vercel**. <!-- TODO: URL final -->

A versão publicada corresponde ao código entregue, com mocks e tempo real ativos, e suporta acesso direto e refresh de todas as rotas.

---

## Estrutura do projeto

```text
src/
├── features/        # features por domínio
│   ├── account/     # profile
│   ├── auth/        # login, register
│   ├── cart/        # cart
│   ├── catalog/     # home
│   ├── checkout/    # checkout, order confirmation
│   ├── nft/         # nft detail
│   └── wallets/     # wallets
├── shared/          # reutilizáveis entre features
│   ├── api/         # cliente Axios, erros, contratos, query keys
│   ├── components/  # UI (shadcn/ui customizados + layout)
│   ├── hooks/
│   └── lib/         # utils (env, cn)
├── mocks/           # MSW (handlers, fixtures, cenários)
│   ├── handlers/
│   ├── browser.ts
│   ├── server.ts
│   └── index.ts
├── routes/          # TanStack Router (file-based)
│   └── routeTree.gen.ts  # gerado pelo plugin (commitado)
└── assets/
e2e/                 # testes Playwright
public/
├── mockServiceWorker.js
└── (assets estáticos)
```

> Em construção — refinado ao final da Fase 0.

---

## Limitações e desvios

> Em construção — preenchido ao final do projeto. Aqui entrarão:
>
> - Substituições de assets em relação ao Figma.
> - Ajustes de acessibilidade em relação ao Figma.
> - Escala tipográfica provisória até o mapeamento completo.
> - Border radius/sombras aplicados com defaults provisórios.
> - Qualquer comportamento fora do escopo (links externos sem ação funcional, etc.).

---

## Licença

Projeto de desafio técnico. Sem licença definida para uso comercial.
