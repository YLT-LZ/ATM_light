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
// 获取用户信息的接口
router.get('/myinfor', routerHandler.myinfor)
// 修改用户信息的接口
router.post('/updateuser', routerHandler.updateuser)
// 获取粉丝列表的接口
router.get('/myfans', routerHandler.myfans)
// 获取用户关注列表的接口
router.get('/follow', routerHandler.follow)
// 获取用户黑名单列表的接口
router.get('/blacklist', routerHandler.blacklist)
// 取关的路由
router.post('/followPass', routerHandler.followPass)
// 加关注的路由
router.post('/followNOPass', routerHandler.followNOPass)
// 添加粉丝的路由
router.post('/Powdering', routerHandler.Powdering)
// 删除粉丝的路由
router.post('/NOPowdering', routerHandler.NOPowdering)
// 添加黑名单的路由
router.post('/NOblackuser', routerHandler.NOblackuser)
// 去除黑名单的路由
router.post('/blackuser', routerHandler.blackuser)
// -----------------------------------------------------------
// 他人操作区
// 取关的路由2
router.post('/TRfollowPass', routerHandler.TRfollowPass)
// 添加粉丝的路由2
router.post('/TRPowdering', routerHandler.TRPowdering)
// 删除粉丝的路由2
router.post('/TRNOPowdering', routerHandler.TRNOPowdering)
// ------------------------------------------------------------
// 如果数据库没有数据，进行写入
// 写入关注的处理函数
router.post('/XRfollowPass', routerHandler.XRfollowPass)
// 写入粉丝的处理函数
router.post('/XRPowdering', routerHandler.XRPowdering)
// 写入黑名单的处理函数
router.post('/XRblackuser', routerHandler.XRblackuser)
// -----------------------------------------------------------
// 如果数据库没有数据，他人进行写入数据
// 写入粉丝的处理函数
router.post('/TRXRPowdering', routerHandler.TRXRPowdering)
// ---------------------------------------------------------
// 查询数据库中是否存在某数据的模块
// 获取用户粉丝的路由处理函数
router.post('/CXmyfans', routerHandler.CXmyfans)
// 获取用户关注的路由处理函数
router.post('/CXfollow', routerHandler.CXfollow)
// 获取用户黑名单的路由处理函数
router.post('/CXblacklist', routerHandler.CXblacklist)
//---------------------------------------------------------
// 查询数据库中是否存在他人某数据的模块
// 获取用户粉丝的路由处理函数
router.post('/CXTRmyfans', routerHandler.CXTRmyfans)
// 获取用户关注的路由处理函数
router.post('/CXTRfollow', routerHandler.CXTRfollow)
// 获取用户黑名单的路由处理函数
router.post('/CXTRblacklist', routerHandler.CXTRblacklist)

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