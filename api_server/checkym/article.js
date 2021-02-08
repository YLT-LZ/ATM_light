// 导入表单验证的模块
const joi = require("@hapi/joi");

// 评论接口的验证
const ckComment = joi.object({
    // 评论帖子的id
    ubookid: joi.number().integer().min(1).required().error(new Error("当前帖子的ID格式有误！")),
    // 评论用户的id
    uid: joi.number().integer().min(1).required().error(new Error("当前用户的ID格式有误！")),
    // 评论的内容
    utxt: joi.string().required().error(new Error("评论内容格式有误！")),
    // 文章作者的id
    authorid: joi.number().integer().min(1).required().error(new Error("当前文章作者的ID格式有误！"))
});

// 在exprots对象下创建schema属性，用于存放表单验证的规则
module.exports.schema = {
    ckComment: ckComment
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