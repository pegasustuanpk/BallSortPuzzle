import { _decorator, Component, Node, Prefab, Vec3, Vec2, instantiate, UITransform, tween } from 'cc';
import { Ball } from './Ball';
const { ccclass, property } = _decorator;

const MAX_BALL = 4;

@ccclass('Bottle')
export class Bottle extends Component 
{
    @property(Prefab)
    ballPrefab : Prefab |null = null;

    private width : number = 1;
    private height : number = 1;
    private ballList: Ball[] = [];

    bottle(colorList: number[], Pos : Vec3)
    {
        // Data
        this.node.setPosition(Pos);
        this.width = this.node.getComponent(UITransform).contentSize.width;
        this.height = this.node.getComponent(UITransform).contentSize.height;

        // Spawn Ball
        for(let i =0;i<colorList.length;i++)
        {
            this.spawnBall(colorList[i]);
        }
    }

    spawnBall(color : number)
    {
        const ballNode = instantiate(this.ballPrefab);
        ballNode.parent = this.node.parent;
        //ballNode.parent = this.node.parent;
        const ball = ballNode.getComponent(Ball)!;
        ball.ball(color, this.ballList.length, this);
        this.ballList.push(ball);
    }

    public getHeight() : number
    {
        return this.height;
    }

    public getPosition() : Vec3
    {
        return this.node.getPosition();
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
        let Pos = this.getPosition();
        return new Vec3(Pos.x, Pos.y + this.height/2 + 50, 0);
    }

    moveBall(count : number = 0, bottleDes : Bottle)
    {
        let countDelay = count;
        while(count > 0)
        {
            const ball = this.ballList.pop();
            ball.moveBottle(bottleDes, countDelay-count);
            count--;
        }
    }

    pushBall(ball : Ball)
    {
        this.ballList.push(ball);
    }

    select()
    {
        if (this.isEmpty()) return;
        tween(this.ballList[this.ballList.length-1].node).to(0.15, {position: this.getPosTop()}).start();
    }

    unSelect()
    {
        if (this.isEmpty()) return;
        tween(this.ballList[this.ballList.length-1].node).to(0.15, {position: this.ballList[this.ballList.length-1].getPositionInBottle()}).start();
    }

    checkCollide(posTouch : Vec3) : boolean
    {
        const ui = this.node.getComponent(UITransform)!;
        return ui.getBoundingBoxToWorld().contains(new Vec2(posTouch.x, posTouch.y));
    }

    update(deltaTime: number)
    {
        
    }
}
