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
                    history.push({tapes, current: currentNode})
                    
                    for(let j = 0; j < tapesCount; ++j){
                        let action = activePaths[i].action[j];
                        tapes[j].execute(action.read, action.write, action.move)
                    }


                    machineQueue.push({current: activePaths[i].to, tapes, history})
                }

                currentHistory.push({tapes: cloneDeep(currentTapes), current: currentNode})

                for(let j = 0; j < tapesCount; ++j){
                    let action = activePaths[0].action[j];
                    currentTapes[j].execute(action.read, action.write, action.move)
                }

                console.log({tapes: cloneDeep(currentTapes), current: currentNode})

                currentNode = activePaths[0].to;
            }

            if(this.machine[currentNode].final) {
                console.log(currentHistory)
                console.log("TRUE")
                return true;
            }
        }

        console.log("FALSE")
        return false;
    }

    runTest(initial, tapesData, tapesCount){
        this.__initTapes(tapesData, tapesCount);
        let history = [];
        let notVisited = [];
        this.current = initial;

        let i = 0
        addHistory(history, this); //salva estado atual da máquina
        while(history.length > 0){
            i++;
            if(i > 10) {
                return;
            }
            console.log("quant:",history.length);
            let currentMT = rollback(history); //recupera último estado da máquina
            //console.log(currentMT);
            //console.log("ROLLBACK");
            //console.log(currentMT);
            notVisited = getEdges(currentMT); //lista todos os edges de um nó
            while(notVisited.length > 0){ //percorre pelas edges de um nó
                i++;
                if(i > 100) {
                    console.log(notVisited)
                    return;
                }
                //console.log(notVisited)
                let readErr = false;
                let edge = notVisited.shift();
                if(edge.from != currentMT.current) currentMT = rollback(history);
                console.log("current", currentMT.current)
                //console.log("edge", edge);
                for(let i = 0; i < edge.action.length; i++){ //percorre pelo numero de fitas
                    let action = edge.action;
                    let currentTape = currentMT.tapes[i];
                    if(!currentTape.execute(action[i].read, action[i].write, action[i].move)){
                        readErr = true;
                        console.log("ANTES ROLLBACK");
                        console.log(currentMT);
                        //currentMT = rollback(history);
                        console.log("DEPOIS ROLLBACK");
                        console.log(currentMT);
                        console.log("erro")
                        break;
                    }
                    else {
                        currentMT.current = edge.to
                        notVisited = getEdges(currentMT).concat(notVisited);
                    }
                }
                //console.log(currentMT);
                console.log(currentMT);
                if(isFinal(currentMT)) {console.log("TRUE"); return true;}
            }
            //console.log(currentMT);
            if(isFinal(currentMT)) {console.log("TRUE"); return true;}
            else {console.log("FALSE"); return false;}
        }
    }
}

function cloneHistory(history) {
    return cloneDeep(history)
}

function addHistory(history, obj){
    history.push(cloneDeep(obj));
}

function rollback(history){
    let response = history[history.length - 1];
    return cloneDeep(response);
}

function getEdges(mt){
    return mt.machine[mt.current].edges;
}

function isFinal(mt){
    return mt.machine[mt.current].final
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

// teste = new TuringMachine();
// tapes = ['000', '111']
// teste.runTest(1, tapes, tapes.length);

module.exports = TuringMachine;



/*
runTest(initial, tapesData, tapesCount){
        this.__initTapes(tapesData, tapesCount);
        let history = [];
        let notVisited = [];
        this.current = initial;

        addHistory(history, this); //salva estado atual da máquina
        while(history.length > 0){
            console.log("quant:",history.length);
            let currentMT = rollback(history); //recupera último estado da máquina
            console.log(currentMT);
            //console.log("ROLLBACK");
            //console.log(currentMT);
            notVisited = getEdges(currentMT); //lista todos os edges de um nó
            while(notVisited.length > 0){ //percorre pelas edges de um nó
                //console.log(notVisited)
                let readErr = false;
                let edge = notVisited.shift();
                console.log("current", currentMT.current)
                console.log("edge", edge);
                for(let i = 0; i < edge.action.length; i++){ //percorre pelo numero de fitas
                    let action = edge.action;
                    let currentTape = currentMT.tapes[i];
                    if(!currentTape.execute(action[i].read, action[i].write, action[i].move)){
                        readErr = true;
                        console.log("ANTES ROLLBACK");
                        console.log(currentMT);
                        currentMT = rollback(history);
                        console.log("DEPOIS ROLLBACK");
                        console.log(currentMT);
                        console.log("erro")
                        break;
                    }
                    else {
                        currentMT.current = edge.to
                        notVisited = getEdges(currentMT).concat(notVisited);
                    }
                }
                //console.log(currentMT);
                //console.log(currentMT);
                if(isFinal(currentMT)) {console.log("TRUE"); return true;}
            }
            //console.log(currentMT);
            if(isFinal(currentMT)) {console.log("TRUE"); return true;}
            else {console.log("FALSE"); return false;}
        }
    }
*/