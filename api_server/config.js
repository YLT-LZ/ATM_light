// 导入发送邮件的模块
const nodemailer = require("nodemailer");

// 公司邮箱
module.exports.ourEmail = "inlett_wang@163.com";
// 配置密钥
module.exports.jwtSecretkey = "atm_gmd-_-";

// 创建可重用的邮件传输器
module.exports.transporter = nodemailer.createTransport({
    host: "smtp.163.com",
    secureConnection: true,
    port: 465, //SMTP端口
    secure: true, //使用了SSL
    auth: {
        user: "inlett_wang@163.com", //公司邮箱
        pass: "CQSZQODRYYAHLGJQ" //公司163邮箱授权码
    }
});