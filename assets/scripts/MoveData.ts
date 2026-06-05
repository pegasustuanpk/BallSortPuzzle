import { _decorator, Component, Node } from 'cc';
import { Bottle } from './Bottle';
const { ccclass, property } = _decorator;

export interface MoveData 
{
    bottleStart: Bottle;
    bottleDes: Bottle;
    countBall: number;
}
