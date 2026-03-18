---
name: motion-prototyping
description: Turn a rough animation brief into an iterative implementation workflow for canvas or Lottie. Use when Codex needs to create a new animation from a loose motion description, refine timing and smoothness through back-and-forth review, build a canvas-first prototype, or round-trip a prototype into Lottie JSON.
---

# Motion Prototyping

Turn a rough motion brief into a concrete animation implementation, then improve it through short review cycles until the motion feels correct.

Read [`references/prompt-patterns.md`](./references/prompt-patterns.md) when you need example motion briefs, review language, or output framing.

## Workflow

### 1. Normalize the motion brief

Translate the user's rough prompt into a small technical spec before writing code.

Capture:

- subject: what moves
- environment: what it moves against or lands on
- phases: entry, main action, settle/loop
- constraints: duration, fps, output format, style
- success criteria: smoothness, weight, readability, timing

State assumptions briefly if the brief is vague. Do not block on minor ambiguity.

### 2. Choose the implementation strategy

Prefer canvas-first prototyping for new motion ideas.

Use this order by default:

1. implement the motion in plain HTML/CSS/JS with canvas
2. make the timing and silhouettes readable
3. refine based on feedback
4. export or regenerate as Lottie only after the motion is stable

Switch to a source-driven workflow only when an existing `.lottie` or reference animation must be matched closely.

### 3. Build the first pass quickly

Produce a first implementation that is structurally easy to tune.

Favor:

- explicit timing constants
- named motion phases
- reusable easing helpers
- readable state variables over dense math
- isolated drawing primitives

Avoid over-optimizing the first pass. The goal is a tunable prototype, not a final renderer.

### 4. Drive refinement with targeted feedback

Treat each review round as a small correction pass.

When feedback arrives, classify it as:

- timing
- spacing or trajectory
- rotation or flip count
- impact or landing feel
- easing or smoothness
- draw order or silhouette

Apply only the smallest change needed for the reported issue. Preserve the rest of the motion unless the user asks for a broader rewrite.

### 5. Stabilize and package

Once the motion feels correct:

- clean up naming
- separate generic helpers from animation-specific constants
- preserve the final timing values
- add a simple preview or comparison surface when useful

If the user wants Lottie output, convert the stable prototype into structured Lottie JSON only after the motion has already been validated visually.

## Operating Rules

- Default to implementation over theorizing.
- Keep the first pass simple enough to revise quickly.
- Use short review loops instead of large rewrites.
- Preserve user language about feel: "heavier", "snappier", "more bounce", "less floaty".
- When refining, explain what changed in motion terms, not only code terms.
- If a source asset exists, keep an original-vs-rebuild comparison visible during iteration.

## Deliverables

For a new animation request, usually provide:

- a runnable prototype
- a short summary of the motion model
- the main tuning knobs
- optional comparison or preview page

For a round-trip request, also provide:

- the export or generator path
- any assumptions used to map the prototype into Lottie
- known gaps between the prototype and the exported form
