"use strict";

function installDomStubs() {
  const chain = {
    ready: function () { return chain; },
    click: function () { return chain; },
    val: function () { return ""; },
    text: function () { return ""; },
    find: function () { return chain; },
    first: function () { return chain; },
    show: function () { return chain; },
    hide: function () { return chain; },
    html: function () { return chain; },
    after: function () { return chain; },
    remove: function () { return chain; },
    append: function () { return chain; },
    is: function () { return false; },
    length: 0,
  };

  global.document = {};
  global.$ = function () { return chain; };
}

describe("Gen 5 save editor move replacement IDs", function () {
  let reader;
  let moveNames;
  const cascadeReplacements = {
    sharpen: "nuzzle",
    boltstrike: "zingzap",
  };

  beforeEach(function () {
    jest.resetModules();
    installDomStubs();
    reader = require("../../js/savereaders/savereader.js").__test;
    moveNames = Array(717).fill("");
    moveNames[33] = "Tackle";
    moveNames[159] = "Sharpen";
    moveNames[550] = "Bolt Strike";
    moveNames[609] = "Nuzzle";
    moveNames[716] = "Zing Zap";
  });

  test("writes Cascade replacement names to their repurposed vanilla IDs", function () {
    expect(reader.resolveDsSaveMoveId("Nuzzle", cascadeReplacements, moveNames)).toBe(159);
    expect(reader.resolveDsSaveMoveId("Zing Zap", cascadeReplacements, moveNames)).toBe(550);
  });

  test("normalizes spacing, punctuation, and case in replacement maps", function () {
    expect(reader.resolveDsSaveMoveId("ZING-ZAP", cascadeReplacements, moveNames)).toBe(550);
    expect(reader.resolveDsSaveMoveId("nuzzle", cascadeReplacements, moveNames)).toBe(159);
  });

  test("preserves ordinary move lookup behavior", function () {
    expect(reader.resolveDsSaveMoveId("Tackle", cascadeReplacements, moveNames)).toBe(33);
    expect(reader.resolveDsSaveMoveId("Unknown Move", cascadeReplacements, moveNames)).toBe(-1);
  });
});
