# Lottie Reverse Playground

This repo is a small reverse-engineering lab for `.lottie` animations.

It contains:

- Original `.lottie` packages in [`lottie/`](./lottie)
- Extracted JSON payloads in [`extracted/`](./extracted)
- Hand-rebuilt canvas versions such as [`coin-reveal-idle.html`](./coin-reveal-idle.html) and [`gax-reimplemented.html`](./gax-reimplemented.html)
- Side-by-side comparison pages such as [`compare-side-by-side.html`](./compare-side-by-side.html), [`compare-gax-side-by-side.html`](./compare-gax-side-by-side.html), and [`compare-all.html`](./compare-all.html)

The goal is not only to copy the final look, but to understand how the source animation is built and then recreate the same motion in plain canvas code.

## What Is In Here

### Coin Reveal

- Original package: [`lottie/KlssigNhDf.lottie`](./lottie/KlssigNhDf.lottie)
- Extracted JSON: [`extracted/KlssigNhDf/animations/Coin Reveal Idle New 4.json`](./extracted/KlssigNhDf/animations/Coin%20Reveal%20Idle%20New%204.json)
- Preview of original: [`preview-original.html`](./preview-original.html)
- Main recreation: [`coin-reveal-idle.html`](./coin-reveal-idle.html)
- Readable iteration: [`coin-reveal-idle-readable.html`](./coin-reveal-idle-readable.html)
- Another iteration: [`coin-reveal-idle-ip3.html`](./coin-reveal-idle-ip3.html)

Observed structure:

- 1080 x 1080
- 60 fps
- 301 frames
- 11 top-level layers
- 1 asset / precomp

This one is a good example of rebuilding the animation as a small custom renderer:

- generic Lottie-ish helpers for easing, transform sampling, and Bezier paths
- animation-specific shapes and keyframes written by hand
- direct canvas drawing instead of trying to interpret every Lottie feature

### GAx

- Original package: [`lottie/GAxwlFcjtf.lottie`](./lottie/GAxwlFcjtf.lottie)
- Extracted JSON: [`extracted/GAxwlFcjtf/animations/00976e01-f0aa-439c-9e5a-58c2b48e7bb7.json`](./extracted/GAxwlFcjtf/animations/00976e01-f0aa-439c-9e5a-58c2b48e7bb7.json)
- Preview of original: [`preview-gax-original.html`](./preview-gax-original.html)
- Main recreation: [`gax-reimplemented.html`](./gax-reimplemented.html)
- Config extracted for easier coding: [`gax-config.js`](./gax-config.js)
- Alternate iteration: [`gax-reimplemented-new-shapes.html`](./gax-reimplemented-new-shapes.html)

Observed structure:

- 1080 x 1080
- 100 fps
- 1600 frames
- 1 top-level layer
- 59 assets

This one is a good example of simplifying a more nested Lottie:

- flatten repeated vector asset data into a config object
- keep only the parts needed for reproduction
- write a custom animation loop that samples position, rotation, opacity, and path data

## Running The Files

The HTML files are simple enough to open directly, but serving the folder locally is usually smoother:

```bash
python3 -m http.server 8000
```

Then open:

- `http://localhost:8000/`
- `http://localhost:8000/compare-all.html`
- `http://localhost:8000/compare-side-by-side.html`
- `http://localhost:8000/compare-gax-side-by-side.html`

## The LLM Reverse-Engineering Process

The best way to use an LLM here is as a patient analyst and code assistant, not as a magic converter.

For new animation attempts, the workflow can also be much looser and more vibe-driven:

- start with a rough direction like "a coin drops to the ground, flips a couple of times, then lands"
- let the LLM build a first pass
- go back and forth with feedback until the motion matches your expectation
- keep refining until it feels smooth, readable, and visually satisfying

That back-and-forth loop is an important part of the process in this repo. It is not only about extracting structure from existing Lottie files, but also about shaping new motion ideas collaboratively.

### 1. Extract the `.lottie`

A `.lottie` file is just a zip archive. For example:

```bash
unzip -l lottie/KlssigNhDf.lottie
unzip -l lottie/GAxwlFcjtf.lottie
```

Typical contents:

- `manifest.json`
- `animations/*.json`

If you bring in a new file, extract it into a matching folder under [`extracted/`](./extracted).

### 2. Ask the LLM to summarize structure first

Do not start by asking for a full rewrite.

Start with prompts like:

```text
Summarize this Lottie JSON:
- comp size
- fps
- frame range
- top-level layers
- precomps/assets
- repeated shapes
- important transforms
- shape morphs
- gradients
- masks/mattes
```

Then:

```text
Group the animation into reusable drawing primitives and list which parts must be exact versus which parts can be approximated.
```

The goal is to turn a raw JSON tree into a compact mental model:

- what repeats
- what moves
- what morphs
- what fades
- what can be turned into helper functions

### 3. Reduce the animation into primitives

This is the real reverse-engineering step.

For this repo, the useful primitives are:

- cubic Bezier easing sampler
- Lottie path to canvas path conversion
- keyframed scalar / vector sampler
- transform application
- shape interpolation for morphing paths
- fill / stroke / gradient helpers

You can see these patterns in [`coin-reveal-idle.html`](./coin-reveal-idle.html) and [`gax-reimplemented.html`](./gax-reimplemented.html).

### 4. Ask the LLM for code in layers

Good order:

1. helper functions
2. extracted constants / config
3. one shape group at a time
4. animation loop
5. final cleanup for readability

This works better than asking for one huge file immediately.

Example prompt:

```text
Write plain canvas code for only the shape/path helpers and animated value sampling from this Lottie snippet.
Do not render the final animation yet.
Keep the helpers generic and separate animation-specific constants.
```

Then:

```text
Now implement only the coin body and rim morph for frames 0-120 using those helpers.
```

### 5. Compare visually, then iterate

Use the original and reconstruction side by side.

In this repo that means:

- [`compare-side-by-side.html`](./compare-side-by-side.html) for Coin Reveal
- [`compare-gax-side-by-side.html`](./compare-gax-side-by-side.html) for GAx
- [`compare-all.html`](./compare-all.html) for both at once

When something is off, give the LLM precise feedback:

- frame range
- layer or shape name
- expected motion
- actual motion
- whether the issue is timing, geometry, opacity, rotation, or draw order

Example:

```text
Frames 90-120 are wrong.
The rim is flattening too early and the highlight is drawing above the face.
Please adjust keyframe timing and draw order only.
```

That kind of narrow prompt is much more effective than "fix the animation".

## The Vibe Approach For New Animations

Not every animation attempt starts from a source `.lottie`.

Sometimes the process is:

1. give the LLM a rough motion brief
2. let it generate a canvas version
3. watch it
4. describe what feels wrong or missing
5. repeat until the animation feels right

Example brief:

```text
A coin drops to the ground, flips a couple of times, then settles.
Make it feel smooth and readable, not too fast, with a satisfying landing.
```

This works especially well when:

- the exact geometry is flexible
- the important part is the feel of the motion
- you want to explore ideas quickly
- you are comfortable art-directing through iteration

In that mode, the LLM is acting less like a converter and more like a motion sketch partner.

## How To Apply This To A New Animation

Use this checklist.

### 1. Add the source asset

Put the new `.lottie` file in [`lottie/`](./lottie).

### 2. Extract it

Create a new folder under [`extracted/`](./extracted) and unzip the package there.

### 3. Inspect the animation JSON

At minimum, note:

- width / height
- fps
- total frames
- top-level layer count
- asset count
- whether it uses precomps heavily
- whether it relies on masks, mattes, or image assets

If the animation is mostly vector shapes and transforms, it is a good candidate for this repo’s canvas approach.

### 4. Choose a reconstruction strategy

Usually one of these:

- `Exact-ish custom renderer`: Rebuild the important Lottie features you need and keep the original geometry close.
- `Simplified recreation`: Preserve the motion and composition, but rewrite shapes into cleaner parametric canvas drawing.
- `Config-driven reimplementation`: Extract reusable shape and timing data into a file like [`gax-config.js`](./gax-config.js).

### 5. Create the new files

Recommended pattern:

- `preview-<name>-original.html`
- `<name>-reimplemented.html`
- `compare-<name>-side-by-side.html`

If useful, also keep an iteration file such as:

- `<name>-readable.html`
- `<name>-ip2.html`
- `<name>-new-shapes.html`

That is already the pattern used in this repo.

### 6. Build in passes

Suggested pass order:

1. static composition
2. transforms and timing
3. morphing paths
4. gradients / highlights / polish
5. cleanup and naming

### 7. Validate against the original

Do not trust the code just because it runs.

Check:

- loop length matches
- motion starts on the same frame
- draw order feels correct
- major silhouettes match
- opacity changes happen at the same time
- rotations and pivots feel right

## Practical LLM Prompt Pattern

This pattern works well:

```text
I am reverse-engineering a Lottie animation into plain HTML canvas.
Please do this in steps:
1. summarize the structure
2. identify the reusable primitives
3. propose a canvas architecture
4. implement only the first slice

Constraints:
- plain HTML/CSS/JS
- canvas only
- keep generic helpers separate from animation-specific constants
- preserve original fps and frame count
- prefer readable code over clever code
```

After that, keep each follow-up prompt small and concrete.

## What The LLM Is Good At

- reading dense JSON and turning it into a human summary
- spotting repeated structures
- translating Lottie Bezier data into canvas path commands
- generating interpolation and timing helpers
- reorganizing messy experiments into cleaner code

## What Still Needs Human Judgment

- deciding what can be simplified
- checking whether the motion really matches
- fixing subtle timing drift
- noticing wrong layering and compositing
- choosing whether to emulate Lottie exactly or just reproduce the effect

That is why the side-by-side comparison pages matter so much.

## Repo Notes

- [`coin-reveal-idle.html`](./coin-reveal-idle.html) is the clearest example of a readable, direct canvas recreation.
- [`gax-reimplemented.html`](./gax-reimplemented.html) shows a more data-heavy reconstruction.
- [`generate-dartboard-lottie.js`](./generate-dartboard-lottie.js) is useful as the reverse direction: it builds Lottie JSON from code, which helps build intuition for how paths, layers, and timing map together.

## Short Version

The workflow is:

1. start from either a source `.lottie` or a rough motion vibe
2. make the LLM summarize the structure or sketch the first pass
3. reduce the animation into reusable drawing primitives
4. rebuild or refine those primitives in canvas
5. compare against the original or against your intended feel
6. iterate with narrow, concrete feedback until it looks smooth

That is the core process this repo is already demonstrating.
