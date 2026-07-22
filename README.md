# Playwright TypeScript Test Automation Framework

![Playwright Tests](https://github.com/Yathin96/playwright-typescript-demo/actions/workflows/playwright.yml/badge.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-UI%20%26%20API-2EAD33?logo=playwright&logoColor=white)

UI and API test automation built with **Playwright Test** and **TypeScript**, structured the way a
production suite should be: Page Object Model, typed fixtures, a layered API client, cross-browser
projects, and CI that reports properly.

Every file in `src/` and `tests/` is TypeScript, compiled under `strict` mode with `noImplicitAny`
and `strictNullChecks` — `npm run typecheck` is part of the definition of done.

Written by **Yathin K C** — [github.com/Yathin96](https://github.com/Yathin96)

---

## Why this exists

I own the test automation stack for a commercial SaaS platform, built in Python with Playwright and
pytest. This repository is the same architecture expressed in **TypeScript** with
`@playwright/test` — same design decisions, different runtime. Companion repo to
[playwright-pytest-demo](https://github.com/Yathin96/playwright-pytest-demo).

---

## What's covered

| Area | Implementation |
|---|---|
| **TypeScript** | Strict mode throughout — generics, discriminated types, `readonly` interfaces, custom error classes |
| **UI automation** | Page Object Model over an abstract `BasePage`, with explicit readiness gates |
| **API automation** | Typed clients over Playwright's `APIRequestContext`, no browser launched |
| **Fixtures** | Custom typed fixtures — specs declare what they need, Playwright constructs it |
| **Selectors** | Playwright locators, CSS, XPath and filtered/custom locators, used deliberately |
| **Cross-browser** | Chromium, Firefox, WebKit and a mobile viewport as separate projects |
| **Parallelism** | `fullyParallel` with environment-aware worker counts |
| **Reporting** | HTML, JUnit XML and Allure, plus trace/screenshot/video on failure |
| **Config** | Typed, fail-loud environment loading — bad config errors at start-up, not mid-test |
| **Error handling** | Custom `ApiError` and `ConfigError` classes carrying real diagnostic context |
| **CI** | GitHub Actions with a browser matrix, a fast API-only job, and a nightly schedule |

---

## Structure

```
playwright-typescript-demo/
├── playwright.config.ts          # projects, workers, reporters, timeouts
├── tsconfig.json                 # strict mode, no implicit any, path aliases
├── src/
│   ├── pages/
│   │   ├── BasePage.ts           # abstract base — goto, readiness, shared helpers
│   │   ├── LoginPage.ts          # Playwright locators + CSS + XPath
│   │   ├── InventoryPage.ts      # typed product model, filtered locators
│   │   └── CartPage.ts
│   ├── api/
│   │   ├── BaseApiClient.ts      # generics, status validation, ApiError
│   │   └── PostsClient.ts        # one service client per backend service
│   ├── fixtures/
│   │   └── test-fixtures.ts      # typed fixtures incl. pre-authenticated state
│   └── utils/
│       └── env.ts                # fail-loud typed config
├── tests/
│   ├── ui/                       # login, inventory, cart
│   └── api/                      # contract checks + error-handling behaviour
├── test-data/users.json          # data-driven scenario definitions
└── .github/workflows/playwright.yml
```

---

## Running it

```bash
npm ci
npx playwright install --with-deps

cp .env.example .env        # optional — sensible defaults are built in

npm test                    # everything, all projects
npm run test:api            # API only — no browser, a few seconds
npm run test:chromium       # single browser
npm run test:headed         # watch it run
npm run test:debug          # Playwright Inspector

npm run typecheck           # tsc --noEmit, strict
npm run report              # HTML report
npm run allure:generate && npm run allure:open
```

**47 tests** across 5 spec files: 4 UI specs × 4 browser projects, plus 7 API tests.

---

## Design decisions worth explaining

**Page objects expose intent, not selectors.** `loginPage.login(user)` returns an `InventoryPage`.
Tests never touch `page.locator(...)`. When markup changes you edit one file, not thirty specs.

**Locator strategy is a deliberate choice, not a habit.** Semantic Playwright locators
(`getByRole`, `getByPlaceholder`) are the default because they survive styling churn and assert
accessibility as a side effect. CSS is used for stable `data-test` hooks. XPath appears exactly
once, where structural traversal to an attribute-less sibling is genuinely the clearest option.

**Fixtures over `beforeEach`.** A spec that needs an authenticated session declares
`loggedInInventory` and gets one. No shared mutable state, no setup ordering bugs, full type
inference at the call site.

**Assert properties, not snapshots.** The sort tests check that the returned prices are
non-decreasing rather than comparing against a hard-coded list — the test stays valid when the
catalogue changes, and still fails when sorting actually breaks.

**API tests check contracts, not status codes.** A 200 with a malformed body is a failure. Clients
validate the expected status set and throw a typed `ApiError` carrying method, URL, status and body,
so the failure message tells you what happened instead of `expected 200, got 404`.

**The API project never launches a browser.** Separating it out means API feedback arrives in
seconds and the CI job finishes in under a minute.

**Config fails loudly at start-up.** A missing variable throws `ConfigError` with the fix in the
message, rather than producing an `undefined` navigation three steps into a test.

---

## CI

`.github/workflows/playwright.yml` runs on push, PR, a nightly cron, and manual dispatch:

- **API job** — no browser install, completes in well under a minute
- **UI job** — matrix across Chromium, Firefox and WebKit with `fail-fast: false`, so one browser
  breaking doesn't hide the others
- Reports and traces uploaded as artifacts on every run, pass or fail

---

## Targets under test

- UI: [saucedemo.com](https://www.saucedemo.com) — public Swag Labs demo
- API: [jsonplaceholder.typicode.com](https://jsonplaceholder.typicode.com) — public REST fixture

Public sandboxes by design, so anyone can clone this and run it immediately.
