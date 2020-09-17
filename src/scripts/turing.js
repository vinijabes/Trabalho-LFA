const cytoscape = require('cytoscape');
const edgehandles = require('cytoscape-edgehandles');
const cxtmenu = require('cytoscape-cxtmenu');
const prompt = require('electron-prompt');
const ipcRenderer = require('electron').ipcRenderer;
const BrowserWindow = require('electron').remote.BrowserWindow;
const dialog = require('electron').remote.dialog;
var fs = require('fs');
const { parseString } = require('xml2js');

const Automata = require('../Automata').Automata;

const modal = document.querySelector('#multipleAutomata');
const inputModal = document.querySelector('#modal1')
const multipleAutomataTest = document.querySelector('#multipleAutomataTest');
const AddAutomataEntry = document.querySelector('#addAutomataEntry');
const entryProto = document.querySelector('#prototype_automata');
const entryList = modal.querySelector('.inputs');

cytoscape.use(edgehandles);
cytoscape.use(cxtmenu);

const options = {
    ADD_NODE: 0,
    ADD_EDGE: 1,
    REMOVE: 2,
    MOVE: 3
}

function requestInput() {
    let instance = M.Modal.getInstance(inputModal)
    instance.open();
    return new Promise((resolve, reject) => {
        let acceptButton = inputModal.querySelector('#accept');
        let rejectButton = inputModal.querySelector('#reject');
        acceptButton.onclick = () => {
            let inputs = inputModal.querySelectorAll("#taperules .taperule")
            let converted = []

            for(let i = 0; i < inputs.length; ++i){
                let read = inputs[i].querySelector("#read").value;
                let write = inputs[i].querySelector("#write").value;
                let move = inputs[i].querySelector("#move").value;

                converted.push({read, write, move})
            }

            resolve(converted);
            instance.close();
        }
        rejectButton.onclick = () => {
            reject();
            instance.close()
        }
    });
}

var cy = cytoscape({
    container: document.getElementById('cy'), // container to render in
    layout: {
        name: 'concentric',
        concentric: function (n) { return n.id() === 'j' ? 200 : 0; },
        levelWidth: function (nodes) { return 100; },
        minNodeSpacing: 100
    },

    style: [
        {
            selector: 'node[name]',
            style: {
                'content': 'data(name)'
            }
        },

        {
            selector: 'node',
            style: {
                'background-color': '#888',
                'label': 'data(id)'
            }
        },

        {
            selector: 'edge',
            style: {
                'text-wrap': 'wrap',
                'curve-style': 'bezier',
                'target-arrow-shape': 'triangle',
                'control-point-weight': '0.7',
                'label': 'data(label)'
            }
        },

        // some style for the extension

        {
            selector: '.eh-handle',
            style: {
                'background-color': 'red',
                'width': 12,
                'height': 12,
                'shape': 'ellipse',
                'overlay-opacity': 0,
                'border-width': 12, // makes the handle easier to hit
                'border-opacity': 0,
                "label": ""
            }
        },

        {
            selector: '.eh-hover',
            style: {
                'background-color': 'red'
            }
        },

        {
            selector: '.eh-source',
            style: {
                'border-width': 2,
                'border-color': 'red'
            }
        },

        {
            selector: '.eh-target',
            style: {
                'border-width': 2,
                'border-color': 'red'
            }
        },

        {
            selector: '.eh-preview, .eh-ghost-edge',
            style: {
                'background-color': 'red',
                'line-color': 'red',
                'target-arrow-color': 'red',
                'source-arrow-color': 'red'
            }
        },

        {
            selector: '.eh-ghost-edge.eh-preview-active',
            style: {
                'opacity': 0
            }
        },

        {
            selector: ".multiline-auto",
            style: {
                "text-wrap": "wrap",
                "text-max-width": 1
            }
        },

        {
            selector: ".autorotate",
            style: {
                "edge-text-rotation": "autorotate",
                "text-align": "left"
            }
        },

        {
            selector: ".bottom-center",
            style: {
                "text-valign": "top",
                "text-halign": "left"
            }
        },

        {
            selector: ".initial-automata",
            style: {
                "border-width": "2px",
            }
        },

        {
            selector: ".final-automata",
            style: {
                "background-color": "#A35500",
            }
        },

        {
            selector: ".active-automata",
            style: {
                "border-width": "2px",
                "border-color": "red",
            }
        },

        {
            selector: ".active-edge",
            style: {
                "line-color": "red",
                "target-arrow-color": "red"
            }
        },
    ]
});

let defaultsEdges = {
    preview: true, // whether to show added edges preview before releasing selection
    hoverDelay: 150, // time spent hovering over a target node before it is considered selected
    handleNodes: 'node', // selector/filter function for whether edges can be made from a given node
    snap: false, // when enabled, the edge can be drawn by just moving close to a target node
    snapThreshold: 50, // the target node must be less than or equal to this many pixels away from the cursor/finger
    snapFrequency: 15, // the number of times per second (Hz) that snap checks done (lower is less expensive)
    noEdgeEventsInDraw: false, // set events:no to edges during draws, prevents mouseouts on compounds
    disableBrowserGestures: true, // during an edge drawing gesture, disable browser gestures such as two-finger trackpad swipe and pinch-to-zoom
    handlePosition: function (node) {
        return 'middle top'; // sets the position of the handle in the format of "X-AXIS Y-AXIS" such as "left top", "middle top"
    },
    handleInDrawMode: false, // whether to show the handle in draw mode
    edgeType: function (sourceNode, targetNode) {
        // can return 'flat' for flat edges between nodes or 'node' for intermediate node between them
        // returning null/undefined means an edge can't be added between the two nodes
        return 'flat';
    },
    loopAllowed: function (node) {
        // for the specified node, return whether edges from itself to itself are allowed
        return true;
    },
    nodeLoopOffset: -50, // offset for edgeType: 'node' loops
    nodeParams: function (sourceNode, targetNode) {
        // for edges between the specified source and target
        // return element object to be passed to cy.add() for intermediary node
        return {};
    },
    edgeParams: function (sourceNode, targetNode, i) {
        // for edges between the specified source and target
        // return element object to be passed to cy.add() for edge
        // NB: i indicates edge index in case of edgeType: 'node'

        return {
            data: {
                id: `${sourceNode.id()}_${targetNode.id()}`
            },
            classes: 'multiline-auto autorotate'
        };
    },
    ghostEdgeParams: function () {
        // return element object to be passed to cy.add() for the ghost edge
        // (default classes are always added for you)
        return {};
    },
    complete: function (sourceNode, targetNode, addedEles) {
        // fired when edgehandles is done and elements are added)
        requestInput().then((r) => {
            console.log(r);
            if (r == null) {
                cy.remove(addedEles);
            } else {
                let label = ''
                for(let i = 0; i < r.length; ++i){
                    if (r[i].read == '') r[i].read = 'λ';
                    if (r[i].write == '') r[i].write = 'λ';

                    if(i != 0) label += '|'
                    label += r[i].read;
                    label += ';' + r[i].write;
                    label += ';' + r[i].move;
                }

                console.log(label)

                if (addedEles.length > 0) {
                    addedEles.data('label', label);
                    addedEles.data('data', [r]);
                }
                else {
                    let edge = cy.edges(`edge#${sourceNode.id()}_${targetNode.id()}`);
                    let data = edge.data('data');
                    data.push(r);
                    edge.data('label', edge.data('label') + ' ' + label);
                    edge.data('data', data);
                }
            }
        }).catch((err) => {
            console.log(err)
            cy.remove(addedEles);
        })

        // prompt({
        //     tile: 'Nova regra'
        // }).then((r) => {
        //     if (r == null) {
        //         cy.remove(addedEles);
        //     } else {
        //         if (r == '') r = 'λ';
        //         if (addedEles.length > 0) {
        //             addedEles.data('label', r);
        //             addedEles.data('data', [r]);
        //         }
        //         else {
        //             let edge = cy.edges(`edge#${sourceNode.id()}_${targetNode.id()}`);
        //             let data = edge.data('data');
        //             data.push(r);
        //             edge.data('label', data.join(' '));
        //             edge.data('data', data);
        //         }
        //     }
        // })
        //console.log(sourceNode, targetNode, addedEles);
    },
};

let defaultsCtx = {
    menuRadius: 100, // the radius of the circular menu in pixels
    selector: '.automata', // elements matching this Cytoscape.js selector will trigger cxtmenus
    commands: [
        {
            content: 'INICIAL',
            select: function (ele) {
                let initial = ele.data('initial');
                if (!initial) initial = false;

                if (initial)
                    ele.removeClass('initial-automata');
                else
                    ele.addClass('initial-automata');

                ele.data('initial', !initial);
            }
        },

        {
            content: 'FINAL',
            select: function (ele) {
                let final = ele.data('final');
                if (!final) final = false;

                if (final)
                    ele.removeClass('final-automata');
                else
                    ele.addClass('final-automata');

                ele.data('final', !final);
            }
        },
    ], // function( ele ){ return [ /*...*/ ] }, // a function that returns commands or a promise of commands
    fillColor: 'rgba(0, 0, 0, 0.75)', // the background colour of the menu
    activeFillColor: 'rgba(1, 105, 217, 0.75)', // the colour used to indicate the selected command
    activePadding: 20, // additional size in pixels for the active command
    indicatorSize: 24, // the size in pixels of the pointer to the active command
    separatorWidth: 3, // the empty spacing in pixels between successive commands
    spotlightPadding: 4, // extra spacing in pixels between the element and the spotlight
    minSpotlightRadius: 24, // the minimum radius in pixels of the spotlight
    maxSpotlightRadius: 38, // the maximum radius in pixels of the spotlight
    openMenuEvents: 'cxttapstart taphold', // space-separated cytoscape events that will open the menu; only `cxttapstart` and/or `taphold` work here
    itemColor: 'white', // the colour of text in the command's content
    itemTextShadowColor: 'transparent', // the text shadow colour of the command's content
    zIndex: 9999, // the z-index of the ui div
    atMouse: false // draw menu at mouse position
};

const edgeHandles = cy.edgehandles(defaultsEdges);
cy.cxtmenu(defaultsCtx);
cy.userZoomingEnabled(false);

cy.on('click', (e) => {

});

let selectedOption = options.ADD_NODE;
let first = null;
let second = null;
let panning = false;
let nodeId = 0;

function addNode(id, position, initial, final) {
    let classes = ['automata'];
    if (initial) classes.push('initial-automata');
    if (final) classes.push('final-automata');

    cy.add({
        group: 'nodes',
        data: { id, initial, final },
        position: position,
        classes: classes
    });
}

function addEdge(source, target, id, data) {
    cy.add({
        group: 'edges',
        data: { id: id, source, target, data, label: data.join(" ") },
    });
}

for (let option of document.querySelectorAll('#menu a')) {
    option.onclick = function (e) {
        selectedOption = this.dataset.opt;
    }
}

cy.on('mousedown', 'node', function (e) {
    first = this.id();
})

cy.on('mouseup', 'node', function (e) {
    second = this.id();

    if (selectedOption == options.REMOVE && !panning) {
        cy.remove(this);
    }
})

cy.on('mouseup', 'edge', function (e) {
    if (selectedOption == options.REMOVE && !panning) {
        let data = this.data('data');
        if (data.length <= 1) cy.remove(this);
        else {
            data.pop();
            this.data('data', data);
            this.data('label', data.join(' '));
        }
    }
})

cy.on('mousedown', function (e) {
    panning = false;
})

cy.on('mouseup', function (e) {
    if (selectedOption == options.ADD_NODE && !first && !second && !panning) {
        addNode(nodeId++, e.position);
    }

    if (selectedOption == options.ADD_EDGE && first && second) {
        addEdge(first, second, nodeId++)
    }

    first = null;
    second = null;
})

cy.on('mousemove', (e) => {
    if (selectedOption == options.ADD_EDGE && first) cy.nodes().ungrabify();
})

document.onmousemove = (e) => {
    if (Math.abs(e.movementX) + Math.abs(e.movementY) > 10) panning = true;
};

const fita = document.getElementById('fita');
const openButton = document.getElementById('open');
const saveButton = document.getElementById('save');
const initButton = document.getElementById('init');
const nextButton = document.getElementById('next');
const convertButton = document.getElementById('convert');
const convertGrammarButton = document.getElementById('convertGrammar');
const convertRegexButton = document.getElementById('convertRegex');
let automata = new Automata();

fita.value = "";

let result = null;
let current = 0;

function BuildAF(data) {
    cy.elements().remove();

    for (let a in data) {
        addNode(a, null, data[a].initial, data[a].final);
    }

    for (let a in data) {
        for (let e of data[a].edges) {
            addEdge(e.source, e.target, e.id, e.data);
        }
    }

    cy.layout({ name: "circle" }).run();
    cy.fit();
    cy.reset();
}

initButton.onclick = function (e) {
    automata = new Automata();
    let nodes = cy.nodes('.automata');
    let initial = null;
    for (let i = 0; i < nodes.length; i++) {
        let node = nodes[i];
        let edges = cy.edges(`edge[source="${node.id()}"]`);
        edges = Object.values(edges).filter((elem, index) => index < edges.length);
        automata.AddAutomata(node.id(), (edges.map((elem) => elem.data())), node.data('final'));
        if (node.data('initial')) {
            if (initial) throw new Error("Can't have two starting points");
            initial = node.id();
        }
    }

    result = automata.RunTest(initial, fita.value);
    current = 0;
    if (result) {
        cy.nodes(`node#${result[current]}`).addClass('active-automata');
        cy.edges(`edge#${result[current]}_${result[current + 1]}`).addClass('active-edge');
        nextButton.removeAttribute("disabled");
    }
}

nextButton.onclick = function (e) {
    if (!result) return;
    cy.nodes(`node#${result[current]}`).removeClass('active-automata');
    cy.edges(`edge#${result[current]}_${result[current + 1]}`).removeClass('active-edge');
    if (current + 1 < result.length) {
        current++;
        cy.nodes(`node#${result[current]}`).addClass('active-automata');
        cy.edges(`edge#${result[current]}_${result[current + 1]}`).addClass('active-edge');
    } else {
        nextButton.setAttribute("disabled", "disabled");
    }
}

document.addEventListener('DOMContentLoaded', function () {
    var elems = document.querySelectorAll('.modal');
    var instances = M.Modal.init(elems, {dismissible: false});

    var selects = document.querySelectorAll('select');
    var selectInstances = M.FormSelect.init(selects, options);
});

multipleAutomataTest.onclick = () => {
    let entries = modal.querySelectorAll('.automataEntry');

    let nodes = cy.nodes('.automata');
    let initial = null;
    automata = new Automata();

    for (let i = 0; i < nodes.length; i++) {
        let node = nodes[i];
        let edges = cy.edges(`edge[source="${node.id()}"]`);
        edges = Object.values(edges).filter((elem, index) => index < edges.length);
        automata.AddAutomata(node.id(), (edges.map((elem) => elem.data())), node.data('final'));
        if (node.data('initial')) {
            if (initial) throw new Error("Can't have two starting points");
            initial = node.id();
        }
    }

    for (let entry of entries) {
        console.log(entry);
        if (automata.RunTest(initial, entry.querySelector('.fita').value)) {
            entry.querySelector('#resultFita').innerHTML = 'check_circle';
            entry.querySelector('#resultFita').style.color = 'green';
        } else {
            entry.querySelector('#resultFita').innerHTML = 'cancel';
            entry.querySelector('#resultFita').style.color = 'red';
        }
    }
}

AddAutomataEntry.onclick = () => {
    entryList.appendChild(entryProto.clone());
}

entryProto.clone = function () {
    let c = entryProto.cloneNode(true);
    c.style.display = '';
    c.className = 'input-field automataEntry';
    return c;
}

entryList.appendChild(entryProto.clone());

ipcRenderer.on('build', (e, data) => {
    BuildAF(data);
    console.log(data);
})

var opts = {
    title: "Save file",
    defaultPath: "./automato",
    buttonLabel: "Save",

    filters: [
        { name: 'JFlap', extensions: ['jff',] },
        { name: 'All Files', extensions: ['*'] }
    ]
}


openButton.onclick = () => {
    dialog.showOpenDialog(opts, (filename) => {
        console.log(filename);
        fs.readFile(filename[0], "utf8", (err, data) => {
            parseString(data, function (err, result) {
                let states = result.structure.automaton[0].state;
                let edges = result.structure.automaton[0].transition;
                let automata = {};
                for (let state of states) {
                    let s = state.$.id;
                    automata[s] = { edges: [] }
                    if (state.initial) automata[s].initial = true;
                    if (state.final) automata[s].final = true;

                    for (let e of edges) {
                        if (e.from[0] == s) {
                            let newEdge = true;
                            for (let i of automata[s].edges) {
                                if (i.id == `${s}_${e.to[0]}`) {
                                    newEdge = false;
                                    i.label += e.read.join(" ");
                                    i.data = [...i.data, ...e.read];
                                }
                            }
                            if (newEdge)
                                automata[s].edges.push({ source: s, target: e.to[0], id: `${s}_${e.to[0]}`, label: e.read.join(" "), data: e.read });
                        }
                    }
                }
                BuildAF(automata);
            });
        });
    })
}

saveButton.onclick = () => {
    dialog.showSaveDialog(opts, (filename) => {
        if (filename !== undefined && filename != "") {
            automata = new Automata();
            let nodes = cy.nodes('.automata');
            let initial = null;
            for (let i = 0; i < nodes.length; i++) {
                let node = nodes[i];
                let edges = cy.edges(`edge[source="${node.id()}"]`);
                edges = Object.values(edges).filter((elem, index) => index < edges.length);
                automata.AddAutomata(node.id(), (edges.map((elem) => elem.data())), node.data('final'));
                if (node.data('initial')) {
                    if (initial) throw new Error("Can't have two starting points");
                    initial = node.id();
                }
            }
            console.log(automata.automatas);

            let states = [];
            let transitions = [];

            for (let i in automata.automatas) {
                states.push({ id: i, initial: automata.automatas.initial, final: automata.automatas.final });
                for (let e of automata.automatas[i].edges) {
                    console.log(e);
                    for (let d of e.data) {
                        console.log(d);
                        transitions.push({ from: i, to: e.target, read: d });
                    }
                }
            }

            console.log(states, transitions);

            let text = `<?xml version="1.0" encoding="UTF-8" standalone="no"?><!--Created with JFLAP 7.1.-->\n<structure>&#13;\n<type>fa</type>&#13;\n<automaton>&#13;\n`;
            for (let s in states) {
                text += `<state id="${s}" name="${states[s]}">&#13;\n`;
                if (states[s].initial) text += `<initial/>&#13;\n`;
                if (states[s].final) text += `<final/>&#13;\n`;
            }

            for (let t of transitions) {
                text += `<transition>&#13;\n`;
                text += `<from>${t.from}</from>&#13;\n`;
                text += `<to>${t.to}</to>&#13;\n`;
                text += `<read>${t.read}</read>&#13;\n`;
                text += `</transition>&#13;\n`;
            }
            text += `</automaton>&#13;\n</structure>`;

            fs.writeFileSync(filename, text, 'utf-8');
        }
    })
}