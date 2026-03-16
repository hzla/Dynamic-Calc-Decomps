const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on) {
      on('task', {
        warn(message) {
          console.warn(`⚠️ Warning: ${message}`);
          return null;
        }
      });
    },
    viewportWidth: 1920,
    viewportHeight: 1080,
    experimentalStudio: true,
    testIsolation: false,
  },
  env: {
  	calcs: [
	  {
	    title: "Emerald Imperium 1.3",
	    url: './index.html?data=imp13&dmgGen=8&gen=8&types=6&evs=0',
	    testTrainer: 'Cynthia',
	    testTrainerMonFirstMove: 'Surf',
	    save: 'rp_test'
	  },
    // {
    //   title: "Pokemon Null",
    //   url: './index.html?data=null',
    //   testTrainer: 'Flint',
    //   testTrainerMonFirstMove: 'Fire Blast',
    //   save: 'rp_test'
    // },
    // {
    //   title: "Platinum Kaizo",
    //   url: './index.html?data=pk',
    //   testTrainer: 'Flint',
    //   testTrainerMonFirstMove: 'Fire Blast',
    //   save: 'rp_test'
    // }
	]
  }

});
