import * as Phaser from 'phaser';
import { BaseScene } from './baseScene';

export class Wating extends BaseScene {
  soundOn: boolean = false;
  singleVisibles: { [key: string]: Phaser.GameObjects.Text } = {};
  constructor() { super("Wating") }
  preload() {
    this.loadImages({
      title: "title.webp",
      soundOn: "soundOn.webp", soundOff: "soundOff.webp"
    });
    this.loadAudios({
      notingame: "notingame.m4a",
    });
  }
  addLink(rx: number, ry: number, g: number, msg: string, url: string) {
    const text = this.addText(
      msg,
      this.canX(rx), this.canY(ry), g, { fontSize: "20px", backgroundColor: "#fff8", padding: { x: 3, y: 3 } });
    text.on('pointerdown', () => {
      window.location.href = url;
    });
  }
  addTextText(rx: number, ry: number, g: number, btnText: string, bStyle: Phaser.Types.GameObjects.Text.TextStyle, msg0: string, mStyle: Phaser.Types.GameObjects.Text.TextStyle) {
    const text = this.addText(
      btnText,
      this.canX(rx), this.canY(ry), g,
      { ...{ padding: { x: 3, y: 3 }, fontSize: "25px", backgroundColor: "#fff8" }, ...bStyle });
    const msg = msg0.split("\n").map((e) => e.trim()).join("\n")
    this.singleVisibles[btnText] = this.singleVisibles[btnText] || this.add.text(
      this.canX(0.5), text.getBottomCenter().y! + 10, msg,
      { ...{ color: "black", padding: { x: 3, y: 3 }, fontSize: "19px", backgroundColor: "#fff8", lineSpacing: 10 }, ...mStyle });
    const longText = this.singleVisibles[btnText]
    longText.setOrigin(0.5, 0).setVisible(false);
    text.on('pointerdown', () => {
      longText.setText(msg);
      for (const [k, v] of Object.entries(this.singleVisibles)) {
        v.setVisible(k == btnText);
      }
    });
  }
  createSoundUI() {
    let soundOn = this.add.sprite(300, 100, "soundOn");
    let soundOff = this.add.sprite(430, 100, "soundOff");
    const setSound = (on: boolean) => {
      this.soundOn = on;
      const soundScale = 0.6;
      soundOn.setScale(on ? 1 : soundScale);
      soundOff.setScale(!on ? 1 : soundScale);
      if (on) {
        this.audios.notingame.play();
      } else {
        this.audios.notingame.stop();
      }
    };
    setSound(false);
    const setSoundButton = (btn: Phaser.GameObjects.Sprite, on: boolean) => {
      btn.on("pointerdown", () => {
        setSound(on);
      }).setInteractive().setVisible(true);
    };
    setSoundButton(soundOn, true);
    setSoundButton(soundOff, false);
  }

  create() {
    console.log("create Waiting")
    this.add.image(this.canX(0.5), this.canY(0.5), 'title');
    this.prepareSounds(true, {
      notingame: new this.AddSound("notingame", { loop: true, volume: 1.2 }),
    });
    this.createSoundUI();

    const startText = this.addText(
      '\n   Click here to start game.   \n',
      this.canX(0.5), this.canY(0.4), 0.5, { fontSize: "33px", fontStyle: "bold", backgroundColor: "#fff8" });
    startText.on('pointerdown', () => {
      this.audios.notingame.stop();
      this.scene.start('GameMain', { sound: this.soundOn });
    });
    [
      ["Source code and license", "https://github.com/nabetani/game2312/"],
      ["制作ノート", "https://nabetani.hatenadiary.com/entry/2024/01/game24a"],
      ["鍋谷武典 @ タイッツー", "https://taittsuu.com/users/nabetani"],
      ["タイッツー #DragonTights", "https://taittsuu.com/search/taiitsus/hashtags?query=DragonTights"],
    ].forEach((e, ix) =>
      this.addLink(0.96, 0.95 - ix * 0.04, 1, e[0], e[1])
    )
    this.addTextText(
      0.25, 0.5, 0.5,
      "遊び方", {},
      `画面下部の矢印を押すと、その方向にジャンプします。
       矢印が大きいほど大きくジャンプします。
       ※ 動いているものの上でジャンプすると、初速が その分加算されます。
       丸いものの上に着地できないとゲームオーバーです。
       丸いものに長い間乗っていると、丸いものは壊れ そのまま落ちでゲームオーバーです。
       上の方にあるゴールを目指してください。`,
      { fixedWidth: 510, wordWrap: { width: 480, useAdvancedWrap: true } }
    );
    this.addTextText(
      0.75, 0.5, 0.5,
      "ストーリー", {},
      `あなたはタイツです。
       冒険の末、ついに龍の潜む天空にたどりつきました。
       魔王を倒すには、龍の頭のあたりにあるタイツソードが必要です。
       ジャンプ力を活かして龍の頭のあたりまで行き、
       タイツソードを手に入れましょう。`,
      { fixedWidth: 510, wordWrap: { width: 480, useAdvancedWrap: true } }
    );
  }
}
