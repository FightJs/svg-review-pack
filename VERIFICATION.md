# Verification record

Date: 2026-11-14 (Asia/Shanghai). Local macOS; Node 20.13.0, npm 10.8.0, Google Chrome 157.0.8103.51. Browser interaction used Playwright CLI with its Chromium runtime; headless Chrome was also used for the validation harness. Do not assume the Playwright Chromium build equals the installed Chrome version.

## Entry-point gate

A fresh `/tmp/svg-review-gate.*` environment installed and locked `svgo@4.1.0`, `pixelmatch@8.0.0`, `jszip@3.10.1`, and Vite 6.4.1, then ran `npm ci --ignore-scripts`. A Vite production build imported `svgo/browser` and was compared to Node's `svgo` with the same complete config: `path: input.svg`, preset-default, explicit LF and `pretty: false`. For each of ordinary geometry, CRLF input, and an SVG paint attribute containing `réḍ`, all four combinations of multipass false/true and precision 0/6 produced equal UTF-8 byte arrays (12/12). `réḍ` is an unrecognized color identifier; it tests allowed Unicode attribute data, not color fidelity.

The application lockfile was checked against all 96 original locked package entries (versions and integrity included); subsequent addition of TypeScript did not change the SVGO subtree. After the final installation, the same 12 cases were run through the **actual application worker**, Vite production-bundled, against newly generated Node bytes: 12/12 equal. See `gate/gate.mjs`, `gate/worker-gate.js`, `gate/cases.json`, and [gate output](evidence/gate-run.txt). The lockfile used for that earlier check had SHA-256 `e5a1f742713e96b0abbcd552adc5990c09da3de33cdfa4b23e95deabd8b3a583`; SVGO integrity is `sha512-bkxnTg1kSU0guhIBmibA6UUhrQmPVA1XsQLN+ylCd+UWzbnLkySOcXpyk1mrl05f+pcaCx2eHb+sp6BgMZWX+Q==`. These are finite sample observations, not a cross-platform guarantee.

To repeat: `npm ci --ignore-scripts`; `node gate/gate.mjs`; `npx vite build gate --outDir ../gate-dist --emptyOutDir --base=./`; serve `gate-dist` at `http://127.0.0.1:4179/` and open it in a real browser. The JSON body records each result. `gate/run-worker-gate.js` is the Playwright CLI assertion.

## Recorded checks

- `npm run typecheck`: TypeScript 5.9.3 checkJs, exit 0; `npm test`: 4 tests passed; `npm run build`: exit 0.
- Chrome validation harness `tests/svg-browser.html`: 18/18 cases passed, including valid Unicode attribute, malformed XML, invalid UTF-8, BOM, DOCTYPE, script, style, URL, unknown element/attribute, nested SVG, incorrect namespace, invalid viewBox, element/depth/size/path-length limits, including padded path data. [Raw output](evidence/svg-browser-test.html).
- Real browser: default example optimized and rendered, 3,409 / 16,384 differing pixels; original 159 bytes, candidate 175 bytes. Config changes disabled export; file selection via Playwright `setInputFiles`, synthetic drag/drop events, zero-difference input, reset, unsupported config, script, oversized selection, forced optimizer and image-render failures, unsupported optimizer output, and HTML-like config were exercised. Forced failures are test injections, not naturally observed optimizer/render defects. The failed-selection regression was observed failing first and then passing. At 375 px width no horizontal overflow was detected; keyboard Enter activated Reset. [Extra run](evidence/browser-extra.txt).
- Production build made only localhost asset and temporary `blob:` requests during the checked flow. A ZIP was downloaded from that build. [Example ZIP](evidence/example-review-pack.zip).
- `node tests/verify-export.mjs`: fresh unzip, missing dependency failure with hint, `npm ci --ignore-scripts`, intact pack success, and nonzero failures for modified input, config, candidate, manifest version, missing file, and modified candidate with its hash updated. Exported and build lockfiles matched. [Output](evidence/verify-export.txt).
- With browser networking set offline, `report.html` opened from `file://`, rendered three 128 × 128 images, made no HTTP(S) requests, and contained no script. A filename containing `"><img src=x onerror=alert(1)>` appeared as text, not markup. This checks report viewing, not offline dependency installation.

## Not verified

Other browser engines, operating systems, Node/npm versions, all allowed SVGs, exhaustive geometry/render failures, an actual pointer-driven OS file drag, accessibility beyond the listed keyboard check, long-running stress behavior, real user adoption, public deployment, and cross-platform pixel or byte consistency have not been verified. At that stage, the code review was performed by the implementer; a later independent review is recorded below. The 10-second worker timeout is not a sandbox. The output package has no signature. At that stage, no remote repository, deployment, or post had been created.


## Publication-preparation recheck — 2026-11-14

An independent reviewer found that inherited object-property names could bypass the element whitelist, and that malformed `viewBox` separators, including non-breaking spaces, could pass input validation. The fixes use own-property checks and XML whitespace; the reviewer independently reran 26 browser cases and found no remaining issue in these cases. No script execution or successful export was observed from the original whitelist defect. [Browser test output](evidence/svg-browser-promotion.html).

After the fixes, `npm run typecheck`, `npm test` (4/4), and `npm run build` passed. The workflow-equivalent install, checks, build and export verification were also run successfully with Node 22.23.1 locally; the GitHub-hosted Linux runner has not been exercised. The production example screenshot was captured from a real headless browser at 128×128, with the observed 3,409 different pixels; the output ZIP was freshly exported and `node tests/verify-export.mjs` passed its positive and negative checks. The build was also served at a local `/svg-review-pack/` subpath: assets loaded, default example ran, changing configuration disabled export, a rerun exported a package with precision 6/multipass true, and that package passed `npm ci --ignore-scripts` and `node verify.mjs`. [Subpath browser log](evidence/pages-subpath.txt). The Pages workflow YAML parses locally, but GitHub Actions and public Pages have not been run.

## Interface and launch recheck — 2026-11-14

The interface was redesigned as a responsive two-column workspace. Independent review led to accessible image labels, associated configuration help, and a fix for choosing the same file after dragging another; browser regression results are recorded in `evidence/accessibility-final.txt` and `evidence/layout-final.txt`. Node 22 build, typecheck, four unit tests, real example, and positive/negative ZIP verification passed. The package root metadata changed for the MIT license and description; the resulting lockfile SHA-256 is `d0081f3970c7b1b375fca696abd17fb63d2e885f9821c24abe74e9f517f354d0`.
