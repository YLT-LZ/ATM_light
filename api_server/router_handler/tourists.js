// 游客论坛操作【不需要身份认证】

// 导入数据验证模块
const checkym = require("../checkym/tourists");
// 导入数据库模块
const db = require("../db/mysql");

//获取(前10条)未删除帖子数据的路由处理函数
module.exports.getArtBeforeNum = function(req, res) {
    // 验证数据
    const error = checkym.validate(req.query, checkym.schema.articleAll);
    // 如果验证结果不为空
    if (error) {
        // 则响应验证结果
        return res.ck(error);
    }
    // 书写sql代码
    const sql = `SELECT atm_book.id,atm_book.tcontent,atm_book.tname,atm_book.ttime,atm_user.unick,
    atm_type.type FROM atm_book INNER JOIN atm_user on atm_book.author_id = atm_user.id
     INNER JOIN atm_type on atm_book.ttype = atm_type.id
     WHERE tisdel=0 ORDER BY atm_book.ttime ${req.query.sort} LIMIT ${req.query.start},${req.query.number}`;
    db.query(sql, function(err, results) {
        // 如果数据库异常
        if (err) {
            // 则响应异常对象
            return res.ck(err);
        }
        // 如果结果集的长度小于等于0
        if (results.length <= 0) {
            // 响应结果
            return res.ck("获取帖子列表失败!");
        }
        // 否则获取到数据,响应的数据
        return res.send({
            status: 0,
            msg: "获取帖子列表成功!",
            data: results
        });
    });
};

// 根据类型获取(前10条)未删除帖子数据的路由处理函数
module.exports.getArtByTypeBeforeNum = function(req, res) {
    // 对数据验证
    const error = checkym.validate(req.query, checkym.schema.articleType);
    // 如果验证结果不为空
    if (error) {
        // 响应验证结果
        return res.ck(error);
    }
    // 书写sql代码
    const sql = `SELECT atm_book.id,atm_book.tcontent,atm_book.tname,atm_book.ttime,atm_user.unick,
    atm_type.type FROM atm_book INNER JOIN atm_user on atm_book.author_id = atm_user.id INNER JOIN atm_type
     on atm_book.ttype = atm_type.id
     WHERE tisdel=0 AND ttype=${req.query.type} ORDER BY atm_book.ttime ${req.query.sort} 
     LIMIT ${req.query.start},${req.query.number}`;
    // 获取sql代码
    db.query(sql, function(err, results) {
        // 如果数据库异常
        if (err) {
            // 响应并返回异常对象
            return res.ck(err);
        }
        // 如果结果集中的长度小于等于0
        if (results.length <= 0) {
            return res.ck("获取帖子列表失败!");
        }
        return res.send({
            status: 0,
            msg: "获取帖子列表成功!",
            data: results
        });
    })
};

// 根据文章ID获取未删除评论的路由处理函数
module.exports.getComment = function(req, res) {
    // 对帖子的id进行认证
    const error = checkym.validate(req.query, checkym.schema.cardID);
    // 如果验证结果不为空
    if (error) {
        // 则响应验证结果
        return res.ck(error);
    }
    // 书写sql代码
    const sql = "SELECT atm_comments.id,atm_user.unick,atm_comments.utxt,atm_comments.utime  FROM atm_comments INNER JOIN atm_user ON atm_comments.uid=atm_user.id WHERE ubookid=? AND isdel=0";
    // 执行sql代码
    db.query(sql, req.query.cardID, (err, results) => {
        // 如果sql代码异常
        if (err) {
            // 返回异常对象
            return res.ck(err);
        }
        // 如果查询到结果集中的长度小于1
        if (results.length < 1) {
            return res.ck("获取该帖子评论列表失败！");
        }
        return res.send({
            status: 0,
            msg: "获取该帖子评论列表成功！",
            data: results
        });
    });
};