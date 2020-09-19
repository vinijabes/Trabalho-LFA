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

    runTest(initial, tapesData, tapesCount){
        this.__initTapes(tapesData, tapesCount);
        let history = [];
        let notVisited = [];
        this.current = initial;

        addHistory(history, this); //salva estado atual da máquina
        while(history.length > 0){
            console.log("quant:",history.length);
            let currentMT = rollback(history); //recupera último estado da máquina
            //console.log(currentMT);
            //console.log("ROLLBACK");
            //console.log(currentMT);
            notVisited = getEdges(currentMT); //lista todos os edges de um nó
            while(notVisited.length > 0){ //percorre pelas edges de um nó
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
                console.log(currentMT);
                if(isFinal(currentMT)) {console.log("TRUE"); return true;}
            }
            //console.log(currentMT);
            if(isFinal(currentMT)) {console.log("TRUE"); return true;}
            else {console.log("FALSE"); return false;}
        }
    }
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