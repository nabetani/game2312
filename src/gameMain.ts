import * as Phaser from 'phaser';
import { BaseScene, Audio } from './baseScene';
import { Model } from './model';

/*
 縦スクロール
 カエルジャンプ
 ジャンプする距離は、ボタンによる
 ジャンプする方向は、ボタンの向き
 ボタンはずっと向きを変えつづける。
 ボタンをクリックするとジャンプと同時にボタンが消滅。消滅分はすぐに供給される。
 カエルが着地した 蓮の葉（？）は、時間切れで水没。
 距離がスコア。
 */


type Phase = StartPhase | GamePhase;

class StartPhase {
  scene: GameMain;
  constructor(scene: GameMain) {
    this.scene = scene;
  }
  progress(): Phase {
    return new GamePhase(this.scene);
  }
}

class GamePhase {
  scene: GameMain;
  constructor(scene: GameMain) {
    this.scene = scene;
  }
  progress(): Phase {
    this.scene.updateArrows();
    this.scene.updatePlayer();
    return this
  }
}

export class GameMain extends BaseScene {
  model: Model = new Model()
  phase: Phase = new StartPhase(this)
  arrows: Phaser.GameObjects.Sprite[] = [];
  lotuses: Phaser.GameObjects.Sprite[] = [];

  constructor() { super("GameMain") }
  preload() {
    this.loadImages({
      bg: "bg.webp",
      arrow: "arrow.webp",
      p0: "p0.webp",
      p1: "p1.webp",
      lotus: "lotus.webp",
    });
  }
  create() {
    console.log("create GameMain")
    this.add.image(...this.canXY(0.5), 'bg');
    for (let i = 0; i < 8; i++) {
      const x = ((i % 4) * 2 + 1) * 512 / 8;
      const y = 800 - Math.floor(i / 4) * 120;
      const s = this.add.sprite(x, y, "arrow");
      this.arrows.push(s);
      s.on('pointerdown', () => { this.model.arrowClick(i); }).setInteractive();
    }
    this.addSprite(-100, -100, "p0", "p0");
  }
  updatePlayer() {
    const m = this.model;
    m.updatePlayer();
    const p = m.player;
    this.sprites.p0.setPosition(p.pos.x, p.pos.y);
    this.sprites.p0.setAngle(p.angle);
    this.sprites.p0.setScale(Math.max(0, p.z / 5) + 1);
  }

  updateLotuses() {
    const m = this.model;
    const lotus = this.sprites.lotus;
    m.updateLotuses();
    for (let i = 0; i < m.lotuses.length; i++) {
      const o = this.model.lotuses[i];
      const s = this.lotuses.length <= i
        ? this.add.sprite(o.pos().x, o.pos().y, "lotus")
        : this.lotuses[i];
      if (o.life() <= 0) {
      } else {
        s.setScale(o.scale());
        s.setPosition(o.pos().x, o.pos().y);
        if (o.life() < 1) {
          s.getBounds();
        }
      }
    }
  }

  updateArrows() {
    this.model.updateArrows();
    for (let i = 0; i < this.model.arrowsX.length; i++) {
      this.arrows[i].setAngle(this.model.arrowAngle(i));
    }

  }
  update() {
    this.phase = this.phase.progress();
  }
}
