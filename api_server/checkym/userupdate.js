const joi = require('@hapi/joi');
// 做用户信息的验证规则
const schema = joi.object({
    uemail: joi.string().required().pattern(/^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/).error(new Error('输入邮箱格式有误！')),
    unick: joi.string().max(16).error(new Error('用户昵称格式！')),
    avatar: joi.string().dataUri().required().error(new Error('请选择图像'))
});
module.exports = function (data) {
    var { error, value } = schema.validate(data);
    if (error) {
        return error;
    }
    return null;
};