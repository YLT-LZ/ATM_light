$(function () {
    $("ul.layui-tab-title>li").on("click", function (e) {
        $(e.currentTarget).css("background-color", "#009999").siblings("li").css("background-color", "#fff");
    });
    // 返回按钮
    $("#btn-return").on("click", function () {
        location.href = "../../index.html";
    });
    // 渲染页面
    userlist();
    // 关注页
    $("#focusul").on("click", function (e) {
        if (e.target.name == 'btn-unfollow') {
            GZQG(e)
        } else if (e.target.name == 'btn-blacklist') {
            GZLH(e)
        } else {
            return
        }
    });
    $('#fansul').on("click", function (e) {
        if (e.target.name == 'btn-attention') {
            FSGZ(e)
        } else if (e.target.name == 'btn-offblack') {
            FSLH(e)
        } else {
            return
        }
    })
    $('#blacklistul').on("click", function (e) {
        if (e.target.name == 'btn-nooffblack') {
            HMDQH(e)
        } else if (e.target.name == 'btn-noattention') {
            HMDGZ(e)
        } else {
            return
        }
    })
});

// 渲染页面的方法
function userlist() {
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
    $.ajax({
        type: "get",
        url: "/my/follow",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`
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
            var resa = template("focus", res);
            $("#focusul").empty().append(resa);
        }
    });
    $.ajax({
        type: "get",
        url: "/my/myfans",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`
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
            var resa = template("fans", res);
            $("#fansul").empty().append(resa);
        }
    });
    $.ajax({
        type: "get",
        url: "/my/blacklist",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`
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
            var resa = template("ublacklistid", res);
            $("#blacklistul").empty().append(resa);
        }
    });
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
            userlist()
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
            userlist()
        }
    });
}
//关注取关的方法
function GZQG(e) {
    $.ajax({
        type: "post",
        url: "/my/CXfollow",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`
        },
        data: {
            ufocusid: $(e.target).attr('ufocusid')
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
            Operation_user('/my/followPass', { ufocusid: $(e.target).attr('ufocusid') })
            Operation_TRuser('/my/TRNOPowdering', { ufansid: $(e.target).attr('ufocusid') })
            layer.open({
                icon: 6,
                title: "提示",
                content: '取关成功',
                time: 2000,
            });
        }
    });
}
//关注拉黑方法
function GZLH(e) {
    // 查询黑名单
    $.ajax({
        type: "post",
        url: "/my/CXblacklist",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`
        },
        data: {
            ublacklistid: $(e.target).attr('ufocusid')
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
                        ublacklistid: $(e.target).attr('ufocusid')
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
                        // 取关
                        Operation_user('/my/followPass', { ufocusid: $(e.target).attr('ufocusid') })
                        // 对方粉丝列表减少
                        Operation_TRuser('/my/TRNOPowdering', { ufansid: $(e.target).attr('ufocusid') })
                        // 通过粉丝列表看对方是否关注我们
                        $.ajax({
                            type: "post",
                            url: "/my/CXmyfans",
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem("token") || ""}`
                            },
                            data: {
                                ufansid: $(e.target).attr('ufocusid')
                            },
                            success: function (res) {
                                if (res.status !== 0) {
                                    // 没关注不做操作
                                    return
                                } else {
                                    // 关注了去除粉丝列表数据
                                    Operation_user('/my/NOPowdering', { ufansid: $(e.target).attr('ufocusid') })
                                    // 操作他人的关注数据取消关注
                                    Operation_TRuser('/my/TRfollowPass', { ufocusid: $(e.target).attr('ufocusid') })
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
                Operation_user('/my/NOblackuser', { ublacklistid: $(e.target).attr('ufocusid') })
                // 取关
                Operation_user('/my/followPass', { ufocusid: $(e.target).attr('ufocusid') })
                // 对方粉丝列表减少
                Operation_TRuser('/my/TRNOPowdering', { ufansid: $(e.target).attr('ufocusid') })
                // 通过粉丝列表看对方是否关注我们
                $.ajax({
                    type: "post",
                    url: "/my/CXmyfans",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token") || ""}`
                    },
                    data: {
                        ufansid: $(e.target).attr('ufocusid')
                    },
                    success: function (res) {
                        if (res.status !== 0) {
                            // 没关注不做操作
                            return
                        } else {
                            // 关注了去除粉丝列表数据
                            Operation_user('/my/NOPowdering', { ufansid: $(e.target).attr('ufocusid') })
                            // 操作他人的关注数据取消关注
                            Operation_TRuser('/my/TRfollowPass', { ufocusid: $(e.target).attr('ufocusid') })
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
//粉丝关注方法
function FSGZ(e) {
    // 查询是否是对方黑名单数据
    $.ajax({
        type: "post",
        url: "/my/CXTRblacklist",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`
        },
        data: {
            ublacklistid: $(e.target).attr('ufansid')
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
                $.ajax({
                    type: "post",
                    url: "/my/CXblacklist",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token") || ""}`
                    },
                    data: {
                        ublacklistid: $(e.target).attr('ufansid')
                    },
                    success: function (res) {
                        if (res.data[0].ustatus == "1") {
                            // 如果是黑名单
                            // 移出黑名单
                            Operation_user('/my/blackuser', { ublacklistid: $(e.target).attr('ufansid') })
                            userlist()
                            // 查询自己关注数据
                            $.ajax({
                                type: "post",
                                url: "/my/CXfollow",
                                headers: {
                                    Authorization: `Bearer ${localStorage.getItem("token") || ""}`
                                },
                                data: {
                                    ufocusid: $(e.target).attr('ufansid')
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
                                                ufocusid: $(e.target).attr('ufansid')
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
                                                userlist()
                                                // 查看对方粉丝列表是否有数据
                                                $.ajax({
                                                    type: "post",
                                                    url: "/my/CXTRmyfans",
                                                    headers: {
                                                        Authorization: `Bearer ${localStorage.getItem("token") || ""}`
                                                    },
                                                    data: {
                                                        ufansid: $(e.target).attr('ufansid')
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
                                                                    ufansid: $(e.target).attr('ufansid')
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
                                                                    userlist()
                                                                }
                                                            });
                                                        } else {
                                                            // 写入粉丝数据
                                                            Operation_TRuser('/my/TRPowdering', { ufansid: $(e.target).attr('ufansid') })
                                                            userlist()
                                                        }
                                                    }
                                                });
                                            }
                                        });
                                    } else {
                                        // 如果有关注数据
                                        // 修改关注数据
                                        Operation_user('/my/followNOPass', { ufocusid: $(e.target).attr('ufansid') })
                                        userlist()
                                        // 查看对方粉丝列表是否有数据
                                        $.ajax({
                                            type: "post",
                                            url: "/my/CXTRmyfans",
                                            headers: {
                                                Authorization: `Bearer ${localStorage.getItem("token") || ""}`
                                            },
                                            data: {
                                                ufansid: $(e.target).attr('ufansid')
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
                                                            ufansid: $(e.target).attr('ufansid')
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
                                                            userlist()
                                                        }
                                                    });
                                                } else {
                                                    // 写入粉丝数据
                                                    Operation_TRuser('/my/TRPowdering', { ufansid: $(e.target).attr('ufansid') })
                                                    userlist()
                                                }
                                            }
                                        });
                                    }
                                }
                            });
                            userlist()
                            layer.open({
                                icon: 6,
                                title: "提示",
                                content: '关注成功',
                                time: 2000,
                            });
                        } else {
                            // 如果不是黑名单
                            // 查询自己关注数据
                            $.ajax({
                                type: "post",
                                url: "/my/CXfollow",
                                headers: {
                                    Authorization: `Bearer ${localStorage.getItem("token") || ""}`
                                },
                                data: {
                                    ufocusid: $(e.target).attr('ufansid')
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
                                                ufocusid: $(e.target).attr('ufansid')
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
                                                userlist()
                                                // 查看对方粉丝列表是否有数据
                                                $.ajax({
                                                    type: "post",
                                                    url: "/my/CXTRmyfans",
                                                    headers: {
                                                        Authorization: `Bearer ${localStorage.getItem("token") || ""}`
                                                    },
                                                    data: {
                                                        ufansid: $(e.target).attr('ufansid')
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
                                                                    ufansid: $(e.target).attr('ufansid')
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
                                                                    userlist()
                                                                }
                                                            });
                                                        } else {
                                                            // 写入粉丝数据
                                                            Operation_TRuser('/my/TRPowdering', { ufansid: $(e.target).attr('ufansid') })
                                                            userlist()
                                                        }
                                                    }
                                                });
                                            }
                                        });
                                    } else {
                                        // 如果有关注数据
                                        // 修改关注数据
                                        Operation_user('/my/followNOPass', { ufocusid: $(e.target).attr('ufansid') })
                                        userlist()
                                        // 查看对方粉丝列表是否有数据
                                        $.ajax({
                                            type: "post",
                                            url: "/my/CXTRmyfans",
                                            headers: {
                                                Authorization: `Bearer ${localStorage.getItem("token") || ""}`
                                            },
                                            data: {
                                                ufansid: $(e.target).attr('ufansid')
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
                                                            ufansid: $(e.target).attr('ufansid')
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
                                                            userlist()
                                                        }
                                                    });
                                                } else {
                                                    // 写入粉丝数据
                                                    Operation_TRuser('/my/TRPowdering', { ufansid: $(e.target).attr('ufansid') })
                                                    userlist()
                                                }
                                            }
                                        });
                                    }
                                }
                            });
                            userlist()
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
// 粉丝拉黑方法
function FSLH(e) {
    // 查询黑名单
    $.ajax({
        type: "post",
        url: "/my/CXblacklist",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`
        },
        data: {
            ublacklistid: $(e.target).attr('ufansid')
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
                        ublacklistid: $(e.target).attr('ufansid')
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
                        Operation_user('/my/NOPowdering', { ufansid: $(e.target).attr('ufansid') })
                        // 对方关注列表减少
                        Operation_TRuser('/my/TRfollowPass', { ufocusid: $(e.target).attr('ufansid') })
                        // 通过关注列表看我们是否关注他人
                        $.ajax({
                            type: "post",
                            url: "/my/CXfollow",
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem("token") || ""}`
                            },
                            data: {
                                ufocusid: $(e.target).attr('ufansid')
                            },
                            success: function (res) {
                                if (res.status !== 0) {
                                    // 没关注不做操作
                                    return
                                } else {
                                    // 关注了去除关注列表数据
                                    Operation_user('/my/followPass', { ufocusid: $(e.target).attr('ufansid') })
                                    // 操作他人的粉丝数据
                                    Operation_TRuser('/my/TRNOPowdering', { ufansid: $(e.target).attr('ufansid') })
                                }
                            }
                        });
                    }
                });
                userlist()
                layer.open({
                    icon: 6,
                    title: "提示",
                    content: '拉黑成功',
                    time: 2000,
                });
            } else {
                Operation_user('/my/NOblackuser', { ublacklistid: $(e.target).attr('ufansid') })
                // 粉丝列表减少
                Operation_user('/my/NOPowdering', { ufansid: $(e.target).attr('ufansid') })
                // 对方关注列表减少
                Operation_TRuser('/my/TRfollowPass', { ufocusid: $(e.target).attr('ufansid') })
                // 通过关注列表看我们是否关注他人
                $.ajax({
                    type: "post",
                    url: "/my/CXfollow",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token") || ""}`
                    },
                    data: {
                        ufocusid: $(e.target).attr('ufansid')
                    },
                    success: function (res) {
                        if (res.status !== 0) {
                            // 没关注不做操作
                            return
                        } else {
                            // 关注了去除关注列表数据
                            Operation_user('/my/followPass', { ufocusid: $(e.target).attr('ufansid') })
                            // 操作他人的粉丝数据
                            Operation_TRuser('/my/TRNOPowdering', { ufansid: $(e.target).attr('ufansid') })
                        }
                    }
                });
                userlist()
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
// 黑名单取黑方法
function HMDQH(e) {
    // 查询黑名单中是否存在
    $.ajax({
        type: "post",
        url: "/my/CXblacklist",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`
        },
        data: {
            ublacklistid: $(e.target).attr('ublacklistid')
        },
        success: function (res) {
            if (res.status !== 0) {
                return layer.open({
                    icon: 5,
                    title: "提示",
                    content: '黑名单数据拉取失败',
                    time: 2000,
                });
            }
            Operation_user('/my/blackuser', { ublacklistid: $(e.target).attr('ublacklistid') })
            userlist()
            layer.open({
                icon: 6,
                title: "提示",
                content: '已从黑名单移出',
                time: 2000,
            });
        }
    })
}
// 黑名单关注方法
function HMDGZ(e) {
    // 查询是否是对方黑名单数据
    $.ajax({
        type: "post",
        url: "/my/CXTRblacklist",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`
        },
        data: {
            ublacklistid: $(e.target).attr('ublacklistid')
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
                $.ajax({
                    type: "post",
                    url: "/my/CXblacklist",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token") || ""}`
                    },
                    data: {
                        ublacklistid: $(e.target).attr('ublacklistid')
                    },
                    success: function (res) {
                        if (res.data[0].ustatus == "1") {
                            console.log("移出黑名单");
                            // 如果是黑名单
                            // 移出黑名单
                            Operation_user('/my/blackuser', { ublacklistid: $(e.target).attr('ublacklistid') })
                            userlist()
                            // 查询自己关注数据
                            $.ajax({
                                type: "post",
                                url: "/my/CXfollow",
                                headers: {
                                    Authorization: `Bearer ${localStorage.getItem("token") || ""}`
                                },
                                data: {
                                    ufocusid: $(e.target).attr('ublacklistid')
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
                                                ufocusid: $(e.target).attr('ublacklistid')
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
                                                userlist()
                                                // 查看对方粉丝列表是否有数据
                                                $.ajax({
                                                    type: "post",
                                                    url: "/my/CXTRmyfans",
                                                    headers: {
                                                        Authorization: `Bearer ${localStorage.getItem("token") || ""}`
                                                    },
                                                    data: {
                                                        ufansid: $(e.target).attr('ublacklistid')
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
                                                                    ufansid: $(e.target).attr('ublacklistid')
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
                                                                    userlist()
                                                                }
                                                            });
                                                        } else {
                                                            // 写入粉丝数据
                                                            Operation_TRuser('/my/TRPowdering', { ufansid: $(e.target).attr('ublacklistid') })
                                                            userlist()
                                                        }
                                                    }
                                                });
                                            }
                                        });
                                    } else {
                                        // 如果有关注数据
                                        // 修改关注数据
                                        Operation_user('/my/followNOPass', { ufocusid: $(e.target).attr('ublacklistid') })
                                        userlist()
                                        // 查看对方粉丝列表是否有数据
                                        $.ajax({
                                            type: "post",
                                            url: "/my/CXTRmyfans",
                                            headers: {
                                                Authorization: `Bearer ${localStorage.getItem("token") || ""}`
                                            },
                                            data: {
                                                ufansid: $(e.target).attr('ublacklistid')
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
                                                            ufansid: $(e.target).attr('ublacklistid')
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
                                                            userlist()
                                                        }
                                                    });
                                                } else {
                                                    // 写入粉丝数据
                                                    Operation_TRuser('/my/TRPowdering', { ufansid: $(e.target).attr('ublacklistid') })
                                                    userlist()
                                                }
                                            }
                                        });
                                    }
                                }
                            });
                            userlist()
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
                                    ufocusid: $(e.target).attr('ublacklistid')
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
                                                ufocusid: $(e.target).attr('ublacklistid')
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
                                                userlist()
                                                // 查看对方粉丝列表是否有数据
                                                $.ajax({
                                                    type: "post",
                                                    url: "/my/CXTRmyfans",
                                                    headers: {
                                                        Authorization: `Bearer ${localStorage.getItem("token") || ""}`
                                                    },
                                                    data: {
                                                        ufansid: $(e.target).attr('ublacklistid')
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
                                                                    ufansid: $(e.target).attr('ublacklistid')
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
                                                                    userlist()
                                                                }
                                                            });
                                                        } else {
                                                            // 写入粉丝数据
                                                            Operation_TRuser('/my/TRPowdering', { ufansid: $(e.target).attr('ublacklistid') })
                                                            userlist()
                                                        }
                                                    }
                                                });
                                            }
                                        });
                                    } else {
                                        // 如果有关注数据
                                        // 修改关注数据
                                        Operation_user('/my/followNOPass', { ufocusid: $(e.target).attr('ublacklistid') })
                                        userlist()
                                        // 查看对方粉丝列表是否有数据
                                        $.ajax({
                                            type: "post",
                                            url: "/my/CXTRmyfans",
                                            headers: {
                                                Authorization: `Bearer ${localStorage.getItem("token") || ""}`
                                            },
                                            data: {
                                                ufansid: $(e.target).attr('ublacklistid')
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
                                                            ufansid: $(e.target).attr('ublacklistid')
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
                                                            userlist()
                                                        }
                                                    });
                                                } else {
                                                    // 写入粉丝数据
                                                    Operation_TRuser('/my/TRPowdering', { ufansid: $(e.target).attr('ublacklistid') })
                                                    userlist()
                                                }
                                            }
                                        });
                                    }
                                }
                            });
                            userlist()
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