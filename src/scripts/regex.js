const Regex = require('../Regex');

const regexEntry = document.querySelector('#regexEntry');
const regexEntryLabel = document.querySelector('#entryLabel');
const resultLabel = document.querySelector('#resultLabel');
const regexInput = document.querySelector('#regexInput');
const resultLabel2 = document.querySelector('#resultLabel2');
const regexInput2 = document.querySelector('#regexInput2');

regexEntry.onkeyup = () => {
    if(Regex.CreateRegex('^([a-zA-Z0-9^$*()+|.])*$').test(regexEntry.value)){
        regexEntryLabel.innerHTML = 'check_circle';
        regexEntryLabel.style.color = 'green';
    }else{
        regexEntryLabel.innerHTML = 'cancel';
        regexEntryLabel.style.color = 'red';
    }

    if(Regex.CreateRegex(regexEntry.value).test(regexInput.value)){
        resultLabel.innerHTML = 'check_circle';
        resultLabel.style.color = 'green';
    }else{
        resultLabel.innerHTML = 'cancel';
        resultLabel.style.color = 'red';
    }

    if(Regex.CreateRegex(regexEntry.value).test(regexInput2.value)){
        resultLabel2.innerHTML = 'check_circle';
        resultLabel2.style.color = 'green';
    }else{
        resultLabel2.innerHTML = 'cancel';
        resultLabel2.style.color = 'red';
    }
}

regexInput.onkeyup = () => {
    if(Regex.CreateRegex(regexEntry.value).test(regexInput.value)){
        resultLabel.innerHTML = 'check_circle';
        resultLabel.style.color = 'green';
    }else{
        resultLabel.innerHTML = 'cancel';
        resultLabel.style.color = 'red';
    }
}

regexInput2.onkeyup = () => {
    if(Regex.CreateRegex(regexEntry.value).test(regexInput2.value)){
        resultLabel2.innerHTML = 'check_circle';
        resultLabel2.style.color = 'green';
    }else{
        resultLabel2.innerHTML = 'cancel';
        resultLabel2.style.color = 'red';
    }
}