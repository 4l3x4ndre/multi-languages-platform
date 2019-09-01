class Input {
    constructor() {
        this.up = false
        this.down = false
        this.right = false
        this.left = false
        this.run = false
    }
    
    keyDown(e) {
        
        if (e.keyCode == 90 || e.keyCode == 87) {
            this.up = true
        } else if (e.keyCode == 81 || e.keyCode == 65) {
            this.left = true
        } else if (e.keyCode == 83) {
            this.down = true
        } else if (e.keyCode == 68) {
            this.right = true
        } else if (e.keyCode == 16) {
            this.run = true
        }
        
    }

    keyUp(e) {
        if (e.keyCode == 90 || e.keyCode == 87) {
            this.up = false
        } else if (e.keyCode == 81 || e.keyCode == 65) {
            this.left = false
        } else if (e.keyCode == 83) {
            this.down = false
        } else if (e.keyCode == 68) {
            this.right = false
        } else if (e.keyCode == 16) {
            this.run = false
        }
    }
}