const GLUD = require('../Grammar').GLUD;
const Regex = require('../Regex');
let glud = new GLUD();

const grammarContainer = document.getElementById("grammar");
const grammarContainerRules = grammarContainer.querySelector("#rules");
const grammarProto = document.getElementById("prototype");
const entryGrammar = grammarContainer.querySelector("#entry");
const executeGrammar = grammarContainer.querySelector("#execute");

(grammarProto.querySelector("#rhs")).onfocus = function () {
    if (this.parentNode.querySelector("#lhs").value != "") {
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

    console.log(glud.RunTest(initial, entryGrammar.value));
}

grammarProto.clone = function () {
    let c = grammarProto.cloneNode(true);

    c.querySelector("#rhs").onfocus = grammarProto.querySelector("#rhs").onfocus;
    c.querySelector("#rhs").onchange = grammarProto.querySelector("#rhs").onchange;
    c.querySelector("#rhs").value = "";

    c.style.display = 'block';
    return c;
}

grammarContainerRules.appendChild(grammarProto.clone());