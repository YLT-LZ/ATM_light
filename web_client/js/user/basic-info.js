$(function () {
    $("ul").on("click", function () {
        $(".look").hide().siblings("div").show();
    });

    $("#btn-reset").on("click", function () {
        $(".update").hide().siblings("div").show();
    });

    //弹出框水平垂直居中
    (window.onresize = function () {
        var win_height = $(window).height();
        var win_width = $(window).width();
        if (win_width <= 768) {
            $(".tailoring-content").css({
                "top": (win_height - $(".tailoring-content").outerHeight()) / 2,
                "left": 0
            });
        } else {
            $(".tailoring-content").css({
                "top": (win_height - $(".tailoring-content").outerHeight()) / 2,
                "left": (win_width - $(".tailoring-content").outerWidth()) / 2
            });
        }
    })();


});


//图像上传
function selectImg(file) {
    if (!file.files || !file.files[0]) {
        return;
    }
    var reader = new FileReader();
    reader.onload = function (evt) {
        var replaceSrc = evt.target.result;
        //更换cropper的图片
        $('#tailoringImg').cropper('replace', replaceSrc, false); //默认false，适应高度，不失真
    };
    reader.readAsDataURL(file.files[0]);
}

//cropper图片裁剪
$('#tailoringImg').cropper({
    aspectRatio: 1 / 1, //默认比例
    preview: '.previewImg', //预览视图
    guides: false, //裁剪框的虚线(九宫格)
    autoCropArea: 0.5, //0-1之间的数值，定义自动剪裁区域的大小，默认0.8
    movable: false, //是否允许移动图片
    dragCrop: true, //是否允许移除当前的剪裁框，并通过拖动来新建一个剪裁框区域
    movable: true, //是否允许移动剪裁框
    resizable: true, //是否允许改变裁剪框的大小
    zoomable: false, //是否允许缩放图片大小
    mouseWheelZoom: false, //是否允许通过鼠标滚轮来缩放图片
    touchDragZoom: true, //是否允许通过触摸移动来缩放图片
    rotatable: true, //是否允许旋转图片
    crop: function (e) {
        // 输出结果数据裁剪图像。
    }
});

//旋转
$(".cropper-rotate-btn").on("click", function (e) {
    e.preventDefault();
    $('#tailoringImg').cropper("rotate", 45);
});

//复位
$(".cropper-reset-btn").on("click", function (e) {
    e.preventDefault();
    $('#tailoringImg').cropper("reset");
});

//换向
var flagX = true;
$(".cropper-scaleX-btn").on("click", function (e) {
    e.preventDefault();
    if (flagX) {
        $('#tailoringImg').cropper("scaleX", -1);
        flagX = false;
    } else {
        $('#tailoringImg').cropper("scaleX", 1);
        flagX = true;
    }
    flagX != flagX;
});

//裁剪后的处理
$("#btn-submit").on("click", function (e) {
    e.preventDefault();
    if ($("#tailoringImg").attr("src") == null) {
        return layer.open({
            icon: 5,
            title: "提示",
            content: '头像信息不能为空',
            time: 2000,
        });
    } else {
        var cas = $('#tailoringImg').cropper('getCroppedCanvas', {
            //  设置canvas选中的大小，否则装不下
            width: 100,
            height: 100
        }); //获取被裁剪后的canvas
        var base64url = cas.toDataURL('image/png'); //转换为base64地址形式
        // 请求服务器，并将转换好的base64url格式的图片发送给服务器
        $.ajax({
            type: "POST",
            url: "/my/updateuser",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token") || ""}`
            },
            data: {
                unick: $('#userform_unick').val(),
                uemail: $('#userform_email').val(),
                avatar: base64url
            },
            success: function (res) {
                if (res.status !== 0) {
                    return layer.open({
                        icon: 5,
                        title: "提示",
                        content: res.msg,
                        time: 2000,
                    });
                }
                layer.open({
                    icon: 6,
                    title: "提示",
                    content: "变更用户信息成功！",
                    time: 2000,
                    end: function () {
                        getuserInfor()
                        $('#btn-reset').click()
                    }
                });
            }
        });
    }
});


function getuserInfor() {
    var form = layui.form;
    $.ajax({
        type: "GET",
        url: "/my/myinfor",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`
        },
        success: function (res) {
            if (res.status !== 0) {
                return layer.open({
                    title: '提示',
                    icon: 2,
                    content: "用户登录信息无效，请重新登录！",
                    time: 2000,
                    end: function () {
                        location.href = "./../../login.html";
                    }
                });
            } else {
                // 给基础信息部分和修改信息部分都要绑定数据
                bindBaseInfor(res.data);
                renderAvatar(res.data)
                console.log(res.data);
                form.val('formUserInfor', res.data);
                $("#btn-reset").on("click", (e) => {
                    e.preventDefault();
                    form.val('formUserInfor', res.data);
                });
            }
        }
    });
}
getuserInfor();
function bindBaseInfor(user) {
    $("#myuid").text(user.ulogid);
    $("#myunick").text(user.unick);
    $('#unames').text(user.unick);
    user.ustatus == 0 ? $("#myok").text('正常') : $("#myok").text('异常')
    $("#myuemail").text(user.uemail);
}

// 用户主页的姓名和头像处理函数
function renderAvatar(user) {
    // 声明变量nick优先为昵称unick，如果unick为空则为姓名uname
    var nick = user.unick;
    if (user.uimage !== null) {
        // 头像显示为user的头像
        $('#userphoto').attr("src", user.uimage).show();
        // 默认头衔隐藏
        $("#userphoto2").hide();
        // 否则
    } else {
        // 图片头像隐藏
        $("#userphoto").hide();
        // 获取nick的第一个字并且用toUpperCase()方法转成大写
        $("#userphoto2").text(nick[0].toUpperCase()).show();
    }
}