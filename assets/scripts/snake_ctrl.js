import joystick from 'joystick'

// 函数调用频率
const CELL_TIME = 0.016

cc.Class({
    extends: cc.Component,

    properties: {
        speed: 200,
        itemLen: 25,
        stick: { // 绑定组件，但是还需要 creator 在界面上拖入(new)
            type: joystick,
            default: null
        }
    },

    // onLoad () {},

    start () {
        this.now_time = 0
        this.capture_prints()
    },
    
    // dt 是上一次 update 过去的时间
    // dt 不是固定的，每个手机里效果不一样，60FPS 0.016，30FPS 0.032
    update (dt) {
        this.now_time += dt
        while (this.now_time >= CELL_TIME) { // 如果 0.016 循环一次，0.032 则循环两次
            this.fixed_update(CELL_TIME)
            this.now_time -= CELL_TIME
        }
    },

    fixed_update(dt) {
        if (this.stick.dir == -1) return

        let s = this.speed * dt
        let sx = s * Math.cos(this.stick.radius)
        let sy = s * Math.sin(this.stick.radius)

        // 蛇头移动
        let head = this.node.children[0]
        let pos = head.getPosition()
        pos.x += sx
        pos.y += sy
        head.setPosition(pos)
        this.pos_set.push(cc.v2(pos.x, pos.y))

        // 蛇头角度
        let degree = this.stick.radius * 180 / Math.PI
        degree -= 90
        head.angle = degree

        // 蛇身蠕动
        for (let i = 0; i < this.node.childrenCount; i++) {
            let item = this.node.children[i]
            let index = item.cur_index + 1
            item.setPosition(this.pos_set[index])
            item.cur_index = index
        }

        // 删除储存的蠕动数据，防止爆栈
        let tail = this.node.children[this.node.childrenCount - 1]
        if (tail.cur_index >= 1024) {
            for (let i = 0; i < this.node.childrenCount; i++) {
                let item = this.node.children[i]
                item.cur_index -= 1024
            }
            this.pos_set.splice(0, 1024)
        }
    },

    capture_prints() { // 位置采集
        let len = (this.node.childrenCount - 1) * this.itemLen
        let pos_x = 0
        let pos_y = - len

        len *= 2

        let total_time = len / this.speed
        this.pos_set = []
        this.pos_set.push(cc.v2(pos_x, pos_y))

        let passed_time = 0
        while(passed_time < total_time) {
            pos_y += this.speed * CELL_TIME
            this.pos_set.push(cc.v2(pos_x, pos_y))
            passed_time += CELL_TIME
        }

        let head = this.node.children[0]
        head.setPosition(this.pos_set[this.pos_set.length - 1])

        let point_num = Math.floor(this.itemLen / (this.speed * CELL_TIME))

        for (let i = 0; i < this.node.childrenCount; i++) {
            let item = this.node.children[i]
            let index = this.pos_set.length - 1 - point_num * i
            item.setPosition(this.pos_set[index])
            item.cur_index = index
        }
    }
});
