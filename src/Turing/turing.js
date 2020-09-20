var cloneDeep = require('lodash.clonedeep');
const Tape = require('./tape'); 
const { read } = require('fs');
class TuringMachine {
    constructor(){
        this.machine = {}
        this.tapes = [];
        this.current = null;
    }

    AddAutomata(id, edges, final = false) {
        this.machine[id] = { edges, final };
    }

    getEdges(){
        
    }

    __initTapes(tapesData, tapesCount){
        for(let i = 0 ; i < tapesCount; i++){
            this.tapes.push(new Tape());
            this.tapes[i].setData(tapesData[i]);
        }
    }

    RunTest(initial, tapesData, tapesCount) {
        this.__initTapes(tapesData, tapesCount);
        let history = [];
        let machineQueue = [];

        let i = 0;
        let j = 0;
        machineQueue.push({current: initial, tapes: cloneDeep(this.tapes), history: []})
        while(machineQueue.length > 0) {
            ++i;

            if(i > 50) return;

            let currentMachine = machineQueue.shift()
            let currentHistory = cloneHistory(currentMachine.history)
            let currentTapes = currentMachine.tapes
            let currentNode = currentMachine.current

            console.log(currentMachine, currentNode)
            console.log(this.machine)
            j = 0;
            while(!this.machine[currentNode].final){
                ++j;
                if(j > 200) break;
                let currentEdges = this.machine[currentNode].edges;
                let activePaths = []
                
                if(isCycle(currentNode, currentTapes, currentHistory)) {
                    console.log("CICLO DETECTADO");
                    break;
                }

                for(let i = 0; i < currentEdges.length; ++i){
                    let canExecute = true;
                    for(let j = 0; j < tapesCount && canExecute ; ++j) {
                        if(!currentTapes[j].canExecute(currentEdges[i].action[j].read)){
                            canExecute = false;
                        }
                    }

                    if(canExecute) {
                        activePaths.push(currentEdges[i])
                    }
                }

                if(activePaths.length == 0) break;

                for(let i = 1; i < activePaths.length; ++i){
                    console.log("BIFURCAÇÃO")
                    let tapes = cloneDeep(currentTapes)

                    let history = cloneDeep(currentHistory)
                    history.push({tapes: cloneDeep(tapes), current: currentNode})
                    
                    for(let j = 0; j < tapesCount; ++j){
                        let action = activePaths[i].action[j];
                        tapes[j].execute(action.read, action.write, action.move)
                    }

                    console.log(currentHistory)
                    console.log(history)
                    machineQueue.push({current: activePaths[i].to, tapes: cloneDeep(tapes), history})
                }

                currentHistory.push({tapes: cloneDeep(currentTapes), current: currentNode})

                for(let j = 0; j < tapesCount; ++j){
                    let action = activePaths[0].action[j];
                    currentTapes[j].execute(action.read, action.write, action.move)
                }

                currentNode = activePaths[0].to;
            }

            if(this.machine[currentNode].final) {
                currentHistory.push({tapes: cloneDeep(currentTapes), current: currentNode})
                return currentHistory;
            }
        }

        console.log("FALSE")
        return false;
    }
}

function cloneHistory(history) {
    return cloneDeep(history)
}

function lambdaTrim(x) {
    return x.replace(/^λ+|λ+$/gm,'');
}

function isCycle(currentNode, tapes, history) {
    for(let i = 0; i < history.length; ++i)
    {
        let equals = true;
        for(let j = 0; j < tapes.length; ++j){
            if(lambdaTrim(tapes[j].data.toString()) != lambdaTrim(history[i].tapes[j].data.toString()) ||
                tapes[j].position != history[i].tapes[j].position||
                currentNode != history[i].current
            ){
                equals = false;
                break;
            }
        }

        if(equals) return true;
    }

    return false;
}

module.exports = TuringMachine;