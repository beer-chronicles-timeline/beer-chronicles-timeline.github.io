import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('supabase_query', Path(__file__).with_name('supabase_query.py'))
helper = importlib.util.module_from_spec(spec)
spec.loader.exec_module(helper)


class SavedQueryTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.sql = self.root / 'proposal.sql'
        self.sql.write_text('BEGIN; SELECT 1; COMMIT;\n')
        self.digest = hashlib.sha256(self.sql.read_bytes()).hexdigest()
        self.token = patch.object(helper, 'read_cli_token', return_value='test-credential')
        self.token.start()
        self.addCleanup(self.token.stop)

    def run_query(self, *, read_only=False, approved_sha256=None, output='result.json'):
        return helper.run_query('a' * 20, self.sql, self.root / output, read_only=read_only, approved_sha256=approved_sha256, attempts_directory=self.root / 'attempts')

    def test_changed_sql_stops_before_authentication_or_network(self):
        with patch.object(helper, 'send_query') as send, patch.object(helper, 'read_cli_token') as token:
            self.sql.write_text('BEGIN; SELECT 2; COMMIT;\n')
            with self.assertRaisesRegex(ValueError, 'differs from the approved'):
                self.run_query(approved_sha256=self.digest)
            token.assert_not_called()
            send.assert_not_called()

    def test_timeout_records_attempt_and_prevents_a_second_mutation(self):
        with patch.object(helper, 'send_query', side_effect=TimeoutError) as send:
            with self.assertRaisesRegex(RuntimeError, 'outcome is uncertain'):
                self.run_query(approved_sha256=self.digest)
            with self.assertRaisesRegex(RuntimeError, 'already has an execution attempt'):
                self.run_query(approved_sha256=self.digest)
            self.assertEqual(send.call_count, 1)
        with patch.object(helper, 'send_query', return_value=(201, [{'present': True}])) as send:
            self.run_query(read_only=True)
            self.assertTrue(send.call_args.args[-1])

    def test_success_sends_exact_sql_once_without_disclosing_credential(self):
        with patch.object(helper, 'send_query', return_value=(201, [{'id': 'verified'}])) as send:
            result = self.run_query(approved_sha256=self.digest)
            self.assertEqual(send.call_args.args[1], self.sql.read_text())
            self.assertFalse(send.call_args.args[-1])
            self.assertEqual(json.loads((self.root / 'result.json').read_text()), [{'id': 'verified'}])
            self.assertNotIn('test-credential', json.dumps(result))
            with self.assertRaisesRegex(RuntimeError, 'already has an execution attempt'):
                self.run_query(approved_sha256=self.digest, output='second.json')
            self.assertEqual(send.call_count, 1)

    def test_read_only_errors_do_not_leak_credentials(self):
        with patch.object(helper, 'send_query', side_effect=RuntimeError('test-credential')):
            with self.assertRaisesRegex(RuntimeError, '^Read-only request failed; no mutation was attempted.$'):
                self.run_query(read_only=True)

    def test_management_api_transport_is_read_only_and_sends_saved_text(self):
        with patch.object(helper.urllib.request, 'build_opener') as create_opener:
            response = create_opener.return_value.open.return_value.__enter__.return_value
            response.status = 201
            response.read.return_value = b'[]'
            self.assertEqual(helper.send_query('a' * 20, 'SELECT 1;\n', 'test-credential', True), (201, []))
            request = create_opener.return_value.open.call_args.args[0]
            self.assertEqual(json.loads(request.data), {'query': 'SELECT 1;\n', 'read_only': True})
            self.assertEqual(request.full_url, f'https://api.supabase.com/v1/projects/{"a" * 20}/database/query')


if __name__ == '__main__':
    unittest.main()
