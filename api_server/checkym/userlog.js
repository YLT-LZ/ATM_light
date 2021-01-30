const joi = require('@hapi/joi');
// 做用户登录信息的验证规则
const schema = joi.object({
    ulogid: joi.string().alphanum().min(6).max(11).required().error(new Error('输入登录账号格式有误！')),
    upwd: joi.string().min(6).max(18).required().error(new Error('用户密码为6-18位任意字符！'))
});
module.exports = function (data) {
    var { error, value } = schema.validate(data);
    if (error) {
        return error;
    }
    return null;
};