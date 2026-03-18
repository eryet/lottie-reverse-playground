# Prompt Patterns

Use these patterns when the user gives a loose animation idea and wants Codex to turn it into a prototype.

## Motion Brief Template

Normalize vague requests into this shape:

```text
Subject:
Environment:
Entry:
Main action:
Settle or loop:
Duration / FPS:
Output target:
Style cues:
Success criteria:
```

Example:

```text
Subject: coin
Environment: falls onto a flat surface
Entry: drops from above frame
Main action: flips several times while losing energy
Settle or loop: final small wobble, then rest
Duration / FPS: 2.5s at 60fps
Output target: HTML canvas first
Style cues: readable, slightly game-like, satisfying landing
Success criteria: smooth timing, convincing weight, no jitter
```

## First-Pass Prompt

Use when you need Codex to produce the first implementation:

```text
Create a first-pass animation prototype from this motion brief.
Use plain HTML/CSS/JS with canvas.
Keep the code easy to tune:
- explicit timing constants
- named motion phases
- readable easing helpers
- separate generic helpers from animation-specific constants
Optimize for a tunable prototype, not a final engine.
```

## Refinement Prompt

Use when the user gives review feedback:

```text
Refine the existing animation using this feedback only.
Keep the overall structure intact unless the feedback requires otherwise.
Focus on:
- timing
- trajectory
- rotation / flip count
- landing feel
- smoothness

Feedback:
...
```

## Feedback Translation

Translate subjective language into motion edits:

- "too floaty" -> reduce hang time, increase downward acceleration
- "too stiff" -> add easing variation or a small settle phase
- "too busy" -> reduce flip count or amplitude
- "landing is weak" -> sharpen final deceleration and add a short impact response
- "hard to read" -> simplify silhouette changes and spacing

## Round-Trip Prompt

Use when the user wants the stable prototype reused as Lottie:

```text
Convert this stable canvas prototype into structured Lottie output.
Preserve the established timing and motion phases.
Keep the exported structure readable and note any approximation made during conversion.
```
