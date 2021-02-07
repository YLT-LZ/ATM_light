//【用户论坛操作】【需要身份认证】
// 导入数据库模块
const db = require("../db/mysql");
// 导入path路径模块
const path = require('path');
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