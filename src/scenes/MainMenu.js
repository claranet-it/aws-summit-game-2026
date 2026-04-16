import Phaser from 'phaser';

export default class MainMenu extends Phaser.Scene {
  constructor() {
    super('MainMenu');
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;

    this.cameras.main.setBackgroundColor('#000000');

    const isMobile = w < 600;

    // ── BTTF-style title ──────────────────────────────────────────────
    const cx = w / 2;
    const titleBaseY = isMobile ? 90 : 110;
    const scale = isMobile ? 0.7 : 1;

    this._makeBttfTitle(cx, titleBaseY, scale);

    // Instructions
    const instY = titleBaseY + (isMobile ? 145 : 175);
    this.add.text(cx, instY, 'JUMP obstacles and CATCH the certification to score points!', {
      fontFamily: '"Courier New"',
      fontSize: isMobile ? '11px' : '14px',
      color: '#aaccff',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: w - 40 }
    }).setOrigin(0.5);

    // --- Legend ---
    const legendY = instY + 60;
    const colSpacing = isMobile ? 80 : 120;
    const rowSpacing = 70;

    // Obstacles (Grouped)
    const obsX = w / 2 - colSpacing;
    this.add.image(obsX - 35, legendY + 10, 'hydrant').setScale(1).setOrigin(0.5, 1);
    this.add.image(obsX, legendY + 12, 'tree').setScale(0.7).setOrigin(0.5, 1);
    this.add.image(obsX + 35, legendY + 10, 'mailbox').setScale(1).setOrigin(0.5, 1);
    this.add.text(obsX, legendY + 30, '+5', { fontFamily: '"Courier New"', fontSize: '18px', color: '#ffdd44', fontStyle: 'bold' }).setOrigin(0.5);

    // Bird (white bg so it's visible on black)
    const birdX = w / 2 + colSpacing;
    const birdBg = this.add.graphics();
    birdBg.fillStyle(0xffffff, 1);
    birdBg.fillRect(birdX - 22, legendY - 18, 44, 36);
    this.add.image(birdX, legendY, 'bird-down').setScale(1.2).setOrigin(0.5);
    this.add.text(w / 2 + colSpacing, legendY + 30, '+10', { fontFamily: '"Courier New"', fontSize: '18px', color: '#ffdd44', fontStyle: 'bold' }).setOrigin(0.5);

    // Ferrari
    this.add.image(w / 2 - colSpacing, legendY + rowSpacing, 'ferrari').setScale(0.8).setOrigin(0.5);
    this.add.text(w / 2 - colSpacing, legendY + rowSpacing + 30, '+25', { fontFamily: '"Courier New"', fontSize: '18px', color: '#ffdd44', fontStyle: 'bold' }).setOrigin(0.5);

    // Certificates – 3 tiers in a row
    const certRowY = legendY + rowSpacing;
    const certSpacing = isMobile ? 42 : 55;
    const certCx = w / 2 + colSpacing;
    const certData = [
      { key: 'cert-bronze', label: '+50',  color: '#cc8844', name: 'Found.' },
      { key: 'cert-silver', label: '+100', color: '#aabbdd', name: 'Assoc.' },
      { key: 'cert-gold',   label: '+200', color: '#ffcc00', name: 'Pro' },
    ];
    certData.forEach((c, i) => {
      const cx2 = certCx + (i - 1) * certSpacing;
      this.add.image(cx2, certRowY, c.key).setScale(1.1).setOrigin(0.5);
      this.add.text(cx2, certRowY + 22, c.label, { fontFamily: '"Courier New"', fontSize: '13px', color: c.color, fontStyle: 'bold' }).setOrigin(0.5);
      this.add.text(cx2, certRowY - 22, c.name, { fontFamily: '"Courier New"', fontSize: '10px', color: '#aaaaaa' }).setOrigin(0.5);
    });

    // Call to Action
    const startText = this.add.text(w / 2, legendY + rowSpacing + 90, 'Press SPACE or TAP to Start', {
      fontFamily: '"Courier New"',
      fontSize: isMobile ? '18px' : '22px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: startText,
      alpha: 0,
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    // Logo Claranet bottom-right
    this.add.image(w - 12, h - 12, 'claranet-logo')
      .setOrigin(1, 1)
      .setScale(0.28)
      .setAlpha(0.85);

    // Input per iniziare
    this.input.keyboard.once('keydown-SPACE', this.startGame, this);
    this.input.once('pointerdown', this.startGame, this);
  }

  // ── BTTF logo-style title ────────────────────────────────────────────
  _makeBttfTitle(cx, baseY, scale) {
    const angle = -8;
    const font = '"Arial Black", "Impact", Arial, sans-serif';

    // Helper: draw one line with layered shadow + gradient simulation
    const drawLine = (text, x, y, size) => {
      const s = Math.round(size * scale);
      const base = { fontFamily: font, fontSize: `${s}px`, fontStyle: 'bold italic', align: 'center' };

      // dark maroon shadow
      this.add.text(x + 4 * scale, y + 4 * scale, text, { ...base, color: '#3a0000' }).setOrigin(0.5).setAngle(angle);
      // black outline
      this.add.text(x + 2 * scale, y + 2 * scale, text, { ...base, color: '#000000', stroke: '#000000', strokeThickness: Math.round(6 * scale) }).setOrigin(0.5).setAngle(angle);
      // red base
      this.add.text(x, y, text, { ...base, color: '#cc1100', stroke: '#7a0000', strokeThickness: Math.round(4 * scale) }).setOrigin(0.5).setAngle(angle);
      // orange mid
      this.add.text(x, y - 2 * scale, text, { ...base, color: '#ff6600', stroke: '#cc1100', strokeThickness: Math.round(2 * scale) }).setOrigin(0.5).setAngle(angle);
      // yellow top highlight
      this.add.text(x, y - 5 * scale, text, { ...base, color: '#ffdd00' }).setOrigin(0.5).setAngle(angle);
      // white shine on very top
      this.add.text(x, y - 8 * scale, text, { ...base, color: '#fffbe0', alpha: 0.35 }).setOrigin(0.5).setAngle(angle).setAlpha(0.35);
    };

    const lineGap = isMobile => isMobile ? 38 : 52; // eslint-disable-line no-unused-vars
    const gap = Math.round(52 * scale);

    drawLine('BACK', cx, baseY, 72);
    drawLine('TO THE', cx, baseY + gap, 48);
    drawLine('FUTURE OF CLOUD', cx, baseY + gap * 2, 56);
  }

  startGame() {
    this.scene.start('Game');
  }
}
