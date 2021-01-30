// 管理员模块的路由处理函数：不需要身份认证

// 导入表单数据验证的模块
const checkym = require("../checkym/user");
// 导入数据库模块
const db = require("../db/mysql");
// 导入配置文件模块
const config = require("../config");
// 导入生成token字符串的包
const jwt = require("jsonwebtoken");
// 导入对数据进行解密的包
const bcrypt = require("bcryptjs");

// 根据管理员id获取管理员数据的路由处理函数
module.exports.Alogid = function(req, res) {
    // 【1】验证账号格式
    const err = checkym.validate(req.body, checkym.schema.alogid);
    if (err) {
        return res.ck(err);
    }
    //【2】验证账号在数据库中是否存在
    const sql = "SELECT * FROM atm_admin WHERE alogid=?";
    db.query(sql, req.body.alogid, (err, result) => {
        if (err) {
            return res.ck(err);
        }
        if (result.length !== 1) {
            return res.ck("抱歉，该管理员账号不存在！");
        }
        // 响应客户端用户id和邮箱
        return res.send({
            status: 0,
            msg: "该管理员账号存在！",
            data: { alogid: req.body.alogid, aemail: result[0].aemail }
        });
    });
};

// 【找回密码时】：给管理员发送邮箱的路由处理函数
module.exports.Afpwd = function(req, res) {
    // 判断传入的是否是邮箱这个数据
    // 【1】验证邮箱格式
    const error = checkym.validate(req.body, checkym.schema.aidEmail);
    if (error) {
        return res.ck(error);
    }
    // 验证这个邮箱是否和账号对应
    const sqlstr = "SELECT * FROM atm_admin WHERE alogid=? AND aemail=?";
    db.query(sqlstr, [req.body.alogid, req.body.aemail], (err, result) => {
        // 如果数据库异常
        if (err) {
            console.log(err);
            return res.ck(err);
        }
        // 如果查询到的长度不等于1
        if (result.length !== 1) {
            return res.ck("账号和邮箱不匹配！");
        } else {
            //记录六位随机验证码
            var captcha = "";
            // 通过for循环拿到六位验证码
            for (let i = 0; i < 6; i++) {
                captcha += parseInt(Math.random() * 10);
            }
            //设置邮箱的选项
            const options = {
                from: `"光明顶论坛" <${config.ourEmail}>`, //自己的邮箱
                to: req.body.aemail, //要发送的邮箱
                subject: "光明顶论坛验证码", //设置主题
                html: `验证码为：<h4>${captcha} </h4>60秒内有效`
            };
            // 发送验证码
            config.transporter.sendMail(options, function(err, info) {
                console.log("发送成功！");
            });
            // 然后将6位验证码和查询到的用户信息通过token令牌保存
            const user = {...result[0], apwd: "", aimage: "", code: captcha, islogin: false };
            // 生成token密钥,并设置token密钥的有效时间
            const tokenStr = jwt.sign(user, config.jwtSecretkey, { expiresIn: "60s" });
            // 将生成的token密钥响应给客户端
            return res.send({
                status: 0,
                msg: "验证码发送成功！",
                token: "Bearer " + tokenStr
            });
        }
    });
};

// 【注册账号时】：给管理员发送邮箱的路由处理函数
module.exports.Areg = (req, res) => {
    // 首先先判断账号、密码、邮箱、昵称的格式
    const error = checkym.validate(req.body, checkym.schema.ipen);
    // 如果判断结果不为空
    if (error) {
        // 则返回异常信息
        return res.ck(error);
    }
    // 书写根据账号查询数据的sql代码
    const sql1 = "SELECT * FROM atm_admin WHERE alogid=?";
    const sql2 = "SELECT * FROM atm_admin WHERE aemail=?";
    // 执行sql代码
    db.query(sql1, req.body.alogid, (error, results) => {
        // 如果数据库异常对象不为空
        if (error) {
            // 则返回异常对象
            return res.ck(error);
        }
        // 如果查询到的结果集中的数据长度全等于1
        if (results.length === 1) {
            return res.ck("获取验证码失败，该账号已存在!");
        }
        db.query(sql2, req.body.aemail, (err2, results2) => {
            // 如果数据库异常对象不为空
            if (err2) {
                // 则返回异常对象
                return res.ck(err2);
            }
            // 如果查询到的结果集中的数据长度全等于1
            if (results2.length === 1) {
                return res.ck("获取验证码失败，该邮箱已存在!");
            }
            // 定义变量，记录验证码
            var captcha = "";
            // 通过for循环拿到六位验证码
            for (let i = 0; i < 6; i++) {
                captcha += parseInt(Math.random() * 10);
            }
            //设置邮箱的选项
            const options = {
                from: `"光明顶" <${config.ourEmail}>`, //公司邮箱
                to: req.body.aemail, //要发送的邮箱
                subject: "光明顶论坛注册验证码", //设置主题
                html: `验证码为：<h4>${captcha} </h4>60秒内有效`
            };
            // 发送邮箱
            config.transporter.sendMail(options, (err, info) => {
                console.log("注册邮箱发送成功！");
            });
            // 将6位验证码进行加密，生成token令牌,并设置有效时间位60s
            const tokenStr = jwt.sign({ code: captcha, islogin: false }, config.jwtSecretkey, { expiresIn: "60s" });
            // 将生成的token密钥响应给客户端
            return res.send({
                status: 0,
                msg: "验证码发送成功！",
                token: tokenStr
            });
        });
    });
};

// 用户登录的路由处理函数
module.exports.Alogin = (req, res) => {
    // 对客户端传入的表单数据进行验证，并返回验证的结果
    const error = checkym.validate(req.body, checkym.schema.alogin);
    // 如果判断结果不为空
    if (error) {
        return res.ck(error);
    }
    // 书写通过账号查询管理员信息的sql代码
    const sql = "SELECT * FROM atm_admin WHERE alogid=?";
    // 执行sql代码
    db.query(sql, req.body.alogid, (error, results) => {
        // 如果数据库异常对象不为空
        if (error) {
            // 则返回异常对象
            return res.ck(error);
        }
        // 如果查询到的结果集中的数据长度不等于1
        if (results.length !== 1) {
            return res.ck("登录失败，该账号不存在!");
        }
        // 检测密码是否正确
        const compareResult = bcrypt.compareSync(req.body.apwd, results[0].apwd);
        // 如果检测的结果不为true
        if (!compareResult) {
            return res.ck("登录失败，密码有误！");
        }
        // 登录成功之后要创建token令牌,并且生成token令牌的时候一定不能包含密码和图像
        // 所有我们通过解构的方式,替换掉result[0]中的apwd和aimage键值为空字符串
        const adminStr = {...results[0], apwd: "", aimage: "", islogin: true };
        // 生成token密钥,并设置token密钥的有效时间
        const tokenStr = jwt.sign(adminStr, config.jwtSecretkey, { expiresIn: "24h" });
        // 将生成的token密钥响应给客户端
        return res.send({
            status: 0,
            msg: "登录成功!",
            token: "Bearer " + tokenStr
        });
    });
};