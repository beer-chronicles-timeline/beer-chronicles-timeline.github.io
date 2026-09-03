---
name: supabase-backup
description: Create and verify a local Beer Chronicles Supabase PostgreSQL backup using the repository automation. Use before risky database work, after major milestones, or whenever the user asks to back up the Beer Chronicles database. Do not use for restores or Supabase Storage files.
---

# Beer Chronicles Supabase Backup

Create a verified, dated PostgreSQL dump without exposing the database password or mutating Supabase data.

Follow the repository `AGENTS.md`. Never request that the user paste or disclose the database password. Never record it in a command, file, chat message, commit, or process argument. Never restore a dump or modify Supabase data in this workflow.

## Create the backup

1. Work from the Beer Chronicles repository root.
2. Inspect Git status and preserve unrelated changes.
3. Confirm that `scripts/backup-supabase.sh` exists, `package.json` defines `backup:supabase`, and `supabase-backup/` is ignored by Git.
4. Confirm that `psql`, `pg_dump`, `pg_restore`, and `shasum` are installed. The backup script also checks these prerequisites.
5. Check whether `supabase-backup/YYYY-MM-DD` already exists for the current local date. The script deliberately refuses to overwrite it. If it exists, stop and report the collision; never move, rename, or delete an existing backup without the user's instruction.
6. Ask the user to run this command in their own interactive terminal:

   ```bash
   npm run backup:supabase
   ```

   The user enters the database password only at the private terminal prompt. Ask them to share only the non-secret output.
7. A successful run must reach `7/7 Backup completed and verified` and report numeric counts for `events`, `tags`, and `event_tags`. If a stage fails, diagnose the non-secret error. Do not weaken or bypass a connection, table-presence, or checksum check merely to produce a backup folder.

## Independently verify the result

Do not rely only on the script's success message. Inspect the new dated folder read-only.

1. Confirm that it contains these three deliverables:
   - `beer-chronicles.dump`
   - `beer-chronicles.dump.sha256`
   - `backup-info.txt`
2. Confirm that the dump is a nonempty PostgreSQL custom database dump and that its archive header reports the expected `postgres` database, creation time, source server version, and `pg_dump` version.
3. From inside the dated folder, verify the checksum:

   ```bash
   shasum -a 256 -c beer-chronicles.dump.sha256
   ```

4. Inspect the archive table of contents with `pg_restore -l`. Confirm that `public.events`, `public.tags`, and `public.event_tags` each have both `TABLE` and `TABLE DATA` entries. Also check their primary keys and the two `event_tags` foreign keys.
5. Count the rows encoded in each archived `COPY` section without printing row content. Use an unqualified name for `pg_restore --table`; a schema-qualified selector may silently select nothing for this archive. For each of `events`, `tags`, and `event_tags`, use this pattern:

   ```bash
   pg_restore --data-only --table="TABLE_NAME" --file=- beer-chronicles.dump |
     awk -v target="public.TABLE_NAME" \
       '$1 == "COPY" && $2 == target {inside=1; next}
        inside && $0 == "\\." {inside=0; next}
        inside {count++}
        END {print count+0}'
   ```

6. Compare the three archived row counts with the live counts recorded in `backup-info.txt`. The metadata counts were queried immediately after the dump, so equality is strong evidence that the intended data was captured. Report any mismatch; do not declare full success.
7. Verify again that all backup artifacts are ignored by Git.

Do not display archived Beer Chronicles row content during these checks.

## Backup boundaries

- The script dumps the complete database accessible through the configured Supabase session-pooler connection. It explicitly verifies data entries for `public.events`, `public.tags`, and `public.event_tags`.
- `--no-owner` and `--no-privileges` omit ownership and privilege restoration commands.
- The dump does not contain the file contents of Supabase Storage buckets or externally hosted images.
- Archived/live count agreement is not a test restoration. Do not claim restore integrity was tested unless the dump was actually restored into a separate safe database and checked.
- Restoration is a separate, explicitly authorized task. Never restore into the live Beer Chronicles project by default.

## Finish

Report the dated folder, dump size, checksum result, the three archived and recorded live counts, core-table/object inspection result, and any unresolved warning.

Remind the user to copy the complete dated folder to Dropbox. For important milestones or larger database changes, also recommend copying it to both external hard disks. A backup stored only on the same computer is insufficient.
