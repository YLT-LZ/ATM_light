// 发送邮件
const config = require("../config");
// 需要用到emailjs模块
const {
    SMTPClient
} = require("emailjs");
const client = new SMTPClient({
    user: config.myEmail,
    password: config.myKey,
    host: 'smtp.qq.com',
    ssl: true
});

module.exports = (code, toemail) => {
    var errors = null;
    client.send({
        text: `光明顶认证服务。确保是本人操作,请在60s内前往认证,验证码为【${code}】`,
        from: config.myEmail,
        to: toemail,
        subject: "to-光明顶"
    }, (err, msg) => {
        error = err;
    });
    if (errors) {
        return errors;
    }
    return 0;
}