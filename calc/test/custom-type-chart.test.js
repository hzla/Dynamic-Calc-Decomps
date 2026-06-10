"use strict";

global.settings = { type_chart: 6, typeChart: 6 };

var types = require("../data/types");

describe("custom type charts", function () {
    test("registers backup-provided charts for TYPE_CHART and Types lookup", function () {
        var chart = {
            Normal: { Normal: 0.5, Ghost: 0 },
            Ghost: { Normal: 0, Ghost: 2 }
        };

        var chartId = types.registerCustomTypeChart(chart, 13);
        var customTypes = new types.Types(chartId);

        expect(chartId).toBe(13);
        expect(types.TYPE_CHART[chartId]).toBe(chart);
        expect(customTypes.get("normal").effectiveness.Normal).toBe(0.5);
        expect(customTypes.get("ghost").effectiveness.Ghost).toBe(2);
    });
});
