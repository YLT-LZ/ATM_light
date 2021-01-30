// 导入数据库操作模块
const db = require('../db/mysql');
// 导入第三方密码加密模块
const bcrypt = require('bcryptjs');
// 注册表单验证
const checkuserinfor = require("../checkym/user")
// 登录表单验证
const checklogin = require("../checkym/userlog")
const jwt = require('jsonwebtoken');
const config = require("../config");

// 用户注册的路由处理函数
module.exports.reguser = (req, res) => {
    const userinfor = req.body;
    const err = checkuserinfor(userinfor);
    if (err) {
        return res.ck(err);
    }
    const sqlbyuname = 'SELECT * FROM atm_user WHERE atm_user.unick=?';
    // 执行sql查询
    db.query(sqlbyuname, [userinfor.unick], function (err, results) {
        if (err) {
            return res.ck(err);
        }
        if (results.length > 0) {
            return res.ck('该用户名已被占用，请使用其他用户名!');
        }
        const sqlbyulogid = 'SELECT * FROM atm_user WHERE atm_user.ulogid=?';
        // 执行sql查询
        db.query(sqlbyulogid, [userinfor.ulogid], function (err, results) {
            if (err) {
                return res.ck(err);
            }
            if (results.length > 0) {
                return res.ck('该用户登录账号已被占用，请使用其他账号!');
            }
            // 对用户密码进行加密处理
            // hashSync(需要进行加密的明文,随机盐的长度)
            userinfor.upwd = bcrypt.hashSync(userinfor.upwd, 10);
            const sql = 'INSERT INTO atm_user SET ?';
            // 执行sql语句完成注册用户功能
            db.query(sql, {
                unick: userinfor.unick,
                uemail: userinfor.uemail,
                ulogid: userinfor.ulogid,
                upwd: userinfor.upwd
            }, (err, results) => {
                if (err) {
                    return res.ck(err);
                }
                if (results.affectedRows !== 1) {
                    return res.ck('注册用户失败！请稍后再试');
                }
                res.ck("注册成功！", 0);
            });
        });
    });
};
// 用户登录的路由处理函数
module.exports.login = (req, res) => {
    // 接收表单数据
    const userinfor = req.body;
    // 检查表单数据是否合法
    const err = checklogin(userinfor);
    if (err) {
        return res.ck(err);
    }
    // 定义获取用户信息的SQL语句
    const sql = 'SELECT * FROM atm_user WHERE atm_user.ulogid=?';
    // 执行SQL语句进行查询用户信息
    db.query(sql, userinfor.ulogid, (err, results) => {
        if (err) {
            return res.ck(err);
        }
        if (results.length !== 1) {
            return res.ck('登录失败！登录账号不存在！');
        }
        if (results[0].ustatus != 0) {
            return res.ck('账户已被查封，请联系管理员')
        }
        // 检测用户密码是否正确
        const compareResult = bcrypt.compareSync(userinfor.upwd, results[0].upwd);
        if (!compareResult) {
            return res.ck('登录失败！密码有误！');
        }
        // 登录成功！创建Token字符串
        const user = { ...results[0], upwd: '', uimage: '', islogin: true };
        // 将用户信息进行加密成Token字符串
        const tokenStr = jwt.sign(user, config.jwtSecretkey, {
            expiresIn: '24h'
        });
        res.send({
            status: 0,
            msg: '登录成功！',
            token: tokenStr
        });
    });
};
// 找回密码的路由处理函数
module.exports.getuser = (req, res) => {
    const userinfor = req.body;
    const sql = 'SELECT id,uemail,ulogid FROM atm_user WHERE atm_user.ulogid=?';
    // 执行SQL语句进行查询用户信息
    db.query(sql, userinfor.ulogid, (err, results) => {
        if (err) {
            return res.ck(err);
        }
        if (results.length !== 1) {
            return res.ck('账号验证失败！账号不存在！');
        }
        res.send({
            status: 0,
            data: results
        });
    });
}
// 发送邮件的路由处理函数
module.exports.getecode = (req, res) => {
    const ecode = require("../common/createcode");
    const code = ecode(6);
    const sendEmail = require("../common/sendecode");
    const userInfo = req.body;
    const ckcode = require("../checkym/findpwd");
    const err = ckcode.validate(userInfo, ckcode.schema.sendemail);
    if (err) {
        return res.ck(err);
    }
    const results = sendEmail(code, userInfo.uemail);
    if (results != 0) {
        return res.ck("邮箱验证码接收失败，请稍后再试！");
    }
    const userStr = {
        id: userInfo.id,
        uemail: userInfo.uemail,
        code: code,
        islogin: false
    };
    const tokenStr = jwt.sign(userStr, config.jwtSecretkey, {
        expiresIn: '60s'
    });
    res.send({
        status: 0,
        msg: "邮箱成功接收验证码，有效时间为60s",
        token: tokenStr
    });
}
// 申述的路由处理函数
module.exports.appeal = (req, res) => {
    // 接收表单数据
    const userinfor = req.body;
    const sql = 'SELECT * FROM atm_user WHERE atm_user.ulogid=?';
    // 执行SQL语句进行查询用户信息
    db.query(sql, userinfor.ulogid, (err, results) => {
        if (err) {
            return res.ck(err);
        }
        if (results.length !== 1) {
            return res.ck('申诉账号不存在！');
        }
        if (results[0].ustatus == 0) {
            return res.ck('该账户未被查封,请转去登录')
        }
        res.ck('申诉已受理', 0)
    });
}