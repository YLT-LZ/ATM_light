const joi = require('@hapi/joi');
// const { json } = require('express');

const sendemail = joi.object({
    id: joi.number().integer().min(1).required().error(new Error('id类型错误')),
    uemail: joi.string().required().pattern(/^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/).error(new Error('输入邮箱格式有误！'))

});

module.exports.schema = {
    sendemail: sendemail
};

module.exports.validate = function (data, schema) {
    var { error, value } = schema.validate(data);
    if (error) {
        return error;
    }
    return null;
};