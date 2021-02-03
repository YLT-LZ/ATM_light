$(function() {
    // 用户认证的回调函数
    authen(
        // token令牌
        "Atoken",
        // 身份认证失败执行的函数
        () => {
            return layer.open({
                title: '提示',
                icon: 2,
                content: "身份认证失败，请先登录！",
                btn: ["确定"],
                yes: function() {
                    window.parent.location.href = "../../Background_login.html";
                }
            });

        },
        // 身份认证成功执行的函数
        () => {
            return;
        });
});