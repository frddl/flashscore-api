module.exports = {
  apps : [{
    name   : "flashscore-api",
    script : "npm",
    args   : "run start",
    watch  : false, // optional: restarts the app if files change
    exec_mode: 'fork', // Use PM2's cluster mode for multi-core support
    instances: 1, // Automatically run as many instances as there are CPU cores
    max_memory_restart: '1G', // Restart the app if it exceeds 1GB memory
    error_file: "/dev/null"
  }]
};

