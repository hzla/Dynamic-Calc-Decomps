"use strict";
exports.__esModule = true;

var helpers_1 = require("./helpers");
var cascade_white_1 = require("./profiles/cascade-white");
var little_emerald_1 = require("./profiles/little-emerald");
var platinum_kaizo_1 = require("./profiles/platinum-kaizo");
var platinum_redux_1 = require("./profiles/platinum-redux");
var unbound_1 = require("./profiles/unbound");

var profiles = [
    cascade_white_1.cascadeWhiteProfile,
    little_emerald_1.littleEmeraldProfile,
    platinum_kaizo_1.platinumKaizoProfile,
    platinum_redux_1.platinumReduxProfile,
    unbound_1.unboundProfile
];

function isValidProfile(profile) {
    return !!(profile &&
        Array.isArray(profile.gens) &&
        Array.isArray(profile.titleMatchers) &&
        profile.hooks);
}

function titleMatches(title, matcher) {
    title = String(title || "");
    if (matcher.equals !== undefined) {
        return title === matcher.equals;
    }
    if (matcher.includes !== undefined) {
        return title.indexOf(matcher.includes) !== -1;
    }
    if (matcher.regex) {
        return matcher.regex.test(title);
    }
    return false;
}

function getMechanicsProfile(title, genNum) {
    for (var i = 0; i < profiles.length; i++) {
        var profile = profiles[i];
        if (!isValidProfile(profile)) {
            continue;
        }
        if (profile.gens.length && profile.gens.indexOf(genNum) === -1) {
            continue;
        }
        for (var j = 0; j < profile.titleMatchers.length; j++) {
            if (titleMatches(title, profile.titleMatchers[j])) {
                return profile;
            }
        }
    }
    return helpers_1.vanillaProfile;
}
exports.getMechanicsProfile = getMechanicsProfile;
exports.romhackProfiles = profiles.filter(isValidProfile);
