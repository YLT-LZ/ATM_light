// 导入express模块
const express = require("express");
// 创建服务器
const app = express();
// 导入user模块
const user = require("./router/user");
// 导入userifor模块
const userinfor = require("./router/userinfor");
// 导入cors跨域模块
const cors = require("cors");
// 导入解析token令牌的模块
const express_jwt = require("express-jwt");
// 导入配置文件
const config = require("./config");

// 配置跨域请求中间件
app.use(cors());

// 解析 x-www-form-urlencoded 数据
app.use(express.urlencoded({ extended: false }));

// 创建全局中间件，并对res.send()函数进一步封装
app.use(function(req, res, next) {
    // 在res对象下创建ck属性函数，并接收异常对象和默认参数status=1
    res.ck = function(error, status = 1) {
        // 调用res.send方法，并响应状态和异常信息数据
        res.send({
            // 状态
            status: status,
            // 异常信息：如果error是异常对象的实例，则调用异常信息，否则直接响应异常字符串
            message: error instanceof Error ? error.message : error
        });
    };
    // 调用下一个中间件
    next();
});

// 配置并使用express_jwt解析包
app.use(express_jwt({
    secret: config.jwtSecretkey,
    algorithms: ["HS256"],
}).unless({
    path: [/^\/api\//]
}));

// 使用user模块
app.use("/api", user);

// 使用userinfor模块
app.use("/my", userinfor);

// 创建全局的错误级别的中间件
app.use(function(err, req, res, next) {
    if (err.name === "UnauthorizedError") {
        return res.ck("身份认证失败,无效的验证码！");
    }
    next();
});

// 监听服务器
app.listen("8024", "127.0.0.1", () => {
    return console.log("http://127.0.0.1:8024 服务器开启成功！");
});