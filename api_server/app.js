// 导入express模块
const express = require('express');
// 创建一个express服务器对象
const app = express();
// 导入cors中间件
const cors = require('cors');
// 将cors注册为全局的中间件
app.use(cors());
// 配置解析表单数据的中间件
app.use(express.urlencoded({ extended: false }));
// 导入解析Token的中间件
const expressJwt = require('express-jwt');
// 导入解析使用的Secrerkey
const config = require('./config');
// 响应数据的中间件
app.use(function (req, res, next) {
    // status=0代表成功，status=1代表失败，默认将status的值设置为1，5
    res.ck = function (err, status = 1) {
        res.send({
            status: status,
            msg: (err instanceof Error ? err.message : err)
        });
    };
    next();
});
app.use(expressJwt({ secret: config.jwtSecretkey, algorithms: ['HS256'] }).unless({ path: [/^\/api\//] }));
const userRouter = require('./router/user');
app.use('/api', userRouter);
const userinforRouter = require('./router/userinfor')
app.use('/my', userinforRouter);
app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        return res.ck("Token值无效，请检查登录状态")
    }
})
// 调用app的listen方法，指定端口号并启动服务器
app.listen(8024, '127.0.0.1', () => {
    console.log("服务器成功开启！访问http://127.0.0.1:8024");
});