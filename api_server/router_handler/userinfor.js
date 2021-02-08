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
// 导入修改个人信息的表单验证
const ckupdate = require('../checkym/userupdate');
// 【忘记密码】设置新密码的路由处理函数
module.exports.fsetpwd = function (req, res) {
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
    db.query(sql, [newpwd, req.user.alogid], function (err, result) {
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
module.exports.fpwdCode = function (req, res) {
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
}
//获取用户信息的路由处理函数
module.exports.myinfor = (req, res) => {
    // 为了防止用户密码泄密，查询基本信息除过密码
    const sql = 'SELECT id,ulogid,uemail,unick,uimage,ustatus FROM atm.atm_user WHERE id=?';
    // 调用query方法查询用户对象的信息
    db.query(sql, req.user.id, (err, results) => {
        if (err) {
            return res.ck(err);
        }
        if (results.length !== 1) {
            return res.ck('获取用户信息失败！');
        }
        // 将用户信息响应给客户端
        res.send({
            status: 0,
            msg: '获取用户信息成功！',
            data: results[0]
        });
    });
}
//修改用户信息的路由处理函数
module.exports.updateuser = (req, res) => {
    const userinfor = req.body;
    const err = ckupdate(userinfor);
    if (err) {
        return res.ck(err);
    }
    const sqlbyuname = 'SELECT * FROM atm_user WHERE atm_user.unick=?';
    // 执行sql查询
    db.query(sqlbyuname, [userinfor.unick], function (err, results) {
        if (err) {
            return res.ck(err);
        }
        const sql = 'UPDATE atm_user SET uemail=?,unick=?,uimage=? WHERE id=?';
        db.query(sql, [userinfor.uemail, userinfor.unick, userinfor.avatar, req.user.id], (err, results) => {
            if (err) {
                return res.ck(err);
            }
            if (results.affectedRows !== 1) {
                return res.ck('修改用户信息失败，请稍后再试！');
            }
            return res.ck('基本信息修改成功！', 0);
        });
    });
}
// 获取用户粉丝的路由处理函数
module.exports.myfans = (req, res) => {
    const sql = 'SELECT atm_fans.id,atm_fans.uid,atm_user.unick,atm_user.uimage,atm_fans.ufansid,atm_fans.ustatus FROM atm.atm_fans INNER JOIN atm_user on atm_fans.ufansid=atm_user.id WHERE uid=? and atm_fans.ustatus=0';
    // 调用query方法查询用户对象的信息
    db.query(sql, req.user.id, (err, results) => {
        if (err) {
            return res.ck(err);
        }
        // 将用户信息响应给客户端
        res.send({
            status: 0,
            msg: '获取用户粉丝成功！',
            data: results
        });
    });
}
// 获取用户关注的路由处理函数
module.exports.follow = (req, res) => {
    const sql = 'SELECT atm_focus.id,atm_focus.uid,atm_user.unick,atm_user.uimage,atm_focus.ufocusid,atm_focus.ustatus FROM atm.atm_focus INNER JOIN atm_user on atm_focus.ufocusid=atm_user.id WHERE uid=? and atm_focus.ustatus=0';
    // 调用query方法查询用户对象的信息
    db.query(sql, req.user.id, (err, results) => {
        if (err) {
            return res.ck(err);
        }
        // 将用户信息响应给客户端
        res.send({
            status: 0,
            msg: '获取用户关注列表成功！',
            data: results
        });
    });
}
// 获取用户黑名单的路由处理函数
module.exports.blacklist = (req, res) => {
    const sql = 'SELECT atm_blacklist.id, atm_blacklist.uid, atm_user.unick, atm_user.uimage, atm_blacklist.ublacklistid, atm_blacklist.ustatus FROM atm.atm_blacklist INNER JOIN atm_user on atm_blacklist.ublacklistid = atm_user.id WHERE uid =? and atm_blacklist.ustatus = 1';
    // 调用query方法查询用户对象的信息
    db.query(sql, req.user.id, (err, results) => {
        if (err) {
            return res.ck(err);
        }
        // 将用户信息响应给客户端
        res.send({
            status: 0,
            msg: '获取用户黑名单列表成功！',
            data: results
        });
    });
}




// 取关的路由处理函数
module.exports.followPass = (req, res) => {
    const sql = 'UPDATE atm_focus SET ustatus=1 WHERE uid=? AND ufocusid=?';
    // 调用query方法查询用户对象的信息
    db.query(sql, [req.user.id, req.body.ufocusid], (err, results) => {
        if (err) {
            return res.ck(err);
        }
        if (results.affectedRows !== 1) {
            return res.ck('取消关注失败！');
        }
        // 将用户信息响应给客户端
        res.ck('取消关注成功', 0)
    });
}
// 加关注的路由处理函数
module.exports.followNOPass = (req, res) => {
    const sql = 'UPDATE atm_focus SET ustatus=0 WHERE uid=? AND ufocusid=?';
    // 调用query方法查询用户对象的信息
    db.query(sql, [req.user.id, req.body.ufocusid], (err, results) => {
        if (err) {
            return res.ck(err);
        }
        if (results.affectedRows !== 1) {
            return res.ck('关注失败！');
        }
        // 将用户信息响应给客户端
        res.ck('关注成功', 0)
    });
}
// 添加粉丝的路由处理函数
module.exports.Powdering = (req, res) => {
    const sql = 'UPDATE atm_fans SET ustatus=0 WHERE uid=? AND ufansid=?';
    // 调用query方法查询用户对象的信息
    db.query(sql, [req.user.id, req.body.ufansid], (err, results) => {
        if (err) {
            return res.ck(err);
        }
        if (results.affectedRows !== 1) {
            return res.ck('粉丝添加失败！');
        }
        // 将用户信息响应给客户端
        res.ck('粉丝添加成功', 0)
    });
}
// 删除粉丝的路由处理函数
module.exports.NOPowdering = (req, res) => {
    const sql = 'UPDATE atm_fans SET ustatus=1 WHERE uid=? AND ufansid=?';
    // 调用query方法查询用户对象的信息
    db.query(sql, [req.user.id, req.body.ufansid], (err, results) => {
        if (err) {
            return res.ck(err);
        }
        if (results.affectedRows !== 1) {
            return res.ck('粉丝删除失败！');
        }
        // 将用户信息响应给客户端
        res.ck('粉丝删除成功', 0)
    });
}
// 添加黑名单的路由处理函数
module.exports.NOblackuser = (req, res) => {
    const sql = 'UPDATE atm_blacklist SET ustatus=1 WHERE uid=? AND ublacklistid=?';
    // 调用query方法查询用户对象的信息
    db.query(sql, [req.user.id, req.body.ublacklistid], (err, results) => {
        if (err) {
            return res.ck(err);
        }
        if (results.affectedRows !== 1) {
            return res.ck('添加黑名单失败！');
        }
        // 将用户信息响应给客户端
        res.ck('添加成功', 0)
    });
}
// 去除黑名单的路由处理函数
module.exports.blackuser = (req, res) => {
    const sql = 'UPDATE atm_blacklist SET ustatus=0 WHERE uid=? AND ublacklistid=?';
    // 调用query方法查询用户对象的信息
    db.query(sql, [req.user.id, req.body.ublacklistid], (err, results) => {
        if (err) {
            return res.ck(err);
        }
        if (results.affectedRows !== 1) {
            return res.ck('取消黑名单失败！');
        }
        // 将用户信息响应给客户端
        res.ck('取消黑名单成功', 0)
    });
}


//自己操作后别人的数据进行改变
// 取关的路由处理函数2
module.exports.TRfollowPass = (req, res) => {
    const sql = 'UPDATE atm_focus SET ustatus=1 WHERE uid=? AND ufocusid=?';
    // 调用query方法查询用户对象的信息
    db.query(sql, [req.body.ufocusid, req.user.id], (err, results) => {
        if (err) {
            return res.ck(err);
        }
        if (results.affectedRows !== 1) {
            return res.ck('取消关注失败！');
        }
        // 将用户信息响应给客户端
        res.ck('取消关注成功', 0)
    });
}
// 添加粉丝的路由处理函数2
module.exports.TRPowdering = (req, res) => {
    const sql = 'UPDATE atm_fans SET ustatus=0 WHERE uid=? AND ufansid=?';
    // 调用query方法查询用户对象的信息
    db.query(sql, [req.body.ufansid, req.user.id], (err, results) => {
        if (err) {
            return res.ck(err);
        }
        if (results.affectedRows !== 1) {
            return res.ck('添加粉丝失败！');
        }
        // 将用户信息响应给客户端
        res.ck('添加粉丝成功', 0)
    });
}
// 删除粉丝的路由处理函数2
module.exports.TRNOPowdering = (req, res) => {
    const sql = 'UPDATE atm_fans SET ustatus=1 WHERE uid=? AND ufansid=?';
    // 调用query方法查询用户对象的信息
    db.query(sql, [req.body.ufansid, req.user.id], (err, results) => {
        if (err) {
            return res.ck(err);
        }
        if (results.affectedRows !== 1) {
            return res.ck('删除粉丝失败！');
        }
        // 将用户信息响应给客户端
        res.ck('删除粉丝成功', 0)
    });
}


// 如果数据库没有数据，进行写入
// 写入关注的处理函数
module.exports.XRfollowPass = (req, res) => {
    const sql = 'INSERT INTO atm_focus SET uid=?,ufocusid=?';
    // 调用query方法查询用户对象的信息
    db.query(sql, [req.user.id, req.body.ufocusid], (err, results) => {
        if (err) {
            return res.ck(err);
        }
        if (results.affectedRows !== 1) {
            return res.ck('关注失败！');
        }
        // 将用户信息响应给客户端
        res.ck('关注成功', 0)
    });
}
// 写入粉丝的处理函数
module.exports.XRPowdering = (req, res) => {
    const sql = 'INSERT INTO atm_fans SET uid=?,ufansid=?';
    // 调用query方法查询用户对象的信息
    db.query(sql, [req.user.id, req.body.ufansid], (err, results) => {
        if (err) {
            return res.ck(err);
        }
        if (results.affectedRows !== 1) {
            return res.ck('添加粉丝失败！');
        }
        // 将用户信息响应给客户端
        res.ck('添加粉丝成功', 0)
    });
}
// 写入黑名单的处理函数
module.exports.XRblackuser = (req, res) => {
    const sql = 'INSERT INTO atm_blacklist SET uid=?,ublacklistid=?';
    // 调用query方法查询用户对象的信息
    db.query(sql, [req.user.id, req.body.ublacklistid], (err, results) => {
        if (err) {
            return res.ck(err);
        }
        if (results.affectedRows !== 1) {
            return res.ck('添加黑名单失败！');
        }
        // 将用户信息响应给客户端
        res.ck('添加黑名单成功', 0)
    });
}


// 如果数据库没有数据，他人进行写入数据
// 写入粉丝的处理函数
module.exports.TRXRPowdering = (req, res) => {
    const sql = 'INSERT INTO atm_fans SET uid=?,ufansid=?';
    // 调用query方法查询用户对象的信息
    db.query(sql, [req.body.ufansid, req.user.id], (err, results) => {
        if (err) {
            return res.ck(err);
        }
        if (results.affectedRows !== 1) {
            return res.ck('添加粉丝失败！');
        }
        // 将用户信息响应给客户端
        res.ck('添加粉丝成功', 0)
    });
}


// 查询数据库中是否存在某数据的模块
// 获取用户粉丝的路由处理函数
module.exports.CXmyfans = (req, res) => {
    const sql = 'SELECT * FROM atm.atm_fans WHERE uid=? AND ufansid=?';
    // 调用query方法查询用户对象的信息
    db.query(sql, [req.user.id, req.body.ufansid], (err, results) => {
        if (err) {
            return res.ck(err);
        }
        if (results.length !== 1) {
            return res.ck('不存在粉丝');
        }
        res.send({
            status: 0,
            msg: '获取粉丝成功！',
            data: results
        });
    });
}
// 获取用户关注的路由处理函数
module.exports.CXfollow = (req, res) => {
    const sql = 'SELECT * FROM atm.atm_focus WHERE uid=? AND ufocusid=?';
    // 调用query方法查询用户对象的信息
    db.query(sql, [req.user.id, req.body.ufocusid], (err, results) => {
        if (err) {
            return res.ck(err);
        }
        if (results.length !== 1) {
            return res.ck('不存在关注');
        }
        res.send({
            status: 0,
            msg: '获取关注成功！',
            data: results
        });
    });
}
// 获取用户黑名单的路由处理函数
module.exports.CXblacklist = (req, res) => {
    const sql = 'SELECT * FROM atm.atm_blacklist WHERE uid=? AND ublacklistid=?';
    // 调用query方法查询用户对象的信息
    db.query(sql, [req.user.id, req.body.ublacklistid], (err, results) => {
        if (err) {
            return res.ck(err);
        }
        if (results.length !== 1) {
            return res.ck('不存在拉黑');
        }
        res.send({
            status: 0,
            msg: '获取拉黑数据成功！',
            data: results
        });
    });
}


// 查询数据库中是否存在他人某数据的模块
// 获取用户粉丝的路由处理函数2
module.exports.CXTRmyfans = (req, res) => {
    const sql = 'SELECT * FROM atm.atm_fans WHERE uid=? AND ufansid=?';
    // 调用query方法查询用户对象的信息
    db.query(sql, [req.body.ufansid, req.user.id], (err, results) => {
        if (err) {
            return res.ck(err);
        }
        if (results.length !== 1) {
            return res.ck('不存在粉丝');
        }
        res.send({
            status: 0,
            msg: '获取粉丝成功！',
            data: results
        });
    });
}
// 获取用户关注的路由处理函数2
module.exports.CXTRfollow = (req, res) => {
    const sql = 'SELECT * FROM atm.atm_focus WHERE uid=? AND ufocusid=?';
    // 调用query方法查询用户对象的信息
    db.query(sql, [req.body.ufocusid, req.user.id], (err, results) => {
        if (err) {
            return res.ck(err);
        }
        if (results.length !== 1) {
            return res.ck('不存在关注');
        }
        res.send({
            status: 0,
            msg: '获取关注成功！',
            data: results
        });
    });
}
// 获取用户黑名单的路由处理函数2
module.exports.CXTRblacklist = (req, res) => {
    const sql = 'SELECT * FROM atm.atm_blacklist WHERE uid=? AND ublacklistid=?';
    // 调用query方法查询用户对象的信息
    db.query(sql, [req.body.ublacklistid, req.user.id], (err, results) => {
        if (err) {
            return res.ck(err);
        }
        if (results.length !== 1) {
            return res.ck('不存在黑名单用户');
        }
        res.send({
            status: 0,
            msg: '获取黑名单成功！',
            data: results
        });
    });
};

// 用户页面获取该用户粉丝总数的路由处理函数
module.exports.getFansNum = (req, res) => {
    // 书写sql代码
    const sql = "SELECT COUNT(*) AS num FROM atm_fans WHERE uid=? AND ustatus=0";
    // 执行sql代码
    db.query(sql, req.user.id, function (err, results) {
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
    db.query(sql, req.user.id, function (err, results) {
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
    db.query(sql, req.user.id, function (err, results) {
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
    db.query(sql, req.user.id, function (err, results) {
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
    const sql = 'SELECT atm_book.id,atm_book.tcontent,atm_book.tname,atm_book.ttime,atm_user.unick,atm_type.type FROM atm_book INNER JOIN atm_user on atm_book.author_id = atm_user.id INNER JOIN atm_type on atm_book.ttype = atm_type.id WHERE tisdel=0 AND author_id=? ORDER BY atm_book.ttime DESC ';
    // 获取sql代码
    db.query(sql, req.user.id, function (err, results) {
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
    db.query(sql, [body.id, body.author_id], function (err, results) {
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
