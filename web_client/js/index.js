$(function() {
    // 用户认证的回调函数
    authen(
        // token令牌
        "token",
        // 身份认证失败执行的函数
        null,
        // 身份认证成功执行的函数
        () => {
            $("#center").css("line-height", "50px").show().parent("li").siblings("li").hide();
        });



    // 点击登录的事件
    $("#login").on("click", function() {
        // 跳转到登录页面上
        location.href = "./login.html";
    });

    //点击注册的事件
    $("#register").on("click", function() {
        // 页面之间的通信
        sessionStorage.setItem("register", true);
        // 跳转到登录页面上
        location.href = "./login.html";
    });
});