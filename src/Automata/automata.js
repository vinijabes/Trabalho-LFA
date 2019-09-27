module.exports = class Glud {
    static REGEX = "^[^A-Z]{0,1}[A-Z]{0,1}$"

    constructor() {
        this.automatas = {};
    }

    AddAutomata(id, edges, final = false) {
        for (let edge of edges) {
            edge.data.sort((a, b) => {
                if (a == 'λ' || a == '') return -1;
                if (b == 'λ' || b == '') return 1;
                return 0;
            })
        }

        this.automatas[id] = { edges, final };
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