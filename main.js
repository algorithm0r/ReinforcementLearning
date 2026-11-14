function randomInt(n) {
    return Math.floor(Math.random() * n);
}

// The world (entity 0) and the agent (entity 1). ui.js builds the page around them.
var RL = { game: null, worldType: 0 };

// type: 0 = the 4x3 world, 1 = a maze, 2 = the ice bridge; no type rebuilds the current kind
function newWorld(type) {
    if (type !== undefined) RL.worldType = type;
    RL.game.entities = [new Maze(RL.game, RL.worldType)];
    RL.game.ctx.canvas.height = RL.worldType === 0 ? 600 : 800; // the 4x3 world has no fourth row
    newAgent();
}

function newAgent() {
    var maze = RL.game.entities[0];
    maze.resetValues();
    maze.resetExplored();
    var agent = new Agent(RL.game, maze);
    RL.game.entities = [maze, agent];
    if (window.onAgent) onAgent(agent);
}

function removeAgent() {
    var maze = RL.game.entities[0];
    maze.resetValues();
    maze.resetExplored();
    RL.game.entities = [maze];
    if (window.onAgent) onAgent(null);
}

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("robo1.png");
ASSET_MANAGER.queueDownload("pit.png");
ASSET_MANAGER.queueDownload("Pot_Gold.png");
ASSET_MANAGER.queueDownload("arrow.png");

ASSET_MANAGER.downloadAll(function () {
    ASSET_MANAGER.rotateArrow();

    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    RL.game = new GameEngine();
    RL.game.init(ctx);
    RL.game.start();
    newWorld(0);
});
