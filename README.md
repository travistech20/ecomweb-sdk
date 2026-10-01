# @ecomweb/contracts

Private admin contracts for ecomweb: the schemas and constants that the API
and the dashboard must agree on but storefronts never need, such as store
permissions, purchase orders, sales channels, order/customer timelines, store
members and bank accounts.

> Part of a seven-repo system. For the whole picture see
> [`../ecomweb/docs/getting-started/SETUP.md`](../ecomweb/docs/getting-started/SETUP.md).

## Where the public SDK went

This repo used to be `@ecomweb/sdk`. The storefront-facing API client and
types now live in the storefront's pnpm workspace
(`ecomweb-storefront/packages/sdk`) and are published to npm as
`@ecomweb/sdk`. The split was computed from the storefront's and dashboard's
imports; see the storefront-kit design (B2 §4.1) in `ecomweb-storefront/docs`.

Shared base types (`Id`, timestamps, pagination) come from `@ecomweb/sdk`,
which this package declares as a peer dependency. Until `@ecomweb/sdk` is on
npm, development uses the last full SDK commit (`ecomweb-sdk#f3dc1ab`), which
still exports those types; switch to `^0.1.0` after the first release.

## This package ships raw TypeScript

There is no build step; `main` and `types` point at `./src/index.ts` and the
dashboard compiles the source. A type error here becomes a build error in the
dashboard, and there is no CI in this repo, so run both checks yourself:

```bash
pnpm install
pnpm typecheck
pnpm test
```

## How consumers get it

| Consumer | Specifier |
|---|---|
| `ecomweb-dashboard` | `github:travistech20/ecomweb-sdk#<sha>` (pinned) |

Merging here does not reach the dashboard until its SHA is bumped. Bump it in
the same PR as the API change that needs it.

## Generated file: store permissions

`src/types/store-permissions.ts` is written by the API:

```bash
cd ../ecomweb-api && pnpm permissions:export
```

Do not edit it by hand.

## Conventions

- No user-facing strings. Consumers localise from error codes.
- Widening an enum here is not enough: the dashboard keeps private copies of
  some of this vocabulary. Grep the dashboard too.
