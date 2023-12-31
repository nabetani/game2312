import * as Phaser from 'phaser';
import { BaseScene, Audio } from './baseScene';
import { Model, Lotus } from './model';

type Phase = StartPhase | GamePhase | GameOverPhase;

const ZP = 1.12; // ジャンプや落下の拡大縮小係数
const PY = 500; // プレイヤーの表示 Y 座標
const GAGE_COUNT = 30;
const ARROW_COUNT = 3;

const formatNnumber = (v: number, len: integer, k: integer): string => {
  const b = Math.pow(10, k);
  let deca = Math.round(v * b);
  let f = deca % b;
  let fs = ("0".repeat(k) + `${f}`).slice(-k);
  let i = (deca - f) / 100;
  return (" ".repeat(len) + `${i}.${fs}`).slice(-len);
}

class GameOverPhase {
  scene: GameMain;
  tick: integer = 0;
  constructor(scene: GameMain) {
    this.scene = scene;
    this.scene.showGameOver()
  }
  progress(): Phase {
    ++this.tick;
    return this.tick < 120 ? this : new WaitRestartPhase(this.scene);
  }
}

class WaitRestartPhase {
  scene: GameMain;
  constructor(scene: GameMain) {
    this.scene = scene;
    this.scene.showRestart()
  }
  progress(): Phase {
    return this;
  }
}

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
  tick: integer = 0;
  constructor(scene: GameMain) {
    this.scene = scene;
    this.scene.startGame();
  }
  progress(): Phase {
    ++this.tick;
    this.scene.countDown(this.tick);
    this.scene.updateArrows(this.tick);
    this.scene.updatePlayer();
    this.scene.updateLotuses();
    this.scene.updateBG();
    return this.scene.isGameOver ? new GameOverPhase(this.scene) : this
  }
}

const depth = {
  "bg": 0,
  "fallingL": 10,
  "fallingP": 11,
  "lotus": 20,
  "gage": 21,
  "arrow": 30,
  "player": 100,
  "text": 200,
};

class Texts {
  gameOver: Phaser.GameObjects.Text | null = null;
  restart: Phaser.GameObjects.Text | null = null;
  countDown: Phaser.GameObjects.Text | null = null;
  record: Phaser.GameObjects.Text | null = null;
  static P = 1;
  static G = 2;
  static W = 4;

  create(g: GameMain) {
    this.gameOver = g.addText(
      ' Game Over ',
      g.canX(0.5), g.canY(0.4), 0.5, { fontSize: "70px", fontStyle: "bold", color: "white" });

    this.restart = g.addText(
      '\n   Click here to start game.   \n',
      g.canX(0.5), g.canY(0.6), 0.5, { fontSize: "33px", fontStyle: "bold", backgroundColor: "#fff8" });

    this.countDown = g.addText(
      '',
      g.canX(0.5), g.canY(0.2), 0.5, { fontSize: "80px", fontStyle: "bold", backgroundColor: "black", color: "white" });
    this.record = g.addText(
      "hoge",
      10, 10, 0, { fontFamily: "monospace", fontSize: "33px", color: "white", align: "right", backgroundColor: "#0006", padding: { x: 10, y: 10 } })
    this.record.setOrigin(0, 0);
  }

  textType(n: string): integer {
    return {
      "gameOver": Texts.G | Texts.W,
      "restart": Texts.W,
      "countDown": Texts.P,
      "record": Texts.P | Texts.G | Texts.W,
    }[n] || 0;
  }
  showTexts(sw: integer) {
    for (const [k, v] of Object.entries(this)) {
      const s = !!(this.textType(k) & sw);
      console.log({ sw: sw, v: v, k: k, t: this.textType(k), s: s })
      v?.setVisible(s);
      v?.setDepth(depth.text);

    }
  }
  setPlaying() {
    this.showTexts(Texts.P);
  }
  setGameOver() {
    this.showTexts(Texts.G);
  }
  setWaitRestart() {
    this.showTexts(Texts.W);
  }
}

export class GameMain extends BaseScene {
  model: Model;
  phase: Phase = new StartPhase(this)
  arrows: Phaser.GameObjects.Sprite[] = [];
  gages: Phaser.GameObjects.Sprite[] = [];
  lotuses: Phaser.GameObjects.Sprite[] = [];
  bg: Phaser.GameObjects.Image | null = null;
  texts: Texts = new Texts();
  resText: string = "";
  constructor() {
    super("GameMain")
    this.model = new Model()
  }
  preload() {
    this.loadImages({
      bg: "bg.webp",
      arrow: "arrow.webp",
      p0: "p0.webp",
      p1: "p1.webp",
      lotus: "lotus.webp",
      gage: "lotus.webp",
    });
  }
  setPlayable(p: boolean) {
    for (let i = 0; i < ARROW_COUNT; i++) {
      const a = this.arrows[i];
      if (p) {
        a.on('pointerdown', () => { this.model.arrowClick(i); });
        this.model.player.pos.y = 400 - 1900;
        this.model.player.pos.x = 100;
      } else {
        a.removeAllListeners();
      }
    }
  }
  create() {
    console.log("create GameMain")
    this.bg = this.add.image(this.canX(0.5), 0, 'bg').setDepth(depth.bg).setOrigin(0.5, 1);
    for (let i = 0; i < ARROW_COUNT; i++) {
      const x = (i * 2 + 1) * 512 / (ARROW_COUNT * 2);
      const y = 800;
      const s = this.add.sprite(x, y, "arrow").setDepth(depth.arrow);
      s.setScale(1.5 * Math.pow(0.6, ARROW_COUNT - 1 - i));
      this.arrows.push(s);
      s.setInteractive();
    }
    for (let i = 0; i < GAGE_COUNT; ++i) {
      const s = this.add.sprite(0, 0, "gage").setDepth(depth.gage);;
      s.setScale(1 / 8);
      this.gages.push(s);
    }
    this.addSprite(-100, -100, "p0", "p0")
    this.sprites.p0.setDepth(depth.player);
    this.texts.create(this);
    this.texts.restart!.on('pointerdown', () => this.onRestart()).setInteractive();
  }
  onRestart() {
    this.phase = new GamePhase(this);
  }
  get isGameOver() {
    return this.model.player.z < -40;
  }
  showGameOver() {
    this.texts.setGameOver();
  }
  showRestart() {
    this.texts.setWaitRestart();
  }
  startGame() {
    this.texts.setPlaying();
    this.setPlayable(false);
    this.model = new Model();
  }

  setRecord(s: number) {
    const p = (550 - this.model.player.pos.y) / 200;
    const t = formatNnumber(s, 7, 2) + " s";
    const d = formatNnumber(p, 6, 2) + " m";
    this.resText = `${t} / ${d}`
    this.texts.record?.setText(`${t}  ${d}`);
  }

  countDown(n: integer) {
    const secF = n / this.fps();
    const secI = Math.floor(secF);
    const texts = ["3", "2", "1", "GO!"];
    if (secI == 3) {
      this.setPlayable(true);
    }
    this.setRecord(Math.max(0, secF - 3));
    if (texts.length <= secI) {
      this.texts.countDown?.setVisible(false);
      return
    };
    const show = secI < 3 ? secF - secI < 0.5 : true;
    const text = show ? texts[secI] : "";
    this.texts.countDown?.setVisible(show);
    const spaces = " ".repeat(20);
    this.texts.countDown?.setText(spaces + text + spaces);
  }

  updatePlayer() {
    const m = this.model;
    m.updateWorld();
    const p = m.player;
    const sp = this.sprites.p0
    sp.setPosition(p.pos.x, this.dispPosY(m, p.pos.y));
    sp.setAngle(p.angle);
    sp.setScale(Math.pow(ZP, p.z));
    sp.setDepth(0 <= p.z ? depth.player : depth.fallingP);
  }

  drawLotusGauge(lotus: Lotus | null) {
    const r = lotus?.radius;
    const p = lotus ? this.dispPos(this.model, lotus.pos) : null;
    for (let i = 0; i < GAGE_COUNT; ++i) {
      const g = this.gages[i];
      if (lotus && 0 <= lotus.z && lotus.life < i / GAGE_COUNT) {
        const t = i * Math.PI * 2 / GAGE_COUNT;
        const x = p!.x + r! * Math.cos(t);
        const y = p!.y + r! * Math.sin(t);
        g.setPosition(x, y);
        g.setVisible(true);
      } else {
        g.setVisible(false);
      }
    }
  }

  dispPosY(m: Model, y: number): number {
    const y0 = Math.max(-2800, m.player.pos.y);
    return y + PY - y0;
  }

  dispPos(m: Model, p: Phaser.Math.Vector2): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(p.x, this.dispPosY(m, p.y));
  }

  updateBG() {
    this.bg?.setPosition(256, this.dispPosY(this.model, 1000));
  }

  updateLotuses() {
    const m = this.model;
    this.drawLotusGauge(m.lotusPlayerIsOn);
    for (let i = 0; i < m.lotuses.length; i++) {
      const o = this.model.lotuses[i];
      if (this.lotuses.length <= i) {
        this.lotuses.push(this.add.sprite(o.pos.x, this.dispPosY(m, o.pos.y), "lotus").setDepth(depth.lotus));
      }
      const s = this.lotuses[i];
      s.setScale(o.scale * Math.pow(ZP, o.z));
      s.setPosition(o.pos.x, this.dispPosY(m, o.pos.y));
      s.setDepth(0 <= o.z ? depth.lotus : depth.fallingL);
    }
  }

  updateArrows(tick: integer) {
    this.model.updateArrows(tick);
    for (let i = 0; i < this.model.arrowsX.length; i++) {
      this.arrows[i].setAngle(this.model.arrowAngle(i));
    }

  }
  update() {
    this.phase = this.phase.progress();
  }
}
