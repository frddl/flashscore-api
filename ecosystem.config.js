module.exports = {
  apps : [{
    name   : "game-alerts-bot",
    script : "npm",
    args   : "run start",
    watch  : true, // optional: restarts the app if files change
  },{
    name   : "game-alerts-parser",
    script : "npm",
    args   : "run parser",
    watch  : true, // optional: restarts the app if files change
  }]
};

