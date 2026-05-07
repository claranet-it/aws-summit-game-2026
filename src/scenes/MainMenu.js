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
    const logo = this.add.image(cx, titleBaseY + 30, 'bttc-logo').setOrigin(0.5);
    const targetWidth = w / 3;
    const logoScale = targetWidth / logo.width;
    logo.setScale(logoScale);

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
      { key: 'cert-bronze', label: '+50',  color: '#3d4552', name: 'Found.' },
      { key: 'cert-silver', label: '+100', color: '#2630c2', name: 'Assoc.' },
      { key: 'cert-gold',   label: '+200', color: '#316f87', name: 'Pro' },
    ];
    certData.forEach((c, i) => {
      const cx2 = certCx + (i - 1) * certSpacing;
      this.add.image(cx2, certRowY, c.key).setScale(1.1).setOrigin(0.5);
      this.add.text(cx2, certRowY + 26, c.label, { fontFamily: '"Courier New"', fontSize: '13px', color: c.color, fontStyle: 'bold' }).setOrigin(0.5);
    });

    // Lives info
    this.add.text(w / 2, legendY + rowSpacing + 62, '3 lives  •  +1 life every 500 pts  •  speed resets on hit', {
      fontFamily: '"Courier New"',
      fontSize: isMobile ? '10px' : '12px',
      color: '#aaaaaa',
    }).setOrigin(0.5);

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


  startGame() {
    this.scene.start('Game');
  }
}
