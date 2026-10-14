"""Execute a specifically approved saved SQL file using existing CLI authentication.

Conversational approval is required even for --read-only. No retries or login flow.
"""
import argparse
import base64
import datetime
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import urllib.request


def read_cli_token():
    result = subprocess.run(
        ['/usr/bin/security', 'find-generic-password', '-s', 'Supabase CLI', '-a', 'supabase', '-w'],
        capture_output=True, text=True, timeout=15,
    )
    if result.returncode:
        raise RuntimeError('Existing Supabase CLI credential is unavailable; no browser fallback.')
    token = result.stdout.strip()
    if token.startswith('go-keyring-base64:'):
        token = base64.b64decode(token.split(':', 1)[1], validate=True).decode('utf-8')
    if not re.fullmatch(r'sbp_(?:oauth_|v0_)?[a-f0-9]{40}', token):
        raise RuntimeError('Stored Supabase CLI credential has an unexpected format.')
    return token


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def send_query(project, query, token, read_only):
    request = urllib.request.Request(
        f'https://api.supabase.com/v1/projects/{project}/database/query',
        data=json.dumps({'query': query, 'read_only': read_only}).encode('utf-8'),
        headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'},
        method='POST',
    )
    with urllib.request.build_opener(NoRedirect).open(request, timeout=50) as response:
        return response.status, json.loads(response.read())


def run_query(project, sql_path, output_path, *, read_only, approved_sha256=None, attempts_directory=None):
    if not re.fullmatch(r'[a-z]{20}', project):
        raise ValueError('Expected a 20-letter Supabase project reference.')
    sql_path, output_path = Path(sql_path), Path(output_path)
    raw = sql_path.read_bytes()
    query = raw.decode('utf-8')
    digest = hashlib.sha256(raw).hexdigest()
    if not read_only and (not re.fullmatch(r'[a-f0-9]{64}', approved_sha256 or '') or digest != approved_sha256):
        raise ValueError('Saved SQL differs from the approved SHA-256; obtain renewed approval.')
    if output_path.exists():
        raise ValueError('Choose a new output file; existing results will not be overwritten.')
    token = read_cli_token()
    marker = None
    if not read_only:
        attempts = Path(attempts_directory) if attempts_directory else Path(__file__).resolve().parents[4] / '.cache' / 'beer-entry-attempts'
        attempts.mkdir(parents=True, exist_ok=True)
        marker = attempts / f'{project}-{digest}.json'
        try:
            with os.fdopen(os.open(marker, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600), 'w') as file:
                json.dump({'started_at_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'project': project, 'sql_sha256': digest, 'outcome': 'UNCONFIRMED'}, file)
                file.flush()
                os.fsync(file.fileno())
        except FileExistsError:
            raise RuntimeError('This SQL already has an execution attempt. Verify with an approved read-only query; do not retry or remove the marker.') from None
    try:
        status, payload = send_query(project, query, token, read_only)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with os.fdopen(os.open(output_path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600), 'w') as file:
            json.dump(payload, file, ensure_ascii=False, indent=2)
            file.write('\n')
        if marker:
            record = json.loads(marker.read_text())
            record.update(outcome='RESPONSE_RECEIVED', http_status=status, response_file=str(output_path))
            marker.write_text(json.dumps(record, indent=2) + '\n')
        return {'http_status': status, 'read_only': read_only, 'sql_sha256': digest, 'response_file': str(output_path), 'response_rows': len(payload) if isinstance(payload, list) else None}
    except Exception:
        if marker:
            raise RuntimeError('Mutation outcome is uncertain. The attempt marker is retained; use the approved read-only verification and never retry automatically.') from None
        raise RuntimeError('Read-only request failed; no mutation was attempted.') from None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--project', required=True)
    parser.add_argument('--sql', required=True, type=Path)
    parser.add_argument('--output', required=True, type=Path)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument('--read-only', action='store_true')
    mode.add_argument('--approved-sha256', help='Exact hash reviewed and approved in the conversation; a flag is not authorization.')
    args = parser.parse_args()
    try:
        print(json.dumps(run_query(args.project, args.sql, args.output, read_only=args.read_only, approved_sha256=args.approved_sha256)))
    except Exception as error:
        print(str(error), file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
