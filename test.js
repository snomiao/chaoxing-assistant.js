const {
    学生登录有效检查,
    学生登录,
    学生基本资料填充,
    学生课程表填充,
    学生网课巡视,
} = require('./chaoxing-assistant.js')

!module.parent && (async () => {
    // var 学生 = Object.values(缓存.学生表)[1]
    var 学生 = { 账号: '...', 密码: '...' }
    // 学生登录
    var re = await 学生登录有效检查(学生)
    console.assert(re === false);
    var re = await 学生登录(学生)
    console.assert(re === "登录成功") // 填入 { 'Cookie': ... }
    var re = await 学生登录有效检查(学生)
    console.assert(re === true);
    var re = await 学生登录(学生)
    console.assert(re === "登录有效");
    // 学生昵称填充、学生基本资料填充
    var re = await 学生基本资料填充(学生) // 填入 { '性别': '女', '学号': 'xxxxxxxxxx', 't基本资料': 1588xxxxx5754 }
    console.assert(re === "基本资料刷新");
    var re = await 学生基本资料填充(学生)
    console.assert(re === "基本资料有效");
    // 学生课程表填充
    var re = await 学生课程表填充(学生) // 填入 { '课程表': { "xxxx": { '名称':  'xxx', ...}, ...} }
    console.assert(re === "课程表刷新");
    var re = await 学生课程表填充(学生)
    console.assert(re === "课程表有效");
    // 对签到任务签到, 对学生课程签到, 学生课程任务检查, 向学生报告，学生网课巡视
    var re = await 学生网课巡视(学生)
    // ,
    console.log(学生.课程表);
})().then(console.log()).catch(console.error)

