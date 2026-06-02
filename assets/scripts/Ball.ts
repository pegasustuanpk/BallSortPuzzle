import { _decorator, Component, Node, Sprite, Vec3, resources, SpriteFrame, UITransform, tween } from 'cc';
import { Bottle } from './Bottle';
const { ccclass, property } = _decorator;

const TIME_MOVE = 0.15;

@ccclass('Ball')
export class Ball extends Component 
{
    @property(Sprite)
    sprite :Sprite | null=null;

    private width = 1;
    private height = 1;
    private index : number = 1;
    curBottle : Bottle | null = null;
    public color : number = 1;

    ball(color : number, index : number,curBottle : Bottle)
    {
        this.color = color;
        this.index = index;
        this.curBottle = curBottle;
        this.width = this.node.getComponent(UITransform).contentSize.width;
        this.height = this.node.getComponent(UITransform).contentSize.height;
        this.node.setPosition(this.getPositionInBottle());
        resources.load('item/ball/Ball'+ color + '/spriteFrame', SpriteFrame,(err, sf) => {this.sprite.spriteFrame = sf;});
    }

    getPositionInBottle() : Vec3
    {
        if (!this.curBottle) return;
        let bottlePos = this.curBottle.node.getPosition();
        let Y = bottlePos.y - this.curBottle.getHeight()/2 + this.index*this.height + this.height/2 + 15;
        return new Vec3(bottlePos.x, Y, bottlePos.z);
    }
    
    getPosition() : Vec3
    {
        return this.node.getPosition();
    }

    moveBottle(newBottle : Bottle, delay : number = 0)
    {
        // Data
        let CurDis = this.calculateDistance(this.getPosition(), this.curBottle.getPosTop());
        let TotalDis = this.calculateDistance(this.getPositionInBottle(), this.curBottle.getPosTop());
        let timeMoveStart = TIME_MOVE*(CurDis/TotalDis);
        let OldBottle = this.curBottle;
        this.curBottle = newBottle;
        this.curBottle.pushBall(this);
        this.index = this.curBottle.getLengthBallList()-1;
        
        // Tween
        let delayTime = delay*TIME_MOVE;
        tween(this.node).stop();
        tween(this.node)
        .delay(delayTime)
        .to(timeMoveStart, {position : OldBottle.getPosTop()})
        .to(TIME_MOVE, {position : this.curBottle.getPosTop()})
        .to(TIME_MOVE, {position: this.getPositionInBottle()})
        .start();
    }

    calculateDistance(start : Vec3, end : Vec3) : number
    {
        const distance = Vec3.subtract(new Vec3(),start,end).length();
        return distance;
    }

    start()
    {

    }

    update(deltaTime: number) 
    {
        
    }
}
