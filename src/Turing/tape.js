class Tape{
    constructor(){
        this.data = ""
        this.position = 0;
    }

    setData(data) {
        this.data = data
    }

    moveToRight(){
        if(this.position == this.data.length - 1)
            this.__addEndTape()
        this.position+=1;
    }

    moveToLeft(){
        if(this.position == 0)
            this.__addFirstTape();
        else
            this.position -= 1;
    }

    __addFirstTape(){
        this.data = 'λ' + this.data;
    }

    __addEndTape(){
        this.data = this.data + 'λ';
    }

    read(){
        return this.data.charAt(this.position);
    }

    write(value){
        if(value != 'λ')
            this.data.substr(0, this.position - 1) + value + this.data.substr(this.position + 1, this.data.length)
    }
}