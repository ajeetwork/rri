import { Cell, BorderCell } from "./cell.js";
import { BOARD } from "./conf.js";
function inBoard(x, y) {
    return (x > 0 && y > 0 && x <= BOARD && y <= BOARD);
}
export default class CellRepo {
    constructor(table) {
        this._cells = [];
        for (let y = 0; y < BOARD + 2; y++) {
            let tr = table.insertRow();
            let row = [];
            this._cells.push(row);
            for (let x = 0; x < BOARD + 2; x++) {
                let td = tr.insertCell();
                let ctor = (inBoard(x, y) ? Cell : BorderCell);
                row.push(new ctor(td, x, y));
            }
        }
    }
    forEach(cb) {
        this._cells.forEach(row => {
            row.forEach(cell => cb(cell));
        });
    }
    filter(test) {
        let results = [];
        this._cells.forEach(row => {
            row.forEach(cell => {
                test(cell) && results.push(cell);
            });
        });
        return results;
    }
    byNode(node) {
        return this.filter(cell => cell.node == node)[0];
    }
    at(x, y) {
        return this._cells[y][x];
    }
}
