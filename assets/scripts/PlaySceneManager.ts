import { _decorator, Component, Node, Prefab, Layout, instantiate, view, Vec3, UITransform, resources, JsonAsset, tween, Label, input, Input, EventKeyboard, KeyCode } from 'cc';
import { Ball } from './Ball';
import { Bottle } from './Bottle';
import { MoveData } from './MoveData';
import { GameEvent, EVENT_NAME } from './EventManager';
const { ccclass, property } = _decorator;

const SPACING_X = 20;
const SPACING_Y = 90;

export enum GAME_STATE 
{
    NORMAL,
    WIN,
    LOSE
}

@ccclass('PlaySceneManager')
export class PlaySceneManager extends Component 
{
    @property(Prefab)
    bottlePrefab : Prefab | null = null;

    @property(Node)
    winPopup : Node | null = null;

    @property(Label)
    textLevel : Label | null = null;

    private bottleList: Bottle[] = [];
    private bottleDataList : number[][] = [];
    private moveList : MoveData[] = [];
    private bottleSelect : Bottle;
    private bottleDes : Bottle;
    public scale : number = 1;
    public static instance: PlaySceneManager;
    private gameState: number = 1;
    private level: number = 1;

    onLoad(): void 
    {
        PlaySceneManager.instance = this;
        
    }

    onEnable()
    {
        GameEvent.on(EVENT_NAME.BOTTLE_FINISH,this.checkWin,this);
        GameEvent.on(EVENT_NAME.BOTTLE_CLICK,this.onBottleClick,this);
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        this.winPopup!.active = false;
    }

    onDisable()
    {
        GameEvent.on(EVENT_NAME.BOTTLE_FINISH,this.checkWin,this);
        GameEvent.off(EVENT_NAME.BOTTLE_CLICK,this.onBottleClick,this);
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        this.winPopup!.active = false;
    }

    async start() 
    {
        // Data
        this.bottleSelect = null;
        this.bottleDes = null;
        this.gameState = GAME_STATE.NORMAL;
        this.level = 526;
        this.initLevel();
    }

    private initLevel()
    {
        // text Level
        this.textLevel.string = "Level " + this.level;

        // load level
        resources.load('levels/' + this.level,JsonAsset,(err, jsonAsset) =>
        {
            if (err)
            {
                console.error(err);
                return;
            }
            const data = jsonAsset.json;
            const listBottle = data.listBottle;
            for(let i = 0; i < listBottle.length; i++)
            {
                let bottleData : number[] = []; 
                for(let j = 0; j < listBottle[i].listWater.length; j++)
                {
                    bottleData.push(listBottle[i].listWater[j]);
                }
                this.bottleDataList.push(bottleData);
            }
            this.initBottleList();
            console.log(data);
        });
    }

    private reset()
    {
        // Data
        this.bottleSelect = null;
        this.bottleDes = null;
        this.gameState = GAME_STATE.NORMAL;
        for (const bottle of this.bottleList) 
        {
            bottle.node.destroy();
        }
        this.bottleList.length = 0;
        this.bottleDataList = [];
        this.moveList = [];

        // Ui
        this.winPopup!.active = false;
    }

    private restartLevel()
    {
        this.reset();
        this.initLevel();
    }

    private nextLevel()
    {
        this.reset();
        this.initLevel();
    }

    private initBottleList()
    {
        // Scale
        let rowList = this.calculateBottleRowList(this.bottleDataList.length);
        let maxCol = rowList[0];
        let rowCount = rowList.length;
        const ui = this.bottlePrefab.data.getComponent(UITransform)!;
        const bottleWidth = ui.width;
        const bottleHeight = ui.height;
        const size = view.getVisibleSize();
        const layoutWidth = maxCol * bottleWidth +(maxCol + 1) * SPACING_X;
        const layoutHeight = rowCount * bottleHeight + (rowCount + 1) * SPACING_Y;
        const scaleX = size.width * 0.9 / layoutWidth;
        const scaleY = size.height * 0.75 / layoutHeight;
        this.scale = Math.min(1, scaleX, scaleY);

        // Data
        const spacingX = SPACING_X * this.scale;
        const spacingY = SPACING_Y * this.scale;
        const totalH = -rowCount * bottleHeight - (rowCount - 1) * spacingY;
        const startY = (totalH + bottleHeight) * 0.5;
        let bottleIndex = 0;

        // Bottle
        for (let row = 0; row < rowCount; row++)
        {
            const colCount = rowList[row];
            const totalW = colCount * bottleWidth + (colCount - 1) * spacingX;
            const startX = -(totalW - bottleWidth) * 0.5;
            for (let col = 0; col < colCount; col++)
            {
                let pos = new Vec3(startX + col * (bottleWidth + spacingX),startY + row * (bottleHeight + spacingY),0);
                this.spawnBottle(this.bottleDataList[bottleIndex], pos, this.scale);
                bottleIndex++;
            }
        }
    }

    setPosBottleList()
    {
        let rowList = this.calculateBottleRowList(this.bottleList.length);
        let maxCol = rowList[0];
        let rowCount = rowList.length;
        const ui = this.bottlePrefab.data.getComponent(UITransform)!;
        const bottleWidth = ui.width;
        const bottleHeight = ui.height;
        const size = view.getVisibleSize();
        const layoutWidth = maxCol * bottleWidth +(maxCol + 1) * SPACING_X;
        const layoutHeight = rowCount * bottleHeight + (rowCount + 1) * SPACING_Y;
        const scaleX = size.width * 0.9 / layoutWidth;
        const scaleY = size.height * 0.75 / layoutHeight;
        this.scale = Math.min(1, scaleX, scaleY);

        // Data
        const spacingX = SPACING_X * this.scale;
        const spacingY = SPACING_Y * this.scale;
        const totalH = -rowCount * bottleHeight - (rowCount - 1) * spacingY;
        const startY = (totalH + bottleHeight) * 0.5;
        let bottleIndex = 0;

        // Bottle
        for (let row = 0; row < rowCount; row++)
        {
            const colCount = rowList[row];
            const totalW = colCount * bottleWidth + (colCount - 1) * spacingX;
            const startX = -(totalW - bottleWidth) * 0.5;
            for (let col = 0; col < colCount; col++)
            {
                let pos = new Vec3(startX + col * (bottleWidth + spacingX),startY + row * (bottleHeight + spacingY),0);
                this.bottleList[bottleIndex].node.setPosition(pos);
                this.bottleList[bottleIndex].node.setScale(this.scale,this.scale,1);
                bottleIndex++;
            }
        }
    }

    private calculateBottleRowList(count: number): number[]
    {
        let row = Math.ceil(count / 7);
        let rowBottleCounts: number[] = [];
        const baseCount = Math.floor(count / row);
        const remain = count % row;
        for (let i = 0; i < row; i++)
        {
            rowBottleCounts.push(baseCount + (i < remain ? 1 : 0));
        }
        return rowBottleCounts;
    }

    public onBottleClick(bottle : Bottle)
    {
        // check
        if (this.gameState == GAME_STATE.WIN) return;

        // Check Touch
        if (!this.bottleSelect)
        {
            if (!bottle.isEmpty())
            {
                // Data
                this.bottleSelect = bottle;
                this.bottleSelect.select();
            }
            else
            {
                bottle.selectEmpty();
            }

        }
        else if (this.bottleSelect)
        {
            if (this.bottleSelect == bottle)
            {
                this.bottleSelect.unSelect();
                this.bottleSelect = null;
            }
            else if (!this.bottleDes)
            {
                if ((!bottle.isEmpty() && this.bottleSelect.getColorTop() === bottle.getColorTop() && !bottle.isFull()) || bottle.isEmpty())
                {
                    this.bottleDes = bottle;
                    this.moveBallToOtherBottle(this.bottleSelect, this.bottleDes);
                    this.bottleSelect.unSelect();
                    this.bottleSelect = null;
                    this.bottleDes = null;
                }
                else
                {
                    this.bottleSelect.unSelect();
                    this.bottleSelect = bottle;
                    this.bottleSelect.select();
                }
            }
        }
    }

    checkWin() : boolean
    {
        for(let i=0;i<this.bottleList.length;i++)
        {
            if(!this.bottleList[i].getIsFinished() && !this.bottleList[i].isEmpty()) return false;
        }
        this.gameState = GAME_STATE.WIN;
        this.level++;
        this.showWinEffect();
        return true;
    }

    public showWinEffect() 
    {
        this.winPopup!.active = true;
        this.winPopup.setSiblingIndex(999);
    }

    moveBallToOtherBottle(bottleFrom : Bottle, bottleTo : Bottle)
    {
        // Move
        let countBallPush = 0;
        if (bottleFrom.getCountColorLikeTop() <= bottleTo.getBallCanPush()) countBallPush = bottleFrom.getCountColorLikeTop();
        else countBallPush = bottleTo.getBallCanPush();
        bottleFrom.moveBall(countBallPush, bottleTo);
        bottleTo.setIsReceive(true);

        // Move Data
        let move : MoveData;
        this.moveList.push({bottleStart: bottleFrom, bottleDes: bottleTo, countBall: countBallPush});
    }

    revertMove()
    {
        if (this.moveList.length == 0) return;
        const move = this.moveList.pop();
        for(let i =0; i<move.countBall;i++)
        {
            let ball = move.bottleDes.popBall();
            move.bottleStart.pushBall(ball)
            ball.setCurBottle(move.bottleStart);
            ball.node.setParent(move.bottleStart.node);
            ball.setPositioninBottle();
        }
    }

    boosterAddBottle()
    {
        this.spawnBottle([], new Vec3(0,0,0), this.scale);
        this.setPosBottleList();
    }

    findMove()
    {
        let bottleTopMax = this.bottleList[0];
        let bottleEmpty = null;
        let bottleFrom = null;
        let bottleTo = null;
        for (let i = 0; i < this.bottleList.length; i++) 
        {
            if(!this.bottleList[i].isEmpty())
            {
                if (this.bottleList[i].getCountColorLikeTop() > bottleTopMax.getCountColorLikeTop()) bottleTopMax = this.bottleList[i];
                for (let j = 0; j < this.bottleList.length; j++) 
                {
                    if(this.bottleList[i] != this.bottleList[j] && !this.bottleList[j].isFull() && this.bottleList[i].getColorTop() == this.bottleList[j].getColorTop())
                    {
                        let bottleFrom = this.bottleList[i];
                        let bottleTo = this.bottleList[j];
                        break;
                    }
                    if (bottleEmpty == null && this.bottleList[j].isEmpty())
                    {
                        bottleEmpty = this.bottleList[j];
                    }
                }
            }
            if (bottleFrom && bottleTo) break;
        }

        if (bottleFrom && bottleTo) this.moveBallToOtherBottle(bottleFrom, bottleTo);
        if (bottleEmpty && !bottleFrom && !bottleTo) this.moveBallToOtherBottle(bottleTopMax, bottleEmpty);
    }

    spawnBottle(colorList : number[], pos : Vec3, scale : number)
    {
        const bottleNode = instantiate(this.bottlePrefab);
        bottleNode.parent = this.node;
        const bottle = bottleNode.getComponent(Bottle)!;
        this.bottleList.push(bottle);
        bottle.initBottle(colorList, pos, scale);
    }

    private onKeyDown(event: EventKeyboard) 
    {
        switch (event.keyCode) {

            case KeyCode.KEY_R:
                this.restartLevel();
                break;

        }
    }

    update(deltaTime: number) 
    {
        
    }
}


