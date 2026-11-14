# Agromo — frontend prototype

Agromo is a Georgian agricultural marketplace: buyers find products and contact the farmer directly by phone or WhatsApp. This repository holds an **interactive frontend prototype**. It has no backend.

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build && npm run start
```

Stack: Next.js 16 (App Router, Cache Components), React 19, Tailwind CSS 4, lucide-react. No other runtime dependencies.

### Deploying to Vercel

`vercel.json` sets up the deploy:
- Next.js framework preset, `npm ci`, and `npm run build`.
- Functions run in `fra1` (Frankfurt), the closest region to Georgia.
- Security headers on every page, plus `noindex` on `/dashboard/*` and `/favorites`.

`package.json` pins Node to `24.x`. No environment variables are needed.

- **Git:** push this folder as a repository and import it in Vercel. This folder is the project root.
- **CLI:** run `npx vercel` from this folder, then `npx vercel --prod`.

Each visitor's demo data lives in their own browser, so deployed visitors don't see each other's listings.

### Demo accounts

The login page has one-click buttons for these. The password for both is `agromo2026`.

| Role   | Email                | Notes                                         |
| ------ | -------------------- | --------------------------------------------- |
| Farmer | `farmer@agromo.demo` | Owns the „მამულაშვილების ვენახი“ listings     |
| Buyer  | `buyer@agromo.demo`  | Favorites and buyer overview                  |

You can also register a new buyer or farmer account. **Profile → სადემო მონაცემების აღდგენა** resets everything back to the seed data.

## Routes

| Route                           | What it does                                                          |
| ------------------------------- | --------------------------------------------------------------------- |
| `/`                             | Homepage: hero search, categories, recent listings, regions, sellers |
| `/products`                     | Marketplace: search, category/region/price/availability filters, sorting, load more (state kept in the URL) |
| `/products/[id]`                | Product detail: seller card, phone and WhatsApp actions, related listings |
| `/categories/[slug]`            | The marketplace with the category locked                              |
| `/farmers`, `/farmers/[id]`     | Seller directory and public profiles                                  |
| `/login`, `/register`           | Mock auth; registration fields change with the role                   |
| `/favorites`                    | Saved listings (guests too; they merge into the account on login)     |
| `/dashboard`                    | Role-aware overview                                                   |
| `/dashboard/products`           | Farmer listings: table on wide screens, cards on narrow ones; status toggle, availability change, delete with confirmation |
| `/dashboard/products/new`       | Create a listing                                                      |
| `/dashboard/products/[id]/edit` | Edit a listing (owner only)                                           |
| `/dashboard/profile`            | Farm and contact details or buyer settings; logout; demo reset        |
| `/credits`                      | Photo authors and licenses                                            |

## Code map

- `lib/types.ts` holds the domain types (Product, Seller, User, filters).
- `lib/data/` holds the seed sellers, products and taxonomy (categories, regions, units, labels).
- `lib/services/` is the **mock backend**:
  - `db.ts`: a single localStorage document plus `useSyncExternalStore` plumbing.
  - `auth.ts`, `products.ts`, `favorites.ts`: the service functions that components call.
  - Ownership and role checks live here, not only in the UI.
- `lib/search.ts` handles text normalization, filtering, sorting and URL ⇄ filter state.
- `lib/contact.ts` normalizes Georgian phone numbers and builds the `tel:` and `wa.me` links.
- `components/` is grouped by area: layout, home, marketplace, product, seller, auth, dashboard, favorites, ui.

To connect a real backend, replace `lib/services/*`. Components only use those functions and the hooks in `lib/hooks.ts`.

## Prototype limitations (by design)

- **No server.** All accounts, listings, edits and favorites are stored in this browser's localStorage. Other users and devices never see them.
- **Authentication is simulated.** Passwords are stored as a non-cryptographic demo hash, there is no email verification or password recovery, and anyone with access to the browser can edit the data. Ownership checks run client-side and only demonstrate the rule.
- **Image "upload" is not an upload.** A picked file is downscaled and kept in localStorage as a data URL, so it appears only in this browser. Large images can fill the storage quota, and the form reports that error. You can also choose a demo library photo or paste an image URL.
- **Seed data is fictional.** Sellers, phone numbers and prices are made up. Photos come from Wikimedia Commons and illustrate the categories; they are not the sellers' products (see `/credits`).
- **Search is simple.** It does Unicode-normalized, case-insensitive substring matching on every term. It does not stem Georgian words.
- **No checkout, payments or delivery.** Buyers and sellers agree on everything directly.
- The dashboard renders only in the browser because it needs the browser-only session. Its pages opt out of Next's instant-navigation validation (`export const instant = false`).
