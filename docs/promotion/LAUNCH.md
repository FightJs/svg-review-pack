# SVG Review Pack — launch record

Status: the user authorized the MIT license, a public repository, GitHub Pages and one post each on CSDN and X. The public repository has been created at https://github.com/FightJs/svg-review-pack; Pages is live at https://fightjs.github.io/svg-review-pack/ after successful [Actions run 43580062852](https://github.com/FightJs/svg-review-pack/actions/runs/43580062852). [The X post](https://x.com/Dearzxcte/status/2121537446446002452) is published. CSDN submission is unconfirmed: one submit click gave no success message, followed by connection errors; do not retry before inspecting the account for an existing submission.

## Prepared materials

- [English README](../../README.md) with a real local screenshot and explicit repository/demo status.
- [Real result screenshot](../images/example-result.png), and [full-page capture](../images/app-full.png), generated from the production build; browser observation in `evidence/promotion-screenshot.txt`.
- [Proposed repository metadata](REPOSITORY.md), [Chinese CSDN draft](CSDN.md), [English X draft](X.txt), [Pages workflow](../../.github/workflows/pages.yml), [third-party notices](../../THIRD_PARTY_NOTICES.md).
- The Pages workflow has only `workflow_dispatch`: it will not deploy automatically on a push. It needs an existing repository, GitHub Pages set to GitHub Actions, an authorized manual run and subsequent live verification.

## Independent implementation review

A separate reviewer found `Object.prototype` names bypassed the SVG element whitelist and malformed `viewBox` separators were accepted. Both were repaired with regression tests. The reviewer subsequently found that non-breaking spaces were accepted as viewBox separators; this was repaired too. The reviewer independently reran 26 browser cases and reported the fixes effective. No script execution or successful export from the whitelist issue was observed; do not describe it as a demonstrated XSS. See `evidence/svg-browser-promotion.html` for the current browser test output.

## Independent draft review

The exact local drafts were independently reviewed. Scores are editorial judgments, not traffic predictions. These are earlier draft reviews. Replace placeholders with the confirmed repository and verified demo, then independently review the exact final text and X composer length before publication.

| Draft | Accuracy /30 | Utility /25 | Readability /20 | Platform /15 | Trust /10 | Total | SHA-256 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| CSDN first review | 29 | 23 | 19 | 13 | 10 | 94 | `32e5bfd89a0fd11f84c9798316f0dd1e87817db5662e1669f7d5db77ed92d24f` |
| X first review | 28 | 21 | 18 | 12 | 9 | 88 | `8b92bc15a31dfacb18099b868cfe9f4fc37150f6c789db8d53d3a2cbd9a9c6df` |
| X focused recheck | 29 | 23 | 19 | 13 | 10 | 94 | `5e3c5a3472183bcf6c197c35f50e15868f8bc074c8a2253cf7755f7ad3cb7d6b` |

The reviewer independently ran the CSDN Node example and obtained 159 input bytes, 175 output bytes, and the listed optimized SVG; the 3,409-pixel figure was supported by the existing browser record, not independently rerun by the draft reviewer. X was revised to state the measured conditions and local command; image ALT and disclosure instructions are separate in [X-METADATA.md](X-METADATA.md). The initial X draft did not pass the score gate; its failure is retained above.

## Rule and disclosure observations (2026-11-14)

- [CSDN content rules](https://marketing.csdn.net/p/f5343cc607bde48f01ed927c90bb529c?pId=3342): reject fake engagement, bulk low-value duplication, misleading titles, unrelated/infringing images and certain promotional funnels. A GitHub link is not blanket pre-approved by these observations; platform moderation remains its decision. Keep a complete technical article and real image.
- The signed-in CSDN editor displayed `创作声明 → 部分内容由AI辅助生成`. It was inspected, not selected or submitted. Prior Zod publication is evidence for that earlier post only.
- [X authenticity policy](https://help.x.com/en/rules-and-policies/authenticity) prohibits inauthentic manipulation and related activity. The current compose UI displayed `Content disclosure → 由人工智能生成` and a separate paid-partnership toggle; neither was changed or posted. The draft uses AI assistance and a genuine screenshot.
- No claim is made that every AI-generated text or every promotional link is allowed; recheck controls and rules at actual publication time. Do not post AI-edited drafts on platforms that prohibit them.

## Pending decisions and verification

1. The user selected MIT; the license is recorded as copyright 2026 FightJs. `boolbase@1.0.0` declares ISC without bundling a notice; current upstream license has been recorded but correspondence with that historical package remains unverified. The npm version was released in 2014, while the upstream LICENSE was introduced in 2015.
2. The user authorized and the agent created `FightJs/svg-review-pack` as a public repository. Push and metadata are in progress.
3. Pages deployment succeeded. The real page was checked for default example, upload, invalidation, config, zero difference, export, reset and narrow screen; a downloaded ZIP passed a clean `npm ci --ignore-scripts` and `node verify.mjs`.
4. After independent review of exact final drafts, publish the authorized one CSDN article and one X post; select applicable disclosures, verify public article/post state and image/ALT. No posts exist for this project yet.
5. A local production build served beneath `/svg-review-pack/` loaded its assets, ran the example, invalidated stale results, reoptimized, exported a ZIP and passed Node verification. This is not a GitHub Pages deployment or a successful Actions run.
6. Stars, impressions, user feedback, external references and review outcomes remain unknown; no baseline or growth is claimed.

## Final publication review and observed state

The final pre-publish reviewer independently checked both drafts after real URLs were inserted. CSDN scored 29/24/19/13/9 = 94/100 (SHA-256 `9434458a7534b93bca8e848ed1ec61973ba246ac9c20656b01fd637d0dbce6fb`); X scored 27/22/19/14/9 = 91/100 (SHA-256 `08414cf72d06a55c3d070f55507f38f9a8cb8be33a2c6db57d614cfbe4597141`). Scores are editorial assessments, not predictions. The reviewer separately ran the Node example; the 3,409-pixel figure was checked against the live-browser evidence rather than independently rerendered by that reviewer.

CSDN rejected the external embedded image by replacing it with a placeholder; clipboard image upload did not persist. The placeholder was removed. One focused independent recheck accepted a text link to the real screenshot (29/23/18/12/9 = 91), noting that readers must leave the article to view it. The editor currently has that link at the end rather than at the initial draft's image position; the local Markdown was updated to match. No second focused review was made. The editor had four intact code blocks, a public visibility setting, four relevant tags, a descriptive summary, and the native `部分内容由AI辅助生成` declaration. GitCode backup and multi-platform publication were off. A single submit click produced no visible success or permalink. An attempt to inspect content management returned `ERR_CONNECTION_CLOSED`; the public profile also failed to reload. The editor was left as a handoff. **CSDN publication is not confirmed and must not be retried until checking the account for a pending or existing article.**

X was posted once from @Dearzxcte at https://x.com/Dearzxcte/status/2121537446446002452 with the real online-result screenshot, an English ALT description and the visible `Made with AI` label. The actual post detail and links were observed; the browser displayed a translated version on the detail page, while the original English was observed on the timeline and in the post title. No paid partnership or bulk activity was used.

The public Pages example, upload, stale result state, configuration change, zero-difference input, download, reset and narrow viewport were checked in the browser. The actual downloaded ZIP passed `npm ci --ignore-scripts` and `node verify.mjs`. GitHub Actions emitted Node 20 action-runtime deprecation notices while completing successfully; the application's build used Node 22. No Star growth or audience impact has been established.
