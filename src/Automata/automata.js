module.exports = class Glud {
    static REGEX = "^[^A-Z]{0,1}[A-Z]{0,1}$"

    constructor() {
        this.automatas = {};
        this.vocabulary = [];
    }

    AddAutomata(id, edges, final = false) {
        for (let edge of edges) {
            edge.data.sort((a, b) => {
                if (a == 'λ' || a == '') return -1;
                if (b == 'λ' || b == '') return 1;
                return 0;
            })

            for (let c of edge.data) {
                if (this.vocabulary.indexOf(c) == -1) this.vocabulary.push(c);
            }
        }
        this.automatas[id] = { edges, final };
    }

    ArraysEqual(a, b) {
        if (a === b) return true;
        if (a == null || b == null) return false;
        if (a.length != b.length) return false;

        // If you don't care about the order of the elements inside
        // the array, you should sort both arrays here.
        // Please note that calling sort on an array will modify that array.
        // you might want to clone your array first.

        for (var i = 0; i < a.length; ++i) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    }

    RemoveVoidMoves(initial) {
        if (!this.automatas) throw "Need an automata first!";

        let visitedNodes = new Array(this.automatas.length).fill(false);
        let stack = [];
        let queue = [];

        let keys = Object.keys(this.automatas);
        let size = keys.length;
        for (let i = 0; i < size; i++) {
            if (visitedNodes[i]) continue;
            queue.push({ target: keys[i], stack: [keys[i]] });
            while (queue.length) {
                let current = queue.pop();
                stack = current.stack;
                for (let i = 0; i < this.automatas[current.target].edges.length; i++) {
                    let e = this.automatas[current.target].edges[i];
                    if (e.data.indexOf('λ') != -1) {
                        while (e.data.indexOf('λ') != -1) {
                            e.data.splice(e.data.indexOf('λ'), 1);
                            e.label = e.label.replace('λ', '');
                        }
                        
                        if (e.data.length == 0) {
                            this.automatas[current.target].edges.splice(this.automatas[current.target].edges.indexOf(e), 1);
                            i--;
                        }

                        if (this.automatas[e.target].final) {
                            for (let source of stack) {
                                this.automatas[source].final = true;
                            }
                        }

                        for (let adjEdge of this.automatas[e.target].edges) {
                            for (let source of stack) {
                                if (adjEdge.source != source) {
                                    let edge = { source, target: adjEdge.target, label: adjEdge.label, data: adjEdge.data };
                                    if (edge.data.indexOf('λ') == -1)
                                        this.automatas[source].edges.push(edge)
                                    else if (edge.data.length > 1) {
                                        edge.label = edge.label.replace('λ', '');
                                        edge.data.splice(edge.data.indexOf('λ'), 1);
                                        this.automatas[source].edges.push(edge)
                                    }
                                }
                            }
                        }
                        if (!visitedNodes[keys.indexOf(e.target)]) {
                            queue.push({ target: e.target, stack: [...stack, e.target] });
                            visitedNodes[keys.indexOf(e.target)] = true;
                        }
                    }
                }
            }
            stack = [];
            visitedNodes[i] = true;
        }

        console.log(this.automatas);
    }

    ConvertToAFD(initial) {
        if (!this.automatas) throw "Need an automata first!";

        this.RemoveVoidMoves();
    
        initial = parseInt(initial) + 1;

        //Creating subsets
        let subsets = [[]];
        let level = 0;
        let levelIndex = 1;
        let lastLevelIndex = 0;
        let keys = Object.keys(this.automatas);
        let size = keys.length;
        for (let i = 0; i < size; i++) {
            let data = { subset: [keys[i]], entries: {} };
            if (this.automatas[keys[i]].final) data.final = this.automatas[keys[i]].final;
            for (let c of this.vocabulary) {
                data.entries[c] = [];
                for (let e of this.automatas[keys[i]].edges) {
                    if (c == e.label) {
                        data.entries[c].push(e.target);
                    }
                }
            }
            subsets.push(data);
        }

        lastLevelIndex = levelIndex;
        levelIndex = levelIndex + size;
        level = 1;

        while (levelIndex < Math.pow(2, size)) {
            for (let j = lastLevelIndex; j < levelIndex; j++) {
                for (let i = j - lastLevelIndex + level + 1; i <= size; i++) {
                    let data = { subset: [...subsets[j].subset, keys[i - 1]], entries: {} };

                    if (subsets[j].final) data.final = subsets[j].final;
                    if (subsets[i].final) data.final = subsets[i].final;
                    for (let c of this.vocabulary) {
                        data.entries[c] = [...subsets[j].entries[c]];
                        for (let e of this.automatas[keys[i - 1]].edges) {
                            if (c == e.label && data.entries[c].indexOf(e.target) != -1) {
                                data.entries[c].push(e.target);
                            }
                        }
                    }
                    subsets.push(data);
                }
            }
            lastLevelIndex = levelIndex;
            levelIndex += size - level;
            ++level;
            if (level >= size) break;
        }

        for (let i = 0; i < subsets.length; i++) {
            for (let c of this.vocabulary) {
                if (subsets[i].length != 0 && subsets[i].entries[c].length == 0) subsets[i].entries[c] = 0;
                for (let j = 0; j < subsets.length; j++) {
                    if (subsets[i].length == 0) continue;
                    if (this.ArraysEqual(subsets[i].entries[c], subsets[j].subset)) {
                        subsets[i].entries[c] = j;
                        continue;
                    }
                }
            }
        }

        for (let i = 0; i < subsets.length; i++) {
            subsets[i].subset = i;
        }

        let afd = {};
        let queue = [initial];

        let visited = new Array(subsets.length).fill(false);

        while (queue.length) {
            let current = queue.shift();
            visited[current] = true;
            let data = { edges: [] };
            console.log(subsets[current], current, subsets);
            if (subsets[current].final) data.final = subsets[current].final;
            if (current == initial) data.initial = true;

            for (let e in subsets[current].entries) {
                if (subsets[current].entries[e] != 0 && !visited[subsets[current].entries[e]]) {
                    queue.push(subsets[current].entries[e]);
                    data.edges.push({ source: current - 1, target: subsets[current].entries[e] - 1, id: `${current - 1}_${subsets[current].entries[e] - 1}`, label: e, data: [e] });
                }
            }

            afd[current - 1] = data;
        }

        console.log(afd);
    }

    RunTest(initial, str) {
        let queue = [];

        queue.push({ automata: initial, index: 0, path: [{ node: initial, index: 0 }] });
        while (queue.length > 0) {
            let current = queue.pop();
            console.log(current);
            let currentAutomata = this.automatas[current.automata];
            let currentIndex = current.index;
            let nextEdges = currentAutomata.edges;

            if (current.path.length > 2 && current.path[current.path.length - 2].index == currentIndex) {
                let circular = false;
                for (let i = current.path.length - 2; i >= 0 && current.path[i].index == currentIndex; i--) {
                    if (current.path[i].node == current.automata) {
                        circular = true;
                        break;
                    }
                }
                if (circular) continue;
            }
            //if(current.path.length > 50) continue;

            for (let edge of nextEdges) {
                for (let c of edge.data) {
                    if (str[currentIndex] == c) {
                        if (currentIndex + 1 == str.length && this.automatas[edge.target].final) return [...current.path, { node: edge.target, index: currentIndex }].map(elem => elem.node);
                        queue.push({ automata: edge.target, index: currentIndex + 1, path: [...current.path, { node: edge.target, index: currentIndex + 1 }] });
                    } else if (c == 'λ' || c == '') {
                        if (currentIndex == str.length && this.automatas[edge.target].final) return [...current.path, { node: edge.target, index: currentIndex }].map(elem => elem.node);
                        queue.push({ automata: edge.target, index: currentIndex, path: [...current.path, { node: edge.target, index: currentIndex }] });
                    }
                }
            }
        }

        return false;
    }
}