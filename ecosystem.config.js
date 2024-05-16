module.exports = {
    apps: [
      {
        name: 'flashscore-api',
        script: 'npm',
        args: 'run start',
        cwd: './app',
        watch: true,
        autorestart: true,
      },
    ],
  };
  