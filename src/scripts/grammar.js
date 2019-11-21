const GLUD = require('../Grammar').GLUD;
const Regex = require('../Regex');
const BrowserWindow = require('electron').remote.BrowserWindow;
const ipcRenderer = require('electron').ipcRenderer;
let glud = new GLUD();

const grammarContainer = document.getElementById("grammar");
const grammarContainerRules = grammarContainer.querySelector("#rules");
const grammarProto = document.getElementById("prototype");
const entryGrammar = grammarContainer.querySelector("#entry");
const executeGrammar = grammarContainer.querySelector("#execute");
const convertGrammar = grammarContainer.querySelector("#convert");
const grammarLabel = grammarContainer.querySelector("#grammarLabel");

(grammarProto.querySelector("#rhs")).onfocus = function () {
    if (this.parentNode.parentNode.querySelector("#lhs").value != "") {
        grammarContainerRules.appendChild(grammarProto.clone());
        this.onfocus = null;
    }
};

(grammarProto.querySelector("#rhs")).onchange = function () {
    let regex = Regex.CreateRegex(GLUD.REGEX);
    if (!regex.test(this.value)) this.value = "";
};

executeGrammar.onclick = function () {
    let glud = new GLUD();
    let rules = grammarContainerRules.childNodes;
    let initial = null

    for (let r of rules) {
        let token = r.querySelector("#lhs").value;
        let rule = r.querySelector("#rhs").value;

        if (!initial) initial = token;
        glud.AddRule(token, rule);
    }
    console.log(glud);
    console.log(glud.ConvertToAF(initial));
    if (glud.RunTest(initial, entryGrammar.value)) {
        grammarLabel.innerHTML = 'check_circle';
        grammarLabel.style.color = 'green';
    } else {
        grammarLabel.innerHTML = 'cancel';
        grammarLabel.style.color = 'red';
    }
}

convertGrammar.onclick = function () {
    let glud = new GLUD();
    let rules = grammarContainerRules.childNodes;
    let initial = null

    for (let r of rules) {
        let token = r.querySelector("#lhs").value;
        let rule = r.querySelector("#rhs").value;

        if (!initial) initial = token;
        glud.AddRule(token, rule);
    }

    let AFDWindow = new BrowserWindow({
        width: 800,
        height: 800,
        show: true,
        webPreferences: {
            nodeIntegration: true
        }
    })
    AFDWindow.loadURL(`file://${__dirname}/../Screen/automata.html`);

    AFDWindow.webContents.once('did-finish-load', () => {
        AFDWindow.webContents.send('build', glud.ConvertToAF(initial));
    })
}

grammarProto.clone = function () {
    let c = grammarProto.cloneNode(true);

    c.querySelector("#rhs").onfocus = grammarProto.querySelector("#rhs").onfocus;
    c.querySelector("#rhs").onchange = grammarProto.querySelector("#rhs").onchange;
    c.querySelector("#rhs").value = "";

    c.style.display = '';
    return c;
}

grammarContainerRules.appendChild(grammarProto.clone());

ipcRenderer.on('build', (e, data) => {
    let keys = Object.keys(data);
    for(let t = keys.length - 1; t >= 0; t--){
        for(let r of data[keys[t]]){
            let clone = grammarProto.clone();        
            clone.querySelector('#rhs').onfocus = null;
            clone.querySelector('#rhs').onchange = null;
            clone.querySelector('#lhs').value = keys[t]        
            clone.querySelector('#rhs').value = r  
            grammarContainerRules.prepend(clone);      
        }
    }
})