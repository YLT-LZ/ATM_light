// 后台登录/注册/忘记密码的js脚本


$(function() {
    check();
    // 登录页面点击注册后的事件
    $(".link_reg").on("click", function() {
        $(".reg-box").show().siblings("div").hide();
    });

    // 注册页面点击登录的事件
    $(".link_login").on("click", function() {
        $(".login-box").show().siblings("div").hide();
    });

    // 登录页面点击找回密码的事件
    $(".link_find").on("click", function() {
        $(".findpwd-box").show().siblings("div").hide();
        code_draw();
    });


    // 点击随机验证码的事件
    $("#canvas").on("click", function() {
        code_draw();
    });

    // 忘记密码页面点击返回登录的事件
    $(".btn-backLog").click(function(e) {
        $(".login-box").show().siblings("div").hide();
        $.each($(".fpwd-content .layui-form"), function(i, n) {
            n.reset();
        });
        nextnav(0);
        user = null;
        if (sessionStorage.getItem("token")) {
            sessionStorage.removeItem("token");
        }
        if (sessionStorage.getItem("idtoken")) {
            sessionStorage.removeItem("idtoken");
        }
    });


    // div参数是当前的表单，index是当前的表单索引。完成找回密码的表单切换
    function nextnav(index) {
        $(".fpwd-content>div").addClass("fpwd").eq(index).removeClass("fpwd");
        var liststrong = $(".layui-breadcrumb>strong");
        $.each(liststrong, function(i, n) {
            $(n).text($(n).text());
        });
        var nexttxt = $(liststrong[index]).text();
        $(liststrong[index]).html("<cite>" + nexttxt + "</cite>");
    }

    // 登录功能的实现
    $("#form-login").on("submit", function(e) {
        e.preventDefault();
        $.ajax({
            type: "POST",
            url: "/api/Alogin",
            data: $(this).serialize(),
            success: function(res) {
                if (res.status !== 0) {
                    return layer.open({
                        title: '提示',
                        icon: 2,
                        content: res.message
                    });

                }
                return layer.open({
                    title: '注意',
                    content: '登录成功！',
                    icon: 1,
                    time: 2000,
                    end: function() {
                        // 因为SessionStorage声明周期为当前站点通信期间，只要当前浏览器的访问域名没有发生改变，则SessionStorage一直存在(例如页面的刷新，同一个域名内页面的跳转)
                        // 如果因为人为关闭当前浏览器的标签页断开与域名的通信过程，或者直接关闭浏览器则sessionStorage直接被自动清理
                        sessionStorage.setItem("refresh", true);
                        localStorage.setItem("Atoken", res.token);
                        //     location.href = "./../index.html";
                    }
                });

            }
        });
    });

    // 【注册管理员账号】注册功能的实现
    $("#form-reg").on("submit", function(e) {
        e.preventDefault();
        $.ajax({
            type: "POST",
            url: "/my/Aregister",
            headers: {
                Authorization: `Bearer ${ localStorage.getItem("regToken") || ""}`
            },
            data: $(this).serialize(),
            success: function(res) {
                if (res.status !== 0) {
                    return layer.open({
                        title: '提示',
                        icon: 2,
                        content: res.message
                    });
                }
                localStorage.removeItem("regToken");
                var layerindex = layer.open({
                    title: '提示',
                    content: res.message + "请登录！",
                    btn: ['确定', '取消'],
                    icon: 1,
                    yes: function() {
                        layer.close(layerindex);
                        $("#form-reg")[0].reset();
                        $(".link_login").click();
                    },
                    btn2: function() {
                        $("#form-reg")[0].reset();
                    }
                });
            }
        });

    });

    // 【注册管理员账号】获取授权码的事件
    $(".btn-auth").on("click", function(e) {
        e.preventDefault();
        const data = ($("#form-reg").serializeArray()).splice(0, 4);
        $.ajax({
            type: "POST",
            url: "/api/Areg",
            data: data,
            success: function(res) {
                if (res.status !== 0) {
                    return layer.open({
                        title: '提示',
                        icon: 2,
                        content: res.message
                    });
                }
                return layer.open({
                    title: '注意',
                    content: "邮箱发送成功,请注意查收！",
                    icon: 1,
                    time: 2000,
                    end: function() {
                        // 将用户的验证码存储到本地
                        localStorage.setItem("regToken", res.token);
                        // 设置秒数
                        var time = 60;
                        // 获取验证码框被禁用
                        $("button.btn-auth").addClass("layui-disabled").attr("disabled", "disabled");
                        // 并设置其内容为秒数
                        $("button.btn-auth").text(`${time}s`);
                        // 启动计时器计时
                        var interval = setInterval(() => {
                            time--;
                            $("button.btn-auth").text(`${time}s`);
                            // 当描述递减到0
                            if (time == 0) {
                                // 移除禁用属性
                                $("button.btn-auth").removeClass("layui-disabled").removeAttr("disabled");
                                // 重新赋值
                                $("button.btn-auth").text("获取授权码");
                                // 销毁计时器
                                clearInterval(interval);
                                // 如果本地存储的验证码token不为空
                                if (sessionStorage.getItem("fpwdToken")) {
                                    // 则清除token
                                    sessionStorage.removeItem("fpwdToken");
                                }
                            }
                        }, 1000);

                    }
                });
            }
        });
    });

    var user = null;
    //【忘记密码】根据用户输入的账号判断是否存在该账户
    $("#form-fpwdid").on("submit", function(e) {
        e.preventDefault();
        const data = ($(this).serializeArray()).splice(0, 1);
        $.ajax({
            type: "POST",
            url: "/api/Alogid",
            data: data,
            success: function(res) {
                // 如果状态不为0
                if (res.status !== 0) {
                    return layer.open({
                        title: '提示',
                        icon: 2,
                        content: res.message
                    });
                } else {
                    // 将客户端返回的数据存储到user中
                    user = res.data;
                    // 获取输入的验证码，并转换为小写字母
                    let val = $(".codeval").val().trim().toLowerCase();
                    // 获取canvas中生成验证码值
                    let num = $('#canvas').attr('data-code');
                    // 如果验证码为空
                    if (val === '') {
                        return layer.open({
                            title: '提示',
                            icon: 2,
                            content: '请输入验证码！'
                        });
                        // 如果验证码相等
                    } else if (val === num) {
                        // 清空验证码数据
                        $(".codeval").val('');
                        // 并跳转到邮箱验证模块
                        nextnav(1);
                        // 否则不相等
                    } else if (val !== num) {
                        $(".codeval").val('');
                        code_draw();
                        return layer.open({
                            title: '提示',
                            icon: 2,
                            content: '验证码错误，请重新输入！'
                        });
                    }
                }
            }
        });
    });

    //【忘记密码】处理获取邮箱验证码
    $(".btn-getemailcode").on("click", function() {
        // 先判断邮箱地址是否和账号中的邮箱对应

        // 如果user为空,则没有存储服务器返回的数据
        if (!user) {
            // 则提示
            layer.open({
                title: '提示',
                icon: 2,
                content: "请先输入您要找回的账号！"
            });
            return nextnav(0);
        }
        // 将user中的邮箱和客户端输入的邮箱转换为小写,并判断,如果不等于
        if (user.aemail.toLowerCase() != $("#idemail").val().toLowerCase()) {
            // 则提示
            return layer.open({
                title: '提示',
                icon: 2,
                content: "此邮箱并非账号绑定邮箱，请重新检查！"
            });
        }
        // 邮箱对应，需要向该邮箱发送一封邮件
        $.ajax({
            type: "POST",
            url: "/api/Afpwd",
            data: { alogid: user.alogid, aemail: $("#idemail").val() },
            success: function(res) {
                // 如果服务器响应的状态不为0
                if (res.status !== 0) {
                    return layer.open({
                        title: '提示',
                        icon: 2,
                        content: "邮箱接收验证码失败！请稍后再试！"
                    });
                }
                // 否则弹出提示框
                layer.open({
                    title: '提示',
                    icon: 1,
                    content: res.message,
                    time: 2000,
                    end: function() {
                        // 将用户数据存入本地
                        sessionStorage.setItem('fpwdToken', res.token);
                        // 设置秒数
                        var time = 60;
                        // 获取验证码框被禁用
                        $("button.btn-getemailcode").addClass("layui-disabled").attr("disabled", "disabled");
                        // 并设置其内容为秒数
                        $("button.btn-getemailcode").text(`${time}s`);
                        // 启动计时器计时
                        var interval = setInterval(() => {
                            time--;
                            $("button.btn-getemailcode").text(`${time}s`);
                            // 当描述递减到0
                            if (time == 0) {
                                // 移除禁用属性
                                $("button.btn-getemailcode").removeClass("layui-disabled").removeAttr("disabled");
                                // 重新赋值
                                $("button.btn-getemailcode").text("获取邮箱验证码");
                                // 销毁计时器
                                clearInterval(interval);
                                // 如果本地存储的验证码token不为空
                                if (sessionStorage.getItem("fpwdToken")) {
                                    // 则清除token
                                    sessionStorage.removeItem("fpwdToken");
                                }
                            }
                        }, 1000);
                    }
                });
            }
        });
    });

    //【忘记密码】验证邮箱
    $("#form-fpwdemail").on("submit", function(e) {
        e.preventDefault();
        // 判断本地的数据是否过期
        if (!sessionStorage.getItem("fpwdToken")) {
            return layer.open({
                title: '提示',
                icon: 2,
                content: "邮箱动态码已过期，请重新获取！"
            });
        }
        // 通过ajax请求，验证验证码是否正确
        $.ajax({
            type: "POST",
            url: "/my/AfpwdCode",
            // 设置headers，请求头部配置
            headers: {
                Authorization: sessionStorage.getItem("fpwdToken") || ''
            },
            data: $("#form-fpwdemail").serialize(),
            success: function(res) {
                if (res.status !== 0) {
                    return layer.open({
                        title: '提示',
                        icon: 2,
                        content: res.message
                    });
                }
                nextnav(2);
                layer.open({
                    title: '提示',
                    icon: 3,
                    content: "请在10分钟内完成操作！"
                });
                sessionStorage.setItem('alogidToken', res.token);
                var time = 10 * 60;
                var interval = setInterval(function() {
                    time--;
                    // 如果计数器=0
                    if (time == 0) {
                        // 清除计时器
                        clearInterval(interval);
                        // 如果本地数据存在，则清除
                        if (sessionStorage.getItem("alogidToken")) {
                            sessionStorage.removeItem("alogidToken");
                        }
                    }
                }, 1000);
            }
        });
    });

    // 【忘记密码】设置新密码的操作
    $("#form-fpwdpwd").on("submit", function(e) {
        e.preventDefault();
        // 如果本地数据不存在了
        if (!sessionStorage.getItem("alogidToken")) {
            return layer.open({
                title: '提示',
                icon: 2,
                content: "身份验证失败，请重新找回密码！"
            });
        }
        // 调用ajax请求服务器
        $.ajax({
            type: "POST",
            url: "/my/Afsetpwd",
            headers: {
                Authorization: sessionStorage.getItem("alogidToken") || ''
            },
            data: $("#form-fpwdpwd").serialize(),
            success: function(res) {
                if (res.status !== 0) {
                    return layer.open({
                        title: '提示',
                        icon: 2,
                        content: res.message
                    });
                }
                nextnav(3);
                sessionStorage.removeItem("alogidToken");
            }
        });
    });

});

function check() {
    // 验证规则
    var form = layui.form;
    form.verify({
        uid: [
            /^[a-zA-z\d]{6,11}$/, '账号必须为6-11位字母数字组合'
        ],
        upwd: [
            /^[\S]{6,18}$/, '密码必须6-18位，不能使用空格'
        ],
        coed: [
            /^[1-9]{6}$/, '验证码必须为6位数字'
        ]
    });
}