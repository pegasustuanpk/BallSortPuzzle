import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

import { EventTarget } from 'cc';

export const GameEvent = new EventTarget();

export const EVENT_NAME = {
    BOTTLE_CLICK: "BOTTLE_CLICK",
    BOTTLE_FINISH: "BOTTLE_FINISH",
};
