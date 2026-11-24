const config = {
  gen: 5, damageGen: 5, typeChart: 5, critGen: 5, switchIn: 5, gameSwitchIn: 5,
  sourceType: "full", baseGame: "BW2", mechanics: "vanilla", customPoks: true,
};
const baseSet = {
  level: 50, ability: "Torrent", nature: "Hardy", item: "Fixture Vest", moves: ["Tackle", "Surf", "Protect", "Ice Beam"],
  battle_type: "Singles", sub_index: 0,
};
const data = {
  title: "Pokeweb opening field fixture",
  poks: {}, moves: {}, order: {}, trainers: {},
  formatted_sets: {
    Blastoise: {"Lvl 50 Ace Fixture": {...baseSet, tr_id: 4, weather: "Rain",
      fieldLeft: ["lightscreen"], fieldRight: ["reflect"], fieldGlobal: ["gravity", "trickroom"],
      spikesLeft: 2, toxicSpikesRight: 1, status: "brn", startingHpPercent: 51}},
    Wartortle: {"Lvl 50 Ace Fixture": {...baseSet, tr_id: 4, sub_index: 1, weather: "Rain",
      fieldLeft: ["lightscreen"], fieldRight: ["reflect"], fieldGlobal: ["gravity", "trickroom"], spikesLeft: 2, toxicSpikesRight: 1}},
    Charizard: {"Lvl 55 Ace Other": {...baseSet, level: 55, tr_id: 5, weather: "Clear"}},
  },
  pokewebBattleRules: {
    version: 1, baseGame: "BW2",
    names: {items: [[620, "Fixture Vest"]], abilities: [[173, "Fixture Ability"]]},
    items: [[620, {effects: [{kind: "specialDefense", value: 1.5}]}]],
    moveData: [], abilities: [], moves: [],
  },
};

describe("Pokeweb calculator imports", () => {
  const bridgeOrigin = "https://ddex.example.invalid";

  beforeEach(() => {
    cy.readFile("js/vendor/jquery.js").then(source => {
      cy.intercept({hostname: "ajax.googleapis.com", pathname: "**/jquery.min.js"}, {
        body: source, headers: {"content-type": "application/javascript"},
      });
    });
    cy.intercept({https: true, hostname: /^(?!ajax\.googleapis\.com$).+/}, {
      body: "window.kofiwidget2 ||= {init(){},draw(){}};", headers: {"content-type": "application/javascript"},
    });
    cy.intercept({hostname: "ajax.googleapis.com", pathname: "**/jquery-ui*"}, {statusCode: 204});
  });

  function visitCalculator(theme = 0) {
    cy.visit(`./index.html?dev=1&forceBlankConfig=1&gen=5&dmgGen=5&types=5&critGen=5&switchIn=5&mechanics=vanilla&ddexBridgeOrigin=${encodeURIComponent(bridgeOrigin)}&view=calculator&gen5ui=${theme}`, {
      onBeforeLoad(win) {
        win.opener = win.parent;
        win.localStorage.clear();
        win.localStorage.right = "Blastoise (Lvl 50 Ace Fixture)";
      },
    });
    cy.window().should(win => expect(win.eval("initializing")).to.eq(false));
  }

  it("imports field controls, HP and status and preserves manual edits within a trainer", () => {
    visitCalculator();
    cy.window().then(win => {
      win.dispatchEvent(new win.MessageEvent("message", {origin: bridgeOrigin, source: win.opener,
        data: {type: "ddex:calc-sync", config, backupData: data, fileName: "pokeweb-opening.js"},
      }));
    });
    cy.get("#rom-title").should("have.text", data.title);
    cy.window().should(win => expect(win.eval("initializing")).to.eq(false));
    cy.get("#rain, #gravity, #lightScreenL, #reflectR, #spikesL2, #pokeweb-trickroom").each(control => {
      cy.wrap(control).should("be.checked");
    });
    cy.get("#pokeweb-toxicspikesR").should("have.value", "1");
    cy.get("#statusR1").should("have.value", "Burned");
    cy.get("#itemR1").should("have.value", "Fixture Vest");
    cy.window().then(win => {
      const {calc} = win;
      const move = new calc.Move(5, "Surf");
      const options = {ability: "", item: "", moves: [move]};
      const attacker = new calc.Pokemon(5, "Blastoise", options);
      const field = new calc.Field();
      const unvested = calc.calculate(5, attacker, new calc.Pokemon(5, "Snorlax", options), move, field);
      const vested = calc.calculate(5, attacker, new calc.Pokemon(5, "Snorlax", {...options, item: "Fixture Vest"}), move, field);
      expect(vested.range()[1]).to.be.lessThan(unvested.range()[1]);
    });
    cy.get("#p2 .current-hp").then(input => {
      cy.get("#p2 .max-hp").then(max => expect(Number(input.val())).to.eq(Math.floor(Number(max.text()) * 0.51)));
    });
    cy.window().should(win => expect(win.eval("changingSets")).to.eq(false));
    cy.window().then(win => {
      win.$("#gravity").prop("checked", false);
      win.$("#p2 input.set-selector").val("Wartortle (Lvl 50 Ace Fixture)").change();
    });
    cy.get("#p2 .hp .base").should("have.value", "59");
    cy.get("#gravity").should("not.be.checked");
    cy.get("#reflectR").should("be.checked");
    cy.window().should(win => expect(win.eval("changingSets")).to.eq(false));
    cy.window().then(win => win.$("#p2 input.set-selector").val("Charizard (Lvl 55 Ace Other)").change());
    cy.get("#levelR1").should("have.value", "55");
    cy.get("#clear").should("be.checked");
    cy.get("#reflectR, #lightScreenL, #pokeweb-trickroom").each(control => cy.wrap(control).should("not.be.checked"));
    cy.get("#pokeweb-toxicspikesR").should("have.value", "0");
  });

  it("uses the stock inline checkbox and keeps multiple recipe triggers independent", () => {
    visitCalculator(1);
    cy.window().then(win => {
      const taken = {...data.formatted_sets.Blastoise["Lvl 50 Ace Fixture"], ability: "Fixture Ability", abilityId: 173};
      const fixture = {
        ...data, title: "Ability catalog fixture",
        formatted_sets: {...data.formatted_sets, Blastoise: {"Lvl 50 Ace Fixture": taken}},
        pokewebBattleRules: {
          ...data.pokewebBattleRules,
          names: {...data.pokewebBattleRules.names, abilities: [[173, "Fixture Ability"], [174, "Combined Fixture"], [175, "Passive Fixture"]]},
          abilities: [
            [174, {effects: [
              {kind: "abilityRecipe:statAction", value: 1, parameters: {activation: 0, stat: 2}},
              {kind: "abilityRecipe:windCharge", value: 2, parameters: {type: 12}},
            ]}],
            [175, {effects: [{kind: "attack", value: 1.5}]}],
          ],
          abilityTemplateCatalog: win.PokewebAbilityCatalog.fingerprint,
          abilityTemplates: [[173, 271]], // Anger Shell
        },
      };
      win.dispatchEvent(new win.MessageEvent("message", {origin: bridgeOrigin, source: win.opener,
        data: {type: "ddex:calc-sync", config, backupData: fixture, fileName: "ability-catalog.js"},
      }));
    });
    cy.get("#rom-title").should("have.text", "Ability catalog fixture");
    cy.window().should(win => expect(win.eval("initializing")).to.eq(false));
    cy.get("#abilityR1").should("have.value", "Fixture Ability");
    cy.get("#p2 .ability-toggles").should(group => expect(group.text().trim()).to.eq(""));
    cy.get("#p2 .abilityToggle").should("be.visible").and("have.attr", "title", "After crossing the HP threshold");
    cy.get("#p2 .abilityToggle").check().should("be.checked");
    cy.window().then(win => {
      const active = win.createPokemon(win.$("#p2"));
      expect(active.pokewebAbilityId).to.eq(173);
      expect(active.pokewebAbilityActive).to.deep.eq({0: true});
      expect(active.abilityOn).to.eq(false);
      expect(win.eval("backup_data").pokewebBattleRules.abilityTemplates).to.eq(undefined);
    });
    cy.get("#abilityR1").select("Combined Fixture");
    cy.get("#p2 .ability-toggles input").should(checkboxes => {
      expect(checkboxes).to.have.length(2);
      const [first, second] = [...checkboxes].map(box => box.getBoundingClientRect());
      expect(second.width).to.eq(first.width);
      expect(second.height).to.eq(first.height);
      expect(second.top).to.eq(first.top);
      expect(second.left).to.be.greaterThan(first.left);
    });
    cy.get("#p2 .abilityToggle").should("not.be.checked");
    cy.get("#p2 .ability-effect-toggle").should("be.visible").and("have.attr", "aria-label", "Charged");
    cy.get("#p2 .ability-effect-toggle").check();
    cy.window().then(win => {
      expect(win.createPokemon(win.$("#p2")).pokewebAbilityActive).to.deep.eq({1: true});
    });
    cy.get("#abilityR1").select("Passive Fixture");
    cy.get("#p2 .ability-toggles").should("not.be.visible");
    cy.get("#abilityR1").select("Intimidate");
    cy.get("#p2 .abilityToggle").should("be.visible").and("not.have.attr", "data-effect-index");
    cy.get("#p2 .abilityToggle").check();
    cy.window().then(win => expect(win.createPokemon(win.$("#p2")).abilityOn).to.eq(true));
    cy.window().should(win => expect(win.eval("changingSets")).to.eq(false));
    cy.window().then(win => win.$("#p2 input.set-selector").val("Wartortle (Lvl 50 Ace Fixture)").change());
    cy.get("#p2 .ability-toggles").should("not.be.visible");
  });
});
