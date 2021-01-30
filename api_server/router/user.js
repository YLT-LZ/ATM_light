const exprss = require('express');
// 创建路由对象
const router = exprss.Router();
// 导入用户路由处理函数模块
const userHandler = require('../router_handler/user');
// 创建注册新用户的接口
router.post('/reguser', userHandler.reguser);
// 创建登录的接口
router.post('/login', userHandler.login);
// 找回密码查询用户信息接口
router.post('/getuser', userHandler.getuser);
// 验证码发送验证接口
router.post('/getecode', userHandler.getecode);
// 申诉接口
router.post('/appeal', userHandler.appeal);
// 将路由对象共享出去
module.exports = router;