module.exports = class Glud {
    static REGEX = "^[^A-Z]{0,1}[A-Z]{0,1}$"

    constructor() {
        this.rules = {};
    }

    AddRule(token, rule) {
        if (token == "") return;
        let lower = 0;
        let upper = 0;
        for (let c of rule) {
            if (c.toUpperCase() == c)++upper;
            if (c.toLowerCase() == c) {
                if (upper) throw new Error("Invalid Glud Rule!");
                ++lower;
            }
        }

        if (upper > 1 || lower > 1 || rule.length > 2) throw new Error("Invalid Glud Rule!");

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

            if (canAdd){
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

            if (currentIndex == -1 || nextToken != nextToken.toUpperCase()) {
                continue;
            }

            for (let rule of this.rules[nextToken]) {
                queue.push({ str: currentStr.replace(nextToken, rule), index: currentIndex });
            }
        }
        return false;
    }
}