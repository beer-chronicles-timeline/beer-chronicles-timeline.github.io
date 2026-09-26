#!/usr/bin/env python3
"""Check local campaign files. No network, rendering, OCR, or publishing.

This checks file and manifest contracts, not whether declared facts/approvals
are true. Actual source reading and visual inspection remain mandatory.
Python 3.9+; standard library only.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import struct
import sys
import zlib
from datetime import date, datetime
from pathlib import Path
from urllib.parse import urlsplit
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
SERIES = "The Stories Behind the Trier Beer Festival 2026"
TICKETS = "https://www.ticket-regional.de/events_info.php?eventID=275224"
HOSTS = ("@kraft_braeu_trier", "@blesius_garten")
FILES = ("feed.png", "story.png", "caption.txt", "story-text.txt", "alt-text.txt",
         "publishing.md", "post.json", "qa.json")
HEX = re.compile(r"^[a-f0-9]{64}$")


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def read_json(path: Path) -> dict:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ValueError(f"{path.name} must contain a JSON object")
    return value


def png_info(path: Path) -> tuple[int, int, int, int]:
    """Validate PNG chunk CRCs and return width, height, depth, colour type."""
    data = path.read_bytes()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError(f"{path.name} is not a PNG")
    offset = 8
    info = None
    has_image_data = False
    while offset + 12 <= len(data):
        length = struct.unpack(">I", data[offset:offset + 4])[0]
        kind = data[offset + 4:offset + 8]
        end = offset + 8 + length
        if end + 4 > len(data):
            raise ValueError(f"{path.name}: truncated PNG chunk")
        body = data[offset + 8:end]
        expected = struct.unpack(">I", data[end:end + 4])[0]
        if zlib.crc32(kind + body) & 0xffffffff != expected:
            raise ValueError(f"{path.name}: PNG CRC mismatch")
        if kind == b"IHDR":
            if length != 13 or info is not None:
                raise ValueError(f"{path.name}: invalid IHDR")
            width, height, depth, colour, _, _, _ = struct.unpack(">IIBBBBB", body)
            info = (width, height, depth, colour)
        elif kind == b"IDAT":
            has_image_data = True
        elif kind == b"tRNS":
            raise ValueError(f"{path.name}: transparent output is not permitted")
        elif kind == b"IEND":
            if info is None or not has_image_data:
                raise ValueError(f"{path.name}: missing header/image data")
            return info
        offset = end + 4
    raise ValueError(f"{path.name}: no complete IEND chunk")


def check_references() -> list[str]:
    manifest = read_json(ROOT / "assets/reference-manifest.json")
    errors = []
    for item in manifest["files"]:
        path = (ROOT / item["path"]).resolve()
        if ROOT not in path.parents or not path.is_file():
            errors.append(f"Missing or unsafe reference path: {item['path']}")
            continue
        if digest(path) != item["sha256"]:
            errors.append(f"Reference changed: {item['path']}")
        actual = png_info(path)
        if list(actual[:2]) != item["dimensions"]:
            errors.append(f"Unexpected reference dimensions: {item['path']}")
    return errors


def check_output(out: Path, today: date, require_ready: bool) -> tuple[list[str], list[str]]:
    errors, warnings = [], []
    for name in FILES:
        if not (out / name).is_file():
            errors.append(f"Missing {name}")
    if errors:
        return errors, warnings
    if not (out / "source").is_dir() or not any((out / "source").iterdir()):
        errors.append("Missing editable source/ contents")
    post = read_json(out / "post.json")
    qa = read_json(out / "qa.json")
    for name in ("schema_version", "subject", "entry", "personal_connection", "logo",
                 "publication_date", "tickets", "copy", "render", "approvals", "status"):
        if name not in post:
            errors.append(f"post.json missing {name}")
    if errors:
        return errors, warnings
    if post["schema_version"] != 1:
        errors.append("Unknown manifest schema_version")
    if not str(post["personal_connection"].get("answer", "")).strip():
        errors.append("Personal connection unanswered; 'No personal connection' is valid")
    if post["copy"].get("series_title") != SERIES:
        errors.append("Series title differs from the approved exact title")

    entry = post["entry"]
    link = entry.get("search_url", "")
    parsed = urlsplit(link)
    if parsed.scheme != "https" or parsed.netloc != "beer-chronicles.org" or not parsed.query:
        errors.append("Missing/invalid Beer Chronicles search URL")
    if not entry.get("title") or not entry.get("sources"):
        errors.append("Selected entry title/source evidence is missing")
    publishing = (out / "publishing.md").read_text(encoding="utf-8")
    if link not in publishing:
        errors.append("publishing.md lacks the exact Story URL")
    if TICKETS not in publishing:
        errors.append("publishing.md lacks the ticket URL")

    texts = {}
    for filename, key in (("caption.txt", "caption"), ("story-text.txt", "story_text"),
                          ("alt-text.txt", "alt_text")):
        value = (out / filename).read_text(encoding="utf-8").strip()
        texts[key] = value
        if not value or value != str(post["copy"].get(key, "")).strip():
            errors.append(f"{filename} is empty or differs from saved approved wording")
    caption = texts["caption"]
    for host in HOSTS:
        if host not in caption:
            errors.append(f"Caption missing {host}")
    if TICKETS not in caption.splitlines():
        errors.append("Caption must include the exact ticket URL on its own line")
    if "**" in caption or "```" in caption or "{{" in caption:
        errors.append("Caption contains Markdown formatting or an unresolved placeholder")
    if re.search(r"link in (?:the )?bio|next story", caption, re.I):
        errors.append("Caption contains a prohibited destination instruction")

    if "blech" in str(post["subject"]).lower() and "founded" in entry.get("title", "").lower():
        if entry.get("display_date") == "2019" or re.search(r"\b2019\b", "\n".join(texts.values())):
            errors.append("Known regression: Blech.Brut founding must not repeat the unverified 2019 prototype")

    logo = post["logo"]
    if not HEX.fullmatch(str(logo.get("sha256", ""))):
        errors.append("Original logo SHA-256 missing/invalid")
    logo_path = Path(logo.get("source_path", ""))
    if not logo_path.is_absolute():
        logo_path = out / logo_path
    if not logo_path.is_file():
        warnings.append("Original logo path is not accessible for hash comparison")
    elif digest(logo_path) != logo.get("sha256"):
        errors.append("Original logo hash mismatch")

    for filename, size in (("feed.png", (1080, 1350)), ("story.png", (1080, 1920))):
        info = png_info(out / filename)
        if info[:2] != size:
            errors.append(f"{filename}: expected {size}, found {info[:2]}")
        if info[2] != 8 or info[3] != 2:
            errors.append(f"{filename}: export as opaque 8-bit RGB PNG (no alpha channel)")
        record = post["render"].get("outputs", {}).get(filename, {})
        if record.get("sha256") != digest(out / filename):
            errors.append(f"{filename}: output SHA-256 missing/mismatched")
        if not HEX.fullmatch(str(record.get("pixel_sha256", ""))):
            errors.append(f"{filename}: decoded pixel SHA-256 not recorded")
    if not post["render"].get("template_version") or not post["render"].get("renderer"):
        errors.append("Renderer/template identity not recorded")
    if post["render"].get("mode") == "rendered":
        if not post["render"].get("fonts"):
            warnings.append("Font identities/hashes not recorded")
        for font in post["render"].get("fonts", []):
            if not font.get("family") or not HEX.fullmatch(str(font.get("sha256", ""))):
                errors.append("A rendered font has no valid family/hash record")

    tickets = post["tickets"]
    state = tickets.get("status", "unknown")
    checked_date = None
    if tickets.get("checked_at"):
        stamp = datetime.fromisoformat(tickets["checked_at"].replace("Z", "+00:00"))
        if stamp.tzinfo is None:
            errors.append("Ticket check timestamp has no timezone")
        else:
            checked_date = stamp.astimezone(ZoneInfo("Europe/Berlin")).date()
            if checked_date > today:
                errors.append("Ticket check timestamp is in the future")
    if state not in {"available_both_days", "available_friday_only", "available_saturday_only",
                     "sold_out", "sales_closed", "unknown"}:
        errors.append("Invalid ticket-status value")
    combined = caption + "\n" + texts["story_text"]
    available_claim = bool(re.search(r"tickets (?:are )?still available", combined, re.I))
    if state in {"unknown", "sold_out", "sales_closed"} and available_claim:
        errors.append("Unsupported ticket-availability claim")
    for state_name, day in (("available_friday_only", "friday"), ("available_saturday_only", "saturday")):
        if state == state_name and (day not in caption.lower() or day not in texts["story_text"].lower()):
            errors.append(f"Only {day} is available; both caption and Story must name the day")
    if state != "unknown" and (not tickets.get("evidence") or not tickets.get("source_url") or not checked_date):
        errors.append("Ticket status lacks timestamp and source evidence")
    if state == "unknown":
        warnings.append("Ticket availability needs verification")
    if checked_date != today:
        warnings.append("Ticket verification is not from today's publication date")
    if post.get("publication_date") != today.isoformat():
        warnings.append("Publication is not confirmed for today")
    if today > date(2026, 10, 3):
        warnings.append("Festival has passed; historical reproduction only")
    for check in ("visual_inspection", "factual_review", "repeatability", "colour_space"):
        if qa.get(check) != "passed":
            warnings.append(f"QA {check} is not recorded as passed")
    for approval in ("copy", "visual"):
        if post["approvals"].get(approval) is not True:
            warnings.append(f"User {approval} approval is pending")
    if require_ready and post["status"] != "ready_to_publish":
        errors.append("Package is not marked ready_to_publish")
    if (require_ready or post["status"] == "ready_to_publish") and warnings:
        errors.append("Cannot mark ready_to_publish while review/publication checks are pending")
    return errors, warnings


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--references", action="store_true", help="Verify bundled original/reference files")
    parser.add_argument("--output", type=Path, help="Check one produced post directory")
    parser.add_argument("--ready", action="store_true", help="Require all publication checks complete")
    parser.add_argument("--today", type=date.fromisoformat, help="Trusted publication-day clock override YYYY-MM-DD")
    args = parser.parse_args()
    if not args.references and not args.output:
        parser.error("choose --references and/or --output")
    if args.ready and not args.output:
        parser.error("--ready requires --output")
    errors, warnings = [], []
    try:
        if args.references:
            errors.extend(check_references())
        if args.output:
            today = args.today or datetime.now(ZoneInfo("Europe/Berlin")).date()
            found, notices = check_output(args.output.resolve(), today, args.ready)
            errors.extend(found)
            warnings.extend(notices)
    except (OSError, ValueError, KeyError, TypeError, AttributeError, struct.error) as exc:
        errors.append(f"Validation could not complete: {exc}")
    for item in warnings:
        print(f"REVIEW: {item}")
    for item in errors:
        print(f"ERROR: {item}", file=sys.stderr)
    if errors:
        print(f"Failed: {len(errors)} error(s).", file=sys.stderr)
        return 1
    print("File/manifest checks passed. This is not independent factual or visual approval.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
