# ChaoxingAutoSign.js
自动签到超星网课

自动识别多

## get started:
Copy `config_demo.yaml`, rename to `config.yaml`，and replace values to yours.

```
npm install
node index.js
```

### 2. Deploy auto sign

1. Type `crontab -e` in your terminal
2. And add this:
```
*/5 08-17 * * * /bin/bash /root/ChaoxingAutoSign.js/launch.sh
```