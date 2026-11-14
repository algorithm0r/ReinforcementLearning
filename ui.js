// The page around the sim: parameters, the control groups, the status line and the charts.
// maze.js and agent.js read PARAMS; nothing in them touches the page.

var PARAMS = {
    // world: changing these builds a new world of the current kind
    dim: 10, reward: 10000, walls_deleted: 0, pits: 0, icy: false, slippy: 0.1,
    // learning: live
    stepsPerSecond: 10, gamma: 0.9, q: false, explorer: false, drunk: false, update_explored: false,
    epsilonDecay: 0.9, decayEvery: 100, paused: false,
    // display: live
    show_solution: false, show_reward: false, fog: true,
};

var $ = function (id) { return document.getElementById(id); };
function maze() { return RL.game && RL.game.entities[0]; }

var CONTROL_GROUPS = [
    { title: 'World', buttons: [
        { label: '4×3 world', onClick: function () { newWorld(0); } },
        { label: 'Maze', onClick: function () { newWorld(1); } },
        { label: 'Ice bridge', onClick: function () { newWorld(2); } },
    ], schema: [
        { key: 'dim', label: 'Maze size', min: 4, max: 20, step: 1, resets: true },
        { key: 'walls_deleted', label: 'Extra openings (maze)', min: 0, max: 60, step: 1, resets: true },
        { key: 'pits', label: 'Pits (maze)', min: 0, max: 20, step: 1, resets: true },
        { key: 'reward', label: 'Gold reward (maze, bridge)', options: [100, 1000, 10000, 100000], resets: true },
        { key: 'icy', label: 'Icy floor', resets: true },
        { key: 'slippy', label: 'Slip chance, each side', min: 0, max: 0.3, step: 0.05, resets: true },
    ] },
    { title: 'Agent', buttons: [
        { label: 'Pause', primary: true, onClick: function () { PARAMS.paused = !PARAMS.paused; this.textContent = PARAMS.paused ? 'Run' : 'Pause'; } },
        { label: 'New agent', onClick: function () { newAgent(); } },
        { label: 'Remove agent', onClick: function () { removeAgent(); } },
    ], schema: [
        { key: 'stepsPerSecond', label: 'Speed', options: [1, 2, 5, 10, 20, 50, 100, 500, 2000].map(function (v) { return { value: v, label: v + ' steps/s' }; }) },
        { key: 'gamma', label: 'Discount (γ)', min: 0, max: 0.99, step: 0.01 },
        { key: 'epsilonDecay', label: 'Epsilon decay factor', min: 0.5, max: 1, step: 0.01 },
        { key: 'decayEvery', label: 'Decay every (steps)', min: 10, max: 1000, step: 10 },
        { key: 'q', label: 'Q-learning' },
        { key: 'explorer', label: 'Explorer: unexplored cells first' },
        { key: 'drunk', label: 'Drunken sailor: never turn straight back' },
        { key: 'update_explored', label: 'Back up every explored cell each step' },
    ] },
    { title: 'Values', buttons: [
        { label: 'One sweep', onClick: function () { maze().updateValues(); } },
        { label: 'Solve values', onClick: function () { maze().calculateValueFunction(); } },
        { label: 'Reset values', onClick: function () { maze().resetValues(); } },
    ], schema: [
        { key: 'show_solution', label: 'Show best move' },
        { key: 'show_reward', label: 'Show rewards' },
        { key: 'fog', label: 'Fog of war' },
    ] },
];

function buildControls() {
    var host = $('controls');
    CONTROL_GROUPS.forEach(function (g) {
        var d = document.createElement('details');
        d.className = 'cb-disclosure group';
        d.open = true;
        d.innerHTML = '<summary>' + g.title + '</summary><div class="body"></div>';
        host.appendChild(d);
        CB.sim.controls(d.querySelector('.body'), g.schema, PARAMS, {
            onReset: function () { newWorld(); },
            buttons: g.buttons,
        });
    });
}

// A new agent brings fresh episode records; the charts follow its arrays as they grow.
function onAgent(agent) {
    var h = agent ? agent.history : { length: [], reward: [], epsilon: [] };
    $('length').data = { dx: 1, series: [{ label: 'steps', values: h.length, color: 'var(--cb-series-1)' }] };
    $('reward').data = { dx: 1, series: [{ label: 'reward', values: h.reward, color: 'var(--cb-series-4)' }] };
    $('epsilon').data = { dx: 1, series: [{ label: 'epsilon', values: h.epsilon, color: 'var(--cb-series-3)' }] };
}

(function status() {
    var a = window.RL && RL.game && RL.game.entities[1]; // main.js loads after this file
    $('status').textContent = a
        ? 'step ' + a.steps + '  ·  episode ' + (a.history.length.length + 1) + '  ·  epsilon ' + a.epsilon.toFixed(2) +
          '  ·  total reward ' + Math.round(a.reward)
        : 'no agent';
    requestAnimationFrame(status);
})();

buildControls();
$('picker').appendChild(CB.theme.picker());
