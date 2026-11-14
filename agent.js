function Agent(game, maze) {
    this.game = game;
    this.maze = maze;
    this.reward = 0; // total reward since this agent was made
    this.originX = maze.type === 0 ? 3 : maze.type === 1 ? 0 : randomInt(this.maze.dim - 1);
    this.originY = maze.type === 0 ? 2 : 0;
    this.x = this.originX;
    this.y = this.originY;
    this.lastX = this.x;
    this.lastY = this.y;
    this.actionTimer = 0;
    this.epsilon = 1;
    this.steps = 0;
    // one entry per finished episode (reaching the gold or a pit), charted by the page
    this.history = { length: [], reward: [], epsilon: [] };
    this.episodeSteps = 0;
    this.episodeReward = 0;
};

// Steps run at PARAMS.stepsPerSecond: several per frame when that is faster than the screen.
Agent.prototype.update = function () {
    this.maze.maze[this.x][this.y].explored = true;
    if (PARAMS.paused) return;
    var interval = 1 / PARAMS.stepsPerSecond, n = 0;
    this.actionTimer += this.game.clockTick;
    while (this.actionTimer >= interval && n < 1000) {
        this.actionTimer -= interval;
        this.step();
        n++;
    }
    if (n === 1000) this.actionTimer = 0;
};

Agent.prototype.step = function () {
    var cell = this.maze.maze[this.x][this.y];
    cell.explored = true;

    this.steps++;
    if (this.steps % PARAMS.decayEvery === 0) {
        this.epsilon *= PARAMS.epsilonDecay;
    }

    if (PARAMS.update_explored) this.maze.updateExploredValues();
    else this.maze.updateValue(this.x, this.y);

    if (cell.final) {
        this.history.length.push(this.episodeSteps);
        this.history.reward.push(this.episodeReward);
        this.history.epsilon.push(this.epsilon);
        this.episodeSteps = 0;
        this.episodeReward = 0;
        this.x = this.maze.type === 2 ? randomInt(this.maze.dim) : this.originX;
        this.y = this.originY;
        this.lastX = this.x;
        this.lastY = this.y;
        return;
    }

    var moves = [];
    var unexplored = [];
    var bestmove = [];
    var bestvalue = -Infinity;

    var bestQmove = ["north"];
    var bestQ = cell.moveNorth.q;
    if (cell.moveEast.q > bestQ) {
        bestQ = cell.moveEast.q;
        bestQmove = ["east"];
    }
    else if (cell.moveEast.q === bestQ) bestQmove.push("east");
    if (cell.moveSouth.q > bestQ) {
        bestQ = cell.moveSouth.q;
        bestQmove = ["south"];
    }
    else if (cell.moveSouth.q === bestQ) bestQmove.push("south");
    if (cell.moveWest.q > bestQ) {
        bestQ = cell.moveWest.q;
        bestQmove = ["west"];
    }
    else if (cell.moveWest.q === bestQ) bestQmove.push("west");

    if (cell.north) {
        if (cell.north.value > bestvalue) {
            bestvalue = cell.north.value;
            bestmove = ["north"];
        }
        else if (cell.north.value === bestvalue) bestmove.push("north");
        if (this.lastY !== this.y - 1 || !PARAMS.drunk) moves.push("north");
        if (!cell.north.explored) unexplored.push("north");
    }
    if (cell.east) {
        if (cell.east.value > bestvalue) {
            bestvalue = cell.east.value;
            bestmove = ["east"];
        }
        else if (cell.east.value === bestvalue) bestmove.push("east");
        if (this.lastX !== this.x + 1 || !PARAMS.drunk) moves.push("east");
        if (!cell.east.explored) unexplored.push("east");
    }
    if (cell.south) {
        if (cell.south.value > bestvalue) {
            bestvalue = cell.south.value;
            bestmove = ["south"];
        }
        else if (cell.south.value === bestvalue) bestmove.push("south");
        if (!cell.south.explored) unexplored.push("south");
        if (this.lastY !== this.y + 1 || !PARAMS.drunk) moves.push("south");
    }
    if (cell.west) {
        if (cell.west.value > bestvalue) {
            bestvalue = cell.west.value;
            bestmove = ["west"];
        }
        else if (cell.west.value === bestvalue) bestmove.push("west");
        if (!cell.west.explored) unexplored.push("west");
        if (this.lastX !== this.x - 1 || !PARAMS.drunk) moves.push("west");
    }

    var move;
    if (PARAMS.explorer && unexplored.length > 0) {
        move = unexplored[randomInt(unexplored.length)];
    } else if (Math.random() < this.epsilon) {
        move = moves[randomInt(moves.length)];
    } else {
        if (PARAMS.q) move = bestQmove[randomInt(bestQmove.length)];
        else move = bestmove[randomInt(bestmove.length)];
    }

    this.lastX = this.x;
    this.lastY = this.y;

    if (!move) { // a drunken sailor in a dead end has to turn back
        if (cell.north) move = "north";
        if (cell.south) move = "south";
        if (cell.east) move = "east";
        if (cell.west) move = "west";
    }

    this.move(move);
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
    this.episodeReward += newCell.utility;
    this.episodeSteps++;
    this.x = newCell.x;
    this.y = newCell.y;
};

// Q(s,a) moves toward r(s) + gamma * max_a' Q(s',a'), the same backup value iteration makes,
// so with enough exploration max_a Q(s,a) settles on the cell's value. The learning rate
// halves, thirds, ... as the action is tried in steps of 100, which lets icy moves average out.
Agent.prototype.updateQ = function (cell, action, newCell) {
    var max = newCell.moveNorth.q;
    if (newCell.moveEast.q > max) max = newCell.moveEast.q;
    if (newCell.moveSouth.q > max) max = newCell.moveSouth.q;
    if (newCell.moveWest.q > max) max = newCell.moveWest.q;
    action.q += 1 / Math.ceil(action.n / 100) * (cell.utility + PARAMS.gamma * max - action.q);
};

Agent.prototype.draw = function (ctx) {
    var length = 800 / this.maze.dim;
    ctx.drawImage(ASSET_MANAGER.getAsset("robo1.png"), this.x * length + 0.22 * length, this.y * length + 0.125 * length, length * 0.54, length * 0.75);
};
