function randomInt(n) {
    return Math.floor(Math.random() * n);
}

function newFourByThree(gameEngine) {
    var maze = new Maze(gameEngine, 0);
    gameEngine.entities = [];
    gameEngine.addEntity(maze);

    var allUpdate = document.getElementById("all_update");
    var valFunc = document.getElementById("value_function");
    var reset = document.getElementById("reset");

    allUpdate.onclick = function () {
        maze.updateValues();
    };

    valFunc.onclick = function () {
        maze.calculateValueFunction();
    };

    reset.onclick = function () {
        maze.resetValues();
    }

};

function newMaze(gameEngine) {
    var maze = new Maze(gameEngine, 1);
    gameEngine.entities = [];
    gameEngine.addEntity(maze);
    //newAgent(gameEngine);

    var allUpdate = document.getElementById("all_update");
    var valFunc = document.getElementById("value_function");
    var reset = document.getElementById("reset");

    allUpdate.onclick = function () {
        maze.updateValues();
    };

    valFunc.onclick = function () {
        maze.calculateValueFunction();
    };

    reset.onclick = function () {
        maze.resetValues();
    }

};

function newBridge(gameEngine) {
    var maze = new Maze(gameEngine, 2);
    gameEngine.entities = [];
    gameEngine.addEntity(maze);
    //newAgent(gameEngine);

    var allUpdate = document.getElementById("all_update");
    var valFunc = document.getElementById("value_function");
    var reset = document.getElementById("reset");

    allUpdate.onclick = function () {
        maze.updateValues();
    };

    valFunc.onclick = function () {
        maze.calculateValueFunction();
    };

    reset.onclick = function () {
        maze.resetValues();
    }

};

function newAgent(gameEngine) {
    var agent = new Agent(gameEngine, gameEngine.entities[0]);
    gameEngine.entities[0].resetValues();
    gameEngine.entities[0].resetExplored();
    if (gameEngine.entities[1]) gameEngine.entities[1].removeFromWorld = true;
    gameEngine.addEntity(agent);
};


var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("robo1.png");
ASSET_MANAGER.queueDownload("pit.png");
ASSET_MANAGER.queueDownload("Pot_Gold.png");
ASSET_MANAGER.queueDownload("arrow.png");

ASSET_MANAGER.downloadAll(function () {
    ASSET_MANAGER.rotateArrow();

    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();
    gameEngine.init(ctx);
    gameEngine.start();
    newFourByThree(gameEngine);

    var new4 = document.getElementById("new_43");
    var newB = document.getElementById("new_bridge");
    var newM = document.getElementById("new_maze");
    var newA = document.getElementById("new_agent");
    var del = document.getElementById("delete");

    new4.onclick = function () {
        newFourByThree(gameEngine);
    };

    newB.onclick = function () {
        newBridge(gameEngine);
    };

    newM.onclick = function () {
        newMaze(gameEngine);
    };

    newA.onclick = function () {
        newAgent(gameEngine);
    };

    del.onclick = function () {
        gameEngine.entities[0].resetValues();
        gameEngine.entities[0].resetExplored();
        if (gameEngine.entities[1]) gameEngine.entities[1].removeFromWorld = true;
    }
});
