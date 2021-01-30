// 管理员模块的表单数据验证(不需要身份验证)

// 导入表单验证的模块
const joi = require("@hapi/joi");

// 管理员登录的验证规则
const alogin = joi.object({
    // 账号：字符串类型、不为空、值只能包含[0-9a-zA-Z]、最小长度6，最大长度11
    alogid: joi.string().required().alphanum().min(6).max(11).error(new Error("管理员登录账号格式有误！")),
    // 密码：字符串类型，不为空，最大长度6，最大长度18
    apwd: joi.string().required().min(6).max(18).error(new Error("管理员登录密码格式有误！"))
});

// 管理员账号、密码、邮箱、昵称的验证规则
const ipen = joi.object({
    // 账号：字符串类型、不为空、值只能包含[0-9a-zA-Z]、最小长度6，最大长度11
    alogid: joi.string().required().alphanum().min(6).max(11).error(new Error("管理员登录账号格式有误！")),
    // 密码：字符串类型，不为空，最大长度6，最大长度18
    apwd: joi.string().required().min(6).max(18).error(new Error("管理员登录密码格式有误！")),
    // 邮箱：字符串类型，不为空，使用正则匹配
    aemail: joi.string().required().pattern(/^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/).error(new Error("管理员邮箱格式有误！")),
    // 昵称：字符串类型，不为空，最小长度1，最大长度24
    anick: joi.string().required().min(1).max(24).error(new Error("管理员昵称格式有误！"))
});

// 验证管理员账号
const alogid = joi.object({
    // 账号：字符串类型、不为空、值只能包含[0-9a-zA-Z]、最小长度6，最大长度11
    alogid: joi.string().required().alphanum().min(6).max(11).error(new Error("管理员登录账号格式有误！"))
});

// 验证管理员账号和邮箱格式
const aidEmail = joi.object({
    // 账号：字符串类型、不为空、值只能包含[0-9a-zA-Z]、最小长度6，最大长度11
    alogid: joi.string().required().alphanum().min(6).max(11).error(new Error("管理员登录账号格式有误！")),
    aemail: joi.string().required().pattern(/^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/).error(new Error("管理员邮箱格式有误！")),
});




// 在exprots对象下创建schema属性，用于存放表单验证的规则
module.exports.schema = {
    // 用户登录的表单验证规则
    alogin: alogin,
    // 管理员账号、密码、邮箱、昵称的验证规则
    ipen: ipen,
    // 验证管理员账号
    alogid: alogid,
    // 验证管理员账号和邮箱
    aidEmail: aidEmail,
};

// 在exports下对象下创建validate属性函数，用于对客户端响应的数据验证后的结果进行解构
module.exports.validate = function(data, schema) {
    // 对传入的数据进行数据验证，并将验证后的结果进行解构
    let { error, value } = schema.validate(data);
    // 判断解构后的异常字符串是否不为空
    if (error) {
        // 如果不为空则返回异常字符串
        return error;
    }
    // 否则返回null
    return null;
};