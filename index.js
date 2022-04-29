const rowsNum = document.querySelector('#rows');
const colsNum = document.querySelector('#cols');
const table = document.querySelector('table');
const flagPar = document.querySelector('.flags');
const submit = document.querySelector('button');
const gameResult = document.querySelector('p');

var nums = {};
var bombs = new Set();
var win = {};
var copyMemo = {};
var gameOver = false;

/* table generator */
function createTable(e) {
  e.preventDefault();

  submit.disabled = true;
  
  if (rowsNum.value < 3 || colsNum.value < 3 || rowsNum.value > 30 || colsNum > 30) {
    window.alert('please choose a number bigger than three and smaller than thirty.');
    rowsNum.value = '';
    colsNum.value = '';
    document.location.href = '';
  }

  var rowsVal = rowsNum.value;
  var colsVal = colsNum.value;
  
  for (let i = 1; i <= rowsVal; i++) {
    var row = document.createElement('tr');
    for (let j = 1; j <= colsVal; j++) {
      var cell = document.createElement('td');
      cell.setAttribute('class', `${i}${j}`);
      cell.style.backgroundColor = `rgba(${255},${182},${193},${0.2})`;
      row.appendChild(cell);
    }
    table.appendChild(row);
  }

  rowsNum.value = '';
  colsNum.value = '';

  /* bomb generator*/
  let max = rowsVal * colsVal;
  let percent = 0.15;
  let bombNum = Math.floor(percent * max);
  for (let i = 0; i < bombNum; i++) {
    let randomRow = Math.floor(Math.random() * (rowsVal)+1);
    let randomCol = Math.floor(Math.random() * (colsVal)+1);
    let randomNum = randomRow.toString() + randomCol.toString(); 
    bombs[randomNum] = true;
  }
  console.log('bombs', bombs);

  var flagNum = Object.keys(bombs).length;
 
  /* rightClick */
  function flaghandleClick(e) {
    e.preventDefault();

    if(e.target.tagName != 'TD') return;

    if(e.target.textContent !== '🚩' && (flagNum > 0) && (flagNum <= bombNum) &&!(Number(e.target.className) in copyMemo) && !e.target.textContent) {
      e.target.textContent = '🚩';
      --flagNum;
    } 
    else if(e.target.textContent === '🚩'){
      e.target.textContent = '';
      flagNum++;
    }
    flagPar.textContent = `Remaining flags: ${flagNum}`
  }

  /* leftclick */
  function cellhandleClick(e) {
    if (e.target.tagName !== "TD") return;

    const cells = document.querySelectorAll('td');
    
    /* is it a bomb */
    if (bombs[Number(e.target.className)] && e.target.textContent !== '🚩') {
      e.target.style.backgroundColor = `rgb(${255},${0},${0})`;
      for (let i = 0; i < cells.length; i++) {
        if (bombs[cells[i].className] && cells[i].textContent !== '🚩') {
          cells[i].textContent = '💣';
          if (e.target !== cells[i]) {
            cells[i].style.backgroundColor = `rgba(${176},${224},${230},${0.2})`;
          }
        } 
        if (bombs[cells[i].className] && cells[i].textContent === '🚩') {
          cells[i].textContent = '✔';
          if (e.target !== cells[i]) {
            cells[i].style.backgroundColor = `rgba(${176},${224},${230},${0.2})`;
          }
        }
        gameResult.textContent = 'GAME OVER!!!';
        gameOver = true;
        table.removeEventListener('click', cellhandleClick, true);
        table.removeEventListener('contextmenu', flaghandleClick, true);
      }
    }

    /* is it a number */
    if (!bombs[Number(e.target.className)] && e.target.textContent !== '🚩' && !copyMemo[Number(e.target.className)]){
      e.target.textContent = `${nums[Number(e.target.className)]}`;
      e.target.style.backgroundColor = `rgba(${176},${224},${230},${0.2})`;
      win[Number(e.target.className)] = 1;
    }

    /* is it an empty */
    if (!bombs[Number(e.target.className)] && !nums[Number(e.target.className)]) {
      let target = Number(e.target.className);
      if (target <= 109) {
        var rows = Math.floor(target / 10);
        var cols = target % 10;
      } else if (target > 109) {
        rows = Math.floor(target / 100);
        cols = target % 100;
      }
      isEmpty(rows, cols);

      for (let i = 0; i < cells.length; i++) {
        if (cells[i].className in copyMemo) {
          if (cells[i].textContent === '🚩') {
            flagNum++;
            flagPar.textContent = `Remaining flags: ${flagNum}`
          }
          cells[i].textContent = `${copyMemo[Number(cells[i].className)]}`;
          cells[i].style.backgroundColor = `rgba(${176},${224},${230},${0.2})`;
        }
      }
    }

    var isWin = Object.keys(nums).every(elm => win[elm]);
    if (isWin) {
      gameResult.textContent = 'YOHOO, YOU WON!';
      table.removeEventListener('click', cellhandleClick, {capture: true});
      table.removeEventListener('contextmenu', flaghandleClick, {capture: true});
    }

    if (gameOver || isWin) {
      var resetBtn = document.createElement('button');
      resetBtn.textContent = '↻';
      resetBtn.setAttribute('class', 'reset');
      document.body.appendChild(resetBtn);
      resetBtn.addEventListener('click', handleReset);
    }
  }

  /* number generator */
  for (let key of Object.keys(bombs)) {
    let mykey = Number(key); 
    if (mykey <= 109) {
      var row = Math.floor(mykey / 10);
      var col = mykey % 10;  
    }
    if (mykey > 109) {
      row = Math.floor(mykey / 100);
      col = mykey % 100;
    } 
    
   // console.log('row-col',row ,',', col);
   
    if (col > 1 && !bombs[Number(row.toString()+(col-1).toString())]) {
      (!nums[Number(row.toString()+(col-1).toString())]) ? nums[Number(row.toString()+(col-1).toString())] = 1 : nums[Number(row.toString()+(col-1).toString())] += 1;
      //console.log('-1: ',Number(row.toString()+(col-1).toString()));
    } 
    if (col < colsVal && !bombs[Number(row.toString()+(col+1).toString())]) {
      (!nums[Number(row.toString()+(col+1).toString())]) ? nums[Number(row.toString()+(col+1).toString())] = 1 : nums[Number(row.toString()+(col+1).toString())] += 1;
      //console.log('+1: ',Number(row.toString()+(col+1).toString()));
    }
    if (row > 1 && !bombs[Number((row-1).toString()+col.toString())]) {
      (!nums[Number((row-1).toString()+col.toString())]) ? nums[Number((row-1).toString()+(col).toString())] = 1 : nums[Number((row-1).toString()+(col).toString())] += 1;
      //console.log('-10: ',Number((row-1).toString()+col.toString()));
    }
    if (row < rowsVal && !bombs[Number((row+1).toString()+col.toString())]) {
      (!nums[Number((row+1).toString()+col.toString())]) ? nums[Number((row+1).toString()+col.toString())] = 1 : nums[Number((row+1).toString()+(col).toString())] += 1;
      //console.log('+10: ',Number((row+1).toString()+col.toString()));
    }
    if (col < colsVal && row < rowsVal && !bombs[Number((row+1).toString()+(col+1).toString())]) {
      (!nums[Number((row+1).toString()+(col+1).toString())]) ? nums[Number((row+1).toString()+(col+1).toString())] = 1 : nums[Number((row+1).toString()+(col+1).toString())] += 1;
      //console.log('+11: ',Number((row+1).toString()+(col+1).toString()));
    }
    if (row > 1 && col > 1 && !bombs[Number((row-1).toString()+(col-1).toString())]) {
      (!nums[Number((row-1).toString()+(col-1).toString())]) ? nums[Number((row-1).toString()+(col-1).toString())] = 1 : nums[Number((row-1).toString()+(col-1).toString())] += 1; 
     // console.log('-11: ',Number((row-1).toString()+(col-1).toString()));
    }
    if (row > 1 && col < colsVal && !bombs[Number((row-1).toString()+(col+1).toString())]) {
      (!nums[Number((row-1).toString()+(col+1).toString())]) ? nums[Number((row-1).toString()+(col+1).toString())] = 1 : nums[Number((row-1).toString()+(col+1).toString())] += 1;
     // console.log('-9: ',Number((row-1).toString()+(col+1).toString()));
    }
    if (row < rowsVal && col > 1 && !bombs[Number((row+1).toString()+(col-1).toString())]) {
      (!nums[Number((row+1).toString()+(col-1).toString())]) ? nums[Number((row+1).toString()+(col-1).toString())] = 1 : nums[Number((row+1).toString()+(col-1).toString())] += 1;
     // console.log('+9: ',Number((row+1).toString()+(col-1).toString()));
    }
  }
  console.log('nums: ',nums);
  
  /* empty generator */
  function isEmpty(rows, cols, memo={}) {
    copyMemo = {...memo};
    //console.log(clickedCell);  

    /*let rows = Number(clickedCell.slice(0,1));
    let cols = Number(clickedCell.slice(1));*/
  
    /*if ((clickedCell) <= 109) {
      var rows = Math.floor(clickedCell / 10);
      var cols = (clickedCell) % 10;  
    } 
    else if ((clickedCell) > 109) {
      rows = Math.floor(clickedCell / 100);
      cols = (clickedCell) % 100;
    } */
    console.log('rows: ', rows);
    console.log('cols: ',cols);
    var clickedCell = rows.toString()+cols.toString(); 
    if (rows < 1 || cols < 1 || rows > rowsVal || cols > colsVal){
      //console.log('out of range',clickedCell)
      console.log('out of range',clickedCell)
      return;
    }
    if (clickedCell in bombs) {
      console.log('this is a bomb',clickedCell)
      return;
    } 
    if (clickedCell in memo) {
      console.log('already exists ',clickedCell)
      return;
    } 
    else if(clickedCell in nums){
      memo[clickedCell] = nums[clickedCell];
      win[clickedCell] = 1;
      console.log('this is a num',clickedCell)
      return;
    } 
    else {
      memo[clickedCell] = '';
    }
   
    let directions = [[1,0],[0,1],[-1,0],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]];
    for (let i = 0; i < directions.length; i++) {
      let newRows = (rows)+directions[i][0];
      let newCols = (cols)+directions[i][1];
      //let newClickedCell = Number(newRows.toString() + newCols.toString());
      //isEmpty((newClickedCell), memo);
      isEmpty(newRows, newCols, memo);
    }
  }

  table.addEventListener('click', cellhandleClick, true);
  table.addEventListener('contextmenu', flaghandleClick, true);
}

function handleReset(e) {
  e.preventDefault();
  document.location.href = '';
}
  
submit.addEventListener('click', createTable);


