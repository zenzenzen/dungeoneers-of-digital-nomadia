# Optional ICM Agent Snippet

For ICM-aware agents:

1. Run `python3 -m icm init <project>` when the project has no `.icm/` workspace.
2. Run `python3 -m icm check <project>`.
3. If generated state is missing or stale, run `python3 -m icm refresh <project>`
   and then `python3 -m icm check <project>`.
4. Run `python3 -m icm route <project> --task "<task>"`.
5. Read only the returned `read_order` before widening scope.
6. Update curated `.icm/context/*.md` cards only for durable semantic changes.
7. After adding, removing, renaming, or moving project files, run
   `python3 -m icm refresh <project>` and `python3 -m icm check <project>`.
