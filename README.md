```
docker build -t flashscore-api .
```

```
docker run -d --name flashscore-api --restart always -p 3000:3000 flashscore-api
```