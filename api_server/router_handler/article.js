//【用户论坛操作】【需要身份认证】
// 导入数据库模块
const db = require("../db/mysql");
// 导入path路径模块
const path = require('path');
// 导入数据验证模块
const checkym = require("../checkym/article");
const ckarttype = require('../checkym/articletype');
//发布文章的路由处理函数
module.exports.addArticle = (req, res) => {
    const err = ckarttype.validate(req.body, ckarttype.schema.aritle);
    if (err) {
        return res.ck(err);
    }
    const articleinfor = {
        ...req.body,
        ttime: new Date(),
        author_id: req.user.id
    }
    const sql = 'INSERT INTO atm_book SET ?';
    db.query(sql, articleinfor, (err, results) => {
        if (err) {
            return res.ck(err);
        }
        if (results.affectedRows !== 1) {
            return res.ck('发布文章失败！');
        }
        res.ck('发布文章成功！', 0);
    });
}
// 写入评论的路由处理函数
module.exports.setComment = (req, res) => {
    // 将传入的数据组包成一个对象
    const value = { ...req.body, uid: req.user.id };
    // 对组包后的对象进行数据验证
    const error = checkym.validate(value, checkym.schema.ckComment);
    // 如果验证结果不为空
    if (error) {
        // 则将验证结果响应回去
        return res.ck(error);
    }
    // 书写sql代码
    const sql = "INSERT INTO atm_comments SET ?";
    // 执行sql代码
    db.query(sql, value, function (err, results) {
        // 如果sql代码异常
        if (err) {
            // 返回并响应异常结构
            return res.ck(err);
        }
        // 如果受影响的行数不为1
        if (results.affectedRows !== 1) {
            return res.ck("评论写入失败");
        }
        return res.ck("评论成功！", 0);
    });
};
