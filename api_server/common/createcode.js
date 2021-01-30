module.exports = (num) => {
    var code = "";
    for (var i = 0; i < num; i++) {
        // 0-9随机数
        const randomNum = Math.floor(Math.random() * 10);
        code += randomNum;
    }
    return code;
}