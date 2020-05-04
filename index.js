const yaml = require('yaml')
const { readFile, writeFile } = require('fs');
const { promisify } = require('util');
const { default: fetch } = require('node-fetch');
const { debug } = require('console');
const 深合并 = (t, s) => t instanceof Object && ([...Object.keys(s)].forEach(k => t[k] = 深合并(t[k], s[k])), t) || undefined === s && t || s
const 变沿检测器 = (初始值) => (新值) => (初始值 != 新值 ? (初始值 = 新值) : undefined)
const 通用头 = {
    // 'Accept-Encoding': 'gzip, deflate',
    'Accept-Language': 'zh-CN,zh;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.100 Safari/537.36'
}

const 异步键映射 = async (obj, f) => await Promise.all([...Object.keys(obj)].map(f))
const 异步值映射 = async (obj, f) => await Promise.all([...Object.values(obj)].map(f))
const 异步对键值映射 = async (obj, f) => Object.fromEntries(await Promise.all([...Object.entries(obj)].map(f)))
const 键值对列转对象 = (entries) => Object.fromEntries(entries)
const 全部提取 = (str, reg) => {
    if (!reg.global) return null
    var coll = [];
    while ((e => e && coll.push(e))(reg.exec(str)));
    return coll
}
var 提取为表 = (html, 正则表达式, 键值对函数) => ({ ...键值对列转对象(全部提取(html, 正则表达式).map(键值对函数)) })

exports.向用户报告 = async (用户, 内容 = '') => await Promise.all([用户.报告地址 || []].flat().map(地址 => fetch(encodeURI(地址.replace(/%s/g, 内容)))))

var 用户fetch = async (用户, url) => await fetch(url, { headers: { ...通用头, Cookie: 用户.Cookie } })
var 用户GETHTML = async (用户, url) => await 用户fetch(用户, url).then(e => e.text())

exports.检查Cookies有效 = async (用户) => await 用户fetch(用户, 'http://i.mooc.chaoxing.com/app/myapps.shtml').then(e => e.status == 200)
exports.用户登录 = async (用户) => {
    if (用户.t登录 && 用户.t登录 >= +new Date() - 60e3) {
        console.log('最近登录过');
        return '最近登录过';
    }
    if (用户.Cookie && await exports.检查Cookies有效(用户)) {
        用户.t登录 = +new Date()
        console.log('Cookies有效');
        return 'Cookies有效';
    }
    if (用户.Cookie) {
        console.log('Cookies无效，重新登录中');
    }
    var { 账号, 密码, schoolid = '', verify = 0 } = 用户
    var [账号, 密码, schoolid, verify] = [账号, 密码, schoolid, verify].map(encodeURIComponent)
    var 登录地址 = `https://passport2.chaoxing.com/api/login?name=${账号}&pwd=${密码}&schoolid=${schoolid}&verify=${verify}`
    var res = await fetch(登录地址, { headers: { ...通用头 } })
    var Cookie = res.headers.raw()['set-cookie'].map(e => e.match(/(.*?)=(.*?)(?=;|$)/)[0]).join('; ')
    var 返回json = await res.json()
    if (!Cookie.match(/UID=/)) {
        throw "未检测到正确Cookies/" + (返回json.errorMessage || JSON.stringify(返回json))
    }
    Object.assign(用户, { Cookie, ...{ ...返回json, result: undefined } })
    用户.t登录 = +new Date()
    return '登录成功';
}

var 课程表地址 = () => `http://mooc1-1.chaoxing.com/visit/interaction`

var 课程首页地址获取 = ({ courseId, classId, enc }) => `http://mooc1-1.chaoxing.com/mycourse/studentcourse?courseId=${courseId}&vc=1&clazzid=${classId}&enc=${enc}`
var 课程任务地址获取 = ({ courseId, classId }) => `http://mobilelearn.chaoxing.com/widget/pcpick/stu/index?courseId=${courseId}&jclassId=${classId}`
var 普通签到地址获取 = ({ courseId, classId, activeId, fid = '' }) => `http://mobilelearn.chaoxing.com/widget/sign/pcStuSignController/preSign?activeId=${activeId}&classId=${classId}&fid=${fid}&courseId=${courseId}`
var 手势签到地址获取 = ({ courseId, classId, activeId }) => `http://mobilelearn.chaoxing.com/widget/sign/pcStuSignController/signIn?&courseId=${courseId}&classId=${classId}&activeId=${activeId}`
var 课程资料地址获取 = ({ courseId, classId, enc, cpi, openc }) => `http://mooc1-1.chaoxing.com/coursedata?classId=${classId}&courseId=${courseId}&type=1&ut=s&enc=${enc}&cpi=${cpi}&openc=${openc}"`
var 课程通知地址获取 = ({ courseId, classId, enc, cpi, openc }) => `http://mooc1-1.chaoxing.com/schoolCourseInfo/getNotifyList?courseId=${courseId}&classId=${classId}&ut=s&enc=${enc}&cpi=${cpi}&openc=${openc}`
var 课程作业地址获取 = ({ courseId, classId, enc, cpi, openc }) => `http://mooc1-1.chaoxing.com/work/getAllWork?classId=${classId}&courseId=${courseId}&isdisplaytable=2&mooc=1&ut=s&enc=${enc}&cpi=${cpi}&openc=${openc}`
var 课程考试地址获取 = ({ courseId, classId, enc, cpi, openc }) => `http://mooc1-1.chaoxing.com/exam/test?classId=${classId}&courseId=${courseId}&ut=s&enc=${enc}&cpi=${cpi}&openc=${openc}`
var 课程讨论地址获取 = ({ courseId, classId, enc, cpi, openc }) => `http://mooc1-1.chaoxing.com/bbscircle/grouptopic?courseId=${courseId}&clazzid=${classId}&showChooseClazzId=${classId}&ut=s&enc=${enc}&cpi=${cpi}&openc=${openc}`
var 课程项目地址获取 = ({ courseId }) => `http://fanyapbl.chaoxing.com/pbl/list?courseId=${courseId}&ut=s`


var 课程表提取 = (html) => 提取为表(html,
    /<a .*?courseId=(\d+).*?clazzid=(\d+).*?enc=(\w+).*?title="(.*?)"[\s\S]*?<p title="(.*?)">/g,
    ([_, courseId, classId, enc, title, 教师]) => [classId, { courseId, enc, classId, 名称: title, 教师 }])
var 课程令牌提取 = (html) => 提取为表(html,
    /clazzId.*?'(\w+?)'[\s\S]*?courseId.*?'(\w+?)'[\s\S]*?cpi.*?'(\w+?)'[\s\S]*?openc.*?'(\w+?)'[\s\S]*?(?:(待完成任务点))?/g,
    ([_, classId, courseId, cpi, openc, 待完成任务点]) =>
        [classId, { classId, courseId, cpi, openc, 待完成任务点: !!待完成任务点, t待完成任务点: +new Date(), t课程令牌: +new Date() }])
var 课程可用签到表地址 = ({ courseId, classId }) => `https://mobilelearn.chaoxing.com/widget/pcpick/stu/index?courseId=${courseId}&jclassId=${classId}`
var 课程可用签到表提取 = (html) => 提取为表(html,
    /activeDetail\((\d+),2,null\)[\s\S]*?<dd class="green">(.*?)<[\s\S]*?<a.*?>(.*?)</g,
    ([_, activeId, type, title]) => [activeId, { activeId, type, title }])
var 作业表提取 = (html) => 提取为表(html,
    /<a.*?courseId=(\d+).*?classId=(\d+).*?workId=(\d+)(?:.*?workAnswerId=(\d+))?.*?title="(.*?)"[\s\S]*?开始时间.*>(.*?)<[\s\S]*?截止时间.*?>(.*?)<[\s\S]*?作业状态[\s\S]*?<strong>\s*(.*?)\s*?</g,
    ([_, courseId, classId, workId, workAnswerId, title, 开始时间, 截止时间, 作业状态]) => [workId, { courseId, classId, workId, workAnswerId, title, 开始时间, 截止时间, 作业状态 }])
var 签到状态提取 = (html) => 提取为表(html,
    /id="activeId".*?"(.*?)"[\s\S]*?id="activeStatus".*?"(.*?)"[\s\S]*?id="courseId".*?"(.*?)"[\s\S]*?id="classId".*?"(.*?)"[\s\S]*?id="puid".*?"(.*?)"[\s\S]*?id="createUid".*?"(.*?)"[\s\S]*?id="fid".*?"(.*?)"[\s\S]*?<em id="st">(.*?)</g,
    ([_, activeId, activeStatus, courseId, classId, puid, createUid, fid, succTimeRaw]) =>
        [activeId, { activeId, activeStatus, courseId, classId, puid, createUid, fid, succTimeRaw, t签到成功: +new Date() }])

// TODO: 其它类型签到：https://mobilelearn.chaoxing.com/pptSign/stuSignajax
exports.对签到任务签到 = async (用户, 课程, 签到任务) => {
    if (签到任务.t签到成功) return '' // 跳过已签到任务

    var html = await 用户GETHTML(用户, 手势签到地址获取({ ...课程, ...签到任务 }))
    深合并(课程, { 签到表: 签到状态提取(html) })

    var html = await 用户GETHTML(用户, 普通签到地址获取({ ...课程, ...签到任务 }))
    深合并(课程, { 签到表: 签到状态提取(html) })

    console.debug(签到任务.title + '成功✅')
    return (签到任务.title || '') + '成功✅'
}
exports.用户课程状态检查 = async (用户, 课程) => {
    console.log("### " + 课程.名称);
    // 签到
    if (课程.t签到表 && 课程.t签到表 >= +new Date() - 600e3) {
        console.log('签到表未过期');
    } else {
        深合并(课程, { 签到表: 课程可用签到表提取(await 用户GETHTML(用户, 课程可用签到表地址(课程))), t签到表: +new Date() })
        var 签到结果 = await 异步值映射(课程.签到表, 签到任务 => exports.对签到任务签到(用户, 课程, 签到任务))
            .then(e => e.filter(e => e).join('、'))
    }
    // 任务情况
    if (课程.t课程令牌 && 课程.t课程令牌 > +new Date() - 600e3) {
        console.log('课程令牌未过期');
    } else {
        var 变沿提示 = 变沿检测器(课程.待完成任务点)
        深合并(用户, { 课程表: 课程令牌提取(await 用户GETHTML(用户, 课程首页地址获取(课程))) })
        var 任务情况 = 变沿提示(课程.待完成任务点) ? '有待完成任务点' : ''
    }
    // 作业情况
    if (课程.t作业表 && 课程.t作业表 > +new Date() - 600e3) {
        console.log('作业表未过期');
    } else {
        var 变沿提示 = await 异步对键值映射(课程.作业表 || {}, ([workId, { 作业状态 }]) => [workId, 变沿检测器(作业状态)])
        深合并(课程, { 作业表: 作业表提取(await 用户GETHTML(用户, 课程作业地址获取(课程))), t作业表: +new Date() })
        var 作业情况表 = await 异步对键值映射(课程.作业表 || {},
            ([workId, { title, 作业状态 }]) => ([workId, {
                title,
                情况: 变沿提示[workId] // 如果之前有跟踪到这个作业
                    ? 变沿提示[workId](作业状态) // 那么当它状态变化的时候进行提示
                    : 作业状态 === '已完成' ? '' : 作业状态 // 否则忽略刚发现就是完成了的作业
            }]))
        var 作业情况 = await 异步值映射(作业情况表, ({ title, 情况 }) => 情况 && (title + 情况)).then(e => e.filter(e => e).join('、'))
    }
    // 检查结果
    var 检查结果 = [签到结果, 任务情况, 作业情况].filter(e => e).join('，')
    return 检查结果 && 课程.名称 + 检查结果
}
var 取用户昵称 = (用户) => (用户.昵称 || 用户.realname || 用户.账号)

exports.用户状态检查 = async (用户) => {
    // 登录
    console.log("## " + 取用户昵称(用户));
    await exports.用户登录(用户).catch((e) => { throw '登录失败/' + e })
    // 课程表获取
    if (用户.t课程表 && 用户.t课程表 >= +new Date('2020-05-04Z')) {
        console.log('课程表有效');
    } else {
        深合并(用户, { 课程表: 课程表提取(await 用户GETHTML(用户, 课程表地址())), t课程表: +new Date() })
        console.log(`课程表刷新`);
    }
    // 检查课程
    var 检查结果 = await 异步值映射(用户.课程表, 课程 => exports.用户课程状态检查(用户, 课程))
        .then(e => e.filter(e => e).join('，'))
    if (!检查结果) return '' // 没有要签到的课程
    // 生成报告内容
    var 报告内容 = 取用户昵称(用户) + '：' + 检查结果 + "。"
    // 向用户报告
    await exports.向用户报告(用户, '喵喵喵>' + 报告内容).catch(console.error)
    // 留 log
    return 报告内容
}

!module.parent && (async () => {
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
    // 从配置合并用户表
    if (!配置.用户列表) { return '请先填写配置文件 config.yaml ，格式在 config_demo.yaml 里' }
    深合并(缓存, { 用户表: 键值对列转对象(配置.用户列表.map(e => [e.账号, e])) })
    // 筛出需要检查的用户
    var 用户表 = 配置.用户列表.map(({ 账号 }) => 缓存.用户表[账号])
    // 执行检查
    var 检查结果 = await 异步值映射(用户表, exports.用户状态检查).then(e => e.filter(e => e).join('\n'))
    console.log(检查结果);
    // 缓存状态
    await 保存yaml('cache.yaml', 缓存)
    var t完成 = new Date()
    console.log('完成: ' + t完成.toISOString(), '耗时' + ((t完成 - t开始) / 1000).toFixed(2) + "s")
    return true
})().then(console.log()).catch(console.error)
