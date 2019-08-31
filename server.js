const socketAuth = require('socketio-auth')
const express = require('express')
const path = require('path')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

const fetch = require('node-fetch')
const redis = require('./redis')
const PORT = process.env.PORT || 9000

const clients = []
const rooms = []
rooms.push({name: "room 1", clients:  []})

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'game_js')))

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html')
})


io.on('connection', function(socket) {
    socket.on('chat message', function(user, msg) {
        console.log(user)
        io.emit('chat message', user, msg)
    })
    
    socket.on('store client info', function(data) {
        let client_info = new Object()
        client_info.id = data.id
        client_info.client_id = socket.id
        client_info.user = data.user
        client_info.pos = data.pos
        socket.my_data = client_info
        clients.push(socket.my_data)
        console.log('GOT DATA, NOW:', clients)
    })

    socket.on('get users', function(user_id, room_name) {
        let room = io.sockets.adapter.rooms[room_name].sockets
        console.log("ROOOOOOM", room)
        let users = []
        for (var client_id in room) {
            let user = io.sockets.connected[client_id].my_data
            users.push(user)
        }
        console.log("USERS", users)
        io.emit('received clients', users)
    })

    socket.on('move', function(data) {
        socket.broadcast.emit('new pos', data)
    })

    socket.on('rooms', function(data) {
        io.to(socket.id).emit('rooms', rooms)
    }) 

    socket.on('join room', function (room_name) {
        socket.join(room_name)
    })

    socket.on ('disconnect', function (data) {
        console.log('RECEIVED')
        for (var i=0; i<clients.length; i++) {
            let c = clients[i]
            if (c.client_id === socket.id) {
                console.log('SENT')
                socket.broadcast.emit('client left', c.id)
                clients.splice(i, 1)
                break
            }
        }
    })
})

async function verifyUser(token) {
    console.log('verify', token)
    return new Promise((resolve, reject) => {

        // savoir ce qu'envoie le serveur
        console.log('*************server sent:', token)
        
        // user a renvoyer
        let user = {name: '', pw: ''}

        fetch('http://test.lan/authentication/PHP/index.php',
        {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'post',
            body: JSON.stringify(token)
        })
        .then(res => res.json())
        .then(json => {
            // savoir ce qu'envoie le php
            console.log("*************php sent:", json)
            
            // Si on a un user, on le return, sinon on return un erreur
            if (json.result === 'got user') {
                user = token
            } else {
                return reject('USER_NOT_FOUND')
            }

            return resolve(user)
        })

    })
}

socketAuth(io, {
    authenticate: async(socket, data, callback) => {
        console.log('authenticate', data)
        const token = data
        
        try {
            const user = await verifyUser(token)
            const canConnect = await redis
                .setAsync(`users:${user.id}`, socket.id, 'NX', 'EX', 30)

            if (!canConnect) {
                //return callback({ message: 'ALREADY_LOGGED_IN' })
            }

            socket.user = user

            return callback(null, true)
        } catch (e) {
            console.log('exeption', e)
            console.log(`Socket ${socket.id} unauthorized.`)
            return callback({ message: 'UNAUTHORIZED' })
        }
    },
    postAuthenticate: async(socket) => {
        console.log(`Socket ${socket.id} authenticated.`)

        socket.emit('is validated')

        socket.conn.on('packet', async(packet) => {
            if (socket.auth && packet.type === 'ping') {
                await redis.setAsync(`users:${socket.user.id}`, socket.id, 'XX', 'EX', 30)
            }
        })
    },
    disconnect: async(socket) => {
        console.log(`Socket ${socket.id} disconnected.`)

        if (socket.user) {
            await redis.delAsync(`users:${socket.user.id}`)
        }
    },
})



server.listen(PORT, function() {
    console.log('listening on *:' + PORT)
})