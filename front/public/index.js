const socketUrl = 'http://localhost:9000'

//let error = null

let socket = io(socketUrl, {
    autoConnect: false,
})

socket.on('connect', () => {
    console.log('Connected')
    status.value = "Connected"

    socket.emit('authentication', {
        name: user.name,
        pw: user.pw
    })
    /*setTimeout(() => {
        if (status.value = "Connected") {
            enter_button.style.display = 'block'
        } else {
            submit_button.style.display = 'block'
            disconnect_button.style.display = 'none'
            enter_button.style.display = 'none'
        }
    }, 1500);*/
})

socket.on('is validated', function () {
    disconnect_button.style.display = 'block'
    enter_button.style.display = 'block'
    submit_button.style.display = 'none'
})

socket.on('unauthorized', (reason) => {
    console.log('Unauthorized:', reason)
    if (reason.message === 'UNAUTHORIZED') {
        status.value = "You are not recognized"
    } else {
        status.value = reason.message
    }

    error = reason.message

    socket.disconnect()
    disconnect_button.style.display = 'none'
    enter_button.style.display = 'none'
    submit_button.style.display = 'block'
})

socket.on('disconnect', (reason) => {
    error = null
    console.log(`Disconnected: ${error || reason}`)
})

const connect_to_server = () => {
    console.log("My user is: ", user)
    let error = null
    
    socket.open()
}

const disconnect = () => {
    socket.disconnect()
    status.value = "You are disconnected"
    disconnect_button.style.display = 'none'
    enter_button.style.display = 'none'
    submit_button.style.display = 'block'
}