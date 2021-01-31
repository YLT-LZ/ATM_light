//导入@hapi/joi第三方中间件
const joi = require("@hapi/joi");
const schema = joi.object({
    newpwd: joi.string().min(6).max(18).required().error(new Error('新密码为6-18位任意字符！')),
    // 重复密码和新密码的值保持一致,joi.ref()方法可以判断两个值是相等的
    aginpwd: joi.any().valid(joi.ref('newpwd')).error(new Error("重复密码和新密码不一致"))
});
// 共享检验规则函数
module.exports = (data) => {
    // 解构schema.validate对象
    var {
        error,
        value
    } = schema.validate(data);
    // 如果检验不匹配,那么返回检验提示信息,否则返回null
    if (error) {
        return error;
    }
    return null;
}