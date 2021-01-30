const joi = require('@hapi/joi');
/* 
 string(),数据必须为字符串
 alphanum(),值只能包含a-z，A-Z，0-9的字符
 min(length),值最小长度
 max(length),值最大长度
 required(),值为必填项，不能为undefined
 pattern(正则表达式)，值必须要符合正则表达式要求
*/
// 做用户名的验证规则
const schema = joi.object({
    unick: joi.string().required().error(new Error('输入用户名格式有误！')),
    uemail: joi.string().required().pattern(/^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/).error(new Error('输入邮箱格式有误！')),
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