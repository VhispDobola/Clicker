// ========================
// VISUAL SYSTEM - COSMIC SPACE THEME WITH VISIBLE PROGRESSION
// ========================
var visualCanvas, visualCtx, w, h;
var stars = [], nebulas = [], comets = [], meteors = [], floatingParticles = [], portalParticles = [], orbitRings = [], edgePortals = [];
var portalParticles = [], orbitRings = [], edgePortals = [];
var planetRotation = 0, planetPulse = 0;
var clickEffectLevel = 0;
var floatingResources = [];
var orbitalDrones = [];
var moonObjects = [];
var shieldObjects = [];
var cityLights = [];
var cloudLayers = [];
var asteroidFields = [];
var wormholes = [];
var spaceships = [];
var cosmicEntities = [];

// Planet Evolution Stages
const PLANET_STAGES = {
    ROCK: 0,
    MAGMA: 1,
    OCEAN: 2,
    FOREST: 3,
    CIVILIZATION: 4,
    CLOUDS: 5,
    CITY_LIGHTS: 6,
    ORBITAL_RINGS: 7,
    CYBER: 8,
    DYSON: 9,
    TRANSCENDENT: 10
};

// Click Effect Levels
const CLICK_EFFECTS = {
    BASIC: 0,
    LASER: 1,
    EXPLOSION: 2,
    ELECTRICITY: 3,
    METEOR: 4,
    BLACK_HOLE: 5,
    QUANTUM: 6,
    COSMIC: 7
};

function getPlanetStage(totalL) {
    // DEBUG: Lower thresholds for testing - remove in production
    if (totalL < 1) return PLANET_STAGES.ROCK;
    if (totalL < 2) return PLANET_STAGES.MAGMA;
    if (totalL < 3) return PLANET_STAGES.OCEAN;
    if (totalL < 5) return PLANET_STAGES.FOREST;
    if (totalL < 7) return PLANET_STAGES.CIVILIZATION;
    if (totalL < 10) return PLANET_STAGES.CLOUDS;
    if (totalL < 15) return PLANET_STAGES.CITY_LIGHTS;
    if (totalL < 20) return PLANET_STAGES.ORBITAL_RINGS;
    if (totalL < 30) return PLANET_STAGES.CYBER;
    if (totalL < 45) return PLANET_STAGES.DYSON;
    return PLANET_STAGES.TRANSCENDENT;
}

function getClickEffectLevel(clickL) {
    if (clickL < 1) return CLICK_EFFECTS.BASIC;
    if (clickL < 2) return CLICK_EFFECTS.LASER;
    if (clickL < 3) return CLICK_EFFECTS.EXPLOSION;
    if (clickL < 5) return CLICK_EFFECTS.ELECTRICITY;
    if (clickL < 8) return CLICK_EFFECTS.METEOR;
    if (clickL < 12) return CLICK_EFFECTS.BLACK_HOLE;
    if (clickL < 18) return CLICK_EFFECTS.QUANTUM;
    return CLICK_EFFECTS.COSMIC;
}

function getShieldLevel(genL) {
    if (genL < 1) return 0;
    if (genL < 3) return 1;
    if (genL < 5) return 2;
    return 3;
}

function getDroneCount(genL) {
    if (genL < 1) return 0;
    if (genL < 2) return 1;
    if (genL < 3) return 2;
    if (genL < 5) return 3;
    if (genL < 8) return 5;
    return 8;
}

function getShipLevel(bossL) {
    if (bossL < 1) return 0;
    if (bossL < 2) return 1;
    if (bossL < 3) return 2;
    if (bossL < 5) return 3;
    if (bossL < 8) return 4;
    return 5;
}

function getMoonCount(spaceL) {
    if (spaceL < 1) return 0;
    if (spaceL < 2) return 1;
    if (spaceL < 3) return 2;
    if (spaceL < 5) return 3;
    return 4;
}

function initVisualProgression() {
    for (var i = 0; i < 30; i++) {
        var angle = (Math.PI * 2 * i) / 30;
        cityLights.push({
            baseAngle: angle,
            brightness: Math.random() * 0.5 + 0.5,
            size: Math.random() * 2 + 1,
            twinkleSpeed: Math.random() * 2 + 1
        });
    }
    
    for (var i = 0; i < 8; i++) {
        cloudLayers.push({
            offset: i * 0.8,
            speed: 0.0003 + Math.random() * 0.0002,
            opacity: 0.15 + Math.random() * 0.1
        });
    }
    
    for (var i = 0; i < 20; i++) {
        asteroidFields.push({
            x: Math.random() * 1000 - 500,
            y: Math.random() * 600 - 300,
            size: Math.random() * 3 + 1,
            speed: Math.random() * 0.3 + 0.1,
            rot: Math.random() * Math.PI * 2
        });
    }
}

initVisualProgression();

const ZONE_THEMES = {
    void: { bgGrad: ['#010108', '#050520'], nebulaColors: ['rgba(60,0,120,0.1)', 'rgba(0,40,120,0.1)'], starColors: ['#fff', '#aaf', '#faf'], particleColors: ['#4af', '#8af', '#aaf'], name: 'void' },
    quantum: { bgGrad: ['#0a0820', '#200060'], nebulaColors: ['rgba(100,0,255,0.15)', 'rgba(50,0,150,0.15)'], starColors: ['#fff', '#88f', '#f8f'], particleColors: ['#a4f', '#84f', '#c4f'], name: 'quantum' },
    time: { bgGrad: ['#151008', '#403010'], nebulaColors: ['rgba(200,150,50,0.12)', 'rgba(150,100,30,0.12)'], starColors: ['#fff', '#fc8', '#ffc'], particleColors: ['#fc8', '#da8', '#ba8'], name: 'time' },
    matter: { bgGrad: ['#150a18', '#300a25'], nebulaColors: ['rgba(255,100,150,0.15)', 'rgba(180,60,100,0.15)'], starColors: ['#fff', '#f8a', '#faf'], particleColors: ['#f8a', '#f6a', '#f4a'], name: 'matter' },
    light: { bgGrad: ['#151508', '#303010'], nebulaColors: ['rgba(255,255,100,0.12)', 'rgba(200,200,50,0.12)'], starColors: ['#fff', '#ffa', '#fff'], particleColors: ['#ffa', '#ff8', '#ff6'], name: 'light' },
    dark: { bgGrad: ['#020208', '#050515'], nebulaColors: ['rgba(30,30,100,0.12)', 'rgba(20,20,80,0.12)'], starColors: ['#fff', '#448', '#88a'], particleColors: ['#68c', '#58b', '#48a'], name: 'dark' },
    eternal: { bgGrad: ['#0a0a0a', '#151515'], nebulaColors: ['rgba(100,100,100,0.08)', 'rgba(60,60,60,0.08)'], starColors: ['#fff', '#ccc', '#eee'], particleColors: ['#aaa', '#888', '#666'], name: 'eternal' },
    infinity: { bgGrad: ['#0a0515', '#200a35'], nebulaColors: ['rgba(180,100,255,0.15)', 'rgba(120,50,200,0.15)'], starColors: ['#fff', '#d4f', '#f4d'], particleColors: ['#a4f', '#c4f', '#84f'], name: 'infinity' }
};

function getCurrentTheme() {
    const zone = GAME.currentZone || 'v';
    const theme = ZONE_THEMES[zone] || ZONE_THEMES.void;
    return theme;
}

function initVisuals() {
    visualCanvas = document.getElementById('bgCanvas');
    if (!visualCanvas) return;
    
    visualCtx = visualCanvas.getContext('2d');
    w = window.innerWidth;
    h = window.innerHeight;
    visualCanvas.width = w;
    visualCanvas.height = h;
    
    for (var i = 0; i < 400; i++) {
        stars.push({
            x: Math.random() * w,
            y: Math.random() * h,
            z: Math.random() * 2 + 0.5,
            size: Math.random() * 2.5 + 0.5,
            brightness: Math.random(),
            twinkle: Math.random() * Math.PI * 2,
            color: ['#fff','#aaf','#faf','#ffa','#aff','#fAA'][Math.floor(Math.random() * 6)]
        });
    }
    
    for (var n = 0; n < 6; n++) {
        nebulas.push({
            x: Math.random() * w,
            y: Math.random() * h,
            size: 150 + Math.random() * 200,
            color: ['rgba(60,0,120,0.08)','rgba(0,40,120,0.08)','rgba(120,40,0,0.08)'][Math.floor(Math.random() * 3)],
            vx: (Math.random() - 0.5) * 0.2
        });
    }
    
    requestAnimationFrame(render);
}

function getUpgradeCounts() {
    var counts = {click:0, gen:0, crit:0, combo:0, boss:0, space:0, special:0, total:0};
    try {
        if (GAME && GAME.upgrades && UPGRADES) {
            UPGRADES.forEach(function(u) {
                var level = GAME.upgrades[u.id] || 0;
                if (level > 0 && u.type) counts[u.type] = (counts[u.type] || 0) + level;
            });
            counts.total = Object.keys(GAME.upgrades).filter(function(k){ return GAME.upgrades[k] > 0; }).length;
        }
    } catch(e) {}
    return counts;
}

function render() {
    if (!visualCtx) return;
    
    var cx = w / 2;
    var cy = h / 2;
    planetRotation += 0.008;
    planetPulse += 0.02;
    
    var up = getUpgradeCounts();
    // DEBUG
    // console.log('Upgrade counts:', up);
    var clickL = up.click || 0;
    var genL = up.gen || 0;
    var critL = up.crit || 0;
    var comboL = up.combo || 0;
    var bossL = up.boss || 0;
    var spaceL = up.space || 0;
    var specialL = up.special || 0;
    var totalL = up.total || 0;
    
    // BACKGROUND - changes with zone theme and generator upgrades
    var theme = getCurrentTheme();
    var bgGrad = visualCtx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h));
    var genBoost = Math.min(genL * 0.5, 5);
    bgGrad.addColorStop(0, theme.bgGrad[0]);
    bgGrad.addColorStop(1, theme.bgGrad[1]);
    visualCtx.fillStyle = bgGrad;
    visualCtx.fillRect(0, 0, w, h);
    
    // STARS - colorful with click upgrades, themed by zone
    for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        s.twinkle += s.z * 0.08;
        var b = s.brightness * (0.6 + Math.sin(s.twinkle) * 0.3);
        
        if (clickL > 5) {
            var hue = (s.x / w) * 50 + clickL * 4;
            visualCtx.fillStyle = 'hsl(' + hue + ',75%,' + (65 + s.brightness * 35) + '%)';
        } else {
            visualCtx.fillStyle = theme.starColors[Math.floor(Math.random() * theme.starColors.length)];
        }
        
        visualCtx.globalAlpha = b;
        visualCtx.beginPath();
        visualCtx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        visualCtx.fill();
    }
    visualCtx.globalAlpha = 1;
    
    // NEBULAS - themed by zone
    var nebulaCount = 3 + Math.floor(genL * 0.3);
    for (var n = 0; n < Math.min(nebulaCount, nebulas.length); n++) {
        var nb = nebulas[n];
        nb.x += nb.vx;
        if (nb.x < -nb.size) nb.x = w + nb.size;
        if (nb.x > w + nb.size) nb.x = -nb.size;
        
        var ng = visualCtx.createRadialGradient(nb.x, nb.y, 0, nb.x, nb.y, nb.size * (1 + genL * 0.05));
        ng.addColorStop(0, theme.nebulaColors[n % 2]);
        ng.addColorStop(1, 'transparent');
        visualCtx.fillStyle = ng;
        visualCtx.fillRect(0, 0, w, h);
    }
    
    // FLOATING PARTICLES - with generators, themed by zone
    if (Math.random() < 0.004 + genL * 0.001) {
        var angle = Math.random() * Math.PI * 2;
        var dist = 100 + Math.random() * 80 + genL * 4;
        var pcol = theme.particleColors[Math.floor(Math.random() * theme.particleColors.length)];
        floatingParticles.push({
            x: cx + Math.cos(angle) * dist,
            y: cy + Math.sin(angle) * dist,
            vx: (Math.random() - 0.5) * 0.4,
            vy: -0.8 - Math.random() * 0.4 - genL * 0.04,
            size: 2 + Math.random() * 2 + genL * 0.08,
            alpha: 0.7,
            color: pcol
        });
    }
    
    for (var i = floatingParticles.length - 1; i >= 0; i--) {
        var p = floatingParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        var decay = p.decay || 0.004;
        p.alpha -= decay;
        
        if (p.type === 'molten') {
            p.life -= decay;
            if (p.life <= 0 || p.alpha <= 0 || p.y < -20) {
                floatingParticles.splice(i, 1);
                continue;
            }
            visualCtx.globalAlpha = p.alpha;
            var grd = visualCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
            grd.addColorStop(0, '#ffee88');
            grd.addColorStop(0.5, p.color);
            grd.addColorStop(1, 'transparent');
            visualCtx.fillStyle = grd;
            visualCtx.beginPath();
            visualCtx.arc(p.x, p.y, p.size * (1 + (1 - p.life) * 0.5), 0, Math.PI * 2);
            visualCtx.fill();
        } else {
            if (p.alpha <= 0 || p.y < -20) {
                floatingParticles.splice(i, 1);
                continue;
            }
            visualCtx.globalAlpha = p.alpha;
            visualCtx.fillStyle = p.color;
            visualCtx.beginPath();
            visualCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            visualCtx.fill();
        }
    }
    visualCtx.globalAlpha = 1;
    
    // COMETS - more with total upgrades
    if (Math.random() < 0.0015 + totalL * 0.0008) {
        comets.push({
            x: -40, y: Math.random() * h * 0.7,
            vx: 2.5 + Math.random() * 2.5 + totalL * 0.08,
            vy: 1.5 + Math.random() * 1.5,
            size: 1.5 + Math.random() * 1.5,
            trail: []
        });
    }
    
    for (var i = comets.length - 1; i >= 0; i--) {
        var c = comets[i];
        c.trail.push({x: c.x, y: c.y});
        if (c.trail.length > 20) c.trail.shift();
        c.x += c.vx;
        c.y += c.vy;
        
        if (c.x > w + 80 || c.y > h + 80) {
            comets.splice(i, 1);
            continue;
        }
        
        visualCtx.fillStyle = critL > 3 ? '#fa8' : '#acf';
        for (var j = 0; j < c.trail.length; j++) {
            var t = c.trail[j];
            visualCtx.globalAlpha = (j / c.trail.length) * 0.4;
            visualCtx.beginPath();
            visualCtx.arc(t.x, t.y, (j / c.trail.length) * c.size, 0, Math.PI * 2);
            visualCtx.fill();
        }
    }
    visualCtx.globalAlpha = 1;
    
    // METEORS - with boss upgrades
    if (Math.random() < 0.0008 + bossL * 0.0015) {
        meteors.push({
            x: Math.random() * w, y: -25,
            vx: 3.5 + Math.random() * 3.5 + bossL * 0.15,
            vy: 2.5 + Math.random() * 2.5,
            size: 1.5 + Math.random() * 1.5 + bossL * 0.08,
            life: 1,
            color: bossL > 2 ? '#ff6644' : '#fff'
        });
    }
    
    for (var i = meteors.length - 1; i >= 0; i--) {
        var m = meteors[i];
        m.x -= m.vx;
        m.y += m.vy;
        m.life -= 0.012;
        
        if (m.life <= 0 || m.y > h + 40) {
            meteors.splice(i, 1);
            continue;
        }
        
        visualCtx.fillStyle = m.color;
        visualCtx.globalAlpha = m.life;
        visualCtx.beginPath();
        visualCtx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
        visualCtx.fill();
    }
    visualCtx.globalAlpha = 1;
    
    // PLANET BASE SIZE - grows with total upgrades
    var r = 65 + Math.min(totalL * 1.5, 45);
    var planetStage = getPlanetStage(totalL);
    
    // Force visual evolution if any upgrades exist (for testing)
    if (totalL >= 1) planetStage = Math.max(planetStage, PLANET_STAGES.MAGMA);
    if (totalL >= 3) planetStage = Math.max(planetStage, PLANET_STAGES.OCEAN);
    if (totalL >= 5) planetStage = Math.max(planetStage, PLANET_STAGES.FOREST);
    if (totalL >= 7) planetStage = Math.max(planetStage, PLANET_STAGES.CIVILIZATION);
    if (totalL >= 10) planetStage = Math.max(planetStage, PLANET_STAGES.CLOUDS);
    if (totalL >= 15) planetStage = Math.max(planetStage, PLANET_STAGES.CITY_LIGHTS);
    
    // Force click effect based on click upgrades
    var forcedClickEffect = CLICK_EFFECTS.BASIC;
    if (clickL >= 1) forcedClickEffect = CLICK_EFFECTS.LASER;
    if (clickL >= 2) forcedClickEffect = CLICK_EFFECTS.EXPLOSION;
    if (clickL >= 3) forcedClickEffect = CLICK_EFFECTS.ELECTRICITY;
    if (clickL >= 5) forcedClickEffect = CLICK_EFFECTS.METEOR;
    if (clickL >= 8) forcedClickEffect = CLICK_EFFECTS.BLACK_HOLE;
    if (clickL >= 12) forcedClickEffect = CLICK_EFFECTS.QUANTUM;
    if (clickL >= 18) forcedClickEffect = CLICK_EFFECTS.COSMIC;
    
    clickEffectLevel = forcedClickEffect;
    
    // PLANET GLOW - changes based on planet stage
    var glowHue, glowSat, glowLight;
    switch(planetStage) {
        case PLANET_STAGES.ROCK:
            glowHue = 30; glowSat = 20; glowLight = 40;
            break;
        case PLANET_STAGES.MAGMA:
            glowHue = 15; glowSat = 80; glowLight = 50;
            break;
        case PLANET_STAGES.OCEAN:
            glowHue = 210; glowSat = 60; glowLight = 45;
            break;
        case PLANET_STAGES.FOREST:
            glowHue = 120; glowSat = 50; glowLight = 40;
            break;
        case PLANET_STAGES.CIVILIZATION:
            glowHue = 60; glowSat = 40; glowLight = 50;
            break;
        case PLANET_STAGES.CLOUDS:
            glowHue = 200; glowSat = 30; glowLight = 70;
            break;
        case PLANET_STAGES.CITY_LIGHTS:
            glowHue = 280; glowSat = 60; glowLight = 50;
            break;
        case PLANET_STAGES.ORBITAL_RINGS:
            glowHue = 180; glowSat = 70; glowLight = 55;
            break;
        case PLANET_STAGES.CYBER:
            glowHue = 300; glowSat = 90; glowLight = 60;
            break;
        case PLANET_STAGES.DYSON:
            glowHue = 45; glowSat = 100; glowLight = 70;
            break;
        default:
            glowHue = 0; glowSat = 0; glowLight = 90;
    }
    
    var comboBonus = Math.min(window.clickCombo || 1, 15) - 1;
    var glowR = r * (1.8 + Math.sin(planetPulse) * 0.12) * (1 + comboBonus * 0.05);
    var glowGrad = visualCtx.createRadialGradient(cx, cy, r * 0.25, cx, cy, glowR);
    glowGrad.addColorStop(0, 'hsl(' + glowHue + ',' + glowSat + '%,' + glowLight + '%)');
    glowGrad.addColorStop(0.4, 'hsl(' + glowHue + ',' + (glowSat - 10) + '%,' + (glowLight - 15) + '%)');
    glowGrad.addColorStop(1, 'transparent');
    visualCtx.fillStyle = glowGrad;
    visualCtx.globalAlpha = 0.6;
    visualCtx.fillRect(cx - glowR, cy - glowR, glowR * 2, glowR * 2);
    visualCtx.globalAlpha = 1;
    
    // CORONA ARCS - more with upgrades
    var coronaCount = 3 + Math.floor(totalL * 0.25);
    for (var i = 0; i < coronaCount; i++) {
        var ang = planetRotation * (i % 2 ? 1.7 : -1.4) + (Math.PI * 2 / coronaCount) * i;
        var arcR = r * (1.3 + Math.sin(planetPulse + i * 0.8) * 0.15);
        
        var coronaColor;
        if (planetStage >= PLANET_STAGES.CYBER) coronaColor = '#f0f';
        else if (planetStage >= PLANET_STAGES.MAGMA) coronaColor = '#f84';
        else if (critL > 3) coronaColor = '#fa4';
        else coronaColor = i % 2 ? '#aaf' : '#8ab';
        
        visualCtx.strokeStyle = coronaColor;
        visualCtx.globalAlpha = 0.4 - i * 0.06;
        visualCtx.lineWidth = 2.5 - i * 0.25;
        visualCtx.beginPath();
        visualCtx.arc(cx, cy, arcR, ang - 0.4, ang + 0.4);
        visualCtx.stroke();
    }
    visualCtx.globalAlpha = 1;
    
    // ========================
    // PLANET BODY - EVOLUTION STAGES
    // ========================
    renderPlanetBody(cx, cy, r, planetStage, totalL);
    
    // ========================
    // SURFACE DETAILS - based on stage
    // ========================
    renderSurfaceDetails(cx, cy, r, planetStage, totalL);
    
    // HIGHLIGHT
    visualCtx.fillStyle = 'rgba(255,255,255,0.28)';
    visualCtx.beginPath();
    visualCtx.arc(cx - r * 0.32, cy - r * 0.32, r * 0.32, 0, Math.PI * 2);
    visualCtx.fill();
    
    // ORBIT RINGS - appear with combo upgrades
    if (comboL > 0) {
        var ringCount = Math.min(8, Math.floor(comboL / 1.5));
        for (var ri = 0; ri < ringCount; ri++) {
            var ringR = r * (1.5 + ri * 0.25);
            var rot = planetRotation * (ri % 2 ? 1.15 : -0.95);
            var ringColors = ['#48f','#4f8','#f48','#f4f','#4ff','#ff4'];
            visualCtx.strokeStyle = ringColors[ri % ringColors.length];
            visualCtx.globalAlpha = 0.35 - ri * 0.035;
            visualCtx.lineWidth = 1.2;
            visualCtx.setLineDash([6 - ri * 0.5, 4 + ri * 0.6]);
            visualCtx.beginPath();
            visualCtx.ellipse(cx, cy, ringR, ringR * 0.26, rot, 0, Math.PI * 2);
            visualCtx.stroke();
        }
        visualCtx.setLineDash([]);
        visualCtx.globalAlpha = 1;
    }
    
    // ========================
    // NEW VISUAL PROGRESSION EFFECTS
    // ========================
    
    // Planet Shield - appears with generator upgrades
    var shieldLevel = getShieldLevel(genL);
    renderPlanetShield(cx, cy, r, shieldLevel, genL);
    
    // Orbital Drones - auto-clickers orbiting the planet
    renderOrbitalDrones(cx, cy, r, genL);
    
    // Spaceships - appear with boss upgrades
    renderSpaceships(cx, cy, r, bossL);
    
    // Background progression (asteroids, wormholes)
    renderBackgroundProgression(cx, cy, totalL, genL, clickL, spaceL);
    
    // Floating resource icons
    renderFloatingResources(cx, cy, r, genL);
    
    // Moons - unlock with space upgrades
    var moonCount = getMoonCount(spaceL);
    for (var m = 0; m < moonCount; m++) {
        var moonAngle = planetRotation * 0.3 + (Math.PI * 2 * m / moonCount);
        var moonDist = r * (3 + m * 0.5);
        var moonX = cx + Math.cos(moonAngle) * moonDist;
        var moonY = cy + Math.sin(moonAngle) * moonDist * 0.5;
        var moonR = 8 + m * 2;
        
        var moonGrad = visualCtx.createRadialGradient(moonX - moonR * 0.3, moonY - moonR * 0.3, 0, moonX, moonY, moonR);
        moonGrad.addColorStop(0, '#aaa');
        moonGrad.addColorStop(0.5, '#666');
        moonGrad.addColorStop(1, '#333');
        visualCtx.fillStyle = moonGrad;
        visualCtx.beginPath();
        visualCtx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
        visualCtx.fill();
    }
    
    // BLACK HOLES - appear with space upgrades (level 3+)
    if (spaceL > 2) {
        var bhCount = Math.min(spaceL - 2, 4);
        for (var bh = 0; bh < bhCount; bh++) {
            var bhAngle = Date.now() * 0.0004 + (bh * Math.PI * 2 / bhCount);
            var bhDist = 220 + bh * 25;
            var bhx = cx + Math.cos(bhAngle) * bhDist;
            var bhy = cy + Math.sin(bhAngle) * bhDist * 0.35;
            var bhR = 12 + spaceL * 1.5;
            
            var bhGrad = visualCtx.createRadialGradient(bhx, bhy, 0, bhx, bhy, bhR);
            bhGrad.addColorStop(0, '#000');
            bhGrad.addColorStop(0.45, 'rgba(35,0,55,0.75)');
            bhGrad.addColorStop(1, 'transparent');
            visualCtx.fillStyle = bhGrad;
            visualCtx.globalAlpha = 0.65;
            visualCtx.beginPath();
            visualCtx.arc(bhx, bhy, bhR, 0, Math.PI * 2);
            visualCtx.fill();
        }
        visualCtx.globalAlpha = 1;
    }
    
    // PORTAL SPARKLES - with space upgrades
    if (spaceL > 0 && Math.random() < 0.015) {
        var side = Math.random() > 0.5;
        var py = Math.random() * h * 0.5 + h * 0.25;
        portalParticles.push({
            x: side ? w + 30 : -30,
            y: py,
            vx: side ? -2 - Math.random() * 2 : 2 + Math.random() * 2,
            vy: (Math.random() - 0.5) * 0.5,
            size: 2 + Math.random() * 2,
            alpha: 0.8,
            color: spaceL > 2 ? ['#f84','#8ff','#4f4'][Math.floor(Math.random() * 3)] : ['#48f','#4f8'][Math.floor(Math.random() * 2)]
        });
    }
    
    for (var i = portalParticles.length - 1; i >= 0; i--) {
        var pp = portalParticles[i];
        pp.x += pp.vx;
        pp.y += pp.vy;
        pp.alpha -= 0.012;
        
        if (pp.alpha <= 0 || pp.x < -50 || pp.x > w + 50) {
            portalParticles.splice(i, 1);
            continue;
        }
        
        visualCtx.globalAlpha = pp.alpha;
        visualCtx.fillStyle = pp.color;
        visualCtx.beginPath();
        visualCtx.arc(pp.x, pp.y, pp.size, 0, Math.PI * 2);
        visualCtx.fill();
    }
    visualCtx.globalAlpha = 1;
    
    // SPECIAL EFFECTS - rainbow pulse with special upgrades
    if (specialL > 0) {
        var pulseMult = 1.4 + Math.sin(planetPulse * 2.5) * 4;
        if (pulseMult < 0.2) pulseMult = 0.2; // Clamp to prevent negative radius
        var pulseR = r * pulseMult;
        visualCtx.strokeStyle = '#f84';
        visualCtx.globalAlpha = 0.15 + Math.sin(planetPulse * 1.8) * 0.08;
        visualCtx.lineWidth = 1.5;
        visualCtx.setLineDash([4, 6]);
        visualCtx.beginPath();
        visualCtx.arc(cx, cy, pulseR, 0, Math.PI * 2);
        visualCtx.stroke();
        visualCtx.setLineDash([]);
        visualCtx.globalAlpha = 1;
    }
    
    // EDGE PORTALS - boss themed indicators on screen edges
    if (bossL > 1 && Math.random() < 0.003) {
        var edge = Math.floor(Math.random() * 4);
        var ex = edge === 0 ? Math.random() * w : (edge === 1 ? w : (edge === 2 ? Math.random() * w : 0));
        var ey = edge === 1 ? Math.random() * h : (edge === 2 ? h : (edge === 3 ? Math.random() * h : 0));
        edgePortals.push({
            x: ex, y: ey,
            vx: edge === 0 ? 1 : (edge === 1 ? -1 : 0),
            vy: edge === 2 ? -1 : (edge === 3 ? 1 : 0),
            size: 8 + bossL,
            alpha: 0.9,
            life: 1
        });
    }
    
    for (var i = edgePortals.length - 1; i >= 0; i--) {
        var ep = edgePortals[i];
        ep.x += ep.vx;
        ep.y += ep.vy;
        ep.life -= 0.008;
        
        if (ep.life <= 0 || ep.x < -20 || ep.x > w + 20 || ep.y < -20 || ep.y > h + 20) {
            edgePortals.splice(i, 1);
            continue;
        }
        
        visualCtx.globalAlpha = ep.life * 0.6;
        var epGrad = visualCtx.createRadialGradient(ep.x, ep.y, 0, ep.x, ep.y, ep.size);
        epGrad.addColorStop(0, '#f44');
        epGrad.addColorStop(0.5, '#a22');
        epGrad.addColorStop(1, 'transparent');
        visualCtx.fillStyle = epGrad;
        visualCtx.beginPath();
        visualCtx.arc(ep.x, ep.y, ep.size, 0, Math.PI * 2);
        visualCtx.fill();
    }
    visualCtx.globalAlpha = 1;
    
    // CLICK PARTICLES
    for (var i = clickParticles.length - 1; i >= 0; i--) {
        var p = clickParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25;
        var decay = p.decay || 0.022;
        p.life -= decay;
        
        if (p.life <= 0) {
            clickParticles.splice(i, 1);
            continue;
        }
        
        visualCtx.globalAlpha = p.life;
        if (p.type === 'molten') {
            var grd = visualCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * p.life * 2);
            grd.addColorStop(0, '#ffee88');
            grd.addColorStop(0.3, p.color);
            grd.addColorStop(1, 'transparent');
            visualCtx.fillStyle = grd;
            visualCtx.beginPath();
            visualCtx.arc(p.x, p.y, p.size * p.life * 1.5, 0, Math.PI * 2);
            visualCtx.fill();
        } else {
            visualCtx.fillStyle = p.color;
            visualCtx.beginPath();
            visualCtx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            visualCtx.fill();
        }
    }
    visualCtx.globalAlpha = 1;
    
    // SHOCKWAVES
    for (var i = shockwaves.length - 1; i >= 0; i--) {
        var s = shockwaves[i];
        s.radius += s.speed;
        s.alpha -= 0.022;
        
        if (s.alpha <= 0) {
            shockwaves.splice(i, 1);
            continue;
        }
        
        visualCtx.globalAlpha = s.alpha;
        if (s.type === 'molten') {
            var grd = visualCtx.createRadialGradient(cx, cy, s.radius - s.width, cx, cy, s.radius + s.width);
            grd.addColorStop(0, 'transparent');
            grd.addColorStop(0.5, s.color);
            grd.addColorStop(1, 'transparent');
            visualCtx.strokeStyle = grd;
            visualCtx.lineWidth = s.width * 2;
        } else {
            visualCtx.strokeStyle = s.color;
            visualCtx.lineWidth = s.width;
        }
        visualCtx.beginPath();
        visualCtx.arc(cx, cy, s.radius, 0, Math.PI * 2);
        visualCtx.stroke();
    }
    visualCtx.globalAlpha = 1;
    
    // UI GLOW EFFECT - background aura changes color based on highest upgrade type
    var uiGlow = visualCtx.createRadialGradient(cx, cy, r * 0.8, cx, cy, Math.max(w, h) * 0.6);
    if (specialL > 0) {
        uiGlow.addColorStop(0, 'rgba(255,140,60,0.03)');
    } else if (spaceL > 0) {
        uiGlow.addColorStop(0, 'rgba(80,100,255,0.025)');
    } else if (comboL > 0) {
        uiGlow.addColorStop(0, 'rgba(100,255,150,0.02)');
    } else if (critL > 0) {
        uiGlow.addColorStop(0, 'rgba(255,180,100,0.02)');
    } else if (clickL > 0) {
        uiGlow.addColorStop(0, 'rgba(100,200,255,0.015)');
    } else if (genL > 0) {
        uiGlow.addColorStop(0, 'rgba(100,255,180,0.015)');
    }
    uiGlow.addColorStop(1, 'transparent');
    visualCtx.fillStyle = uiGlow;
    visualCtx.fillRect(0, 0, w, h);
    
    requestAnimationFrame(render);
}

function renderPlanetBody(cx, cy, r, stage, totalL) {
    var planetGrad;
    
    // DEBUG: Force stage based on ANY upgrades existing
    // If you have 1+ upgrade, planet should evolve immediately
    if (totalL >= 1 && stage === PLANET_STAGES.ROCK) {
        stage = PLANET_STAGES.MAGMA;
    }
    if (totalL >= 3 && stage === PLANET_STAGES.MAGMA) {
        stage = PLANET_STAGES.OCEAN;
    }
    if (totalL >= 5) stage = PLANET_STAGES.FOREST;
    if (totalL >= 7) stage = PLANET_STAGES.CIVILIZATION;
    if (totalL >= 10) stage = PLANET_STAGES.CLOUDS;
    if (totalL >= 15) stage = PLANET_STAGES.CITY_LIGHTS;
    if (totalL >= 20) stage = PLANET_STAGES.ORBITAL_RINGS;
    if (totalL >= 30) stage = PLANET_STAGES.CYBER;
    if (totalL >= 45) stage = PLANET_STAGES.DYSON;
    
    switch(stage) {
        case PLANET_STAGES.ROCK:
            planetGrad = visualCtx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
            planetGrad.addColorStop(0, '#6a6a6a');
            planetGrad.addColorStop(0.5, '#4a4a4a');
            planetGrad.addColorStop(1, '#2a2a2a');
            break;
            
        case PLANET_STAGES.MAGMA:
            var magmaIntensity = Math.min((totalL - 5) / 10, 1);
            planetGrad = visualCtx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
            planetGrad.addColorStop(0, '#ffaa44');
            planetGrad.addColorStop(0.3, '#ff6622');
            planetGrad.addColorStop(0.6, '#cc3300');
            planetGrad.addColorStop(1, '#661100');
            
            for (var i = 0; i < 5 + Math.floor(magmaIntensity * 8); i++) {
                var crackAngle = (Math.PI * 2 * i / (5 + Math.floor(magmaIntensity * 8))) + planetRotation * 0.3;
                var crackLen = r * (0.3 + Math.random() * 0.4);
                var crackX = cx + Math.cos(crackAngle) * r * 0.5;
                var crackY = cy + Math.sin(crackAngle) * r * 0.5;
                
                visualCtx.strokeStyle = '#ffaa44';
                visualCtx.globalAlpha = 0.6 + Math.sin(planetPulse * 3 + i) * 0.3;
                visualCtx.lineWidth = 2 + Math.random() * 2;
                visualCtx.beginPath();
                visualCtx.moveTo(crackX, crackY);
                visualCtx.lineTo(cx + Math.cos(crackAngle + 0.2) * r * 0.8, cy + Math.sin(crackAngle + 0.2) * r * 0.8);
                visualCtx.stroke();
            }
            visualCtx.globalAlpha = 1;
            break;
            
        case PLANET_STAGES.OCEAN:
            planetGrad = visualCtx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
            planetGrad.addColorStop(0, '#4488cc');
            planetGrad.addColorStop(0.4, '#2266aa');
            planetGrad.addColorStop(0.7, '#114488');
            planetGrad.addColorStop(1, '#082244');
            
            var waveOffset = Math.sin(planetRotation * 2) * r * 0.08;
            visualCtx.fillStyle = 'rgba(100,180,255,0.3)';
            visualCtx.beginPath();
            visualCtx.ellipse(cx, cy + waveOffset, r * 0.7, r * 0.25, 0, 0, Math.PI * 2);
            visualCtx.fill();
            break;
            
        case PLANET_STAGES.FOREST:
            planetGrad = visualCtx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
            planetGrad.addColorStop(0, '#66aa66');
            planetGrad.addColorStop(0.4, '#448844');
            planetGrad.addColorStop(0.7, '#226622');
            planetGrad.addColorStop(1, '#114411');
            
            for (var i = 0; i < 12; i++) {
                var treeAngle = (Math.PI * 2 * i / 12) + planetRotation * 0.5;
                var treeDist = r * (0.4 + Math.random() * 0.3);
                var treeX = cx + Math.cos(treeAngle) * treeDist;
                var treeY = cy + Math.sin(treeAngle) * treeDist;
                
                visualCtx.fillStyle = '#228822';
                visualCtx.beginPath();
                visualCtx.arc(treeX, treeY, 4 + Math.random() * 3, 0, Math.PI * 2);
                visualCtx.fill();
            }
            break;
            
        case PLANET_STAGES.CIVILIZATION:
            planetGrad = visualCtx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
            planetGrad.addColorStop(0, '#888866');
            planetGrad.addColorStop(0.4, '#666644');
            planetGrad.addColorStop(0.7, '#444422');
            planetGrad.addColorStop(1, '#222211');
            
            renderCities(cx, cy, r, totalL);
            break;
            
        case PLANET_STAGES.CLOUDS:
            planetGrad = visualCtx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
            planetGrad.addColorStop(0, '#aaaacc');
            planetGrad.addColorStop(0.4, '#8888aa');
            planetGrad.addColorStop(0.7, '#666688');
            planetGrad.addColorStop(1, '#444466');
            
            renderClouds(cx, cy, r);
            break;
            
        case PLANET_STAGES.CITY_LIGHTS:
            planetGrad = visualCtx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
            planetGrad.addColorStop(0, '#666688');
            planetGrad.addColorStop(0.4, '#444466');
            planetGrad.addColorStop(0.7, '#222244');
            planetGrad.addColorStop(1, '#111122');
            
            renderCityLights(cx, cy, r, totalL);
            renderClouds(cx, cy, r);
            break;
            
        case PLANET_STAGES.ORBITAL_RINGS:
        case PLANET_STAGES.CYBER:
        case PLANET_STAGES.DYSON:
        case PLANET_STAGES.TRANSCENDENT:
            var cyberHue = 280 + Math.sin(planetPulse * 2) * 30;
            planetGrad = visualCtx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
            planetGrad.addColorStop(0, 'hsl(' + cyberHue + ',60%,70%)');
            planetGrad.addColorStop(0.4, 'hsl(' + (cyberHue + 20) + ',50%,50%)');
            planetGrad.addColorStop(0.7, 'hsl(' + (cyberHue + 40) + ',40%,30%)');
            planetGrad.addColorStop(1, 'hsl(' + (cyberHue + 60) + ',30%,15%)');
            
            renderCyberDetails(cx, cy, r, stage, totalL);
            break;
    }
    
    visualCtx.fillStyle = planetGrad;
    visualCtx.beginPath();
    visualCtx.arc(cx, cy, r, 0, Math.PI * 2);
    visualCtx.fill();
}

function renderSurfaceDetails(cx, cy, r, stage, totalL) {
    // Surface bands
    if (totalL > 0) {
        for (var j = 0; j < 3; j++) {
            visualCtx.strokeStyle = 'rgba(255,255,255,0.07)';
            visualCtx.lineWidth = 1;
            visualCtx.beginPath();
            var by = cy + Math.sin(planetRotation * 2 + j * 1.5) * r * 0.45;
            visualCtx.moveTo(cx - r * 0.75, by);
            visualCtx.bezierCurveTo(cx - r * 0.35, by + 5, cx + r * 0.35, by - 5, cx + r * 0.75, by);
            visualCtx.stroke();
        }
    }
}

function renderCities(cx, cy, r, totalL) {
    var cityCount = Math.min(20, Math.floor(totalL / 2));
    for (var i = 0; i < cityCount; i++) {
        var cityAngle = (Math.PI * 2 * i / cityCount) + planetRotation * 0.3;
        var cityDist = r * (0.3 + (i % 3) * 0.15);
        var cityX = cx + Math.cos(cityAngle) * cityDist;
        var cityY = cy + Math.sin(cityAngle) * cityDist;
        var citySize = 3 + (i % 4) * 1.5;
        
        visualCtx.fillStyle = '#aaa';
        visualCtx.fillRect(cityX - citySize/2, cityY - citySize, citySize, citySize * 1.5);
        
        if (i % 2 === 0) {
            visualCtx.fillStyle = '#ff4';
            visualCtx.globalAlpha = 0.6 + Math.sin(planetPulse * 4 + i) * 0.4;
            visualCtx.fillRect(cityX - citySize/4, cityY - citySize * 0.8, citySize/2, 2);
            visualCtx.globalAlpha = 1;
        }
    }
}

function renderClouds(cx, cy, r) {
    for (var i = 0; i < cloudLayers.length; i++) {
        var cloud = cloudLayers[i];
        var offset = Math.sin(planetRotation * 2 + cloud.offset) * r * 0.4;
        
        visualCtx.fillStyle = 'rgba(255,255,255,' + cloud.opacity + ')';
        for (var j = 0; j < 5; j++) {
            var cloudX = cx + Math.cos(j * 1.2 + cloud.offset + planetRotation * cloud.speed * 1000) * r * 0.6;
            var cloudY = cy + Math.sin(j * 0.8 + cloud.offset) * r * 0.3 + offset;
            visualCtx.beginPath();
            visualCtx.arc(cloudX, cloudY, r * (0.15 + Math.random() * 0.1), 0, Math.PI * 2);
            visualCtx.fill();
        }
    }
}

function renderCityLights(cx, cy, r, totalL) {
    var lightCount = Math.min(40, 10 + totalL);
    for (var i = 0; i < lightCount; i++) {
        var light = cityLights[i % cityLights.length];
        var lightAngle = light.baseAngle + planetRotation * 0.2;
        
        if (lightAngle > Math.PI * 0.4 && lightAngle < Math.PI * 1.6) continue;
        
        var lightDist = r * (0.5 + Math.random() * 0.35);
        var lightX = cx + Math.cos(lightAngle) * lightDist;
        var lightY = cy + Math.sin(lightAngle) * lightDist * 0.4;
        
        var twinkle = light.brightness * (0.5 + Math.sin(planetPulse * light.twinkleSpeed + i) * 0.5);
        
        var colors = ['#ffaa00', '#00aaff', '#ff44aa', '#44ffaa', '#aaff00'];
        visualCtx.fillStyle = colors[i % colors.length];
        visualCtx.globalAlpha = twinkle;
        visualCtx.beginPath();
        visualCtx.arc(lightX, lightY, light.size, 0, Math.PI * 2);
        visualCtx.fill();
    }
    visualCtx.globalAlpha = 1;
}

function renderCyberDetails(cx, cy, r, stage, totalL) {
    var gridSize = 8 + Math.floor((stage - PLANET_STAGES.ORBITAL_RINGS) * 3);
    visualCtx.strokeStyle = stage >= PLANET_STAGES.DYSON ? '#ff0' : '#0ff';
    visualCtx.globalAlpha = 0.3 + Math.sin(planetPulse * 3) * 0.2;
    visualCtx.lineWidth = 0.5;
    
    for (var i = 0; i < gridSize; i++) {
        var lat = -r + (2 * r * i / gridSize);
        var circumference = 2 * Math.PI * Math.sqrt(r*r - lat*lat) * 0.15;
        
        visualCtx.beginPath();
        visualCtx.arc(cx, cy + lat, Math.max(5, circumference), 0, Math.PI * 2);
        visualCtx.stroke();
    }
    visualCtx.globalAlpha = 1;
    
    if (stage >= PLANET_STAGES.CYBER) {
        var pulseX = cx + Math.sin(planetPulse * 4) * r * 0.6;
        var pulseY = cy + Math.cos(planetPulse * 3) * r * 0.4;
        visualCtx.fillStyle = '#f0f';
        visualCtx.globalAlpha = 0.4 + Math.sin(planetPulse * 5) * 0.3;
        visualCtx.beginPath();
        visualCtx.arc(pulseX, pulseY, 5 + Math.sin(planetPulse * 2) * 3, 0, Math.PI * 2);
        visualCtx.fill();
        visualCtx.globalAlpha = 1;
    }
}

function renderPlanetShield(cx, cy, r, shieldLevel, genL) {
    if (shieldLevel < 1) return;
    
    var shieldR = r * 1.4;
    var shieldAlpha = 0.15 + Math.sin(planetPulse * 2) * 0.05;
    
    if (shieldLevel === 1) {
        var shieldGrad = visualCtx.createRadialGradient(cx, cy, r, cx, cy, shieldR);
        shieldGrad.addColorStop(0, 'transparent');
        shieldGrad.addColorStop(0.5, 'rgba(100,150,255,' + shieldAlpha + ')');
        shieldGrad.addColorStop(1, 'transparent');
        visualCtx.fillStyle = shieldGrad;
        visualCtx.beginPath();
        visualCtx.arc(cx, cy, shieldR, 0, Math.PI * 2);
        visualCtx.fill();
    }
    else if (shieldLevel === 2) {
        visualCtx.strokeStyle = 'rgba(100,200,255,0.4)';
        visualCtx.lineWidth = 1;
        visualCtx.beginPath();
        visualCtx.arc(cx, cy, shieldR, 0, Math.PI * 2);
        visualCtx.stroke();
        
        var hexCount = 12;
        for (var i = 0; i < hexCount; i++) {
            var hx = cx + Math.cos(i * Math.PI * 2 / hexCount) * shieldR;
            var hy = cy + Math.sin(i * Math.PI * 2 / hexCount) * shieldR;
            visualCtx.strokeStyle = 'rgba(100,200,255,0.25)';
            visualCtx.beginPath();
            visualCtx.moveTo(hx, hy);
            visualCtx.lineTo(cx + Math.cos((i + 1) * Math.PI * 2 / hexCount) * shieldR, 
                           cy + Math.sin((i + 1) * Math.PI * 2 / hexCount) * shieldR);
            visualCtx.stroke();
        }
    }
    else {
        var domeAlpha = 0.1 + Math.sin(planetPulse * 3) * 0.05;
        var domeGrad = visualCtx.createRadialGradient(cx, cy - shieldR * 0.3, 0, cx, cy, shieldR);
        domeGrad.addColorStop(0, 'rgba(200,100,255,' + domeAlpha + ')');
        domeGrad.addColorStop(0.5, 'rgba(100,150,255,' + (domeAlpha * 0.5) + ')');
        domeGrad.addColorStop(1, 'transparent');
        visualCtx.fillStyle = domeGrad;
        visualCtx.beginPath();
        visualCtx.arc(cx, cy, shieldR, 0, Math.PI * 2);
        visualCtx.fill();
        
        var energyLines = 6;
        for (var i = 0; i < energyLines; i++) {
            var eAngle = planetRotation * 2 + (Math.PI * 2 * i / energyLines);
            visualCtx.strokeStyle = 'rgba(255,200,100,0.3)';
            visualCtx.lineWidth = 2;
            visualCtx.beginPath();
            visualCtx.moveTo(cx + Math.cos(eAngle) * r, cy + Math.sin(eAngle) * r);
            visualCtx.lineTo(cx + Math.cos(eAngle) * shieldR * 1.2, cy + Math.sin(eAngle) * shieldR * 1.2);
            visualCtx.stroke();
        }
    }
    visualCtx.globalAlpha = 1;
}

function renderOrbitalDrones(cx, cy, r, genL) {
    var droneCount = getDroneCount(genL);
    if (droneCount < 1) return;
    
    for (var i = 0; i < droneCount; i++) {
        var droneAngle = planetRotation * (1 + i * 0.3) + (Math.PI * 2 * i / droneCount);
        var droneDist = r * (1.8 + i * 0.2);
        var droneX = cx + Math.cos(droneAngle) * droneDist;
        var droneY = cy + Math.sin(droneAngle) * droneDist * 0.3;
        
        visualCtx.fillStyle = '#aaa';
        visualCtx.beginPath();
        visualCtx.arc(droneX, droneY, 4 + i, 0, Math.PI * 2);
        visualCtx.fill();
        
        var beamColor = i % 2 === 0 ? '#0af' : '#f0a';
        visualCtx.strokeStyle = beamColor;
        visualCtx.globalAlpha = 0.5;
        visualCtx.lineWidth = 1;
        visualCtx.beginPath();
        visualCtx.moveTo(droneX, droneY);
        visualCtx.lineTo(cx + Math.cos(droneAngle) * r * 0.9, cy + Math.sin(droneAngle) * r * 0.9 * 0.3);
        visualCtx.stroke();
        visualCtx.globalAlpha = 1;
    }
}

function renderSpaceships(cx, cy, r, bossL) {
    var shipLevel = getShipLevel(bossL);
    if (shipLevel < 1) return;
    
    var shipCount = Math.min(8, shipLevel * 2);
    var shipColors = ['#888', '#66a', '#8a8', '#a66', '#a8a', '#8aa'];
    
    for (var i = 0; i < shipCount; i++) {
        var shipAngle = planetRotation * -0.5 + (Math.PI * 2 * i / shipCount);
        var shipDist = r * (2 + (i % 3) * 0.4);
        var shipX = cx + Math.cos(shipAngle) * shipDist;
        var shipY = cy + Math.sin(shipAngle) * shipDist * 0.2 + Math.sin(planetRotation * 3 + i) * 10;
        
        visualCtx.fillStyle = shipColors[shipLevel - 1];
        visualCtx.beginPath();
        visualCtx.moveTo(shipX, shipY - 6);
        visualCtx.lineTo(shipX + 4, shipY + 4);
        visualCtx.lineTo(shipX, shipY + 2);
        visualCtx.lineTo(shipX - 4, shipY + 4);
        visualCtx.closePath();
        visualCtx.fill();
        
        if (shipLevel >= 3) {
            visualCtx.fillStyle = '#f84';
            visualCtx.globalAlpha = 0.6;
            visualCtx.beginPath();
            visualCtx.arc(shipX, shipY + 5, 2, 0, Math.PI * 2);
            visualCtx.fill();
            visualCtx.globalAlpha = 1;
        }
    }
}

function renderBackgroundProgression(cx, cy, totalL, genL, clickL, spaceL) {
    // Asteroid fields with space upgrades
    if (spaceL > 3) {
        for (var i = 0; i < asteroidFields.length; i++) {
            var a = asteroidFields[i];
            a.x += a.speed;
            a.rot += 0.01;
            
            if (a.x > w + 100) a.x = -100;
            
            visualCtx.save();
            visualCtx.translate(cx + a.x, cy + a.y);
            visualCtx.rotate(a.rot);
            visualCtx.fillStyle = '#666';
            visualCtx.globalAlpha = 0.4;
            visualCtx.fillRect(-a.size, -a.size/2, a.size * 2, a.size);
            visualCtx.restore();
        }
        visualCtx.globalAlpha = 1;
    }
    
    // Wormholes with late-game
    if (spaceL > 8 && Math.random() < 0.002) {
        wormholes.push({
            x: Math.random() * w,
            y: Math.random() * h,
            size: 20 + Math.random() * 30,
            life: 1
        });
    }
    
    for (var i = wormholes.length - 1; i >= 0; i--) {
        var wh = wormholes[i];
        wh.life -= 0.003;
        
        if (wh.life <= 0) {
            wormholes.splice(i, 1);
            continue;
        }
        
        var whGrad = visualCtx.createRadialGradient(wh.x, wh.y, 0, wh.x, wh.y, wh.size);
        whGrad.addColorStop(0, '#000');
        whGrad.addColorStop(0.3, '#300050');
        whGrad.addColorStop(0.6, '#6000a0');
        whGrad.addColorStop(1, 'transparent');
        
        visualCtx.fillStyle = whGrad;
        visualCtx.globalAlpha = wh.life;
        visualCtx.beginPath();
        visualCtx.arc(wh.x, wh.y, wh.size, 0, Math.PI * 2);
        visualCtx.fill();
    }
    visualCtx.globalAlpha = 1;
}

function renderFloatingResources(cx, cy, r, genL) {
    if (genL < 5 || Math.random() < 0.02) {
        var angle = Math.random() * Math.PI * 2;
        var dist = r * (1.5 + Math.random() * 0.5);
        
        floatingResources.push({
            x: cx + Math.cos(angle) * dist,
            y: cy + Math.sin(angle) * dist,
            vx: (Math.random() - 0.5) * 0.5,
            vy: -0.5 - Math.random() * 0.5,
            size: 3 + Math.random() * 3,
            type: Math.floor(Math.random() * 5),
            alpha: 1
        });
    }
    
    for (var i = floatingResources.length - 1; i >= 0; i--) {
        var fr = floatingResources[i];
        fr.x += fr.vx;
        fr.y += fr.vy;
        fr.alpha -= 0.005;
        
        if (fr.alpha <= 0 || fr.y < -20) {
            floatingResources.splice(i, 1);
            continue;
        }
        
        var colors = ['#0af', '#f80', '#0f8', '#f0a', '#ff0'];
        visualCtx.fillStyle = colors[fr.type];
        visualCtx.globalAlpha = fr.alpha;
        visualCtx.beginPath();
        visualCtx.arc(fr.x, fr.y, fr.size, 0, Math.PI * 2);
        visualCtx.fill();
    }
    visualCtx.globalAlpha = 1;
}

function addClickBurst(x, y, power, isCrit) {
    var cx = w / 2;
    var cy = h / 2;
    var up = getUpgradeCounts();
    var effectLevel = getClickEffectLevel(up.click || 0);
    
    switch(effectLevel) {
        case CLICK_EFFECTS.BASIC:
            renderBasicClick(cx, cy, isCrit);
            break;
        case CLICK_EFFECTS.LASER:
            renderLaserClick(cx, cy, isCrit);
            break;
        case CLICK_EFFECTS.EXPLOSION:
            renderExplosionClick(cx, cy, isCrit, power);
            break;
        case CLICK_EFFECTS.ELECTRICITY:
            renderElectricityClick(cx, cy, isCrit);
            break;
        case CLICK_EFFECTS.METEOR:
            renderMeteorClick(cx, cy, isCrit, power);
            break;
        case CLICK_EFFECTS.BLACK_HOLE:
            renderBlackHoleClick(cx, cy, isCrit, power);
            break;
        case CLICK_EFFECTS.QUANTUM:
            renderQuantumClick(cx, cy, isCrit, power);
            break;
        case CLICK_EFFECTS.COSMIC:
            renderCosmicClick(cx, cy, isCrit, power);
            break;
    }
}

function renderBasicClick(cx, cy, isCrit) {
    var color = isCrit ? '#f60' : '#0af';
    shockwaves.push({ radius: isCrit ? 85 : 50, alpha: 1, speed: isCrit ? 10 : 5, color: color, width: isCrit ? 7 : 3 });
    
    var count = isCrit ? 35 : 12;
    for (var i = 0; i < count; i++) {
        var angle = Math.random() * Math.PI * 2;
        var speed = 12 + Math.random() * 45;
        var pcol = isCrit ? ['#f60','#f80','#fa0','#ff0'][Math.floor(Math.random() * 4)] : ['#0cf','#0fc','#08f','#4ff'][Math.floor(Math.random() * 4)];
        clickParticles.push({
            x: cx, y: cy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 4,
            life: 1,
            size: isCrit ? 5 : 2.5,
            color: pcol
        });
    }
}

function renderLaserClick(cx, cy, isCrit) {
    var laserCount = isCrit ? 8 : 4;
    for (var i = 0; i < laserCount; i++) {
        var angle = (Math.PI * 2 * i / laserCount) + Math.random() * 0.3;
        
        visualCtx.strokeStyle = isCrit ? '#f00' : '#0f0';
        visualCtx.lineWidth = isCrit ? 4 : 2;
        visualCtx.globalAlpha = 0.8;
        visualCtx.beginPath();
        visualCtx.moveTo(cx, cy);
        visualCtx.lineTo(cx + Math.cos(angle) * 150, cy + Math.sin(angle) * 150);
        visualCtx.stroke();
        
        clickParticles.push({
            x: cx + Math.cos(angle) * 150,
            y: cy + Math.sin(angle) * 150,
            vx: Math.cos(angle) * 3,
            vy: Math.sin(angle) * 3,
            life: 0.5,
            size: isCrit ? 6 : 3,
            color: isCrit ? '#f00' : '#0f0'
        });
    }
    visualCtx.globalAlpha = 1;
    
    renderBasicClick(cx, cy, isCrit);
}

function renderExplosionClick(cx, cy, isCrit, power) {
    var exCount = isCrit ? 20 : 10;
    for (var i = 0; i < exCount; i++) {
        var angle = Math.random() * Math.PI * 2;
        var dist = 30 + Math.random() * 50;
        var sparkCount = 5 + Math.floor(Math.random() * 5);
        
        for (var j = 0; j < sparkCount; j++) {
            var sAngle = angle + (Math.random() - 0.5) * 0.8;
            var sSpeed = 8 + Math.random() * 12;
            clickParticles.push({
                x: cx + Math.cos(angle) * dist,
                y: cy + Math.sin(angle) * dist,
                vx: Math.cos(sAngle) * sSpeed,
                vy: Math.sin(sAngle) * sSpeed,
                life: 0.8,
                size: isCrit ? 4 : 2,
                color: ['#f84','#ff0','#f00','#fff'][Math.floor(Math.random() * 4)]
            });
        }
    }
    
    shockwaves.push({ radius: 30, alpha: 1, speed: 15, color: '#f84', width: 8 });
    renderBasicClick(cx, cy, isCrit);
}

function renderElectricityClick(cx, cy, isCrit) {
    var arcCount = isCrit ? 6 : 3;
    for (var i = 0; i < arcCount; i++) {
        var startAngle = Math.random() * Math.PI * 2;
        var points = [];
        var currX = cx, currY = cy;
        points.push({x: currX, y: currY});
        
        for (var j = 0; j < 8; j++) {
            currX += Math.cos(startAngle + (Math.random() - 0.5) * 1.5) * 25;
            currY += Math.sin(startAngle + (Math.random() - 0.5) * 1.5) * 25;
            points.push({x: currX, y: currY});
        }
        
        visualCtx.strokeStyle = '#0ff';
        visualCtx.lineWidth = isCrit ? 3 : 2;
        visualCtx.globalAlpha = 0.9;
        visualCtx.beginPath();
        visualCtx.moveTo(points[0].x, points[0].y);
        for (var k = 1; k < points.length; k++) {
            visualCtx.lineTo(points[k].x, points[k].y);
        }
        visualCtx.stroke();
        
        for (var k = 0; k < points.length; k++) {
            clickParticles.push({
                x: points[k].x,
                y: points[k].y,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                life: 0.6,
                size: isCrit ? 4 : 2,
                color: '#0ff'
            });
        }
    }
    visualCtx.globalAlpha = 1;
    renderBasicClick(cx, cy, isCrit);
}

function renderMeteorClick(cx, cy, isCrit, power) {
    var meteorCount = isCrit ? 5 : 2;
    for (var i = 0; i < meteorCount; i++) {
        var fromAngle = Math.random() * Math.PI * 2;
        var dist = 300 + Math.random() * 100;
        var targetX = cx + (Math.random() - 0.5) * 40;
        var targetY = cy + (Math.random() - 0.5) * 40;
        
        var trail = [];
        for (var t = 0; t < 15; t++) {
            trail.push({
                x: targetX + Math.cos(fromAngle) * (dist * t / 15),
                y: targetY + Math.sin(fromAngle) * (dist * t / 15) - t * 3
            });
        }
        
        for (var j = 0; j < trail.length; j++) {
            var t = trail[j];
            var alpha = 1 - (j / trail.length);
            visualCtx.fillStyle = j < trail.length - 3 ? '#f80' : '#fff';
            visualCtx.globalAlpha = alpha * 0.8;
            visualCtx.beginPath();
            visualCtx.arc(t.x, t.y, 3 + (j / trail.length) * 4, 0, Math.PI * 2);
            visualCtx.fill();
        }
        
        clickParticles.push({
            x: targetX,
            y: targetY,
            vx: 0,
            vy: 0,
            life: 1,
            size: isCrit ? 20 : 12,
            color: '#f84'
        });
    }
    visualCtx.globalAlpha = 1;
    
    shockwaves.push({ radius: 40, alpha: 1, speed: 20, color: '#f84', width: 12 });
    renderBasicClick(cx, cy, isCrit);
}

function renderBlackHoleClick(cx, cy, isCrit, power) {
    var bhSize = isCrit ? 60 : 40;
    
    var bhGrad = visualCtx.createRadialGradient(cx, cy, 0, cx, cy, bhSize);
    bhGrad.addColorStop(0, '#000');
    bhGrad.addColorStop(0.3, '#200040');
    bhGrad.addColorStop(0.6, '#400080');
    bhGrad.addColorStop(1, 'transparent');
    
    visualCtx.fillStyle = bhGrad;
    visualCtx.globalAlpha = 0.9;
    visualCtx.beginPath();
    visualCtx.arc(cx, cy, bhSize, 0, Math.PI * 2);
    visualCtx.fill();
    
    visualCtx.strokeStyle = '#a0f';
    visualCtx.lineWidth = 2;
    visualCtx.globalAlpha = 0.7;
    for (var i = 0; i < 5; i++) {
        var ringR = bhSize * (0.3 + i * 0.15);
        var ringOffset = planetPulse * 10;
        visualCtx.beginPath();
        visualCtx.arc(cx, cy, ringR + Math.sin(ringOffset + i) * 5, 0, Math.PI * 2);
        visualCtx.stroke();
    }
    visualCtx.globalAlpha = 1;
    
    for (var i = 0; i < 30; i++) {
        var angle = Math.random() * Math.PI * 2;
        var startDist = 80 + Math.random() * 60;
        clickParticles.push({
            x: cx + Math.cos(angle) * startDist,
            y: cy + Math.sin(angle) * startDist,
            vx: -Math.cos(angle) * 4,
            vy: -Math.sin(angle) * 4,
            life: 1,
            size: 3,
            color: '#80f'
        });
    }
}

function renderQuantumClick(cx, cy, isCrit, power) {
    var cloneCount = isCrit ? 6 : 3;
    for (var i = 0; i < cloneCount; i++) {
        var angle = (Math.PI * 2 * i / cloneCount);
        var dist = 60;
        
        visualCtx.fillStyle = '#f0f';
        visualCtx.globalAlpha = 0.5;
        visualCtx.beginPath();
        visualCtx.arc(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist, 20, 0, Math.PI * 2);
        visualCtx.fill();
        
        for (var j = 0; j < 8; j++) {
            var pAngle = Math.random() * Math.PI * 2;
            clickParticles.push({
                x: cx + Math.cos(angle) * dist,
                y: cy + Math.sin(angle) * dist,
                vx: Math.cos(pAngle) * 10,
                vy: Math.sin(pAngle) * 10,
                life: 0.7,
                size: 3,
                color: '#f0f'
            });
        }
    }
    visualCtx.globalAlpha = 1;
    
    renderBlackHoleClick(cx, cy, isCrit, power);
}

function renderCosmicClick(cx, cy, isCrit, power) {
    visualCtx.fillStyle = isCrit ? '#fff' : '#000';
    visualCtx.globalAlpha = 0.3;
    visualCtx.fillRect(0, 0, w, h);
    visualCtx.globalAlpha = 1;
    
    var realityLines = isCrit ? 12 : 6;
    for (var i = 0; i < realityLines; i++) {
        var angle = (Math.PI * 2 * i / realityLines) + planetRotation;
        
        visualCtx.strokeStyle = isCrit ? '#fff' : '#888';
        visualCtx.lineWidth = isCrit ? 3 : 1;
        visualCtx.globalAlpha = 0.6;
        
        visualCtx.beginPath();
        visualCtx.moveTo(cx + Math.cos(angle) * 50, cy + Math.sin(angle) * 50);
        visualCtx.lineTo(cx + Math.cos(angle) * w, cy + Math.sin(angle) * h);
        visualCtx.stroke();
    }
    visualCtx.globalAlpha = 1;
    
    renderQuantumClick(cx, cy, isCrit, power);
}

function moltenStarExplosion(power) {
    var cx = w / 2;
    var cy = h / 2;
    
    shockwaves.push({
        radius: 30,
        alpha: 1,
        speed: 8,
        color: '#ff4400',
        width: 15,
        type: 'molten'
    });
    
    shockwaves.push({
        radius: 60,
        alpha: 0.8,
        speed: 12,
        color: '#ff8800',
        width: 10,
        type: 'molten'
    });
    
    var count = 50;
    for (var i = 0; i < count; i++) {
        var angle = Math.random() * Math.PI * 2;
        var speed = 8 + Math.random() * 30;
        var pcol = ['#ff4400','#ff6600','#ff8800','#ffaa00','#ffcc00','#ffee44'][Math.floor(Math.random() * 6)];
        clickParticles.push({
            x: cx, y: cy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 3,
            life: 1,
            decay: 0.015,
            size: 3 + Math.random() * 4,
            color: pcol,
            type: 'molten'
        });
    }
    
    for (var i = 0; i < 8; i++) {
        var angle = Math.random() * Math.PI * 2;
        var dist = 60 + Math.random() * 100;
        floatingParticles.push({
            x: cx + Math.cos(angle) * dist * 0.5,
            y: cy + Math.sin(angle) * dist * 0.5,
            vx: Math.cos(angle) * 1.5,
            vy: Math.sin(angle) * 1.5 - 1,
            size: 8 + Math.random() * 6,
            alpha: 1,
            color: '#ff6600',
            type: 'molten',
            life: 1,
            decay: 0.02
        });
    }
    
    var el = document.createElement('div');
    el.style.cssText = 'position:fixed;pointer-events:none;z-index:60;font-weight:bold;transition:all 1.2s ease-out;';
    el.textContent = 'MOLTEN STAR! +' + formatNumber(power);
    el.style.left = cx + 'px';
    el.style.top = (cy - 80) + 'px';
    el.style.color = '#ff8800';
    el.style.fontSize = '2rem';
    el.style.transform = 'translate(-50%,0)';
    el.style.opacity = '1';
    el.style.textShadow = '0 0 20px #ff4400, 0 0 40px #ff8800';
    el.style.letterSpacing = '2px';
    document.body.appendChild(el);
    
    requestAnimationFrame(function() {
        el.style.transform = 'translate(-50%,-80px) scale(1.5)';
        el.style.opacity = '0';
    });
    
    setTimeout(function() { el.remove(); }, 1200);
    
    if (typeof playToast === 'function') playToast();
}

window.initVisuals = initVisuals;
window.addClickBurst = addClickBurst;
window.getPlanetStage = getPlanetStage;
window.getClickEffectLevel = getClickEffectLevel;
window.getShieldLevel = getShieldLevel;
window.getDroneCount = getDroneCount;
window.getShipLevel = getShipLevel;
window.getMoonCount = getMoonCount;
window.getUpgradeCounts = getUpgradeCounts;
window.moltenStarExplosion = moltenStarExplosion;