$.ajaxPrefilter(function (options) {
    options.url = "http://127.0.0.1:8024" + options.url;

});