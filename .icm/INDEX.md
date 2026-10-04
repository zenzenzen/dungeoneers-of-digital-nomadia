# ICM Index

Workspace version: `icm.workspace/v1`

Read this file first, run `python3 -m icm check <project>`, then run
`python3 -m icm route <project> --task "<task>"`. If `check` reports missing or
stale generated state, run `python3 -m icm refresh <project>` and re-run
`check` before routing. Inspect `routes.json` only when the CLI is unavailable.

Files:

- `project.md` - curated purpose, boundaries, and success definition.
- `routes.json` - task profiles, exact read sets, exclusions, and quality gates.
- `context/` - stable curated context cards.
- `tasks/` - task-specific operating rules.
- `generated/` - deterministic observable facts from `icm refresh`, including
  folder context cards under `generated/folders/`.

Limits:

- `INDEX.md`: 4096 bytes.
- Route result: 8192 bytes.
- Context card: 6144 bytes.

Do not treat generated files as semantic truth. Generated files report observed
paths, sizes, hashes, exclusions, manifest-file presence, and folder boundaries
only.
