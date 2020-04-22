const http = require('http');
const https = require('https');
const yaml = require('yaml')
const { readFile, writeFile } = require('fs');
const { promisify } = require('util');
const 加载utf8文件 = async (文件名) => await promisify(readFile)(文件名, { encoding: 'utf-8' })
const 保存utf8文件 = async (文件名, 内容) => await promisify(writeFile)(文件名, 内容)
const 深合并 = (t, s) => t instanceof Object && ([...Object.keys(s)].forEach(k => t[k] = 深合并(t[k], s[k])), t) || undefined === s && t || s

const 通用头 = {
    // 'Accept-Encoding': 'gzip, deflate',
    'Accept-Language': 'zh-CN,zh;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.100 Safari/537.36'
}

var GET请求 = (url, ...params) => new Promise((resolve, reject) => (url.startsWith('https') ? https : http).get(url, ...params, resp => resolve(resp)));
var 流文本提取 = (res) => new Promise((resolve, reject) => {
    var buffer = '';
    res.on('data', (chunk) => { buffer += chunk; });
    res.on('end', () => { resolve(buffer) });
})

const 键映射 = async (obj, f) => await Promise.all([...Object.keys(obj)].map(f))
const 值映射 = async (obj, f) => await Promise.all([...Object.values(obj)].map(f))
const 对键值映射 = async (obj, f) => await Promise.all([...Object.entries(obj)].map(f))
const 键值对列转对象 = (entries) => Object.fromEntries(entries)
const 全部提取 = (str, reg) => {
    if (!reg.global) return null
    var coll = [];
    while ((e => e && coll.push(e))(reg.exec(str)));
    return coll
}
var 提取为表 = (html, 正则表达式, 键值对函数) => ({ ...键值对列转对象(全部提取(html, 正则表达式).map(键值对函数)) })

var 向用户报告 = async (用户, 内容) => await Promise.all([用户.报告地址].flat().map(地址 => GET请求(地址.replace(/%s/g, 内容))))
var 用户GET请求 = async (用户, url) => await GET请求(url, { headers: { ...通用头, Cookie: 用户.Cookie } })
var 用户GETHTML = async (用户, url) => await 用户GET请求(用户, url).then(流文本提取)
var 检查Cookies有效 = async (用户) => await 用户GET请求(用户, 'http://i.mooc.chaoxing.com/app/myapps.shtml').then(e => e.statusCode == 200)

var 用户登录 = async (用户) => {
    if (用户.Cookie) {
        if (await 检查Cookies有效(用户)) {
            console.debug('Cookies有效');
            return 'Cookies有效';
        }
        console.debug('Cookies无效，重新登录中');
    }
    var { 账号, 密码, schoolid = '', verify = 0 } = 用户
    var [账号, 密码, schoolid, verify] = [账号, 密码, schoolid, verify].map(encodeURIComponent)
    var 登录地址 = `https://passport2.chaoxing.com/api/login?name=${账号}&pwd=${密码}&schoolid=${schoolid}&verify=${verify}`
    var resp = await GET请求(登录地址, { headers: { ...通用头 } })
    var Cookie = resp.headers['set-cookie'].map(e => e.match(/(.*?)=(.*?)(?=;|$)/)[0]).join('; ')
    var 返回json = await 流文本提取(resp).then(JSON.parse)
    if (!Cookie.match(/UID=/)) {
        throw "未检测到正确Cookies/" + (返回json.errorMessage || JSON.stringify(返回json))
    }
    Object.assign(用户, { Cookie, ...{ ...返回json, result: undefined } })
    return '登录成功';
}

var 课程表提取 = (html) => 提取为表(html,
    /<a .*?courseId=(\d+).*?clazzid=(\d+).*?title="(.*?)"[\s\S]*?<p title="(.*?)">/g,
    ([_, courseId, clazzid, title, 教师]) => [clazzid, { courseId, classId: clazzid, 名称: title, 教师 }])
var 课程状态课程表提取 = (html) => 提取为表(html,
    /action="\/course\/(\d+).html"[\s\S]*?(?:(待完成任务点))?/g,
    ([_, activeId, 待完成任务点]) =>
        [activeId, { 待完成状态: !!待完成任务点, t完成状态: +new Date() }])
var 课程可用签到表提取 = (html) => 提取为表(html,
    /activeDetail\((\d+),2,null\)[\s\S]*?<dd class="green">(.*?)<[\s\S]*?<a.*?>(.*?)</g,
    ([_, activeId, type, title]) => [activeId, { activeId, type, title }])
var 签到状态提取 = (html) => 提取为表(html,
    /id="activeId".*?"(.*?)"[\s\S]*?id="activeStatus".*?"(.*?)"[\s\S]*?id="courseId".*?"(.*?)"[\s\S]*?id="classId".*?"(.*?)"[\s\S]*?id="puid".*?"(.*?)"[\s\S]*?id="createUid".*?"(.*?)"[\s\S]*?id="fid".*?"(.*?)"[\s\S]*?<em id="st">(.*?)</g,
    ([_, activeId, activeStatus, courseId, classId, puid, createUid, fid, succTimeRaw]) =>
        [activeId, { activeId, activeStatus, courseId, classId, puid, createUid, fid, succTimeRaw, t签到成功: +new Date() }])
var 作业表提取 = (html) => 提取为表(html,
    /<a.*?courseId=(\d+).*?classId=(\d+).*?workId=(\d+)(?:.*?workAnswerId=(\d+))?.*?title="(.*?)"[\s\S]*?开始时间.*>(.*?)<[\s\S]*?截止时间.*?>(.*?)<[\s\S]*?作业状态[\s\S]*?<strong>\s*(.*?)\s*?</g,
    ([_, courseId, classId, workId, workAnswerId, title, 开始时间, 截止时间, 作业状态]) => [workId, { courseId, classId, workId, workAnswerId, title, 开始时间, 截止时间, 作业状态 }])

var 取普通签到地址 = ({ activeId, classId, fid = '', courseId }) =>
    `https://mobilelearn.chaoxing.com/widget/sign/pcStuSignController/preSign?activeId=${activeId}&classId=${classId}&fid=${fid}&courseId=${courseId}`

var 取手势签到地址 = ({ courseId, classId, activeId }) =>
    `https://mobilelearn.chaoxing.com/widget/sign/pcStuSignController/signIn?&courseId=${courseId}&classId=${classId}&activeId=${activeId}`

// TODO: 其它类型签到：https://mobilelearn.chaoxing.com/pptSign/stuSignajax
var 对签到任务签到 = async (用户, 课程, 签到任务) => {
    if (签到任务.t签到成功) return '' // 跳过已签到任务
    var 地址 = (签到任务.title || '').match(/手势/)
        ? 取手势签到地址({ ...课程, ...签到任务 })
        : 取普通签到地址({ ...课程, ...签到任务 })

    var html = await 用户GETHTML(用户, 地址)
    深合并(课程, { 签到表: 签到状态提取(html) })
    // console.debug(签到任务.title + '成功✔')
    return (签到任务.title || '') + '成功✔'
}
var 对课程签到 = async (用户, 课程) => {
    var { courseId, classId } = 课程
    if (!课程.签到表 || (课程.t检查签到 + 60e3 < +new Date())) {
        课程.t检查签到 = +new Date()
        var 地址 = `https://mobilelearn.chaoxing.com/widget/pcpick/stu/index?courseId=${courseId}&jclassId=${classId}`
        var html = await 用户GETHTML(用户, 地址)
        深合并(课程, { 签到表: 课程可用签到表提取(html) })
        // console.debug('取得签到表', 课程.签到表);
    }
    var 签到结果 = await 值映射(课程.签到表, 签到任务 => 对签到任务签到(用户, 课程, 签到任务))
        .then(e => e.filter(e => e).join('、'))
    return 签到结果 && 课程.名称 + 签到结果
}

var 对用户签到 = async (用户) => {
    await 用户登录(用户).catch((e) => { throw '登录失败/' + e })
    if (!用户.课程表) {
        var html = await 用户GETHTML(用户, 'https://mooc1-1.chaoxing.com/visit/interaction')
        深合并(用户, { 课程表: 课程表提取(html) })
        // console.debug(`取得课程表`, 用户.课程表);
    }
    var 签到结果 = await 值映射(用户.课程表, 课程 => 对课程签到(用户, 课程))
        .then(e => e.filter(e => e).join('，'))
    if (!签到结果) return ''
    var 报告内容 = (用户.昵称 || 用户.realname || 用户.账号) + '：' + 签到结果 + "。"
    var 对用户报告内容 = '喵喵喵>' + 报告内容
    await 向用户报告(用户, 对用户报告内容).catch(console.error)
    return 报告内容
}

!module.parent && (async () => {
    // 加载缓存和配置
    var 配置文件 = 'config.yaml'
    var 缓存文件 = 'cache.yaml'
    var 配置 = await 加载utf8文件(配置文件).then(yaml.parse).catch(() => ({})) || {}
    var 缓存 = await 加载utf8文件(缓存文件).then(yaml.parse).catch(() => ({})) || {}
    // 从配置合并用户表
    深合并(缓存, { 用户表: 键值对列转对象(配置.用户列表.map(e => [e.账号, e])) })
    // 签到
    var 签到结果 = await 值映射(缓存.用户表, 对用户签到).then(e=>e.filter(e=>e).join('\n'))
    await 保存utf8文件(缓存文件, yaml.stringify(缓存))
    return new Date().toISOString() + '\n' + 签到结果
})().then(console.log).catch(console.error)
