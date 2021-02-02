$(function() {
    $("ul.layui-tab-title>li").on("click", function(e) {
        $(e.currentTarget).css("background-color", "#009999").siblings("li").css("background-color", "#fff");
    });
});