class Tape{
    constructor(){
        this.data = ""
        this.position = 0;
    }

    setData(data) {
        this.data = data
        if(data == ""){
            this.data = 'λ'
        }
    }

    canExecute(read) {
        return this.__read() == read
    }

    execute(read, write, move){
        //console.log(read, write);
        if(this.__read() != read) return false;

        this.__write(write);
        this.__move(move);
        return true;
    }

    __move(value){
        if(value == 'R')
            this.__moveToRight();
        else if(value == 'L')
            this.__moveToLeft();
    }

    __moveToRight(){
        if(this.position == this.data.length - 1)
            this.__addEndTape()
        this.position+=1;
    }

    __moveToLeft(){
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

    __read(){
        return this.data.charAt(this.position);
    }

    __write(value){
        this.data = this.data.substr(0, this.position) + value + this.data.substr(this.position+1)
    }
}
module.exports = Tape;