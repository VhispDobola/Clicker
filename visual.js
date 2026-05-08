// ========================
// EPIC VISUAL SYSTEM - FIXED
// ========================
var visualCanvas, visualCtx, visualTime, effects, w, h;

function initVisuals() {
    try {
        visualCanvas = document.getElementById('visualCanvas') || document.createElement('canvas');
        visualCanvas.id = 'visualCanvas';
        visualCanvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;';
        if (!visualCanvas.parentNode) document.body.insertBefore(visualCanvas, document.body.firstChild);
        visualCtx = visualCanvas.getContext('2d');
        resizeCanvas();
        ensureEffects();
        initWorld();
        requestAnimationFrame(animateVisuals);
    } catch(e) { console.log('Init error:', e); }
}

function resizeCanvas() {
    if (visualCanvas) {
        w = window.innerWidth || 1920;
        h = window.innerHeight || 1080;
        visualCanvas.width = w;
        visualCanvas.height = h;
    }
}

function hexToRgba(hex, alpha) {
    var r = parseInt(hex.slice(1,3), 16);
    var g = parseInt(hex.slice(3,5), 16);
    var b = parseInt(hex.slice(5,7), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
}

function ensureEffects() {
    if (!effects) effects = {
        stars: [], nebulas: [], comets: [], particles: [], auras: [],
        shockwaves: [], floating: [], spirals: [], blasts: [],
        meteors: [], portals: [], cracks: [], lasers: [], bubbles: [], orbs: []
    };
    return effects;
}

function initWorld() {
    // Stars
    for (var i = 0; i < 400; i++) {
        effects.stars.push({
            x: Math.random() * w, y: Math.random() * h,
            z: Math.random() * 2 + 0.5,
            size: Math.random() * 2 + 0.5,
            brightness: Math.random(), twinkle: Math.random() * Math.PI * 2,
            color: ['#fff','#aaf','#faf','#ffa','#aff'][Math.floor(Math.random() * 5)],
            pulse: Math.random() * Math.PI * 2
        });
    }
    
    // Nebulas
    for (var n = 0; n < 8; n++) {
        effects.nebulas.push({
            x: Math.random() * w, y: Math.random() * h,
            size: 200 + Math.random() * 250,
            color: ['rgba(60,0,120,0.1)','rgba(0,40,120,0.1)','rgba(120,40,0,0.1)'][Math.floor(Math.random() * 3)],
            color2: ['rgba(80,0,160,0.08)','rgba(0,60,160,0.08)','rgba(160,60,0,0.08)'][Math.floor(Math.random() * 3)],
            alpha: 0.08 + Math.random() * 0.08,
            vx: (Math.random() - 0.5) * 0.2
        });
    }
    
    // Portals
    for (var p = 0; p < 3; p++) {
        var side = Math.random() > 0.5;
        effects.portals.push({
            x: side ? -30 : w + 30,
            y: Math.random() * h * 0.6 + h * 0.2,
            size: 30 + Math.random() * 30,
            rotation: Math.random() * Math.PI * 2,
            vr: (Math.random() - 0.5) * 0.02,
            brightness: Math.random(),
            color: ['#48f','#4f8','#f48'][Math.floor(Math.random() * 3)]
        });
    }
}

function animateVisuals() {
    if (!visualCtx || !w || !h) { requestAnimationFrame(animateVisuals); return; }
    visualTime += 0.016;
    ensureEffects();
    
    drawSky();
    drawNebulas();
    drawStars();
    drawMeteors();
    drawPortals();
    drawFloating();
    drawComets();
    drawParticles();
    drawAuras();
    drawShockwaves();
    drawSpirals();
    drawBlasts();
    drawCracks();
    drawLasers();
    drawBubbles();
    drawOrbs();
    drawEpicPlanet();
    spawnObjects();
    
    requestAnimationFrame(animateVisuals);
}

function drawSky() {
    var g = visualCtx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w);
    g.addColorStop(0, '#0a0a18');
    g.addColorStop(1, '#020206');
    visualCtx.fillStyle = g;
    visualCtx.fillRect(0, 0, w, h);
}

function drawNebulas() {
    for (var i = 0; i < effects.nebulas.length; i++) {
        var n = effects.nebulas[i];
        if (!n) continue;
        n.x += n.vx;
        if (n.x < -n.size) n.x = w + n.size;
        if (n.x > w + n.size) n.x = -n.size;
        
        var g = visualCtx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.size);
        g.addColorStop(0, n.color);
        g.addColorStop(0.5, n.color2);
        g.addColorStop(1, 'transparent');
        visualCtx.fillStyle = g;
        visualCtx.fillRect(0, 0, w, h);
    }
}

function drawStars() {
    for (var i = 0; i < effects.stars.length; i++) {
        var s = effects.stars[i];
        if (!s) continue;
        s.twinkle += s.z * 0.1;
        var b = s.brightness * (0.5 + Math.sin(s.twinkle + s.pulse) * 0.3);
        
        visualCtx.fillStyle = s.color;
        visualCtx.globalAlpha = b;
        visualCtx.beginPath();
        visualCtx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        visualCtx.fill();
    }
    visualCtx.globalAlpha = 1;
}

function drawMeteors() {
    if (!effects.meteors) return;
    for (var i = effects.meteors.length - 1; i >= 0; i--) {
        var m = effects.meteors[i];
        if (!m) continue;
        
        if (!m.trail) m.trail = [];
        m.trail.push({x: m.x, y: m.y, l: m.life});
        if (m.trail.length > 15) m.trail.shift();
        
        m.x -= m.vx;
        m.y -= m.vy;
        m.life -= 0.02;
        
        if (m.life <= 0 || m.y < -50) { effects.meteors.splice(i, 1); continue; }
        
        for (var j = 0; j < m.trail.length; j++) {
            var t = m.trail[j];
            visualCtx.fillStyle = m.color;
            visualCtx.globalAlpha = (j / m.trail.length) * t.l * 0.5;
            visualCtx.beginPath();
            visualCtx.arc(t.x, t.y, (j / m.trail.length) * m.size, 0, Math.PI * 2);
            visualCtx.fill();
        }
    }
    visualCtx.globalAlpha = 1;
}

function drawPortals() {
    if (!effects.portals) return;
    for (var i = 0; i < effects.portals.length; i++) {
        var p = effects.portals[i];
        if (!p) continue;
        p.rotation += p.vr;
        p.brightness += 0.03;
        
        visualCtx.save();
        visualCtx.translate(p.x, p.y);
        visualCtx.rotate(p.rotation);
        
        var g = visualCtx.createRadialGradient(0, 0, 0, 0, 0, p.size);
        g.addColorStop(0, 'transparent');
        g.addColorStop(0.5, p.color + '44');
        g.addColorStop(1, 'transparent');
        visualCtx.fillStyle = g;
        visualCtx.globalAlpha = 0.3 + Math.sin(p.brightness) * 0.15;
        visualCtx.fillRect(-p.size, -p.size, p.size * 2, p.size * 2);
        
        visualCtx.strokeStyle = p.color;
        visualCtx.globalAlpha = 0.5;
        visualCtx.lineWidth = 2;
        for (var j = 0; j < 3; j++) {
            visualCtx.beginPath();
            visualCtx.arc(0, 0, p.size * (0.4 + j * 0.3), j, j + Math.PI);
            visualCtx.stroke();
        }
        visualCtx.restore();
    }
    visualCtx.globalAlpha = 1;
}

function drawFloating() {
    if (!effects.floating) return;
    for (var i = effects.floating.length - 1; i >= 0; i--) {
        var f = effects.floating[i];
        if (!f) continue;
        f.y -= f.speed;
        f.x += Math.sin(f.y * 0.01 + f.offset) * f.drift;
        f.alpha -= 0.005;
        if (f.alpha <= 0 || f.y < -20) { effects.floating.splice(i, 1); continue; }
        
        visualCtx.fillStyle = f.color;
        visualCtx.globalAlpha = f.alpha;
        visualCtx.beginPath();
        visualCtx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
        visualCtx.fill();
    }
    visualCtx.globalAlpha = 1;
}

function drawComets() {
    if (!effects.comets) return;
    for (var i = effects.comets.length - 1; i >= 0; i--) {
        var c = effects.comets[i];
        if (!c) continue;
        if (!c.trail) c.trail = [];
        c.trail.push({x: c.x, y: c.y, b: c.brightness});
        if (c.trail.length > 25) c.trail.shift();
        
        c.x += Math.cos(c.angle) * c.speed;
        c.y += Math.sin(c.angle) * c.speed;
        
        if (c.x < -100 || c.x > w + 100 || c.y < -100 || c.y > h + 100) {
            effects.comets.splice(i, 1);
            continue;
        }
        
        for (var j = 0; j < c.trail.length; j++) {
            var t = c.trail[j];
            visualCtx.fillStyle = '#acf';
            visualCtx.globalAlpha = (j / c.trail.length) * (t.b || 1) * 0.5;
            visualCtx.beginPath();
            visualCtx.arc(t.x, t.y, (j / c.trail.length) * c.size, 0, Math.PI * 2);
            visualCtx.fill();
        }
    }
    visualCtx.globalAlpha = 1;
}

function drawParticles() {
    if (!effects.particles) return;
    for (var i = effects.particles.length - 1; i >= 0; i--) {
        var p = effects.particles[i];
        if (!p) continue;
        p.x += p.vx || 0;
        p.y += (p.vy || 0) + 0.1;
        if (p.x < -50 || p.x > w + 50 || p.y < -50 || p.y > h + 50) {
            effects.particles.splice(i, 1);
            continue;
        }
        visualCtx.fillStyle = p.color || '#fff';
        visualCtx.globalAlpha = 0.9;
        visualCtx.beginPath();
        visualCtx.arc(p.x, p.y, p.size || 3, 0, Math.PI * 2);
        visualCtx.fill();
    }
    visualCtx.globalAlpha = 1;
}

function drawAuras() {
    ensureEffects();
    if (!visualCtx) return;
    
    var power = 0;
    try { power = getClickPower() || 0; } catch(e) {}
    
    if (power > 3 && effects.auras) {
        var color = power > 1000 ? '#f80' : power > 100 ? '#4af' : '#08f';
        effects.auras.push({
            x: w/2, y: h/2, radius: 250, maxRadius: 350 + power * 0.2,
            alpha: 0.5, speed: power > 100 ? 3 : 1, color: color
        });
        
        if (power > 80 && Math.random() < power / 300 && effects.cracks) {
            spawnCrack(power);
        }
    }
    
    if (!effects.auras) return;
    for (var i = effects.auras.length - 1; i >= 0; i--) {
        var a = effects.auras[i];
        if (!a) continue;
        a.radius += a.speed;
        a.alpha -= 0.015;
        if (a.alpha <= 0 || a.radius > a.maxRadius) { effects.auras.splice(i, 1); continue; }
        
        var g = visualCtx.createRadialGradient(a.x, a.y, 0, a.x, a.y, a.radius);
        g.addColorStop(0, 'transparent');
        g.addColorStop(0.7, a.color);
        g.addColorStop(1, 'transparent');
        visualCtx.fillStyle = g;
        visualCtx.globalAlpha = a.alpha;
        visualCtx.beginPath();
        visualCtx.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
        visualCtx.fill();
    }
    visualCtx.globalAlpha = 1;
}

function spawnCrack(power) {
    if (!effects.cracks) return;
    var cx = w/2, cy = h/2, angle = Math.random() * Math.PI * 2, len = 15 + power * 0.3;
    effects.cracks.push({
        x: cx, y: cy, x1: cx, y1: cy,
        x: cx + Math.cos(angle) * len, y: cy + Math.sin(angle) * len,
        life: 1, width: 1 + power / 100
    });
}

function drawShockwaves() {
    if (!effects.shockwaves) return;
    for (var i = effects.shockwaves.length - 1; i >= 0; i--) {
        var s = effects.shockwaves[i];
        if (!s) continue;
        s.radius += s.speed;
        s.alpha -= 0.03;
        if (s.alpha <= 0) { effects.shockwaves.splice(i, 1); continue; }
        
        visualCtx.strokeStyle = s.color;
        visualCtx.globalAlpha = s.alpha;
        visualCtx.lineWidth = s.width;
        visualCtx.beginPath();
        visualCtx.arc(s.x || w/2, s.y || h/2, s.radius, 0, Math.PI * 2);
        visualCtx.stroke();
    }
    visualCtx.globalAlpha = 1;
}

function drawSpirals() {
    if (!effects.spirals) return;
    for (var i = effects.spirals.length - 1; i >= 0; i--) {
        var s = effects.spirals[i];
        if (!s) continue;
        s.radius += s.grow;
        s.angle += s.spin;
        s.life -= 0.02;
        if (s.life <= 0 || s.radius > s.maxRadius) { effects.spirals.splice(i, 1); continue; }
        
        visualCtx.strokeStyle = s.color;
        visualCtx.globalAlpha = s.life;
        visualCtx.lineWidth = 2;
        for (var j = 0; j < s.arcs; j++) {
            var a = s.angle + (Math.PI * 2 / s.arcs) * j;
            var x = s.x + Math.cos(a) * s.radius;
            var y = s.y + Math.sin(a) * s.radius * 0.4;
            if (j === 0) visualCtx.beginPath();
            else visualCtx.lineTo(x, y);
        }
        visualCtx.closePath();
        visualCtx.stroke();
    }
    visualCtx.globalAlpha = 1;
}

function drawBlasts() {
    if (!effects.blasts) return;
    for (var i = effects.blasts.length - 1; i >= 0; i--) {
        var b = effects.blasts[i];
        if (!b) continue;
        b.radius += 10;
        b.life -= 0.035;
        if (b.life <= 0) { effects.blasts.splice(i, 1); continue; }
        
        visualCtx.fillStyle = b.color;
        visualCtx.globalAlpha = b.life;
        visualCtx.beginPath();
        visualCtx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        visualCtx.fill();
    }
    visualCtx.globalAlpha = 1;
}

function drawCracks() {
    if (!effects.cracks) return;
    for (var i = effects.cracks.length - 1; i >= 0; i--) {
        var c = effects.cracks[i];
        if (!c) continue;
        c.life -= 0.03;
        if (c.life <= 0) { effects.cracks.splice(i, 1); continue; }
        
        visualCtx.strokeStyle = '#fff';
        visualCtx.globalAlpha = c.life;
        visualCtx.lineWidth = c.width;
        visualCtx.beginPath();
        visualCtx.moveTo(c.x1, c.y1);
        visualCtx.lineTo(c.x, c.y);
        visualCtx.stroke();
    }
    visualCtx.globalAlpha = 1;
}

function drawLasers() {
    if (!effects.lasers) return;
    for (var i = effects.lasers.length - 1; i >= 0; i--) {
        var l = effects.lasers[i];
        if (!l) continue;
        l.life -= 0.03;
        l.width -= 0.5;
        if (l.life <= 0 || l.width <= 0) { effects.lasers.splice(i, 1); continue; }
        
        visualCtx.strokeStyle = l.color;
        visualCtx.globalAlpha = l.life;
        visualCtx.lineWidth = l.width;
        visualCtx.beginPath();
        visualCtx.moveTo(l.x1, l.y1);
        visualCtx.lineTo(l.x2, l.y2);
        visualCtx.stroke();
    }
    visualCtx.globalAlpha = 1;
}

function drawBubbles() {
    if (!effects.bubbles) return;
    for (var i = effects.bubbles.length - 1; i >= 0; i--) {
        var b = effects.bubbles[i];
        if (!b) continue;
        b.y -= b.speed;
        b.wobble += 0.1;
        b.x += Math.sin(b.wobble) * 0.5;
        b.alpha -= 0.01;
        if (b.alpha <= 0 || b.y < -20) { effects.bubbles.splice(i, 1); continue; }
        
        visualCtx.strokeStyle = b.color;
        visualCtx.globalAlpha = b.alpha;
        visualCtx.lineWidth = 1.5;
        visualCtx.beginPath();
        visualCtx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        visualCtx.stroke();
    }
    visualCtx.globalAlpha = 1;
}

function drawOrbs() {
    if (!effects.orbs) return;
    for (var i = effects.orbs.length - 1; i >= 0; i--) {
        var o = effects.orbs[i];
        if (!o) continue;
        o.y += o.speed;
        o.life -= 0.018;
        if (o.life <= 0 || o.y > h + 20) { effects.orbs.splice(i, 1); continue; }
        
        var g = visualCtx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.size);
        g.addColorStop(0, o.color);
        g.addColorStop(1, 'transparent');
        visualCtx.fillStyle = g;
        visualCtx.globalAlpha = o.life;
        visualCtx.beginPath();
        visualCtx.arc(o.x, o.y, o.size, 0, Math.PI * 2);
        visualCtx.fill();
    }
    visualCtx.globalAlpha = 1;
}

var planetRotation = 0, planetPulse = 0, ringRotation = 0;

function drawEpicPlanet() {
    if (!visualCtx || !w || !h) return;
    var cx = w/2, cy = h/2, baseR = 80;
    planetRotation += 0.01;
    planetPulse += 0.025;
    ringRotation += 0.005;
    
    var energy = 0, upgrades = 0;
    try { energy = (window.GAME ? window.GAME.energy : 0) || 0; } catch(e) {}
    try { upgrades = (window.GAME ? Object.keys(window.GAME.upgrades || {}).length : 0) || 0; } catch(e) {}
    
    var r = baseR * Math.min(3, 1 + Math.log(Math.max(1, energy + 1)) / 18);
    var zone = 'v';
    try { zone = (window.GAME ? window.GAME.currentZone : 'v') || 'v'; } catch(e) {}
    
    var colors = getPlanetColors(zone);
    var glow = getGlow(zone);
    
    // Planet rings
    if (upgrades > 2) {
        var count = Math.min(10, Math.floor(upgrades / 4));
        for (var ri = 0; ri < count; ri++) {
            var ringR = r * (1.6 + ri * 0.3);
            var rot = ringRotation * (ri % 2 ? 1.2 : -1);
            visualCtx.strokeStyle = ['#48f','#4f8','#f48','#f4f','#4ff'][ri % 5];
            visualCtx.globalAlpha = 0.25 - ri * 0.025;
            visualCtx.lineWidth = 1.5;
            visualCtx.setLineDash([7 - ri, 5 + ri]);
            visualCtx.beginPath();
            visualCtx.ellipse(cx, cy, ringR, ringR * 0.28, rot, 0, Math.PI * 2);
            visualCtx.stroke();
        }
        visualCtx.setLineDash([]);
    }
    
    // Glow
    var glowR = r * (2 + Math.sin(planetPulse) * 0.15);
    var g = visualCtx.createRadialGradient(cx, cy, r * 0.3, cx, cy, glowR);
    g.addColorStop(0, glow.inner);
    g.addColorStop(0.5, glow.mid + '88');
    g.addColorStop(1, 'transparent');
    visualCtx.fillStyle = g;
    visualCtx.globalAlpha = 0.7;
    visualCtx.fillRect(cx - glowR, cy - glowR, glowR * 2, glowR * 2);
    
    // Corona arcs
    var coronaCount = 4 + Math.floor(upgrades / 8);
    for (var i = 0; i < coronaCount; i++) {
        var ang = planetRotation * (i % 2 ? 1.8 : -1.5) + (Math.PI * 2 / coronaCount) * i;
        var arcR = r * (1.35 + Math.sin(planetPulse + i) * 0.2);
        visualCtx.strokeStyle = i % 2 ? '#aaf' : colors.accent;
        visualCtx.globalAlpha = 0.45 - i * 0.09;
        visualCtx.lineWidth = 3 - i * 0.35;
        visualCtx.beginPath();
        visualCtx.arc(cx, cy, arcR, ang - 0.5, ang + 0.5);
        visualCtx.stroke();
    }
    
    // Planet body
    var grad = visualCtx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, 0, cx, cy, r);
    grad.addColorStop(0, colors.high);
    grad.addColorStop(0.3, colors.core);
    grad.addColorStop(0.7, colors.surface);
    grad.addColorStop(1, colors.mantle);
    visualCtx.fillStyle = grad;
    visualCtx.beginPath();
    visualCtx.arc(cx, cy, r, 0, Math.PI * 2);
    visualCtx.fill();
    
    // Surface bands
    for (var j = 0; j < 4; j++) {
        visualCtx.strokeStyle = 'rgba(255,255,255,0.07)';
        visualCtx.lineWidth = 1;
        visualCtx.beginPath();
        var by = cy + Math.sin(planetRotation * 2.2 + j * 1.6) * r * 0.5;
        visualCtx.moveTo(cx - r * 0.8, by);
        visualCtx.bezierCurveTo(cx - r * 0.4, by + 6, cx + r * 0.4, by - 6, cx + r * 0.8, by);
        visualCtx.stroke();
    }
    
    // Highlight
    visualCtx.fillStyle = 'rgba(255,255,255,0.28)';
    visualCtx.beginPath();
    visualCtx.arc(cx - r * 0.35, cy - r * 0.35, r * 0.35, 0, Math.PI * 2);
    visualCtx.fill();
    
    visualCtx.globalAlpha = 1;
}

function getPlanetColors(zone) {
    var c = {v:{core:'#678',mantle:'#456',surface:'#567',high:'#9ad',accent:'#8ab'},q:{core:'#a6f',mantle:'#84d',surface:'#96e',high:'#c8f',accent:'#daf'},t:{core:'#fa4',mantle:'#d82',surface:'#e94',high:'#fc6',accent:'#fb5'},m:{core:'#6af',mantle:'#48d',surface:'#59e',high:'#8cf',accent:'#9de'},l:{core:'#ff6',mantle:'#dd4',surface:'#ee5',high:'#ff8',accent:'#f99'},d:{core:'#a4a',mantle:'#828',surface:'#949',high:'#c6c',accent:'#d8d'},e:{core:'#fff',mantle:'#ccc',surface:'#ddd',high:'#fff',accent:'#eee'},inf:{core:'#f4f',mantle:'#c2c',surface:'#e3e',high:'#f7f',accent:'#f8f'}};
    return c[zone] || c.v;
}

function getGlow(zone) {
    var g = {v:{inner:'#9bd',mid:'#468'},q:{inner:'#d9f',mid:'#84d'},t:{inner:'#fd8',mid:'#d82'},m:{inner:'#9df',mid:'#48d'},l:{inner:'#ff9',mid:'#dd4'},d:{inner:'#d9d',mid:'#828'},e:{inner:'#fff',mid:'#aaa'},inf:{inner:'#f9f',mid:'#c2c'}};
    return g[zone] || g.v;
}

function spawnObjects() {
    ensureEffects();
    
    // Comet
    if (Math.random() < 0.2) {
        var start = Math.random() > 0.5;
        if (effects.comets) effects.comets.push({
            x: start ? -50 : w + 50,
            y: Math.random() * h * 0.7,
            angle: start ? 0.15 : 0.85,
            speed: 4 + Math.random() * 4,
            size: 2 + Math.random() * 3,
            brightness: 1, trail: [], maxTrail: 25
        });
    }
    
    // Meteor
    if (Math.random() < 0.08 && effects.meteors) {
        effects.meteors.push({
            x: Math.random() * w, y: -30,
            vx: 4 + Math.random() * 4, vy: 3 + Math.random() * 3,
            size: 2 + Math.random() * 2, color: '#fff', life: 1, trail:[]
        });
    }
    
    // Floating particles
    var upgrades = 0;
    try { upgrades = (window.GAME ? Object.keys(window.GAME.upgrades || {}).length : 0) || 0; } catch(e) {}
    if (Math.random() < upgrades * 0.003 && effects.floating) {
        var angle = Math.random() * Math.PI * 2;
        effects.floating.push({
            x: w/2 + Math.cos(angle) * (200 + upgrades * 15),
            y: h/2 + Math.sin(angle) * (200 + upgrades * 15),
            speed: 1.5 + Math.random() * 2,
            drift: (Math.random() - 0.5) * 0.5,
            offset: Math.random() * Math.PI * 2,
            size: Math.random() * 4 + 1,
            alpha: 0.9,
            color: ['#8af','#f8a','#a8f','#fa8'][Math.floor(Math.random() * 4)]
        });
    }
}

function addClickBurst(x, y, power, isCrit) {
    if (!visualCtx || !w || !h) return;
    ensureEffects();
    
    var cx = x || w/2, cy = y || h/2;
    var color = isCrit ? '#f60' : '#0af';
    var count = isCrit ? 30 : 15;
    
    // Shockwave
    if (effects.shockwaves) effects.shockwaves.push({
        x: cx, y: cy, radius: isCrit ? 150 : 80,
        alpha: 1, speed: isCrit ? 15 : 7, color: color, width: isCrit ? 10 : 4
    });
    
    // Particles
    if (effects.particles) for (var i = 0; i < count; i++) {
        var a = Math.random() * Math.PI * 2;
        var s = 25 + Math.random() * 60;
        effects.particles.push({
            x: cx, y: cy,
            vx: Math.cos(a) * s, vy: Math.sin(a) * s,
            size: isCrit ? 6 : 3,
            color: isCrit ? ['#f60','#f80','#fa0'][Math.floor(Math.random() * 3)] : ['#0cf','#0fc','#08f'][Math.floor(Math.random() * 3)]
        });
    }
    
    // Spiral for big hits
    if (power > 40 && effects.spirals) effects.spirals.push({
        x: cx, y: cy, radius: 35, grow: 4, spin: 0.1,
        life: 1, maxRadius: 160 + power * 0.15,
        arcs: isCrit ? 4 : 2, color: color, angle: 0
    });
    
    // Blast for crits
    if (isCrit && effects.blasts) effects.blasts.push({
        x: cx, y: cy, radius: 10, color: '#f80', life: 1
    });
}

setInterval(spawnObjects, 600);

window.initVisuals = initVisuals;
window.addClickBurst = addClickBurst;
window.visualTime = visualTime;