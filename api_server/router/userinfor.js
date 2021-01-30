const exprss = require('express');
// 创建路由对象
const router = exprss.Router();
const userHandler = require('../router_handler/userinfor');
// 验证验证码并且返回新的token值
router.post('/yzecode', userHandler.yzecode);
// 找回密码
router.post('/resetpwd', userHandler.resetpwd)
// 将路由对象共享出去
module.exports = router;