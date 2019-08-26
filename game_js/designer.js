class Designer {
    constructor() {
        this.array = []
        this.canvas = document.querySelector("#canvas")
        this.ctx = this.canvas.getContext("2d")
    }

    draw() {
        this.canvas.width = this.canvas.width
        for (var i in this.array) {
            
            const e = this.array[i]
            this.ctx.beginPath()
            this.ctx.fillStyle = e.color
            this.ctx.rect(e.x, e.y, e.width, e.height)
            this.ctx.fill()
            this.ctx.closePath()
            
        }
    }

    addIn(obj) {
        this.array.push(obj)
    }

    removeFrom(obj) {
        this.array.splice(obj.designer_id, 1)
    }

    resetArray() {
        this.array = []
    }

    removeAt(id) {
        this.array.splice(id, 1)
    }
}