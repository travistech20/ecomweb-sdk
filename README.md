# @ecomweb/sdk

Shared TypeScript SDK for the EcomWeb storefront API — request builders,
response types and the vocabulary (collection rules, payment methods, order
shapes) that the API and its consumers must agree on.

> Part of a seven-repo system. For the whole picture see
> [`../ecomweb/docs/getting-started/SETUP.md`](../ecomweb/docs/getting-started/SETUP.md).

## This package ships raw TypeScript

There is **no build step**. `main` and `types` both point at `./src/index.ts`,
so consumers compile the source themselves.

Two consequences worth knowing before you touch anything:

- **A type error here becomes a build error in every consumer.** There is no
  compiled artifact to shield them.
- **CI does not exist in this repo.** No workflow runs `typecheck` or `test`.
  Run both yourself before pushing — nothing else will.

```bash
pnpm install
pnpm typecheck
pnpm test
```

## How consumers get it

Both frontends install from GitHub, and they do **not** agree:

| Consumer | Specifier | Effect |
|---|---|---|
| `ecomweb-dashboard` | `github:travistech20/ecomweb-sdk#<sha>` | Pinned |
| `ecomweb-storefront` | `github:travistech20/ecomweb-sdk` | Follows the default branch |

**Merging here does not reach the dashboard.** It pins a commit, so a consumer
must run `pnpm update @ecomweb/sdk` (or have the SHA bumped) before it sees
your change. This is a required step in any cross-repo sequence, and forgetting
it is a common source of "I merged the SDK fix but nothing changed".

The storefront is unpinned, so it picks changes up on its next install — which
also means a broken default branch breaks storefront builds immediately.

### Working on the SDK locally

From the storefront:

```bash
cd ../ecomweb-storefront
pnpm link:sdk     # symlinks node_modules/@ecomweb/sdk -> ../ecomweb-sdk
```

`pnpm install` destroys that symlink; re-run `link:sdk` after every install.

> A `link:` install also **hides this repo's own test failures** — the consumer
> compiles your working tree directly, so a broken `pnpm test` here can go
> unnoticed. Run the SDK's own tests before you push.

## Layout

```
src/
├── core/       HTTP client, error types, shared plumbing
├── modules/    One directory per domain (products, orders, cart, search, …)
├── types/      Shared types and schemas
└── index.ts    Public surface — the only entry point
```

Anything not exported from `src/index.ts` is not public API.

## Conventions

- **The SDK owns the shared vocabulary.** Where the API and SDK both describe
  the same concept (collection rule fields, payment method codes, order
  statuses), the SDK is the source of truth and the API pins itself to it.
- **Widening an enum here is not enough.** The dashboard keeps private copies
  of some of this vocabulary; changing it in the SDK and API can still leave
  the merchant UI unable to use the new value. Grep the dashboard too.
- No user-facing strings. Consumers localise from error codes.
