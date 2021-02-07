// 【用户论坛操作】【需要身份认证】
const express = require('express');
const router = express.Router();
const articleHandler = require('../router_handler/article');
// 发布文章的路由
router.post('/add', articleHandler.addArticle);
module.exports = router