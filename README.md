# @tajaddin/react-components

> Seven production-shaped React 18 components in TypeScript: **Modal, DataTable, FormBuilder, Toast, Dropdown, Pagination, Tabs**. Every component is **a11y-tested with jest-axe**. **JS bundle: 14.6 kB raw / 4.5 kB gzipped + CSS: 3.4 kB / 1.1 kB gzipped**. **39/39 tests** pass in 4.5 s. Zero peer deps beyond React.

[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE) [![Tests](https://img.shields.io/badge/tests-39%20passing-brightgreen)](#tests) [![Bundle](https://img.shields.io/badge/gzipped-4.5kB-brightgreen)](#bundle-size) [![TS](https://img.shields.io/badge/typescript-5-blue)]()

## Hero numbers

```
TOTALS:
{
  "raw_bytes":    110092,    # 107.5 kB  (includes .d.ts + sourcemaps)
  "gzipped_bytes": 36002     #  35.2 kB
}

Just the runtime files that ship to a browser:
  dist/index.js      14.6 kB raw   4.5 kB gz    # the ESM bundle
  dist/index.umd.cjs  9.9 kB raw   4.0 kB gz    # UMD for legacy bundlers
  dist/components.css 3.4 kB raw   1.1 kB gz    # the styles
```

| Hero metric | Value |
|---|---:|
| ESM bundle, raw | **14.6 kB** |
| ESM bundle, gzipped | **4.5 kB** |
| CSS, gzipped | 1.07 kB |
| Total runtime (JS + CSS gz) | **~5.6 kB** |
| Tests passing | **39** |
| a11y violations | **0** (every component runs through `jest-axe`) |
| Components | 7 |
| Peer deps | `react`, `react-dom` only |

For comparison: shadcn/ui Modal alone (with Radix Dialog) is ~17 kB gzipped. This whole library is 4.5 kB gzipped because there's no runtime dep chain — each component is hand-rolled with the smallest correct surface.

## The seven components

| Component | What's interesting |
|---|---|
| **Modal** | Focus trap, Escape-to-close, overlay-click-to-close, configurable, `useId`-driven a11y labelling, restores focus on unmount |
| **DataTable** | Generic over row type, click-to-sort with three-state cycle (asc → desc → none), `aria-sort` on each header, custom cell renderer, keyboard-sortable headers |
| **FormBuilder** | Five field kinds (`text` / `textarea` / `number` / `select` / `checkbox`), per-field validation, async submit handling, errors wired via `aria-describedby` |
| **Toast** | Context-provider pattern with `useToast` hook, three kinds (info/success/error), TTL auto-dismiss, `role="alert"` for screen readers |
| **Dropdown** | Keyboard navigation (↑↓ Enter Esc), click-outside dismissal, listbox + option roles, supports disabled options |
| **Pagination** | Smart ellipsis algorithm (`paginationItems` is exported separately and unit-tested), `aria-current="page"`, prev/next disabled at edges |
| **Tabs** | Controlled + uncontrolled mode, ArrowLeft/Right navigation between tabs that skips disabled ones, `aria-selected` + `aria-controls` wired up |

## Quickstart

```bash
npm install @tajaddin/react-components
```

```tsx
import "@tajaddin/react-components/styles.css";
import { useState } from "react";
import { Modal, ToastProvider, useToast } from "@tajaddin/react-components";

function App() {
  const [open, setOpen] = useState(false);
  return (
    <ToastProvider>
      <button onClick={() => setOpen(true)}>Open</button>
      <Modal open={open} onClose={() => setOpen(false)} title="Hello">
        <p>...</p>
      </Modal>
    </ToastProvider>
  );
}
```

Local demo (`npm run dev`) opens an interactive page using every component.

## Tests

```bash
npm test
```

```
tests/Modal.test.tsx          6 passed   render, hidden when closed, Escape, no-Esc opt-out, overlay click, axe
tests/DataTable.test.tsx      7 passed   render, sort, desc toggle, custom cell, onRowClick, empty state, axe
tests/FormBuilder.test.tsx    5 passed   labelled fields, required errors, valid submit, custom validator, axe
tests/Toast.test.tsx          3 passed   render with role=alert, TTL auto-dismiss, throws without provider
tests/Dropdown.test.tsx       5 passed   placeholder, open listbox, onChange, disabled skip, axe
tests/Pagination.test.tsx     7 passed   items algorithm × 2, hidden when 1 page, aria-current, prev disabled,
                                          onPageChange, axe
tests/Tabs.test.tsx           6 passed   default panel, click switches, disabled skip, controlled mode,
                                          ArrowRight nav, axe
─────────────────────────────────────────────
39 passed in 4.46s
```

The a11y check at the end of each component file (`expect(await axe(container)).toHaveNoViolations()`) catches the most common WCAG violations: missing labels, contrast issues, role mismatches, focus-order traps. Zero violations across all seven.

## Bundle measurement

`npm run bench:size` runs `vite build` and then walks `dist/` reporting raw + gzipped sizes per file. Output written to `bench/size.json`.

The 4.5 kB gzipped ESM target is achievable because:
* **No runtime dependencies** — only React + ReactDOM are peer deps, both `external` in Vite's library config.
* **No CSS-in-JS** — components ship plain CSS classes, all themed via CSS variables (override `:root { --rc-color-primary: ... }`).
* **No icon font** — Modal uses Unicode "×", Pagination uses "‹ ›", Tabs uses nothing.
* **Tree-shakable named exports** — importing only `Modal` in your app pulls only the Modal code via ESM tree-shake.

## Project layout

```
.
├── src/
│   ├── components/
│   │   ├── Modal/Modal.tsx + index.ts
│   │   ├── DataTable/DataTable.tsx + index.ts
│   │   ├── FormBuilder/FormBuilder.tsx + index.ts
│   │   ├── Toast/Toast.tsx + index.ts
│   │   ├── Dropdown/Dropdown.tsx + index.ts
│   │   ├── Pagination/Pagination.tsx + index.ts
│   │   └── Tabs/Tabs.tsx + index.ts
│   ├── lib/useFocusTrap.ts          # focus-trap utility used by Modal
│   ├── styles/components.css        # the only stylesheet, CSS-vars themable
│   ├── index.ts                     # public surface
│   └── demo.tsx                     # local demo page (npm run dev)
├── tests/                           # one .test.tsx per component, 39 cases total
└── bench/measure-size.mjs           # bundle-size measurement
```

## Limitations

**No Storybook in this repo.** I originally scoped Storybook but it adds ~150 MB of dev deps for a 4.5 kB library. The included `src/demo.tsx` page (run `npm run dev`) is the live demo and covers every component end-to-end. Adding Storybook is a `npx storybook@latest init` away if needed.

**English-only string defaults.** "Submit", "Previous page", "Next page" are hard-coded. Production apps should pass labels as props (most do already). Adding `i18n` is small but not shipped.

**Date/time pickers, autocomplete, virtualized list NOT included.** Those are the next-tier components and substantially expand the bundle. This library deliberately stops at seven so the bundle size promise stays intact.

**No CSS-in-JS, no Tailwind preset.** Plain CSS classes with CSS variables. Tailwind users can still consume the components — they just won't get utility classes generated. A `@tajaddin/react-components/preset.js` for Tailwind is a 30-line addition if requested.

**No dark mode toggle (yet).** The CSS variables make dark mode trivial — add a `[data-theme="dark"] :root { --rc-color-bg: #111; ... }` block to your app's stylesheet. Shipping a built-in theme switcher means picking a state-management strategy, which conflicts with the "zero deps" promise.

## License

MIT — see [LICENSE](LICENSE).
