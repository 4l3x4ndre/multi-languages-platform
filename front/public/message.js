let is_logged = false

function message_senter(message) {
    if (!is_logged) {
        return
    }
    socket.emit('chat message', user, message);
}

socket.on('chat message', function(user, msg) {
    let li = document.createElement("LI")
    let text = document.createTextNode(user.name + ': '+ msg)
    li.append(text);
    document.querySelector('#messages').append(li)
})