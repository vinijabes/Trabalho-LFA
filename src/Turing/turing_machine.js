class TuringMachine{
    constructor(){
        this.initial = null;
        this.machine = [];
        this.tapes = [];
        this.final = [];
    }

    __initMachine(data){
        if(end)
            this.final
    }

    __initTapes(tapesData, tapesCount){
        for(let i = 0 ; i < tapesCount; i++){
            this.tapes.push(new Tape);
            this.tapes[i].setData(this.tapesData[i]);
        }
    }

    init(){
        this.__initMachine();
        this.__initTapes();
    }
}