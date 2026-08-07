"use strict";

var fs = require("fs");
var path = require("path");
var vm = require("vm");

function loadScriptContext(relativePath) {
  var absolutePath = path.resolve(__dirname, relativePath);
  var code = fs.readFileSync(absolutePath, "utf8");
  var context = vm.createContext({
    cleanString: function (value) {
      return String(value || "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    },
  });
  vm.runInContext(code, context, { filename: absolutePath });
  return context;
}

describe("Blaze Black 2 / Volt White 2 Redux save growth rates", function () {
  var context;

  beforeAll(function () {
    context = loadScriptContext("../../js/savereaders/enums.js");
  });

  afterEach(function () {
    delete context.TITLE;
  });

  test.each([
    [220, "Swinub", 0],
    [221, "Piloswine", 0],
    [314, "Illumise", 1],
    [473, "Mamoswine", 0],
    [511, "Pansage", 4],
    [512, "Simisage", 4],
    [513, "Pansear", 4],
    [514, "Simisear", 4],
    [515, "Panpour", 4],
    [516, "Simipour", 4],
  ])("uses the ROM growth rate for species %i %s", function (speciesId, speciesName, growthRate) {
    context.TITLE = "Blaze Black 2/Volt White 2 Redux";

    expect(context.resolveSavGrowthRateBySpeciesId(speciesId)).toBe(growthRate);
    expect(context.resolveSavGrowthRateBySpeciesName(speciesName)).toBe(growthRate);
  });

  test.each([
    "Blaze Black 2 Redux",
    "Volt White 2 Redux",
    "Volt White 2 Redux QoL",
    "bb2redux",
    "vw2qol",
  ])("recognizes the Redux title alias %s", function (title) {
    context.TITLE = title;
    expect(context.resolveSavGrowthRateBySpeciesId(515)).toBe(4);
  });

  test("imports the save's 3,930 EXP Panpour as level 17", function () {
    context.TITLE = "Blaze Black 2/Volt White 2 Redux";
    expect(context.resolveSavLevelFromExperience("Panpour", 3930)).toBe(17);
  });

  test("keeps vanilla growth rates outside Redux", function () {
    context.TITLE = "Black 2/White 2";

    expect(context.resolveSavGrowthRateBySpeciesId(220)).toBe(5);
    expect(context.resolveSavGrowthRateBySpeciesId(314)).toBe(2);
    expect(context.resolveSavGrowthRateBySpeciesId(515)).toBe(0);
    expect(context.resolveSavLevelFromExperience("Panpour", 3930)).toBe(15);
  });
});
