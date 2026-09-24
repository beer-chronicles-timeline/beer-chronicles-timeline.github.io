import assert from "node:assert/strict";
import test from "node:test";
import { parseHistoricalYear } from "../src/lib/yearInput";
test("historical year drafts accept complete nonzero safe integers and BCE notation", () => {
  for (const [text, year] of [[" 1800 ", 1800], ["+1800", 1800], ["-1800", -1800], ["1800 BC", -1800], ["1bce", -1]] as const) assert.equal(parseHistoricalYear(text), year);
  for (const text of ["", " ", "0", "-0", "0 BCE", "1,800", "1800junk", "1800.5", "1e3", "-1800 BC", "9007199254740992"]) assert.equal(parseHistoricalYear(text), null, text);
});
