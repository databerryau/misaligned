# MISALIGNED: notes for Claude

A choose-your-own-adventure thriller that teaches AI alignment and control. It's a static site with no build step and no dependencies, live at https://databerryau.github.io/misaligned/.

## Sources of truth
- `DESIGN.md` is the source of truth. §16 records each campaign as written. Update it when a decision changes.
- `content/README.md` is the contract between stories and the engine. Change it first when the format changes. Story text lives in `content/`, never in `src/`.
- `design/precedents.md` has the fact-check and caveat behind every codex precedent. `design/seat-bible.md` has the options for the unwritten campaigns.

## Story is co-written with the owner
- The owner chooses at every beat and every choice. Offer 2–4 options with AskUserQuestion, then write the one they pick. Never draft a campaign's beats or choices ahead of them.
- Every campaign opens with a 2–4 beat prologue, and every choice has a plain `hint`.

## Dilemma rules
- Every decision is an argument between named people. Each one argues for a defensible plan that has a real cost. Never offer a reckless / sensible / paranoid trio.
- Fast plans earn resources and let a danger through. Thorough plans cost enough that the player must pick their battles.
- Rotate who is right, and don't give one character the same kind of outcome twice in a row. Vary the option order and how severe each danger is.
- Hints give each option's best case. Replies describe what happens without judging it. The debrief reveals what was right.
- Over-caution is a real failure (calibration, not caution).
- *This happened* cards state facts only and follow the caveats in `design/precedents.md` (for example, "in a simulated test").

## Owner's hard rules
- No drawn people or faces. Characters are emblems, colour and voice.
- No relationship or trust meters for supporting characters.
- Audio stays quiet and sparse. Buttons are silent.
- Nothing auto-advances. Every screen waits for a tap.
- Visuals for the owner go as PDFs sent with SendUserFile, not inline widgets. To make one, print a page with headless Edge (`msedge --headless=new --print-to-pdf --no-pdf-header-footer --virtual-time-budget=20000`). To check it, take a `--screenshot` of a contact sheet and Read the PNG; pdftoppm isn't installed.

## Commands
- `node --test` runs the engine, story and data tests.
- `node tools/balance.mjs [story]` plays every decision path and prints how often random play reaches each ending. The researcher story takes about 2–3 minutes, so run it in the background.
- `node tools/policies.mjs [story]` plays scripted strategies and shows where each one ends.
- To serve the site, run `py -m http.server 8765` from the root. Use `py`, because `python` is only a Microsoft Store stub on this PC. Debug URL params are in `src/README.md`.

## Shipping
- Pushing `main` deploys to GitHub Pages straight away. Work on a branch and open a PR. Merge or push `main` only when the owner says so.
