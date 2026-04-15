# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Il Mio Negozio** — Ecommerce di abbigliamento senza gestione pagamenti. Gli utenti sfogliano il catalogo, aggiungono prodotti al carrello e inviano un ordine. L'ordine viene salvato su Supabase e notificato istantaneamente via Telegram al proprietario. Include un'area admin protetta per gestire prodotti e ordini.

## Tech Stack

- **Framework**: Next.js 15 (App Router), TypeScript
- **Styling**: Tailwind CSS v4, Lucide React
- **Database / Auth / Storage**: Supabase (PostgreSQL + Supabase Auth + Supabase Storage)
- **State**: Zustand (carrello + lingua persistiti in localStorage, UI state)
- **Data Fetching**: React Query (`useInfiniteQuery` per catalogo, Server Components per admin)
- **Notifiche**: Telegram Bot API
- **i18n**: Sistema custom con traduzioni statiche (Rumeno `ro` + Russo `ru`)

## Commands

```bash
npm run dev          # Dev server (http://localhost:3000)
npm run build        # Build produzione
npm run start        # Avvia build produzione
npm run lint         # ESLint
```

## Setup iniziale

1. Copia `.env.local.example` → `.env.local` e inserisci le credenziali
2. Esegui `supabase/migrations/001_initial_schema.sql` nella SQL Editor di Supabase
3. Crea il bucket `product-images` su Supabase Storage (visibilità: **pubblico**)
4. Crea l'utente admin via Supabase Auth → Authentication → Users

## Struttura del progetto

```
src/
├── app/
│   ├── (store)/               # Layout pubblico (Navbar + CartDrawer + footer)
│   │   ├── page.tsx            # Homepage: hero + CatalogClient
│   │   ├── products/[slug]/    # Pagina dettaglio prodotto (Server Component)
│   │   └── checkout/           # Checkout form + riepilogo ordine
│   ├── admin/                  # Area admin protetta dal middleware
│   │   ├── layout.tsx          # AdminSidebar + main
│   │   ├── page.tsx            # Dashboard con statistiche
│   │   ├── products/           # Lista, /new, /[id]/edit
│   │   └── orders/             # Lista ordini con espansione dettagli
│   ├── api/orders/route.ts     # POST: salva ordine + notifica Telegram
│   └── layout.tsx              # Root layout con <Providers>
├── components/
│   ├── store/                  # Navbar, CartDrawer, ProductCard, ProductDetail
│   │                           # CatalogClient (infinite scroll), CheckoutClient
│   └── admin/                  # AdminSidebar, AdminLoginForm, ProductForm
│                               # ProductsTable, OrdersTable
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # createBrowserClient → per componenti client
│   │   ├── server.ts           # createServerClient (cookies) → per Server Components
│   │   └── storage.ts          # uploadProductImage(), deleteProductImage()
│   ├── i18n/
│   │   ├── translations.ts     # Dizionario completo ro/ru + genderMap (Uomo/Donna/Unisex → display)
│   │   └── useT.ts             # Hook: useT() → { t, lang, tGender }
│   ├── telegram.ts             # sendOrderNotification(order)
│   ├── providers.tsx           # QueryClientProvider wrapper ('use client')
│   └── queries/products.ts     # fetchProducts(), fetchCategories(), fetchProductBySlug()
├── store/
│   ├── cart.ts                 # Zustand: addItem, removeItem, updateQuantity, clearCart
│   ├── ui.ts                   # Zustand: isCartOpen, openCart, closeCart
│   └── language.ts             # Zustand: lang ('ro'|'ru'), persistito in localStorage
├── components/
│   ├── store/                  # (come sopra)
│   ├── admin/                  # (come sopra)
│   ├── T.tsx                   # Componente inline per testi tradotti (wrappa useT)
│   └── LanguageSwitcher.tsx    # Bottone RO/RU nella Navbar
├── types/index.ts              # Tutti i tipi condivisi (Product, Order, CartItem, ecc.)
└── middleware.ts               # Protegge /admin/* → redirect a /admin/login se non autenticato
```

## Architettura chiave

### Dual Supabase clients (obbligatorio)
- `lib/supabase/client.ts` → `createBrowserClient`: usato in componenti `'use client'` e hook React Query
- `lib/supabase/server.ts` → `createServerClient` con cookie: usato in Server Components, Route Handlers, middleware
- `createAdminClient()` in `server.ts`: usa `SUPABASE_SERVICE_ROLE_KEY` per bypass RLS (solo operazioni admin server-side)

### Carrello
Stato **solo locale**: Zustand + `persist` middleware → localStorage (chiave: `il-mio-negozio-cart`). Nessuna tabella cart nel DB. Al checkout, i dati vengono serializzati e inviati a `POST /api/orders`.

### Chiave univoca item carrello
`${product.id}__${size ?? 'none'}__${color ?? 'none'}` — permette lo stesso prodotto con taglia/colore diversi come righe separate.

### Flusso ordine
1. `CheckoutClient` → `POST /api/orders` con `{ ...formData, items }`
2. Route handler: insert in `orders` → insert in `order_items` → `sendOrderNotification()`
3. `sendOrderNotification()` fa `fetch` a Telegram Bot API con messaggio formattato in Markdown

### Upload immagini prodotto
`ProductForm` invia ogni file a `POST /api/upload` (Route Handler autenticato). Il route handler usa `createAdminClient()` per bypassare RLS e carica su `product-images/<productId|tmp>/<timestamp>.<ext>`. Il prodotto ha una **galleria** (`images: string[]`); `image_url` è derivato automaticamente come `images[0]` (cover). Max 5 immagini, 5 MB/cad, formati JPG/PNG/WEBP/GIF.

### Slug prodotto
Generato automaticamente dal nome in `ProductForm`: lowercase, rimozione accenti, caratteri non alfanumerici → `-`.

### Paginazione catalogo
`fetchProducts()` usa `.range(from, to)` di Supabase. `CatalogClient` usa `useInfiniteQuery` con `initialPageParam: 1`, 24 prodotti per pagina.

## Database schema

Tabelle: `categories`, `products` (con `sizes: text[]`, `colors: text[]`, `images: text[]`, `image_url text` derivato da `images[0]`, `gender: Uomo|Donna|Unisex`), `orders`, `order_items` (con `selected_size`, `selected_color` — snapshot al momento dell'ordine).

> **Attenzione**: i valori `gender` nel DB sono in italiano (`Uomo`/`Donna`/`Unisex`). La UI li traduce tramite `genderMap` in `lib/i18n/translations.ts`.

Schema completo + RLS policies + indici in `supabase/migrations/001_initial_schema.sql`.

## Environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # server-only
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

## i18n

Il sito è bilingue Rumeno (`ro`) + Russo (`ru`). La lingua è globale via `useLangStore` (Zustand, `language.ts`).

- **Usare traduzioni in un componente client**: `const { t, tGender } = useT()` → `t.heroTitle`, `tGender('Uomo')`
- **Aggiungere una nuova stringa**: aggiungila in entrambe le chiavi `ro` e `ru` in `translations.ts` — TypeScript segnala automaticamente chiavi mancanti grazie a `TranslationKey`
- **Testo inline semplice**: usa il componente `<T k="heroTitle" />` invece di `useT`
- I valori `gender` nel DB restano in italiano; `tGender(dbValue)` li mappa nella lingua corrente

## Telegram setup rapido

1. Apri Telegram → cerca `@BotFather` → `/newbot` → ottieni il token
2. Invia un messaggio al bot, poi apri `https://api.telegram.org/bot<TOKEN>/getUpdates` per trovare il `chat_id`
3. Inserisci entrambi in `.env.local`
