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
            console.log(currentMT);
            //console.log("ROLLBACK");
            //console.log(currentMT);
            notVisited = getEdges(currentMT); //lista todos os edges de um nó
            while(notVisited.length > 0){ //percorre pelas edges de um nó
                console.log(notVisited)
                let readErr = false;
                let edge = notVisited.shift();
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
            console.log(currentMT);
            if(isFinal(currentMT)) {console.log("TRUE"); return true;}
            else {console.log("FALSE"); return false;}
        }
    }
}

function addHistory(history, obj){
    let mt = {...obj}
    for(let i = 0; i < mt.tapes.length; i++){
        let str = new String(mt.tapes[i].data);
        mt.tapes[i] = new Tape();
        mt.tapes[i].setData(str);
    }
    history.push(mt);
}

function rollback(history){
    let response = Object.assign({}, history[history.length - 1]);
    for(let i = 0; i < response.tapes.length; i++){
        let str = new String(response.tapes[i].data);
        response.tapes[i] = new Tape();
        response.tapes[i].setData(str);
    }
    return response;
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
        let currentN = initial;
        let queue = [""];
        queue.push(initial);
        this.__addHistory(initial);
        let machines = [this];
        while (machines.length > 0){ //quantidade de maquinas
            let readErr = false;
            let currentM = machines.pop();
            //while(queue.length > 0){ //quantidade de elementos a 
            console.log(currentN)
            while(currentN !== false && !readErr){
                console.log(currentN);
                if(currentM.machine[currentN].final) {console.log("TRUE"); return true;}
                for(let edge of currentM.machine[currentN].edges){ //percorre pelas edges de um nó
                    for(let i = 0; i < edge.action.length; i++){ //percorre pelo numero de fitas
                        let action = edge.action;
                        let currentTape = currentM.tapes[i];
                        //console.log(action[i].read);
                        //console.log("currenteN", currentN);
                        if(!currentTape.execute(action[i].read, action[i].write, action[i].move)){
                            readErr = true;
                            break;
                        }
                        else {
                            currentN = edge.to
                            //console.log(currentN)
                        }
                    }
                    //console.log(currentN);
                    console.log(currentM);
                    //if (readErr) break;
                    if(currentM.machine[currentN].final) {console.log("TRUE"); return true;}
                }
                if (machines.length == 0 && readErr){
                    continue;
                }
                if(currentM.machine[currentN].final){
                    console.log("TRUE");
                    return true;
                }
            //}
            }
        }
        console.log("False");
        return false;
    }
*/