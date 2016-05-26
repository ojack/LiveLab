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
    var i =  document.createElement("input"); //input element, text
    i.setAttribute('type',"text");
     i.setAttribute('id', "chat-input");
     chatInput.appendChild(i);
    var sendBtn = document.createElement("BUTTON");
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
    }
}


ChatWindow.prototype.appendToChatLog = function(label, text){
	chatLog.innerHTML += "<span id='chat-label'>" + label + ": </span>";
	chatLog.innerHTML += text + "<br>";
    this.div.className = "toolbar-element show";
}

ChatWindow.prototype.addLocalMessage = function(e){
	console.log(this.input.value);
	this.appendToChatLog("me", this.input.value);
	this.webrtc.sendDirectlyToAll("simplewebrtc", "chat", this.input.value) ;
	this.input.value = "";
}

module.exports = ChatWindow;
