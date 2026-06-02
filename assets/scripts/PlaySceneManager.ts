import { _decorator, Component, Node, Prefab, instantiate, Vec3, input, Input, EventTouch, EventMouse, Camera  } from 'cc';
import { Ball } from './Ball';
import { Bottle } from './Bottle';
const { ccclass, property } = _decorator;

@ccclass('PlaySceneManager')
export class PlaySceneManager extends Component 
{
    @property(Prefab)
    ballPrefab : Prefab | null = null;

    @property(Prefab)
    bottlePrefab : Prefab | null = null;

    @property(Camera)
    camera : Camera | null = null;

    private bottleList: Bottle[] = [];
    private bottleSelect : Bottle;
    private bottleDes : Bottle;
    private scale : number = 1;

    start() 
    {
        // Event
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);

        // Data
        this.bottleSelect = null;
        this.bottleDes = null;

        // Bottle
        let colorList1 : number[] = [1,2,3];
        let colorList2 : number[] = [1,1,1];
        let colorList3 : number[] = [1];
        this.spawnBottle(colorList1, new Vec3(-150, 0, 0));
        this.spawnBottle(colorList2, new Vec3(0, 0, 0));
        this.spawnBottle(colorList3, new Vec3(150, 0, 0));
    }

    onTouchStart(event : EventTouch)
    {
        // Convert Pos
        const PosTouch = new Vec3(event.getLocationX(), event.getLocationY(), 0);
        const worldPos = this.camera.screenToWorld(new Vec3(PosTouch.x,PosTouch.y,0));

        // Check Touch
        for(let i =0;i<this.bottleList.length;i++)
        {
            if(this.bottleList[i].checkCollide(worldPos))
            {
                if (!this.bottleSelect && !this.bottleList[i].isEmpty())
                {
                    // Debug
                    console.log("Click");

                    // Data
                    this.bottleSelect = this.bottleList[i];
                    this.bottleSelect.select();
                }
                else if (this.bottleSelect)
                {
                    if (this.bottleSelect == this.bottleList[i])
                    {
                        this.bottleSelect.unSelect();
                        this.bottleSelect = null;
                    }
                    else if (!this.bottleDes)
                    {
                        if ((this.bottleSelect.getColorTop() === this.bottleList[i].getColorTop() && !this.bottleList[i].isFull()) || this.bottleList[i].isEmpty())
                        {
                            this.bottleDes = this.bottleList[i];
                            this.Move();
                            this.bottleSelect.unSelect();
                            this.bottleSelect = null;
                            this.bottleDes = null;
                        }
                        else
                        {
                            this.bottleSelect.unSelect();
                            this.bottleSelect = this.bottleList[i];
                            this.bottleSelect.select();
                        }
                    }
                }
            }
        }
    }

    Move()
    {
        if (this.bottleSelect.getCountColorLikeTop() <= this.bottleDes.getBallCanPush()) this.bottleSelect.moveBall(this.bottleSelect.getCountColorLikeTop(), this.bottleDes);
        else  this.bottleSelect.moveBall(this.bottleDes.getBallCanPush(), this.bottleDes);
    }

    spawnBottle(colorList : number[], Pos : Vec3)
    {
        const bottleNode = instantiate(this.bottlePrefab);
        bottleNode.parent = this.node;
        const bottle = bottleNode.getComponent(Bottle)!;
        bottle.bottle(colorList, Pos);
        this.bottleList.push(bottle);
    }

    update(deltaTime: number) 
    {
        
    }
}


