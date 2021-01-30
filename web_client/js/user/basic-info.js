$(function() {
    $("ul").on("click", function() {
        $(".look").hide().siblings("div").show();
    });

    $("#btn-reset").on("click", function() {
        $(".update").hide().siblings("div").show();
    });

    //弹出框水平垂直居中
    (window.onresize = function() {
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
    reader.onload = function(evt) {
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
    crop: function(e) {
        // 输出结果数据裁剪图像。
    }
});

//旋转
$(".cropper-rotate-btn").on("click", function(e) {
    e.preventDefault();
    $('#tailoringImg').cropper("rotate", 45);
});

//复位
$(".cropper-reset-btn").on("click", function(e) {
    e.preventDefault();
    $('#tailoringImg').cropper("reset");
});

//换向
var flagX = true;
$(".cropper-scaleX-btn").on("click", function(e) {
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
$("#sureCut").on("click", function(e) {
    e.preventDefault();
    if ($("#tailoringImg").attr("src") == null) {
        return false;
    } else {
        var cas = $('#tailoringImg').cropper('getCroppedCanvas', {
            //  设置canvas选中的大小，否则装不下
            width: 100,
            height: 100
        }); //获取被裁剪后的canvas
        var base64url = cas.toDataURL('image/png'); //转换为base64地址形式
        console.log(base64url);
        // 请求服务器，并将转换好的base64url格式的图片发送给服务器
        // $.ajax({
        //     type: "POST",
        //     url: "/infor/avatar",
        //     headers: { Authorization: localStorage.getItem("loginToken") },
        //     data: { avatar: base64url },
        //     success: function(res) {
        //         if (res.status !== 0) {
        //             layer.open({
        //                 icon: 5,
        //                 title: "提示",
        //                 content: res.msg,
        //                 time: 2000,
        //             });
        //         }
        //         layer.open({
        //             icon: 6,
        //             title: "提示",
        //             content: "更换头像成功！",
        //             time: 2000,
        //             end: function() {
        //                 // 重新调用父窗口js文件中的方法
        //                 window.parent.fillData();
        //             }
        //         });
        //     }
        // });
    }
});