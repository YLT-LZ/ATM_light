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
    GZ(authorid);
});

// 点击拉黑的事件
$("div.container").on("click", "#btn-block", function () {
    LH(authorid)
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


// 取关拉黑删除ajax请求的封装函数
function Operation_user(url, data) {
    $.ajax({
        type: "post",
        url: url,
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`
        },
        data: data,
        success: function (res) {
            if (res.status !== 0) {
                return layer.open({
                    icon: 5,
                    title: "提示",
                    content: res.msg,
                    time: 2000,
                });
            }
        }
    })
}
// 他人操作取关拉黑删除ajax请求的封装函数
function Operation_TRuser(url, data) {
    $.ajax({
        type: "post",
        url: url,
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`
        },
        data: data,
        success: function (res) {
            if (res.status !== 0) {
                return layer.open({
                    icon: 5,
                    title: "提示",
                    content: res.msg,
                    time: 2000,
                });
            }
        }
    });
}

function GZ(Q) {
    // 查询是否是对方黑名单数据
    $.ajax({
        type: "post",
        url: "/my/CXTRblacklist",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`
        },
        data: {
            ublacklistid: Q
        },
        success: function (res) {
            if (res.ustatus == '1') {
                return layer.open({
                    icon: 5,
                    title: "提示",
                    content: '你是对方黑名单用户，无法关注',
                    time: 2000,
                });
            } else {
                // 如果不是对方黑名单数据查询自己黑名单数据
                console.log(Q);
                $.ajax({
                    type: "post",
                    url: "/my/CXblacklist",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token") || ""}`
                    },
                    data: {
                        ublacklistid: Q
                    },
                    success: function (res) {
                        if (res.data && res.data[0].ustatus == "1") {
                            // 如果是黑名单
                            // 移出黑名单
                            Operation_user('/my/blackuser', { ublacklistid: Q })
                            // 查询自己关注数据
                            $.ajax({
                                type: "post",
                                url: "/my/CXfollow",
                                headers: {
                                    Authorization: `Bearer ${localStorage.getItem("token") || ""}`
                                },
                                data: {
                                    ufocusid: Q
                                },
                                success: function (res) {
                                    // 如果没有关注数据
                                    if (res.status !== 0) {
                                        // 添加关注数据
                                        $.ajax({
                                            type: "post",
                                            url: "/my/XRfollowPass",
                                            headers: {
                                                Authorization: `Bearer ${localStorage.getItem("token") || ""}`
                                            },
                                            data: {
                                                ufocusid: Q
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
                                                // 查看对方粉丝列表是否有数据
                                                $.ajax({
                                                    type: "post",
                                                    url: "/my/CXTRmyfans",
                                                    headers: {
                                                        Authorization: `Bearer ${localStorage.getItem("token") || ""}`
                                                    },
                                                    data: {
                                                        ufansid: Q
                                                    },
                                                    success: function (res) {
                                                        // 如果没粉丝数据
                                                        if (res.status !== 0) {
                                                            // 写入粉丝数据
                                                            $.ajax({
                                                                type: "post",
                                                                url: "/my/TRXRPowdering",
                                                                headers: {
                                                                    Authorization: `Bearer ${localStorage.getItem("token") || ""}`
                                                                },
                                                                data: {
                                                                    ufansid: Q
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
                                                                }
                                                            });
                                                        } else {
                                                            // 写入粉丝数据
                                                            Operation_TRuser('/my/TRPowdering', { ufansid: Q })
                                                        }
                                                    }
                                                });
                                            }
                                        });
                                    } else {
                                        // 如果有关注数据
                                        // 修改关注数据
                                        Operation_user('/my/followNOPass', { ufocusid: Q })
                                        // 查看对方粉丝列表是否有数据
                                        $.ajax({
                                            type: "post",
                                            url: "/my/CXTRmyfans",
                                            headers: {
                                                Authorization: `Bearer ${localStorage.getItem("token") || ""}`
                                            },
                                            data: {
                                                ufansid: Q
                                            },
                                            success: function (res) {
                                                // 如果没粉丝数据
                                                if (res.status !== 0) {
                                                    // 写入粉丝数据
                                                    $.ajax({
                                                        type: "post",
                                                        url: "/my/TRXRPowdering",
                                                        headers: {
                                                            Authorization: `Bearer ${localStorage.getItem("token") || ""}`
                                                        },
                                                        data: {
                                                            ufansid: Q
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
                                                        }
                                                    });
                                                } else {
                                                    // 写入粉丝数据
                                                    Operation_TRuser('/my/TRPowdering', { ufansid: Q })
                                                }
                                            }
                                        });
                                    }
                                }
                            });
                            layer.open({
                                icon: 6,
                                title: "提示",
                                content: '关注成功',
                                time: 2000,
                            });
                        } else {
                            // 查询自己关注数据
                            $.ajax({
                                type: "post",
                                url: "/my/CXfollow",
                                headers: {
                                    Authorization: `Bearer ${localStorage.getItem("token") || ""}`
                                },
                                data: {
                                    ufocusid: Q
                                },
                                success: function (res) {
                                    // 如果没有关注数据
                                    if (res.status !== 0) {
                                        // 添加关注数据
                                        $.ajax({
                                            type: "post",
                                            url: "/my/XRfollowPass",
                                            headers: {
                                                Authorization: `Bearer ${localStorage.getItem("token") || ""}`
                                            },
                                            data: {
                                                ufocusid: Q
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
                                                // 查看对方粉丝列表是否有数据
                                                $.ajax({
                                                    type: "post",
                                                    url: "/my/CXTRmyfans",
                                                    headers: {
                                                        Authorization: `Bearer ${localStorage.getItem("token") || ""}`
                                                    },
                                                    data: {
                                                        ufansid: Q
                                                    },
                                                    success: function (res) {
                                                        // 如果没粉丝数据
                                                        if (res.status !== 0) {
                                                            // 写入粉丝数据
                                                            $.ajax({
                                                                type: "post",
                                                                url: "/my/TRXRPowdering",
                                                                headers: {
                                                                    Authorization: `Bearer ${localStorage.getItem("token") || ""}`
                                                                },
                                                                data: {
                                                                    ufansid: Q
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
                                                                }
                                                            });
                                                        } else {
                                                            // 写入粉丝数据
                                                            Operation_TRuser('/my/TRPowdering', { ufansid: Q })
                                                        }
                                                    }
                                                });
                                            }
                                        });
                                    } else {
                                        // 如果有关注数据
                                        // 修改关注数据
                                        Operation_user('/my/followNOPass', { ufocusid: Q })
                                        // 查看对方粉丝列表是否有数据
                                        $.ajax({
                                            type: "post",
                                            url: "/my/CXTRmyfans",
                                            headers: {
                                                Authorization: `Bearer ${localStorage.getItem("token") || ""}`
                                            },
                                            data: {
                                                ufansid: Q
                                            },
                                            success: function (res) {
                                                // 如果没粉丝数据
                                                if (res.status !== 0) {
                                                    // 写入粉丝数据
                                                    $.ajax({
                                                        type: "post",
                                                        url: "/my/TRXRPowdering",
                                                        headers: {
                                                            Authorization: `Bearer ${localStorage.getItem("token") || ""}`
                                                        },
                                                        data: {
                                                            ufansid: Q
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
                                                        }
                                                    });
                                                } else {
                                                    // 写入粉丝数据
                                                    Operation_TRuser('/my/TRPowdering', { ufansid: Q })
                                                }
                                            }
                                        });
                                    }
                                }
                            });
                            layer.open({
                                icon: 6,
                                title: "提示",
                                content: '关注成功',
                                time: 2000,
                            });
                        }
                    }
                });
            }
        }
    });
}

function LH(Q) {
    // 查询黑名单
    $.ajax({
        type: "post",
        url: "/my/CXblacklist",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`
        },
        data: {
            ublacklistid: Q
        },
        success: function (res) {
            if (res.status !== 0) {
                // 添加黑名单数据
                $.ajax({
                    type: "post",
                    url: "/my/XRblackuser",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token") || ""}`
                    },
                    data: {
                        ublacklistid: Q
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
                        // 粉丝列表减少
                        Operation_user('/my/NOPowdering', { ufansid: Q })
                        // 对方关注列表减少
                        Operation_TRuser('/my/TRfollowPass', { ufocusid: Q })
                        // 通过关注列表看我们是否关注他人
                        $.ajax({
                            type: "post",
                            url: "/my/CXfollow",
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem("token") || ""}`
                            },
                            data: {
                                ufocusid: Q
                            },
                            success: function (res) {
                                if (res.status !== 0) {
                                    // 没关注不做操作
                                    return
                                } else {
                                    // 关注了去除关注列表数据
                                    Operation_user('/my/followPass', { ufocusid: Q })
                                    // 操作他人的粉丝数据
                                    Operation_TRuser('/my/TRNOPowdering', { ufansid: Q })
                                }
                            }
                        });
                    }
                });
                layer.open({
                    icon: 6,
                    title: "提示",
                    content: '拉黑成功',
                    time: 2000,
                });
            } else {
                Operation_user('/my/NOblackuser', { ublacklistid: Q })
                // 粉丝列表减少
                Operation_user('/my/NOPowdering', { ufansid: Q })
                // 对方关注列表减少
                Operation_TRuser('/my/TRfollowPass', { ufocusid: Q })
                // 通过关注列表看我们是否关注他人
                $.ajax({
                    type: "post",
                    url: "/my/CXfollow",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token") || ""}`
                    },
                    data: {
                        ufocusid: Q
                    },
                    success: function (res) {
                        if (res.status !== 0) {
                            // 没关注不做操作
                            return
                        } else {
                            // 关注了去除关注列表数据
                            Operation_user('/my/followPass', { ufocusid: Q })
                            // 操作他人的粉丝数据
                            Operation_TRuser('/my/TRNOPowdering', { ufansid: Q })
                        }
                    }
                });
                layer.open({
                    icon: 6,
                    title: "提示",
                    content: '拉黑成功',
                    time: 2000,
                });
            }
        }
    });
}