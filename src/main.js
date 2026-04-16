import Phaser from 'phaser';
import Preloader from './scenes/Preloader.js';
import MainMenu from './scenes/MainMenu.js';
import Game from './scenes/Game.js';
import GameOver from './scenes/GameOver.js';

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'game-container',
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },
      debug: false
    }
  },
  scene: [Preloader, MainMenu, Game, GameOver]
};

export default new Phaser.Game(config);
