// function to escape any text that will be used to set innerHTML of DOM nodes,
// preventing js injection
function escapeText(text) {
    return text.replace("<", "&lt;").replace(">", "&gt;").replace("/", "&#47;");
}

module.exports.escapeText = escapeText;
