module.exports.CreateRegex = (regexString) => {
    let regex = new RegExp();
    regex.compile(regexString, "g");
    return regex;
}

module.exports.ConvertToAF = (regexString) => {
    
}