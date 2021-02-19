$(function () {
    // 用户认证的回调函数
    authen(
        // token令牌
        "token",
        // 身份认证失败执行的函数
        () => {
            return layer.open({
                title: '提示',
                icon: 2,
                content: "身份认证失败，请先登录！",
                btn: ["确定"],
                yes: function () {
                    location.href = "../../login.html";
                }
            });
        },
        // 身份认证成功执行的函数
        () => {
            // 通过服务器获取作者数据数量的函数
            getData();
            // 获取作者帖子列表的函数
            all();
        });

});

// 浏览帖子的事件
$("#postList>ul").on("click", "li", function () {
    // 将文章的id存入本地
    localStorage.setItem("cardID", $(this).attr("data-hide"));
    location.href = "../../page/user/user_lookcard.html";
});

// 删除帖子的事件
$("#postList>ul").on("click", "li .layui-btn-group #btn-delete", function (e) {
    e.stopPropagation();
    // 获取帖子编号，并转换为整数类型
    let id = parseInt($(this).attr("data-authorid"));
    // 如果编号不存在
    if (id === undefined) {
        return layer.open({
            title: "提示",
            icon: 2,
            content: "删除异常，请联系管理员！",
            anim: 1
        });
    }
    // 否则编号存在，询问用户是否删除
    return layer.confirm('您确定删除该帖子吗？', {
        icon: 3,
        title: '提示',
        yes: function () {
            // 是就请求ajax
            $.ajax({
                type: "POST",
                url: "/my/delcardByidAnduid",
                data: {
                    id: id
                },
                headers: {
                    Authorization: ('Bearer ' + localStorage.getItem("token")) || "",
                },
                success: function (res) {
                    // 如果服务器响应的状态不全等于0
                    if (res.status !== 0) {
                        return layer.open({
                            title: "提示",
                            icon: 2,
                            content: res.msg,
                            anim: 1
                        });
                    }
                    // 否则等于0，则删除成功
                    return layer.msg('删除成功！', {
                        icon: 1,
                        time: 500,
                        end: function () {
                            getData();
                            all();
                        }
                    });
                }
            });
        }
    });

});

//鼠标移入图片的事件
$("#postList>ul").on("mousemove", "img", function () {
    $(this).addClass("hover");
});
// 鼠标移出图片的事件
$("#postList>ul").on("mouseout", "img", function () {
    $(this).removeClass("hover");
});

// 获取数量的函数
function getData() {
    // 获取粉丝总数
    $.ajax({
        type: "GET",
        url: "/my/getFansNum",
        headers: {
            Authorization: ('Bearer ' + localStorage.getItem("token")) || "",
        },
        success: function (res) {
            // 未登录状态
            if (res.status !== 0) {
                return layer.open({
                    title: "提示",
                    icon: 2,
                    content: "您还未登录，请先登录！",
                    btn: ["确定"],
                    yes: function () {
                        location.href = "../../login.html";
                    }
                });
            } else if (res.status === 0) {
                $("#Fans").text(res.data[0].num);
            }

        }
    });
    // 获取帖子总数
    $.ajax({
        type: "GET",
        url: "/my/getCardNum",
        headers: {
            Authorization: ('Bearer ' + localStorage.getItem("token")) || "",
        },
        success: function (res) {
            // 未登录状态
            if (res.status !== 0) {
                layer.open({
                    title: "提示",
                    icon: 2,
                    content: "您还未登录，请先登录！",
                    btn: ["确定"],
                    yes: function () {
                        location.href = "../../login.html";
                    }
                });
            }
            $("#Card").text(res.data[0].num);
        }
    });
    // 获取关注总数
    $.ajax({
        type: "GET",
        url: "/my/getFocusNum",
        headers: {
            Authorization: ('Bearer ' + localStorage.getItem("token")) || "",
        },
        success: function (res) {
            // 未登录状态
            if (res.status !== 0) {
                layer.open({
                    title: "提示",
                    icon: 2,
                    content: "您还未登录，请先登录！",
                    btn: ["确定"],
                    yes: function () {
                        location.href = "../../login.html";
                    }
                });
            }
            $("#Focus").text(res.data[0].num);
        }
    });
    // 获取评论总数
    $.ajax({
        type: "GET",
        url: "/my/getCommentNum",
        headers: {
            Authorization: ('Bearer ' + localStorage.getItem("token")) || "",
        },
        success: function (res) {
            // 未登录状态
            if (res.status !== 0) {
                layer.open({
                    title: "提示",
                    icon: 2,
                    content: "您还未登录，请先登录！",
                    btn: ["确定"],
                    yes: function () {
                        location.href = "../../login.html";
                    }
                });
            }
            $("#Comment").text(res.data[0].num);
        }
    });
}

// 获取所有文章的函数
function all() {
    $.ajax({
        type: "GET",
        url: "/my/getCardAll?sort=DESC",
        headers: {
            Authorization: ('Bearer ' + localStorage.getItem("token")) || "",
        },
        success: function (results) {
            console.log(results.data);
            if (results.status !== 0) {
                return layer.open({
                    title: '提示',
                    icon: 2,
                    content: "获取数据帖子列表失败!"
                });
            }
            for (let i = 0; i < results.data.length; i++) {
                results.data[i].praise = randnum(3);
                results.data[i].src = randomImg(20, 1);
                results.data[i].look = randnum(4);
            }
            var htmlStr = template("html-recreat", results);
            $("#postList ul").html(htmlStr);
        }
    });
}

// 时间过滤器
template.defaults.imports.formatTime = function (data) {
    var date = new Date(data);
    let y = date.getFullYear();
    let m = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
    let d = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    let h = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
    let mm = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    let s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
    return `${y}-${m}-${d} ${h}:${mm}:${s}`;
};


// 正则过滤器
template.defaults.imports.replace = function (data) {
    return data.replace(/<\/?.+?\/?>/g, "").replace(/&nbsp;/ig, '');
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