const designer = new Designer()
const inputs = new Input()
document.addEventListener("keydown", inputs.keyDown.bind(inputs), false)
document.addEventListener("keyup", inputs.keyUp.bind(inputs), false)

let x = Math.random() * designer.canvas.width
let y = Math.random() * designer.canvas.height
let players = []

function get_user() {

    socket.emit('store client info', {
        id: user.name+user.pw,
        user: user,
        pos: {x: x, y: y}
    })
    load_other_player()
    create_player()
}

function load_other_player() {
    socket.emit('get users', user.room)
}

socket.on('received clients', function(data) {
    console.log('before players was', players)
    console.log('received', data, 'length is', data.length)
    players = []
    designer.resetArray()
    for (var i=0; i<data.length; i++) {
        const d = data[i]
        console.log(d)
        players.push(new Player(d.user, players.length, d.pos.x, d.pos.y))
    }
})

socket.on('new pos', function(data) {
    for (var i=0; i<players.length; i++) {
        const p = players[i]
        let p_id = p.user.name + p.user.pw
        if (p_id=== data.id) {
            p.x = data.pos.x
            p.y = data.pos.y
            break
        }
    }
})

socket.on('client left', function(user_id) {
    for (var i=0; i<players.length; i++) {
        const p = players[i]
        if (user_id == p.user.name+p.user.pw) {
            players.splice(i, 1)
            designer.removeAt(i)
            break
        }
    }
})

function create_player(user) {
    //player = new Player(user)
}

requestAnimationFrame(loop)
function loop() {
    for (var i in players) {
        const p = players[i]
        if (p.user.name != user.name || p.user.pw != user.pw) {
            continue
        }
        p.check_inputs(inputs)
        break
    }

    designer.draw();

    requestAnimationFrame(loop)
}