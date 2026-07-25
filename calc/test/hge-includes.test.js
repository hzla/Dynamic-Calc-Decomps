"use strict";

describe("shared HGE save include tables", function () {
  test("cover the expanded HGE species IDs used by saves", function () {
    var includes = require("../../js/savereaders/save_constants/hge_includes.js");

    expect(includes.poks[58]).toBe("growlithe");
    expect(includes.poks[101]).toBe("electrode");
    expect(includes.poks[181]).toBe("ampharos");
    expect(includes.poks[873]).toBe("corviknight");
    expect(includes.growths.length).toBe(includes.poks.length);
  });
});
