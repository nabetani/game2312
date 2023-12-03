import * as Phaser from 'phaser';
import { BaseScene, Audio } from './baseScene';
import { Model } from './model';

type Phase = StartPhase;

class StartPhase {
  scene: GameMain;
  constructor(scene: GameMain) {
    this.scene = scene;
  }
  progress(): Phase {
    return this
  }
}

export class GameMain extends BaseScene {
  model: Model = new Model()
  phase: Phase = new StartPhase(this)

  constructor() { super("GameMain") }
  preload() {
    this.loadImages({
      bg: "bg.webp",
    });
  }
  create() {
    console.log("create GameMain")
    this.add.image(...this.canXY(0.5), 'bg');
  }
  update() {
    this.phase = this.phase.progress();
  }
}
