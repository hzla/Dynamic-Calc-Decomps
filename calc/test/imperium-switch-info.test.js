"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function loadSettings(title) {
    const states = new Map();
    const handlers = new Map();
    const context = {
        TITLE: title,
        localStorage: { switchInfo: "1", filterSaveFile: "1", filterAbilities: "1", randomized: "1", alerted: "1" },
        location: { reload: jest.fn() }, alert: jest.fn(), refresh_next_in: jest.fn(),
        $: selector => {
            if (!states.has(selector)) states.set(selector, typeof selector === "object" ? selector : {});
            const state = states.get(selector);
            const api = {
                on(event, handler) { handlers.set(`${selector}:${event}`, handler); return api; },
                click() { return api; },
                toggle(visible) { state.visible = visible; return api; },
                hide() { state.visible = false; return api; },
                prop(key, value) { if (value === undefined) return state[key]; state[key] = value; return api; },
                css(key, value) { state[key] = value; return api; },
                toggleClass(key, value) { state[key] = value; return api; },
            };
            return api;
        },
    };
    context.window = context;
    vm.runInNewContext(fs.readFileSync(path.resolve(__dirname, "../../js/calc_ui/menu_settings.js"), "utf8"), context);
    return { context, states, change: handlers.get("#toggle-switch-info input:change") };
}

describe("Imperium Advanced Switch Info", () => {
    test.each([undefined, "", "NONE"])("does not erase saved settings before the title resolves (%s)", title => {
        const { context, states } = loadSettings(title);
        context.applyImperiumOnlySettingsVisibility();
        expect(context.localStorage.switchInfo).toBe("1");
        expect(context.localStorage.filterSaveFile).toBe("1");
        expect(context.localStorage.filterAbilities).toBe("1");
        expect(context.localStorage.randomized).toBe("1");
        context.TITLE = "Emerald Imperium 1.3";
        context.applyImperiumOnlySettingsVisibility();
        expect(states.get("#toggle-switch-info").visible).toBe(true);
        expect(context.localStorage.switchInfo).toBe("1");
    });

    test("retains the existing reset behavior for a resolved unsupported game", () => {
        const { context, states } = loadSettings("Renegade Platinum");
        context.applyImperiumOnlySettingsVisibility();
        expect(states.get("#toggle-switch-info").visible).toBe(false);
        expect(context.localStorage.switchInfo).toBe(0);
        expect(context.localStorage.randomized).toBe(0);
    });

    test("uses the actual checkbox state, refreshes details and never reloads", () => {
        const { context, states, change } = loadSettings("Emerald Imperium 1.3");
        const input = { checked: true };
        context.localStorage.switchInfo = "0";
        change.call(input);
        expect(context.localStorage.switchInfo).toBe("1");
        expect(states.get(".trainer-pok-list.opposing")["ai-show"]).toBe(true);
        expect(states.get("#dynamic-type-bug").display).toBe("flex");
        input.checked = false;
        change.call(input);
        expect(context.localStorage.switchInfo).toBe("0");
        expect(states.get(".trainer-pok-list.opposing")["ai-show"]).toBe(false);
        expect(states.get("#dynamic-type-bug").display).toBe("none");
        expect(context.refresh_next_in).toHaveBeenCalledTimes(2);
        expect(context.location.reload).not.toHaveBeenCalled();
    });

    test("keeps the experimental-feature warning once per browser", () => {
        const { context, change } = loadSettings("Emerald Imperium 1.3");
        delete context.localStorage.alerted;
        change.call({ checked: true });
        change.call({ checked: true });
        expect(context.alert).toHaveBeenCalledTimes(1);
        expect(context.localStorage.alerted).toBe(1);
    });
});
