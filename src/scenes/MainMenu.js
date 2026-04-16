import Phaser from 'phaser';

export default class MainMenu extends Phaser.Scene {
  constructor() {
    super('MainMenu');
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;

    this.cameras.main.setBackgroundColor('#88d0f0');

    const isMobile = w < 600;

    // Logo Claranet
    const logoY = h / 2 - (isMobile ? 180 : 180);
    const logo = this.add.image(w / 2, logoY, 'claranet-logo').setOrigin(0.5);
    logo.setScale(0.4);

    // Titolo
    const titleY = logoY + 80;
    this.add.text(w / 2, titleY, 'Road to AWS Certification', {
      fontFamily: '"Courier New"',
      fontSize: isMobile ? '24px' : '36px',
      color: '#181830',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Instructions
    const instY = titleY + 40;
    this.add.text(w / 2, instY, 'JUMP obstacles and CATCH the certification to score points!', {
      fontFamily: '"Courier New"',
      fontSize: isMobile ? '12px' : '16px',
      color: '#384858',
      fontStyle: 'bold'
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
    this.add.text(obsX, legendY + 30, '+5', { fontFamily: '"Courier New"', fontSize: '18px', color: '#181830', fontStyle: 'bold' }).setOrigin(0.5);

    // Bird
    this.add.image(w / 2 + colSpacing, legendY, 'bird-down').setScale(1.2).setOrigin(0.5);
    this.add.text(w / 2 + colSpacing, legendY + 30, '+10', { fontFamily: '"Courier New"', fontSize: '18px', color: '#181830', fontStyle: 'bold' }).setOrigin(0.5);

    // Ferrari
    this.add.image(w / 2 - colSpacing, legendY + rowSpacing, 'ferrari').setScale(0.8).setOrigin(0.5);
    this.add.text(w / 2 - colSpacing, legendY + rowSpacing + 30, '+25', { fontFamily: '"Courier New"', fontSize: '18px', color: '#181830', fontStyle: 'bold' }).setOrigin(0.5);

    // Certificate
    this.add.image(w / 2 + colSpacing, legendY + rowSpacing, 'certificate').setScale(1.2).setOrigin(0.5);
    this.add.text(w / 2 + colSpacing, legendY + rowSpacing + 30, '+50', { fontFamily: '"Courier New"', fontSize: '18px', color: '#181830', fontStyle: 'bold' }).setOrigin(0.5);

    // Call to Action
    const startText = this.add.text(w / 2, legendY + rowSpacing + 90, 'Press SPACE or TAP to Start', {
      fontFamily: '"Courier New"',
      fontSize: isMobile ? '18px' : '24px',
      color: '#d04040',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: startText,
      alpha: 0,
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    // Input per iniziare
    this.input.keyboard.once('keydown-SPACE', this.startGame, this);
    this.input.once('pointerdown', this.startGame, this);
  }

  startGame() {
    this.scene.start('Game');
  }
}
