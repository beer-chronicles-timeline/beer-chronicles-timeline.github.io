#!/usr/bin/env bash

set -Eeuo pipefail

readonly DB_HOST="aws-1-eu-central-1.pooler.supabase.com"
readonly DB_PORT="5432"
readonly DB_USER="postgres.jyvluckfkzkriuhrvigv"
readonly DB_NAME="postgres"
readonly BACKUP_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/supabase-backup"
readonly BACKUP_DATE="$(date +%Y-%m-%d)"
readonly FINAL_DIR="${BACKUP_ROOT}/${BACKUP_DATE}"

STAGING_DIR=""
PASSWORD_WAS_PROVIDED=false

cleanup() {
  local exit_code=$?

  unset PGPASSWORD SUPABASE_DB_PASSWORD

  if [[ -n "$STAGING_DIR" && -d "$STAGING_DIR" ]]; then
    rm -rf -- "$STAGING_DIR"
  fi

  if (( exit_code != 0 )); then
    printf '\nBackup failed; no completed backup was published.\n' >&2
  fi
}

trap cleanup EXIT

for command_name in psql pg_dump pg_restore shasum mktemp; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    printf 'Required command not found: %s\n' "$command_name" >&2
    exit 1
  fi
done

if [[ -e "$FINAL_DIR" ]]; then
  printf 'A backup folder already exists for today:\n%s\n' "$FINAL_DIR" >&2
  printf 'Refusing to overwrite it. Move or rename it before retrying.\n' >&2
  exit 1
fi

mkdir -p "$BACKUP_ROOT"

if [[ -z "${PGPASSWORD:-}" ]]; then
  if [[ ! -t 0 ]]; then
    printf 'No database password is available and input is not interactive.\n' >&2
    exit 1
  fi

  read -r -s -p "Supabase database password: " SUPABASE_DB_PASSWORD
  printf '\n'
  export PGPASSWORD="$SUPABASE_DB_PASSWORD"
else
  PASSWORD_WAS_PROVIDED=true
fi

export PGSSLMODE=require

printf '1/7 Testing the database connection...\n'
connection_result="$(psql \
  -X \
  --no-password \
  --set=ON_ERROR_STOP=1 \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  -Atc "SELECT current_database() || '|' || current_user;")"

if [[ "$connection_result" != "postgres|postgres" ]]; then
  printf 'Unexpected connection identity: %s\n' "$connection_result" >&2
  exit 1
fi

STAGING_DIR="$(mktemp -d "${BACKUP_ROOT}/.backup-${BACKUP_DATE}.XXXXXX")"
readonly DUMP_PATH="${STAGING_DIR}/beer-chronicles.dump"
readonly CHECKSUM_PATH="${STAGING_DIR}/beer-chronicles.dump.sha256"
readonly INFO_PATH="${STAGING_DIR}/backup-info.txt"
readonly TOC_PATH="${STAGING_DIR}/.restore-list.txt"

printf '2/7 Creating the PostgreSQL dump...\n'
pg_dump \
  --no-password \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --format=custom \
  --no-owner \
  --no-privileges \
  -f "$DUMP_PATH"

if [[ ! -s "$DUMP_PATH" ]]; then
  printf 'The dump file is missing or empty.\n' >&2
  exit 1
fi

printf '3/7 Checking that the dump is readable...\n'
pg_restore -l "$DUMP_PATH" > "$TOC_PATH"

printf '4/7 Checking the core Beer Chronicles tables...\n'
for table_name in events tags event_tags; do
  if ! grep -Eq "TABLE DATA public ${table_name} " "$TOC_PATH"; then
    printf 'Missing table data in dump: public.%s\n' "$table_name" >&2
    exit 1
  fi
done

printf '5/7 Recording live table counts and database versions...\n'
counts="$(psql \
  -X \
  --no-password \
  --set=ON_ERROR_STOP=1 \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  -AtF '|' \
  -c "SELECT table_name, row_count
      FROM (VALUES
        ('events', (SELECT COUNT(*) FROM public.events)),
        ('tags', (SELECT COUNT(*) FROM public.tags)),
        ('event_tags', (SELECT COUNT(*) FROM public.event_tags))
      ) AS counts(table_name, row_count)
      ORDER BY CASE table_name
        WHEN 'events' THEN 1
        WHEN 'tags' THEN 2
        ELSE 3
      END;")"

events_count="$(awk -F '|' '$1 == "events" {print $2}' <<< "$counts")"
tags_count="$(awk -F '|' '$1 == "tags" {print $2}' <<< "$counts")"
event_tags_count="$(awk -F '|' '$1 == "event_tags" {print $2}' <<< "$counts")"

for count_value in "$events_count" "$tags_count" "$event_tags_count"; do
  if [[ ! "$count_value" =~ ^[0-9]+$ ]]; then
    printf 'Could not parse all live table counts.\n' >&2
    exit 1
  fi
done

server_version="$(psql \
  -X \
  --no-password \
  --set=ON_ERROR_STOP=1 \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  -Atc "SHOW server_version;")"

cat > "$INFO_PATH" <<EOF
Backup created: $(date -u +%Y-%m-%dT%H:%M:%SZ)
Database: Beer Chronicles Supabase
Connection: ${DB_HOST}:${DB_PORT}/${DB_NAME}

Live table counts queried immediately after the dump:
events: ${events_count}
tags: ${tags_count}
event_tags: ${event_tags_count}

Backup file:
beer-chronicles.dump

Created with:
$(pg_dump --version)

Source database version:
${server_version}
EOF

printf '6/7 Creating and verifying the SHA-256 checksum...\n'
(
  cd "$STAGING_DIR"
  shasum -a 256 beer-chronicles.dump > beer-chronicles.dump.sha256
  shasum -a 256 -c beer-chronicles.dump.sha256
)

rm -- "$TOC_PATH"
mv -- "$STAGING_DIR" "$FINAL_DIR"
STAGING_DIR=""

printf '7/7 Backup completed and verified.\n\n'
printf 'Backup folder: %s\n' "$FINAL_DIR"
printf 'events: %s\ntags: %s\nevent_tags: %s\n' \
  "$events_count" "$tags_count" "$event_tags_count"
printf '\nCopy this dated folder to Dropbox and, for important milestones, to both external disks.\n'

if [[ "$PASSWORD_WAS_PROVIDED" == true ]]; then
  printf 'Note: PGPASSWORD was inherited by this script; unset it in the parent shell if it is no longer needed.\n'
fi
