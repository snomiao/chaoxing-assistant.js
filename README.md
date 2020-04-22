# ChaoxingAutoSign.js
超星自动签到

## get started:
```
npm install
node index.js
```

## Deploy auto sign
1. Type `crontab -e` in your terminal
2. And add this:
```
*/5 08-17 * * * /bin/bash /root/ChaoxingAutoSign.js/launch.sh
```