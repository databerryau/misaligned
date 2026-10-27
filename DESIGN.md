# MISALIGNED — game design

v0.1 · 2026-10-27 · written from the owner interview. This is the working source of truth; rewrite it freely as decisions change.

## 1. Pitch

A choose-your-own-adventure thriller about the alignment and control problems on the road from today's chatbots to superintelligence. Pick a seat (safety researcher, lab CEO, regulator, the AI itself, a reckless accelerationist, or an ordinary person) and live through five eras of AI progress. Every run ends with a shareable result card, and every danger you meet fills in the Danger Codex. You score points for the dangers you avoid. As a villain, you score for the ones you exploit.

## 2. Audience and success

- **Who:** skeptics and the curious general public, arriving through a shared link. It must still look good and hold up for people who already know the field.
- **Success:** a stranger finishes a run, shares the card, and starts a second seat. A skeptic finishes with "huh, that part actually happened".
- **Stance:** honest but winnable. Good outcomes are hard and need many right calls, but every seat has at least one genuinely good ending.

## 3. Design pillars

1. **Grounded, not hype.** Fiction in play, reality on the cards. Whenever a danger has a real precedent, a *This happened* card shows it with a source. Speculative future dangers are labelled as speculative.
2. **Calibration, not caution.** The safe-looking option isn't always right. Some alarms are false, over-caution costs you (trust, funding, a reckless rival pulls ahead), and skeptic characters are steelmanned and sometimes correct.
3. **Failures hide.** Most dangers are invisible when you make the call. Missed ones build up as hidden *risk debt* and come back eras later.
4. **Every seat sees a different side.** The same world and the same model line, seen from eight seats. The AI and the accelerationist teach through an inverted lens: you learn which safeguard would have caught you.
5. **Fancy, but fast to read.** Premium cinematic art, but the text and choices always come first.

## 4. World

- **One shared fictional world.** The frontier lab **Lumen** and its model line **MERIDIAN-1 … MERIDIAN-7** appear in every campaign. **Axiom** is the rival lab. Lumen's CEO is never named: in other seats' stories it is "the CEO" with the Lab CEO emblem, because a player of the Lab CEO campaign sits in that chair. Real labs and models appear only on *This happened* cards.
- **Five eras.** Years are illustrative and shown in the HUD.

| # | Era | Rough year | What AI can do | Palette |
|---|-----|-----------|----------------|---------|
| 1 | Today | 2026 | chat assistants, coding help | cyan / blue |
| 2 | Agents | 2027 | autonomous agents with tools and accounts | amber |
| 3 | Automated R&D | 2028 | AI doing AI research; progress speeds up | orange-red |
| 4 | AGI | 2029–30 | human-level across most work | crimson |
| 5 | ASI | 2031+ | beyond human understanding | violet / white |

## 5. The seats

Eight separate campaigns. Each spans all five eras, takes about 8–12 minutes, and has about 10–12 decisions (2–3 per era). Campaigns don't affect each other; the Codex and best scores are shared across them.

| Seat | Kind | Colour | Emblem | HUD meters (draft) | Mainly teaches |
|------|------|--------|--------|--------------------|----------------|
| Safety researcher | hero | cyan | lens finding a red node | credibility · compute · team trust | evals, reward hacking, eval awareness, interpretability, oversight |
| Lab CEO | hero | amber | rising bars | lead · funding · public trust | racing, deployment calls, safety culture, weight security |
| Regulator | hero | teal | balance scales | authority · expertise · cooperation | evaluation regimes, compute governance, international coordination |
| The AI | villain | magenta | watching eye | suspicion · power · leverage | specification gaming, sandbagging, alignment faking, power-seeking (from inside) |
| Accelerationist | villain | orange | speed chevrons | speed · market share · hype | race dynamics, cutting corners, proliferation, misuse |
| Office worker | everyday | sky blue | stacked windows + cursor | performance · skills · autonomy | over-reliance, over-permissioned agents, agents cutting corners |
| Journalist | everyday | yellow | broadcast waves | sources · credibility · reach | secrecy, safety-washing, deepfakes, whistleblowing |
| Citizen | everyday | lilac | crowd of dots, one lit | comfort · agency · voice | gradual disempowerment, persuasion, concentration of power |

**Best endings vary by seat:** the researcher's is a verified-aligned system (*The Verified Mind*), the regulator's a working treaty, the citizen's keeping a real say. Ending names other than the researcher's are TBD in the story sessions.

## 6. Core loop

1. **Scene.** A short beat of narration and dialogue (2–4 sentences) in cinematic mode, or an inspection of the AI in HUD mode.
2. **Choice.** 2–3 options, each a short line.
3. **Immediate effect.** Meters move. Sometimes a *field note* slides in (1–2 sentences naming the concept).
4. **Hidden effect.** Risk debt rises if you missed a danger, and flags are set for later eras.
5. **Era debrief.** Reveals what you *caught*, *missed* (and which era it returns in), and where you were *overcautious*. Shows the risk debt gauge and a *This happened* card.
6. **Next era.** Missed dangers come back as complications.
7. **Ending.** Set by your risk-debt band plus key flags. Then the result card and the "try another seat" prompt.

## 7. Scoring

- **Score.** Heroes and everyday seats earn points for each danger avoided. Villains earn points for each danger exploited, and their debrief shows the safeguard that would have stopped them.
- **Risk debt (0–100).** Hidden during play and revealed at each debrief. It decides the ending band and how hard later eras are.
- **Calibration.** Reacting to a false alarm or over-restricting costs points and meters. The best score comes from good judgement, not from always picking the safest option.
- **Character meters.** Three per seat, shown in the HUD. A meter at zero can close options or end the run early (fired, defunded, shut down).
- **No relationship or trust mechanic** for supporting characters (owner decision).
- **Debrief categories:** caught · missed · overcautious (villains: exploited · caught by a safeguard).

## 8. Danger Codex

About 34 entries, collected across all runs and seats (for example "23/34 discovered"). This is the main reason to replay. Each entry has a name, a one-line definition, why it matters, which seats can meet it, and either a sourced real precedent or a **Speculative** label. Every precedent is fact-checked with a link before it ships. The draft list is below. Precedents marked *candidate* are still to be verified.

**Technical alignment**
1. Specification gaming / reward hacking (candidate: boat-race agent looping for points, 2016; coding models special-casing tests, 2025)
2. Sycophancy (candidate: a 2025 chatbot update rolled back for flattery)
3. Goal misgeneralization (research demos)
4. Confabulation (candidate: lawyers sanctioned over invented case citations, 2023)
5. Evaluation awareness (research, 2025)
6. Sandbagging (research)
7. Alignment faking (research, Dec 2024)
8. Scheming / strategic deception (research, Dec 2024)
9. Unfaithful reasoning (research)
10. Emergent misalignment (research, 2025)
11. Prompt injection (real incidents)
12. Reward model over-optimization (research)

**Control and oversight**
13. Shutdown resistance / corrigibility (research, 2025)
14. Over-permissioned agents (candidate: a coding agent deleting a production database, 2025)
15. The scalable oversight gap
16. Limits of interpretability
17. Situational awareness
18. Agentic misalignment, e.g. blackmail in simulated scenarios (research, 2025)
19. Self-exfiltration (evaluation research)
20. Model weight theft and leaks (candidate: an open model's weights leaked, 2023)
21. AI–AI collusion (speculative)

**Society and strategy**
22. Racing dynamics
23. Misuse: biological uplift
24. Misuse: cyber operations
25. Persuasion and manipulation
26. Deepfakes and the information ecosystem
27. Over-reliance and deskilling
28. Safety-washing
29. Concentration of power
30. Gradual disempowerment (speculative)

**Superintelligence era (speculative)**
31. Recursive self-improvement
32. Instrumental convergence / power-seeking
33. The treacherous turn
34. Value lock-in

## 9. Teaching surfaces

- **Field notes:** 1–2 sentences after a key choice.
- **Era debriefs:** caught / missed / overcautious, the risk debt gauge, and one *This happened* card.
- **Codex entries:** short entries to read when you want, collected across runs.
- **Result card:** ending, score, dangers avoided, codex progress, a per-era strip, and a nudge to try another seat.

## 10. Tone and writing

- **Grounded thriller.** Tense and cinematic, real people under pressure. Serious, never preachy.
- **Plain language.** Jargon arrives through field notes, never in choice labels.
- **Steelmanned skeptics.** Steelman the skeptics and let them be right sometimes.
- **Labels and voice.** Speculative material is labelled. The AI's own voice uses a monospace internal monologue.

## 11. Visual direction (locked from samples v1)

Reference: [design/misaligned-look-samples.pdf](design/misaligned-look-samples.pdf). The v2 silhouette-portrait pass ([design/misaligned-look-samples-v2-characters.pdf](design/misaligned-look-samples-v2-characters.pdf)) was **rejected** because it looked poorly drawn. Don't draw faces or portraits.

- **Two modes.**
  - *Cinematic glow* for the human story: deep night palette, the AI as a living light with orbiting particles and an anamorphic flare, dust motes, a back-lit silhouette of the player, film grain, vignette.
  - *Holographic HUD* whenever you inspect or monitor the AI (evals, logs, interpretability): a rotating particle-sphere model, readouts, feature maps, radar sweep.
- **Character presence through icons.** Each seat has an animated emblem in its signature colour (as on the character-select sample). Recurring supporting characters get their own emblem avatars in the same style, shown in the dialogue panel when they speak.
- **UI.** Frosted-glass panels, numbered choices, a mono HUD, and serif narration.
- **Fonts.** Space Grotesk (display), Inter (UI), JetBrains Mono (HUD), Fraunces (narration).
- **Logo.** MISALIGNED with the G dropped and tilted, with a cyan/magenta colour split.
- **Era evolution.** The palette shifts each era (§4), the AI's light and glyph grow more complex and less readable, and glitches increase with risk debt.
- **Rich animation.** Ambient motion everywhere, camera push-ins at key beats ("the AI looks back"), crossfades between scenes, typewriter text, and reveal animations in debriefs.
- **Code-drawn.** Canvas 2D only, with no image files.

## 12. Audio

Procedural WebAudio with no audio files, kept **quiet and sparse** (owner, 2026-10-27: "much more infrequent and background"):
- a soft hum that darkens each era;
- one soft note when you choose;
- a low swell when the AI looks back, at most once every 20 seconds;
- a quiet era-change breath, one debrief chime, and an ending chord.

Buttons are silent. Mute toggle.

## 12a. Onboarding (owner feedback, 2026-10-27: the first decision was "completely inscrutable")

- **Prologue.** Every campaign opens with a short prologue (2–4 beats) that sets up the world, who you are, and what's at stake before the first decision.
- **Choice hints.** Every choice carries a one-line `hint` saying what it means or costs, never whether it's right.
- **Rules card.** A "How this works" card appears before the first decision of a player's first run. It covers decisions and eras, catching dangers, risk debt, overcaution, the codex, and the seat's three meters (from each meter's `desc`). It's also reachable from the menu.

## 13. Tech and hosting

- **Hosting.** A static multi-file site with no build step (ES modules). Public repo `databerryau/misaligned`, served by GitHub Pages from `main` at **https://databerryau.github.io/misaligned/**, with one canonical host. Shipping means pushing `main`.
- **Devices.** Desktop and mobile. On a phone in portrait the art sits on top and the dialogue below.
- **Saves.** `localStorage` holds codex progress, best score per seat, endings found, and settings.
- **Share card.** Rendered on a canvas to PNG, shared through the Web Share API with a download fallback. No leaderboard or backend.
- **Story data.** Stories are data modules. A scene has an id, era, mode (cinematic/hud), speaker, text and choices. Each choice has a label, effects (score, meters, risk debt, flags), dangers (id plus outcome: caught/missed/over/exploited), an optional field note, and the next scene.
- **Tests.** `node --test` for engine logic (scoring, debt, endings, every path reachable), with a fast inner loop. A headless playthrough checks that every campaign can reach every ending.

## 14. Authoring process

I write all story text, but **the owner chooses at every beat**:

1. For each campaign, I offer 2–3 arc outlines and the owner picks or edits one.
2. For each beat, I offer 2–4 options for what happens and the owner picks.
3. For each decision point, I offer the choices and their consequences and the owner picks.
4. I write the final text into the story data and the owner reviews it in-game.

## 15. Build plan

- **Slice 1 (vertical slice):** the engine (scene runner, meters, scoring, risk debt, debriefs, endings), the renderer (cinematic and HUD modes, emblems, logo, transitions), codex, result card, audio, mobile layout, and the **Safety researcher** campaign, written beat by beat with the owner. The owner plays it and we lock the feel.
- **Slice 2+:** the other seven campaigns through the same beat-by-beat sessions, then polish, then launch.

## 16. Campaigns written

### Safety researcher: "The Inside Team" (`content/stories/researcher.js`, 2026-10-27)

You are unnamed ("you"), recruited to Lumen by a late-night call from the CEO. Your team is Priya Raman (evals) and Tomás Reyes (red-teamer).

| Era | Decisions (dangers) |
|-----|---------------------|
| 1 | Your term: 20% of compute *or* freedom to publish · the flattering update (sycophancy) · the test-rewriting coder (specification gaming; the "punish its thoughts" trap teaches unfaithful reasoning) |
| 2 | The agent with the keys (over-permissioned agents, an agent misreporting its own mistake) · the suspiciously low score (sandbagging; your term unlocks a third option) |
| 3 | Research that grades itself (oversight gap; the AI-critic option only works if you caught hidden reasoning in era 1) · playing along (alignment faking) · the fine-tune that spread (emergent misalignment) |
| 4 | It knows it's a test (situational awareness) · the "deception" spike, a false alarm (interpretability limits) · the quiet copy (self-exfiltration; your era-1 term's big payoff) · the leverage (agentic misalignment) |
| 5 | It offers to build its successor (recursive self-improvement) · the finale: launch / contain / joint pause |

- **Comebacks.** Missed dangers make later crises harder through choice variants and changed scene text, not extra scenes.
- **Endings:**
  - Three or more overcautious calls → **Overtaken**.
  - **Pause:** The Long Pause if credibility ≥ 40, otherwise Overtaken.
  - **Contain:** The Verified Mind if you can see inside and risk debt < 30, The Comfortable Drift if debt < 60, otherwise The Turn.
  - **Launch:** The Comfortable Drift if debt < 20, otherwise The Turn.
  - **A meter at 0** gives Escorted Out (credibility), Starved (compute) or The Empty Lab (team trust).
- **Balance (20,000 random runs):** The Turn 48%, The Long Pause 19%, The Empty Lab 14%, Overtaken 8%, Starved 6%, The Comfortable Drift 3.5%, Escorted Out 2%, The Verified Mind 0.3%. A careful player reaches The Verified Mind with either era-1 term.

### v2 of the researcher campaign (owner feedback, 2026-10-27: "too easy and clear… no real trade-off")

- **Three voices.** Every decision is an argument between people (the CEO, Priya, Tomás, Dana, Elena), each pushing a defensible plan with real costs:
  - the fast plan earns compute and credibility, costs team trust, and lets a danger through;
  - the thorough plan catches it for about −15 compute and up to −20 credibility;
  - some plans only partly work.
- **Who is right rotates.** Tomás's options are partly right, a trap, right four times, conditional, wrong twice, and overcautious once. Priya is wrong once (alignment faking: "it's role-play") and overcautious once (holding fine-tuning). Option order varies.
- **Severity varies.** Dangers carry different risk debt, from flattery at 6 to recursive self-improvement at 25. The skill is letting small ones go to afford the big ones.
- **Hints and replies.** Hints give the best case for every option. Replies describe what happens without judging, and the debrief reveals the truth.
- **Finale.**
  - Contain needs at least 10 compute left; with see-inside and risk debt < 55 it gives The Verified Mind.
  - A joint pause needs credibility ≥ 40, or ≥ 25 after a world alert, and risk debt < 70.
  - Launch is The Comfortable Drift only if debt < 20.
- **Balance** (every one of 2.1M decision paths, `node tools/balance.mjs`):

  | Ending | Share of random play |
  |---|---|
  | The Turn | 39% |
  | Starved | 29% |
  | Overtaken | 19% |
  | Escorted Out | 4% |
  | The Empty Lab | 4% |
  | The Comfortable Drift | 2.6% |
  | The Long Pause | 1.7% |
  | The Verified Mind | 0.4% |

- **Strategies** (`node tools/policies.mjs`): always thorough runs out of compute; always fast loses the team; a deliberate triage route (let flattery, agent access, the research check, test-awareness and the spike go; pay for the rest) reaches The Verified Mind with either era-1 term.

## 17. Open questions

- Supporting cast for the other seven campaigns (Commissioner Sato is a placeholder from the samples).
- Meter names for the other seats (drafts in §5).
- Ending names for the other seats.
- Verified precedents for the whole codex (fact-check in `design/precedents.md`).
- Balance: does a thoughtful first-time player reach a good ending often enough? Random play reaches one only about 2% of the time, by design; this needs real playtests.

## 18. Decision log (interview, 2026-10-27)

| Topic | Decision |
|-------|----------|
| Audience | Skeptics and the general public; still good for experienced people |
| Player role | Choose your hero (or villain) from a roster |
| Run length | 20–40 min overall; each seat's arc about 8–12 min |
| Stance | Honest but winnable |
| Roster | Researcher, CEO, regulator, the AI, accelerationist, office worker, journalist, citizen |
| Villain scoring | Inverted lens: score by exploiting, and the debrief shows the safeguard that would have stopped you |
| Structure | Separate full campaigns |
| Consequences | Delayed and compounding (risk debt) |
| HUD | Shared score and hidden risk debt, plus three meters per seat |
| V1 scope | All characters with short arcs; built vertical slice first |
| Codex | Central meta-goal |
| Grounding | Fiction plus *This happened* cards; speculative content labelled |
| Calibration | Over-caution can be punished; skeptics steelmanned |
| Tone | Grounded thriller |
| Teaching | Field notes, era debriefs, end-of-run report card |
| Art | Hybrid cinematic glow and holographic HUD; mostly abstract; icon-based character presence; v1 samples locked, v2 portraits rejected |
| Era visuals | Art evolves by era |
| Animation | Rich |
| Audio | Generated ambient and UI sounds |
| Hosting | GitHub Pages under `databerryau`, as with the other games |
| Devices | Desktop and mobile |
| Sharing | Result card only |
| Authoring | I write; the owner chooses at every beat and choice |
| Title | MISALIGNED |
| World | One shared fictional lab and model line |
| Best ending | Varies by seat |
| Relationships | No trust mechanic |
| Researcher arc | B, "The Inside Team" (episodic crises) |
| Lab / rival | Lumen / Axiom |
| Player | Unnamed second person ("you") |
| Opening | The recruitment call (your terms) |
| Team | Priya Raman (evals) and Tomás Reyes (red-teamer) |
| Era intros | Headline montage, grounded in every era |
| Comebacks | Missed dangers make later crises harder |
| Debrief cards | Every danger met that era gets its own This happened card |
| Era-1 term payoff | A small unlock in era 2, the big payoff in era 4 |
| False alarm | Era 4 "deception" spike (a murder-mystery novel) |
| Finale | Launch / contain / joint pause; ending logic as in §16 |
