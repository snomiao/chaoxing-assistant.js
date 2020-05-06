#  超星助手
自动签到超星学习通网课，自动检查任务点、作业变动，并HTTP上报通知，支持多用户。

## 快速上手：
1. 环境准备：[安装Node.js]( https://nodejs.org/ )，然后进入命令行
2. 克隆源码：`git clone https://github.com/snomiao/chaoxing-assistant.js`
3. 进入目录：`cd chaoxing-assistant.js`
4. 安装本包：`npm install` 
1. 配置用户：复制 `config_demo.yaml`, 改名为 `config.yaml`，[然后根据你的需求替换文件内相应字段。](#配置文件说明)

```
学生列表:
  - 账号: '' # 手机号
    密码: '' # 密码
    # Server酱推送（推荐）
    报告地址: https://sc.ftqq.com/SCXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.send?text=%s&desp=%s
```
点击这里 [首页 | Server酱]( http://sc.ftqq.com/n ) 领取一个SCKEY，然后把上面的 `SCXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` 换成你拿到的 `SCKEY` 就可以了

4. 运行程序：`node ./`

如果不出意外的话，应该能看到正确输出
```
雪星喵：零基础入门雪星工具箱第12次作业待批阅，手势签到成功✅、签到成功✅。
```

## 源码安装：
1. 环境准备： [安装Node.js]( https://nodejs.org/en/ )
2. 克隆源码： `git clone https://github.com/snomiao/chaoxing-assistant.js && cd chaoxing-assistant.js`
3. 配置用户：复制 `config_demo.yaml`, 改名为 `config.yaml`，[然后根据你的需求替换文件内相应字段。](#配置文件说明)
4. 然后运行：`npm install && node ./`

## 配置文件说明
复制 `config_demo.yaml`, 改名为 `config.yaml`

### 进阶配置
```
学生列表:
  - 昵称: '雪星喵' 可选，你在推送消息里的称呼
    账号: '' # 手机号
    密码: '' # 密码
    报告地址:
      # Server酱推送（推荐）
      - https://sc.ftqq.com/SCXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.send?text=%s&desp=%s

      # QQ消息推送
      - https://your.domain.com:5700/send_msg?access_token=XXXXXXXXXXXXXXXXX&user_id=${你的QQ号}&message=【小雪喵】%s
      # QQ群推送
      - https://your.domain.com:5700/send_msg?access_token=XXXXXXXXXXXXXXXXX&group_id=${你的QQ号}&message=【小雪喵】%s
      # TG Bot 私聊推送
      - https://api.telegram.org/botXXXXXXXXXX:XXX_XXXXXXXXXXXXXXXXXXXXXXXXXX-XXX/sendMessage?chat_id=${BOT和你聊天的ID}&text=%s
      # ……
  - 昵称: '米酱' 可选，你在推送消息里的称呼
    账号: '' # 手机号
    密码: '' # 密码
```

### 上报地址讲解

除了Server酱之外，也可以使用其它的 HTTP 推送服务，例如CQHTTP、TGBOT等，请见下方详细解释。

#### Server酱 微信小程序推送 （新手推荐）

```
https://sc.ftqq.com/SCXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.send?text=%s&desp=%s
```
点击这里 [首页 | Server酱]( http://sc.ftqq.com/n ) 领取一个SCKEY，只需要把里面的`SCXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` 换成你拿到的 `SCKEY` 就可以了

#### CQHTTP（QQ机器人）

CoolQ HTTP 上报地址如下

```
http://stu.snomiao.com:5700/send_msg?access_token=XXXXXXXXXXXXXXXXXXXXXXXX&group_id=769584362&message=【小雪喵】%s
```

架设方法见 [首页 - CoolQ HTTP API 插件]( https://cqhttp.cc/ )

#### 电报机器人（Telegram机器人）
一个典型的电报机器人的上报地址如下
```
https://api.telegram.org/bot$$$$$$$$$$:xxx_xxxxxxxxxxxxxxxxxxxxxxxxxx-xxx/sendMessage?chat_id=${BOT和你聊天的ID}&text=%s
```

其中 `$$$$$$$$$$` 是你的 bot ID，`xxx_xxxxxxxxxxxxxxxxxxxxxxxxxx-xxx` 是你的访问令牌，`chat_id=${BOT和你聊天的ID}` 在对 Bot 发送 `/start` 之后可以通过 API 看到

详细说明请见 [教程|Telegram Bot 搭建 - 知乎]( https://zhuanlan.zhihu.com/p/59228574 )

## 部署自动签到
比如……每天 8点到17点，每隔 7 分钟自动运行

#### Linux
1. 终端输入 `crontab -e` 然后添加这行 `*/7 08-17 * * * /bin/bash /${你的项目路径}/launch.sh`

#### Windows
1. 开始菜单 - 运行 - 输入 `taskschd.msc` 回车，打开任务计划管理器
2. 然后图形化界面，添加本目录下的 `chaoxing-assistant.bat` 就可以了


## 免责声明
请自行脑补滥用代码被超星封号后被学校找麻烦哭诉无门的场景(/doge 🐶)

## 关于
作者：雪星(snomiao@gmail.com)
版权协议：GPLv3
技术交流群： 1067970377