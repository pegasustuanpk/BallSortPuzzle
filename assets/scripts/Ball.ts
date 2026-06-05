import { _decorator, Component, Node, Sprite, Vec3, resources, SpriteFrame, UITransform, tween, Tween } from 'cc';
import { Bottle } from './Bottle';
import { PlaySceneManager } from './PlaySceneManager';
const { ccclass, property } = _decorator;

export const SPEED_BALL_MOVE = 1600;

@ccclass('Ball')
export class Ball extends Component 
{
    @property(Sprite)
    sprite :Sprite | null=null;

    private width = 1;
    private height = 1;
    private curBottle : Bottle | null = null;
    public index : number = 1;
    public color : number = 1;

    initBall(color:number, index:number, curBottle:Bottle)
    {
        this.color = color;
        this.index = index;
        this.curBottle = curBottle;
        this.node.setParent(curBottle.node);
        this.width = this.node.getComponent(UITransform).contentSize.width*PlaySceneManager.instance.scale;
        this.height = this.node.getComponent(UITransform).contentSize.height*PlaySceneManager.instance.scale;
        this.setPositioninBottle();
        resources.load('item/ball/Ball'+ color + '/spriteFrame', SpriteFrame,(err, sf) => {this.sprite.spriteFrame = sf;});
    }

    getPositionInBottle() : Vec3
    {
        if (!this.curBottle) return;
        let bottlePos = this.curBottle.node.getWorldPosition();
        let Y = bottlePos.y - this.curBottle.getHeight()/2 + this.index*this.height + this.height/2 + 15*PlaySceneManager.instance.scale;
        return new Vec3(bottlePos.x, Y, 0);
    }

    setCurBottle(bottle : Bottle)
    {
        this.curBottle = bottle;
    }

    setPositioninBottle()
    {
        this.node.setWorldPosition(this.getPositionInBottle());
    }

    public setlect()
    {
        let curDis = this.calculateDistance(this.node.getWorldPosition(), this.curBottle.getPosTop());
        let timeMove = curDis/(SPEED_BALL_MOVE*PlaySceneManager.instance.scale)
        tween(this.node).to(timeMove, {worldPosition: this.curBottle.getPosTop()}).start();
        tween(this.node)
        .to(timeMove, {scale: new Vec3(0.9, 1.1, 1)})
        .to(0.01,{scale: new Vec3(1, 1, 1)})
        .start();
    }

    public unSelect()
    {
        let curDis = this.calculateDistance(this.node.getWorldPosition(), this.getPositionInBottle());
        let timeMove = curDis/(SPEED_BALL_MOVE*PlaySceneManager.instance.scale)
        tween(this.node).to(timeMove, {worldPosition: this.getPositionInBottle()}).start();
        tween(this.node)
        .to(timeMove, {scale: new Vec3(0.9, 1.1, 1)})
        .to(0.01,{scale: new Vec3(1, 1, 1)})
        .start();
    }

    changeBottle(newBottle:Bottle, delayTime:number, isLast:boolean) : number
    {
        // Data
        let oldBottle = this.curBottle;
        this.curBottle = newBottle;
        this.curBottle.pushBall(this);

        // Time move
        const startPos = this.node.worldPosition.clone();
        const oldTop = oldBottle.getPosTop();
        const newTop = this.curBottle.getPosTop();
        const endPos = this.getPositionInBottle();
        let speed = SPEED_BALL_MOVE * PlaySceneManager.instance.scale;
        const timeUp = Vec3.distance(startPos, oldTop) / speed;
        const timeHorizontal = Vec3.distance(oldTop, newTop) / speed;
        const timeDown = Vec3.distance(newTop, endPos) / speed;
        
        // Tween move
        Tween.stopAllByTarget(this.node);
        tween(this.node)
        .delay(delayTime)
        .to(timeUp, {worldPosition : oldBottle.getPosTop()})
        .call(() =>{
            const worldPos = this.node.worldPosition.clone();
            this.node.setParent(PlaySceneManager.instance.node);
            this.node.setScale(PlaySceneManager.instance.scale,PlaySceneManager.instance.scale,1);
            this.node.setWorldPosition(worldPos);
            this.node.setSiblingIndex(999);
        })
        .to(timeHorizontal, {worldPosition : this.curBottle.getPosTop()})
        .call(() =>{
            const worldPos = this.node.worldPosition.clone();
            this.node.setParent(this.curBottle.node);
            this.node.setScale(1,1,1);
            this.node.setWorldPosition(worldPos);
            this.node.setSiblingIndex(this.index);
        })
        .to(timeDown, {worldPosition: this.getPositionInBottle()})
        .call(() =>{if (isLast) this.curBottle.setIsReceive(false)})
        .start();

        // Scale Tween
        const scaleBase = PlaySceneManager.instance.scale;
        const scaleUp = this.getStretchScale(startPos,oldTop,0.2);
        const scaleHorizontal = this.getStretchScale(oldTop,newTop,0.25).multiplyScalar(scaleBase);
        const scaleDown = this.getStretchScale(newTop,endPos,0.15);
        const scaleNormal = new Vec3(1,1,1);

        tween(this.node)
            .delay(delayTime)
            .to(timeUp * 0.5, {scale: scaleUp})
            .to(timeUp * 0.5, {scale: scaleNormal})
            .to(timeHorizontal * 0.5, {scale: scaleHorizontal})
            .to(timeHorizontal * 0.5, {scale: scaleNormal})
            .to(timeDown * 0.5, {scale: scaleDown})
            .to(timeDown * 0.5, {scale: scaleNormal})
            .to(0.08, {scale: new Vec3(scaleBase * 1.15,scaleBase * 0.85,1)})
            .to(0.08, {scale: scaleNormal})
            .start();

        // Return Time Start
        return timeUp + delayTime;
    }

    private getStretchScale(from: Vec3,to: Vec3,amount: number = 0.2): Vec3 
    {
        const dir = to.clone().subtract(from).normalize();
        const absX = Math.abs(dir.x);
        const absY = Math.abs(dir.y);
        return new Vec3(1 + absX * amount - absY * amount,1 + absY * amount - absX * amount,1);
    }

    calculateDistance(start : Vec3, end : Vec3) : number
    {
        return Vec3.subtract(new Vec3(),start,end).length();
    }

    start()
    {
    }

    update(deltaTime: number) 
    {
        
    }
}
