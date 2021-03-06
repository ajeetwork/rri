import { clamp, all as allDirections } from "./direction.js";
import { NONE } from "./edge.js";
import { get as getScore } from "./score.js";
import { BorderCell } from "./cell.js";
import CellRepo from "./cell-repo.js";
import * as html from "./html.js";
import { DOWN, UP } from "./event.js";
const HOLD = 400;
const DIFFS = [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0]
];
export default class Board {
    constructor() {
        this.node = html.node("table", { className: "board" });
        this.node.className = "board";
        this.node.addEventListener(DOWN, this);
        this.node.addEventListener("contextmenu", this);
        this._cells = new CellRepo(this.node);
    }
    handleEvent(e) {
        switch (e.type) {
            case "contextmenu":
                e.preventDefault();
                break;
            case DOWN:
                let td = e.target.closest("td");
                if (!td) {
                    return;
                }
                let cell = this._cells.byNode(td);
                cell && this.onClick(cell);
                function removeEvents() {
                    td.removeEventListener(UP, cancelHold);
                    td.removeEventListener("pointerleave", cancelHold);
                }
                function cancelHold() {
                    clearTimeout(timeout);
                    removeEvents();
                }
                let timeout = setTimeout(() => {
                    this.onHold(cell);
                    removeEvents();
                }, HOLD);
                td.addEventListener(UP, cancelHold);
                td.addEventListener("pointerleave", cancelHold);
                break;
        }
    }
    onClick(cell) { console.log("click", cell); }
    onHold(cell) { console.log("hold", cell); }
    signalAvailable(tile) {
        this._cells.forEach(cell => {
            cell.signal = (tile ? this.wouldFit(tile, cell.x, cell.y) : false);
        });
    }
    cycleTransform(x, y) {
        let tile = this._cells.at(x, y).tile;
        if (!tile) {
            return;
        }
        let avail = this._getTransforms(tile, x, y);
        let index = avail.indexOf(tile.transform);
        if (index == -1 || avail.length <= 1) {
            return;
        }
        index = (index + 1) % avail.length;
        tile.transform = avail[index];
    }
    placeBest(tile, x, y, round) {
        let avail = this._getTransforms(tile, x, y);
        if (!avail.length) {
            return false;
        }
        tile.transform = avail[0];
        this.place(tile, x, y, round);
        return true;
    }
    place(tile, x, y, round) {
        let cell = this._cells.at(x, y);
        cell.tile = tile;
        cell.round = (tile ? round.toString() : "");
    }
    wouldFit(tile, x, y) {
        let cell = this._cells.at(x, y);
        if (cell instanceof BorderCell || cell.tile) {
            return false;
        }
        let transforms = this._getTransforms(tile, x, y);
        return (transforms.length > 0);
    }
    getScore() { return getScore(this._cells); }
    _getTransforms(tile, x, y) {
        let neighborEdges = allDirections.map(dir => {
            let diff = DIFFS[dir];
            let neighbor = this._cells.at(x + diff[0], y + diff[1]).tile;
            if (!neighbor) {
                return NONE;
            }
            return neighbor.getEdge(clamp(dir + 2)).type;
        });
        let clone = tile.clone();
        return tile.getTransforms().filter(t => {
            clone.transform = t;
            return clone.fitsNeighbors(neighborEdges);
        });
    }
}
