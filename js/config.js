window.CONFIG = {
  FPS: 24,
  VW: 1600, VH: 900,
  ASSET_DIR: '', // Keep empty since files are in root

  // Tweaked to blend perfectly with the pink top of your mountains
  SKY: [
    [0.00, '#2a2d4f'], [0.30, '#69527a'], [0.55, '#c97b7b'], 
    [0.75, '#e89f71'], [1.00, '#fcd49a']
  ],
  SUN: { x: 1000, y: 248, w: 118, glowR: 300, glowA: 0.55 },

  LAYERS: [
    { art: 'mountains',    x: -60, y: 118, w: 1720, px: 0.15 },
    { art: 'lake',         x: -60, y: 306, w: 1720, px: 0.25 },
    { art: 'glitter_warm', x: 800, y: 310, w: 520,  px: 0.25, add: true, alpha: 0.85 },
    { art: 'hill',         x: -50, y: 468, w: 1700, px: 0.50 },
    
    // Fire states
    { art: 'ring_dead',    x: 560, y: 560, w: 470,  px: 0.50, state: 'fire_dead' },
    { art: 'ring_small',   x: 560, y: 560, w: 470,  px: 0.50, state: 'fire_small' },
    { art: 'ring_ember',   x: 560, y: 560, w: 470,  px: 0.50, state: 'fire_ember' },
    
    { art: 'wood_pile',    x: 1035, y: 520, w: 250, px: 0.50 },
    
    // Satchel states
    { art: 'satchel_closed', x: 975, y: 668, w: 340, px: 0.60, state: 'satchel_closed' },
    { art: 'satchel_open',   x: 975, y: 668, w: 340, px: 0.60, state: 'satchel_open' },
    
    { art: 'fringe',       x: -60, y: 795, w: 1720, px: 1.00 }
  ],
  
  CLOUDS: [
    { row: 0, x: -150, y: 30,  w: 1500, alpha: 0.85, speed: 12 },
    { row: 1, x: 300,  y: 150, w: 1400, alpha: 0.75, speed: 6 }
  ],
  
  GRADE: { warm: 'rgba(255,146,60,0.10)', vignette: 'rgba(24,12,34,0.42)' },

  // Invisible touch zones
  HITBOXES: [
    { id: 'wood', x: 1035, y: 520, w: 250, h: 200 },
    { id: 'ring', x: 560, y: 560, w: 470, h: 250 },
    { id: 'satchel', x: 975, y: 668, w: 340, h: 250 }
  ],

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
  ADD: ['glitter_warm','glitter_moon','fire_sheet']
};
