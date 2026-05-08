// ========================
// ULTIMATE EPIC VISUAL SYSTEM
// ========================
var visualCanvas, visualCtx;
var visualTime = 0;
var effects = null;
var w, h;

function ensureEffects() {
    if (!effects) {
        effects = {
            stars: [], nebulas: [], comets: [], particles: [], auras: [],
            shockwaves: [], floating: [], rings: [], spirals: [], blasts: [],
            meteors: [], portals: [], cracks: []
        };
    }
    return effects;
}

function initVisuals() {
    try {
        visualCanvas = document.getElementById('visualCanvas');
        if (!visualCanvas) {
            visualCanvas = document.createElement('canvas');
            visualCanvas.id = 'visualCanvas';
            visualCanvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;';
            document.body.insertBefore(visualCanvas, document.body.firstChild);
        }
        visualCtx = visualCanvas.getContext('2d');
        resizeCanvas();
        
        ensureEffects();
        createStarfield();
        createNebulas();
        createPortals();
        
        requestAnimationFrame(animateVisuals);
    } catch (e) { console.log('Init error:', e); }
}

function resizeCanvas() {
    if (visualCanvas) {
        w = window.innerWidth || 1920;
        h = window.innerHeight || 1080;
        visualCanvas.width = w;
        visualCanvas.height = h;
    }
}

function createStarfield() {
    if (!effects) return;
    effects.stars = [];
    for (var i = 0; i < 400; i++) {
        effects.stars.push({
            x: Math.random() * w,
            y: Math.random() * h,
            z: Math.random() * 3 + 0.5,
            size: Math.random() * 2 + 0.5,
            brightness: Math.random(),
            twinkle: Math.random() * Math.PI * 2,
            color: ['#fff', '#aaf', '#faf', '#ffa', '#afa', '#aaa'][Math.floor(Math.random() * 6)]
        });
    }
}

function createNebulas() {
    if (!effects) return;
    effects.nebulas = [];
    for (var i = 0; i < 8; i++) {
        effects.nebulas.push({
            x: Math.random() * w,
            y: Math.random() * h,
            size: 150 + Math.random() * 250,
            color: ['#311', '#131', '#113', '#311', '#211', '#121'][Math.floor(Math.random() * 6)],
            color2: ['#534', '#345', '#435', '#534', '#423', '#324'][Math.floor(Math.random() * 6)],
            alpha: 0.08 + Math.random() * 0.1,
            speed: (Math.random() - 0.5) * 0.4,
            angle: Math.random() * Math.PI * 2
        });
    }
}

function createPortals() {
    if (!effects) return;
    effects.portals = [];
    for (var i = 0; i < 3; i++) {
        effects.portals.push({
            x: Math.random() * w,
            y: Math.random() * h,
            size: 20 + Math.random() * 40,
            rotation: Math.random() * Math.PI * 2,
            speed: (Math.random() - 0.5) * 0.02,
            brightness: Math.random(),
            color: ['#88f', '#8f8', '#f88', '#f8f', '#8ff'][Math.floor(Math.random() * 5)]
        });
    }
}

function animateVisuals() {
    if (!visualCtx || !visualCanvas) {
        requestAnimationFrame(animateVisuals);
        return;
    }
    
    visualTime += 0.016;
    ensureEffects();
    
    drawDeepSpace();
    drawNebulas();
    drawPortals();
    drawStars();
    drawMeteors();
    drawCracks();
    drawSpirals();
    drawFloating();
    drawComets();
    drawParticles();
    drawAuras();
    drawShockwaves();
    drawBlasts();
    drawEpicPlanet();
    drawUpgradeEffects();
    
    requestAnimationFrame(animateVisuals);
}

function drawDeepSpace() {
    var gradient = visualCtx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w);
    gradient.addColorStop(0, '#0a0a18');
    gradient.addColorStop(0.6, '#050510');
    gradient.addColorStop(1, '#020205');
    visualCtx.fillStyle = gradient;
    visualCtx.fillRect(0, 0, w, h);
}

function drawNebulas() {
    if (!effects || !effects.nebulas) return;
    
    for (var i = 0; i < effects.nebulas.length; i++) {
        var n = effects.nebulas[i];
        if (!n) continue;
        
        n.x += n.speed;
        n.angle += n.speed * 0.5;
        if (n.x < -n.size) n.x = w + n.size;
        if (n.x > w + n.size) n.x = -n.size;
        
        var g = visualCtx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.size);
        g.addColorStop(0, n.color + Math.floor(n.alpha * 255).toString(16));
        g.addColorStop(0.5, n.color2 + Math.floor(n.alpha * 150).toString(16));
        g.addColorStop(1, 'transparent');
        visualCtx.fillStyle = g;
        visualCtx.globalAlpha = n.alpha || 0.1;
        visualCtx.beginPath();
        visualCtx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
        visualCtx.fill();
    }
    visualCtx.globalAlpha = 1;
}

function drawPortals() {
    if (!effects || !effects.portals) return;
    
    for (var i = 0; i < effects.portals.length; i++) {
        var p = effects.portals[i];
        if (!p) continue;
        
        p.rotation += p.speed;
        p.brightness += 0.02;
        
        visualCtx.save();
        visualCtx.translate(p.x, p.y);
        visualCtx.rotate(p.rotation);
        
        // Outer glow
        var g = visualCtx.createRadialGradient(0, 0, 0, 0, 0, p.size);
        g.addColorStop(0, 'transparent');
        g.addColorStop(0.5, p.color + '44');
        g.addColorStop(1, 'transparent');
        visualCtx.fillStyle = g;
        visualCtx.globalAlpha = 0.3 + Math.sin(p.brightness) * 0.2;
        visualCtx.fillRect(-p.size, -p.size, p.size * 2, p.size * 2);
        
        // Swirl
        visualCtx.strokeStyle = p.color;
        visualCtx.lineWidth = 2;
        visualCtx.globalAlpha = 0.5;
        for (var j = 0; j < 3; j++) {
            visualCtx.beginPath();
            visualCtx.arc(0, 0, p.size * (0.3 + j * 0.3), j * 2, j * 2 + Math.PI);
            visualCtx.stroke();
        }
        
        visualCtx.restore();
    }
    visualCtx.globalAlpha = 1;
}

function drawStars() {
    if (!effects || !effects.stars) return;
    
    for (var i = 0; i < effects.stars.length; i++) {
        var s = effects.stars[i];
        if (!s) continue;
        
        s.twinkle += s.z * 0.1;
        var b = s.brightness * (0.4 + Math.sin(s.twinkle) * 0.4 + 0.2);
        
        visualCtx.fillStyle = s.color;
        visualCtx.globalAlpha = b;
        visualCtx.beginPath();
        visualCtx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        visualCtx.fill();
        
        if (s.size > 1.5) {
            visualCtx.globalAlpha = b * 0.3;
            visualCtx.beginPath();
            visualCtx.arc(s.x, s.y, s.size * 2.5, 0, Math.PI * 2);
            visualCtx.fill();
        }
    }
    visualCtx.globalAlpha = 1;
}

function drawMeteors() {
    if (!effects || !effects.meteors || !visualCtx) return;
    
    for (var i = effects.meteors.length - 1; i >= 0; i--) {
        var m = effects.meteors[i];
        if (!m) continue;
        
        m.trail.push({ x: m.x, y: m.y, alpha: 1 });
        if (m.trail.length > 15) m.trail.shift();
        
        m.x -= m.vx;
        m.y -= m.vy;
        m.life -= 0.015;
        
        if (m.life <= 0 || m.y < -50) {
            effects.meteors.splice(i, 1);
            continue;
        }
        
        // Trail
        for (var j = 0; j < m.trail.length; j++) {
            var t = m.trail[j];
            if (!t) continue;
            t.alpha -= 0.08;
            if (t.alpha <= 0) continue;
            visualCtx.fillStyle = m.color;
            visualCtx.globalAlpha = t.alpha * 0.7;
            visualCtx.beginPath();
            visualCtx.arc(t.x, t.y, (j / m.trail.length) * m.size, 0, Math.PI * 2);
            visualCtx.fill();
        }
        
        // Head
        visualCtx.fillStyle = '#fff';
        visualCtx.globalAlpha = m.life;
        visualCtx.beginPath();
        visualCtx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
        visualCtx.fill();
    }
    visualCtx.globalAlpha = 1;
}

function drawCracks() {
    if (!effects || !effects.cracks || !visualCtx) return;
    
    for (var i = effects.cracks.length - 1; i >= 0; i--) {
        var c = effects.cracks[i];
        if (!c) continue;
        
        c.life -= 0.02;
        if (c.life <= 0) {
            effects.cracks.splice(i, 1);
            continue;
        }
        
        visualCtx.strokeStyle = '#fff';
        visualCtx.globalAlpha = c.life * 0.7;
        visualCtx.lineWidth = c.width || 2;
        visualCtx.beginPath();
        visualCtx.moveTo(c.x1, c.y1);
        visualCtx.lineTo(c.x, c.y);
        visualCtx.stroke();
        
        // Branches
        if (c.branches) {
            for (var j = 0; j < c.branches.length; j++) {
                var b = c.branches[j];
                visualCtx.globalAlpha = c.life * 0.5;
                visualCtx.lineWidth = 1;
                visualCtx.beginPath();
                visualCtx.moveTo(c.x, c.y);
                visualCtx.lineTo(b.x, b.y);
                visualCtx.stroke();
            }
        }
    }
    visualCtx.globalAlpha = 1;
}

function drawSpirals() {
    if (!effects || !effects.spirals || !visualCtx) return;
    
    for (var i = effects.spirals.length - 1; i >= 0; i--) {
        var s = effects.spirals[i];
        if (!s) continue;
        
        s.radius += s.grow;
        s.angle += s.spin;
        s.life -= 0.015;
        
        if (s.life <= 0 || s.radius > s.maxRadius) {
            effects.spirals.splice(i, 1);
            continue;
        }
        
        visualCtx.strokeStyle = s.color;
        visualCtx.globalAlpha = s.life;
        visualCtx.lineWidth = 2;
        visualCtx.beginPath();
        for (var j = 0; j < s.arcs; j++) {
            var a = s.angle + (Math.PI * 2 / s.arcs) * j;
            var x = s.x + Math.cos(a) * s.radius;
            var y = s.y + Math.sin(a) * s.radius * 0.3;
            if (j === 0) visualCtx.moveTo(x, y);
            else visualCtx.lineTo(x, y);
        }
        visualCtx.closePath();
        visualCtx.stroke();
    }
    visualCtx.globalAlpha = 1;
}

function drawFloating() {
    if (!effects || !effects.floating || !visualCtx) return;
    
    for (var i = effects.floating.length - 1; i >= 0; i--) {
        var f = effects.floating[i];
        if (!f) continue;
        
        f.y -= f.speed;
        f.x += Math.sin(f.y * 0.01 + f.offset) * f.drift;
        f.alpha -= 0.003;
        
        if (f.alpha <= 0 || f.y < -20) {
            effects.floating.splice(i, 1);
            continue;
        }
        
        visualCtx.fillStyle = f.color;
        visualCtx.globalAlpha = f.alpha;
        visualCtx.beginPath();
        visualCtx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
        visualCtx.fill();
        
        if (f.type === 'glow') {
            visualCtx.globalAlpha = f.alpha * 0.3;
            visualCtx.beginPath();
            visualCtx.arc(f.x, f.y, f.size * 2, 0, Math.PI * 2);
            visualCtx.fill();
        }
    }
    visualCtx.globalAlpha = 1;
}

function drawComets() {
    if (!effects || !effects.comets || !visualCtx) return;
    
    for (var i = effects.comets.length - 1; i >= 0; i--) {
        var c = effects.comets[i];
        if (!c) continue;
        
        if (!c.trail) c.trail = [];
        c.trail.push({ x: c.x, y: c.y, b: c.brightness });
        if (c.trail.length > (c.maxTrail || 30)) c.trail.shift();
        
        c.x += Math.cos(c.angle) * c.speed;
        c.y += Math.sin(c.angle) * c.speed;
        
        if (c.x < -100 || c.x > w + 100 || c.y < -100 || c.y > h + 100) {
            effects.comets.splice(i, 1);
            continue;
        }
        
        for (var j = 0; j < c.trail.length; j++) {
            var t = c.trail[j];
            if (!t) continue;
            visualCtx.fillStyle = '#acf';
            visualCtx.globalAlpha = (j / c.trail.length) * (t.b || 1) * 0.6;
            visualCtx.beginPath();
            visualCtx.arc(t.x, t.y, (j / c.trail.length) * (c.size || 2), 0, Math.PI * 2);
            visualCtx.fill();
        }
        
        visualCtx.fillStyle = '#fff';
        visualCtx.globalAlpha = (c.brightness || 1);
        visualCtx.beginPath();
        visualCtx.arc(c.x, c.y, (c.size || 2) * 1.5, 0, Math.PI * 2);
        visualCtx.fill();
    }
    visualCtx.globalAlpha = 1;
}

function drawParticles() {
    if (!effects || !effects.particles || !visualCtx) return;
    
    for (var i = effects.particles.length - 1; i >= 0; i--) {
        var p = effects.particles[i];
        if (!p) continue;
        
        p.x += p.vx || 0;
        p.y += p.vy || 0;
        p.vy = (p.vy || 0) + 0.1;
        
        if (!w || !h || p.x < -50 || p.x > w + 50 || p.y < -50 || p.y > h + 50) {
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
    
    var power = 0, cps = 0, clicks = 0;
    try { power = getClickPower() || 0; } catch(e) {}
    try { cps = getCps() || 0; } catch(e) {}
    try { clicks = window.GAME ? (window.GAME.clicks || 0) : 0; } catch(e) {}
    
    if (power > 5 && effects.auras) {
        var color = getPowerColor(power);
        effects.auras.push({
            x: w / 2, y: h / 2,
            radius: 250, maxRadius: 350 + power * 0.3,
            alpha: 0.5, speed: power > 200 ? 4 : 1,
            color: color, rings: Math.floor(power / 50) + 1
        });
        
        // Ground cracks on big hits
        if (power > 100 && Math.random() < 0.3 && effects.cracks) {
            spawnCrack(power);
        }
    }
    
    if (!effects.auras) return;
    
    for (var i = effects.auras.length - 1; i >= 0; i--) {
        var a = effects.auras[i];
        if (!a) continue;
        
        a.radius += a.speed;
        a.alpha -= 0.012;
        
        if (a.alpha <= 0 || a.radius > a.maxRadius) {
            effects.auras.splice(i, 1);
            continue;
        }
        
        for (var j = 0; j < (a.rings || 1); j++) {
            var g = visualCtx.createRadialGradient(a.x, a.y, 0, a.x, a.y, a.radius - j * 30);
            g.addColorStop(0, 'transparent');
            g.addColorStop(0.7, a.color);
            g.addColorStop(1, 'transparent');
            visualCtx.fillStyle = g;
            visualCtx.globalAlpha = a.alpha * (1 - j * 0.3);
            visualCtx.beginPath();
            visualCtx.arc(a.x, a.y, a.radius - j * 30, 0, Math.PI * 2);
            visualCtx.fill();
        }
    }
    visualCtx.globalAlpha = 1;
}

function getPowerColor(power) {
    if (power > 2000) return '#f0f';
    if (power > 1000) return '#f80';
    if (power > 500) return '#f44';
    if (power > 200) return '#4af';
    if (power > 50) return '#4f8';
    return '#08f';
}

function spawnCrack(power) {
    if (!effects.cracks) return;
    var cx = w / 2, cy = h / 2;
    var angle = Math.random() * Math.PI * 2;
    var len = 20 + power * 0.3;
    effects.cracks.push({
        x: cx, y: cy, x1: cx, y1: cy,
        x: cx + Math.cos(angle) * len,
        y: cy + Math.sin(angle) * len,
        life: 1, width: 1 + power / 100,
        branches: Math.random() > 0.5 ? [
            { x: cx + Math.cos(angle + 0.5) * len * 0.5, y: cy + Math.sin(angle + 0.5) * len * 0.5 },
            { x: cx + Math.cos(angle - 0.5) * len * 0.5, y: cy + Math.sin(angle - 0.5) * len * 0.5 }
        ] : null
    });
}

function drawShockwaves() {
    if (!effects || !effects.shockwaves || !visualCtx) return;
    
    for (var i = effects.shockwaves.length - 1; i >= 0; i--) {
        var s = effects.shockwaves[i];
        if (!s) continue;
        
        s.radius += s.speed;
        s.alpha -= 0.03;
        
        if (s.alpha <= 0) {
            effects.shockwaves.splice(i, 1);
            continue;
        }
        
        visualCtx.strokeStyle = s.color;
        visualCtx.globalAlpha = s.alpha;
        visualCtx.lineWidth = s.width;
        visualCtx.beginPath();
        visualCtx.arc(s.x || w/2, s.y || h/2, s.radius, 0, Math.PI * 2);
        visualCtx.stroke();
        
        if (s.width > 4) {
            visualCtx.lineWidth = 1;
            visualCtx.beginPath();
            visualCtx.arc(s.x || w/2, s.y || h/2, s.radius * 0.7, 0, Math.PI * 2);
            visualCtx.stroke();
        }
    }
    visualCtx.globalAlpha = 1;
}

function drawBlasts() {
    if (!effects || !effects.blasts || !visualCtx) return;
    
    for (var i = effects.blasts.length - 1; i >= 0; i--) {
        var b = effects.blasts[i];
        if (!b) continue;
        
        b.radius += 8;
        b.life -= 0.03;
        
        if (b.life <= 0) {
            effects.blasts.splice(i, 1);
            continue;
        }
        
        visualCtx.fillStyle = b.color;
        visualCtx.globalAlpha = b.life;
        visualCtx.beginPath();
        visualCtx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        visualCtx.fill();
    }
    visualCtx.globalAlpha = 1;
}

var planetRotation = 0;
var planetPulse = 0;
var ringRotation = 0;

function drawEpicPlanet() {
    if (!visualCtx || !w || !h) return;
    
    var cx = w / 2, cy = h / 2, baseR = 80;
    planetRotation += 0.008;
    planetPulse += 0.025;
    ringRotation += 0.004;
    
    var energy = 0, upgrades = 0, clicks = 0;
    try { energy = (window.GAME ? window.GAME.energy : 0) || 0; } catch(e) {}
    try { upgrades = (window.GAME ? Object.keys(window.GAME.upgrades || {}).length : 0) || 0; } catch(e) {}
    try { clicks = (window.GAME ? window.GAME.clicks : 0) || 0; } catch(e) {}
    
    var scale = 1 + Math.log(Math.max(1, energy + 1)) / 18;
    var r = baseR * Math.min(3, scale);
    
    var zone = 'v';
    try { zone = (window.GAME ? window.GAME.currentZone : 'v') || 'v'; } catch(e) {}
    
    var colors = getPlanetColors(zone);
    var glowColors = getGlow(zone);
    
    // Dynamic rings
    if (upgrades > 3) drawPlanetRings(cx, cy, r, upgrades);
    
    // Epic glow
    var glowR = r * (2 + Math.sin(planetPulse) * 0.15);
    var glow = visualCtx.createRadialGradient(cx, cy, r * 0.3, cx, cy, glowR);
    glow.addColorStop(0, glowColors.inner);
    glow.addColorStop(0.4, glowColors.mid + '99');
    glow.addColorStop(0.7, glowColors.mid + '33');
    glow.addColorStop(1, 'transparent');
    visualCtx.fillStyle = glow;
    visualCtx.globalAlpha = 0.7;
    visualCtx.fillRect(cx - glowR, cy - glowR, glowR * 2, glowR * 2);
    
    // Corona
    var coronaCount = 4 + Math.floor(upgrades / 8);
    for (var i = 0; i < coronaCount; i++) {
        var ang = planetRotation * (i % 2 ? 1.8 : -1.5) + (Math.PI * 2 / coronaCount) * i;
        var arcR = r * (1.35 + Math.sin(planetPulse + i * 0.7) * 0.2);
        var alpha = 0.5 - i * 0.1;
        if (alpha < 0) alpha = 0;
        visualCtx.strokeStyle = i % 2 ? '#aaf' : colors.accent;
        visualCtx.globalAlpha = alpha;
        visualCtx.lineWidth = 3 - i * 0.4;
        visualCtx.beginPath();
        visualCtx.arc(cx, cy, arcR, ang - 0.5, ang + 0.5);
        visualCtx.stroke();
    }
    
    // Planet body
    var grad = visualCtx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, 0, cx, cy, r);
    grad.addColorStop(0, colors.high);
    grad.addColorStop(0.25, colors.core);
    grad.addColorStop(0.7, colors.surface);
    grad.addColorStop(1, colors.mantle);
    visualCtx.fillStyle = grad;
    visualCtx.beginPath();
    visualCtx.arc(cx, cy, r, 0, Math.PI * 2);
    visualCtx.fill();
    
    // Surface bands
    for (var j = 0; j < 4; j++) {
        visualCtx.strokeStyle = 'rgba(255,255,255,0.08)';
        visualCtx.lineWidth = 1;
        visualCtx.beginPath();
        var by = cy + Math.sin(planetRotation * 2 + j * 1.5) * r * 0.5;
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

function drawPlanetRings(cx, cy, r, upgrades) {
    var count = Math.min(10, Math.floor(upgrades / 4));
    for (var i = 0; i < count; i++) {
        var ringR = r * (1.6 + i * 0.3);
        var rot = ringRotation * (i % 2 ? 1.2 : -1);
        var col = ['#48f', '#4f8', '#f48', '#f4f', '#4ff', '#ff4'][i % 6];
        visualCtx.strokeStyle = col;
        visualCtx.globalAlpha = 0.25 - i * 0.025;
        visualCtx.lineWidth = 1.5;
        visualCtx.setLineDash([8 - i, 4 + i]);
        visualCtx.beginPath();
        visualCtx.ellipse(cx, cy, ringR, ringR * 0.25, rot, 0, Math.PI * 2);
        visualCtx.stroke();
    }
    visualCtx.setLineDash([]);
    visualCtx.globalAlpha = 1;
}

function getPlanetColors(zone) {
    var c = {
        v: { core: '#678', mantle: '#456', surface: '#567', high: '#89a', accent: '#8ab' },
        q: { core: '#a6f', mantle: '#84d', surface: '#96e', high: '#c8f', accent: '#daf' },
        t: { core: '#fa4', mantle: '#d82', surface: '#e94', high: '#fc6', accent: '#fb5' },
        m: { core: '#6af', mantle: '#48d', surface: '#59e', high: '#8cf', accent: '#9de' },
        l: { core: '#ff6', mantle: '#dd4', surface: '#ee5', high: '#ff8', accent: '#ff9' },
        d: { core: '#a4a', mantle: '#828', surface: '#949', high: '#c6c', accent: '#d8d' },
        e: { core: '#fff', mantle: '#ccc', surface: '#ddd', high: '#fff', accent: '#eee' },
        inf: { core: '#f4f', mantle: '#c2c', surface: '#e3e', high: '#f7f', accent: '#f8f' }
    };
    return c[zone] || c.v;
}

function getGlow(zone) {
    var g = {
        v: { inner: '#9bd', mid: '#468' },
        q: { inner: '#d9f', mid: '#84d' },
        t: { inner: '#fd8', mid: '#d82' },
        m: { inner: '#9df', mid: '#48d' },
        l: { inner: '#ff9', mid: '#dd4' },
        d: { inner: '#d9d', mid: '#828' },
        e: { inner: '#fff', mid: '#aaa' },
        inf: { inner: '#f9f', mid: '#c2c' }
    };
    return g[zone] || g.v;
}

function drawUpgradeEffects() {
    if (!visualCtx) return;
    
    var upgrades = 0, clicks = 0;
    try { upgrades = (window.GAME ? Object.keys(window.GAME.upgrades || {}).length : 0) || 0; } catch(e) {}
    try { clicks = (window.GAME ? window.GAME.clicks : 0) || 0; } catch(e) {}
    
    // Particles flying up
    if (Math.random() < upgrades * 0.003) {
        spawnFloatingParticle(upgrades);
    }
    
    // Meteors
    if (Math.random() < upgrades * 0.002 + clicks * 0.00001) {
        spawnMeteor();
    }
    
    // Spirals on big events
    if (Math.random() < upgrades * 0.001) {
        spawnSpiral();
    }
}

function spawnFloatingParticle(upgrades) {
    ensureEffects();
    if (!effects.floating) return;
    var cx = w / 2, cy = h / 2;
    var angle = Math.random() * Math.PI * 2;
    var dist = 200 + upgrades * 15;
    effects.floating.push({
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        speed: 1 + Math.random() * 2,
        drift: (Math.random() - 0.5) * 0.5,
        offset: Math.random() * Math.PI * 2,
        size: Math.random() * 4 + 1,
        alpha: 0.9,
        color: ['#8af', '#f8a', '#a8f', '#fa8', '#8fa'][Math.floor(Math.random() * 5)],
        type: Math.random() > 0.5 ? 'glow' : 'dust'
    });
}

function spawnMeteor() {
    ensureEffects();
    if (!effects.meteors) return;
    effects.meteors.push({
        x: Math.random() * w,
        y: -30,
        vx: 3 + Math.random() * 4,
        vy: 2 + Math.random() * 3,
        size: Math.random() * 2 + 1,
        color: '#fff',
        life: 1,
        trail: []
    });
}

function spawnSpiral() {
    ensureEffects();
    if (!effects.spirals) return;
    effects.spirals.push({
        x: w / 2, y: h / 2,
        radius: 50, grow: 3, spin: 0.08,
        life: 1, maxRadius: 200,
        arcs: 3, color: '#f80', angle: 0
    });
}

function addClickBurst(x, y, power, isCrit) {
    if (!visualCtx || !w || !h) return;
    ensureEffects();
    
    var cx = x || w / 2, cy = y || h / 2;
    var color = isCrit ? '#f60' : '#0af';
    var count = isCrit ? 30 : 15;
    var burstColor = isCrit ? 'orange' : 'blue';
    
    // Shockwave
    if (effects.shockwaves) {
        effects.shockwaves.push({
            x: cx, y: cy,
            radius: isCrit ? 150 : 80,
            alpha: 1, speed: isCrit ? 15 : 7,
            color: color, width: isCrit ? 10 : 5
        });
    }
    
    // Particles
    if (effects.particles) {
        for (var i = 0; i < count; i++) {
            var ang = Math.random() * Math.PI * 2;
            var spd = 25 + Math.random() * 70;
            var col = isCrit ? ['#f60', '#f80', '#fa0'][Math.floor(Math.random() * 3)] : ['#0cf', '#0fc', '#08f'][Math.floor(Math.random() * 3)];
            effects.particles.push({
                x: cx, y: cy,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd,
                size: isCrit ? 6 : 3,
                color: col
            });
        }
    }
    
    // Big hit spiral
    if (power > 50 && effects.spirals) {
        effects.spirals.push({
            x: cx, y: cy,
            radius: 30, grow: 4, spin: 0.1,
            life: 1, maxRadius: 150 + power * 0.2,
            arcs: isCrit ? 4 : 2,
            color: color, angle: 0
        });
    }
    
    // Extra for crits
    if (isCrit && effects.blasts) {
        effects.blasts.push({
            x: cx, y: cy,
            radius: 10, color: '#f80', life: 1
        });
    }
}

setInterval(function() {
    ensureEffects();
    // Spawn comet
    if (Math.random() < 0.25) {
        var start = Math.random() > 0.5;
        if (effects.comets) {
            effects.comets.push({
                x: start ? -50 : w + 50,
                y: Math.random() * h * 0.7,
                angle: start ? 0.15 : 0.85,
                speed: 4 + Math.random() * 4,
                size: 2 + Math.random() * 3,
                brightness: 1,
                trail: [], maxTrail: 30
            });
        }
    }
    
    // Spawn meteor
    if (Math.random() < 0.08) {
        spawnMeteor();
    }
    
    // Portal pulse
    if (effects.portals && Math.random() < 0.1) {
        for (var i = 0; i < effects.portals.length; i++) {
            var p = effects.portals[i];
            if (p && Math.random() < 0.3) {
                // Flash portal
            }
        }
    }
}, 600);

window.initVisuals = initVisuals;
window.addClickBurst = addClickBurst;
window.visualTime = visualTime;