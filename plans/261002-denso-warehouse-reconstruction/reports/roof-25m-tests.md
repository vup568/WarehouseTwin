# Roof 25 m — verification

Date: 2026-10-03. Scope: raise the active demo roof from 10 m to 25 m; preserve everything else.

- `npm test`: **30/30 pass**. Active v1 requires 25 m and rejects obsolete 10 m; historical v0 remains 5 m.
- `npm run build`: **pass**. Existing large-bundle advisory remains non-blocking.
- `git diff --check`: **pass**; only Windows line-ending advisories.
- Before/after SHA-256: all **8 protected files unchanged** — AWS assets renderer, lighting, racks, pallets, scene, environment layout, industrial rack data and floor markings.
- Production assets: **5/5** AWS floor/roof models and textures byte-identical to source.
- No browser visual run for this isolated height change; visual approval remains with the user.

No application edits, commits or pushes performed by the tester.
