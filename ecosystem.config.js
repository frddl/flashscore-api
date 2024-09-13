module.exports = {
  apps : [{
    name: "flashscore-api",
    script: "npm",
    args: "run start",
    watch: false, // Optional: restarts the app if files change
    exec_mode: 'cluster', // Use PM2's cluster mode to enable multi-threading
    instances: "max", // Run as many instances as there are CPU cores
    max_memory_restart: '1G', // Restart the app if it exceeds 1GB memory
    restart_delay: 5000, // Restart the app after 5 seconds if it crashes
    max_restarts: 10, // Attempt 10 restarts before giving up
    exp_backoff_restart_delay: 100, // Exponential delay between restarts
    listen_timeout: 10000, // Wait 10 seconds for app to listen before restarting
    kill_timeout: 3000, // Gracefully kill the app after 3 seconds
    out_file: "./logs/pm2-out.log", // Standard output log file
    error_file: "./logs/pm2-error.log", // Error log file
    log_date_format: "YYYY-MM-DD HH:mm:ss Z", // Format for log timestamps
    combine_logs: true, // Combine logs from all instances into one file
    autorestart: true, // Automatically restart the app if it crashes
    min_uptime: "60s", // Minimum uptime before considering an app as unstable
    shutdown_with_message: true, // Graceful shutdown with message
    env: {
      NODE_ENV: "production", // Environment variables for production
      PORT: 3000
    },
    env_development: {
      NODE_ENV: "development", // Environment variables for development
      PORT: 3000
    },
    // Optionally: set limits on CPU usage if desired
    max_cpu_usage: 80, // Restart the app if CPU usage exceeds 80%
    merge_logs: true, // Merge logs for all instances
  }]
};
