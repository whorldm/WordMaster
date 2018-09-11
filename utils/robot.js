var pagesManager = require("./pagesManager.js");

//机器人参数
var misoperationRate = 0.2;    //认识这对单词，但手误点错的概率
var incognizanceRate = 0.3; //所有单词里不认识的占的比例
var minTimeToChooseFirstWord = 1000;   //选第一个单词用的最少时间(毫秒)
var maxTimeToChooseFirstWord = 3000;   //选第一个单词用的最多时间
var minTimeToChooseSecondWord = 500;  //选第二个单词用的最少时间
var maxTimeToChooseSecondWord = 1000;  //选第二个单词用的最多时间

var handleArray = null;
var _wordGrid = null;
var _arrayRow, _arrayColumn;
var _allWordsCount;
var updateInterval = 16;    //帧驱动的帧率
var intervalIdOfUpdate;
var incognizanceCount;  //有几对单词不认识，由比例和总单词数算出
var firstWord = null;  //每次配对选择的第一个单词
var firstWordIndexInHandleArray;
var waitTimeForNextChoice;  //每选一个单词要等待的时长
var timeCounterForChooseWord;
var wordCountNotEliminate;     //还没被选的单词总数

/**
 * @description 重置状态变量，每局游戏开始前调用
 */
function prepareForGame(wordGrid, arrayRow, arrayColumn){
    clearAllStateValues();
    setGridData(wordGrid, arrayRow, arrayColumn);
    initHandleArray(_allWordsCount, arrayRow, arrayColumn);
    initIncognizanceCount(_allWordsCount);
    registerUpdate();
    resetTimeCounter();
}

function update(){
    updateTimeCounter();
    if(timeCounterForChooseWord >= waitTimeForNextChoice){
        chooseWord();
        resetTimeCounter();
    }
}

function startToPlayGame(wordGrid, arrayRow, arrayColumn){
    prepareForGame(wordGrid, arrayRow, arrayColumn)
}

function stopToPlayGame(){
    clearInterval(intervalIdOfUpdate);
    clearAllStateValues();
}

function setGridData(wordGrid, arrayRow, arrayColumn){
    if(wordGrid == null){
        console.error();
    }
    var allWordsCount = arrayRow * arrayColumn;
    _wordGrid = wordGrid;
    _arrayRow = arrayRow;
    _arrayColumn = arrayColumn;
    _allWordsCount = allWordsCount;
}

function registerUpdate(){
    intervalIdOfUpdate = setInterval(update, updateInterval);
}

function initHandleArray(allWordsCount, arrayRow, arrayColumn){
    wordCountNotEliminate = allWordsCount;
    handleArray = new Array(allWordsCount);
    for(var i = 0, l = handleArray.length; i <= l - 1; ++i){
      handleArray[i] = {row : -1, column : -1};
    }
    var counterForInitHandleArray = 0;
    for(var i = 0, l1 = arrayRow; i <= l1 - 1; ++i){
      for(var j = 0, l2 = arrayColumn; j <= l2 - 1; ++j){
        handleArray[counterForInitHandleArray].row = i;
        handleArray[counterForInitHandleArray].column = j;
        counterForInitHandleArray++;
      } 
    }
}

function initIncognizanceCount(allWordsCount){
    incognizanceCount = Math.round(incognizanceRate * (allWordsCount / 2));
}

function clearAllStateValues(){
    _wordGrid = null;
    handleArray = null;
    firstWord = null; 
}

function resetTimeCounter(){
    if(firstWord == null){
        waitTimeForNextChoice = randomRange(minTimeToChooseFirstWord, maxTimeToChooseFirstWord);
    }
    else{
        waitTimeForNextChoice = randomRange(minTimeToChooseSecondWord, maxTimeToChooseSecondWord);
    }
    timeCounterForChooseWord = 0;
}

function chooseWord(){
    var chooseWordIndex;
    var wordIndexInWordGrid = null;
    var word = null;
    if(firstWord == null){     //如果还没选单词对中的第一个，那就随便选一个
        chooseWordIndex = randomRange(0, wordCountNotEliminate - 1);
        firstWordIndexInHandleArray = chooseWordIndex;
        wordIndexInWordGrid = handleArray[chooseWordIndex];
        word = _wordGrid[wordIndexInWordGrid.row][wordIndexInWordGrid.column];
        firstWord = createWordRecord(wordIndexInWordGrid.row, wordIndexInWordGrid.column, word.pairIndex.row, word.pairIndex.column);

        onChooseWord(wordIndexInWordGrid.row, wordIndexInWordGrid.column);
        //更新处理数组
        var temp = handleArray[firstWordIndexInHandleArray];
        handleArray[firstWordIndexInHandleArray] = handleArray[wordCountNotEliminate - 1];
        handleArray[wordCountNotEliminate - 1] = temp;
        wordCountNotEliminate--;
    }
    else{
        if(incognizanceCount * 2 < wordCountNotEliminate){  //如果不认识的单词数量少于还未消除的单词总数，就选认识的单词消
            var ifMisoperation = (Math.random() < misoperationRate);    //在认识单词对的情况下，有可能发生误点击
            if(!ifMisoperation){
                chooseWordIndex = findPairIndexInHandleArray(firstWord._pairIndexRow, firstWord._pairIndexCol);
                wordIndexInWordGrid = handleArray[chooseWordIndex];
                word = _wordGrid[wordIndexInWordGrid.row][wordIndexInWordGrid.column];
            }
            else{
                chooseWordIndex = randomRange(0, wordCountNotEliminate - 1);
                wordIndexInWordGrid = handleArray[chooseWordIndex];
                word = _wordGrid[wordIndexInWordGrid.row][wordIndexInWordGrid.column];
            }
        }
        else{   //如果不认识的单词数量大于等于还未消除的单词总数，就随便选个消
            chooseWordIndex = randomRange(0, wordCountNotEliminate - 1);
            wordIndexInWordGrid = handleArray[chooseWordIndex];
            word = _wordGrid[wordIndexInWordGrid.row][wordIndexInWordGrid.column];
        }

        onChooseWord(wordIndexInWordGrid.row, wordIndexInWordGrid.column);
        //更新处理数组
        if(firstWord._pairIndexRow === wordIndexInWordGrid.row 
            && firstWord._pairIndexCol === wordIndexInWordGrid.column){ //如果选的第二个单词跟第一个匹配
            handleArray[chooseWordIndex] = handleArray[wordCountNotEliminate - 1];
            wordCountNotEliminate--;
            onEliminateSuccess(firstWord._selfIndexRow, firstWord.selfIndexCol, wordIndexInWordGrid.row, wordIndexInWordGrid.column);
            if(wordCountNotEliminate === 0){
                onAllWordBeenEliminated();
                stopToPlayGame();
            }
        }
        else{   //如果不匹配，恢复处理数组
            wordCountNotEliminate++;
            var temp = handleArray[firstWordIndexInHandleArray];
            handleArray[firstWordIndexInHandleArray] = handleArray[wordCountNotEliminate - 1];
            handleArray[wordCountNotEliminate - 1] = temp;
            onEliminateFailed(firstWord._selfIndexRow, firstWord.selfIndexCol, wordIndexInWordGrid.row, wordIndexInWordGrid.column);
        }
        //清除单词选择记录
        firstWord = null;
    }
}

/**
 * @description 当消除单词对成功时的回调
 * @param {*} firstWordRowInWordGrid    单词对中第一个点击的单词在单词矩阵中的行坐标
 * @param {*} firstWordColumnInWordGrid 单词对中第一个点击的单词在单词矩阵中的列坐标
 * @param {*} secondWordRowInWordGrid   单词对中第二个点击的单词在单词矩阵中的行坐标
 * @param {*} secondWordColumnInWordGrid    单词对中第二个点击的单词在单词矩阵中的列坐标
 */
function onEliminateSuccess(firstWordRowInWordGrid, firstWordColumnInWordGrid, secondWordRowInWordGrid, secondWordColumnInWordGrid){
    console.log("onEliminateSuccess:" + _wordGrid[firstWordRowInWordGrid][firstWordColumnInWordGrid].wordData.value + "__" + _wordGrid[secondWordRowInWordGrid][secondWordColumnInWordGrid].wordData.value);
}

/**
 * @description 当消除单词对失败时的回调
 * @param {*} firstWordRowInWordGrid    单词对中第一个点击的单词在单词矩阵中的行坐标
 * @param {*} firstWordColumnInWordGrid 单词对中第一个点击的单词在单词矩阵中的列坐标
 * @param {*} secondWordRowInWordGrid   单词对中第二个点击的单词在单词矩阵中的行坐标
 * @param {*} secondWordColumnInWordGrid    单词对中第二个点击的单词在单词矩阵中的列坐标
 */
function onEliminateFailed(firstWordRowInWordGrid, firstWordColumnInWordGrid, secondWordRowInWordGrid, secondWordColumnInWordGrid){
    console.log("onEliminateFailed:" + _wordGrid[firstWordRowInWordGrid][firstWordColumnInWordGrid].wordData.value + "__" + _wordGrid[secondWordRowInWordGrid][secondWordColumnInWordGrid].wordData.value);
}

function onAllWordBeenEliminated(){
    console.log("onAllWordBeenEliminated");
}


/**
 *@description 当选择任意单词时回调
 *
 * @param {*} chooseWordRowInWordGrid
 * @param {*} chooseWordColumnInWordGrid
 */
function onChooseWord(chooseWordRowInWordGrid, chooseWordColumnInWordGrid){
    console.log("onChooseWord:" + _wordGrid[chooseWordRowInWordGrid][chooseWordColumnInWordGrid].wordData.value);
}

function updateTimeCounter(){
    timeCounterForChooseWord += updateInterval;
}

function randomRange(min, max){
    if(!isInt(min) || !isInt(max)){
        console.error();
    }
    if(max < min){
        console.error();
    }

    var value = Math.round(min + (max - min) * Math.random());
    return value;
}

function isInt(value){
    return value % 1 === 0;
} 

function createWordRecord(selfIndexRow, selfIndexCol, pairIndexRow, pairIndexCol){
    return {
        _selfIndexRow : selfIndexRow, 
        _selfIndexCol : selfIndexCol, 
        _pairIndexRow : pairIndexRow, 
        _pairIndexCol : pairIndexCol
    } 
}

function findPairIndexInHandleArray(pairIndexRow, pairIndexCol){
    for(var i = 0, l = wordCountNotEliminate; i <= l - 1; ++i){
        if(handleArray[i].row === pairIndexRow && handleArray[i].column === pairIndexCol){
            return i;
        }
    }
    console.error();
}

module.exports = {
    startToPlayGame,
    stopToPlayGame,
    misoperationRate,
    incognizanceRate,
    minTimeToChooseFirstWord,
    maxTimeToChooseFirstWord,
    minTimeToChooseSecondWord,
    maxTimeToChooseSecondWord
  }