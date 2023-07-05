function Agent(game, maze) {
    this.game = game;
    this.maze = maze;
    this.alpha = 0.5;
    this.reward = 0;
    this.originX = maze.type === 0 ? 3 : maze.type === 1 ? 0 : randomInt(this.maze.dim - 1);
    this.originY = maze.type === 0 ? 2 : 0;
    this.x = this.originX;
    this.y = this.originY;
    this.lastX = this.x;
    this.lastY = this.y;
    this.actionTimer = 0;
    this.actionThreshold = document.getElementById("speed").value;
    this.epsilon = 1;
    this.qLearner = document.getElementById("q").checked;
    this.explorer = document.getElementById("explorer").checked;
    this.drunk = document.getElementById("drunk").checked;
    this.updateAll = document.getElementById("update_explored").checked;
    this.steps = 0;
    this.decayThreshold = document.getElementById("epsilon_decay").value;
    this.decay = document.getElementById("epsilon").value;
};

Agent.prototype.update = function() {
    var cell = this.maze.maze[this.x][this.y];
    cell.explored = true;
    
    this.actionTimer += this.game.clockTick;
    if (this.actionTimer > this.actionThreshold) {
        this.steps++;
        if (this.steps % this.decayThreshold === 0) {
            this.epsilon *= this.decay;
        }
        this.actionTimer = 0;

        if (this.updateAll) this.maze.updateExploredValues();
        else this.maze.updateValue(this.x, this.y);

        if (cell.final) {
            this.x = this.maze.type === 2 ? randomInt(this.maze.dim) : this.originX;
            this.y = this.originY;
        } else {
            var moves = [];
            var unexplored = [];
            var bestmove = [];
            var bestvalue = -Infinity;

            var bestQmove = ["north"];
            var bestQ = cell.moveNorth.q;
            if (cell.moveEast.q > bestQ) {
                bestQ = cell.moveEast.q;
                bestQmove = [];
                bestQmove.push("east");
            }
            else if (cell.moveEast.q === bestQ) bestQmove.push("east");
            if (cell.moveSouth.q > bestQ) {
                bestQ = cell.moveSouth.q;
                bestQmove = [];
                bestQmove.push("south");
            }
            else if (cell.moveSouth.q === bestQ) bestQmove.push("south");
            if (cell.moveWest.q > bestQ) {
                bestQ = cell.moveWest.q;
                bestQmove = [];
                bestQmove.push("west");
            }
            else if (cell.moveWest.q === bestQ) bestQmove.push("west");

            if (cell.north) {
                if (cell.north.value > bestvalue) {
                    bestvalue = cell.north.value;
                    bestmove = [];
                    bestmove.push("north");
                }
                else if (cell.north.value === bestvalue) bestmove.push("north");
                if(this.lastY !== this.y - 1 || !this.drunk) moves.push("north");
                if (!cell.north.explored) unexplored.push("north");
            }
            if (cell.east) {
                if (cell.east.value > bestvalue) {
                    bestvalue = cell.east.value;
                    bestmove = [];
                    bestmove.push("east");
                }
                else if (cell.east.value === bestvalue) bestmove.push("east");
                if (this.lastX !== this.x + 1 || !this.drunk) moves.push("east");
                if (!cell.east.explored) unexplored.push("east");
            }
            if (cell.south) {
                if (cell.south.value > bestvalue) {
                    bestvalue = cell.south.value;
                    bestmove = [];
                    bestmove.push("south");
                }
                else if (cell.south.value === bestvalue) bestmove.push("south");
                if (!cell.south.explored) unexplored.push("south");
                if (this.lastY !== this.y + 1 || !this.drunk) moves.push("south");
            }
            if (cell.west) {
                if (cell.west.value > bestvalue) {
                    bestvalue = cell.west.value;
                    bestmove = [];
                    bestmove.push("west");
                }
                else if (cell.west.value === bestvalue) bestmove.push("west");
                if (!cell.west.explored) unexplored.push("west");
                if (this.lastX !== this.x - 1 || !this.drunk) moves.push("west");
            }


            var move;
            if (this.explorer && unexplored.length > 0) {
                move = unexplored[randomInt(unexplored.length)];
            } else if (Math.random() < this.epsilon) {
                move = moves[randomInt(moves.length)];
            } else {
                if (this.qLearner) move = bestQmove[randomInt(bestQmove.length)];
                else move = bestmove[randomInt(bestmove.length)];
            }

            this.lastX = this.x;
            this.lastY = this.y;

            if (!move) {
                console.log(move);
                if (cell.north) move = "north";
                if (cell.south) move = "south";
                if (cell.east) move = "east";
                if (cell.west) move = "west";
            }

            this.move(move);
        }
    }
};

Agent.prototype.move = function (move) {
    var cell = this.maze.maze[this.x][this.y];
    var dist = null;
    if (move === "north") dist = cell.moveNorth;
    if (move === "east") dist = cell.moveEast;
    if (move === "south") dist = cell.moveSouth;
    if (move === "west") dist = cell.moveWest;
    dist.n++;
    var rand = Math.random();
    var i = 0;
    var sum = 0;
    while (rand > sum + dist.prob[i]) sum += dist.prob[i++];
    var newCell = dist.next[i];
    this.updateQ(cell, dist, newCell);
    this.reward += newCell.utility;
    this.x = newCell.x;
    this.y = newCell.y;
};

Agent.prototype.updateQ = function (cell, action, newCell) {
    var max = newCell.moveNorth.q;
    if (newCell.moveEast.q > max) max = newCell.moveEast.q;
    if (newCell.moveSouth.q > max) max = newCell.moveSouth.q;
    if (newCell.moveWest.q > max) max = newCell.moveWest.q;
    action.q += 1/(Math.ceil(action.n/100)) * (cell.utility + this.maze.gamma * (max - action.q));
};

Agent.prototype.draw = function (ctx) {
    var length = 800 / this.maze.dim;

    var tick = document.getElementById("tick");
    tick.innerHTML = "Tick: " + this.steps;

    var epsilon = document.getElementById("ep");
    epsilon.innerHTML = "Epsilon: " + Math.floor(this.epsilon * 100) / 100;

    var epsilon = document.getElementById("rew");
    epsilon.innerHTML = "Reward: " + Math.floor(this.reward * 100) / 100;

    ctx.drawImage(ASSET_MANAGER.getAsset("robo1.png"), this.x * length + 0.22 * length, this.y * length + 0.125 * length, length * 0.54, length * 0.75);
};