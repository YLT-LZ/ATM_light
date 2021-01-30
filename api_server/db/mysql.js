// 导入mysql模块
const mysql = require("mysql");

// 配置数据库连接对象
const db = mysql.createPool({
    host: "127.0.0.1",
    user: "root",
    password: "wmx040608..",
    database: "atm"
});

// 共享数据库对象
module.exports = db;