var util = require("./util");
var Autolinker = require("autolinker");

function ChatWindow(container, webrtc){
    this.webrtc = webrtc;
    this.createChatDivs(container);
}

ChatWindow.prototype.createChatDivs = function(container){
	var chatWindow = document.createElement('div');
	chatWindow.id = "chatWindow";
    chatWindow.className = "toolbar-element hide";
	var chatLog = document.createElement('div');
	chatLog.id = "chatLog";
	chatWindow.appendChild(chatLog);
	var chatInput = document.createElement('div');
    var self = this;
    // add event listener so that pressing the enter key when the chat window
    // is in focus will send the chat message
    chatInput.addEventListener("keydown", function(event) {
        // if enter key was pressed
        if (event.which === 13) {
            // send the composed message
            self.addLocalMessage(event);
        }
    });

    var i =  document.createElement("input"); //input element, text
    i.setAttribute('type',"text");
    i.setAttribute('id', "chat-input");
    chatInput.appendChild(i);
    var sendBtn = document.createElement("BUTTON");
    sendBtn.setAttribute("id", "send");
    var t = document.createTextNode("send");       // Create a text node
    sendBtn.appendChild(t);  
    sendBtn.setAttribute("type", "button")
    chatInput.appendChild(sendBtn);
    sendBtn.onclick = this.addLocalMessage.bind(this);
    chatWindow.appendChild(chatInput);
    container.appendChild(chatWindow);
    this.input = i;
    this.div = chatWindow;
}

ChatWindow.prototype.toggle = function(){
    if(this.div.className == "toolbar-element show"){
        this.div.className = "toolbar-element hide";
    }else {
        this.div.className = "toolbar-element show";
        // focus the chat bar element so that users don't have to click to be
        // able to start typing
        document.getElementById("chat-input").focus();
    }
}


ChatWindow.prototype.appendToChatLog = function(label, text){
	chatLog.innerHTML += "<span id='chat-label'>" + label + ": </span>";
	chatLog.innerHTML += Autolinker.link(text) + "<br>";
    this.div.className = "toolbar-element show";
}

ChatWindow.prototype.addLocalMessage = function(e){
	console.log(this.input.value);
	this.appendToChatLog("me", this.input.value);
	this.webrtc.sendDirectlyToAll("simplewebrtc", "chat", this.input.value) ;
	this.input.value = "";
}

module.exports = ChatWindow;
