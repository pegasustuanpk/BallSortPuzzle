import { _decorator, Component, Node, Prefab, Vec3, Vec2, instantiate, UITransform, tween, Sprite, input, Input, EventTouch } from 'cc';
import { Ball } from './Ball';
import { PlaySceneManager } from './PlaySceneManager';
const { ccclass, property } = _decorator;

const MAX_BALL = 4;

@ccclass('Bottle')
export class Bottle extends Component 
{
    @property(Prefab)
    ballPrefab : Prefab | null = null;

    @property(Sprite)
    spriteNode : Sprite | null = null;

    private width : number = 1;
    private height : number = 1;
    private ballList: Ball[] = [];
    private isReceive: boolean = false;

    bottle(colorList: number[], pos : Vec3, scale : number)
    {
        // Data
        this.node.setScale(scale,scale,1);
        this.node.setPosition(pos);
        this.width = this.node.getComponent(UITransform).contentSize.width*PlaySceneManager.instance.scale;
        this.height = this.node.getComponent(UITransform).contentSize.height*PlaySceneManager.instance.scale;

        // Spawn Ball
        for(let i =0;i<colorList.length;i++)
        {
            this.spawnBall(colorList[i]);
        }
    }

    spawnBall(color : number)
    {
        const ballNode = instantiate(this.ballPrefab);
        const ball = ballNode.getComponent(Ball)!;
        ball.ball(color, this.ballList.length, this);
        this.ballList.push(ball);
        ball.node.setSiblingIndex(ball.index);
    }

    public isComplete() : boolean
    {
        if (this.isFull()) return false; 
        for(let i =0; i < this.ballList.length;i++)
        {
            if (this.ballList[i] !== this.ballList[0]) return false;
        }
        return true;
    }

    public getHeight() : number
    {
        return this.height;
    }

    public setIsReceive(isReceived : boolean)
    {
        this.isReceive = isReceived;
    }

    public getIsReceive() : boolean
    {
        return this.isReceive;
    }

    public isEmpty() : boolean
    {
        return this.ballList.length === 0;
    }

    public isFull() : boolean
    {
        return this.ballList.length === MAX_BALL;
    }

    public getBallCanPush() : number
    {
        return MAX_BALL - this.ballList.length;
    }

    public getCountColorLikeTop() : number
    {
        const topColor = this.getColorTop();
        let count = 0;
        for (let i = this.ballList.length - 1; i >= 0; i--) 
        {
            if (this.ballList[i].color !== topColor) break;
            count++;
        }
        return count;  
    }

    public getLengthBallList() : number
    {
        return this.ballList.length;
    }

    public getColorTop() : number
    {
        if (this.ballList.length === 0) return 0;
        return this.ballList[this.ballList.length-1].color;
    }

    public getPosTop() : Vec3
    {
        let Pos = this.node.getWorldPosition();
        return new Vec3(Pos.x, Pos.y + this.height/2 + 50*PlaySceneManager.instance.scale, 0);
    }

    moveBall(count : number = 0, bottleDes : Bottle)
    {
        let countDelay = count;
        let isLast = false;
        while(count > 0)
        {
            const ball = this.ballList.pop();
            if (count == 1) isLast = true;
            ball.changeBottle(bottleDes, countDelay-count, isLast);
            count--;
        }
    }

    pushBall(ball : Ball)
    {
        this.ballList.push(ball);
    }

    select()
    {
        this.getBallTop().setlect();
    }

    selectEmpty()
    {
        tween(this.node)
            .to(0.02, { angle: 8 })
            .to(0.02, { angle: -8 })
            .to(0.02, { angle: 6 })
            .to(0.02, { angle: -6 })
            .to(0.02, { angle: 3 })
            .to(0.02, { angle: -3 })
            .to(0.02, { angle: 0 })
            .start();
    }

    unSelect()
    {
        if (this.isEmpty()) return;
        this.getBallTop().unSelect();
    }

    getBallTop() : Ball
    {
        if (this.isEmpty()) return null;
        return this.ballList[this.ballList.length-1];
    }

    start(): void 
    {
        // Event
        this.node.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        
        // Data
        this.spriteNode.node.setSiblingIndex(5);
        this.isReceive = false;
    }

    onTouchStart(event : EventTouch)
    {
        if (this.getIsReceive()) return;
        PlaySceneManager.instance.onBottleClick(this);
    }

    update(deltaTime: number)
    {
        
    }
}
