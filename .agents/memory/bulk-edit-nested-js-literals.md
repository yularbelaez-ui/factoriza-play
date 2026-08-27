---
name: Bulk-editing nested JS/TS object literals by id
description: Why regex-based insertion into many similarly-shaped object literals (e.g. adding a field to every item in a large array of exercise/question objects) silently corrupts data, and the safe pattern to use instead.
---

## The failure

When inserting/replacing a field (e.g. `realWorld: "..."`) into ~100+ similarly-shaped object
literals identified by a unique `id`, a single non-greedy regex per id
(`id: "X",[\s\S]*?steps:\s*\[...\](optional-tail)\}`) looks safe but is not: if the literal tail
pattern (e.g. expecting `\s*\}` right after the array) doesn't exactly match the real formatting
(a trailing comma before `}`, multi-line vs single-line objects, an already-existing property in a
different position), the regex backtracks and the non-greedy `[\s\S]*?` keeps expanding until it
finds ANY later occurrence of the tail pattern elsewhere in the file — silently matching and
replacing a huge, wrong span. `content.replace(re, fn)` reported success (content changed, no
exception) for every one of 170 ids, but only ~90 were actually correct; the rest either did
nothing to the intended object or corrupted a distant one. `tsc --noEmit` and even manual spot
checks of a handful of ids did NOT catch this — the file remained syntactically valid because the
replaced span was itself balanced.

**Why:** regex backtracking across `[\s\S]*?` has no concept of "stay within this one object" —
it will happily cross object/array boundaries to satisfy the rest of the pattern if the immediate
match fails for a formatting reason you didn't anticipate.

## The fix that works

Do NOT use a single mega-regex spanning from the id to the closing brace. Instead:
1. Find the id's exact anchor text position via `indexOf`.
2. Find the enclosing object's opening `{` via `lastIndexOf("{", idIdx)`.
3. Walk forward from that `{` with a manual character-by-character brace/bracket counter that
   tracks whether you're inside a string (`"`, `'`, `` ` ``) and skips escaped chars, to find the
   TRUE matching `}` for that specific object (handles nested `[...]` arrays inside safely).
4. Do the same bracket-walk to find the specific `steps: [...]` array's true closing `]` inside
   that bounded object text only.
5. Slice and splice the new field in directly (string slicing within the bounded object text), not
   via a regex `.replace()` against the whole file.

**How to apply:** any time you need to programmatically add/edit a field across many repeated
object literals in a source file (exercise banks, question sets, config arrays, i18n entries),
use the brace/bracket-counting approach above instead of a cross-object regex. After applying,
verify structurally, not just by "did any of the replacements report success": diff the set of
top-level `id:` values before/after (must be identical), and check overall brace/bracket counts
balance. Spot-checking a few ids is not sufficient — verify a representative sample from EVERY
group/module, since corruption tends to cluster by formatting style (e.g. one module's exercises
are multi-line while another's are single-line, and only one style triggers the bug).
