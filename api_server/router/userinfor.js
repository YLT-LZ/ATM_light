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

// 开放接口
module.exports = router;