$(function () {
    const cardID = localStorage.getItem("cardID");
    // 根据文章id获取文章的函数
    getData(cardID);
});

// 记录文章作者的id
let authorid = null;
// 记录帖子的id
let cardID = null;

// 点击关注的事件
$("div.container").on("click", "#btn-focus", function () {
    console.log("关注事件没问题！");
});

// 点击拉黑的事件
$("div.container").on("click", "#btn-block", function () {
    console.log("拉黑事件没问题！");
});

// 点击输入框的事件
$("div.container").on("click", "input.form-control", function (e) {
    $(this).hide().siblings("div").show();
});

// 重置按钮的事件
$("div.container").on("click", "#reset", function () {
    // 清空表单中的值
    $("input.form-control")[0].reset;
});

// 评论按钮的事件
$("div.container").on("submit", "form.layui-form", function (e) {
    e.preventDefault();
    // 请求保存数据
    $.ajax({
        type: "POST",
        url: "/my/article/setComment",
        data: {
            // 评论的文本
            utxt: $("textarea").val(),
            // 作者的id
            authorid: authorid,
            ubookid: cardID
        },
        headers: {
            Authorization: ('Bearer ' + localStorage.getItem("token")) || "",
        },
        success: function (res) {
            // 如果本地中的token不存在
            if (!localStorage.getItem("token")) {
                return layer.open({
                    title: "提示",
                    icon: 5,
                    content: "您还未登录，请先登录!",
                    btn: ["确定", "取消"],
                    yes: function () {
                        //本地记录标记
                        localStorage.setItem("isComment", "true");
                        location.href = "../../login.html";
                    }
                });
            }
            // 如果写入数据失败
            if (res.status !== 0) {
                return layer.open({
                    title: "提示",
                    icon: 5,
                    content: "评论失败，请联系管理员",
                });
            } else {
                // 根据文章id获取文章的函数
                getData(localStorage.getItem("cardID"));
                return layer.msg("评论成功！", {
                    title: "提示",
                    icon: 1,
                });
            }
        }

    });
});


// 点击首页的事件
$("div.container").on("click", "#main", function (e) {
    // 获取作者的id，并将作者的id存入本地
    localStorage.setItem("authorID", $(this).attr("data-authorid"));
    // 跳转到作者列表的页面
    location.href = "./apageList.html";
});

// 获取文章和评论的方法
function getData(id) {
    $.ajax({
        type: "GET",
        url: `/api/getCardByCardid?cardID=${id}`,
        success: function (res) {
            if (res.status !== 0) {
                return layer.open({
                    title: "提示",
                    icon: 2,
                    content: "获取页面数据失败，请联系管理员！"
                });
            }
            res.data.look = randnum(3);
            // 记录服务器返回的数据
            let value = res.data;
            // 再次向服务器请求帖子评论的数据
            $.ajax({
                type: "GET",
                url: `/api/tourist/getComment?cardID=${value.id}`,
                success: function (res) {
                    if (res.status === 0) {
                        value.comments = res.data;
                    }
                    // 记录文章作者的id
                    authorid = value.author_id;
                    // 记录帖子的id
                    cardID = value.id;
                    // 创建模板
                    const htmlStr = template("html-data", value);
                    // 添加到容器中
                    $("div.container").html(htmlStr);
                }
            });

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