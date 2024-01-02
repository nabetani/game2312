import * as Phaser from 'phaser';
import { BaseScene, Audio } from './baseScene';
import { Model, Lotus } from './model';

type Phase = StartPhase | GamePhase | GameOverPhase;

const ZP = 1.12; // ジャンプや落下の拡大縮小係数
const PY = 500; // プレイヤーの表示 Y 座標
const GAGE_COUNT = 30;
const ARROW_COUNT = 6;

const formatNnumber = (v: number, len: integer, k: integer): string => {
  const b = Math.pow(10, k);
  let deca = Math.round(v * b);
  let f = deca % b;
  let fs = ("0".repeat(k) + `${f}`).slice(-k);
  let i = (deca - f) / 100;
  return (" ".repeat(len) + `${i}.${fs}`).slice(-len);
}

const ranks = [
  { t: 240, n: "Apprentice" },
  { t: 120, n: "Good Player" },
  { t: 90, n: "Very Good Player" },
  { t: 60, n: "Expert Player" },
  { t: 40, n: "Advanced Player" },
  { t: 30, n: "Incredible Player" },
  { t: 25, n: "Master" },
  { t: 20, n: "Hero" },
  { t: 15, n: "Super Hero" },
  { t: 0, n: "Beyond Human Being" },
];

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
    if (this.scene.model.started) {
      ++this.tick;
    }
    this.scene.updateArrows();
    this.scene.updatePlayer(this.tick);
    this.scene.updateLotuses();
    this.scene.updateBG();
    this.scene.updateRecord(this.tick);
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
  "gameOverUI": 200,
};

class Texts {
  gameOver: Phaser.GameObjects.Text | null = null;
  restart: Phaser.GameObjects.Text | null = null;
  record: Phaser.GameObjects.Text | null = null;
  rankHead: Phaser.GameObjects.Text | null = null;
  rank: Phaser.GameObjects.Text | null = null;
  static P = 1;
  static G = 2;
  static W = 4;
  static R = 8;

  create(g: GameMain) {
    this.gameOver = g.addText(
      ' Game Over ',
      g.canX(0.5), g.canY(0.4), 0.5, { fontSize: "45px", fontStyle: "bold", color: "white" });

    this.rankHead = g.addText(
      'Your class is',
      g.canX(0.5), g.canY(0.5), 0.5, { fontSize: "33px", color: "white" });
    this.rank = g.addText(
      '',
      g.canX(0.5), g.canY(0.55), 0.5, { fontSize: "40px", fontStyle: "bold", color: "white" });

    this.restart = g.addText(
      '\n   Click here to try again   \n',
      g.canX(0.5), g.canY(0.75), 0.5, { fontSize: "33px", fontStyle: "bold", backgroundColor: "#fff8" });

    this.record = g.addText(
      "hoge",
      10, 10, 0, { fontFamily: "monospace", fontSize: "33px", color: "white", align: "right", backgroundColor: "#0006", padding: { x: 10, y: 10 } })
    this.record.setOrigin(0, 0);
  }

  textType(n: string): integer {
    return {
      "gameOver": Texts.G | Texts.W,
      "restart": Texts.W,
      "rankHead": Texts.R,
      "rank": Texts.R,
      "record": Texts.P | Texts.G | Texts.W,
    }[n] || 0;
  }
  showTexts(sw: integer) {
    for (const [k, v] of Object.entries(this)) {
      const s = !!(this.textType(k) & sw);
      // console.log({ sw: sw, v: v, k: k, t: this.textType(k), s: s })
      v?.setVisible(s);
      v?.setDepth(depth.text);

    }
  }
  setPlaying() {
    this.showTexts(Texts.P);
  }
  setGameOver(showRank: boolean) {
    this.showTexts(Texts.G | (showRank ? Texts.R : 0));
  }
  setWaitRestart(showRank: boolean) {
    this.showTexts(Texts.W | (showRank ? Texts.R : 0));
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
  resTime: number | null = null;
  constructor() {
    super("GameMain")
    this.model = new Model()
  }
  preload() {
    this.loadImages({
      bg: "bg.webp",
      arrow: "arrow.webp",
      p0: "p0.webp",
      pjump0: "pjump0.webp",
      pjump1: "pjump1.webp",
      lotus: "lotus.webp",
      gage: "lotus.webp",
      share: "share.webp",
    });
    this.loadAudios({
      bgm: "bgm.m4a"
    });
  }
  setPlayable(p: boolean) {
    for (let i = 0; i < ARROW_COUNT; i++) {
      const a = this.arrows[i];
      if (p) {
        a.on('pointerdown', () => { this.model.arrowClick(i); });
        // DEBUG CODE
        // this.model.player.pos.y = 400 - 1900;
        // this.model.player.pos.x = 100;
      } else {
        a.removeAllListeners();
      }
    }
  }
  createArrows() {
    const R = 0.6;
    const rsum = (1 + R * (1 + R)) * 2;
    const ratio = this.sys.game.canvas.width / rsum;
    let x = 0;
    const y = 800;
    for (let i = 0; i < ARROW_COUNT; i++) {
      const size = ratio * Math.pow(R, 2 - Math.floor(i / 2));
      x += size / 2;
      const s = this.add.sprite(x, y, "arrow").setDepth(depth.arrow);
      x += size / 2;
      s.setScale(size / 110);
      this.arrows.push(s);
      s.setInteractive();
    }
  }
  create(data: { sound: boolean }) {
    console.log({ msg: "create GameMain", data: data });
    this.prepareSounds(data?.sound, {
      bgm: new this.AddSound("bgm", { loop: true, volume: 0.2 }),
    });
    this.bg = this.add.image(this.canX(0.5), 0, 'bg').setDepth(depth.bg).setOrigin(0.5, 1);
    this.createArrows();
    for (let i = 0; i < GAGE_COUNT; ++i) {
      const s = this.add.sprite(0, 0, "gage").setDepth(depth.gage);;
      s.setScale(1 / 8);
      this.gages.push(s);
    }
    this.addSprite(0, -1000, "p0", "p0");
    this.addSprite(0, -1000, "pjump0", "pjump0");
    this.addSprite(0, -1000, "pjump1", "pjump1");
    this.sprites.p0.setDepth(depth.player);
    this.addSprite(this.canX(0.75), this.canY(0.9), "share", "share");
    this.sprites
      .share.on('pointerdown', () => this.shareClicked())
      .setVisible(false)
      .setDepth(depth.gameOverUI)
      .setInteractive();
    this.texts.create(this);
    this.texts.restart!.on('pointerdown', () => this.onRestart()).setInteractive();

  }
  rankText(): string | null {
    if (null == this.resTime) {
      return null;
    }
    for (const r of ranks) {
      if (r.t < this.resTime) {
        return r.n
      }
    }
    return ""; // unreachable
  }
  shareClicked() {
    const s = this.rankText();
    const text = [
      "Record: " + (this.resText == "" ? "??" : this.resText),
      ...(s ? ["Class: " + s] : []),
      "#DragonTights",
      "https://nabetani.sakura.ne.jp/game24a/",
    ].join("\n");
    const encoded = encodeURIComponent(text);
    const url = "https://taittsuu.com/share?text=" + encoded;
    if (!window.open(url)) {
      location.href = url;
    }
  }

  onRestart() {
    this.phase = new GamePhase(this);
  }
  get isGameOver() {
    if (this.model.goaledIn) {
      return true;
    }
    return this.model.player.z < -40;
  }
  showGameOver() {
    this.texts.gameOver?.setText(this.model.goaledIn ? "CONGRATULATIONS!" : "Game Over")
    const s = this.rankText()
    this.texts.rank?.setText(s || "");
    this.texts.setGameOver(this.model.goaledIn);
  }
  showRestart() {
    this.texts.setWaitRestart(this.model.goaledIn);
    this.sprites.share.setVisible(true);
  }
  startGame() {
    this.sprites.share.setVisible(false);
    this.texts.setPlaying();
    this.setPlayable(false);
    this.model = new Model();
    this.setPlayable(true);
    this.audios.bgm.play();
  }

  setRecord(s: number) {
    const p = (550 - this.model.player.pos.y) / 200;
    const t = formatNnumber(s, 7, 2) + " s";
    const d = this.model.goaledIn ? "GOAL!!" : formatNnumber(p, 6, 2) + " m";
    this.resText = `${t.trim()} / ${d.trim()}`
    this.resTime = this.model.goaledIn ? parseFloat(formatNnumber(s, 7, 2)) : null;
    this.texts.record?.setText(`${t}  ${d}`);
  }

  updateRecord(n: integer) {
    const secF = n / this.fps();
    this.setRecord(secF);
  }

  playerSprite(staying: boolean, tick: integer): Phaser.GameObjects.Sprite {
    const sprites = [
      this.sprites.pjump0,
      this.sprites.pjump1,
      this.sprites.p0
    ];
    const s = (() => {
      if (staying) { return this.sprites.p0; }
      return sprites[(tick & 4) == 0 ? 1 : 0];
    })();
    for (const e of sprites) {
      e.setVisible(e == s);
    }
    return s;
  }

  updatePlayer(tick: integer) {
    const m = this.model;
    m.updateWorld();
    const p = m.player;
    const sp = this.playerSprite(m.playerIsOnLotus || p.isFalling, tick);
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
