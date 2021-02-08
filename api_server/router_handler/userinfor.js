// 管理员模块的路由处理函数：需要身份认证

// 导入表单数据验证的模块
const checkym = require("../checkym/userifor");
// 导入数据库模块
const db = require("../db/mysql");
// 导入对数据进行加密的包
const bcrypt = require("bcryptjs");
// 导入生成token的jwt模块
const jwt = require("jsonwebtoken");
// 导入配置模块
const config = require("../config");

// 【忘记密码】设置新密码的路由处理函数
module.exports.fsetpwd = function(req, res) {
    // 如果user为空
    if (!req.user) {
        return res.ck("身份验证失败，请重新找回密码！");
    }
    const error = checkym.validate(req.body, checkym.schema.setpwd);
    if (error) {
        return res.ck(error);
    }
    // 对新密码进行加密和加盐
    const newpwd = bcrypt.hashSync(req.body.newpwd, 10);
    // 书写修改密码的sql代码
    const sql = "UPDATE atm_admin SET apwd=? WHERE alogid=?";
    db.query(sql, [newpwd, req.user.alogid], function(err, result) {
        if (err) {
            return res.ck(err);
        }
        if (result.affectedRows !== 1) {
            return res.ck("修改密码失败！");
        }
        // 清除token令牌
        return res.ck("修改密码成功", 0);
    });
};

// 【忘记密码】验证邮箱验证码的路由处理函数 
module.exports.fpwdCode = function(req, res) {
    // 对管理员的邮箱再次进行验证
    const error = checkym.validate(req.body, checkym.schema.aemail);
    if (error) {
        return res.ck(error);
    }
    // 根据邮箱查询账号
    const sql = "SELECT alogid FROM atm_admin WHERE aemail=?"
    db.query(sql, [req.body.aemail], (err, result) => {
        // 如果数据库异常
        if (err) {
            return res.ck(err);
        }
        // 如果结果集的长度不为1
        if (result.length !== 1) {
            return res.ck("修改密码失败！");
        }
        // 如果tock中user中的islogin属性为ture，说明是登录的身份认证
        if (req.user.islogin) {
            return res.ck("请先登录！");
        }
        // 如果user为空，则证明验证码失效
        if (!req.user) {
            return res.ck("验证码失效，请重新获取！");
        }
        // 如果输入的为空，说明没有填写邮箱验证码
        if (!req.body.code) {
            return res.ck("请先输入邮箱验证码");
        }
        // 如果输入的验证码不等于token中的验证码，并且token没有失效，证明不符合
        if (req.body.code !== req.user.code && req.user) {
            return res.ck("邮箱验证码有误，请重新输入！");
        } else if (req.body.code === req.user.code && req.user) {
            // 生成token密钥,并设置token密钥的有效时间为十分钟
            const tokenStr = jwt.sign({ alogid: result[0].alogid }, config.jwtSecretkey, { expiresIn: "600s" });
            // 否则说明匹配成功
            return res.send({
                status: 0,
                msg: "请在10分钟内完成操作！",
                token: "Bearer " + tokenStr
            });
        }
    });
};

// 添加新管理员的路由处理函数
module.exports.register = (req, res) => {
    const data = req.body;
    // 再次判断账号、密码、邮箱、昵称的格式
    const error = checkym.validate(data, checkym.schema.register);
    // 如果判断结果不为空
    if (error) {
        // 则返回异常信息
        return res.ck(error);
    }
    // 书写根据账号查询数据的sql代码
    const sql = "SELECT * FROM atm_admin WHERE alogid=?";
    const sql2 = "SELECT * FROM atm_admin WHERE aemail=?";
    // 执行sql代码
    db.query(sql, req.body.alogid, (error, results) => {
        // 如果数据库异常对象不为空
        if (error) {
            // 则返回异常对象
            return res.ck(error);
        }
        // 如果查询到的结果集中的数据长度全等于1
        if (results.length === 1) {
            return res.ck("该账号已存在,请重新获取验证码!");
        }
        db.query(sql2, req.body.aemail, (err, results2) => {
            // 如果数据库异常对象不为空
            if (err) {
                // 则返回异常对象
                return res.ck(err);
            }
            // 如果查询到的结果集中的数据长度全等于1
            if (results2.length === 1) {
                return res.ck("注册失败,该邮箱已存在!");
            }

            // 接下来再次判断授权码

            // 如果用户输入的验证码为空
            if (!req.body.code) {
                return res.ck("注册失败，验证码不能为空！");
                // 如果用户输入的验证码不为空,并且不等于token中的验证码
            } else if (req.body.code && req.body.code !== req.user.code) {
                return res.ck("注册失败，验证码有误！");
                // 如果用户输入的验证码不为空，并且等于token中的验证码
            } else if (req.body.code && req.body.code === req.user.code) {
                // 对密码进行加密
                data.apwd = bcrypt.hashSync(data.apwd, 10);
                // 书写sql代码
                const sql1 = "INSERT INTO atm_admin SET ?";
                // 使用组包拿到需要写入的数据
                const datas = {
                    alogid: data.alogid,
                    apwd: data.apwd,
                    aemail: data.aemail,
                    anick: data.anick
                };
                // 执行sql代码
                db.query(sql1, datas, (err, results) => {
                    // 如果数据库异常
                    if (err) {
                        // 返回异常对象
                        return res.ck(err);
                    }
                    // 如果受影响的函数不为1
                    if (results.affectedRows !== 1) {
                        return res.ck("管理员账户注册失败！");
                    }
                    // 注册成功
                    return res.ck("管理员账号注册成功，请先登录！", 0);
                });
            }
        });
    });
};
// 验证邮箱动态码的路由处理函数
module.exports.yzecode = (req, res) => {
    if (req.user.islogin) {
        return res.ck("请重新找回密码！");
    }
    // 如果邮箱动态码不一致
    if (req.user.code !== req.body.code) {
        console.log(req.user.code);
        console.log(req.body.code);
        return res.ck("邮箱动态码错误,请重新输入的邮箱动态码!");
    }
    // 如果一致,则生成新的token,用于进行找回密码的下一步操作
    const userStr = {
        id: req.user.id,
        islogin: false
    };
    const tokenStr = jwt.sign(userStr, config.jwtSecretkey, {
        expiresIn: '10m'
    });
    res.send({
        status: 0,
        msg: "邮箱动态码验证成功!",
        token: tokenStr
    });
};
// 重置密码的路由处理函数
module.exports.resetpwd = (req, res) => {
    if (req.user.islogin) {
        return res.ck("请重新找回密码!");
    }
    const userInfo = req.body;
    const ckresetpwd = require("../checkym/resetpwd");
    const err = ckresetpwd(userInfo);
    if (err) {
        return res.ck(err);
    }
    const sql = "SELECT * FROM atm_user WHERE id = ?";
    db.query(sql, [req.user.id], (err, result) => {
        if (err) {
            return res.ck(err);
        }
        if (result.length !== 1) {
            return res.ck("用户不存在,请稍后再试！");
        }
        // 执行修改密码操作
        const sqleditpwd = "UPDATE atm_user SET upwd = ? WHERE id = ?";
        // 对新密码进行加密
        userInfo.newpwd = bcrypt.hashSync(userInfo.newpwd, 10);
        db.query(sqleditpwd, [userInfo.newpwd, req.user.id], (err, results) => {
            if (err) {
                return res.ck(err);
            }
            if (results.affectedRows !== 1) {
                return res.ck("重置密码失败,请稍后再试！");
            }
            res.ck("重置密码成功！", 0);
        });
    });
};

// 用户页面获取该用户粉丝总数的路由处理函数
module.exports.getFansNum = (req, res) => {
    // 书写sql代码
    const sql = "SELECT COUNT(*) AS num FROM atm_fans WHERE uid=? AND ustatus=0";
    // 执行sql代码
    db.query(sql, req.user.id, function(err, results) {
        // 如果数据库异常，则响应异常对象
        if (err) {
            return res.ck(err);
        }
        return res.send({
            status: 0,
            msg: "获取该用户粉丝数量成功!",
            data: results
        });
    });
};

// 用户页面获取该用户关注总数的路由处理函数
module.exports.getFocusNum = (req, res) => {
    // 书写sql代码
    const sql = "SELECT COUNT(*) AS num FROM atm_focus WHERE uid=? AND ustatus=0";
    // 执行sql代码
    db.query(sql, req.user.id, function(err, results) {
        // 如果数据库异常，则响应异常对象
        if (err) {
            return res.ck(err);
        }
        return res.send({
            status: 0,
            msg: "获取该用户帖子数量成功!",
            data: results
        });
    });
};

// 用户页面获取该用户帖子总数的路由处理函数
module.exports.getCardNum = (req, res) => {
    // 书写sql代码
    const sql = "SELECT COUNT(*) AS num FROM atm_book WHERE author_id=? AND tisdel=0";
    // 执行sql代码
    db.query(sql, req.user.id, function(err, results) {
        // 如果数据库异常，则响应异常对象
        if (err) {
            return res.ck(err);
        }
        return res.send({
            status: 0,
            msg: "获取该用户帖子数量成功!",
            data: results
        });
    });
};

// 用户页面获取该帖子评论总数的路由处理函数
module.exports.getCommentNum = (req, res) => {
    // 书写sql代码
    const sql = "SELECT COUNT(*) AS num FROM atm_comments WHERE authorid=? AND isdel=0";
    // 执行sql代码
    db.query(sql, req.user.id, function(err, results) {
        // 如果数据库异常，则响应异常对象
        if (err) {
            return res.ck(err);
        }
        return res.send({
            status: 0,
            msg: "获取该用户帖子数量成功!",
            data: results
        });
    });
};

// 获取当前用户全部帖子列表的路由处理函数
module.exports.getCardAll = (req, res) => {
    // 书写sql代码
    const sql = `SELECT atm_book.id,atm_book.tcontent,atm_book.tname,atm_book.ttime,atm_user.unick,
 atm_type.type FROM atm_book INNER JOIN atm_user on atm_book.author_id = atm_user.id INNER JOIN atm_type
  on atm_book.ttype = atm_type.id
  WHERE tisdel=0 ORDER BY atm_book.ttime ${req.query.sort} `;
    // 获取sql代码
    db.query(sql, function(err, results) {
        // 如果数据库异常
        if (err) {
            // 响应并返回异常对象
            return res.ck(err);
        }
        // 如果结果集中的长度小于等于0
        if (results.length <= 0) {
            return res.ck("该用户没有发布任何帖子!");
        }
        return res.send({
            status: 0,
            msg: "获取帖子列表成功!",
            data: results
        });
    });
};

// 根据用户id和帖子id删除帖子的路由处理函数
module.exports.delcardByidAnduid = (req, res) => {
    // 通过组包获取所需要的数据
    const body = { id: req.body.id, author_id: req.user.id };
    // 对数据进行验证
    const error = checkym.validate(body, checkym.schema.delCard);
    // 如果验证结果不为空
    if (error) {
        // 响应验证结果
        return res.ck(error);
    }
    // 书写修改数据的sql代码
    var sql = "UPDATE atm_book SET tisdel=1 WHERE id=? AND author_id=?";
    // 执行sql代码
    db.query(sql, [body.id, body.author_id], function(err, results) {
        // 如果sql代码执行异常
        if (err) {
            // 则响应异常对象
            return res.ck(err);
        }
        // 如果结果集中受影响的行数不为1
        if (results.affectedRows !== 1) {
            // 则响应提示信息
            return res.ck("删除失败！");
        }
        return res.ck("删除成功", 0);
    });
};