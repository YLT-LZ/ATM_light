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

    // 在加载的时候就调用
    $("#btn-recreat").click();
    getData("html-top", "#top ul");
});

// 取消表单的默认提交事件
$("form.navbar-form").on("submit", (e) => {
    e.preventDefault();
    $("#control").val("");
});


//鼠标移入图片的事件
$("div.box-show").on("mousemove", "img", function() {
    $(this).addClass("hover");
});
// 鼠标移出图片的事件
$("div.box-show").on("mouseout", "img", function() {
    $(this).removeClass("hover");
});

// 点击列表后的事件
$("div.box-show").on("click", "li", function(e) {
    console.log($(this).attr("data-hide"));
    // 将文章的id存入本地
    localStorage.setItem("cardID", $(this).attr("data-hide"));
    // 跳转到查看文章的页面
    location.href = "./page/user/user_lookcard.html";
});

$("#top>ul").on("click", "li", function(e) {
    // 将文章的id存入本地
    localStorage.setItem("cardID", $(this).attr("data-hide"));
    // 跳转到查看文章的页面
    location.href = "./page/user/user_lookcard.html";
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


// 按钮组点击事件
// 娱乐
$("#btn-recreat").on("click", function(e) {
    $("#box-recreat").show().siblings("div").hide();
    getData("html-recreat", "#box-recreat ul", 1);
});
// 杂谈
$("#btn-talk").on("click", function(e) {
    $("#box-talk").show().siblings("div").hide();
    getData("html-talk", "#box-talk ul", 2);
});
// 经济
$("#btn-eco").on("click", function(e) {
    $("#box-eco").show().siblings("div").hide();
    getData("html-eco", "#box-eco ul", 3);

});
// 军事
$("#btn-mil").on("click", function(e) {
    $("#box-mil").show().siblings("div").hide();
    getData("html-mil", "#box-mil ul", 4);

});
// 旅游
$("#btn-tour").on("click", function(e) {
    $("#box-tour").show().siblings("div").hide();
    getData("html-tour", "#box-tour ul", 5);
});

// ajax请求服务器
function getData(id, className, type = null) {
    if (!type) {
        $.ajax({
            type: "GET",
            url: "/api/tourist/getArtBeforeNum?start=0&sort=DESC&number=7",
            success: function(results) {
                if (results.status !== 0) {
                    return layer.open({
                        title: '提示',
                        icon: "2",
                        content: "获取数据帖子列表失败!"
                    });
                }
                var htmlStr = template(id, results);
                $(className).html(htmlStr);
            }
        });
    } else if (type) {
        $.ajax({
            type: "GET",
            url: `/api/tourist/getArtByTypeBeforeNum?start=0&sort=DESC&number=7&type=${type}`,
            success: function(results) {
                if (results.status !== 0) {
                    return layer.open({
                        title: '提示',
                        icon: "2",
                        content: "获取数据帖子列表失败!"
                    });
                }
                for (let i = 0; i < results.data.length; i++) {
                    results.data[i].praise = randnum(3);
                    results.data[i].look = randnum(4);
                }
                var htmlStr = template(id, results);
                $(className).html(htmlStr);
            }
        });
    }
}

// 时间过滤器
template.defaults.imports.formatTime = function(data) {
    var date = new Date(data);
    let y = date.getFullYear();
    let m = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
    let d = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    let h = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
    let mm = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    let s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
    return `${y}-${m}-${d} ${h}:${mm}:${s}`;
};

// 随机数
function randnum(num) {
    var code = "";
    for (var i = 0; i < num; i++) {
        // 0-9随机数
        const randomNum = Math.floor(Math.random() * 10 + 1);
        code += randomNum;
    }
    return code;
}