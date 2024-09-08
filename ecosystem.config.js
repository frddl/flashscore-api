module.exports = {
  apps : [{
    name   : "flashscore-api",
    script : "npm",
    args   : "run start",
    watch  : true, // optional: restarts the app if files change
    exec_mode: "cluster", // Use PM2's cluster mode for multi-core support
    instances: "max", // Automatically run as many instances as there are CPU cores
    max_memory_restart: "512M", // Restart the app if it exceeds 512M memory
  }]
};

