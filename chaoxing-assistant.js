const { default: fetch_raw } = require('node-fetch');
const { assert } = require('console');
const 睡 = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const 限速函数 = (函, 间隔 = 1000) => {
    var t上次执行 = null
    return async (...参数) => {
        while (t上次执行 && t上次执行 + 间隔 > +new Date()) {
            await 睡(Math.max(0, t上次执行 + 间隔 - +new Date()));
        }
        t上次执行 = +new Date()
        return await 函(...参数)
    }
}
const 观察函数 = (函, 范围) => {
    return async (...参数) => {
        var 返回 = await 函(...参数).catch(e => {
            console.error('(', 参数, ') => ERROR');
            throw e
        })
        // console.log('(', 参数, ') =>', 返回);
        return 返回
    }
}
// const fetch = 观察函数(限速函数(fetch_raw, 1000))
const fetch = 观察函数(限速函数(fetch_raw, 200))

const 通用headers = {
    // 'Accept-Encoding': 'gzip, deflate',
    // 'Accept-Language': 'zh-CN,zh;q=0.9',
    // 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.100 Safari/537.36'
}

const 深合并 = (的, 源) =>
    (的 instanceof Object && 源 instanceof Object)
        ? (Object.keys(源).forEach(k => 的[k] = 深合并(的[k], 源[k])), 的)
        : (undefined === 源 ? 的 : 源)
const 变沿检测器 = (初始值) => (新值) => (初始值 != 新值 ? (初始值 = 新值) : undefined)
const 异步键映射 = async (obj, f) => await Promise.all(Object.keys(obj).map(f))
const 异步值映射 = async (obj, f) => await Promise.all(Object.values(obj).map(f))
const 异步对键值映射 = async (obj, f) => Object.fromEntries(await Promise.all(Object.entries(obj).map(f)))

const 正则全部提取 = (str, reg) => {
    if (!reg.global) return null
    var coll = [];
    while ((e => e && coll.push(e))(reg.exec(str)));
    return coll
}

const 提取为表 = (HTML, 正则表达式, 键值对函数) => ({ ...Object.fromEntries(正则全部提取(HTML, 正则表达式).map(键值对函数)) })
const 向学生报告 = async (学生, 内容 = '') => await Promise.all([学生.报告地址 || []].flat().map(地址 => fetch(encodeURI(地址.replace(/%s/g, 内容)))))
const 学生fetch = async (学生, url) => await fetch(url, { headers: { ...通用headers, Cookie: 学生.Cookie || '' }, redirect: "error" })
const 学生GETHTML = async (学生, url) => await 学生fetch(学生, url).catch(e => { throw '请求失败/' + url + JSON.stringify(e) }).then(e => e.text())

// 请求地址获取
const 登录地址获取 = ({ 账号, 密码, schoolid = '', verify = 0 }) =>
    `https://passport2.chaoxing.com/api/login?name=${encodeURIComponent(账号)}&pwd=${encodeURIComponent(密码)}&schoolid=${schoolid}&verify=${verify}`
const 应用中心地址获取 = () =>
    `http://i.mooc.chaoxing.com/app/myapps.shtml`
const 账号管理地址获取 = () =>
    `http://i.mooc.chaoxing.com/settings/info?t=${+new Date()}`
const 课程表地址获取 = () =>
    `https://mooc1-1.chaoxing.com/visit/interaction?t=${+new Date()}`
const 课程首页地址获取 = ({ courseId, classId, enc }) =>
    `http://mooc1-1.chaoxing.com/mycourse/studentcourse?courseId=${courseId}&vc=1&clazzid=${classId}&enc=${enc}`
const 课程任务地址获取 = ({ courseId, classId }) =>
    `http://mobilelearn.chaoxing.com/widget/pcpick/stu/index?courseId=${courseId}&jclassId=${classId}`
const 普通签到地址获取 = ({ courseId, classId, activeId, fid = '' }) =>
    `http://mobilelearn.chaoxing.com/widget/sign/pcStuSignController/preSign?activeId=${activeId}&classId=${classId}&fid=${fid}&courseId=${courseId}`
const 手势签到地址获取 = ({ courseId, classId, activeId }) =>
    `http://mobilelearn.chaoxing.com/widget/sign/pcStuSignController/signIn?&courseId=${courseId}&classId=${classId}&activeId=${activeId}`
const 课程资料地址获取 = ({ courseId, classId, enc, cpi, openc }) =>
    `http://mooc1-1.chaoxing.com/coursedata?classId=${classId}&courseId=${courseId}&type=1&ut=s&enc=${enc}&cpi=${cpi}&openc=${openc}"`
const 课程通知地址获取 = ({ courseId, classId, enc, cpi, openc }) =>
    `http://mooc1-1.chaoxing.com/schoolCourseInfo/getNotifyList?courseId=${courseId}&classId=${classId}&ut=s&enc=${enc}&cpi=${cpi}&openc=${openc}`
const 课程作业地址获取 = ({ courseId, classId, enc, cpi, openc }) =>
    `http://mooc1-1.chaoxing.com/work/getAllWork?classId=${classId}&courseId=${courseId}&isdisplaytable=2&mooc=1&ut=s&enc=${enc}&cpi=${cpi}&openc=${openc}`
const 课程考试地址获取 = ({ courseId, classId, enc, cpi, openc }) =>
    `http://mooc1-1.chaoxing.com/exam/test?classId=${classId}&courseId=${courseId}&ut=s&enc=${enc}&cpi=${cpi}&openc=${openc}`
const 课程讨论地址获取 = ({ courseId, classId, enc, cpi, openc }) =>
    `http://mooc1-1.chaoxing.com/bbscircle/grouptopic?courseId=${courseId}&clazzid=${classId}&showChooseClazzId=${classId}&ut=s&enc=${enc}&cpi=${cpi}&openc=${openc}`
const 课程项目地址获取 = ({ courseId }) =>
    `http://fanyapbl.chaoxing.com/pbl/list?courseId=${courseId}&ut=s`

// HTML 信息提取
const 基本资料提取 = (HTML) => 提取为表(HTML,
    // /\$\("#(.?.?male)"\)\.attr\("checked"\)[\s\S]*?id="resetIDspac" title="(.*?)"/g,
    /\$\("#(.*?male)"\)\.attr\("checked","checked"\)[\s\S]*?id="resetIDspac" title="(.*?)"/g,
    ([_, gender, 学号]) => ["基本资料", { 性别: gender === "female" ? '女' : '男', 学号, t基本资料: +new Date() }])
const 课程表提取 = (HTML) => 提取为表(HTML,
    /<a .*?courseId=(\d+).*?clazzid=(\d+).*?enc=(\w+).*?title="(.*?)"[\s\S]*?<p title="(.*?)">/g,
    ([_, courseId, classId, enc, title, 教师]) => [classId, { courseId, enc, classId, 名称: title, 教师 }])
const 课程令牌提取 = (HTML) => 提取为表(HTML,
    /clazzId.*?'(\w+?)'[\s\S]*?courseId.*?'(\w+?)'[\s\S]*?cpi.*?'(\w+?)'[\s\S]*?openc.*?'(\w+?)'[\s\S]*?(?:(待完成任务点))?/g,
    ([_, classId, courseId, cpi, openc, 待完成任务点]) =>
        [classId, { classId, courseId, cpi, openc, 待完成任务点: !!待完成任务点, t待完成任务点: +new Date(), t课程令牌: +new Date() }])
const 课程可用签到表提取 = (HTML) => 提取为表(HTML,
    /activeDetail\((\d+),2,null\)[\s\S]*?<dd class="green">(.*?)<[\s\S]*?<a.*?>(.*?)</g,
    ([_, activeId, type, title]) => [activeId, { activeId, type, title }])
const 作业表提取 = (HTML) => 提取为表(HTML,
    /<a.*?courseId=(\d+).*?classId=(\d+).*?workId=(\d+)(?:.*?workAnswerId=(\d+))?.*?title="(.*?)"[\s\S]*?开始时间.*>(.*?)<[\s\S]*?截止时间.*?>(.*?)<[\s\S]*?作业状态[\s\S]*?<strong>\s*(.*?)\s*?</g,
    ([_, courseId, classId, workId, workAnswerId, title, 开始时间, 截止时间, 作业状态]) => [workId, { courseId, classId, workId, workAnswerId, title, 开始时间, 截止时间, 作业状态 }])
const 签到状态提取 = (HTML) => 提取为表(HTML,
    /id="activeId".*?"(.*?)"[\s\S]*?id="activeStatus".*?"(.*?)"[\s\S]*?id="courseId".*?"(.*?)"[\s\S]*?id="classId".*?"(.*?)"[\s\S]*?id="puid".*?"(.*?)"[\s\S]*?id="createUid".*?"(.*?)"[\s\S]*?id="fid".*?"(.*?)"[\s\S]*?<em id="st">(.*?)</g,
    ([_, activeId, activeStatus, courseId, classId, puid, createUid, fid, succTimeRaw]) =>
        [activeId, { activeId, activeStatus, courseId, classId, puid, createUid, fid, succTimeRaw, t签到成功: +new Date() }])

// 接口
const 学生登录有效检查 = async (学生) => await 学生fetch(学生, 应用中心地址获取()).catch(e => false).then(e => e.status === 200)
const 学生登录 = async (学生) => {
    if (学生.t登录 && 学生.t登录 >= +new Date() - 60e3) return '最近登录过';
    if (await 学生登录有效检查(学生)) {
        学生.t登录 = +new Date()
        return '登录有效';
    }
    var res = await fetch(登录地址获取(学生), { headers: { ...通用headers } })
    var Cookie = res.headers.raw()['set-cookie'].map(e => e.match(/(.*?)=(.*?)(?=;|$)/)[0]).join('; ')
    var 返回json = await res.json()
    if (!Cookie.match(/UID=/)) throw "未检测到正确Cookies/" + (返回json.errorMessage || JSON.stringify(返回json))
    Object.assign(学生, { Cookie, ...返回json })
    学生.t登录 = +new Date()
    return '登录成功';
}
// TODO: 其它类型签到：https://mobilelearn.chaoxing.com/pptSign/stuSignajax
const 对签到任务签到 = async (学生, 课程, 签到任务) => {
    if (签到任务.t签到成功) return '' // 跳过已签到任务
    深合并(课程, { 签到表: 签到状态提取(await 学生GETHTML(学生, 手势签到地址获取({ ...课程, ...签到任务 }))) })
    深合并(课程, { 签到表: 签到状态提取(await 学生GETHTML(学生, 普通签到地址获取({ ...课程, ...签到任务 }))) })
    return (签到任务.title || '') + '成功✅'
}
const 对学生课程签到 = async (学生, 课程) => {
    if (课程.t签到表 && 课程.t签到表 >= +new Date() - 300e3) return console.error('签到表有效'), ''
    深合并(课程, { 签到表: 课程可用签到表提取(await 学生GETHTML(学生, 课程任务地址获取(课程))), t签到表: +new Date() })
    return await 异步值映射(课程.签到表, 签到任务 => 对签到任务签到(学生, 课程, 签到任务))
        .then(e => e.filter(e => e).join('、'))
}
const 学生课程任务检查 = async (学生, 课程) => {
    if (课程.t课程令牌 && 课程.t课程令牌 > +new Date() - 300e3) return console.error('课程令牌有效'), ''
    var 变沿提示 = 变沿检测器(课程.待完成任务点)
    console.assert(课程.enc, 学生.昵称 + 课程.名称 + 'enc=' + 课程.enc)
    深合并(学生, { 课程表: 课程令牌提取(_HTML = await 学生GETHTML(学生, 课程首页地址获取(课程))) })
    return 变沿提示(课程.待完成任务点) ? '有待完成任务点' : ''
}
const 学生课程任务作业检查 = async (学生, 课程) => {
    if (课程.t作业表 && 课程.t作业表 > +new Date() - 300e3) return console.error('作业表有效'), ''
    var 变沿提示 = await 异步对键值映射(课程.作业表 || {}, ([workId, { 作业状态 }]) => [workId, 变沿检测器(作业状态)])
    var 任务情况 = await 学生课程任务检查(学生, 课程)
    console.assert(课程.openc, 学生.昵称 + 课程.名称 + 'openc=' + 课程.openc)
    深合并(课程, { 作业表: 作业表提取(await 学生GETHTML(学生, 课程作业地址获取(课程))), t作业表: +new Date() })
    var 作业情况表 = await 异步对键值映射(课程.作业表 || {},
        ([workId, { title, 作业状态 }]) => ([workId, {
            title,
            // 如果之前有跟踪到这个作业
            情况: 变沿提示[workId]
                // 那么当它状态变化的时候进行提示
                ? 变沿提示[workId](作业状态)
                // 否则忽略刚发现就是完成了的作业
                : 作业状态 === '已完成' ? '' : 作业状态
        }]))
    var 作业情况 = await 异步值映射(作业情况表, ({ title, 情况 }) => 情况 && (title + 情况)).then(e => e.filter(e => e).join('、'))
    return [任务情况, 作业情况].filter(e => e).join('，')
}
const 学生课程状态检查 = async (学生, 课程) => {
    console.log("### " + 课程.名称);
    var 签到结果 = 对学生课程签到(学生, 课程)
    var 任务作业情况 = 学生课程任务作业检查(学生, 课程)
    var 检查结果 = await Promise.all([签到结果, 任务作业情况]).then(e => e.filter(e => e).join('，'))
    return 检查结果 && 课程.名称 + 检查结果 || ''
}
const 学生昵称填充 = (学生) => 学生.昵称 = 学生.昵称 || ((学生.realname || 学生.账号) + (学生.性别 === '女' ? 'ちゃん' : 'さん'))
const 学生课程表填充 = async (学生) => {
    if (学生.t课程表 && 学生.t课程表 >= +new Date() - 30 * 86400e3 && 0) return '课程表有效'
    深合并(学生, { 课程表: _TABLE = 课程表提取(_HTML = await 学生GETHTML(学生, 课程表地址获取())), t课程表: +new Date() })
    return `课程表刷新`
}
const 学生基本资料填充 = async (学生) => {
    if (学生.t基本资料) return '基本资料有效'
    var 基本资料 = 基本资料提取(await 学生GETHTML(学生, 账号管理地址获取()))['基本资料']
    if (!基本资料) throw '基本资料刷新失败'
    深合并(学生, 基本资料)
    return '基本资料刷新'
}
const 学生网课巡视 = async (学生) => {
    // 登录
    console.log("## " + 学生.昵称 || 学生.账号);
    await 学生登录(学生).catch((e) => { throw '登录失败/' + e })
    // 基本资料提取
    学生基本资料填充(学生) // { '性别': '女', '学号': 'xxxxxxxxxx', 't基本资料': 1588xxxxx5754 } 
    学生昵称填充(学生)
    // 检查课程
    console.log(await 学生课程表填充(学生));
    var 检查结果 = await 异步值映射(学生.课程表, 课程 => 学生课程状态检查(学生, 课程))
        .then(e => e.filter(e => e).join('，'))
    if (!检查结果) return '' // 没有要签到的课程
    // 生成报告内容
    var 报告内容 = 学生.昵称 + '：' + 检查结果 + "。"
    // 向学生报告
    await 向学生报告(学生, '喵喵喵>' + 报告内容).catch(console.error)
    // 留 log
    return 报告内容
}
const 合并配置到缓存 = async (缓存, 配置) => {
    深合并(缓存, { 学生表: Object.fromEntries(配置.学生列表.map(e => [e.账号, e])) })
}

module.exports = {
    学生登录有效检查,
    学生登录,
    学生基本资料填充, 学生昵称填充, 学生课程表填充,
    对签到任务签到, 对学生课程签到,
    学生课程任务检查, 学生网课巡视,
    向学生报告,
};

!module.parent && (async () => {
    const yaml = require('yaml')
    const { readFile, writeFile } = require('fs');
    const { promisify } = require('util');
    const 加载utf8文件 = async (文件名) => await promisify(readFile)(文件名, { encoding: 'utf-8' })
    const 保存utf8文件 = async (文件名, 内容) => await promisify(writeFile)(文件名, 内容)
    const 加载yaml = async (文件路径) => await 加载utf8文件(文件路径).then(yaml.parse).catch(() => (undefined)) || undefined
    const 保存yaml = async (文件路径, json) => await 保存utf8文件(文件路径, yaml.stringify(json))
    // 
    console.log('# 超星网课小助理')
    var t开始 = new Date()
    console.log('开始: ' + t开始.toISOString())
    // 加载缓存和配置
    var 配置 = await 加载yaml('config.yaml') || {}
    var 缓存 = await 加载yaml('cache.yaml') || {}
    if (!配置.学生列表) throw '请先填写配置文件 config.yaml ，格式在 config_demo.yaml 里'
    await 合并配置到缓存(缓存, 配置)
    // 筛出需要检查的学生
    var 学生表 = 配置.学生列表.map(({ 账号 }) => 缓存.学生表[账号])
    // 执行检查
    var 检查结果 = await 异步值映射(学生表, 学生网课巡视).then(e => e.filter(e => e).join('\n'))
    console.log(">" + 检查结果);
    // 缓存状态
    await 保存yaml('cache.yaml', 缓存)
    // 
    var t完成 = new Date()
    console.log('完成: ' + t完成.toISOString(), '耗时' + ((t完成 - t开始) / 1000).toFixed(2) + "s")
    return true
})().then(console.log()).catch(console.error)
