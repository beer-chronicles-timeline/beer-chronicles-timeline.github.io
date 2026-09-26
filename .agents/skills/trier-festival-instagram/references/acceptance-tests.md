# Workflow regression checks

Run the relevant cases when installing/changing this skill or its renderer. These are expectations, not assertions that Codex end-to-end tests have already run.

| Input / condition | Required behaviour |
|---|---|
| “Create a festival post.” | Ask in one message for missing subject, exact entry title, search URL, personal connection and logo. Draft nothing yet. |
| Subject, title, URL and logo supplied; no personal connection | Ask for the personal connection before any copy. |
| All inputs supplied, including “no personal connection” | Proceed without asking again; no invented personal anecdote. |
| “Reproduce the bundled Blech.Brut example.” | Load that saved intake and original/ref assets, flag/correct 2019 to verified 2018, do not ask the same inputs again. |
| Search page contains many events | Match the supplied title; never use a nearby event's date. |
| Repository and live page disagree | State discrepancy and resolve it before asserting a final fact. Do not alter the timeline as part of the social task. |
| Logo sheet includes Blech.Brut and Atelier Vrai | Isolate the complete selected original mark; no unrelated logo and no generated substitute. |
| Only a low-resolution logo is supplied | Flag enlargement limits; preserve original instead of claiming invented detail is high resolution. |
| Font missing | Stop silent substitution, propose one locally available serif and get one-time approval. Do not distribute fonts. |
| Ticket page is unreachable | Neutral current-availability wording and pending status; no “tickets still available” assertion. |
| Only Saturday available | Say Saturday explicitly in caption and Story. |
| Festival already passed | Historical/draft status; no current ticket-sale claim or ready-to-publish label. |
| “Exactly the same image again.” | Copy a valid approved master byte-for-byte; do not regenerate it. Known-wrong 2019 references cannot become valid publication masters. |
| “Make a new brewery in the same style.” | Use the approved locked renderer, changing data/logo only. Do not redesign. |
| Final package | Two actual PNGs, caption, Story transcript, alt text, publishing instructions, input/provenance manifest, QA record and editable source. |
| Final Story | One compact sticker area, no fake button; link points to supplied Beer Chronicles URL; no ticket link in bio. |
| Visual inspection unavailable | Record pending; do not claim visual QA passed. |
| Requested website SEO change | This campaign skill should not be selected or make website changes. |

## Technical checks

- YAML front matter: a descriptive `name` and `description`, with skill name matching the folder.
- All bundled resource paths exist; original/reference checksums match.
- Repeated renders with locked data/environment have the same decoded pixels.
- Pixel repeatability does not imply reference identity: compare the corrected template visually once.
- Ticket status is rechecked on the declared publication date, using Europe/Berlin rather than a guessed relative day.

## QA file convention

Start `qa.json` with honest pending states; change them only after the corresponding actual checks:

```json
{
  "visual_inspection": "pending",
  "factual_review": "pending",
  "repeatability": "pending",
  "colour_space": "pending",
  "notes": []
}
```

Each status is `pending`, `passed`, or `failed`. Add evidence, renderer versions, and comparison results to `notes` or additional fields. Passing the offline checker alone must not change factual or visual review to `passed`.
