$(function() {
    $("ul.layui-tab-title>li").on("click", function() {
        $(this).css("background-color", "#009999").siblings("li").css("background-color", "#fff");
    });
});