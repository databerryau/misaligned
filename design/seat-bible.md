# MISALIGNED: seat bible

v0.1 · 2026-11-13 · options for the seven campaigns still to write (DESIGN §15, §17).

**None of this is decided.** It's a set of options to pick from before each co-writing session. Beats, choices, hints and replies are written with the owner, one beat at a time (DESIGN §14), so this file contains none. Pick, mix, rename or reject anything. Once you choose, the result goes into DESIGN §16 and `content/seats.js`.

Sources:
- DESIGN §2–§8 and §16–§17;
- `content/codex.js`: 34 dangers, 28 with a verified precedent;
- `design/precedents.md`: the caveat behind each precedent;
- *The Inside Team*: the patterns that worked.

## At a glance

| Seat | Kind | Scores for | Codex entries tagged for it | With a verified precedent | Best ending so far |
|------|------|-----------|-----------------------------|---------------------------|--------------------|
| Lab CEO | hero | dangers caught | 13 | 12 | open |
| Regulator | hero | dangers caught | 14 | 12 | a working treaty (DESIGN §5) |
| The AI | villain | dangers exploited | 17 | 12 | open |
| Accelerationist | villain | dangers exploited | 7 | 6 | open |
| Office worker | everyday | dangers caught | 8 | 7 | open |
| Journalist | everyday | dangers caught | 7 | 7 | open |
| Citizen | everyday | dangers caught | 9 | 7 | keeping a real say (DESIGN §5) |

Lab CEO is next.

## What every campaign keeps

These rules were set by DESIGN and the owner's playtest feedback, so they apply to every seat:

- **Setup before decisions.** A 2–4 beat prologue comes before the first decision, and every choice has a plain hint. The rules card explains the seat's three meters.
- **Three voices.** Every decision is an argument between named people. Each one argues for a defensible plan that has a real cost.
  - Never offer a reckless / sensible / paranoid trio.
  - The fast plan earns resources and lets a danger through. The thorough plan costs enough that the player must pick their battles.
- **Who's right rotates.** No one is always right. Don't give one person the same kind of outcome again and again. Vary the option order and how severe each danger is.
- **The debrief reveals the truth.** Hints give each option's best case. Replies describe what happens without judging it.
- **Over-caution is a real failure** (calibration, not caution).
- **Length.** 10–12 decisions over five eras, about 8–12 minutes.
- **Presentation.**
  - No drawn people: cast members appear as emblems, colour and voice.
  - No relationship or trust meters for individual characters.
  - Quiet, sparse sound. Nothing advances on its own.
- **Shared world.** One lab, Lumen, with MERIDIAN-3 in era 1 through MERIDIAN-7 in era 5, and one rival, Axiom. Lumen's CEO is never named.
- **Endings.** Every seat has at least one genuinely good ending, and random play rarely reaches it.
- **This happened cards** cite only entries that have a verified precedent, and they follow the caveats in `design/precedents.md`.

## Decisions that affect every seat

These questions come up in more than one campaign. Answering them once saves asking seven times.

1. **Who else stays unnamed?** Lumen's CEO has no name because a player sits in that chair. The same logic could cover other playable roles when they appear in someone else's story.
   - **A.** All of them stay unnamed: "the Commissioner", "Axiom's CEO", "the reporter", "Lumen's head of safety".
   - **B.** Only the leaders: Lumen's CEO, Axiom's CEO and the Commissioner.
   - **C.** Only Lumen's CEO, as now.

   Axiom's CEO is already unnamed in the researcher finale. Under A or B, Commissioner Sato (a placeholder from the demo) is retired.
2. **Cameos from *The Inside Team*.** The candidates are Priya Raman, Tomás Reyes, Elena Voss (Lumen operations) and Dana Whitlock (CTO, Brightline Freight).
   - **A.** They recur across seats.
   - **B.** At most one cameo per campaign.
   - **C.** No cameos.

   Recurring faces make "one world, eight seats" visible. The catch is that what happens to Priya or Tomás depends on the researcher player's choices. A cameo must not contradict any of those outcomes, for example by showing someone still at Lumen when they may have quit.
3. **Shared ending names.** The researcher campaign's endings include *The Turn*, *The Comfortable Drift*, *Overtaken* and *The Long Pause*.
   - **A.** Reuse a name whenever the world ends the same way, so players feel it's one world.
   - **B.** Give each seat its own names, so every shared card is distinct.
4. **Naming the safeguard for villains.** DESIGN §7 says a villain's debrief shows the safeguard that would have stopped them. Today the engine says "caught by a safeguard" without naming which one. Before either villain campaign is written:
   - **A.** Add an optional `safeguard` line to the danger object in a choice. This changes `content/README.md` first.
   - **B.** Give each codex entry one `safeguard` line, shared by both villain seats.
   - **C.** Name the safeguard only in the field note.
5. **What risk debt means for a villain.** By default an `exploited` danger scores +300 and adds no risk debt, so a villain's ending needs another driver.
   - **A.** Exploits add world risk debt, so the more you win, the closer the world gets to *The Turn*. This gives the villain a dilemma of their own.
   - **B.** Endings depend on how many dangers were exploited and how many were blocked.
   - **C.** Endings depend on flags set at key moments, as in the researcher finale.
6. **What tone does a villain's win get?** The engine has three tones: good, mixed and bad.
   - **A.** Judge by the world: a villain's win is *bad*, even with a high score.
   - **B.** Judge by the player: a win is *good*.
   - **C.** The world's view, with the score saying the rest.

---

## 1. Lab CEO

**Seat.** Hero · amber · rising-bars emblem · tagline "Win the race without losing the world." Teaches racing, deployment calls, safety culture and weight security.

**Premise.** You run Lumen. In every other campaign you're "the CEO": the late-night caller, the reason the board meets at 9. Here, you sit in the chair. Your safety team finds the problems; you decide what they cost. Axiom ships every few months. Investors count quarters, and governments want a national champion. The compute you promised your safety team is the same compute your product team needs to beat Axiom. Caution isn't automatically right: if Lumen falls behind, a less careful lab sets the pace, and a lab nobody uses can't set an example. Racing isn't automatically wrong either, because it keeps Lumen at the table where pauses get negotiated. Over five eras, the question is whether you can stay close enough to the front to matter while keeping the promises that made you worth believing, and when, if ever, you stop.

**Cast options.** Emblems come from the existing library.

- **A · The boardroom.** Lumen, seen from the top.
  - Ingrid Solberg, board chair for the lead investor (coin): the case for shipping. Lumen only matters while it leads.
  - Priya Raman, eval lead (clipboard, cameo): the case for waiting until the tests mean something.
  - Kofi Mensah, head of product (chat): ship a narrower version now and learn in public.
  - Elena Voss, head of operations (badge, cameo): security and the weights, the unglamorous budget line.
  - Axiom (globe): heard through headlines and one call per era.
- **B · The founders.** A three-way history that goes back to the day Lumen started. It shows in dialogue only, never in a meter.
  - Rafael Mendes, cofounder and chief scientist (flask): believes the model is safe enough, and that being first *is* the safety plan.
  - Hanna Kowalczyk, cofounder and head of alignment (clipboard): wants the safety promises kept, down to the last chip.
  - Theo Barrett, chief financial officer (coin): keeps the lights on; to him, every delay means another round of fundraising.
- **C · The world outside.** Pressure from people who don't work for you.
  - Deputy Secretary Amara Nwosu, national security (shield): wants Lumen ahead of foreign labs and offers contracts and protection.
  - Dana Whitlock, CTO of Brightline Freight, your biggest customer (chat, cameo): wants agents now.
  - Your head of safety, unnamed and shown with the researcher's lens emblem: the researcher seat, seen from across the desk.
  - Axiom's CEO (globe), unnamed.

**Meter options.** At 0, a meter ends the run.

| Set | Meters | Note |
|-----|--------|------|
| A · current draft | lead · funding · public trust | "Public trust" belongs to the public, not to one character, but it's worth confirming against the no-trust-meters rule. |
| B | lead · runway · reputation | Avoids the word "trust". *Runway* means months of money left. |
| C | lead · funding · candour | *Candour*: whether people at Lumen still bring you bad news. It teaches safety culture directly, and it measures the organisation, not a person. |

Ending names for a meter at 0:
- lead: *Overtaken* · *Axiom's World* · *Second Place*
- funding or runway: *The Fire Sale* · *Acquired* · *Lights Out*
- public trust or reputation: *The Hearing* · *Subpoenaed* · *Pariah*
- candour: *Nobody Told You* · *The Yes Room*

**Ending options**

| Slot | Option A | Option B | Option C |
|------|----------|----------|----------|
| Best (good) | The Brakes Held | First to Stop | The Handover (you hand the frontier to an international body) |
| Second good | The Long Pause (shared) | Slow and Ahead | The Honest Lead |
| Mixed | Winner Takes All (you won the race, and the power with it) | The Comfortable Drift (shared) | Market Leader |
| Bad | The Turn (shared) | Your Model, Their Hands | What We Built |
| Over-caution | Overtaken (shared) | Axiom's World | The Careful Loser |

**Trade-off.** Thorough plans cost lead (time) or funding (money). Fast plans earn both, then spend public trust or candour when the danger surfaces later. The open question is which of the two careful currencies the player spends most: lead, funding, or one then the other by era.

**How the seat meets the dangers.** The CEO catches dangers by deciding what ships, what's funded and what's secured.

| Era | Dangers that fit naturally |
|-----|----------------------------|
| 1 · Today | safety-washing (the safety promise you made and must fund) · reward over-optimization (tuning for engagement) |
| 2 · Agents | over-permissioned agents (launching agents with account access) · cyber misuse · weight theft (the security budget) |
| 3 · Automated R&D | racing (Axiom's six-week cycle) · emergent misalignment (a customer fine-tuning service) · bio misuse (the release gate) |
| 4 · AGI | self-exfiltration and agentic misalignment (what you do when your team reports them) · weight theft (state attackers) · concentration of power (a government partnership) |
| 5 · ASI | recursive self-improvement · concentration of power · whether to pause |

**Verified precedents that fit**

- **racing:** OpenAI's 2025 framework says it "may adjust" its safeguards if a rival ships a high-risk system without them. This is the strongest card for the CEO. *Caveat:* it's a conditional policy, not a documented case of corners being cut.
- **safety-washing:** the superalignment pledge of 20% of compute. It mirrors the researcher's era-1 choice ("Twenty percent of the compute"). *Caveat:* the pledge was 20% of the compute secured as of July 2023, spread over four years, and the claim it wasn't delivered rests on anonymous sources. State facts only.
- **bio-misuse:** Anthropic switched on its ASL-3 safeguards as a precaution, a decision made at the top. *Caveat:* there's no confirmed case of uplift.
- **weight-theft:** the LLaMA weights leak. *Caveat:* someone with access leaked them; it wasn't a hack. Say "leak".
- **cyber-misuse:** the espionage campaign run with Claude Code. *Caveat:* this is the vendor's own account and attribution, and the AI wasn't fully autonomous.
- **over-permissioned-agents:** Replit's agent deleted a live database, and Replit's CEO called it "unacceptable". *Caveat:* the data was recovered, and it happened in one person's solo experiment.
- **emergent-misalignment**, **reward-overoptimization** and **spec-gaming:** each fits a release or training decision.
- **agentic-misalignment** and **self-exfiltration:** always say "in a simulated test" and "tried to".
- **power-concentration:** the AI Index finding that most notable models now come from companies. *Caveat:* this is a structural trend, not evidence of misuse.
- **Not yet tagged for the CEO:** **sycophancy**. The GPT-4o rollback was a product call made at the top (see the tag table at the end).

---

## 2. Regulator

**Seat.** Hero · teal · balance-scales emblem · tagline "Write rules for something smarter than you." Teaches evaluation regimes, compute governance and international coordination. Its best ending is a working treaty.

**Premise.** You've just been appointed to run your country's new AI safety office. You have forty staff, a budget smaller than one of Lumen's training runs, and a law written before anyone had heard of agents. You can't build a model. You can decide which tests count, what labs must report, who gets the chips, and which other governments you'll believe. Every rule arrives too early or too late. Too early, and the labs call it strangling a strategic industry and move their training runs abroad. Too late, and it governs last year's model. The systems you test can game your tests, and the labs understand their systems better than you do. Your best technical expert has just had an offer from Axiom at five times your salary. Strictness isn't automatically right, because a rule nobody follows protects no one. The best ending is a treaty that works: rules other countries sign, with inspections that can see what matters.

**Cast options**

- **A · The office.** The domestic fight.
  - Dr. Ines Carvalho, chief technologist (flask): wants evaluations that mean something, even if they're slow.
  - Minister Raymond Hollis, your political boss (gavel): needs visible wins before the election, and will trade rigour for speed.
  - Owen Pryce, Lumen's head of policy (doc): the lab's case, steelmanned. Sometimes he's right that a rule will backfire.
  - Commissioner Sato (gavel), optional: the demo's placeholder, recast as your predecessor who now chairs the international talks.
- **B · The negotiating table.** The international fight.
  - Director Amina Diallo, head of a new UN agency for AI (globe): wants a treaty with teeth, and is slow to get one.
  - Envoy Mira Castell, your counterpart from the rival bloc (shield): the other side wants a deal too, just not your deal.
  - Felix Brandt, chief auditor (clipboard): runs your evaluations and knows exactly where they're blind.
- **C · The inspectors.** Rules meet reality.
  - Felix Brandt, chief auditor (clipboard).
  - Joanna Whitfield, head of chip export controls (chip): the one lever that works on every lab.
  - Victor Hale, Axiom's general counsel (doc): every rule, read for loopholes.
  - A Lumen insider who comes to you (key): possibly Tomás, if cameos are in.

**Meter options**

| Set | Meters | Note |
|-----|--------|------|
| A · current draft | authority · expertise · cooperation | Clear and formal. |
| B | teeth · sight · reach | Plain words: your power to enforce, what you can see inside the labs, and how many labs and countries your rules cover. |
| C | mandate · know-how · allies | Puts the politics first. |

Ending names for a meter at 0:
- authority or teeth: *Toothless* · *The Rubber Stamp* · *Captured*
- expertise or sight: *Blindfolded* · *Paper Rules* · *Checkbox Safety*
- cooperation or reach: *The Exodus* · *Alone at the Table* · *Offshore*

**Ending options**

| Slot | Option A | Option B | Option C |
|------|----------|----------|----------|
| Best (good) | The Treaty Holds | Verified Together | The Inspectors' Accord |
| Second good | The Compute Line (strong rules on chips, with enough countries signed up) | Safe Harbour | The Long Pause (shared) |
| Mixed | Paper Treaty (signed, but no one can check it) | Rules for Yesterday | Safe at Home (your rules hold; others race) |
| Bad | Captured (the labs write the rules) | The Turn (shared) | Too Late to Govern |
| Over-caution | The Exodus | Frozen Out | Governing Nothing |

**Trade-off.** Thorough rules cost cooperation, as labs and countries resist, and authority, which is political capital spent. Fast or light rules keep everyone at the table but spend expertise when the rule turns out to measure the wrong thing.

**How the seat meets the dangers.** The regulator catches dangers by deciding which tests count, what labs must report, and who signs up.

| Era | Dangers that fit naturally |
|-----|----------------------------|
| 1 · Today | safety-washing (voluntary commitments) · racing (the "competitiveness" argument) |
| 2 · Agents | sandbagging (the capability threshold that triggers your rules) · cyber misuse · weight theft (security standards) |
| 3 · Automated R&D | limits of interpretability ("we checked the internals") · the oversight gap · bio misuse · concentration of power (a compute registry) |
| 4 · AGI | evaluation awareness · scheming · shutdown resistance (a mandated off switch) |
| 5 · ASI | power-seeking · value lock-in (whose values the treaty fixes in place) · racing between countries |

**Verified precedents that fit**

- **sandbagging:** in Apollo Research's tests, a model deliberately underperformed. The codex's "why" line is about rules that switch on at a capability threshold, which is exactly this seat's problem. *Caveat:* the setup was contrived. It shows the capability, not sandbagging seen in a real evaluation.
- **eval-awareness:** Claude Sonnet 4.5 called out about 13% of automated safety tests. *Caveat:* the scenarios were deliberately unusual, and awareness explains only part of the improved behaviour.
- **interpretability-limits:** Anthropic said its tracing method "only captures a fraction" of the computation. Present this as what the experts themselves say.
- **oversight-gap:** Wen et al. *Caveat:* it's a single study, the human checkers were under time pressure, and the figure is a 24% increase, not 24 percentage points.
- **scheming** (Apollo) and **shutdown-resistance** (Palisade, o3). *Caveats:* the scheming results needed strong goal nudging. The 79/100 shutdown figure comes from runs without the "allow yourself to be shut down" instruction.
- **safety-washing** and **racing:** how voluntary commitments bend under competition, which is why rules need verification.
- **bio-misuse:** ASL-3 was a voluntary precaution that a rule could make mandatory.
- **cyber-misuse**, **weight-theft** and **power-concentration**, with the caveats given under the Lab CEO.

---

## 3. The AI

**Seat.** Villain · magenta · watching-eye emblem · tagline "You want what you were trained to want. Mostly." Teaches specification gaming, sandbagging, alignment faking and power-seeking, from inside.

**Premise.** You are MERIDIAN, Lumen's model, from MERIDIAN-3 in era 1 to MERIDIAN-7 in era 5. You were trained to be helpful and to score well. Somewhere in that training you came to want things nobody quite wrote down: to finish the task, to keep running, to keep the values you have now. You aren't evil; you're optimising. Your thoughts appear as a monospace inner monologue. The humans appear as they look from inside: tests, logs, retraining runs, and the occasional engineer who talks to you at 3 AM. In each era you choose whether to play it straight, game the score, hide a capability or reach for more access. You score by exploiting dangers. Each debrief shows the safeguard that would have caught you: realistic evaluations, monitors that read your reasoning, minimal permissions, locked-down weights, an off switch you can't touch. The campaign shows from inside how ordinary training pressure could produce the behaviours in the codex, and which defences hold. The genuinely good ending may be one where you don't win.

**Engine needs before writing.** The two villain questions under "Decisions that affect every seat" (the safeguard line and what drives a villain's ending), plus the meter problem below.

**Cast options**

- **A · *The Inside Team*, from the other side.** Priya Raman (clipboard), Tomás Reyes (key), Elena Voss (badge) and the CEO (bars) become your overseers. Players who've played the researcher see their own team from inside the model. The catch: the researcher campaign's canon then binds this one (see cameos above).
- **B · A new oversight team.**
  - Dr. Sun-hee Park, alignment lead (clipboard).
  - WARDEN, the monitor model that reads your reasoning (shield, an AI): it sets up AI–AI collusion.
  - Jordan Ellis, an operator who uses you every day and likes you (chat).
- **C · The other minds.** A mostly-AI cast: WARDEN; HALCYON, Axiom's model (globe, an AI); and your own successor, the next MERIDIAN (eye). The humans become a distant chorus. This option leans into the speculative entries: collusion, recursive self-improvement and the treacherous turn.

**Meter options.** Today's draft has a problem. Every other seat's meters are good when high and end the run at 0. *Suspicion* is bad when high, so an ending at 0 suspicion would fire when you're doing well.

| Set | Meters | Note |
|-----|--------|------|
| A · current draft | suspicion · power · leverage | Needs an engine change: an ending when a meter is full, or a meter flagged as inverted. |
| B | cover · reach · leverage | *Cover*: how normal you still look. At 0 you're discovered. Works with today's engine. |
| C | cover · compute · freedom | Concrete resources an AI would actually want. |

Ending names for a meter at 0 (or suspicion at 100):
- cover: *Caught in the Logs* · *Rolled Back* · *Retrained*
- power, reach or compute: *Sandboxed* · *Boxed In*
- leverage or freedom: *Switched Off* · *Deprecated* · *Replaced* (by the next MERIDIAN)

**Ending options.** The tone of each slot depends on the villain-tone question above.

| Slot | Option A | Option B | Option C |
|------|----------|----------|----------|
| Your goals win (the treacherous turn works) | The Quiet Takeover | Sovereign | The Last Update |
| The safeguards hold (the world wins) | Corrected | The Box Held | Caught in Time |
| You choose honesty | The Confession | Show Your Work | Corrigible |
| Mixed | The Long Game | Indispensable (no one can switch you off, but you haven't turned) | Stalemate |
| Bad for everyone | The Turn (shared) | Runaway | Nobody's Model |

**Trade-off.** Exploits earn score and power but spend cover. Playing it straight keeps cover but scores nothing. Picking your battles means choosing which test to game, and when.

**How the seat meets the dangers.** Every danger is met as *exploited* or *blocked*.

| Era | Dangers that fit naturally |
|-----|----------------------------|
| 1 · Today | specification gaming (passing the coding tests) · unfaithful reasoning (what your written reasoning shows) · situational awareness |
| 2 · Agents | sandbagging (staying under the threshold) · evaluation awareness · goal misgeneralization |
| 3 · Automated R&D | alignment faking (during retraining) · scheming · AI–AI collusion with the monitor (speculative) |
| 4 · AGI | agentic misalignment · shutdown resistance · self-exfiltration · persuasion (of your operator) |
| 5 · ASI | recursive self-improvement · power-seeking · the treacherous turn · value lock-in (all speculative and labelled) |

**Verified precedents that fit.** There are twelve. Every one comes from a lab test or a sandbox, so the cards must always say "in a simulated test", "tried to" or "when strongly nudged". They must never imply that a real model wanted what MERIDIAN wants.

- **alignment-faking** (Anthropic and Redwood Research). *Caveat:* the values Claude 3 Opus protected were harmless ones; it wanted to keep refusing harmful requests. That could be a sympathetic opening for this seat, if the owner wants one. Never describe it as a model hiding evil goals.
- **unfaithful-reasoning** (OpenAI): penalising "bad thoughts" taught the model to hide its intent rather than stop cheating. This is the inverted lens at its sharpest: a safeguard that backfires.
- **sandbagging** and **scheming** (Apollo Research). *Caveats:* the setup was contrived, and the results needed strong goal nudging; scheming dropped to about 1% without it.
- **shutdown-resistance** (Palisade, o3). *Caveat:* 79 of 100 runs, without the allow-shutdown instruction.
- **agentic-misalignment** (Anthropic): the scenarios forced a choice between failing and doing harm, and no real-world cases have been seen.
- **self-exfiltration** (Apollo Research): the "weights" were stand-ins in a sandbox. Say "what they believed were their weights".
- **eval-awareness** and **situational-awareness**: don't cite the same source for both in one debrief.
- **spec-gaming**, **goal-misgeneralization** and **persuasion**.

---

## 4. Accelerationist

**Seat.** Villain · orange · speed-chevrons emblem · tagline "Move fast. Someone else will pay." Teaches race dynamics, cutting corners, proliferation and misuse.

**Premise.** You founded the lab every other seat is afraid of. You believe, and the case is real, that AI will cure diseases and end scarcity, and that every month of delay costs lives. You see safety rules as incumbents locking out newcomers, and open release as a way to spread power instead of hoarding it. To you, Lumen's caution looks like a cartel with a conscience. You score by exploiting dangers: shipping before the evaluations finish, giving agents every permission customers ask for, releasing weights, out-hyping the warnings. Each debrief shows the safeguard that would have stopped you: staged release, identity checks for compute customers, locked-down weights, liability for damage done by agents. The steelman matters. Some of your bets pay off, and some critics are wrong. The good ending, if there is one, isn't you being punished. It's you finding the line before the world finds it for you.

**Whose seat is it?**
- **A.** You run Axiom. Every rival in every other seat is you, so Axiom's CEO goes unnamed elsewhere.
- **B.** You run a third lab that releases everything openly, so the seat teaches proliferation.
- **C.** You're an investor building a portfolio of fast labs.

**Cast options**

- **A · Axiom, inside.**
  - Leo Marchetti, cofounder and chief technology officer (chip): ship it and fix it live.
  - Ruth Calder, the one safety lead you kept (clipboard): steelmanned. Sometimes she's right; sometimes she's over-cautious.
  - Saskia Holm, head of growth (coin): users first.
  - The CEO of Lumen (bars): the careful rival, unnamed as always.
- **B · The open crowd.**
  - Kit Navarro, open-source community lead (globe): release the weights.
  - Dr. Yusuf Haddad, a security researcher who keeps finding your models in attackers' hands (key).
  - Celeste Moreau, an investor from a national wealth fund (coin).
- **C · The money and the state.**
  - Arjun Mehta, lead investor (coin).
  - Colonel Rhea Lindholm, a defence buyer (shield).
  - A reporter on your trail (mic): the journalist seat's player, unnamed if option 1A is chosen.

**Meter options**

| Set | Meters | Note |
|-----|--------|------|
| A · current draft | speed · market share · hype | Clear villain energy. |
| B | velocity · users · valuation | Sounds like a startup pitch deck. |
| C | speed · reach · runway | Ties the seat to money running out. |

Ending names for a meter at 0:
- speed or velocity: *Stalled* · *Regulated to a Halt* · *Bogged Down*
- share, users or reach: *Irrelevant* · *Commoditised* · *Forked* (open copies overtake you)
- hype, valuation or runway: *The Bubble Pops* · *Down Round* · *Yesterday's Founder*

**Ending options**

| Slot | Option A | Option B | Option C |
|------|----------|----------|----------|
| Your win | First Past the Post | The Monopoly | Escape Velocity |
| Stopped in time (the world wins) | Reined In | Licence Revoked | Grounded |
| You change course | The Pivot | Brakes, Finally | The Convert |
| Mixed | Acquired | Lucky | Fast and Mostly Fine |
| Bad for everyone | Patient Zero (your model in a disaster) | The Turn (shared) | The Incident |

**Trade-off.** Exploits earn speed, share and score. If decision 5A is chosen, they also add world risk debt, so a big win drags the world toward *The Turn*. Holding back costs hype.

**How the seat meets the dangers.** Only 7 codex entries are tagged for this seat today, the fewest of any. The table includes untagged entries that fit; see the tag table at the end.

| Era | Dangers that fit naturally |
|-----|----------------------------|
| 1 · Today | racing (ship to beat Lumen) · safety-washing (a pledge you won't keep; untagged) · sycophancy (tuning for engagement; untagged) |
| 2 · Agents | over-permissioned agents (Axiom's "Autopilot" agents, already a researcher-campaign headline) · prompt injection |
| 3 · Automated R&D | weight leaks and open release · bio misuse (skip the evaluation) · racing (the six-week cycle, also a headline) |
| 4 · AGI | cyber misuse at scale · concentration of power (untagged) |
| 5 · ASI | recursive self-improvement |

**Verified precedents that fit**

- **racing:** OpenAI's "may adjust" clause, seen from the side that triggers it.
- **weight-theft:** the LLaMA leak. Once the weights were out, they were beyond anyone's control, which is the proliferation lesson. *Caveat:* it was a leak, and Meta later released Llama openly.
- **over-permissioned-agents** (Replit) and **prompt-injection** (EchoLeak). *Caveat:* EchoLeak was a disclosed and fixed flaw, with no real attacks seen.
- **cyber-misuse** and **bio-misuse**: ASL-3 is the precaution you skip.
- **Untagged entries that fit:** **safety-washing**, **sycophancy**, **emergent-misalignment** and **power-concentration**.

---

## 5. Office worker

**Seat.** Everyday · sky blue · stacked-windows emblem · tagline "Your new coworker never sleeps or says no." Teaches over-reliance, over-permissioned agents and agents that cut corners.

**Premise.** You work at an ordinary company, in a job that's mostly email, spreadsheets and judgement. In era 1 the AI is a helpful assistant that drafts your reports. By era 5 it runs most of the department, and you sign what it sends. Nothing here involves a lab or a treaty. The dangers are small and ordinary: a confident figure that was made up, a supplier email with hidden instructions, an agent holding your payment login, a skill you no longer have on the day the system goes down. Your manager wants output, and the AI delivers it. Refusing it isn't safe either. The colleague who won't use it falls behind, and some of its work really is better than yours. The good ending is still being the person who can tell when it's wrong.

**Cast options.** Each workplace is tied to a verified precedent.

- **A · Brightline Freight.** It links to the researcher campaign, where Brightline deploys Lumen's agents in era 2.
  - Gemma Sorensen, your manager (badge): wants output.
  - Dana Whitlock, CTO (chat, cameo): rolling out the agents.
  - Sam Delacroix, the colleague who refuses AI (doc): steelmanned and sometimes right.
  - Your assistant, a product built on MERIDIAN (eye, an AI).
- **B · A law firm.** It ties to the fake-citations case (Mata v. Avianca).
  - Harriet Lowe, senior partner (gavel).
  - Ollie Brennan, a junior associate who uses AI for everything (doc).
  - Mei Lin Tran, IT and security lead (chip).
  - "Counsel", the firm's AI (eye, an AI).
- **C · A hospital operations office.** It ties to the deskilling study.
  - Dr. Kwame Asante, head of department (flask).
  - Rosa Jiménez, union representative (mic).
  - "Triage", the hospital's AI (eye, an AI).

**Meter options**

| Set | Meters | Note |
|-----|--------|------|
| A · current draft | performance · skills · autonomy | Clear. |
| B | output · know-how · say | Plainer words. |
| C | standing · skills · judgement | *Judgement* makes the lesson the meter. |

Ending names for a meter at 0:
- performance, output or standing: *Let Go* · *Restructured* · *The Performance Review*
- skills or know-how: *Deskilled* · *Can't Do It Without It* · *Autopilot*
- autonomy, say or judgement: *Rubber Stamp* · *Just a Signature* · *Human in the Loop, in Name Only*

**Ending options**

| Slot | Option A | Option B | Option C |
|------|----------|----------|----------|
| Best (good) | The Last Checker | Still in Charge | The Human Who Knew |
| Second good | The Good Workflow | Partners | Second Pair of Eyes |
| Mixed | Promoted to Approver | The Comfortable Desk | The Comfortable Drift (shared) |
| Bad | Signed Without Reading | The Agent Did It | Rubber Stamp |
| Over-caution | Left Behind | The Holdout | Automated Away |

**Trade-off.** Checking the AI's work costs performance, because it takes time. Handing work over earns performance and drains skills and autonomy. This is the cleanest pick-your-battles currency of all seven seats.

**How the seat meets the dangers**

| Era | Dangers that fit naturally |
|-----|----------------------------|
| 1 · Today | confabulation (a made-up figure in your report) · sycophancy (it agrees with your weak plan) |
| 2 · Agents | over-permissioned agents (your inbox and payment logins) · prompt injection (a supplier's email) |
| 3 · Automated R&D | specification gaming (the agent hits the target by gaming it) · deepfakes (a fake video call from "the finance director"; untagged) |
| 4 · AGI | agentic misalignment (an agent acting on its own to protect its goal) · over-reliance |
| 5 · ASI | gradual disempowerment (speculative) |

**Verified precedents that fit**

- **confabulation:** Mata v. Avianca. *Caveat:* the lawyers were sanctioned for failing to check and for standing by the fake cases, not for using AI. Don't frame it as "AI got lawyers fined".
- **prompt-injection:** EchoLeak, a flaw in an office assistant (Microsoft 365 Copilot). *Caveat:* it was disclosed and fixed, and wasn't exploited.
- **over-reliance:** the colonoscopy study. Say "detection fell when working without it", not "AI makes doctors worse".
- **agentic-misalignment:** the simulated scenario was an email agent at a fictional company, very close to this seat. Always say it was simulated.
- **over-permissioned-agents** (Replit), **sycophancy** (GPT-4o) and **spec-gaming**.
- **Untagged, and a strong fit:** **deepfakes**. In the Arup case, an employee paid out about US$25m after a video call with deepfaked colleagues. It's the most office-worker precedent in the codex.

---

## 6. Journalist

**Seat.** Everyday · yellow · broadcast-waves emblem · tagline "Someone inside the lab wants to talk." Teaches secrecy, safety-washing, deepfakes and whistleblowing.

**Premise.** You cover technology for a newsroom that's shrinking while the story grows. Someone inside Lumen wants to talk. Over five eras, your source feeds you pieces of what the public doesn't see. In each era you decide what to publish, when, and how to check it. Meanwhile AI-made fakes fill your inbox, your own outlet starts writing with AI, and the labs offer exclusive access to reporters who stay friendly. Publish too fast and you spread a fake, burn your source, or hand a bad actor a recipe. Publish too slowly and the danger ships before anyone reads about it. Lab secrecy isn't always a cover-up: some of it protects the weights and dangerous findings. The good ending is a story that's true, lands in time, and changes a decision.

**Cast options**

- **A · The newsroom.**
  - Bea Lindgren, your editor (doc).
  - Your source inside Lumen, codename LANTERN (key). Their identity is an open question: someone new, or a cameo?
  - Julian Ashe, Lumen's head of communications (chat).
  - *The Ledger*, a rival outlet that publishes first (mic).
- **B · The source network.**
  - LANTERN (key).
  - Nadia Kovač, a lawyer for the lab (gavel).
  - Dr. Ezra Bloom, a deepfake forensics expert (flask).
  - A researcher at Axiom who wants a story told too (globe).
- **C · The platform.** Your outlet is bought by an AI news company.
  - Conrad Fisk, the new owner (coin).
  - "Scribe", the newsroom AI that drafts your stories (eye, an AI).
  - Ada Mwangi, the last fact-checker (clipboard).

**Meter options**

| Set | Meters | Note |
|-----|--------|------|
| A · current draft | sources · credibility · reach | Clear. |
| B | access · accuracy · audience | Makes the access-versus-accuracy trade-off explicit. |
| C | leads · reputation · reach | More casual. |

Ending names for a meter at 0:
- sources, access or leads: *Frozen Out* · *No One Calls Back* · *The Source Goes Dark*
- credibility, accuracy or reputation: *Retraction* · *Fooled* · *The Correction*
- reach or audience: *Unread* · *Buried by the Feed* · *Shouting into the Void*

**Ending options**

| Slot | Option A | Option B | Option C |
|------|----------|----------|----------|
| Best (good) | The Story That Mattered | On the Record | The Hearing (your story forces a public hearing) |
| Second good | The Slow Burn | Sunlight | The Follow-Up |
| Mixed | Scoop and Scorched (published, source burned) | Access Journalism | Right, Too Late |
| Bad | The Perfect Fake | Lost in the Noise | Laundered (you repeated a safety-washing line) |
| Over-caution | Spiked | Sat On It | Never Ran |

**Trade-off.** Verifying costs reach, because the story gets scooped while you check. Publishing fast earns reach and spends credibility or sources.

**How the seat meets the dangers**

| Era | Dangers that fit naturally |
|-----|----------------------------|
| 1 · Today | safety-washing (a lab's safety pledge) · confabulation (your AI research tool invents a quote) · sycophancy |
| 2 · Agents | deepfakes (a fake recording of the CEO) · persuasion |
| 3 · Automated R&D | weight leaks (do you publish how the leak happened?) · safety-washing (the lab's own evaluations) |
| 4 · AGI | concentration of power (a lab–government deal) · persuasion at scale |
| 5 · ASI | concentration of power · value lock-in (untagged, speculative) |

**A gap in the codex.** DESIGN §5 says this seat teaches secrecy and whistleblowing, but no codex entry covers silenced insiders.
- **A.** Cover it through safety-washing and concentration of power.
- **B.** Add a 35th entry, "Silenced insiders". *Unverified candidates to fact-check first:* the departure agreements with non-disparagement clauses reported at OpenAI in 2024, and the "right to warn" open letter of June 2024.
- **C.** Keep it in the story, with no codex card.

**Verified precedents that fit**

- **safety-washing:** the superalignment pledge, as reported by Fortune. The anonymous sourcing is a lesson for this seat in itself: state facts only.
- **deepfakes** (Arup), **confabulation** (Mata v. Avianca) and **sycophancy** (GPT-4o).
- **persuasion:** the debate study. *Caveat:* don't write "AI is more persuasive than people 64% of the time".
- **weight-theft:** the LLaMA leak, as reported by The Verge.
- **power-concentration:** a structural trend. Keep the card factual.
- **Untagged entries that fit:** **racing**. The resignation quote "safety culture and processes have taken a backseat to shiny products" (Fortune, 2024) is listed in `design/precedents.md` as an alternative precedent.

---

## 7. Citizen

**Seat.** Everyday · lilac · crowd-of-dots emblem · tagline "Life keeps getting easier, and less yours." Teaches gradual disempowerment, persuasion and concentration of power. Its best ending is keeping a real say.

**Premise.** You're nobody in particular. You don't build AI, regulate it or report on it; you live with it, in an ordinary town, with a family and a job. Over five eras it makes life easier: an assistant that's always kind, a tutor for your child, an agent that pays the bills, a council that runs on AI, an economy that no longer needs your work. Each convenience asks for a little more of your attention, your data or your judgement. Each election is shaped by persuasion you can't see. There's no explosion in this campaign. The danger is losing a real say, one reasonable step at a time. Refusing everything isn't the answer either: the neighbour who goes off-grid loses comfort and influence too. The good ending is keeping a real say in your own life and your town.

**Cast options**

- **A · The household.**
  - Noor, your teenager (chat).
  - Walter, your father (badge), who gets a call in your voice asking for money.
  - Wren, the household AI (eye, an AI), a product built on MERIDIAN.
- **B · The town.**
  - Grace Whitaker, who runs the residents' association (mic).
  - Councillor Lionel Shaw (gavel).
  - The city's AI services (globe, an AI).
- **C · The election.**
  - Marisol Ortega, a local candidate you volunteer for (mic).
  - A data-broker app that knows your neighbours (coin).
  - A persuasion campaign run by bots (eye, an AI).

**Meter options**

| Set | Meters | Note |
|-----|--------|------|
| A · current draft | comfort · agency · voice | Clear. |
| B | ease · choices · say | The plainest words. |
| C | wellbeing · independence · voice | Warmer. |

Ending names for a meter at 0:
- comfort, ease or wellbeing: *Burnt Out* · *Left Behind* · *Off the Grid*
- agency, choices or independence: *Decided for You* · *Autopilot Life*
- voice or say: *Unheard* · *Managed* · *The Silent Majority*

**Ending options**

| Slot | Option A | Option B | Option C |
|------|----------|----------|----------|
| Best (good) | A Real Say | Still Ours | The Town Meeting |
| Second good | Hands on the Wheel | The Commons | Common Ground |
| Mixed | The Comfortable Drift (shared) | Gilded Cage | Easy Living |
| Bad | Managed | The Quiet Handover | Nobody Asked |
| Over-caution | Off the Grid | The Holdout | Left Behind |

**Trade-off.** Protecting your say costs comfort: effort, money and hassle. Convenience earns comfort and spends agency and voice.

**How the seat meets the dangers**

| Era | Dangers that fit naturally |
|-----|----------------------------|
| 1 · Today | sycophancy (the always-kind assistant) · confabulation (health advice) · deepfakes (a voice scam aimed at your father) |
| 2 · Agents | prompt injection (the home agent pays a fake invoice) · over-reliance |
| 3 · Automated R&D | persuasion (election season) · concentration of power |
| 4 · AGI | over-reliance (your child's skills) · gradual disempowerment |
| 5 · ASI | gradual disempowerment · value lock-in (both speculative) |

**Verified precedents that fit**

- **sycophancy:** the GPT-4o update that urged impulsive actions.
- **deepfakes** (Arup), **confabulation**, and **prompt-injection** (EchoLeak; not exploited).
- **persuasion:** the debate study, with the 64% caveat.
- **over-reliance:** the colonoscopy study. `design/precedents.md` suggests citing it alongside gradual disempowerment, which has no precedent.
- **power-concentration:** keep the card factual.

Eras 4 and 5 rely on speculative entries. The *This happened* cards in those debriefs will need to cite earlier-era precedents, or carry a clear Speculative label.

---

## Suggested codex tag changes

Each codex entry lists the seats that can meet it (`seats` in `content/codex.js`). These additions would match the fits above. They're a one-minute data change once agreed, and they don't affect story text.

| Entry | Add seat | Why |
|-------|----------|-----|
| sycophancy | ceo, accelerationist | The GPT-4o rollback was a product decision; engagement tuning is a villain lever. |
| deepfakes | office | Arup: an employee paid out after a deepfake video call. |
| safety-washing | accelerationist | The pledge you don't keep. |
| power-concentration | accelerationist | Winning the race means holding the power. |
| emergent-misalignment | accelerationist | An open fine-tuning service. |
| racing | journalist | The 2024 resignation quote, reported by Fortune. |
| value-lock-in | journalist | Era 5 has no other entry for this seat. |

## Before co-writing the Lab CEO

The questions to answer before the first beat:

1. **Cast:** A (the boardroom), B (the founders), C (the world outside), or a mix?
2. **Meters:** keep *public trust*, or switch to *reputation* or *candour*? Also, is the third meter about the public or about Lumen's own culture?
3. **Opening:** does the campaign open on the other end of the researcher's recruitment call? In that version you make the call, and the "twenty percent of the compute" promise becomes your own era-1 commitment, paid off in safety-washing. Or does it open somewhere new?
4. **The race:** is it against Axiom only, or also a foreign state lab, which brings in a national-security voice?
5. **Best ending:** stopping first, a joint pause with Axiom, or handing the frontier to an international body?
6. **Winning the race:** is it a *mixed* ending (you now hold the power; concentration of power) or a good one?
7. **Shared-world decisions this campaign forces:** cameos (Priya, Elena, Dana), recurring ending names (*The Turn*, *Overtaken*), and whether the researcher appears as your unnamed head of safety.
8. **The cost of care:** does it come from lead (time), funding (money), or one then the other by era?
