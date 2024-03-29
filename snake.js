//=======author:"fsh" qq:"741691336" weixin:"忘我之鱼"=======//
//=======忙里偷闲的产物，界面略丑;)==========================//
//=======原生js面向对象，欢迎试玩^_^=========================//
//游戏主体
new function() {
    let cvs = $("cvs"),
        ctx = cvs.getContext("2d"),
        width = cvs.width,
        height = cvs.height,
        m_great = $("m_great"),
        m_over = $("m_over"),
        level = 1,
        score = 0,
        scorePerLevel = 50,
        speed = 1000 / 2,
        timer = null,
        scoreDiv = $("score"),
        controlDiv = $("control"),
        over = false,
        snake = new Snake(width, height),
        snakeNodes = snake.nodes,
        rat = new Rat(),
        paused = false;

    //开启主循环
    loop(true);

    function loop(firstTime) { //参数，首次进主循环
        timer = setTimeout(loop, speed);
        //按键监听
        window.onkeydown = keydown;
        if (paused) {
            return;
        }
        //画背景
        drawBg();
        //移蛇
        snake.move();
        //游戏结束判定
        if (snake.eatMyself() || checkBoundaryCollision()) {
            //播音乐
            m_over.play();
            //设标置
            over = true;
            scoreDiv.innerHTML = "第<strong>" +
                level +
                "</strong>关&nbsp;&nbsp;分数: <strong>" +
                score +
                "</strong>&nbsp;&nbsp;<b>游戏结束</b>";
            clearTimeout(timer);
        }
        //吃鼠检测
        if (checkSnakeCollision()) {
            //播音乐
            m_great.play();
            //设标置
            rat.eaten = true;
            //蛇增长
            let newTailVx = snake.tail.vx;
            let newTailVy = snake.tail.vy;
            let newTailX = snake.tail.x - newTailVx * snake.size;
            let newTailY = snake.tail.y - newTailVy * snake.size;
            snake.tail = new SnakeNode(newTailX, newTailY, snake.size);
            snake.tail.vx = newTailVx;
            snake.tail.vy = newTailVy;
            snakeNodes.push(snake.tail);
            //计分
            score += 10;
            level = (score / scorePerLevel >> 0) + 1;
            //加速
            speed -= level;
            //更新dom
            scoreDiv.innerHTML = "第<strong>" +
                level +
                "</strong>关&nbsp;&nbsp;分数: <strong>" +
                score +
                "</strong>";
        }
        //画蛇
        for (let i = snakeNodes.length; i--;) {
            draw(snake.nodes[i]);
        }
        //首次循环或鼠被吃掉就移鼠
        if (firstTime || rat.eaten) {
            rndMove(rat);
            rat.eaten = false;
        }
        //画鼠
        draw(rat);
    };

    //绘制游戏区
    function drawBg() {
        ctx.fillStyle = "#fbda30";
        ctx.fillRect(0, 0, width, height);
        ctx.fill();
    }

    function draw(obj) {
        ctx.fillStyle = obj.color;
        ctx.fillRect(obj.x, obj.y, obj.size, obj.size);
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.strokeRect(obj.x, obj.y, obj.size, obj.size);
    }

    function checkSnakeCollision(obj = rat) { //物体与蛇相撞检测（默认检测鼠）
        for (let i = snakeNodes.length; i--;) {
            const { x: sx, y: sy } = snakeNodes[i];
            const { x, y } = obj;
            if (sx == x &&
                sy == y) {
                return true;
            }
        }
        return false;
    }

    function checkBoundaryCollision() { //撞墙检测
        return snake.head.x < 0 ||
            snake.head.x >= width ||
            snake.head.y < 0 ||
            snake.head.y >= height;
    }

    function rndMove(obj) { //随机移块
        let x, y;
        do {
            x = Math.floor(width * Math.random() / obj.size) * obj.size;
            y = Math.floor(height * Math.random() / obj.size) * obj.size;
        }
        while (x == obj.x && y == obj.y ||
            checkSnakeCollision({ x, y }));
        obj.x = x, obj.y = y;
    }

    function keydown(event) {
        window.onkeydown = null;
        switch (event.keyCode) {
            case 37: //←
            case 65: //a
                if (snake.head.vx != 1) {
                    snake.head.vx = -1;
                    snake.head.vy = 0;
                }
                break;
            case 38: //↑
            case 87: //w
                if (snake.head.vy != 1) {
                    snake.head.vx = 0;
                    snake.head.vy = -1;
                }
                break;
            case 39: //→
            case 68: //d
                if (snake.head.vx != -1) {
                    snake.head.vx = 1;
                    snake.head.vy = 0;
                }
                break;
            case 40: //↓
            case 83: //s
                if (snake.head.vy != -1) {
                    snake.head.vx = 0;
                    snake.head.vy = 1;
                }
                break;
            case 13: //enter
            case 32: //space
                if (over) { //游戏结束就重启
                    level = 1;
                    score = 0;
                    speed = 1000 / 2;
                    scoreDiv.innerHTML = "第<strong>" +
                        level +
                        "</strong>关&nbsp;&nbsp;分数: <strong>" +
                        score +
                        "</strong>";
                    snake.init();
                    over = false;
                    loop(true);
                } else { //游戏暂停就继续,游戏进行中就暂停
                    paused = !paused;
                }
                break;
        }
    };
};

//块类
function Box(x, y, size) {
    this.x = x || 0;
    this.y = y || 0;
    this.size = size || 10;
    this.color = "green";
};

//蛇的节点类
function SnakeNode(x, y, size) {
    Box.call(this, x, y, size);
    //构造方法
    this.vx = 1; //横向速度
    this.vy = 0; //纵向速度
};

//蛇类
function Snake(width, height) {
    let snakeNodes = this.nodes = []; //节点数组，从蛇头到蛇尾
    let initLength = 3;
    let size = this.size = 10; //节点大小
    this.head = null;
    this.tail = null;
    this.init = function() {
        snakeNodes.length = 0;
        for (let i = initLength; i--;) {
            let node = new SnakeNode(width / 2 + (i - 1) * size, height / 2, size);
            snakeNodes.push(node);
        }
        this.head = snakeNodes[0];
        this.tail = snakeNodes[initLength - 1];
        this.head.color = "#eb281d";
    }
    this.move = function() {
        for (let i = snakeNodes.length; i--;) {
            let node = snakeNodes[i];
            // 移蛇
            node.x += (size * node.vx);
            node.y += (size * node.vy);
            // 速度传递
            if (i) {
                node.vx = snakeNodes[i - 1].vx;
                node.vy = snakeNodes[i - 1].vy;
            }
        }
    };
    this.eatMyself = function() {
        if (snakeNodes.length < 5) return false;
        for (let i = snakeNodes.length; i-- - 1;) {
            if (this.head.x == snakeNodes[i].x && this.head.y == snakeNodes[i].y) {
                return true;
            }
        }
        return false;
    };
    this.init();
};

//鼠类
function Rat(x, y, size) {
    Box.call(this, x, y, size);
    this.color = "#476b8b";
    this.eaten = false; //判断是否被吃了
};

//工具方法
function $(id) {
    return document.getElementById(id);
}