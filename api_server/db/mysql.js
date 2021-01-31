// 导入mysql模块
const mysql = require('mysql');
// 创建数据库的连接对象
const db = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '19991025',
    database: 'atm'
});
// 将db对象共享
module.exports = db;