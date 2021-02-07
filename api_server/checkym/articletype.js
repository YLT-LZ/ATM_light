const joi = require('@hapi/joi');
const { json } = require('express');
const addtype = joi.object({
    type: joi.string().required().min(2).max(10).error(new Error('文章类型格式错误！'))
});

const deltype = joi.object({
    id: joi.number().integer().min(1).required().error(new Error('请选择要删除的文章类型！'))
});

const updtype = joi.object({
    type: joi.string().required().min(2).max(10).error(new Error('文章类型格式错误！')),
    id: joi.number().integer().min(1).required().error(new Error('请选择要删除的文章类型！'))
});

const aritle = joi.object({
    tname: joi.string().required().min(1).max(40).error(new Error('文章标题必填')),
    tcontent: joi.string().required().allow('').error(new Error('文章内容丢失')),
    ttype: joi.number().integer().min(1).required().error(new Error('文章类型出错！')),
});

const plsc = joi.object({
    txt: joi.string().max(255).error(new Error('评论内容最长为255个字符！'))
})

module.exports.schema = {
    addtype: addtype,
    deltype: deltype,
    updtype: updtype,
    aritle: aritle,
    plsc: plsc
};

module.exports.validate = function (data, schema) {
    var { error, value } = schema.validate(data);
    if (error) {
        return error;
    }
    return null;
};