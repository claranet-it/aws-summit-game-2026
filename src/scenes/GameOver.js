import Phaser from 'phaser';
import { isHighScore, saveHighScore, getHighScores } from '../utils/HighScore.js';

export default class GameOver extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  create(data) {
    const score = data.score || 0;
    const playerConfig = data.playerConfig || null;
    const w = this.scale.width;
    const h = this.scale.height;
    const cx = w / 2;

    this.cameras.main.setBackgroundColor('#88d0f0');

    const titleStyle = {
      fontFamily: '"Courier New"',
      fontSize: '36px',
      color: '#d04040',
      align: 'center'
    };

    const textStyle = {
      fontFamily: '"Courier New"',
      fontSize: '22px',
      color: '#181830',
      align: 'center'
    };

    // Game Over title
    this.add.text(cx, h * 0.12, 'GAME OVER', titleStyle).setOrigin(0.5);

    // Score
    this.add.text(cx, h * 0.22, `SCORE: ${score}`, textStyle).setOrigin(0.5);

    // Check for high score
    if (isHighScore(score)) {
      this.time.delayedCall(300, () => {
        let email = window.prompt('NEW HIGH SCORE!\nEnter your email address (or click Cancel to skip):');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        // Loop ONLY if they explicitly typed something invalid and didn't leave it blank/canceled
        while (email !== null && email.trim() !== '' && !emailRegex.test(email.trim())) {
          email = window.prompt('Invalid email!\nPlease enter a VALID email address (or click Cancel to skip):');
        }

        // Save ONLY if it's a completely valid email
        if (email && emailRegex.test(email.trim())) {
          saveHighScore(email.trim(), score, playerConfig);
        }
        this.showHighScores(cx, h);
      });
    } else {
      this.showHighScores(cx, h);
    }

    // Restart prompt
    this.add.text(cx, h * 0.88, 'SPACE / TAP TO RESTART', {
      ...textStyle,
      fontSize: '16px',
      color: '#5898c0'
    }).setOrigin(0.5);

    // Restart logic
    this.input.keyboard.once('keydown-SPACE', this.restart, this);
    this.input.once('pointerdown', this.restart, this);
  }

  showHighScores(cx, h) {
    const scores = getHighScores();

    const headerStyle = {
      fontFamily: '"Courier New"',
      fontSize: '20px',
      color: '#207830',
      align: 'center',
    };

    const rowStyle = {
      fontFamily: '"Courier New"',
      fontSize: '18px',
      color: '#181830',
      align: 'center'
    };

    const goldStyle = {
      ...rowStyle,
      color: '#c89848'
    };

    this.add.text(cx, h * 0.34, '— HIGH SCORES —', headerStyle).setOrigin(0.5);

    if (scores.length === 0) {
      this.add.text(cx, h * 0.44, 'NO SCORES YET', rowStyle).setOrigin(0.5);
      return;
    }

    const g = this.add.graphics();
    const s = 1.5; // tiny scale for preview
    
    const w = this.scale.width; // Define w locally here
    const boxW = Math.min(w * 0.9, 800);
    const startX = cx - boxW / 2;
    const endX = cx + boxW / 2;

    scores.forEach((entry, i) => {
      const y = h * 0.42 + i * 30;

      // Draw character preview head if config exists
      if (entry.config) {
        const c = entry.config;
        const px = startX + 40; 
        const py = y - 9;

        // Skin
        g.fillStyle(0xf0c090, 1);
        g.fillRect(px, py, 6 * s, 6 * s);

        // Hair
        g.fillStyle(c.hairColor, 1);
        g.fillRect(px, py, 6 * s, 2 * s);
        g.fillRect(px, py, 1 * s, 4 * s);
        
        if (c.isFemale) {
          g.fillRect(px - 1 * s, py + 2 * s, 1 * s, 6 * s);
          g.fillRect(px + 6 * s, py + 2 * s, 1 * s, 3 * s);
        }

        // Eye
        g.fillStyle(0x181830, 1);
        g.fillRect(px + 4 * s, py + 3 * s, 1 * s, 1 * s);

        // Tiny shirt chunk
        g.fillStyle(c.shirtColor, 1);
        g.fillRect(px, py + 6 * s, 6 * s, 3 * s);
      }

      const rankStyle = i === 0 ? goldStyle : rowStyle;
      const scoreStyle = i === 0 ? goldStyle : rowStyle;
      const emailStyle = { ...rowStyle, color: '#000000' }; // Always black

      // Draw items separated dynamically based on viewport constraints
      this.add.text(startX, y, `${i + 1}.`, rankStyle).setOrigin(0, 0.5);
      this.add.text(startX + 65, y, entry.name, emailStyle).setOrigin(0, 0.5);
      this.add.text(endX, y, String(entry.score), scoreStyle).setOrigin(1, 0.5);
    });
  }

  restart() {
    this.scene.start('MainMenu');
  }
}
