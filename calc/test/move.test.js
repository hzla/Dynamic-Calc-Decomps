"use strict";
exports.__esModule = true;
var index_1 = require("../index");
describe('Move', function () {
    test('Ancestral X Return stays at 102 BP despite overrides', function () {
        var originalTitle = global.TITLE;
        var options = { basePower: 40, overrides: { basePower: 1 } };
        try {
            global.TITLE = 'Ancestral X';
            var move = new index_1.Move(8, 'Return', options);
            expect(move.bp).toBe(102);
            expect(move.clone().bp).toBe(102);
            expect(new index_1.Move(8, 'Frustration', options).bp).toBe(40);
            global.TITLE = 'Other Game';
            expect(new index_1.Move(8, 'Return', options).bp).toBe(40);
        } finally {
            if (originalTitle === undefined) delete global.TITLE;
            else global.TITLE = originalTitle;
        }
    });

    test('clone', function () {
        var m = new index_1.Move(7, 'Blizzard', { useZ: true });
        expect(m.name).toBe('Subzero Slammer');
        expect(m.bp).toBe(185);
        var clone = m.clone();
        expect(clone.name).toBe('Subzero Slammer');
        expect(clone.bp).toBe(185);
    });
});
//# sourceMappingURL=move.test.js.map
