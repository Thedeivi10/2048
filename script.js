const SIZE = 4;
let grid = createEmptyGrid();
let score = 0;
let best = 0;

const WIN_TARGET = 16;
let hasWon = false;
let modalOpen = false;

function showLoseModal() {
    if (document.getElementById('lose-modal')) return;
    const overlay = document.createElement('div');
    overlay.id = 'lose-modal';
    overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    overlay.innerHTML = `
        <div class="bg-white rounded-lg p-6 w-80 text-center shadow-lg">
            <h2 class="text-xl font-bold mb-4">Game over</h2>
            <p class="mb-6">No quedan movimientos. Reinicia para intentarlo de nuevo.</p>
            <div class="flex justify-center gap-4">
                <button id="lose-restart-btn" class="px-4 py-2 bg-red-500 text-white rounded">Restart</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    modalOpen = true;

    const rest = document.getElementById('lose-restart-btn');
    rest.addEventListener('click', () => {
        hideLoseModal();
        restartGame();
    });
}

function hideLoseModal() {
    const el = document.getElementById('lose-modal');
    if (el) el.remove();
    modalOpen = false;
}

function showWinModal() {
    if (document.getElementById('win-modal')) return; // ya creado
    const overlay = document.createElement('div');
    overlay.id = 'win-modal';
    overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    overlay.innerHTML = `
        <div class="bg-white rounded-lg p-6 w-80 text-center shadow-lg">
            <h2 class="text-xl font-bold mb-4">¡Has alcanzado ${WIN_TARGET}!</h2>
            <p class="mb-6">Puedes continuar jugando o reiniciar la partida.</p>
            <div class="flex justify-center gap-4">
                <button id="win-continue-btn" class="px-4 py-2 bg-green-500 text-white rounded">Continue</button>
                <button id="win-restart-btn" class="px-4 py-2 bg-red-500 text-white rounded">Restart</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

	modalOpen = true;
    const cont = document.getElementById('win-continue-btn');
    const rest = document.getElementById('win-restart-btn');
    cont.addEventListener('click', () => {
        hideWinModal();
    });
    rest.addEventListener('click', () => {
        hideWinModal();
        restartGame();
    });
}

function hideWinModal() {
    const el = document.getElementById('win-modal');
    if (el) el.remove();

	modalOpen = false;
}

function checkWin(target = WIN_TARGET) {
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (grid[r][c] >= target) return true;
        }
    }
    return false;
}

function createEmptyGrid() {
    return Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => 0));
}

function createGrid() {
    const gridContainer = document.getElementById('grid-container');
    gridContainer.innerHTML = '';
    gridContainer.className = 'grid-container bg-slate-500 flex flex-col gap-2 p-4 w-80 h-80 mx-auto rounded';
    for (let row = 0; row < SIZE; row++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'flex gap-2 flex-1';
        rowDiv.id = `row-${row}`;
        for (let col = 0; col < SIZE; col++) {
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
	const scoreContainer = document.querySelector('.score-container');
    let bestScoreEl = document.getElementById('best-score');
    if (!bestScoreEl) {
        bestScoreEl = document.createElement('span'); // inline para que el fondo solo cubra padding
        bestScoreEl.id = 'best-score';
        bestScoreEl.className = 'rounded p-1 bg-black text-red-500 ml-2'; // igual estilo que score/restart
        if (scoreContainer) scoreContainer.appendChild(bestScoreEl);
        else document.body.appendChild(bestScoreEl); // fallback
    }
    bestScoreEl.textContent = `Best: ${best}`;
}

function renderGrid() {
    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            const cell = document.getElementById(`cell-${row}-${col}`);
            const value = grid[row][col];
            if (!cell) continue;
            if (value === 0) {
                cell.textContent = '';
                cell.className = 'bg-slate-300 rounded flex items-center justify-center text-2xl font-bold flex-1';
            } else {
                cell.textContent = value;
                cell.className = 'bg-orange-400 rounded flex items-center justify-center text-2xl font-bold flex-1 text-white';
            }
        }
    }
}

function updateScoreDisplay() {
    const el = document.getElementById('score');
    if (el) el.textContent = score;
}

function updateBestDisplay() {
    const el = document.getElementById('best-score');
    if (el) el.textContent = `Best: ${best}`;
}

function getEmptyCells() {
    const empties = [];
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (grid[r][c] === 0) empties.push({ r, c });
        }
    }
    return empties;
}

function addRandomNumberToState() {
    const empties = getEmptyCells();
    if (empties.length === 0) return false;
    const idx = Math.floor(Math.random() * empties.length);
    const { r, c } = empties[idx];
    grid[r][c] = Math.random() < 0.1 ? 4 : 2;
    return true;
}

function slideAndMerge(line) {
    const nonZero = line.filter(x => x !== 0);
    const merged = [];
    let changed = false;
    let gain = 0;
    for (let i = 0; i < nonZero.length; i++) {
        if (i + 1 < nonZero.length && nonZero[i] === nonZero[i + 1]) {
            const newVal = nonZero[i] * 2;
            merged.push(newVal);
            gain += newVal;
            i++;
            changed = true;
        } else {
            merged.push(nonZero[i]);
        }
    }
    while (merged.length < SIZE) merged.push(0);
    for (let i = 0; i < SIZE; i++) {
        if (merged[i] !== line[i]) changed = true;
    }
    return { merged, changed, gain };
}

function moveLeft() {
    let moved = false;
    let gained = 0;
    for (let r = 0; r < SIZE; r++) {
        const { merged, changed, gain } = slideAndMerge(grid[r]);
        if (changed) {
            grid[r] = merged;
            moved = true;
            gained += gain;
        }
    }
    if (moved) {
        score += gained;
        updateScoreDisplay();
    }
    return moved;
}

function moveRight() {
    let moved = false;
    let gained = 0;
    for (let r = 0; r < SIZE; r++) {
        const reversed = [...grid[r]].reverse();
        const { merged, changed, gain } = slideAndMerge(reversed);
        const newRow = merged.reverse();
        if (changed) {
            grid[r] = newRow;
            moved = true;
            gained += gain;
        }
    }
    if (moved) {
        score += gained;
        updateScoreDisplay();
    }
    return moved;
}

function moveUp() {
    let moved = false;
    let gained = 0;
    for (let c = 0; c < SIZE; c++) {
        const col = [];
        for (let r = 0; r < SIZE; r++) col.push(grid[r][c]);
        const { merged, changed, gain } = slideAndMerge(col);
        if (changed) {
            for (let r = 0; r < SIZE; r++) grid[r][c] = merged[r];
            moved = true;
            gained += gain;
        }
    }
    if (moved) {
        score += gained;
        updateScoreDisplay();
    }
    return moved;
}

function moveDown() {
    let moved = false;
    let gained = 0;
    for (let c = 0; c < SIZE; c++) {
        const col = [];
        for (let r = 0; r < SIZE; r++) col.push(grid[r][c]);
        const reversed = col.reverse();
        const { merged, changed, gain } = slideAndMerge(reversed);
        const newCol = merged.reverse();
        if (changed) {
            for (let r = 0; r < SIZE; r++) grid[r][c] = newCol[r];
            moved = true;
            gained += gain;
        }
    }
    if (moved) {
        score += gained;
        updateScoreDisplay();
    }
    return moved;
}

function anyMovesPossible() {
    if (getEmptyCells().length > 0) return true;
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE - 1; c++) {
            if (grid[r][c] === grid[r][c + 1]) return true;
        }
    }
    for (let c = 0; c < SIZE; c++) {
        for (let r = 0; r < SIZE - 1; r++) {
            if (grid[r][c] === grid[r + 1][c]) return true;
        }
    }
    return false;
}

function handleKey(e) {
	if (modalOpen) return;

    let moved = false;
    if (e.key === 'ArrowLeft') moved = moveLeft();
    else if (e.key === 'ArrowRight') moved = moveRight();
    else if (e.key === 'ArrowUp') moved = moveUp();
    else if (e.key === 'ArrowDown') moved = moveDown();
    else return;

    if (moved) {
        addRandomNumberToState();
        renderGrid();

		if (!hasWon && checkWin()) {
            hasWon = true;
            // dejar que se repinte antes de mostrar
            requestAnimationFrame(showWinModal);
            return; // opcional: evitar comprobar game over inmediatamente
        }

        if (!anyMovesPossible()) {
			if (score > best) {
					best = score;
			}
            requestAnimationFrame(() => setTimeout(showLoseModal, 0));
            return;
        }
    }
}

function restartGame() {
	if (score > best) {
        best = score;
    }
	updateBestDisplay();
    grid = createEmptyGrid();
    score = 0;
    updateScoreDisplay();
    addRandomNumberToState();
    addRandomNumberToState();
    renderGrid();

	hideWinModal();
    hasWon = false;

    document.removeEventListener('keydown', handleKey);
    document.addEventListener('keydown', handleKey);
}

function initGame() {

    createGrid(); // construye DOM
    grid = createEmptyGrid();
    score = 0;
    updateScoreDisplay();
    addRandomNumberToState();
    addRandomNumberToState();
    renderGrid();

	document.removeEventListener('keydown', handleKey);
    document.addEventListener('keydown', handleKey);
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) restartBtn.addEventListener('click', restartGame);
}

document.addEventListener('DOMContentLoaded', initGame);