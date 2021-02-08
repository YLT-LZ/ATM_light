// 【用户论坛操作】【需要身份认证】
const express = require('express');
const router = express.Router();
const routerHandler = require('../router_handler/article');
// 发布文章的路由
router.post('/add', routerHandler.addArticle);
// 写入评论的路由接口
router.post("/setComment", routerHandler.setComment);
module.exports = router
