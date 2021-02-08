// 【用户论坛操作】【需要身份认证】

// 导入express模块
const express = require("express");
// 导入路由处理函数模块
const routerHandler = require("../router_handler/article");
// 创建路由对象
const router = express.Router();

// 写入评论的路由接口
router.post("/setComment", routerHandler.setComment);


// 向外界公开接口
module.exports = router;