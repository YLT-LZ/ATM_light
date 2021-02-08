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
router.post('/resetpwd', routerHandler.resetpwd);

// 用户页面获取该用户粉丝总数的路由接口
router.get("/getFansNum", routerHandler.getFansNum);

// 用户页面获取该用户关注总数的路由接口
router.get("/getFocusNum", routerHandler.getFocusNum);

// 用户页面获取该用户帖子总数的路由接口
router.get("/getCardNum", routerHandler.getCardNum);

// 用户页面获取该帖子评论总数的路由接口
router.get("/getCommentNum", routerHandler.getCommentNum);

// 获取用户全部文章的路由接口
router.get("/getCardAll", routerHandler.getCardAll);

// 根据作者id和帖子编号删除帖子的路由接口
router.post("/delcardByidAnduid", routerHandler.delcardByidAnduid);

// 将路由对象共享出去
module.exports = router;