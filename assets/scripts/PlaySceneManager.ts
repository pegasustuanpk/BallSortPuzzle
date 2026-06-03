import { _decorator, Component, Node, Prefab, Layout, instantiate, view, Vec3, UITransform, resources, JsonAsset } from 'cc';
import { Ball } from './Ball';
import { Bottle } from './Bottle';
const { ccclass, property } = _decorator;

const SPACING_X = 20;
const SPACING_Y = 90;

@ccclass('PlaySceneManager')
export class PlaySceneManager extends Component 
{
    @property(Prefab)
    bottlePrefab : Prefab | null = null;

    private bottleList: Bottle[] = [];
    private bottleDataList : number[][] = [];
    private bottleSelect : Bottle;
    private bottleDes : Bottle;
    public scale : number = 1;
    public static instance: PlaySceneManager;

    onLoad(): void 
    {
        PlaySceneManager.instance = this;
    }

    async start() 
    {
        // Data
        this.bottleSelect = null;
        this.bottleDes = null;

        // load level
        resources.load('level/526',JsonAsset,(err, jsonAsset) =>
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
            this.init();
            console.log(data);
        });
    }

    private init()
    {
        // Find Col/row
        let rowList = this.calculateBottleRowList(this.bottleDataList.length);
        let maxCol = rowList[0];
        let rowCount = rowList.length;

        // Scale
        const ui = this.bottlePrefab.data.getComponent(UITransform)!;
        const bottleWidth = ui.width;
        const bottleHeight = ui.height;
        const size = view.getVisibleSize();
        const layoutWidth = maxCol * bottleWidth +(maxCol + 1) * SPACING_X;
        const layoutHeight = rowCount * bottleHeight + (rowCount + 1) * SPACING_Y;
        const scaleX = size.width * 0.9 / layoutWidth;
        const scaleY = size.height * 0.8 / layoutHeight;
        this.scale = Math.min(1, scaleX, scaleY);

        // Bottle
        this.initBottle(rowList, bottleWidth*this.scale, bottleHeight*this.scale);
    }

    private initBottle(rowList : number[], bottleWidth : number, bottleHeight : number)
    {
        // Data
        const ui = this.bottlePrefab.data.getComponent(UITransform)!;
        const spacingX = SPACING_X * this.scale;
        const spacingY = SPACING_Y * this.scale;
        const rowCount = rowList.length;
        const totalH = -rowCount * bottleHeight - (rowCount - 1) * spacingY;
        const startY = (totalH + bottleHeight) * 0.5;
        let bottleIndex = 0;

        // set Pos
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
                    this.moveBallToOtherBottle();
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

    moveBallToOtherBottle()
    {
        if (this.bottleSelect.getCountColorLikeTop() <= this.bottleDes.getBallCanPush()) this.bottleSelect.moveBall(this.bottleSelect.getCountColorLikeTop(), this.bottleDes);
        else  this.bottleSelect.moveBall(this.bottleDes.getBallCanPush(), this.bottleDes);
        this.bottleDes.setIsReceive(true);
    }

    spawnBottle(colorList : number[], pos : Vec3, scale : number)
    {
        const bottleNode = instantiate(this.bottlePrefab);
        bottleNode.parent = this.node;
        const bottle = bottleNode.getComponent(Bottle)!;
        this.bottleList.push(bottle);
        bottle.bottle(colorList, pos, scale);
    }

    update(deltaTime: number) 
    {
        
    }
}


