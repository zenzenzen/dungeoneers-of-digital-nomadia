# Deployment and recovery

## Railway

Deploy from the repository root, with the config path set to `party-game/railway.json`. Keep the service root at the repository root: the Dockerfile copies `party-game/` from that build context.

1. Authenticate with `npx @railway/cli login` and select the intended workspace/project.
2. Create one service for the game. Set its Railway config-file path to `party-game/railway.json`, or explicitly set Dockerfile path `party-game/Dockerfile` in service settings.
3. Attach one persistent volume at `/data`.
4. Set `NODE_ENV=production`, `DB_PATH=/data/nomadia.sqlite`, and `MAX_ROOMS=100`. Let Railway provide `PORT`.
5. Deploy the repository root and generate a Railway HTTPS domain. Set `PUBLIC_ORIGIN` to that exact origin, without a trailing slash.
6. Configure `/health` as the readiness check. Keep one replica; do not enable serverless sleeping for active game sessions.
7. Complete the live smoke test below and record the deployment URL and evidence in `VERIFICATION.md`.

The image is provider-independent. Railway services with volumes currently cannot use replicas and have a short redeploy outage. Reconnecting browsers reclaim saved seats after the service returns. See the [Railway volume reference](https://docs.railway.com/volumes/reference).

Railway project selection and authenticated access must exist before publishing. A Docker image, configured service, or successful local test does not establish a live deployment.

## Live smoke test

- Verify HTTPS `/health` reports the expected content version.
- Create a room in one browser; join from two separate browsers/devices using only the invite link.
- Start, reveal an encounter, accept a help offer, play an intervention, resolve, and end a turn.
- Confirm other players cannot see private hands. Reload a player and recover the same seat and hand.
- Finish a run and rematch. Confirm local discoveries persist while new-run levels and wallets reset.
- During a disposable test room, restart the service and verify the same room and pinned content resume.
- Check logs for failed commands or server errors without printing tokens. Repeat the basic flow with six players.

## Backup

Use SQLite’s online backup API, not a raw copy of a live database and its WAL.

```sh
npm run backup -- data/backups/before-release.sqlite
```

The production container also includes this command. Set `DB_PATH` when the source database is elsewhere. Targets must be new files. Enable Railway volume backups separately; a backup is not externally stored until that provider operation is confirmed.

## Restore

Stop every application process using the database first. The restore command requires an explicit stopped-server flag and refuses if the local runtime handle points to a live process.

```sh
npm run stop
npm run restore -- data/backups/before-release.sqlite --server-stopped
npm run serve
```

Restore validates SQLite integrity and schema version, backs up the current database under a timestamped name, restores through a temporary database, and removes obsolete WAL/SHM sidecars. It preserves room tokens and pinned content contained in the backup. Restoring an earlier backup rolls room progress back to that backup’s point in time.

For a deployed service, stop the service and restore through a maintenance container attached to the same volume; do not run the command alongside the live game process.

## Monitoring and release

Use `/health`, process logs, volume usage, and the host’s restart/deployment status. Do not log tokens or complete game snapshots. Room admission is capped by `MAX_ROOMS`; inactive rooms older than 24 hours are reclaimed on startup and new-room admission. No third-party analytics or message delivery is configured.

Before a release: run content checks, TypeScript, reducer/server tests, browser scenarios, and Docker build. Back up the database before migrations. Schema version 1 is additive; future schema changes require a matching migration and restore compatibility test. Retain the prior image for rollback and keep old content bundles while saved rooms reference them.
