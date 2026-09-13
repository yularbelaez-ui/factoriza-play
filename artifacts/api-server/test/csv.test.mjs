import test from "node:test";
import assert from "node:assert/strict";
import { csvCell } from "../.csv.test.mjs";

test("prefixes spreadsheet formulas while preserving normal CSV cells", () => {
  for (const value of ["=SUM(A1:A2)", " +1", "-10", "@user"]) {
    assert.equal(csvCell(value).startsWith("\"'"), true, value);
  }
  assert.equal(csvCell("normal"), "\"normal\"");
  assert.equal(csvCell("a\"b"), "\"a\"\"b\"");
});