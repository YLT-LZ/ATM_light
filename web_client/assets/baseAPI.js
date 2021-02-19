// 每次只要使用js中的ajax请求，不区分请求方式，在发起请求之前都会先调用这个函数
// 所有，调用的ajax的参数全部以options参数的形式传入这个回调函数
$.ajaxPrefilter(function (options) {
    options.url = "http://127.0.0.1:8024" + options.url;
});

$(function () {
    // 如果本地中存储的用户登录状态不为true
    if (!sessionStorage.getItem("refresh")) {
        // 那么就清空本地中的身份信息
        localStorage.removeItem("token");
    }
    if (!sessionStorage.getItem("Arefresh")) {
        // 那么就清空本地中的身份信息
        localStorage.removeItem("Atoken");
    }
});


// 用户token认证的函数
function authen(token, callback1, callback2) {
    // 如果用户本地的token不存在
    if (!localStorage.getItem(token)) {
        // 则执行该函数
        if (!callback1) {
            return;
        }
        return callback1();
    }
    // 否则执行callback2函数
    callback2();
}

// 随机图片
function randomImg(end, start) {
    let differ = end - start;
    let random = Math.random();
    let num = start + Math.floor(differ * random);
    let src = null;
    switch (num) {
        case 1:
            src = "https://m.ykimg.com/05410601601FF42D0000017930015FCE?x-oss-process=image/resize,w_290/interlace,1/quality,Q_80/sharpen,100";
            break;
        case 2:
            src = "https://m.ykimg.com/054106016010FC07000001543A03D510?x-oss-process=image/resize,w_290/interlace,1/quality,Q_80/sharpen,100";
            break;
        case 3:
            src = "https://m.ykimg.com/05410101601F325F0785FDA925D420BD?x-oss-process=image/resize,w_290/interlace,1/quality,Q_80/sharpen,100";
            break;
        case 4:
            src = "https://vthumb.ykimg.com/054101015FE1F01F079382A5CE29B604";
            break;
        case 5:
            src = "https://m.ykimg.com/05410601601E9E810000016C790C4780?x-oss-process=image/resize,w_290/interlace,1/quality,Q_80/sharpen,100";
            break;
        case 6:
            src = "https://m.ykimg.com/054101015FFAAFE3047BD7A9763BA20D?x-oss-process=image/resize,w_290/interlace,1/quality,Q_80/sharpen,100";
            break;
        case 7:
            src = "https://m.ykimg.com/05410101601F327E04CD82A96EBE2999?x-oss-process=image/resize,w_290/interlace,1/quality,Q_80/sharpen,100";
            break;
        case 8:
            src = "https://vthumb.ykimg.com/054106015FDCC62200000154A90BAE72";
            break;
        case 9:
            src = "https://vthumb.ykimg.com/054101015F705E550000013AC20B9304";
            break;
        case 10:
            src = "https://vthumb.ykimg.com/054101015F703DAC0000013AC20D0BD7";
            break;
        case 11:
            src = "https://m.ykimg.com/054F01015D8DC50D8B36609C865646B9?x-oss-process=image/resize,w_290/interlace,1/quality,Q_80/sharpen,100";
            break;
        case 12:
            src = "https://m.ykimg.com/054F01015D80DDD9ADD0169EF334D774?x-oss-process=image/resize,w_290/interlace,1/quality,Q_80/sharpen,100";
            break;
        case 13:
            src = "https://m.ykimg.com/054F01015E8B37A51B4D079C0CA194A4?x-oss-process=image/resize,w_290/interlace,1/quality,Q_80/sharpen,100";
            break;
        case 14:
            src = "https://m.ykimg.com/054F01015D21C40D8B36609008670CC3?x-oss-process=image/resize,w_290/interlace,1/quality,Q_80/sharpen,100";
            break;
        case 15:
            src = "https://m.ykimg.com/054F01015C0F0CCC8B6C069207D4CB57?x-oss-process=image/resize,w_290/interlace,1/quality,Q_80/sharpen,100";
            break;
        case 16:
            src = "https://m.ykimg.com/054F01015EC36B130F954C9D79335A75?x-oss-process=image/resize,w_290/interlace,1/quality,Q_80/sharpen,100";
            break;
        case 17:
            src = "https://vthumb.ykimg.com/054101015F961FD30785FDA18C42CAC3";
            break;
        case 18:
            src = "https://m.ykimg.com/054F0101601DEB8607937EA916C69EA6?x-oss-process=image/resize,w_290/interlace,1/quality,Q_80/sharpen,100";
            break;
        case 19:
            src = "https://m.ykimg.com/054F01015FBF60E804CD83A58B1DD212?x-oss-process=image/resize,w_290/interlace,1/quality,Q_80/sharpen,100";
            break;
        case 20:
            src = "https://m.ykimg.com/054F01015FE0E09204CD84A544D6327B?x-oss-process=image/resize,w_290/interlace,1/quality,Q_80/sharpen,100";
            break;
    }
    return src;
} 
