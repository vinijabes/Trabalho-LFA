module.exports = class Glud {
    static REGEX = "^[^A-Z]{0,1}[A-Z]{0,1}$"

    constructor() {
        this.rules = {};
    }

    AddRule(token, rule) {
        if (token == "") return;
        if (rule.length > 2) throw new Error("Invalid Glud Rule!");
        if (rule.length == 2) {
            if (/[A-Z]/.test(rule[0])) throw new Error("Invalid Glud Rule!");
            if (/[^A-Z]/.test(rule[1])) throw new Error("Invalid Glud Rule!");
        }


        if (!this.rules[token]) this.rules[token] = [rule];
        else this.rules[token].push(rule);
    }

    Run(initial, str) {
        for (let rule of this.rules[initial]) {
            if (this.__Match(rule, str)) return true;
        }
        return false;
    }

    /**
     * 
     * @param {*} rule 
     * @param {string} str 
     */
    __Match(str, initial) {
        if (str.length > initial.length + 1) return false;
        let nextRule = str[str.length - 1];
        if (nextRule != nextRule.toUpperCase()) return str == initial;
        if (!this.rules[nextRule]) return false;
        for (let r of this.rules[nextRule]) {
            if (this.__Match(str.replace(nextRule, r), initial)) return true;
        }
    }

    RunTest(initial, str) {
        console.log(this.rules);
        let queue = [];
        let map = {};

        console.log(queue);

        for (let baseString of this.rules[initial]) {
            let canAdd = true;
            let charIndex = 0;

            for (let i = 0; i < baseString.length && baseString[i].toLowerCase() == baseString[i]; i++) {
                if (baseString[i] == str[i])++charIndex;
                else {
                    charIndex = 0;
                    canAdd = false;
                    break;
                }
            }

            if (canAdd) {
                queue.push({ str: baseString, index: charIndex });
            }
        }

        while (queue.length > 0) {
            let current = queue.pop();
            let currentStr = current.str;
            let currentIndex = current.index;
            let nextToken = currentStr[currentStr.length - 1];

            if (currentIndex == str.length && currentIndex == currentStr.length) {
                return true;
            }

            if (map[currentStr]) continue;
            else map[currentStr] = true;

            for (let i = currentIndex; i < currentStr.length && currentStr[i].toLowerCase() == currentStr[i]; i++) {
                if (currentStr[i] == str[i])++currentIndex;
                else {
                    currentIndex = -1;
                    break;
                }
                if (currentIndex == str.length && currentIndex == currentStr.length) {
                    return true;
                }
            }

            if (currentIndex == -1 || nextToken != nextToken.toUpperCase() || Number.isInteger(nextToken)) {
                continue;
            }

            for (let rule of this.rules[nextToken]) {
                queue.push({ str: currentStr.replace(nextToken, rule), index: currentIndex });
            }
        }
        return false;
    }

    ConvertToAF(initial) {
        let visited = new Array(this.rules.length).fill(false);
        let queue = [initial];

        let states = {};
        for (let r in this.rules) {
            states[r] = { edges: [] };
        }
        states['final'] = { final: true, edges: [] };

        while (queue.length) {
            let current = queue.shift();
            if (visited[current]) continue;
            visited[current] = true;

            if (current == initial) {
                states[current].initial = true;
            }

            for (let rule of this.rules[current]) {
                let data = 'λ';
                let target = null;
                if (rule.length == 2) {
                    data = rule[0];
                    target = rule[1];
                } else if (rule.length == 1) {
                    if (!Number.isInteger(rule[0]) && rule[0] == rule[0].toUpperCase()) {
                        target = rule[0];
                    } else {
                        data = rule[0];
                        target = 'final';
                    }
                } else {
                    target = 'final';
                }

                console.log(rule, data, target);

                states[current].edges.push({ source: current, target, data: [data] });

                if (target != 'final') {
                    queue.push(target);
                }
            }
        }

        let keys = Object.keys(states);
        let size = keys.length;
        let finalStates = {};
        for (let i = 0; i < size; i++) {
            finalStates[i] = states[keys[i]];
            for (let e of finalStates[i].edges) {
                e.source = i;
                e.target = keys.indexOf(e.target);
            }

            for (let x = 0; x < finalStates[i].edges.length; x++) {
                for (let j = x + 1; j < finalStates[i].edges.length; j++) {
                    if (finalStates[i].edges[x].target == finalStates[i].edges[j].target) {                        
                        finalStates[i].edges[x].data = [...finalStates[i].edges[x].data, ...finalStates[i].edges[j].data];
                        finalStates[i].edges.splice(j, 1);
                        --j;
                    }
                }
            }
        }

        console.log(states);
        return finalStates;
    }
}