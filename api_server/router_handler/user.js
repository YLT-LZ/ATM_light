// 管理员模块的路由处理函数：不需要身份认证

// 导入表单数据验证的模块
const checkym = require("../checkym/auser");
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
// 根据管理员id获取管理员数据的路由处理函数
module.exports.Alogid = function (req, res) {
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
module.exports.Afpwd = function (req, res) {
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
            return res.ck(err);
        }
        // 如果查询到的长度不等于1
        if (result.length !== 1) {
            return res.ck("账号和邮箱不匹配！");
        } else {
            const ecode = require("../common/createcode");
            const code = ecode(6);
            const sendEmail = require("../common/sendecode");
            const userInfo = req.body;
            const results = sendEmail(code, userInfo.aemail);
            if (results != 0) {
                return res.ck("邮箱验证码接收失败，请稍后再试！");
            }
            // 然后将6位验证码和查询到的用户信息通过token令牌保存
            const user = { ...result[0], apwd: "", aimage: "", code: code, islogin: false };
            const tokenStr = jwt.sign(user, config.jwtSecretkey, {
                expiresIn: '60s'
            });

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
            const ecode = require("../common/createcode");
            const code = ecode(6);
            const sendEmail = require("../common/sendecode");
            //公司邮箱固定
            const results = sendEmail(code, '2307458122@qq.com');
            if (results != 0) {
                return res.ck("邮箱验证码接收失败，请稍后再试！");
            }
            const userStr = {
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
        const adminStr = { ...results[0], apwd: "", aimage: "", islogin: true };
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
};
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
};
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
};
// 根据帖子id获取文章的的路由处理函数
module.exports.getCardByCardid = (req, res) => {
    // 对帖子ID进行验证
    const error = checkym.validate(req.query, checkym.schema.cardID);
    let value = null;
    // 如果验证结果不为空
    if (error) {
        // 响应验证结果
        return res.ck(error);
    }
    // 书写sql代码
    const sql = "SELECT atm_book.id,atm_book.tname,atm_book.ttype,atm_book.tcontent,atm_book.ttime,atm_book.tisdel,atm_book.author_id,atm_user.unick  FROM atm_book INNER JOIN atm_user ON atm_user.id=atm_book.author_id	WHERE atm_book.id =?";
    // 执行sql代码
    db.query(sql, req.query.cardID, function (err, results) {
        // 如果sql代码异常
        if (err) {
            // 响应异常对象
            return res.ck(err);
        }
        // 如果结果集中的长度不全等于1
        if (results.length !== 1) {
            return res.ck("获取该帖子失败！");
        }
        // 记录获取到的数据
        value = results[0];
        // 拿到作者的id
        let author_id = value.author_id;
        // 获取该作者的帖子数量
        const sql1 = "SELECT COUNT(*) AS card FROM atm_book WHERE tisdel=0 AND author_id=?";
        db.query(sql1, author_id, function (err, results) {
            // 如果sql代码异常
            if (err) {
                // 响应异常对象
                return res.ck(err);
            }
            // 将获取的数量存入这个对象中
            value.cardNum = results[0].card;
            // 获取某个作者的某个帖子的评论数量
            const sql2 = "SELECT COUNT(*) AS comments FROM atm_comments	WHERE authorid=? AND isdel=0 AND ubookid=?";
            db.query(sql2, [author_id, req.query.cardID], function (err, results) {
                // 如果sql代码异常
                if (err) {
                    // 响应异常对象
                    return res.ck(err);
                }
                // 将获取的数量存入这个对象中
                value.commentsNum = results[0].comments;
                // 获取该用户关注的数量
                const sql3 = "SELECT COUNT(*) AS focus FROM atm_focus WHERE uid=? AND ustatus=0";
                db.query(sql3, author_id, function (err, results) {
                    // 如果sql代码异常
                    if (err) {
                        // 响应异常对象
                        return res.ck(err);
                    }
                    // 将获取的数量存入这个对象中
                    value.focusNum = results[0].focus;
                    // 获取该用户粉丝的数量
                    const sql4 = "SELECT COUNT(*) AS fans FROM atm_fans WHERE ustatus=0 AND uid=?";
                    db.query(sql4, author_id, function (err, results) {
                        // 如果sql代码异常
                        if (err) {
                            // 响应异常对象
                            return res.ck(err);
                        }
                        // 将获取的数量存入这个对象中
                        value.fansNum = results[0].fans;
                        return res.send({
                            status: 0,
                            msg: "获取页面数据成功！",
                            data: value
                        })
                    })
                });
            });
        })
    });
};

// 根据作者id获取文章的路由处理函数
module.exports.getCardByAuthorid = (req, res) => {
    let value = null;
    // 验证作者的id
    const error = checkym.validate(req.query, checkym.schema.authorID);
    // 如果验证结果不为空
    if (error) {
        // 则响应验证结果
        return res.ck(error);
    }
    // 书写sql代码
    const sql = "SELECT atm_book.id,atm_book.tname,atm_type.type,atm_book.tcontent,atm_book.ttime,atm_book.tisdel,atm_book.author_id,atm_user.unick FROM atm_book INNER JOIN atm_user ON atm_user.id=atm_book.author_id INNER JOIN atm_type ON atm_book.ttype=atm_type.id	WHERE tisdel=0 AND author_id=?";
    // 执行sql代码
    db.query(sql, req.query.authorID, function (err, results) {
        // 如果sql代码异常
        if (err) {
            // 响应异常对象
            return res.ck(err);
        }
        // 如果查询到的结果集的长度小于1
        if (results.length < 1) {
            return res.ck("获取帖子失败！");
        }
        // 将获取到的结果集存如value变量中
        value = { list: results };
        // 根据作者id再获取帖子的数量

        const sql1 = "SELECT COUNT(*) AS card FROM atm_book WHERE tisdel=0 AND author_id=?";
        db.query(sql1, req.query.authorID, function (err, results) {
            // 如果sql代码异常
            if (err) {
                // 响应异常对象
                return res.ck(err);
            }
            // 将获取的数量存入这个对象中
            value.cardNum = results[0].card;
            // 获取作者的全部评论
            const sql2 = "SELECT COUNT(*) AS comments FROM atm_comments	WHERE authorid=? AND isdel=0";
            db.query(sql2, req.query.authorID, function (err, results) {
                // 如果sql代码异常
                if (err) {
                    // 响应异常对象
                    return res.ck(err);
                }
                // 将获取的数量存入这个对象中
                value.commentsNum = results[0].comments;
                // 获取该用户关注的数量
                const sql3 = "SELECT COUNT(*) AS focus FROM atm_focus WHERE uid=? AND ustatus=0";
                db.query(sql3, req.query.authorID, function (err, results) {
                    // 如果sql代码异常
                    if (err) {
                        // 响应异常对象
                        return res.ck(err);
                    }
                    // 将获取的数量存入这个对象中
                    value.focusNum = results[0].focus;
                    // 获取该用户粉丝的数量
                    const sql4 = "SELECT COUNT(*) AS fans FROM atm_fans WHERE ustatus=0 AND uid=1";
                    db.query(sql4, req.query.authorID, function (err, results) {
                        // 如果sql代码异常
                        if (err) {
                            // 响应异常对象
                            return res.ck(err);
                        }
                        // 将获取的数量存入这个对象中
                        value.fansNum = results[0].fans;
                        // 根据作者id获取昵称
                        const sql5 = "SELECT unick FROM atm_user WHERE id=?"
                        db.query(sql, req.query.authorID, function (err, results) {
                            // 如果sql代码异常
                            if (err) {
                                // 响应异常对象
                                return res.ck(err);
                            }
                            // 如果获取到的长度小于1
                            if (results.length < 1) {
                                // 则响应提示信息
                                return res.ck("获取作者昵称失败！");
                            }
                            // 将获取到的昵称存储这个对象中
                            value.nick = results[0].unick;
                            return res.send({
                                status: 0,
                                msg: "获取页面数据成功！",
                                data: value
                            })
                        })
                    })
                });
            });
        })
    });
}