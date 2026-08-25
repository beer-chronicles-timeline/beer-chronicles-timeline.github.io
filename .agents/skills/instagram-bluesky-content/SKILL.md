---
name: instagram-bluesky-content
description: "Create the complete Beer Chronicles social package for a topic: an approved Instagram image, a longer Instagram caption with alt text, and a shorter Bluesky post with a relevant Beer Chronicles link."
---

# Beer Chronicles Instagram and Bluesky Content

Create one coordinated social package:

1. Instagram image;
2. Instagram caption;
3. Instagram alt text;
4. shorter Bluesky post with the relevant Beer Chronicles link.

Follow all repository `AGENTS.md` instructions.

## Source of truth

Beer Chronicles and currently verified sources—not AI memory—supply historical facts. Never invent, approximate, embellish, or silently rewrite dates, events, chronology, titles, historical claims, or sources.

For feature posts, inspect the actual interface. Never depict an invented UI element or claim a feature exists without verifying it.

## Visual-family classification

Classify the post before designing it. Use exactly one established family:

1. **Historical / Heritage** — older beer history, historical Storylines, thematic collections, and heritage-focused entries.
2. **Feature / UX** — website functionality, interface improvements, discovery tools, or editorial features.
3. **Science / Technology** — scientific, technical, analytical, measurement, laboratory, brewing-process, microbiology, chemistry, instrumentation, standardization, or process-control Storylines.

Do not mix these visual languages. Do not create a fourth family unless the user explicitly requests one.

## Historical and Storyline workflow

For Historical / Heritage and Science / Technology posts:

1. Open and inspect the canonical live Beer Chronicles topic or Storyline.
2. Extract candidate milestones and verify their exact published dates, titles, and chronology.
3. Propose the milestone list to the user.
4. **Obtain explicit user approval of the milestone selection.**
5. Only after that approval, generate the image.
6. Inspect the generated result for exact text, chronology, spelling, legibility, composition, branding, and unsupported imagery.
7. Iterate with the user.
8. Obtain explicit approval of the exact final image.
9. Store only that approved image according to the storage rules below.
10. Prepare the Instagram caption.
11. Prepare Instagram alt text.
12. Prepare the Bluesky post.

Do not generate the historical or Storyline image before milestone approval.

### Historical / Heritage design

- Use the established dark, atmospheric, warm-gold, premium historical timeline aesthetic represented by successful posts such as Gose, Malt, Yeast, and Kölsch.
- Show a large Storyline title, prominent readable timeline, relevant atmospheric artwork, and Beer Chronicles branding.
- Timeline text contains only the canonical date and canonical event title. Copy both exactly; do not paraphrase, shorten, change capitalization, or improve wording.
- Five milestones is the default. Use six only when readability remains excellent and seven only when clearly justified.
- Select a balanced arc such as origin, development, turning point, and legacy rather than merely the first or latest entries.
- Artwork supports the history without competing with text or implying unsupported historical details.
- Design around the fixed canonical text. Remove a milestone, enlarge the text area, simplify artwork, or adjust composition instead of shrinking or rewriting text.

### Science / Technology design

- Follow the same canonical milestone, approval, and timeline-text rules as Historical / Heritage posts.
- Preserve the established Measurement and Quality Control direction: dark navy, charcoal, or black; Beer Chronicles gold; cool blue/cyan accents; precise modern analytical atmosphere; structured layout; and subtle technical overlays.
- Scientific glassware, thermometers, hydrometers, microscopes, scales, process charts, calibration marks, blueprint lines, and similar motifs may support the topic when accurate.
- The timeline remains the content center. Dates and titles must dominate auxiliary diagrams and side illustrations.
- Keep technical material quiet and secondary. Do not let visual complexity shrink milestone text.
- Align numbered markers cleanly with their date/title blocks when used.

## Feature / UX workflow

Feature posts do not require a historical milestone gate:

1. Inspect the actual feature and interface wording.
2. Determine the benefit-led visual concept.
3. Use a real screenshot, faithful crop, or actual interface material where appropriate.
4. Generate or compose the image.
5. Inspect factual/UI accuracy, legibility, hierarchy, and branding.
6. Iterate with the user.
7. Obtain explicit approval of the exact final image.
8. Store only that approved image.
9. Prepare the Instagram caption.
10. Prepare Instagram alt text.
11. Prepare the Bluesky post.

### Feature / UX design

- Preserve the established Help Improve Beer History direction: white background, black typography, Beer Chronicles gold accents, generous whitespace, clean modern interface aesthetic, and minimal clutter.
- Make the actual feature the central visual element. Crop aggressively enough that the feature remains readable on a phone.
- Highlight the new element clearly with a gold border, subtle glow, enlargement, arrow, underline, whitespace, or another restrained callout.
- Lead with the user benefit rather than the implementation detail.
- A useful hierarchy is Beer Chronicles branding, feature/update label, benefit-led headline, one short explanatory sentence, real screenshot, highlighted element, up to three short benefits, and the website URL.
- Preserve important real interface labels exactly. Do not turn the poster into technical documentation.

## Shared image rules

- Use 4:5 portrait format, ideally 1080 × 1350 pixels, with safe margins.
- Communicate one central message. A scrolling viewer should recognize Beer Chronicles, the topic, and the visual family quickly.
- Include `beer-chronicles.org` prominently but unobtrusively.
- Keep Beer Chronicles name/logo, gold, strong typography, premium editorial quality, spacing, and footer/website treatment recognizable across all families.
- Make all important text comfortably readable on a normal smartphone without zooming. Remove content rather than shrinking it.
- AI may illustrate, but Beer Chronicles supplies historical facts and real UI.

Before presenting a candidate as final, verify:

- 4:5 format and safe margins;
- smartphone readability and hierarchy;
- correct family and preserved reference system;
- exact canonical dates/titles or real interface wording;
- chronology, spelling, branding, and website URL;
- no invented facts, UI, or unnecessary tiny text.

## Approval and image storage

Do not save drafts or previews to a final approved path.

After the user explicitly approves the **exact final image**, save it as:

`insta-post-images/<filename>.png`

Create a human-readable filename in the established style:

- Title Case;
- words separated by hyphens;
- genuine Unicode such as `ö` preserved rather than transliterated;
- punctuation unsuitable for filenames removed;
- Unicode normalized consistently before writing.

Examples: `British-Ale-Beyond-IPA.png`, `Kölsch.png`, `Measurement-and-Quality-Control.png`.

If the target already exists, do not overwrite it. Tell the user and obtain explicit overwrite approval. After saving, verify that the written PNG is the exact approved image and that its file type, dimensions, and aspect ratio are correct.

## Instagram caption

Write the caption in English unless another language is requested. It should be informative, historically precise, accessible to a broad beer/history audience, engaging without clickbait or fabricated drama, and normal/long social-post length without becoming bloated.

- Use minimal or no emoji unless clearly appropriate.
- Use zero to three genuinely useful hashtags.
- Include a natural pointer to the current relevant Beer Chronicles page, filter, or Storyline. Inspect the current URL; never invent one.
- Keep factual claims within the verified evidence and disclose meaningful uncertainty.

## Instagram alt text

Provide useful alt text for the approved image. Describe the meaningful visual information, topic, design, and readable content needed to understand the image. Avoid keyword stuffing and decorative detail that does not aid understanding.

## Bluesky post

Write a shorter, punchier version that stands alone and remains as accurate as the Instagram caption.

- Keep it within Bluesky's current character limit, verifying the limit at execution time when needed.
- Use minimal or no emoji and zero to two useful hashtags.
- **Every Bluesky post must include the relevant current Beer Chronicles link.** This is mandatory. Count the link within the finished post limit and choose the most relevant verified Beer Chronicles URL for the topic.

## Capability and completion

Use available Codex image-generation or editing capability. Do not install an image framework, repository dependency, or substitute mechanism automatically. If the required capability is unavailable, report the limitation and stop.

The skill never edits itself. If a repeatable lesson emerges, report what was learned, why it might deserve permanence, and a proposed skill change. The user decides whether the skill changes.

Complete the workflow only when the approved image is safely stored and the Instagram caption, alt text, and Bluesky post are ready. Report the stored path and any remaining limitations.
