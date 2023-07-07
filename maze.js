function randomInt(n) {
    return Math.floor(Math.random() * n);
}

class Maze {
    constructor(game, type) {
        // type: 0 = 4x3, 1 = maze, 2 = bridge
        this.type = type;
        this.game = game;
        this.maze = [];
        this.icy = document.getElementById('icy') ? document.getElementById('icy').checked : false;
        this.slippy = document.getElementById('slippy') ? parseFloat(document.getElementById('slippy').value) : 0.1;
        this.gamma = document.getElementById('gamma') ? parseFloat(document.getElementById('gamma').value) : 0.9;

        if (type === 0) {
            this.dim = 4;
            this.reward = 100;

            this.makeGrid();
            this.generateFourByThree();
            this.attachMoves();
        } else if (type === 1) {
            this.dim = document.getElementById('dim') ? parseInt(document.getElementById('dim').value) : 10;
            this.reward = document.getElementById('reward') ? parseInt(document.getElementById('reward').value) : 10000;
            this.deleted = document.getElementById('walls_deleted') ? parseInt(document.getElementById('walls_deleted').value) : 0;
            this.pits = document.getElementById('pits') ? parseInt(document.getElementById('pits').value) : 0;

            this.makeGrid();
            this.generateMaze(0, 0);
            this.placePits(this.pits);
            this.breakWalls(this.deleted);
            this.maze[this.dim - 1][this.dim - 1].utility = this.reward;
            this.maze[this.dim - 1][this.dim - 1].final = true;
            this.attachMoves();
        } else if (type === 2) {
            this.dim = 10;
            this.reward = document.getElementById('reward') ? parseInt(document.getElementById('reward').value) : 10000;

            this.makeGrid();
            this.generateBridge();
            this.attachMoves();
        }
    }

    attachMoves() {

        if (!this.icy) {
            for (var i = 0; i < this.dim; i++) {
                for (var j = 0; j < this.dim; j++) {
                    var cell = this.maze[i][j];
                    cell.moveNorth = { next: [cell.north ? cell.north : cell], prob: [1], q: cell.utility, n: 0 };
                    cell.moveEast = { next: [cell.east ? cell.east : cell], prob: [1], q: cell.utility, n: 0 };
                    cell.moveSouth = { next: [cell.south ? cell.south : cell], prob: [1], q: cell.utility, n: 0 };
                    cell.moveWest = { next: [cell.west ? cell.west : cell], prob: [1], q: cell.utility, n: 0 };
                }
            }
        }
        else {
            for (var i = 0; i < this.dim; i++) {
                for (var j = 0; j < this.dim; j++) {
                    var cell = this.maze[i][j];
                    cell.moveNorth = { next: [cell.north ? cell.north : cell, cell.east ? cell.east : cell, cell.west ? cell.west : cell], prob: [1 - 2 * this.slippy, this.slippy, this.slippy], q: cell.utility, n: 0 };
                    cell.moveSouth = { next: [cell.south ? cell.south : cell, cell.east ? cell.east : cell, cell.west ? cell.west : cell], prob: [1 - 2 * this.slippy, this.slippy, this.slippy], q: cell.utility, n: 0 };
                    cell.moveEast = { next: [cell.east ? cell.east : cell, cell.north ? cell.north : cell, cell.south ? cell.south : cell], prob: [1 - 2 * this.slippy, this.slippy, this.slippy], q: cell.utility, n: 0 };
                    cell.moveWest = { next: [cell.west ? cell.west : cell, cell.north ? cell.north : cell, cell.south ? cell.south : cell], prob: [1 - 2 * this.slippy, this.slippy, this.slippy], q: cell.utility, n: 0 };
                }
            }
        }
    };

    generateBridge() {
        var cell;
        for (var i = 0; i < this.dim; i++) {
            for (var j = 0; j < this.dim; j++) {
                cell = this.maze[i][j];
                // no walls
                if (j !== 0) { // north
                    cell.north = this.maze[i][j - 1];
                }
                if (i !== this.dim - 1) {
                    cell.east = this.maze[i + 1][j];
                }
                if (j !== this.dim - 1) {
                    cell.south = this.maze[i][j + 1];
                }
                if (i !== 0) {
                    cell.west = this.maze[i - 1][j];
                }

                // add pits
                if (j > 1 && j < this.dim - 2 && (i < 3 || i > this.dim - 4)) {
                    cell.utility = -this.reward;
                    cell.final = true;
                    cell.pit = true;
                }
            }
        }

        for (var i = 0; i < this.dim; i++) {
            this.maze[i][this.dim - 1].utility = this.reward;
            this.maze[i][this.dim - 1].final = true;
        }
    };

    generateFourByThree() {
        this.maze[0][0].east = this.maze[1][0];
        this.maze[0][0].south = this.maze[0][1];
        this.maze[1][0].east = this.maze[2][0];
        this.maze[1][0].west = this.maze[0][0];
        this.maze[2][0].east = this.maze[3][0];
        this.maze[2][0].west = this.maze[1][0];
        this.maze[2][0].south = this.maze[2][1];
        this.maze[3][0].west = this.maze[2][0];
        this.maze[0][1].north = this.maze[0][0];
        this.maze[0][1].south = this.maze[0][2];
        this.maze[2][1].south = this.maze[2][2];
        this.maze[2][1].north = this.maze[2][0];
        this.maze[2][1].east = this.maze[3][1];
        this.maze[3][1].west = this.maze[2][1];
        this.maze[3][1].south = this.maze[3][2];
        this.maze[0][2].north = this.maze[0][1];
        this.maze[0][2].east = this.maze[1][2];
        this.maze[1][2].east = this.maze[2][2];
        this.maze[1][2].west = this.maze[0][2];
        this.maze[2][2].east = this.maze[3][2];
        this.maze[2][2].west = this.maze[1][2];
        this.maze[2][2].north = this.maze[2][1];
        this.maze[3][2].west = this.maze[2][2];
        this.maze[3][2].north = this.maze[3][1];

        this.maze[3][0].utility = this.reward;
        this.maze[3][1].utility = -this.reward;
        this.maze[3][1].pit = true;
        this.maze[3][0].final = true;
        this.maze[3][1].final = true;
    };

    makeGrid() {
        for (var i = 0; i < this.dim; i++) {
            this.maze.push([]);
            for (var j = 0; j < this.dim; j++) {
                this.maze[i].push({
                    x: i,
                    y: j,
                    north: null,
                    east: null,
                    south: null,
                    west: null,
                    moveNorth: null,
                    moveEast: null,
                    moveSouth: null,
                    moveWest: null,
                    visited: null,
                    utility: -5, // reward
                    value: 0,
                    solution: false,
                    final: false,
                    explored: false,
                    pit: false
                });
            }
        }
    };

    placePits(num) {
        for (var i = 0; i < num; i++) {
            var x = randomInt(this.dim);
            var y = randomInt(this.dim);

            while (this.maze[x][y].pit) {
                x = randomInt(this.dim);
                y = randomInt(this.dim);
            }

            this.maze[x][y].pit = true;
            this.maze[x][y].utility = -this.reward;
            this.maze[x][y].final = true;
        }
    };

    breakWalls(num) {
        for (var k = 0; k < num; k++) {
            var walls = [];
            var cell;
            for (var i = 0; i < this.dim; i++) {
                for (var j = 0; j < this.dim; j++) {
                    cell = this.maze[i][j];
                    if (!cell.north && j !== 0) walls.push({ x: i, y: j, wall: "north" });
                    if (!cell.east && i !== this.dim - 1) walls.push({ x: i, y: j, wall: "east" });
                    if (!cell.south && j !== this.dim - 1) walls.push({ x: i, y: j, wall: "south" });
                    if (!cell.west && i !== 0) walls.push({ x: i, y: j, wall: "west" });
                }
            }

            if (walls.length === 0) return; // no more walls to break

            var wall = walls[randomInt(walls.length)];
            cell = this.maze[wall.x][wall.y];

            if (wall.wall === "north") {
                cell.north = this.maze[wall.x][wall.y - 1];
                this.maze[wall.x][wall.y - 1].south = cell;
            }
            if (wall.wall === "east") {
                cell.east = this.maze[wall.x + 1][wall.y];
                this.maze[wall.x + 1][wall.y].west = cell;
            }
            if (wall.wall === "south") {
                cell.south = this.maze[wall.x][wall.y + 1];
                this.maze[wall.x][wall.y + 1].north = cell;
            }
            if (wall.wall === "west") {
                cell.west = this.maze[wall.x - 1][wall.y];
                this.maze[wall.x - 1][wall.y].east = cell;
            }
        }
    };

    updateValue(x, y) {
        var max = -Infinity;
        var cell = this.maze[x][y];
        var oldValue = cell.value;

        if (cell.final) {
            cell.value = cell.utility;
            return false;
        }

        var newValue = cell.utility;

        var dist = cell.moveNorth;
        var sum = 0;
        for (var i = 0; i < dist.next.length; i++) {
            sum += dist.next[i].value * dist.prob[i];
        }
        if (sum > max) max = sum;

        dist = cell.moveEast;
        sum = 0;
        for (var i = 0; i < dist.next.length; i++) {
            sum += dist.next[i].value * dist.prob[i];
        }
        if (sum > max) max = sum;

        dist = cell.moveSouth;
        sum = 0;
        for (var i = 0; i < dist.next.length; i++) {
            sum += dist.next[i].value * dist.prob[i];
        }
        if (sum > max) max = sum;

        dist = cell.moveWest;
        sum = 0;
        for (var i = 0; i < dist.next.length; i++) {
            sum += dist.next[i].value * dist.prob[i];
        }
        if (sum > max) max = sum;

        newValue += max * this.gamma;

        cell.value = newValue
        return (cell.value !== oldValue);
    };

    updateValues() {
        var changed = false;
        for (var i = 0; i < this.dim; i++) {
            for (var j = 0; j < this.dim; j++) {
                if (this.updateValue(i, j)) changed = true;
            }
        }
        return changed;
    };

    updateExploredValues() {
        var changed = false;
        for (var i = 0; i < this.dim; i++) {
            for (var j = 0; j < this.dim; j++) {
                if (this.maze[i][j].explored && this.updateValue(i, j)) changed = true;
            }
        }
        return changed;
    };

    calculateValueFunction() {
        while (this.updateValues());
    };

    resetValues() {
        for (var i = 0; i < this.dim; i++) {
            for (var j = 0; j < this.dim; j++) {
                var cell = this.maze[i][j];
                cell.value = 0;
                cell.moveNorth.q = cell.utility;
                cell.moveEast.q = cell.utility;
                cell.moveSouth.q = cell.utility;
                cell.moveWest.q = cell.utility;
            }
        }
    };

    resetExplored() {
        for (var i = 0; i < this.dim; i++) {
            for (var j = 0; j < this.dim; j++) {
                this.maze[i][j].explored = false;
            }
        }
    };


    generateMaze(x, y) {
        this.maze[x][y].visited = true;

        var found = false;
        if (x === this.dim - 1 && y === this.dim - 1) found = true;

        var temp = [0, 1, 2, 3];
        var order = [];
        for (var i = 0; i < 4; i++) {
            order.push(temp.splice(randomInt(temp.length), 1)[0]);
        }

        for (var i = 0; i < 4; i++) {
            if (order[i] === 0) {
                // north
                if (y !== 0 && !this.maze[x][y - 1].visited) {
                    this.maze[x][y].north = this.maze[x][y - 1];
                    this.maze[x][y - 1].south = this.maze[x][y];
                    if (this.generateMaze(x, y - 1)) found = true;
                }
            } else if (order[i] === 1) {
                // east
                if (x !== this.dim - 1 && !this.maze[x + 1][y].visited) {
                    this.maze[x][y].east = this.maze[x + 1][y];
                    this.maze[x + 1][y].west = this.maze[x][y];
                    if (this.generateMaze(x + 1, y)) found = true;
                }
            } else if (order[i] === 2) {
                // south
                if (y !== this.dim - 1 && !this.maze[x][y + 1].visited) {
                    this.maze[x][y].south = this.maze[x][y + 1];
                    this.maze[x][y + 1].north = this.maze[x][y];
                    if (this.generateMaze(x, y + 1)) found = true;
                }
            } else if (order[i] === 3) {
                // west
                if (x !== 0 && !this.maze[x - 1][y].visited) {
                    this.maze[x][y].west = this.maze[x - 1][y];
                    this.maze[x - 1][y].east = this.maze[x][y];
                    if (this.generateMaze(x - 1, y)) found = true;
                }
            }
        }
        if (found) this.maze[x][y].solution = true;
        return found;
    }

    update() {
    };

    findBestNeighbor(cell) {
        let maxValue = -Infinity;
        let direction = -1;
        let curr = null;
        var showQ = document.getElementById("q").checked;
        if (showQ) {
            if(cell.moveNorth.q > maxValue) {
                maxValue = cell.moveNorth.q;
                direction = 0;
            }
            if(cell.moveEast.q > maxValue) {
                maxValue = cell.moveEast.q;
                direction = 1;
            }
            if(cell.moveSouth.q > maxValue) {
                maxValue = cell.moveSouth.q;
                direction = 2;
            }
            if(cell.moveWest.q > maxValue) {
                maxValue = cell.moveWest.q;
                direction = 3;
            }
        } else {
            if (curr = cell.north) {
                if (curr.value > maxValue) {
                    maxValue = curr.value;
                    direction = 0;
                }
            }
            if (curr = cell.east) {
                if (curr.value > maxValue) {
                    maxValue = curr.value;
                    direction = 1;
                }
            }
            if (curr = cell.south) {
                if (curr.value > maxValue) {
                    maxValue = curr.value;
                    direction = 2;
                }
            }
            if (curr = cell.west) {
                if (curr.value > maxValue) {
                    maxValue = curr.value;
                    direction = 3;
                }
            }
        }
        return direction;
    }

    draw(ctx) {
        var length = 800 / this.dim;
        var width = length / 20;

        var showSolution = document.getElementById("show_solution").checked;
        //var showValues = document.getElementById("show_value").checked;
        var showRewards = document.getElementById("show_reward").checked;
        var showQ = document.getElementById("q").checked;
        var fog = document.getElementById("fog").checked;

        if (this.icy) {
            ctx.fillStyle = "lightblue";
            ctx.fillRect(0, 0, 800, 800);
        }

        for (var i = 0; i < this.dim; i++) {
            for (var j = 0; j < this.dim; j++) {
                ctx.strokeStyle = "gray";
                ctx.strokeRect(i * length, j * length, length, length);
            }
        }

        for (var i = 0; i < this.dim; i++) {
            for (var j = 0; j < this.dim; j++) {
                const cell = this.maze[i][j];
                if (cell.utility === this.reward) {
                    ctx.drawImage(ASSET_MANAGER.getAsset("Pot_Gold.png"), i * length + 0.25 * length, j * length + 0.25 * length, 0.5 * length, 0.5 * length);
                }
                else if (cell.pit) {
                    ctx.drawImage(ASSET_MANAGER.getAsset("pit.png"), i * length, j * length, length, length);
                }
                else if (showSolution) {
                    const direction = this.findBestNeighbor(cell);
                    if (direction != -1) {
                        const padding = 0.2;
                        ctx.globalAlpha = 0.25;
                        ctx.drawImage(ASSET_MANAGER.arrows[direction], (i + padding) * length, (j + padding) * length, (1 - 2 * padding) * length, (1 - 2 * padding) * length);
                        ctx.globalAlpha = 1;
                    }
                }
                ctx.fillStyle = "red";
                if (!cell.north) ctx.fillRect(i * length - width, j * length, length + 2 * width, width);
                if (!cell.south) ctx.fillRect(i * length - width, j * length + length - width, length + 2 * width, width);
                if (!cell.west) ctx.fillRect(i * length, j * length - width, width, length + 2 * width);
                if (!cell.east) ctx.fillRect(i * length + length - width, j * length - width, width, length + 2 * width);
                // ctx.fillStyle = "green";
                // if (cell.solution && showSolution) {
                //     if (cell.north && j > 0 && this.maze[i][j - 1].solution) { // north
                //         ctx.fillRect(i * length + length / 2 - width / 2, j * length, width, length / 2 + width / 2);
                //     }
                //     if (cell.south && j < this.dim - 1 && this.maze[i][j + 1].solution) { // south
                //         ctx.fillRect(i * length + length / 2 - width / 2, j * length + length / 2 - width / 2, width, length / 2 + width / 2);
                //     }
                //     ctx.fillRect(i * length + length / 2 - width / 2, j * length + length / 2 - width / 2, width, width);
                //     if (cell.west && i > 0 && this.maze[i - 1][j].solution) { // west
                //         ctx.fillRect(i * length, j * length + length / 2 - width / 2, length / 2 + width / 2, width);
                //     }
                //     if (cell.east && i < this.dim - 1 && this.maze[i + 1][j].solution) { // east
                //         ctx.fillRect(i * length + length / 2 - width / 2, j * length + length / 2 - width / 2, length / 2 + width / 2, width);
                //     }
                //     ctx.fillRect(i * length + length / 2 - width / 2, j * length + length / 2 - width / 2, width, width);
                // }
            }
        }

        for (var i = 0; i < this.dim; i++) {
            for (var j = 0; j < this.dim; j++) {
                const xShift = 10;
                const yShift = this.type === 0 ? length / 2 + 64 : length / 2 + 9;
                const yRewardShift = this.type === 0 ? yShift - 80 : yShift - 26;

                ctx.font = showQ ? this.type === 0 ? "48px Arial" : "12px Arial" : this.type === 0 ? "90px Arial" : "20px Arial";
                if (showRewards) {
                    if (this.maze[i][j].pit) ctx.fillStyle = "white"; else ctx.fillStyle = "black";
                    ctx.fillText(this.maze[i][j].utility, i * length + xShift, j * length + yRewardShift);
                }
                if (!showQ) {
                    if (this.maze[i][j].pit) ctx.fillStyle = "yellow"; else ctx.fillStyle = "blue";
                    ctx.fillText(Math.floor(this.maze[i][j].value), i * length + xShift, j * length + yShift);
                    // ctx.strokeRect(i * length + xShift, j * length + yShift + 3, 24, -24);
                }
                if (showQ && !this.maze[i][j].final) {
                    const shift1 = this.type === 0 ? 48 : 18;
                    const shift2 = this.type === 0 ? length / 2 + 12 : length / 2 + 6;
                    if (this.maze[i][j].pit) ctx.fillStyle = "pink"; else ctx.fillStyle = "purple";
                    ctx.fillText(Math.floor(this.maze[i][j].moveNorth.q), i * length + length / 3 + 2, j * length + shift1);
                    if (this.maze[i][j].pit) ctx.fillStyle = "pink"; else ctx.fillStyle = "purple";
                    ctx.fillText(Math.floor(this.maze[i][j].moveEast.q), i * length + 3 * length / 4 - 12, j * length + shift2);
                    if (this.maze[i][j].pit) ctx.fillStyle = "pink"; else ctx.fillStyle = "purple";
                    ctx.fillText(Math.floor(this.maze[i][j].moveSouth.q), i * length + length / 3 + 2, j * length + length - width - 2);
                    if (this.maze[i][j].pit) ctx.fillStyle = "pink"; else ctx.fillStyle = "purple";
                    ctx.fillText(Math.floor(this.maze[i][j].moveWest.q), i * length + width + 2, j * length + shift2);
                }
                if (fog && !this.maze[i][j].explored) {
                    ctx.save();
                    ctx.globalAlpha = 0.75;
                    ctx.fillStyle = "black";
                    ctx.fillRect(i * length, j * length, length, length);
                    ctx.restore();
                }
            }
        }
    }
};