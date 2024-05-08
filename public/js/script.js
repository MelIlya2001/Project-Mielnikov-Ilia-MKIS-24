const GRID_SIZE = 9;
const BOX_SIZE = 3;
let past_level = JSON.parse(localStorage.getItem("id"));

function convertPositionToIndex(row, column) {
  return row * GRID_SIZE + column;
}

function convertIndexToPosition(index) {
  return {
    row: Math.floor(index / GRID_SIZE),
    column: index % GRID_SIZE,
  };
}

class Sudoku {
  constructor(markup) {
    this.grid = generateSudoku(markup);
  }

  getDuplicatePositions(row, column, value) {
    const duplicatesInColumn = this.getDuplicatePositionsInColumn(
      row,
      column,
      value,
    );
    const duplicatesInRow = this.getDuplicatePositionsInRow(row, column, value);
    const duplicatesInBox = this.getDuplicatePositionsInBox(row, column, value);

    const duplicates = [...duplicatesInColumn, ...duplicatesInRow];
    duplicatesInBox.forEach((duplicateInBox) => {
      if (duplicateInBox.row !== row && duplicateInBox.column !== column)
        duplicates.push(duplicateInBox);
    });

    return duplicates;
  }

  getDuplicatePositionsInColumn(row, column, value) {
    const duplicates = [];
    for (let iRow = 0; iRow < GRID_SIZE; iRow++) {
      if (this.grid[iRow][column] === value && iRow !== row) {
        duplicates.push({ row: iRow, column });
      }
    }
    return duplicates;
  }

  getDuplicatePositionsInRow(row, column, value) {
    const duplicates = [];
    for (let iColumn = 0; iColumn < GRID_SIZE; iColumn++) {
      if (this.grid[row][iColumn] === value && iColumn !== column) {
        duplicates.push({ row, column: iColumn });
      }
    }
    return duplicates;
  }

  getDuplicatePositionsInBox(row, column, value) {
    const duplicates = [];
    const firstRowInBox = row - (row % BOX_SIZE);
    const firstColumnInBox = column - (column % BOX_SIZE);

    for (let iRow = firstRowInBox; iRow < firstRowInBox + BOX_SIZE; iRow++) {
      for (
        let iColumn = firstColumnInBox;
        iColumn < firstColumnInBox + BOX_SIZE;
        iColumn++
      ) {
        if (
          this.grid[iRow][iColumn] === value &&
          iRow !== row &&
          iColumn !== column
        ) {
          duplicates.push({ row: iRow, column: iColumn });
        }
      }
    }
    return duplicates;
  }

  hasEmptyCells() {
    return Boolean(findEmptyCell(this.grid));
  }
}

function generateSudoku(markup) {
  const sudoku = createEmptyGrid(markup);
  return sudoku;
}

function createEmptyGrid(markup) {
  let str = markup;

  let array = new Array(GRID_SIZE)
    .fill()
    .map(() => new Array(GRID_SIZE).fill(null));

  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      array[i][j] = str[0] == 0 ? null : Number(str[0]);
      str = str.slice(1);
    }
  }

  return array;
}

function findEmptyCell(grid) {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let column = 0; column < GRID_SIZE; column++) {
      if (grid[row][column] === null) return { row, column };
    }
  }
  return null;
}

function getRandomNumbers() {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  for (let i = numbers.length - 1; i >= 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[randomIndex]] = [numbers[randomIndex], numbers[i]];
  }

  return numbers;
}

function validate(grid, row, column, value) {
  return (
    validateColumn(grid, row, column, value) &&
    validateRow(grid, row, column, value) &&
    validateBox(grid, row, column, value)
  );
}

function validateColumn(grid, row, column, value) {
  for (let iRow = 0; iRow < GRID_SIZE; iRow++) {
    if (grid[iRow][column] === value && iRow !== row) return false;
  }
  return true;
}

function validateRow(grid, row, column, value) {
  for (let iColumn = 0; iColumn < GRID_SIZE; iColumn++) {
    if (grid[row][iColumn] === value && iColumn !== column) return false;
  }
  return true;
}

function validateBox(grid, row, column, value) {
  const firstRowInBox = row - (row % BOX_SIZE);
  const firstColumnInBox = column - (column % BOX_SIZE);

  for (let iRow = firstRowInBox; iRow < firstRowInBox + BOX_SIZE; iRow++) {
    for (
      let iColumn = firstColumnInBox;
      iColumn < firstColumnInBox + BOX_SIZE;
      iColumn++
    ) {
      if (grid[iRow][iColumn] === value && iRow !== row && iColumn !== column)
        return false;
    }
  }
  return true;
}

let error_message = document.querySelector(".error");
let button = document.querySelector("#Change");
const markup = document.querySelector("#markup").innerHTML;
const header = document.querySelector(".header");

const sudoku = new Sudoku(markup);

let cells;
let selectedCellIndex;
let selectedCell;
init();

function init() {
  console.log(past_level);
  if (!past_level) {
    localStorage.setItem("id", 1);
    past_level = 1;
  }

  button.disabled = true; //по умолчанию отключена, т.к. по умолчанию в инпуте следущий после последнего пройденного уровня. Уровень игрока хранится в localstorage

  initCells();
  initNumbers();
  initRemover();
  initKeyEvent();
}

function initCells() {
  cells = document.querySelectorAll(".cell");
  fillCells();
  initCellsEvent();
}

function fillCells() {
  for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
    const { row, column } = convertIndexToPosition(i);

    if (sudoku.grid[row][column] !== null) {
      cells[i].classList.add("filled");
      cells[i].innerHTML = sudoku.grid[row][column];
    }
  }
}

function initCellsEvent() {
  cells.forEach((cell, index) => {
    cell.addEventListener("click", () => onCellClick(cell, index));
  });
}

function onCellClick(clickedCell, index) {
  cells.forEach((cell) =>
    cell.classList.remove("highlighted", "selected", "error"),
  );

  if (clickedCell.classList.contains("filled")) {
    selectedCellIndex = null;
    selectedCell = null;
  } else {
    selectedCellIndex = index;
    selectedCell = clickedCell;
    clickedCell.classList.add("selected");
    highlightCellsBy(index);
  }

  if (clickedCell.innerHTML === "") return;
  cells.forEach((cell) => {
    if (cell.innerHTML === clickedCell.innerHTML)
      cell.classList.add("selected");
  });
}

function highlightCellsBy(index) {
  highlightColumnBy(index);
  highlightRowBy(index);
  highlightBoxBy(index);
}

function highlightColumnBy(index) {
  const column = index % GRID_SIZE;
  for (let row = 0; row < GRID_SIZE; row++) {
    const cellIndex = convertPositionToIndex(row, column);
    cells[cellIndex].classList.add("highlighted");
  }
}

function highlightRowBy(index) {
  const row = Math.floor(index / GRID_SIZE);
  for (let column = 0; column < GRID_SIZE; column++) {
    const cellIndex = convertPositionToIndex(row, column);
    cells[cellIndex].classList.add("highlighted");
  }
}

function highlightBoxBy(index) {
  const column = index % GRID_SIZE;
  const row = Math.floor(index / GRID_SIZE);
  const firstRowInBox = row - (row % BOX_SIZE);
  const firstColumnInBox = column - (column % BOX_SIZE);

  for (let iRow = firstRowInBox; iRow < firstRowInBox + BOX_SIZE; iRow++) {
    for (
      let iColumn = firstColumnInBox;
      iColumn < firstColumnInBox + BOX_SIZE;
      iColumn++
    ) {
      const cellIndex = convertPositionToIndex(iRow, iColumn);
      cells[cellIndex].classList.add("highlighted");
    }
  }
}

function initNumbers() {
  const numbers = document.querySelectorAll(".number");
  numbers.forEach((number) => {
    number.addEventListener("click", () =>
      onNumberClick(parseInt(number.innerHTML)),
    );
  });
}

function onNumberClick(number) {
  if (!selectedCell) return;
  if (selectedCell.classList.contains("filled")) return;

  cells.forEach((cell) =>
    cell.classList.remove("error", "zoom", "shake", "selected"),
  );
  selectedCell.classList.add("selected");
  setValueInSelectedCell(number);

  if (!sudoku.hasEmptyCells()) {
    setTimeout(() => winAnimation(), 500);
  }
}

function setValueInSelectedCell(value) {
  const { row, column } = convertIndexToPosition(selectedCellIndex);
  const duplicatesPositions = sudoku.getDuplicatePositions(row, column, value);
  if (duplicatesPositions.length) {
    highlightDuplicates(duplicatesPositions);
    return;
  }
  sudoku.grid[row][column] = value;
  selectedCell.innerHTML = value;
  setTimeout(() => selectedCell.classList.add("zoom"), 0);
}

function highlightDuplicates(duplicatesPositions) {
  duplicatesPositions.forEach((duplicate) => {
    const index = convertPositionToIndex(duplicate.row, duplicate.column);
    setTimeout(() => cells[index].classList.add("error", "shake"), 0);
  });
}

function initRemover() {
  const remover = document.querySelector(".remove");
  remover.addEventListener("click", () => onRemoveClick());
}

function onRemoveClick() {
  if (!selectedCell) return;
  if (selectedCell.classList.contains("filled")) return;

  cells.forEach((cell) =>
    cell.classList.remove("error", "zoom", "shake", "selected"),
  );
  selectedCell.classList.add("selected");
  const { row, column } = convertIndexToPosition(selectedCellIndex);
  selectedCell.innerHTML = "";
  sudoku.grid[row][column] = null;
}

function initKeyEvent() {
  document.addEventListener("keydown", (event) => {
    if (event.key === "Backspace") {
      onRemoveClick();
    } else if (event.key >= "1" && event.key <= "9") {
      onNumberClick(parseInt(event.key));
    }
  });

}

function OnExitBurger(button) {
    header.classList.toggle("hidden");
}

function winAnimation() {
  cells.forEach((cell) =>
    cell.classList.remove("highlighted", "selected", "zoom"),
  );
  cells.forEach((cell, i) => {
    setTimeout(() => cell.classList.add("highlighted", "zoom"), i * 15);
  });
  for (let i = 1; i < 8; i++) {
    setTimeout(
      () => cells.forEach((cell) => cell.classList.toggle("highlighted")),
      500 + cells.length * 15 + 300 * i,
    );
  }

  past_level++;
  localStorage.setItem("id", past_level);
  OnChangeLevel(past_level);
}

function OnChangeLevel(value) {
  if (value >= past_level + 1 || value < 1) {
    error_message.classList.remove("hidden");
    button.disabled = true;
  } else {
    error_message.classList.add("hidden");
    button.disabled = false;
  }
}
