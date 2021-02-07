
$(function () {
    // 初始化文章类型的下拉列表
    if (!localStorage.getItem("token")) {
        return layer.open({
            title: '提示',
            icon: 2,
            content: "用户登录信息无效，请重新登录！",
            time: 2000,
            end: function () {
                location.href = "./../../login.html";
            }
        });
    }
    $("#aritcle-pub").on("submit", function (e) {
        e.preventDefault();
        var form = {
            tname: $('#tname').val(),
            ttype: $('#ttype').val(),
            tcontent: $('#textarea').val()
        }
        $.ajax({
            type: "POST",
            url: "/my/article/add",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token") || ""}`
            },
            data: form,
            success: function (res) {
                if (res.status !== 0) {
                    return layer.open({
                        title: '提示',
                        icon: 2,
                        content: res.msg
                    });
                }
                layer.open({
                    title: '提示',
                    icon: 1,
                    content: "帖子发布成功！",
                    end: function () {
                        $('#btn-reset').click();
                    }
                });
            }
        });
    });
});
