// 【游客论坛操作】【不需要身份认证】

// 导入express模块
const express = require("express");
// 导入路由处理函数模块
const routerHandler = require("../router_handler/tourists");
// 创建路由对象
const router = express.Router();

// 获取前10条文章数据的路由接口
router.get("/getArtBeforeNum", routerHandler.getArtBeforeNum);

// 根据类型获取前10条文章的路由接口
router.get("/getArtByTypeBeforeNum", routerHandler.getArtByTypeBeforeNum);

// 获取某个文章评论的路由接口
router.get("/getComment", routerHandler.getComment);

// 向外界公开接口
module.exports = router;