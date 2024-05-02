function adjustScore(player) {
    // 获取输入的分数变化值
    var inputValue = document.getElementById(player).value;
    // 获取当前分数并转换为数值
    var currentScore = parseInt(document.getElementById('score' + player).innerText);
    // 应用变化，这里允许inputValue为负数以实现减分
    var newScore = currentScore + (isNaN(inputValue) ? 0 : parseInt(inputValue));
    // 更新显示
    document.getElementById('score' + player).innerText = newScore;
    // 清空输入框
    document.getElementById(player).value = '';
}
