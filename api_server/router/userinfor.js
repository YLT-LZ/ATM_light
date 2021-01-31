// 管理员模块的路由接口，需要身份认证
// 导入express模块
const express = require("express");
// 创建路由对象
const router = express.Router();
// 导入路由处理函数模块
const routerHandler = require("./../router_handler/userinfor");
// 【忘记密码】：修改密码的接口
router.post("/Afsetpwd", routerHandler.fsetpwd);
//【忘记密码】：验证输入的邮箱验证码是否合格的接口
router.post("/AfpwdCode", routerHandler.fpwdCode);
// 注册管理员的接口
router.post("/Aregister", routerHandler.register);
// 验证验证码并且返回新的token值
router.post('/yzecode', routerHandler.yzecode);
// 找回密码
router.post('/resetpwd', routerHandler.resetpwd)
// 将路由对象共享出去
module.exports = router;