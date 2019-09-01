class Player {
    constructor(user, player_id, x=ath.random() * designer.canvas.width, y=ath.random() * designer.canvas.height) {
        this.user = user
        this.x = x
        this.y = y

        this.width = this.height = 10
        this.color = "blue"
        
        this.walk_speed = 1
        this.run_speed = this.walk_speed * 2
        this.current_speed = this.walk_speed

        this.designer_id = designer.array.length
        designer.addIn(this)

        this.player_id = player_id

    }

    check_inputs(inputs) {

        if (inputs.run) {
            this.current_speed = this.run_speed
        } else {
            this.current_speed = this.walk_speed
        }

        if (inputs.up) {
            this.move(0, -this.current_speed)
        } else if (inputs.down) {
            this.move (0, this.current_speed)
        }

        if (inputs.right) {
            this.move(this.current_speed, 0)
        } else if (inputs.left) {
            this.move(-this.current_speed, 0)
        }
    }

    move(x, y) {
        this.x += x
        this.y += y
        this.send_positions()
    }

    send_positions() {
        socket.emit('move', {
            id:this.user.name + this.user.pw,
            pos: {x: this.x, y: this.y}
        })
    }
}