window.CONFIG = {
  FPS: 24,
  VW: 1600, VH: 900,
  ASSET_DIR: '',

  SKY: [ // fallback behind the painted sky panel
    [0.00, '#2a2d4f'], [0.35, '#69527a'], [0.55, '#c97b7b'],
    [0.75, '#e89f71'], [1.00, '#fcd49a']
  ],
  SUN: { x: 1000, y: 190, w: 110, glowR: 320, glowA: 0.5 },

  LAYERS: [
    { art: 'mountains',  x: -60,  y: -115, w: 1720, px: 0.15 }, // painted sky+ridges panel
    { art: 'lake',       x: -60,  y: 312,  w: 1720, px: 0.25 },
    { art: 'glitter_warm', x: 870, y: 318, w: 380,  px: 0.25, black: true, alpha: 0.5 },
    { art: 'hill',       x: -50,  y: 560,  w: 1700, px: 0.50 },
    { art: 'ring_dead',  x: 560,  y: 620,  w: 470,  px: 0.50, state: 'fire_dead' },
    { art: 'ring_small', x: 560,  y: 620,  w: 470,  px: 0.50, state: 'fire_small' },
    { art: 'ring_ember', x: 560,  y: 620,  w: 470,  px: 0.50, state: 'fire_ember' },
    { art: 'wood_pile',  x: 1080, y: 560,  w: 240,  px: 0.50 },
    { art: 'satchel_closed', x: 990, y: 700, w: 330, px: 0.60, state: 'satchel_closed' },
    { art: 'satchel_open',   x: 990, y: 700, w: 330, px: 0.60, state: 'satchel_open' },
    { art: 'fringe',     x: -60,  y: 800,  w: 1720, px: 1.00 }
  ],
  CLOUDS: [
    { row: 0, x: -150, y: 30,  w: 1500, alpha: 0.8, speed: 10 },
    { row: 1, x: 300,  y: 110, w: 1400, alpha: 0.65, speed: 5 }
  ],
  GRADE: { warm: 'rgba(255,146,60,0.10)', vignette: 'rgba(24,12,34,0.42)' },

  HITBOXES: [
    { id: 'wood',    x: 1080, y: 560, w: 240, h: 220 },
    { id: 'ring',    x: 560,  y: 620, w: 470, h: 200 },
    { id: 'satchel', x: 990,  y: 700, w: 330, h: 210 }
  ],

  // fraction of the source image to cut away [left, top, right, bottom]
  CROPS: { mountains: [0.12, 0.33, 0.12, 0.34] },

  FILES: {
    mountains: '01_mountains.jpg',   lake: '02_lake.jpg',
    hill: '03_hill.jpg',             fringe: '04_fringe.jpg',
    ring_dead: '05_ring_dead.jpg',   ring_ember: '06_ring_ember.jpg',
    ring_small: '07_ring_small.jpg', wood: '08_wood.jpg',
    satchel_closed: '09_satchel_closed.jpg', satchel_open: '10_satchel_open.jpg',
    glyphs: '11_glyphs.jpg',         clouds: '12_clouds.jpg',
    sun_moon: '13_sun_moon.jpg',     glitter_warm: '14_glitter_warm.jpg',
    glitter_moon: '15_glitter_moon.jpg', fire_sheet: '16_fire_sheet.jpg'
  },
  MAGENTA: ['mountains','lake','hill','fringe','ring_dead','ring_ember','ring_small',
            'wood','satchel_closed','satchel_open','glyphs','clouds','sun_moon'],
  BLACK: ['glitter_warm','glitter_moon','fire_sheet']
};
