// 管理员模块的表单数据验证(需要需要身份验证)

// 导入表单验证的模块
const joi = require("@hapi/joi");

// 注册验证
const register = joi.object({
    // 账号：字符串类型、不为空、值只能包含[0-9a-zA-Z]、最小长度6，最大长度11
    alogid: joi.string().required().alphanum().min(6).max(11).error(new Error("管理员登录账号格式有误！")),
    // 密码：字符串类型，不为空，最大长度6，最大长度18
    apwd: joi.string().required().min(6).max(18).error(new Error("管理员登录密码格式有误！")),
    // 邮箱：字符串类型，不为空，使用正则匹配
    aemail: joi.string().required().pattern(/^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/).error(new Error("管理员邮箱格式有误！")),
    // 昵称：字符串类型，不为空，最小长度1，最大长度24
    anick: joi.string().required().min(1).max(24).error(new Error("管理员昵称格式有误！")),
    code: joi.string().required().error(new Error("授权码不能为空"))
});

// 验证邮箱和验证码
const aemail = joi.object({
    aemail: joi.string().required().pattern(/^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/).error(new Error("管理员邮箱格式有误！")),
    code: joi.string().required().error(new Error("授权码不能为空"))
});

// 忘记密码验证新密码和重复密码
const setpwd = joi.object({
    // 新密码：不能与旧密码的值相同
    newpwd: joi.string().required().min(6).max(18).error(new Error("新密码格式有误！")),
    // 重复密码：类型任意，不能为空，校验规则：必须和新密码相同
    redopwd: joi.string().required().valid(joi.ref("newpwd")).error(new Error("重复密码和新密码不一致！"))
});


// 删除帖子：验证帖子id和作者id
const delCard = joi.object({
    id: joi.number().integer().required().min(1).error(new Error("帖子ID格式有误！")),
    author_id: joi.number().integer().required().min(1).error(new Error("作者ID格式有误！"))
});

// 在exprots对象下创建schema属性，用于存放表单验证的规则
module.exports.schema = {
    // 注册验证
    register: register,
    // 验证管理员邮箱
    aemail: aemail,
    // 验证新密码和旧密码
    setpwd: setpwd,
    // 验证帖子ID和作者ID
    delCard: delCard
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