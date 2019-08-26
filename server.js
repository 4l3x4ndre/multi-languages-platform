const socketAuth = require('socketio-auth')
const express = require('express')
const path = require('path')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

const fetch = require('node-fetch')

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html')
})

const redis = require('./redis')

const PORT = process.env.PORT || 9000


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
            console.log("*************php sent:", json.result)
            
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
                return callback({ message: 'ALREADY_LOGGED_IN' })
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