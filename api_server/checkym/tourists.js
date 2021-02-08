// 导入表单验证的模块
const joi = require("@hapi/joi");

//全部帖子的验证规则
const articleAll = joi.object({
    start: joi.number().integer().required().min(0).error(new Error("起始数量格式有误!")),
    number: joi.number().integer().required().min(5).error(new Error("数量格式有误!")),
    sort: joi.string().required().allow("ASC").allow("DESC").error(new Error("排序格式有误!"))
});

// 根据类型获取帖子的验证规则
const articleType = joi.object({
    start: joi.number().integer().required().min(0).error(new Error("起始数量格式有误!")),
    number: joi.number().integer().required().min(5).error(new Error("数量格式有误!")),
    sort: joi.string().required().allow("ASC").allow("DESC").error(new Error("排序格式有误!")),
    type: joi.number().integer().required().min(1).error(new Error("类型格式有误!"))
});

const cardID = joi.object({
    cardID: joi.number().integer().min(1).required().error(new Error("当前帖子ID格式有误！"))
});

// 在exprots对象下创建schema属性，用于存放表单验证的规则
module.exports.schema = {
    // 全部帖子的验证规则
    articleAll: articleAll,
    // 根据类型获取帖子的验证规则
    articleType: articleType,
    cardID: cardID
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
};