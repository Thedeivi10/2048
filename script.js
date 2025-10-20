let gameGrid = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
];

function addRandomNumber(){
	const cell = document.getElementById(`cell-1-1`)
	cell.textContent = '2';
}

function createGrid() {
    const gridContainer = document.getElementById('grid-container');
    gridContainer.innerHTML = '';
    gridContainer.className = 'grid-container bg-slate-500 flex flex-col gap-2 p-4 w-80 h-80 mx-auto rounded';
    for (let row = 0; row < 4; row++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'flex gap-2 flex-1';
        rowDiv.id = `row-${row}`;
        for (let col = 0; col < 4; col++) {
            const cell = document.createElement('div');
            cell.className = 'bg-slate-300 rounded flex items-center justify-center text-2xl font-bold flex-1';
            cell.id = `cell-${row}-${col}`;
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.textContent = '';
            rowDiv.appendChild(cell);
        }
        gridContainer.appendChild(rowDiv);
    }
}

function updateCell(row, col, value) {
    const cell = document.getElementById(`cell-${row}-${col}`);
    if (value === '') {
        cell.textContent = '';
        cell.className = 'bg-slate-300 rounded flex items-center justify-center text-2xl font-bold flex-1';
    } else {
        cell.textContent = value;
        cell.className = 'bg-orange-400 rounded flex items-center justify-center text-2xl font-bold flex-1 text-white';
    }
}

function renderGrid() {
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
			const cell = document.getElementById(`cell-${row}-${col}`);
            updateCell(row, col, cell.textContent);
        }
    }
}
createGrid();
function initGame() {
	addRandomNumber()
    renderGrid();
}
document.addEventListener('DOMContentLoaded', initGame);