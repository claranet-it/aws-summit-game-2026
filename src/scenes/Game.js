import Phaser from 'phaser';
import { playJumpSound, playHitSound, startBGM, stopBGM, playVroomSound, playYeahSound, playHereItComesSound } from '../utils/Audio.js';
import { PALETTE } from './Preloader.js';

const INITIAL_GAME_SPEED = 200;
const SPEED_UP_INTERVAL_MS = 5000;
const SPEED_MULTIPLIER = 1.25;
const FERRARI_SPAWN_CHANCE = 16;
const CYCLE_DURATION = 42000;
const WORLD_SCALE = 1.25;
const BUILDING_SCALE = WORLD_SCALE * 1.50;
const MIN_SPAWN_DELAY_MS = 1500;
const MAX_SPAWN_DELAY_MS = 2800;
const MIN_OBSTACLE_GAP_PX = 320;

export default class Game extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  init() {
    this.score = 0;
    this.isDead = false;
    this.spawnTimer = 0;
    this.nextSpawnDelay = Phaser.Math.Between(MIN_SPAWN_DELAY_MS, MAX_SPAWN_DELAY_MS);
    this.gameSpeed = INITIAL_GAME_SPEED;
    this.speedUpTimer = 0;
    this.totalTime = 0;
    this.cycleTime = 0;
    this.certSpawnTimer = 0;
    this.certActive = false;
    this.activeBillboard = null;
    
    this.createDeLoreanTexture();
  }

  createDeLoreanTexture() {
    if (this.textures.exists('delorean')) {
      this.textures.remove('delorean');
      this.textures.remove('delorean-drive-1');
      this.textures.remove('delorean-drive-2');
    }

    const g = this.add.graphics();
    const s = 2;
    const W = 46;
    const H = 22;

    // Colors
    const silver   = 0xc0c0c8;
    const silverDk = 0x888890;
    const silverLt = 0xe8eaf0;
    const glass    = 0x304880;
    const wheel    = 0x181818;
    const hubCol   = 0xa0a0a8;
    const fluxBlue = 0x40c8ff;
    const fluxGlow = 0x90e0ff;
    const headlit  = 0xffff90;
    const taillit  = 0xff2010;
    const undercar = 0x404048;
    const stripe   = 0xd0d0d8;

    const drawDelorean = (key, spokeAngle) => {
      // --- Undercarriage / ground skirt ---
      g.fillStyle(undercar, 1);
      g.fillRect(5*s, 17*s, 36*s, 2*s);

      // --- Main body slab ---
      g.fillStyle(silver, 1);
      g.fillRect(4*s, 10*s, 38*s, 7*s);

      // --- Body highlight (top edge) ---
      g.fillStyle(silverLt, 1);
      g.fillRect(4*s, 10*s, 38*s, 1*s);

      // --- Body shadow (bottom edge) ---
      g.fillStyle(silverDk, 1);
      g.fillRect(4*s, 16*s, 38*s, 1*s);

      // --- Rear fascia ---
      g.fillStyle(silverDk, 1);
      g.fillRect(2*s, 10*s, 3*s, 7*s);
      g.fillStyle(undercar, 1);
      g.fillRect(2*s, 15*s, 3*s, 2*s);

      // --- Front fascia (wedge nose) ---
      g.fillStyle(silverDk, 1);
      g.fillRect(40*s, 10*s, 3*s, 7*s);
      g.fillRect(43*s, 11*s, 1*s, 5*s);
      g.fillStyle(undercar, 1);
      g.fillRect(40*s, 15*s, 4*s, 2*s);

      // --- Gull-wing door panel lines ---
      g.fillStyle(silverDk, 1);
      g.fillRect(11*s, 10*s, 1*s, 6*s);  // rear door edge
      g.fillRect(31*s, 10*s, 1*s, 6*s);  // front door edge
      g.fillRect(11*s, 13*s, 20*s, 1*s); // horizontal door split

      // --- Stainless steel vertical stripes on doors ---
      g.fillStyle(stripe, 1);
      g.fillRect(14*s, 10*s, 1*s, 6*s);
      g.fillRect(18*s, 10*s, 1*s, 6*s);
      g.fillRect(24*s, 10*s, 1*s, 6*s);
      g.fillRect(28*s, 10*s, 1*s, 6*s);

      // --- Cabin / upper structure ---
      g.fillStyle(silver, 1);
      g.fillRect(12*s, 5*s, 19*s, 5*s);  // cabin top
      g.fillRect(10*s, 7*s, 3*s, 3*s);   // rear A-pillar slope
      g.fillRect(30*s, 6*s, 3*s, 4*s);   // front C-pillar slope
      g.fillRect(33*s, 7*s, 3*s, 3*s);   // front screen slope
      g.fillRect(36*s, 8*s, 3*s, 2*s);   // hood slope
      g.fillRect(38*s, 9*s, 3*s, 1*s);   // hood tip

      // --- Windows ---
      g.fillStyle(glass, 1);
      g.fillRect(11*s, 7*s, 4*s, 3*s);   // rear quarter window
      g.fillRect(17*s, 6*s, 6*s, 4*s);   // main rear window
      g.fillRect(25*s, 6*s, 6*s, 4*s);   // main front window

      // --- Window pillars ---
      g.fillStyle(silverDk, 1);
      g.fillRect(15*s, 5*s, 2*s, 5*s);   // B-pillar
      g.fillRect(23*s, 5*s, 2*s, 5*s);   // C-pillar

      // --- Flux capacitor glow (rear, back-to-the-future style) ---
      g.fillStyle(fluxBlue, 1);
      g.fillRect(0*s, 9*s, 2*s, 4*s);
      g.fillStyle(fluxGlow, 1);
      g.fillRect(0*s, 10*s, 1*s, 2*s);

      // --- Time circuit light strip (on body, rear) ---
      g.fillStyle(0xff4400, 1);
      g.fillRect(3*s, 11*s, 1*s, 1*s);
      g.fillStyle(0x00ff88, 1);
      g.fillRect(3*s, 12*s, 1*s, 1*s);
      g.fillStyle(0xffdd00, 1);
      g.fillRect(3*s, 13*s, 1*s, 1*s);

      // --- Headlights (front) ---
      g.fillStyle(headlit, 1);
      g.fillRect(42*s, 11*s, 2*s, 3*s);
      g.fillStyle(0xffffff, 1);
      g.fillRect(42*s, 11*s, 1*s, 1*s);

      // --- Tail lights (rear) ---
      g.fillStyle(taillit, 1);
      g.fillRect(2*s, 11*s, 1*s, 3*s);

      // --- Wheel arches (cut into body) ---
      g.fillStyle(undercar, 1);
      g.fillRect(6*s, 15*s, 8*s, 2*s);
      g.fillRect(32*s, 15*s, 8*s, 2*s);

      // --- Wheels ---
      g.fillStyle(wheel, 1);
      g.fillCircle(10*s, 19*s, 4*s);
      g.fillCircle(36*s, 19*s, 4*s);

      // --- Tire highlight ---
      g.fillStyle(0x383838, 1);
      g.fillCircle(10*s, 18*s, 2*s);
      g.fillCircle(36*s, 18*s, 2*s);

      // --- Wheel hub & spokes (animated) ---
      g.fillStyle(hubCol, 1);
      g.fillCircle(10*s, 19*s, 2*s);
      g.fillCircle(36*s, 19*s, 2*s);

      // Spokes (2 frames: horizontal vs vertical)
      g.fillStyle(wheel, 1);
      if (spokeAngle === 0) {
        // Horizontal spokes
        g.fillRect(6*s, 19*s, 8*s, 1*s);
        g.fillRect(32*s, 19*s, 8*s, 1*s);
        g.fillRect(10*s, 15*s, 1*s, 8*s);
        g.fillRect(36*s, 15*s, 1*s, 8*s);
      } else {
        // Diagonal spokes (45°)
        g.fillRect(7*s, 16*s, 1*s, 1*s);
        g.fillRect(8*s, 17*s, 1*s, 1*s);
        g.fillRect(12*s, 21*s, 1*s, 1*s);
        g.fillRect(13*s, 22*s, 1*s, 1*s);
        g.fillRect(7*s, 21*s, 1*s, 1*s);
        g.fillRect(8*s, 22*s, 1*s, 1*s);
        g.fillRect(12*s, 16*s, 1*s, 1*s);
        g.fillRect(13*s, 17*s, 1*s, 1*s);
        g.fillRect(33*s, 16*s, 1*s, 1*s);
        g.fillRect(34*s, 17*s, 1*s, 1*s);
        g.fillRect(38*s, 21*s, 1*s, 1*s);
        g.fillRect(39*s, 22*s, 1*s, 1*s);
        g.fillRect(33*s, 21*s, 1*s, 1*s);
        g.fillRect(34*s, 22*s, 1*s, 1*s);
        g.fillRect(38*s, 16*s, 1*s, 1*s);
        g.fillRect(39*s, 17*s, 1*s, 1*s);
      }

      // Hub center dot
      g.fillStyle(silverLt, 1);
      g.fillRect(10*s, 19*s, 1*s, 1*s);
      g.fillRect(36*s, 19*s, 1*s, 1*s);

      g.generateTexture(key, W*s, H*s);
      g.clear();
    };

    drawDelorean('delorean', 0);
    drawDelorean('delorean-drive-1', 0);
    drawDelorean('delorean-drive-2', 1);

    // --- Hover mode textures (wheels rotated 90° downward as thruster pods) ---
    const drawDeloreanHover = (key, thrusterFrame) => {
      // Same body as normal
      g.fillStyle(undercar, 1);
      g.fillRect(5*s, 17*s, 36*s, 2*s);
      g.fillStyle(silver, 1);
      g.fillRect(4*s, 10*s, 38*s, 7*s);
      g.fillStyle(silverLt, 1);
      g.fillRect(4*s, 10*s, 38*s, 1*s);
      g.fillStyle(silverDk, 1);
      g.fillRect(4*s, 16*s, 38*s, 1*s);
      g.fillStyle(silverDk, 1);
      g.fillRect(2*s, 10*s, 3*s, 7*s);
      g.fillStyle(undercar, 1);
      g.fillRect(2*s, 15*s, 3*s, 2*s);
      g.fillStyle(silverDk, 1);
      g.fillRect(40*s, 10*s, 3*s, 7*s);
      g.fillRect(43*s, 11*s, 1*s, 5*s);
      g.fillStyle(undercar, 1);
      g.fillRect(40*s, 15*s, 4*s, 2*s);
      g.fillStyle(silverDk, 1);
      g.fillRect(11*s, 10*s, 1*s, 6*s);
      g.fillRect(31*s, 10*s, 1*s, 6*s);
      g.fillRect(11*s, 13*s, 20*s, 1*s);
      g.fillStyle(stripe, 1);
      g.fillRect(14*s, 10*s, 1*s, 6*s);
      g.fillRect(18*s, 10*s, 1*s, 6*s);
      g.fillRect(24*s, 10*s, 1*s, 6*s);
      g.fillRect(28*s, 10*s, 1*s, 6*s);
      g.fillStyle(silver, 1);
      g.fillRect(12*s, 5*s, 19*s, 5*s);
      g.fillRect(10*s, 7*s, 3*s, 3*s);
      g.fillRect(30*s, 6*s, 3*s, 4*s);
      g.fillRect(33*s, 7*s, 3*s, 3*s);
      g.fillRect(36*s, 8*s, 3*s, 2*s);
      g.fillRect(38*s, 9*s, 3*s, 1*s);
      g.fillStyle(glass, 1);
      g.fillRect(11*s, 7*s, 4*s, 3*s);
      g.fillRect(17*s, 6*s, 6*s, 4*s);
      g.fillRect(25*s, 6*s, 6*s, 4*s);
      g.fillStyle(silverDk, 1);
      g.fillRect(15*s, 5*s, 2*s, 5*s);
      g.fillRect(23*s, 5*s, 2*s, 5*s);
      g.fillStyle(fluxBlue, 1);
      g.fillRect(0*s, 9*s, 2*s, 4*s);
      g.fillStyle(fluxGlow, 1);
      g.fillRect(0*s, 10*s, 1*s, 2*s);
      g.fillStyle(0xff4400, 1);
      g.fillRect(3*s, 11*s, 1*s, 1*s);
      g.fillStyle(0x00ff88, 1);
      g.fillRect(3*s, 12*s, 1*s, 1*s);
      g.fillStyle(0xffdd00, 1);
      g.fillRect(3*s, 13*s, 1*s, 1*s);
      g.fillStyle(headlit, 1);
      g.fillRect(42*s, 11*s, 2*s, 3*s);
      g.fillStyle(0xffffff, 1);
      g.fillRect(42*s, 11*s, 1*s, 1*s);
      g.fillStyle(taillit, 1);
      g.fillRect(2*s, 11*s, 1*s, 3*s);

      // --- Hover wheel pods: wheels rotated 90°, hanging down as thrusters ---
      // Rear pod arm
      g.fillStyle(silverDk, 1);
      g.fillRect(8*s, 17*s, 4*s, 3*s);
      g.fillRect(34*s, 17*s, 4*s, 3*s);

      // Wheel pod (horizontal ellipse rotated to vertical oval)
      g.fillStyle(wheel, 1);
      g.fillRect(8*s, 20*s, 4*s, 6*s);
      g.fillRect(34*s, 20*s, 4*s, 6*s);

      // Pod highlight
      g.fillStyle(0x383838, 1);
      g.fillRect(9*s, 20*s, 2*s, 5*s);
      g.fillRect(35*s, 20*s, 2*s, 5*s);

      // Hub ring
      g.fillStyle(hubCol, 1);
      g.fillRect(9*s, 21*s, 2*s, 3*s);
      g.fillRect(35*s, 21*s, 2*s, 3*s);

      // Thruster flame (animated: 2 frames)
      if (thrusterFrame === 0) {
        g.fillStyle(0xffffff, 1);
        g.fillRect(9*s, 26*s, 2*s, 1*s);
        g.fillStyle(0xffff40, 1);
        g.fillRect(9*s, 27*s, 2*s, 2*s);
        g.fillStyle(0xff8800, 1);
        g.fillRect(8*s, 29*s, 4*s, 2*s);
        g.fillStyle(0xff4400, 1);
        g.fillRect(9*s, 31*s, 2*s, 2*s);
        g.fillRect(35*s, 26*s, 2*s, 1*s);
        g.fillStyle(0xffff40, 1);
        g.fillRect(35*s, 27*s, 2*s, 2*s);
        g.fillStyle(0xff8800, 1);
        g.fillRect(34*s, 29*s, 4*s, 2*s);
        g.fillStyle(0xff4400, 1);
        g.fillRect(35*s, 31*s, 2*s, 2*s);
      } else {
        g.fillStyle(0xffffff, 1);
        g.fillRect(9*s, 26*s, 2*s, 2*s);
        g.fillStyle(0xffff40, 1);
        g.fillRect(8*s, 28*s, 4*s, 2*s);
        g.fillStyle(0xff8800, 1);
        g.fillRect(9*s, 30*s, 2*s, 2*s);
        g.fillStyle(0xff4400, 1);
        g.fillRect(8*s, 32*s, 4*s, 1*s);
        g.fillStyle(0xffffff, 1);
        g.fillRect(35*s, 26*s, 2*s, 2*s);
        g.fillStyle(0xffff40, 1);
        g.fillRect(34*s, 28*s, 4*s, 2*s);
        g.fillStyle(0xff8800, 1);
        g.fillRect(35*s, 30*s, 2*s, 2*s);
        g.fillStyle(0xff4400, 1);
        g.fillRect(34*s, 32*s, 4*s, 1*s);
      }

      g.generateTexture(key, W*s, (H + 12)*s);
      g.clear();
    };

    if (this.textures.exists('delorean-hover-1')) this.textures.remove('delorean-hover-1');
    if (this.textures.exists('delorean-hover-2')) this.textures.remove('delorean-hover-2');
    drawDeloreanHover('delorean-hover-1', 0);
    drawDeloreanHover('delorean-hover-2', 1);

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

    // --- Parallax city skyline (far layer) ---
    this.buildingsFar = [];
    const farY = groundY;
    let x = 0;
    while (x < w + 100) {
      const type = Phaser.Math.RND.pick(['buildingA', 'buildingB', 'buildingC']);
      const bld = this.add.image(x, farY, type).setOrigin(0, 1);
      bld.setScale(BUILDING_SCALE);
      bld.setTint(0x9898b0);
      bld.setDepth(-3);
      bld.setAlpha(0.7);
      this.buildingsFar.push(bld);
      this.tryAttachBillboard(bld, 0.04, 0.35);
      x += bld.displayWidth + Phaser.Math.Between(5, 20);
    }

    // --- Parallax city skyline (near layer) ---
    this.buildingsNear = [];
    x = 0;
    while (x < w + 100) {
      const type = Phaser.Math.RND.pick(['buildingA', 'buildingB', 'buildingC']);
      const bld = this.add.image(x, farY, type).setOrigin(0, 1);
      bld.setScale(BUILDING_SCALE);
      bld.setDepth(-2);
      bld.setAlpha(0.85);
      this.buildingsNear.push(bld);
      this.tryAttachBillboard(bld, 0.08, 0.5);
      x += bld.displayWidth + Phaser.Math.Between(2, 15);
    }

    // Clouds
    this.clouds = [];
    for (let i = 0; i < 4; i++) {
      this.spawnCloud(Phaser.Math.Between(50, w - 50), Phaser.Math.Between(20, h * 0.25));
    }

    // Celestial bodies (Sun & Moon)
    this.dayColor = Phaser.Display.Color.ValueToColor('#88d0f0');
    this.nightColor = Phaser.Display.Color.ValueToColor('#081030');
    this.sun = this.add.circle(w / 2, 0, 30 * WORLD_SCALE, 0xfff000).setDepth(-5);
    this.moon = this.add.circle(w / 2, 0, 24 * WORLD_SCALE, 0xeeeeee).setDepth(-5);

    // Ground (sidewalk + road)
    this.ground = this.add.tileSprite(w / 2, groundY, w * 2, 22 * WORLD_SCALE, 'ground');
    this.physics.add.existing(this.ground, true);
    this.groundY = groundY;
    this.roadTopY = this.ground.y - this.ground.displayHeight / 2;

    // Player (DeLorean)
    this.player = this.physics.add.sprite(100, groundY - 30, 'delorean');
    this.player.setScale(WORLD_SCALE);
    this.player.setY(this.roadTopY - this.player.displayHeight / 2 + 2);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.ground);

    if (this.anims.exists('delorean-drive')) this.anims.remove('delorean-drive');
    this.anims.create({
      key: 'delorean-drive',
      frames: [
        { key: 'delorean-drive-1' },
        { key: 'delorean-drive-2' }
      ],
      frameRate: 10,
      repeat: -1
    });

    if (this.anims.exists('delorean-hover')) this.anims.remove('delorean-hover');
    this.anims.create({
      key: 'delorean-hover',
      frames: [
        { key: 'delorean-hover-1' },
        { key: 'delorean-hover-2' }
      ],
      frameRate: 14,
      repeat: -1
    });

    this.player.play('delorean-drive');
    this.isHovering = false;

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
      this.player.setVelocityY(-550);
      playJumpSound();
    }
  }

  _updateHoverMode() {
    const HOVER_THRESHOLD = 40; // pixels above ground before hover kicks in
    const playerBottom = this.player.y + this.player.displayHeight / 2;
    const distanceFromGround = this.roadTopY - playerBottom;

    const highEnough = distanceFromGround > HOVER_THRESHOLD;
    const onGround = this.player.body.blocked.down || this.player.body.touching.down;

    if (!onGround && highEnough && !this.isHovering) {
      this.isHovering = true;
      this.player.play('delorean-hover');
    } else if ((onGround || !highEnough) && this.isHovering) {
      this.isHovering = false;
      this.player.play('delorean-drive');
    } else if (onGround && !this.isHovering && this.player.anims.currentAnim?.key !== 'delorean-drive') {
      this.player.play('delorean-drive', true);
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
    cloud.setScale(WORLD_SCALE);
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
    let randomScaleY = WORLD_SCALE;
    let randomScaleX = WORLD_SCALE;

    switch (type) {
      case 'bird':
        yOffset = Phaser.Math.Between(110, 160); // high enough to pass under
        hitW = 66; // 11 * 6
        hitH = 24; // 4 * 6
        velMultiplier = 1.6; // travel faster
        break;
      case 'tree':
        randomScaleY = WORLD_SCALE * Phaser.Math.FloatBetween(0.8, 1.2);
        yOffset = 30 * randomScaleY - 2 * WORLD_SCALE; // keep base planted with larger scale
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
    
    if (type !== 'tree') {
      yOffset *= WORLD_SCALE;
    }

    const obs = this.obstacles.create(w + 20, this.groundY - yOffset, tex);
    obs.setVelocityX(-this.gameSpeed * velMultiplier);
    obs.setScale(randomScaleX, randomScaleY);
    
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

  canSpawnObstacle() {
    const rightmostObstacle = this.obstacles.getChildren().reduce((maxX, obs) => {
      const rightEdge = obs.x + (obs.displayWidth || 0) / 2;
      return Math.max(maxX, rightEdge);
    }, -Infinity);

    if (rightmostObstacle === -Infinity) return true;
    return rightmostObstacle < this.scale.width - MIN_OBSTACLE_GAP_PX * WORLD_SCALE;
  }

  spawnCertificate() {
    const w = this.scale.width;
    const yPos = this.groundY - Phaser.Math.Between(60, 140);

    // Pick tier based on rarity: 70% Foundational, 20% Associate, 10% Pro
    const roll = Phaser.Math.Between(1, 100);
    let tier, texKey, auraColor, points;
    if (roll <= 70) {
      tier = 'bronze'; texKey = 'cert-bronze'; auraColor = 0xcc7730; points = 50;
    } else if (roll <= 90) {
      tier = 'silver'; texKey = 'cert-silver'; auraColor = 0x88aadd; points = 100;
    } else {
      tier = 'gold';   texKey = 'cert-gold';   auraColor = 0xffcc00; points = 200;
    }

    const cert = this.certificates.create(w + 50, yPos, texKey);
    cert.setScale(1.5 * WORLD_SCALE);
    cert.setDepth(1);
    cert.setVelocityX(-this.gameSpeed * 1.2);
    cert.waveTime = 0;
    cert.baseY = yPos;
    cert.pointsValue = points;
    cert.tier = tier;

    // Create aura
    cert.aura = this.add.graphics();
    cert.aura.fillStyle(auraColor, 0.6);
    cert.aura.fillCircle(0, 0, 24 * WORLD_SCALE);
    cert.aura.setDepth(0);

    // Tween aura to pulse rapidly
    this.tweens.add({
      targets: cert.aura,
      scaleX: 2.2 * WORLD_SCALE,
      scaleY: 2.2 * WORLD_SCALE,
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
    const pts = cert.pointsValue || 50;
    cert.destroy();
    this.score += pts;
    this.scoreText.setText(Math.floor(this.score).toString());
    playYeahSound();
    this.certActive = false;
    this.certSpawnTimer = 0;
  }

  handleCollision() {
    this.isDead = true;
    this.physics.pause();
    this.player.stop();
    this.player.setTint(0xff4020);
    stopBGM();
    playHitSound();

    this.time.delayedCall(1000, () => {
      this.scene.start('GameOver', { score: Math.floor(this.score) });
    });
  }

  tryAttachBillboard(building, chance, alpha) {
    if (this.activeBillboard) return;
    if (Phaser.Math.FloatBetween(0, 1) > chance) return;

    const panel = this.add.rectangle(0, 0, 10, 10, 0xffffff, 0.95).setOrigin(0.5);
    panel.setStrokeStyle(2, 0xc8ccd4, 0.95);
    panel.setDepth(building.depth + 0.15);

    const logoKey = Phaser.Math.RND.pick(['claranet-logo', 'aws-logo']);
    const billboard = this.add.image(0, 0, logoKey).setOrigin(0.5);
    billboard.setDepth(building.depth + 0.2);
    billboard.setAlpha(Math.min(0.9, alpha + 0.28));
    billboard.setBlendMode(Phaser.BlendModes.NORMAL);

    // Keep the logo subtle and proportionate to each building width.
    const targetWidth = building.displayWidth * 0.45;
    billboard.setScale(targetWidth / billboard.width);

    const panelWidth = billboard.displayWidth + 20;
    const panelHeight = billboard.displayHeight + 14;
    panel.setSize(panelWidth, panelHeight);

    const poleHeight = Math.max(16, panelHeight * 0.55);
    const poleOffsetX = panelWidth * 0.28;
    const poleLeft = this.add.rectangle(0, 0, 4, poleHeight, 0x5a5f6b, 0.9).setOrigin(0.5, 1);
    const poleRight = this.add.rectangle(0, 0, 4, poleHeight, 0x5a5f6b, 0.9).setOrigin(0.5, 1);
    poleLeft.setDepth(building.depth + 0.1);
    poleRight.setDepth(building.depth + 0.1);

    const baseBeam = this.add.rectangle(0, 0, panelWidth * 0.72, 4, 0x454b57, 0.85).setOrigin(0.5, 0.5);
    baseBeam.setDepth(building.depth + 0.12);

    building.billboardPanel = panel;
    building.billboardPoleLeft = poleLeft;
    building.billboardPoleRight = poleRight;
    building.billboardBeam = baseBeam;
    building.billboard = billboard;
    this.activeBillboard = billboard;
    this.positionBillboard(building);
  }

  positionBillboard(building) {
    if (!building.billboard) return;
    const x = building.x + building.displayWidth * 0.5;
    const roofY = building.y - building.displayHeight;
    const y = roofY - building.billboard.displayHeight / 2 - 28;

    const panel = building.billboardPanel;
    const poleLeft = building.billboardPoleLeft;
    const poleRight = building.billboardPoleRight;
    const beam = building.billboardBeam;

    if (panel) {
      panel.x = x;
      panel.y = y;
    }

    if (poleLeft && poleRight) {
      const panelWidth = panel ? panel.width : building.billboard.displayWidth + 20;
      const poleOffsetX = panelWidth * 0.28;
      const poleTopY = y + (panel ? panel.height / 2 : building.billboard.displayHeight / 2 + 7);

      poleLeft.x = x - poleOffsetX;
      poleLeft.y = roofY;
      poleRight.x = x + poleOffsetX;
      poleRight.y = roofY;

      if (beam) {
        beam.x = x;
        beam.y = poleTopY + 2;
      }
    }

    building.billboard.x = x;
    building.billboard.y = y;
  }

  clearBillboard(building) {
    if (!building.billboard) return;
    if (building.billboardPanel) {
      building.billboardPanel.destroy();
      building.billboardPanel = null;
    }
    if (building.billboardPoleLeft) {
      building.billboardPoleLeft.destroy();
      building.billboardPoleLeft = null;
    }
    if (building.billboardPoleRight) {
      building.billboardPoleRight.destroy();
      building.billboardPoleRight = null;
    }
    if (building.billboardBeam) {
      building.billboardBeam.destroy();
      building.billboardBeam = null;
    }
    building.billboard.destroy();
    building.billboard = null;
    this.activeBillboard = null;
  }

  scrollParallaxLayer(buildings, speed, delta, billboardChance, billboardAlpha) {
    const w = this.scale.width;
    buildings.forEach(bld => {
      bld.x -= speed * delta / 1000;
      this.positionBillboard(bld);
    });

    // Find rightmost building
    let maxX = -Infinity;
    buildings.forEach(b => { if (b.x + b.displayWidth > maxX) maxX = b.x + b.displayWidth; });

    // Recycle buildings that go off-screen left
    buildings.forEach(bld => {
      if (bld.x + bld.displayWidth < -10) {
        this.clearBillboard(bld);
        bld.x = maxX + Phaser.Math.Between(2, 20);
        maxX = bld.x + bld.displayWidth;
        this.tryAttachBillboard(bld, billboardChance, billboardAlpha);
        this.positionBillboard(bld);
      }
    });
  }

  update(time, delta) {
    if (this.isDead) return;

    this._updateHoverMode();

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
    this.scrollParallaxLayer(this.buildingsFar, this.gameSpeed * 0.15, delta, 0.04, 0.35);
    this.scrollParallaxLayer(this.buildingsNear, this.gameSpeed * 0.4, delta, 0.08, 0.5);

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
      if (!obs.passed && obs.x + (obs.displayWidth || 0) < this.player.x) {
        obs.passed = true;
        this.score += obs.pointsValue;
      }

      if (obs.x < -80 * WORLD_SCALE) {
        obs.destroy();
      } else if (obs.isBird) {
        obs.waveTime += delta * 0.005;
        obs.setVelocityY(Math.cos(obs.waveTime) * 60);
        obs.setVelocityX(-this.gameSpeed * 1.6);
      } else if (obs.texture && obs.texture.key === 'ferrari') {
        obs.setVelocityX(-this.gameSpeed * 2.8);
      } else {
        obs.setVelocityX(-this.gameSpeed);
      }
    });

    // Spawn obstacles with wider spacing and a minimum horizontal gap
    this.spawnTimer += delta;
    if (this.spawnTimer > this.nextSpawnDelay && this.canSpawnObstacle()) {
      this.spawnTimer = 0;
      this.nextSpawnDelay = Phaser.Math.Between(MIN_SPAWN_DELAY_MS, MAX_SPAWN_DELAY_MS);
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
