import Phaser from 'phaser';
import { playJumpSound, playHitSound, startBGM, stopBGM, playVroomSound, playYeahSound, playHereItComesSound } from '../utils/Audio.js';
import { PALETTE } from './Preloader.js';

const INITIAL_GAME_SPEED = 500;
const SPEED_UP_INTERVAL_MS = 5000;
const SPEED_MULTIPLIER = 1.1;
const FERRARI_SPAWN_CHANCE = 16;
const CYCLE_DURATION = 24000;

export default class Game extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  init() {
    this.score = 0;
    this.isDead = false;
    this.spawnTimer = 0;
    this.gameSpeed = INITIAL_GAME_SPEED;
    this.speedUpTimer = 0;
    this.totalTime = 0;
    this.cycleTime = 0;
    this.certSpawnTimer = 0;
    this.certActive = false;
    
    this.generateRandomStudent();
  }

  generateRandomStudent() {
    const hairColors = [0x483020, 0xd0a040, 0x181818, 0xd04040, 0xffe080];
    const shirtColors = [0x3878c8, 0x28a058, 0xc83838, 0xc8c838, 0x7838c8, 0xffffff];
    const backpackColors = [0xd04848, 0x48d048, 0x4848d0, 0xd0d048, 0xd048d0, 0x222222];

    const hairColor = Phaser.Math.RND.pick(hairColors);
    const shirtColor = Phaser.Math.RND.pick(shirtColors);
    const backpackColor = Phaser.Math.RND.pick(backpackColors);
    const isFemale = Phaser.Math.FloatBetween(0, 1) > 0.5;

    const darken = (color) => {
      let r = Math.floor(((color >> 16) & 0xff) * 0.7);
      let g = Math.floor(((color >> 8) & 0xff) * 0.7);
      let b = Math.floor((color & 0xff) * 0.7);
      return (r << 16) | (g << 8) | b;
    };

    const shirtDark = darken(shirtColor);
    const backpackDark = darken(backpackColor);

    this.playerConfig = { hairColor, shirtColor, backpackColor, isFemale };

    if (this.textures.exists('student')) {
      this.textures.remove('student');
      this.textures.remove('student-run-1');
      this.textures.remove('student-run-2');
    }

    const g = this.add.graphics();
    const s = 2; // base scale

    const drawCharacter = (key, legFrame) => {
      g.fillStyle(PALETTE.skin, 1);
      g.fillRect(6 * s, 0, 6 * s, 6 * s);

      // Hair
      g.fillStyle(hairColor, 1);
      g.fillRect(6 * s, 0, 6 * s, 2 * s);
      g.fillRect(6 * s, 0, 1 * s, 4 * s);

      if (isFemale) {
        g.fillRect(5 * s, 2 * s, 1 * s, 6 * s); // long hair left
        g.fillRect(12 * s, 2 * s, 1 * s, 3 * s); // long hair right
      }

      // Eye & detail
      g.fillStyle(0x181830, 1);
      g.fillRect(10 * s, 3 * s, 1 * s, 1 * s);
      g.fillStyle(PALETTE.skinDark, 1);
      g.fillRect(10 * s, 5 * s, 2 * s, 1 * s);

      // Shirt
      g.fillStyle(shirtColor, 1);
      g.fillRect(5 * s, 6 * s, 7 * s, 8 * s);
      g.fillStyle(shirtDark, 1);
      g.fillRect(5 * s, 6 * s, 2 * s, 8 * s);

      // Arms
      g.fillStyle(PALETTE.skin, 1);
      g.fillRect(12 * s, 7 * s, 3 * s, 2 * s);
      g.fillRect(3 * s, 9 * s, 2 * s, 2 * s);

      // Backpack
      g.fillStyle(backpackColor, 1);
      g.fillRect(3 * s, 7 * s, 3 * s, 6 * s);
      g.fillStyle(backpackDark, 1);
      g.fillRect(3 * s, 7 * s, 1 * s, 6 * s);

      // Legs
      g.fillStyle(PALETTE.pants, 1);
      if (legFrame === 0) {
        g.fillRect(5 * s, 14 * s, 3 * s, 5 * s);
        g.fillRect(9 * s, 14 * s, 3 * s, 5 * s);
      } else if (legFrame === 1) {
        g.fillRect(4 * s, 14 * s, 3 * s, 4 * s);
        g.fillRect(9 * s, 14 * s, 3 * s, 5 * s);
      } else {
        g.fillRect(6 * s, 14 * s, 3 * s, 5 * s);
        g.fillRect(10 * s, 14 * s, 3 * s, 4 * s);
      }

      g.fillStyle(PALETTE.pantsDark, 1);
      if (legFrame === 0) {
        g.fillRect(5 * s, 14 * s, 1 * s, 5 * s);
      } else if (legFrame === 1) {
        g.fillRect(4 * s, 14 * s, 1 * s, 4 * s);
      } else {
        g.fillRect(6 * s, 14 * s, 1 * s, 5 * s);
      }

      // Shoes
      g.fillStyle(PALETTE.shoes, 1);
      if (legFrame === 0) {
        g.fillRect(5 * s, 19 * s, 3 * s, 2 * s);
        g.fillRect(9 * s, 19 * s, 4 * s, 2 * s);
      } else if (legFrame === 1) {
        g.fillRect(4 * s, 18 * s, 3 * s, 2 * s);
        g.fillRect(9 * s, 19 * s, 4 * s, 2 * s);
      } else {
        g.fillRect(6 * s, 19 * s, 4 * s, 2 * s);
        g.fillRect(10 * s, 18 * s, 3 * s, 2 * s);
      }

      g.generateTexture(key, 16 * s, 21 * s);
      g.clear();
    };

    drawCharacter('student', 0);
    drawCharacter('student-run-1', 1);
    drawCharacter('student-run-2', 2);

    g.destroy();
  }

  create() {
    if (this.physics && this.physics.world && this.physics.world.isPaused) {
      this.physics.resume();
    }
    const w = this.scale.width;
    const h = this.scale.height;
    const groundY = h - 40;

    this.cameras.main.setBackgroundColor('#88d0f0');

    // Top Logo
    const logo = this.add.image(w / 2, 40, 'claranet-logo').setOrigin(0.5);
    logo.setScale(0.25);
    logo.setAlpha(1);
    logo.setDepth(10); // Bring it to foreground
    if (logo.postFX) {
      logo.postFX.addPixelate(1); // Apply pixel art style (4x4 blocks)
    }

    // --- Parallax city skyline (far layer) ---
    this.buildingsFar = [];
    const farY = groundY;
    let x = 0;
    while (x < w + 100) {
      const type = Phaser.Math.RND.pick(['buildingA', 'buildingB', 'buildingC']);
      const bld = this.add.image(x, farY, type).setOrigin(0, 1);
      bld.setTint(0x9898b0);
      bld.setDepth(-3);
      bld.setAlpha(0.7);
      this.buildingsFar.push(bld);
      x += bld.width + Phaser.Math.Between(5, 20);
    }

    // --- Parallax city skyline (near layer) ---
    this.buildingsNear = [];
    x = 0;
    while (x < w + 100) {
      const type = Phaser.Math.RND.pick(['buildingA', 'buildingB', 'buildingC']);
      const bld = this.add.image(x, farY, type).setOrigin(0, 1);
      bld.setDepth(-2);
      bld.setAlpha(0.85);
      this.buildingsNear.push(bld);
      x += bld.width + Phaser.Math.Between(2, 15);
    }

    // Clouds
    this.clouds = [];
    for (let i = 0; i < 4; i++) {
      this.spawnCloud(Phaser.Math.Between(50, w - 50), Phaser.Math.Between(20, h * 0.25));
    }

    // Celestial bodies (Sun & Moon)
    this.dayColor = Phaser.Display.Color.ValueToColor('#88d0f0');
    this.nightColor = Phaser.Display.Color.ValueToColor('#081030');
    this.sun = this.add.circle(w / 2, 0, 30, 0xfff000).setDepth(-5);
    this.moon = this.add.circle(w / 2, 0, 24, 0xeeeeee).setDepth(-5);

    // Ground (sidewalk + road)
    this.ground = this.add.tileSprite(w / 2, groundY, w * 2, 22, 'ground');
    this.physics.add.existing(this.ground, true);
    this.groundY = groundY;

    // Player (student)
    this.player = this.physics.add.sprite(100, groundY - 50, 'student');
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.ground);

    if (this.anims.exists('run')) this.anims.remove('run');
    this.anims.create({
      key: 'run',
      frames: [
        { key: 'student-run-1' },
        { key: 'student-run-2' }
      ],
      frameRate: 12,
      repeat: -1
    });
    this.player.play('run');

    if (!this.anims.exists('bird-flap')) {
      this.anims.create({
        key: 'bird-flap',
        frames: [
          { key: 'bird-up' },
          { key: 'bird-down' }
        ],
        frameRate: 8,
        repeat: -1
      });
    }

    // Certificates group
    this.certificates = this.physics.add.group({ allowGravity: false });
    this.physics.add.overlap(this.player, this.certificates, this.catchCertificate, null, this);

    // Obstacles (hydrants)
    this.obstacles = this.physics.add.group({ allowGravity: false });
    this.physics.add.overlap(this.player, this.obstacles, this.handleCollision, null, this);

    // Score text
    this.scoreText = this.add.text(w - 20, 16, '0', {
      fontFamily: '"Courier New"',
      fontSize: '24px',
      color: '#181830'
    }).setOrigin(1, 0);

    // Timer text
    this.timerText = this.add.text(20, 16, 'TIME: 0s', {
      fontFamily: '"Courier New"',
      fontSize: '24px',
      color: '#181830'
    }).setOrigin(0, 0);

    // Input
    this.input.keyboard.on('keydown-SPACE', this.jump, this);
    this.input.on('pointerdown', this.jump, this);
    this.input.keyboard.on('keyup-SPACE', this.cutJump, this);
    this.input.on('pointerup', this.cutJump, this);
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Start background music
    startBGM();

    // Spawn the first certificate immediately
    this.spawnCertificate();
  }

  jump() {
    if (this.isDead) return;
    if (this.player.body.touching.down) {
      // Un salto alla massima potenza è più forte, permettendo più ampiezza se il tasto viene tenuto premuto
      this.player.setVelocityY(-550);
      this.player.stop();
      this.player.setTexture('student');
      playJumpSound();
    }
  }

  cutJump() {
    if (this.isDead) return;
    // Se stiamo andando verso l'alto (velocità Y negativa) e rilasciamo il tasto, dimezziamo la forza
    if (this.player.body.velocity.y < 0) {
      this.player.setVelocityY(this.player.body.velocity.y * 0.4);
    }
  }

  spawnCloud(x, y) {
    const w = this.scale.width;
    const h = this.scale.height;
    const cloud = this.add.image(
      x || w + 20,
      y || Phaser.Math.Between(20, h * 0.25),
      'cloud'
    );
    cloud.setAlpha(0.5);
    cloud.setDepth(-4);
    this.clouds.push(cloud);
    return cloud;
  }

  spawnObstacle() {
    const w = this.scale.width;
    
    // Evaluate if ferrari spins in
    let type = Phaser.Math.RND.pick(['hydrant', 'tree', 'mailbox', 'bird']);
    if (this.score > 50 && Phaser.Math.Between(1, 100) <= FERRARI_SPAWN_CHANCE) {
      type = 'ferrari'; // 16% Absolute Chance
    }
    let yOffset, hitW, hitH, velMultiplier = 1;
    let randomScaleY = 1;
    let randomScaleX = 1;

    switch (type) {
      case 'bird':
        yOffset = Phaser.Math.Between(50, 100); // mid-air
        hitW = 66; // 11 * 6
        hitH = 24; // 4 * 6
        velMultiplier = 1.6; // travel faster
        break;
      case 'tree':
        randomScaleY = Phaser.Math.FloatBetween(0.8, 1.2);
        yOffset = 30 * randomScaleY - 2; // adjust origin to keep base planted
        hitW = 20;
        hitH = 50;
        break;
      case 'ferrari':
        yOffset = 8; // adjusted upward to account for the larger wheels
        hitW = 104; // scaled up physics block
        hitH = 30; // scaled up physics block
        velMultiplier = 2.8; // SFRECCIA! Almost 3x normal speed
        playVroomSound(); // Sound indicator of danger
        break;
      case 'mailbox':
        yOffset = 12;
        hitW = 20;
        hitH = 26;
        break;
      case 'hydrant':
      default:
        yOffset = 12;
        hitW = 16;
        hitH = 26;
        break;
    }

    let tex = type;
    if (type === 'bird') tex = 'bird-up';
    else if (type === 'ferrari') tex = 'ferrari';
    
    const obs = this.obstacles.create(w + 20, this.groundY - yOffset, tex);
    obs.setVelocityX(-this.gameSpeed * velMultiplier);
    
    if (randomScaleY !== 1 || randomScaleX !== 1) {
      obs.setScale(randomScaleX, randomScaleY);
    }
    
    obs.setSize(hitW, hitH);

    obs.passed = false;
    if (type === 'bird') {
      obs.pointsValue = 10;
      obs.isBird = true;
      obs.waveTime = Phaser.Math.FloatBetween(0, Math.PI * 2);
      obs.play('bird-flap');
      obs.setFlipX(true);
    } else if (type === 'ferrari') {
      obs.pointsValue = 25;
    } else {
      obs.pointsValue = 5;
    }
  }

  spawnCertificate() {
    const w = this.scale.width;
    const yPos = this.groundY - Phaser.Math.Between(60, 140);
    const cert = this.certificates.create(w + 50, yPos, 'certificate');
    cert.setScale(1.5);
    cert.setDepth(1);
    cert.setVelocityX(-this.gameSpeed * 1.2);
    cert.waveTime = 0;
    cert.baseY = yPos;

    // Create aura
    cert.aura = this.add.graphics();
    cert.aura.fillStyle(0xffdd40, 0.6); // Golden-yellow glow
    cert.aura.fillCircle(0, 0, 24);
    cert.aura.setDepth(0);
    
    // Tween aura to pulse rapidly
    this.tweens.add({
      targets: cert.aura,
      scaleX: 2.2,
      scaleY: 2.2,
      alpha: 0,
      duration: 350,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.certActive = true;
    playHereItComesSound();
  }

  catchCertificate(player, cert) {
    if (cert.aura) cert.aura.destroy();
    cert.destroy();
    this.score += 50;
    this.scoreText.setText(Math.floor(this.score).toString());
    playYeahSound();
    this.certActive = false;
    this.certSpawnTimer = 0;
  }

  handleCollision() {
    this.isDead = true;
    this.physics.pause();
    this.player.stop();
    this.player.setTexture('student');
    this.player.setTint(0xd04040);
    stopBGM();
    playHitSound();

    this.time.delayedCall(1000, () => {
      this.scene.start('GameOver', { score: Math.floor(this.score), playerConfig: this.playerConfig });
    });
  }

  scrollParallaxLayer(buildings, speed, delta) {
    const w = this.scale.width;
    buildings.forEach(bld => {
      bld.x -= speed * delta / 1000;
    });

    // Find rightmost building
    let maxX = -Infinity;
    buildings.forEach(b => { if (b.x + b.width > maxX) maxX = b.x + b.width; });

    // Recycle buildings that go off-screen left
    buildings.forEach(bld => {
      if (bld.x + bld.width < -10) {
        bld.x = maxX + Phaser.Math.Between(2, 20);
        maxX = bld.x + bld.width;
      }
    });
  }

  update(time, delta) {
    if (this.isDead) return;

    if (this.player.body.touching.down && !this.player.anims.isPlaying) {
      this.player.play('run');
    }

    // Scroll ground
    this.ground.tilePositionX += (this.gameSpeed * delta) / 1000;

    // Day/Night Cycle Update
    this.cycleTime = (this.cycleTime + delta) % CYCLE_DURATION;
    const cycleProgress = this.cycleTime / CYCLE_DURATION;
    const angle = cycleProgress * Math.PI * 2;
    const dayFactor = (Math.cos(angle) + 1) / 2; // 1 at noon, 0 at midnight

    const currentColor = Phaser.Display.Color.Interpolate.ColorWithColor(
      this.nightColor, this.dayColor, 100, Math.floor(dayFactor * 100)
    );
    this.cameras.main.setBackgroundColor(currentColor);

    const cx = this.scale.width / 2;
    const cy = this.groundY;
    const r = this.scale.width / 2 + 100;
    
    // Circle starting noon at -PI/2
    const sunAngle = angle - Math.PI / 2;
    this.sun.x = cx + Math.cos(sunAngle) * r;
    this.sun.y = cy + Math.sin(sunAngle) * r * 0.8;

    const moonAngle = sunAngle + Math.PI;
    this.moon.x = cx + Math.cos(moonAngle) * r;
    this.moon.y = cy + Math.sin(moonAngle) * r * 0.8;

    // Parallax buildings (far = slow, near = medium)
    this.scrollParallaxLayer(this.buildingsFar, this.gameSpeed * 0.15, delta);
    this.scrollParallaxLayer(this.buildingsNear, this.gameSpeed * 0.4, delta);

    // Certificates animation and respawn logic
    if (!this.certActive) {
      this.certSpawnTimer += delta;
      if (this.certSpawnTimer >= 10000) { // 10 seconds
        this.spawnCertificate();
      }
    }

    this.certificates.getChildren().forEach(cert => {
      cert.waveTime += delta * 0.003;
      cert.y = cert.baseY + Math.sin(cert.waveTime) * 20;
      cert.setRotation(Math.sin(cert.waveTime * 0.8) * 0.2);
      
      if (cert.aura) {
        cert.aura.x = cert.x;
        cert.aura.y = cert.y;
      }
      
      if (cert.x < -40) {
        if (cert.aura) cert.aura.destroy();
        cert.destroy();
        this.certActive = false;
        this.certSpawnTimer = 0;
      }
    });

    // Move clouds
    this.clouds.forEach(cloud => {
      cloud.x -= (this.gameSpeed * 0.08 * delta) / 1000;
      if (cloud.x < -40) {
        cloud.x = this.scale.width + 40;
        cloud.y = Phaser.Math.Between(20, this.scale.height * 0.25);
      }
    });

    // Remove off-screen obstacles or animate them
    this.obstacles.getChildren().forEach(obs => {
      if (!obs.passed && obs.x + (obs.width || 0) < this.player.x) {
        obs.passed = true;
        this.score += obs.pointsValue;
      }

      if (obs.x < -40) {
        obs.destroy();
      } else if (obs.isBird) {
        obs.waveTime += delta * 0.005;
        obs.setVelocityY(Math.cos(obs.waveTime) * 60);
      }
    });

    // Spawn obstacles (timers dynamically scaled to maintain density at any speed)
    this.spawnTimer += delta;
    const speedRatio = INITIAL_GAME_SPEED / this.gameSpeed;
    if (this.spawnTimer > Phaser.Math.Between(800 * speedRatio, 1666 * speedRatio)) {
      this.spawnTimer = 0;
      this.spawnObstacle();
    }

    // Score update
    this.scoreText.setText(Math.floor(this.score).toString());

    this.totalTime += delta;
    this.timerText.setText('TIME: ' + Math.floor(this.totalTime / 1000) + 's');

    this.speedUpTimer += delta;
    if (this.speedUpTimer >= SPEED_UP_INTERVAL_MS) {
      this.speedUpTimer -= SPEED_UP_INTERVAL_MS;
      this.gameSpeed *= SPEED_MULTIPLIER;
    }
  }
}
