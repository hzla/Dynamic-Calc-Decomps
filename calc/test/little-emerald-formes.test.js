"use strict";

if (typeof global.settings === "undefined") {
    global.settings = { type_chart: 8, typeChart: 8 };
}

var index_1 = require("../index");

describe("Little Emerald item formes", function () {
    test("Pokemon.getForme applies Little Emerald item-based forms", function () {
        var prevTitle = global.TITLE;
        global.TITLE = "Little Emerald - Hard Mode";
        try {
            expect(index_1.Pokemon.getForme(8, "Charcadet", "Malicious Armor")).toBe("Charcadet-Ghost");
            expect(index_1.Pokemon.getForme(8, "Charcadet", "Auspicious Armor")).toBe("Charcadet-Psychic");
            expect(index_1.Pokemon.getForme(8, "Snorunt", "Dusk Stone")).toBe("Snorunt-Ghost");
            expect(index_1.Pokemon.getForme(8, "Feebas", "Prism Scale")).toBe("Feebas-Fairy");
            expect(index_1.Pokemon.getForme(8, "Eevee", "Fire Stone")).toBe("Eevee-Fire");
            expect(index_1.Pokemon.getForme(8, "Eevee-Fire", "Leftovers")).toBe("Eevee");
        }
        finally {
            global.TITLE = prevTitle;
        }
    });
});
