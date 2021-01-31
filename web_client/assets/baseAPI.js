// 每次只要使用js中的ajax请求，不区分请求方式，在发起请求之前都会先调用这个函数
// 所有，调用的ajax的参数全部以options参数的形式传入这个回调函数
$.ajaxPrefilter(function (options) {
    options.url = "http://127.0.0.1:8024" + options.url;
});

$(function () {
    // 如果本地中存储的用户登录状态不为trur
    if (!sessionStorage.getItem("status")) {
        // 那么就清空本地中的身份信息
        localStorage.clear();
    }
});