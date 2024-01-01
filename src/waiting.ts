import * as Phaser from 'phaser';
import { BaseScene } from './baseScene';

export class Wating extends BaseScene {
  soundOn: boolean = false;
  constructor() { super("Wating") }
  preload() {
    this.loadImages({
      bg: "bg.webp",
      soundOn: "soundOn.webp", soundOff: "soundOff.webp"
    });
  }
  addLink(rx: number, ry: number, g: number, msg: string, url: string) {
    const text = this.addText(
      msg,
      this.canX(rx), this.canY(ry), g, { fontSize: "20px", backgroundColor: "#fff8" });
    text.on('pointerdown', () => {
      window.location.href = url;
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
    this.add.image(this.canX(0.5), this.canY(0.5), 'bg');
    this.createSoundUI();

    const startText = this.addText(
      '\n   Click here to start game.   \n',
      this.canX(0.5), this.canY(0.4), 0.5, { fontSize: "33px", fontStyle: "bold", backgroundColor: "#fff8" });
    startText.on('pointerdown', () => {
      this.scene.start('GameMain', { sound: this.soundOn });
    });
    let ry = 0.95;
    const dry = 0.04;
    this.addLink(0.96, ry, 1, "Source code and license", "https://github.com/nabetani/game2312/");
    ry -= dry;
    this.addLink(0.96, ry, 1, "制作ノート", "https://nabetani.hatenadiary.com/entry/2024/01/game2401");
    ry -= dry;
    this.addLink(0.96, ry, 1, "鍋谷武典 @ タイッツー", "https://taittsuu.com/users/nabetani");
    ry -= dry;
    this.addLink(0.96, ry, 1, " タイッツー #DragonTights", "https://taittsuu.com/search/taiitsus/hashtags?query=DragonTights");
  }
}
