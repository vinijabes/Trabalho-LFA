var cloneDeep = require('lodash.clonedeep');
const Tape = require('./tape'); 
const { read } = require('fs');
class TuringMachine {
    constructor(){
        this.machine = {
            1:{
                edges: [{
                    from: 1,
                    action:[{
                            read: 'λ', write: 'λ', move:'R'
                        },
                        {
                            read: 'λ', write: 'λ', move:'R'
                        }
                    ],
                    to: 2
                },
                {
                    from: 1,
                    action:[{
                            read: 'a', write: 'A', move:'R'
                        },
                        {
                            read: 'a', write: 'A', move:'R'
                        }
                    ],
                    to: 3
                }],
            },
            2:{
                edges: [],
                final: true
            },
            3:{
                edges: [{
                    from: 3,
                    action:[{
                            read: 'a', write: 'A', move:'R'
                        },
                        {
                            read: 'a', write: 'A', move:'R'
                        }
                    ],
                    to: 1
                }],
            },
        }
        this.tapes = [];
        this.current = null;
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

teste = new TuringMachine();
tapes = ['aaaa', 'aaaa']
teste.runTest(1, tapes, tapes.length);


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