$(function() {
    // 如果作者的id不存在
    if (!localStorage.getItem("authorID")) {
        return layer.open({
            title: "提示",
            icon: 2,
            content: "获取作者数据失败,请联系管理员！"
        });
    } else {
        // 获取数据
        getDataByAuthorid(localStorage.getItem("authorID"));
    }

});



// 鼠标移入图片的事件
$("div.center").on("mousemove", "#postList>ul img", function() {
    $(this).addClass("hover");
});
// 鼠标移出图片的事件
$("div.center").on("mouseout", "#postList>ul img", function() {
    $(this).removeClass("hover");
});

$("div.center").on("click", "#postList>ul li", function(e) {
    // 将文章的id存入本地
    localStorage.setItem("cardID", $(this).attr("data-hide"));
    location.href = "../../page/user/user_lookcard.html";
});



//根据作者的id查询所写的文章和其他数量信息
function getDataByAuthorid(id) {
    $.ajax({
        type: "GET",
        url: `/api/getCardByAuthorid?authorID=${id}`,
        success: function(res) {
            if (res.status !== 0) {
                return layer.open({
                    title: "提示",
                    icon: 2,
                    content: "获取页面数据失败，请联系管理员！"
                });
            }

            for (let i = 0; i < res.data.list.length; i++) {
                res.data.list[i].praise = randnum(3);
                res.data.list[i].look = randnum(4);
            }
            const htmlStr = template("html-data", res.data);
            $("div.center").html(htmlStr);
        }
    });
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