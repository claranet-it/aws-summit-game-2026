import Phaser from 'phaser';

const PALETTE = {
  // Sky
  sky: 0x88d0f0,
  // City ground (sidewalk / road)
  sidewalk: 0xc0b8a8,
  sidewalkLt: 0xd0c8b8,
  road: 0x585860,
  roadLine: 0xe8e040,
  curb: 0x989088,
  // Buildings
  bldgA: 0x6878a0,
  bldgADark: 0x506088,
  bldgB: 0xa07868,
  bldgBDark: 0x886050,
  bldgC: 0x889098,
  bldgCDark: 0x687880,
  windowLit: 0xf0e868,
  windowOff: 0x384050,
  roofDark: 0x484848,
  // Student
  skin: 0xf0c090,
  skinDark: 0xd0a070,
  hair: 0x483020,
  shirt: 0x3878c8,
  shirtDark: 0x2858a0,
  pants: 0x384858,
  pantsDark: 0x283040,
  shoes: 0x282828,
  backpack: 0xd04848,
  backpackDk: 0xa03030,
  // Certificate
  certPaper: 0xf8f0d0,
  certBorder: 0xc8a848,
  certSeal: 0xd04040,
  certText: 0x484848,
  // Hydrant
  hydrantRed: 0xd03030,
  hydrantDark: 0xa02020,
  hydrantCap: 0xe04848,
  hydrantBolt: 0xc0c0c0,
  // Tree
  treeTrunk: 0x8b5e3c,
  treeTrunkDk: 0x6b4226,
  treeLeaf: 0x38a838,
  treeLeafLt: 0x60c860,
  treeLeafDk: 0x207820,
  // Mailbox
  mailBody: 0x2860a8,
  mailBodyDk: 0x184880,
  mailTop: 0x3070c0,
  mailFlag: 0xd03030,
  mailLeg: 0x585858,
  // Cloud
  cloudColor: 0xf0f8f8,
  // Bird
  birdBody: 0x000000,
  birdWing: 0x222222
};

export { PALETTE };

export default class Preloader extends Phaser.Scene {
  constructor() {
    super('Preloader');
  }

  preload() {
    this.load.image('claranet-logo', 'claranet-logo-center.svg');
    this.load.image('aws-logo', 'aws-logo.svg');
  }

  create() {
    this.createGraphics();
    this.scene.start('MainMenu');
  }

  createGraphics() {
    const g = this.add.graphics();
    const s = 2;

    // --- Character sprite is now generated dynamically in Game.js ---

    // Helper to draw a hexagonal AWS-style cert badge
    const drawCert = (key, bg, border) => {
      const W = 20 * s;
      const H = 22 * s;
      const cx = W / 2;
      const cy = H / 2;
      const rx = W / 2 - s;
      const ry = H / 2 - s;

      const hexPts = (ox, oy, hrx, hry) => {
        const pts = [];
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 3) * i + Math.PI / 6;
          pts.push({ x: ox + hrx * Math.cos(a), y: oy + hry * Math.sin(a) });
        }
        return pts;
      };

      // Outer border hex
      g.fillStyle(border, 1);
      g.fillPoints(hexPts(cx, cy, rx, ry), true);
      // Inner bg hex
      g.fillStyle(bg, 1);
      g.fillPoints(hexPts(cx, cy, rx - 2 * s, ry - 2 * s), true);

      // Small horizontal line centered
      g.fillStyle(border, 1);
      g.fillRect(cx - 4*s, cy - s, 8*s, s);

      g.generateTexture(key, W, H);
      g.clear();
    };

    // --- Certificate tiers ---
    drawCert('cert-bronze', 0x2e3a47, 0x3d4552);
    drawCert('cert-silver', 0x2e3a47, 0x2630c2);
    drawCert('cert-gold',   0x2e3a47, 0x316f87);


    // --- Fire Hydrant (taller, scale 3) ---
    const hs = 3; // hydrant scale
    // Base
    g.fillStyle(PALETTE.hydrantDark, 1);
    g.fillRect(2 * hs, 8 * hs, 8 * hs, 2 * hs);
    // Body
    g.fillStyle(PALETTE.hydrantRed, 1);
    g.fillRect(3 * hs, 2 * hs, 6 * hs, 8 * hs);
    // Cap (top dome)
    g.fillStyle(PALETTE.hydrantCap, 1);
    g.fillRect(4 * hs, 0, 4 * hs, 3 * hs);
    g.fillRect(5 * hs, 0, 2 * hs, 1 * hs);
    // Side nozzles
    g.fillStyle(PALETTE.hydrantRed, 1);
    g.fillRect(1 * hs, 4 * hs, 2 * hs, 2 * hs);
    g.fillRect(9 * hs, 4 * hs, 2 * hs, 2 * hs);
    // Bolts
    g.fillStyle(PALETTE.hydrantBolt, 1);
    g.fillRect(5 * hs, 3 * hs, 2 * hs, 1 * hs);
    g.fillRect(5 * hs, 6 * hs, 2 * hs, 1 * hs);
    // Foot / base plate
    g.fillStyle(PALETTE.hydrantDark, 1);
    g.fillRect(2 * hs, 9 * hs, 8 * hs, 1 * hs);
    g.generateTexture('hydrant', 12 * hs, 10 * hs);
    g.clear();

    // --- Tree (taller obstacle, 14x20 base at scale 3 = 42x60) ---
    const ts = 3;
    // Trunk
    g.fillStyle(PALETTE.treeTrunk, 1);
    g.fillRect(5 * ts, 12 * ts, 4 * ts, 8 * ts);
    g.fillStyle(PALETTE.treeTrunkDk, 1);
    g.fillRect(5 * ts, 12 * ts, 1 * ts, 8 * ts);
    // Canopy (big rounded shape)
    g.fillStyle(PALETTE.treeLeaf, 1);
    g.fillRect(2 * ts, 2 * ts, 10 * ts, 10 * ts);
    g.fillRect(1 * ts, 4 * ts, 12 * ts, 6 * ts);
    g.fillRect(3 * ts, 1 * ts, 8 * ts, 2 * ts);
    // Highlights
    g.fillStyle(PALETTE.treeLeafLt, 1);
    g.fillRect(5 * ts, 2 * ts, 4 * ts, 3 * ts);
    g.fillRect(3 * ts, 4 * ts, 3 * ts, 3 * ts);
    // Shadows
    g.fillStyle(PALETTE.treeLeafDk, 1);
    g.fillRect(2 * ts, 9 * ts, 10 * ts, 2 * ts);
    g.fillRect(8 * ts, 5 * ts, 4 * ts, 4 * ts);
    g.generateTexture('tree', 14 * ts, 20 * ts);
    g.clear();

    // --- Mailbox (same height as hydrant, 8x10 base at scale 3 = 24x30) ---
    const ms = 3;
    // Leg / post
    g.fillStyle(PALETTE.mailLeg, 1);
    g.fillRect(3 * ms, 6 * ms, 2 * ms, 4 * ms);
    // Body
    g.fillStyle(PALETTE.mailBody, 1);
    g.fillRect(0, 1 * ms, 8 * ms, 5 * ms);
    // Top rounded
    g.fillStyle(PALETTE.mailTop, 1);
    g.fillRect(0, 0, 8 * ms, 2 * ms);
    // Dark side
    g.fillStyle(PALETTE.mailBodyDk, 1);
    g.fillRect(0, 1 * ms, 1 * ms, 5 * ms);
    // Mail slot
    g.fillStyle(0x181830, 1);
    g.fillRect(2 * ms, 3 * ms, 4 * ms, 1 * ms);
    // Flag
    g.fillStyle(PALETTE.mailFlag, 1);
    g.fillRect(7 * ms, 1 * ms, 1 * ms, 3 * ms);
    g.fillRect(7 * ms, 1 * ms, 2 * ms, 1 * ms);
    g.generateTexture('mailbox', 9 * ms, 10 * ms);
    g.clear();

    // --- City Ground (sidewalk) ---
    const gw = 640;
    // Sidewalk
    g.fillStyle(PALETTE.sidewalk, 1);
    g.fillRect(0, 0, gw, 10);
    // Sidewalk lighter tiles
    g.fillStyle(PALETTE.sidewalkLt, 1);
    for (let i = 0; i < gw; i += 40) {
      g.fillRect(i, 0, 20, 10);
    }
    // Curb edge
    g.fillStyle(PALETTE.curb, 1);
    g.fillRect(0, 10, gw, 4);
    // Road
    g.fillStyle(PALETTE.road, 1);
    g.fillRect(0, 14, gw, 8);
    // Dashed center line
    g.fillStyle(PALETTE.roadLine, 1);
    for (let i = 0; i < gw; i += 30) {
      g.fillRect(i, 17, 15, 2);
    }
    g.generateTexture('ground', gw, 22);
    g.clear();

    // --- Building A (tall, blue-grey) ---
    const bw = 60; const bh = 140;
    g.fillStyle(PALETTE.bldgA, 1);
    g.fillRect(0, 0, bw, bh);
    g.fillStyle(PALETTE.bldgADark, 1);
    g.fillRect(0, 0, 6, bh);
    // Windows
    for (let row = 10; row < bh - 10; row += 18) {
      for (let col = 10; col < bw - 8; col += 14) {
        g.fillStyle(Math.random() > 0.4 ? PALETTE.windowLit : PALETTE.windowOff, 1);
        g.fillRect(col, row, 8, 10);
      }
    }
    // Roof line
    g.fillStyle(PALETTE.roofDark, 1);
    g.fillRect(0, 0, bw, 4);
    g.generateTexture('buildingA', bw, bh);
    g.clear();

    // --- Building B (shorter, brownish) ---
    const bw2 = 50; const bh2 = 100;
    g.fillStyle(PALETTE.bldgB, 1);
    g.fillRect(0, 0, bw2, bh2);
    g.fillStyle(PALETTE.bldgBDark, 1);
    g.fillRect(0, 0, 5, bh2);
    for (let row = 8; row < bh2 - 10; row += 16) {
      for (let col = 8; col < bw2 - 6; col += 12) {
        g.fillStyle(Math.random() > 0.5 ? PALETTE.windowLit : PALETTE.windowOff, 1);
        g.fillRect(col, row, 6, 8);
      }
    }
    g.fillStyle(PALETTE.roofDark, 1);
    g.fillRect(0, 0, bw2, 3);
    g.generateTexture('buildingB', bw2, bh2);
    g.clear();

    // --- Building C (medium, grey-green) ---
    const bw3 = 70; const bh3 = 120;
    g.fillStyle(PALETTE.bldgC, 1);
    g.fillRect(0, 0, bw3, bh3);
    g.fillStyle(PALETTE.bldgCDark, 1);
    g.fillRect(0, 0, 7, bh3);
    for (let row = 10; row < bh3 - 10; row += 20) {
      for (let col = 10; col < bw3 - 8; col += 16) {
        g.fillStyle(Math.random() > 0.45 ? PALETTE.windowLit : PALETTE.windowOff, 1);
        g.fillRect(col, row, 10, 12);
      }
    }
    g.fillStyle(PALETTE.roofDark, 1);
    g.fillRect(0, 0, bw3, 4);
    g.generateTexture('buildingC', bw3, bh3);
    g.clear();

    // --- Cloud ---
    g.fillStyle(PALETTE.cloudColor, 1);
    g.fillRect(4 * s, 0, 12 * s, 4 * s);
    g.fillRect(0, 2 * s, 20 * s, 4 * s);
    g.fillRect(2 * s, 6 * s, 16 * s, 2 * s);
    g.generateTexture('cloud', 20 * s, 8 * s);
    g.clear();

    // --- Bird generator ---
    const drawBird = (key, wingState) => {
      const bs = 4; // Double scale for bird

      g.fillStyle(PALETTE.birdBody, 1);
      g.fillRect(2 * bs, 1 * bs, 6 * bs, 2 * bs); // body
      g.fillRect(7 * bs, 0, 2 * bs, 2 * bs);   // head

      g.fillStyle(0xffcc00, 1);       // yellow beak
      g.fillRect(9 * bs, 1 * bs, 2 * bs, 1 * bs);

      g.fillStyle(PALETTE.birdWing, 1);
      if (wingState === 0) {
        g.fillRect(3 * bs, 0, 4 * bs, 1 * bs);   // wing up
      } else {
        g.fillRect(3 * bs, 2 * bs, 4 * bs, 1 * bs); // wing down
      }

      g.generateTexture(key, 11 * bs, 4 * bs);
      g.clear();
    };

    drawBird('bird-up', 0);
    drawBird('bird-down', 1);

    // --- Ferrari Testarossa ---
    const cs = 4; // Scaled up!
    // Wheels
    g.fillStyle(0x111111, 1); 
    g.fillRect(3 * cs, 6 * cs, 4 * cs, 2 * cs);
    g.fillRect(19 * cs, 6 * cs, 4 * cs, 2 * cs);
    
    // Body base
    g.fillStyle(0xdd1111, 1); 
    g.fillRect(0, 3 * cs, 26 * cs, 4 * cs);
    
    // Iconic Side Strakes
    g.fillStyle(0x880000, 1);
    g.fillRect(10 * cs, 4 * cs, 8 * cs, 1 * cs);
    g.fillRect(10 * cs, 5 * cs, 8 * cs, 1 * cs);

    // Roof
    g.fillStyle(0xdd1111, 1); 
    g.fillRect(7 * cs, 0, 11 * cs, 3 * cs);
    
    // Windows (windshield on left because car moves to left)
    g.fillStyle(0x223344, 1); 
    g.fillRect(7 * cs, 1 * cs, 4 * cs, 2 * cs); // front windshield
    g.fillRect(12 * cs, 1 * cs, 5 * cs, 2 * cs); // side window

    // Headlight (pop-up or front grill)
    g.fillStyle(0xffffcc, 1); 
    g.fillRect(0, 4 * cs, 1 * cs, 1 * cs);

    // Rear bumper & spoiler
    g.fillStyle(0x222222, 1); 
    g.fillRect(25 * cs, 3 * cs, 1 * cs, 4 * cs);
    g.fillStyle(0xdd1111, 1);
    g.fillRect(24 * cs, 2 * cs, 3 * cs, 1 * cs); // spoiler wing

    g.generateTexture('ferrari', 27 * cs, 8 * cs);
    g.clear();
  }
}
