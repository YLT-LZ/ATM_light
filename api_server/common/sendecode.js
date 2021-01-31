// 发送邮件
const config = require("../config");
// 需要用到emailjs模块
const {
    SMTPClient
} = require("emailjs");
const client = new SMTPClient({
    user: config.ourEmail,
    password: config.myKey,
    host: 'smtp.163.com',
    ssl: true
});

module.exports = (code, toemail) => {
    var errors = null;
    client.send({
        text: `当前正在源码空间中找回用户密码,确保是本人操作,请在60s内前往认证,验证码为【${code}】`,
        from: config.ourEmail,
        to: toemail,
        subject: "源码空间找回密码"
    }, (err, msg) => {
        error = err;
    });
    if (errors) {
        return errors;
    }
    return 0;
}