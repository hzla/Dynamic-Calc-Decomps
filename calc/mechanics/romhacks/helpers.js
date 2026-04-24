"use strict";
exports.__esModule = true;

var HOOK_NAMES = [
    "beforeStats",
    "afterMoveType",
    "typeEffectiveness",
    "moveBasePower",
    "basePowerMods",
    "attackMods",
    "defenseMods",
    "baseDamage",
    "finalMods",
    "beforeFinalDamage"
];
exports.HOOK_NAMES = HOOK_NAMES;

function normalizeHooks(hooks) {
    var normalized = {};
    for (var i = 0; i < HOOK_NAMES.length; i++) {
        var name_1 = HOOK_NAMES[i];
        var hook = hooks && hooks[name_1];
        normalized[name_1] = Array.isArray(hook) ? hook : hook ? [hook] : [];
    }
    return normalized;
}
exports.normalizeHooks = normalizeHooks;

function makeProfile(profile) {
    profile.hooks = normalizeHooks(profile.hooks || {});
    return profile;
}
exports.makeProfile = makeProfile;

function runHooks(profile, name, ctx) {
    var hooks = ((profile && profile.hooks) || {})[name] || [];
    for (var i = 0; i < hooks.length; i++) {
        hooks[i](ctx);
    }
}
exports.runHooks = runHooks;

function applyValueHooks(profile, name, ctx, value) {
    var hooks = ((profile && profile.hooks) || {})[name] || [];
    for (var i = 0; i < hooks.length; i++) {
        var next = hooks[i](ctx, value);
        if (next !== undefined) {
            value = next;
        }
    }
    return value;
}
exports.applyValueHooks = applyValueHooks;

function pushMod(mods, mod) {
    mods.push(mod);
    return mods;
}
exports.pushMod = pushMod;

function hasTitle(ctx, text) {
    return String((ctx && ctx.title) || "").indexOf(text) !== -1;
}
exports.hasTitle = hasTitle;

var vanillaProfile = makeProfile({
    id: "vanilla",
    gens: [],
    titleMatchers: [],
    hooks: {}
});
exports.vanillaProfile = vanillaProfile;

