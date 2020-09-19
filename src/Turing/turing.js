module.exports = class Turing {
    static REGEX = "^[^A-Z]{0,1}[A-Z]{0,1}$"

    constructor() {
        this.machine = {};
        this.vocabulary = [];
    }

    AddAutomata(id, edges, final = false) {
        console.log(edges)
        // for (let edge of edges) {
        //     for (let c of edge.data) {
        //         if (this.vocabulary.indexOf(c) == -1) this.vocabulary.push(c);
        //     }
        // }
        this.machine[id] = { edges, final };
    }
    
    _Djikstra(initial) {
        let distances = {};
        let prev = {};
        let pq = [];

        distances[initial] = 0;
        pq.push({ node: initial, weight: 0 });
        pq.sort((a, b) => {
            if (a.weight < b.weight) return -1;
            if (a.weight > b.weight) return 1;
            return 0;
        })

        for (let a in this.machine) {
            if (a != initial) distances[a] = Infinity;
            prev[a] = null;
        }

        while (pq.length) {
            let minNode = pq.shift();
            let currNode = minNode.node;
            for (let e of this.machine[currNode].edges) {
                let alt = distances[currNode] + 1;
                if (alt < distances[e.target]) {
                    distances[e.target] = alt;
                    prev[e.target] = currNode;
                    pq.push({ node: e.target, weight: distances[e.target] });
                    pq.sort((a, b) => {
                        if (a.weight < b.weight) return -1;
                        if (a.weight > b.weight) return 1;
                        return 0;
                    })
                }
            }
        }

        return distances;
    }

    RemoveUnreachableNodes(initial) {
        let distances = this._Djikstra(initial);
        for (let d in distances) {
            if (distances[d] == Infinity) {
                let keys = Object.keys(this.machine)
                for (let a of keys) {
                    let edges = this.machine[a].edges
                    for (let e = 0; e < edges.length; e++) {
                        if (edges[e].target == d) {
                            edges.splice(e, 1);
                            e--;
                        }
                    }
                }

                delete this.machine[d];
            }
        }
    }

    RunTest(initial, str) {
        let queue = [];

        console.log(this.machine)

        queue.push({ automata: initial, index: 0, path: [{ node: initial, index: 0 }] });
        while (queue.length > 0) {
            let current = queue.pop();
            console.log(current);
            let currentAutomata = this.machine[current.automata];
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
                        if (currentIndex + 1 == str.length && this.machine[edge.target].final) return [...current.path, { node: edge.target, index: currentIndex }].map(elem => elem.node);
                        queue.push({ automata: edge.target, index: currentIndex + 1, path: [...current.path, { node: edge.target, index: currentIndex + 1 }] });
                    } else if (c == 'λ' || c == '') {
                        if (currentIndex == str.length && this.machine[edge.target].final) return [...current.path, { node: edge.target, index: currentIndex }].map(elem => elem.node);
                        queue.push({ automata: edge.target, index: currentIndex, path: [...current.path, { node: edge.target, index: currentIndex }] });
                    }
                }
            }
        }

        return false;
    }
}