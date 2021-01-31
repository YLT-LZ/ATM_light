// 管理员模块的路由接口：不需要身份认证
// 导入express模块
const express = require("express");
// 创建路由对象
const router = express.Router();
// 导入路由处理函数模块
const routerHandler = require("./../router_handler/user");
// 给管理员发送找回密码邮箱验证码的路由接口
router.post("/Afpwd", routerHandler.Afpwd);
// 根据管理员账号获取管理员数据的路由接口
router.post("/Alogid", routerHandler.Alogid);
// 给管理员发送注册邮箱验证码路由接口
router.post("/Areg", routerHandler.Areg);
// 管理员登录的路由接口
router.post("/Alogin", routerHandler.Alogin);
// 创建注册新用户的接口
router.post('/reguser', routerHandler.reguser);
// 创建登录的接口
router.post('/login', routerHandler.login);
// 找回密码查询用户信息接口
router.post('/getuser', routerHandler.getuser);
// 验证码发送验证接口
router.post('/getecode', routerHandler.getecode);
// 申诉接口
router.post('/appeal', routerHandler.appeal);
// 将路由对象共享出去
module.exports = router;