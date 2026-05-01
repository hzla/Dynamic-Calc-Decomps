"use strict";
exports.__esModule = true;

var helpers_1 = require("./helpers");
var cascade_white_1 = require("./profiles/cascade-white");
var platinum_kaizo_1 = require("./profiles/platinum-kaizo");
var unbound_1 = require("./profiles/unbound");

var profiles = [
    cascade_white_1.cascadeWhiteProfile,
    platinum_kaizo_1.platinumKaizoProfile,
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
