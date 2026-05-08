// ========================
// MAXIMUM EPIC VISUAL SYSTEM
// ========================
var visualCanvas, visualCtx, visualTime, effects, w, h;

function initVisuals() {
    try {
        visualCanvas = document.getElementById('visualCanvas') || document.createElement('canvas');
        visualCanvas.id = 'visualCanvas';
        visualCanvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;';
        if (visualCanvas.parentNode !== document.body) document.body.insertBefore(visualCanvas, document.body.firstChild);
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

function ensureEffects() {
    if (!effects) effects = {
        stars: [], nebulas: [], comets: [], particles: [], auras: [],
        shockwaves: [], floating: [], rings: [], spirals: [], blasts: [],
        meteors: [], portals: [], cracks: [], lasers: [], bubbles: [], orbs: [],
        storm: null, aurora: null, eclipse: null, supernova: null
    };
    return effects;
}

function initWorld() {
    // Stars with depth
    for (var i = 0; i < 500; i++) {
        var isBig = Math.random() > 0.95;
        effects.stars.push({
            x: Math.random() * w, y: Math.random() * h,
            z: isBig ? 3 : Math.random() * 2 + 0.5,
            size: isBig ? Math.random() * 3 + 2 : Math.random() * 1.5 + 0.3,
            brightness: Math.random(), twinkle: Math.random() * Math.PI * 2,
            color: ['#fff','#aaf','#faf','#ffa','#aff','#faa','#aef','#eaf'][Math.floor(Math.random() * 8)],
            pulse: Math.random() * Math.PI * 2
        });
    }
    
    // Animated nebulas
    for (var n = 0; n < 10; n++) {
        effects.nebulas.push({
            x: Math.random() * w, y: Math.random() * h,
            size: 200 + Math.random() * 300,
            color: ['#308','#038','#083','#308','#033','#303'][Math.floor(Math.random() * 6)],
            color2: ['#527','#052','#275','#527','#045','#324'][Math.floor(Math.random() * 6)],
            alpha: 0.05 + Math.random() * 0.1,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.2,
            angle: Math.random() * Math.PI * 2
        });
    }
    
    // Portal gates
    for (var p = 0; p < 4; p++) {
        var side = Math.random() > 0.5;
        effects.portals.push({
            x: side ? -30 : w + 30,
            y: Math.random() * h * 0.6 + h * 0.2,
            size: 25 + Math.random() * 35,
            rotation: Math.random() * Math.PI * 2,
            vr: (Math.random() - 0.5) * 0.03,
            brightness: Math.random(),
            color: ['#48f','#4f8','#f48','#4ff','#f4f'][Math.floor(Math.random() * 5)],
            delay: p * 50
        });
    }
}

function animateVisuals() {
    if (!visualCtx || !w || !h) { requestAnimationFrame(animateVisuals); return; }
    visualTime += 0.016;
    ensureEffects();
    
    drawSky();
    drawNebulas();
    drawEclipse();
    drawAurora();
    drawStorm();
    drawSupernova();
    drawPortals();
    drawStars();
    drawMeteors();
    drawLasers();
    drawCracks();
    drawSpirals();
    drawBubbles();
    drawOrbs();
    drawFloating();
    drawComets();
    drawParticles();
    drawAuras();
    drawShockwaves();
    drawBlasts();
    drawEpicPlanet();
    drawUpgradeEffects();
    spawnObjects();
    
    requestAnimationFrame(animateVisuals);
}

function drawSky() {
    var g = visualCtx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w);
    g.addColorStop(0, '#0a0a20');
    g.addColorStop(0.4, '#050515');
    g.addColorStop(1, '#020206');
    visualCtx.fillStyle = g;
    visualCtx.fillRect(0, 0, w, h);
}

function drawEclipse() {
    if (!effects.eclipse || !visualCtx) return;
    var e = effects.eclipse;
    e.angle += 0.002;
    e.darkness = Math.max(0, e.darkness - 0.001);
    
    if (e.darkness > 0) {
        visualCtx.fillStyle = '#000';
        visualCtx.globalAlpha = e.darkness * 0.7;
        visualCtx.beginPath();
        visualCtx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        visualCtx.fill();
        // Glow ring
        visualCtx.strokeStyle = e.color;
        visualCtx.globalAlpha = e.darkness * 0.3;
        visualCtx.lineWidth = 8;
        visualCtx.beginPath();
        visualCtx.arc(e.x + Math.cos(e.angle) * 5, e.y + Math.sin(e.angle) * 5, e.size + 20, 0, Math.PI * 2);
        visualCtx.stroke();
    }
    visualCtx.globalAlpha = 1;
}

function drawAurora() {
    if (!effects.aurora || !visualCtx) return;
    var a = effects.aurora;
    a.time += 0.02;
    
    visualCtx.globalAlpha = 0.3;
    for (var i = 0; i < 5; i++) {
        var y = a.y + Math.sin(a.time + i) * 40;
        var g = visualCtx.createLinearGradient(0, y - 100, 0, y + 100);
        g.addColorStop(0, 'transparent');
        g.addColorStop(0.5, a.color + '66');
        g.addColorStop(1, 'transparent');
        visualCtx.fillStyle = g;
        visualCtx.beginPath();
        visualCtx.moveTo(a.x1, y);
        visualCtx.bezierCurveTo(a.x1 + 50, y - 50, a.x2 - 50, y + 50, a.x2, y);
        visualCtx.lineTo(a.x2, y + 200);
        visualCtx.lineTo(a.x1, y + 200);
        visualCtx.closePath();
        visualCtx.fill();
    }
    visualCtx.globalAlpha = 1;
}

function drawStorm() {
    if (!effects.storm || !visualCtx) return;
    var s = effects.storm;
    s.time += 0.05;
    
    visualCtx.globalAlpha = 0.15;
    for (var i = 0; i < s.flashes; i++) {
        if (Math.random() < 0.3) {
            var x = s.x + (Math.random() - 0.5) * s.width;
            visualCtx.fillStyle = '#fff';
            visualCtx.beginPath();
            visualCtx.arc(x, s.y + Math.random() * 100, Math.random() * 3, 0, Math.PI * 2);
            visualCtx.fill();
        }
    }
    // Rain
    for (var j = 0; j < s.drops; j++) {
        visualCtx.strokeStyle = '#468';
        visualCtx.globalAlpha = 0.2;
        visualCtx.lineWidth = 1;
        visualCtx.beginPath();
        var dx = (s.x - s.width/2) + Math.random() * s.width;
        var dy = (s.y - s.height/2) + Math.random() * s.height;
        visualCtx.moveTo(dx, dy);
        visualCtx.lineTo(dx - 2, dy + 15);
        visualCtx.stroke();
    }
    visualCtx.globalAlpha = 1;
}

function drawSupernova() {
    if (!effects.supernova || !visualCtx) return;
    var s = effects.supernova;
    s.radius += s.speed;
    s.life -= 0.005;
    s.flash -= 0.03;
    
    if (s.life <= 0) { effects.supernova = null; return; }
    
    // Core
    var g = visualCtx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.radius);
    g.addColorStop(0, '#fff');
    g.addColorStop(0.3, s.color);
    g.addColorStop(0.7, s.color + '88');
    g.addColorStop(1, 'transparent');
    visualCtx.fillStyle = g;
    visualCtx.globalAlpha = s.life;
    visualCtx.beginPath();
    visualCtx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    visualCtx.fill();
    
    // Flash
    if (s.flash > 0) {
        visualCtx.fillStyle = '#fff';
        visualCtx.globalAlpha = s.flash;
        visualCtx.fillRect(0, 0, w, h);
    }
    visualCtx.globalAlpha = 1;
}

function drawNebulas() {
    for (var i = 0; i < effects.nebulas.length; i++) {
        var n = effects.nebulas[i];
        if (!n) continue;
        n.x += n.vx;
        n.y += n.vy;
        n.angle += 0.001;
        if (n.x < -n.size) n.x = w + n.size;
        if (n.x > w + n.size) n.x = -n.size;
        if (n.y < -n.size) n.y = h + n.size;
        if (n.y > h + n.size) n.y = -n.size;
        
        var g = visualCtx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.size);
        g.addColorStop(0, n.color + Math.floor(n.alpha * 255).toString(16));
        g.addColorStop(0.4, n.color2 + Math.floor(n.alpha * 200).toString(16));
        g.addColorStop(1, 'transparent');
        visualCtx.fillStyle = g;
        visualCtx.globalAlpha = n.alpha;
        visualCtx.fillRect(0, 0, w, h);
    }
    visualCtx.globalAlpha = 1;
}

function drawStars() {
    for (var i = 0; i < effects.stars.length; i++) {
        var s = effects.stars[i];
        if (!s) continue;
        s.twinkle += s.z * 0.12;
        var pulse = 0.5 + Math.sin(s.twinkle + s.pulse) * 0.3;
        var b = s.brightness * pulse;
        
        visualCtx.fillStyle = s.color;
        visualCtx.globalAlpha = b;
        visualCtx.beginPath();
        visualCtx.arc(s.x, s.y, s.size / s.z, 0, Math.PI * 2);
        visualCtx.fill();
        
        if (s.size > 2) {
            visualCtx.globalAlpha = b * 0.3;
            visualCtx.beginPath();
            visualCtx.arc(s.x, s.y, (s.size * 2) / s.z, 0, Math.PI * 2);
            visualCtx.fill();
        }
    }
    visualCtx.globalAlpha = 1;
}

function drawLasers() {
    if (!effects.lasers) return;
    for (var i = effects.lasers.length - 1; i >= 0; i--) {
        var l = effects.lasers[i];
        if (!l) continue;
        l.life -= 0.03;
        l.width -= 1;
        if (l.life <= 0 || l.width <= 0) { effects.lasers.splice(i, 1); continue; }
        
        visualCtx.strokeStyle = l.color;
        visualCtx.globalAlpha = l.life;
        visualCtx.lineWidth = l.width;
        visualCtx.beginPath();
        visualCtx.moveTo(l.x1, l.y1);
        visualCtx.lineTo(l.x2, l.y2);
        visualCtx.stroke();
        
        // Impact
        visualCtx.fillStyle = l.color;
        visualCtx.globalAlpha = l.life * 0.8;
        visualCtx.beginPath();
        visualCtx.arc(l.x2, l.y2, l.width * 1.5, 0, Math.PI * 2);
        visualCtx.fill();
    }
    visualCtx.globalAlpha = 1;
}

function drawCracks() {
    if (!effects.cracks) return;
    for (var i = effects.cracks.length - 1; i >= 0; i--) {
        var c = effects.cracks[i];
        if (!c) continue;
        c.life -= 0.025;
        if (c.life <= 0) { effects.cracks.splice(i, 1); continue; }
        
        visualCtx.strokeStyle = '#fff';
        visualCtx.globalAlpha = c.life;
        visualCtx.lineWidth = c.width;
        visualCtx.beginPath();
        visualCtx.moveTo(c.x1, c.y1);
        visualCtx.lineTo(c.x, c.y);
        visualCtx.stroke();
        
        if (c.branches) {
            visualCtx.lineWidth = c.width * 0.5;
            for (var j = 0; j < c.branches.length; j++) {
                var b = c.branches[j];
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
    if (!effects.spirals) return;
    for (var i = effects.spirals.length - 1; i >= 0; i--) {
        var s = effects.spirals[i];
        if (!s) continue;
        s.radius += s.grow;
        s.angle += s.spin;
        s.life -= 0.018;
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
            if (j === s.arcs - 1) visualCtx.closePath();
        }
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
        b.alpha -= 0.008;
        if (b.alpha <= 0 || b.y < -20) { effects.bubbles.splice(i, 1); continue; }
        
        visualCtx.strokeStyle = b.color;
        visualCtx.globalAlpha = b.alpha;
        visualCtx.lineWidth = 2;
        visualCtx.beginPath();
        visualCtx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        visualCtx.stroke();
        
        // Shine
        visualCtx.fillStyle = '#fff';
        visualCtx.globalAlpha = b.alpha * 0.4;
        visualCtx.beginPath();
        visualCtx.arc(b.x - b.size * 0.3, b.y - b.size * 0.3, b.size * 0.3, 0, Math.PI * 2);
        visualCtx.fill();
    }
    visualCtx.globalAlpha = 1;
}

function drawOrbs() {
    if (!effects.orbs) return;
    for (var i = effects.orbs.length - 1; i >= 0; i--) {
        var o = effects.orbs[i];
        if (!o) continue;
        o.y += o.speed;
        o.life -= 0.015;
        if (o.life <= 0 || o.y > h + 20) { effects.orbs.splice(i, 1); continue; }
        
        var g = visualCtx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.size);
        g.addColorStop(0, o.color);
        g.addColorStop(0.7, o.color + 'aa');
        g.addColorStop(1, 'transparent');
        visualCtx.fillStyle = g;
        visualCtx.globalAlpha = o.life;
        visualCtx.beginPath();
        visualCtx.arc(o.x, o.y, o.size, 0, Math.PI * 2);
        visualCtx.fill();
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
        visualCtx.globalAlpha = 0.3 + Math.sin(p.brightness) * 0.2;
        visualCtx.fillRect(-p.size, -p.size, p.size * 2, p.size * 2);
        
        visualCtx.strokeStyle = p.color;
        visualCtx.globalAlpha = 0.6;
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

function drawMeteors() {
    if (!effects.meteors) return;
    for (var i = effects.meteors.length - 1; i >= 0; i--) {
        var m = effects.meteors[i];
        if (!m) continue;
        if (!m.trail) m.trail = [];
        m.trail.push({x: m.x, y: m.y, l: m.life});
        if (m.trail.length > 20) m.trail.shift();
        
        m.x -= m.vx;
        m.y -= m.vy;
        m.life -= 0.018;
        
        if (m.life <= 0 || m.y < -50) { effects.meteors.splice(i, 1); continue; }
        
        for (var j = 0; j < m.trail.length; j++) {
            var t = m.trail[j];
            visualCtx.fillStyle = m.color;
            visualCtx.globalAlpha = (j / m.trail.length) * t.l * 0.6;
            visualCtx.beginPath();
            visualCtx.arc(t.x, t.y, (j / m.trail.length) * m.size, 0, Math.PI * 2);
            visualCtx.fill();
        }
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
        f.alpha -= 0.004;
        if (f.alpha <= 0 || f.y < -20) { effects.floating.splice(i, 1); continue; }
        
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
    if (!effects.comets) return;
    for (var i = effects.comets.length - 1; i >= 0; i--) {
        var c = effects.comets[i];
        if (!c) continue;
        if (!c.trail) c.trail = [];
        c.trail.push({x: c.x, y: c.y, b: c.brightness});
        if (c.trail.length > c.maxTrail) c.trail.shift();
        
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
    
    var power = 0, clicks = 0, upgrades = 0;
    try { power = getClickPower() || 0; } catch(e) {}
    try { clicks = (window.GAME ? window.GAME.clicks : 0) || 0; } catch(e) {}
    try { upgrades = (window.GAME ? Object.keys(window.GAME.upgrades || {}).length : 0) || 0; } catch(e) {}
    
    if (power > 3 && effects.auras) {
        var color = power > 2000 ? '#f0f' : power > 1000 ? '#f80' : power > 500 ? '#f44' : power > 100 ? '#4af' : '#08f';
        effects.auras.push({x: w/2, y: h/2, radius: 300, maxRadius: 400 + power * 0.25, alpha: 0.5, speed: power > 200 ? 5 : 1, color: color, rings: Math.floor(power / 40) + 1});
        
        if (power > 80 && Math.random() < power / 500 && effects.cracks) {
            var cx = w/2, cy = h/2, angle = Math.random() * Math.PI * 2, len = 15 + power * 0.4;
            effects.cracks.push({x: cx, y: cy, x1: cx, y1: cy, x: cx + Math.cos(angle) * len, y: cy + Math.sin(angle) * len, life: 1, width: 1 + power / 80, branches: Math.random() > 0.4 ? [{x: cx + Math.cos(angle + 0.6) * len * 0.5, y: cy + Math.sin(angle + 0.6) * len * 0.5}, {x: cx + Math.cos(angle - 0.6) * len * 0.5, y: cy + Math.sin(angle - 0.6) * len * 0.5}] : null});
        }
        
        if (power > 150 && Math.random() < power / 400 && effects.lasers) {
            var side = Math.random() > 0.5 ? -20 : w + 20;
            effects.lasers.push({x1: side, y1: Math.random() * h * 0.8, x2: w/2 + (Math.random() - 0.5) * 50, y2: h/2 + (Math.random() - 0.5) * 50, color: '#f80', life: 1, width: 5, width: 5 + power / 30});
        }
    }
    
    if (!effects.auras) return;
    for (var i = effects.auras.length - 1; i >= 0; i--) {
        var a = effects.auras[i];
        if (!a) continue;
        a.radius += a.speed;
        a.alpha -= 0.015;
        if (a.alpha <= 0 || a.radius > a.maxRadius) { effects.auras.splice(i, 1); continue; }
        
        for (var j = 0; j < (a.rings || 1); j++) {
            var g = visualCtx.createRadialGradient(a.x, a.y, 0, a.x, a.y, a.radius - j * 35);
            g.addColorStop(0, 'transparent');
            g.addColorStop(0.7, a.color);
            g.addColorStop(1, 'transparent');
            visualCtx.fillStyle = g;
            visualCtx.globalAlpha = a.alpha * (1 - j * 0.35);
            visualCtx.beginPath();
            visualCtx.arc(a.x, a.y, a.radius - j * 35, 0, Math.PI * 2);
            visualCtx.fill();
        }
    }
    visualCtx.globalAlpha = 1;
}

function drawShockwaves() {
    if (!effects.shockwaves) return;
    for (var i = effects.shockwaves.length - 1; i >= 0; i--) {
        var s = effects.shockwaves[i];
        if (!s) continue;
        s.radius += s.speed;
        s.alpha -= 0.035;
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

var planetRotation = 0, planetPulse = 0, ringRotation = 0;

function drawEpicPlanet() {
    if (!visualCtx || !w || !h) return;
    var cx = w/2, cy = h/2, baseR = 80;
    planetRotation += 0.01;
    planetPulse += 0.03;
    ringRotation += 0.005;
    
    var energy = 0, upgrades = 0;
    try { energy = (window.GAME ? window.GAME.energy : 0) || 0; } catch(e) {}
    try { upgrades = (window.GAME ? Object.keys(window.GAME.upgrades || {}).length : 0) || 0; } catch(e) {}
    
    var r = baseR * Math.min(3.5, 1 + Math.log(Math.max(1, energy + 1)) / 15);
    var zone = 'v';
    try { zone = (window.GAME ? window.GAME.currentZone : 'v') || 'v'; } catch(e) {}
    
    var colors = getPlanetColors(zone);
    var glow = getGlow(zone);
    
    // Dynamic rings
    if (upgrades > 2) drawPlanetRings(cx, cy, r, upgrades);
    
    // Super glow
    var glowR = r * (2.2 + Math.sin(planetPulse) * 0.18);
    var g = visualCtx.createRadialGradient(cx, cy, r * 0.2, cx, cy, glowR);
    g.addColorStop(0, glow.inner);
    g.addColorStop(0.35, glow.mid + 'aa');
    g.addColorStop(0.7, glow.mid + '33');
    g.addColorStop(1, 'transparent');
    visualCtx.fillStyle = g;
    visualCtx.globalAlpha = 0.8;
    visualCtx.fillRect(cx - glowR, cy - glowR, glowR * 2, glowR * 2);
    
    // Corona
    var coronaCount = 5 + Math.floor(upgrades / 7);
    for (var i = 0; i < coronaCount; i++) {
        var ang = planetRotation * (i % 2 ? 2 : -1.8) + (Math.PI * 2 / coronaCount) * i;
        var arcR = r * (1.4 + Math.sin(planetPulse + i) * 0.25);
        visualCtx.strokeStyle = i % 2 ? '#aaf' : colors.accent;
        visualCtx.globalAlpha = 0.6 - i * 0.12;
        visualCtx.lineWidth = 4 - i * 0.5;
        visualCtx.beginPath();
        visualCtx.arc(cx, cy, arcR, ang - 0.6, ang + 0.6);
        visualCtx.stroke();
    }
    
    // Planet body
    var grad = visualCtx.createRadialGradient(cx - r * 0.38, cy - r * 0.38, 0, cx, cy, r);
    grad.addColorStop(0, colors.high);
    grad.addColorStop(0.3, colors.core);
    grad.addColorStop(0.7, colors.surface);
    grad.addColorStop(1, colors.mantle);
    visualCtx.fillStyle = grad;
    visualCtx.beginPath();
    visualCtx.arc(cx, cy, r, 0, Math.PI * 2);
    visualCtx.fill();
    
    // Surface detail
    for (var j = 0; j < 5; j++) {
        visualCtx.strokeStyle = 'rgba(255,255,255,0.06)';
        visualCtx.lineWidth = 1;
        visualCtx.beginPath();
        var by = cy + Math.sin(planetRotation * 2.5 + j * 1.8) * r * 0.55;
        visualCtx.moveTo(cx - r * 0.85, by);
        visualCtx.bezierCurveTo(cx - r * 0.4, by + 8, cx + r * 0.4, by - 8, cx + r * 0.85, by);
        visualCtx.stroke();
    }
    
    visualCtx.fillStyle = 'rgba(255,255,255,0.32)';
    visualCtx.beginPath();
    visualCtx.arc(cx - r * 0.38, cy - r * 0.38, r * 0.38, 0, Math.PI * 2);
    visualCtx.fill();
    visualCtx.globalAlpha = 1;
}

function drawPlanetRings(cx, cy, r, upgrades) {
    var count = Math.min(12, Math.floor(upgrades / 3));
    for (var i = 0; i < count; i++) {
        var ringR = r * (1.7 + i * 0.35);
        var rot = ringRotation * (i % 2 ? 1.3 : -1);
        var col = ['#48f','#4f8','#f48','#f4f','#4ff','#ff4','#f8f','#8f4','#88f','#f88','#8f8','#888'][i % 12];
        visualCtx.strokeStyle = col;
        visualCtx.globalAlpha = 0.3 - i * 0.025;
        visualCtx.lineWidth = 2;
        visualCtx.setLineDash([7 - i * 0.5, 5 + i * 0.5]);
        visualCtx.beginPath();
        visualCtx.ellipse(cx, cy, ringR, ringR * 0.28, rot, 0, Math.PI * 2);
        visualCtx.stroke();
    }
    visualCtx.setLineDash([]);
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

function drawUpgradeEffects() {
    if (!visualCtx) return;
    var upgrades = 0, clicks = 0, combo = 1;
    try { upgrades = (window.GAME ? Object.keys(window.GAME.upgrades || {}).length : 0) || 0; } catch(e) {}
    try { clicks = (window.GAME ? window.GAME.clicks : 0) || 0; } catch(e) {}
    try { combo = (window.GAME ? window.GAME.combo : 1) || 1; } catch(e) {}
    
    if (Math.random() < upgrades * 0.004) spawnFloating(upgrades);
    if (Math.random() < upgrades * 0.003 + clicks * 0.00001) spawnMeteor();
    if (Math.random() < upgrades * 0.0015) spawnSpiral();
    if (combo > 5 && Math.random() < combo * 0.001) spawnBubble();
    if (Math.random() < upgrades * 0.0008) spawnOrb();
}

function spawnFloating(upgrades) {
    ensureEffects();
    if (!effects.floating) return;
    var cx = w/2, cy = h/2;
    var angle = Math.random() * Math.PI * 2;
    effects.floating.push({
        x: cx + Math.cos(angle) * (220 + upgrades * 18),
        y: cy + Math.sin(angle) * (220 + upgrades * 18),
        speed: 1.5 + Math.random() * 2.5,
        drift: (Math.random() - 0.5) * 0.6,
        offset: Math.random() * Math.PI * 2,
        size: Math.random() * 5 + 1,
        alpha: 0.95,
        color: ['#8af','#f8a','#a8f','#fa8','#8fa','#8fa'][Math.floor(Math.random() * 6)],
        type: Math.random() > 0.4 ? 'glow' : 'dust'
    });
}

function spawnMeteor() {
    ensureEffects();
    if (!effects.meteors) return;
    effects.meteors.push({
        x: Math.random() * w, y: -35,
        vx: 4 + Math.random() * 5, vy: 3 + Math.random() * 4,
        size: Math.random() * 2.5 + 1, color: '#fff', life: 1, trail:[]
    });
}

function spawnSpiral() {
    ensureEffects();
    if (!effects.spirals) return;
    effects.spirals.push({
        x: w/2, y: h/2, radius: 40, grow: 4.5, spin: 0.09,
        life: 1, maxRadius: 180, arcs: 3, color: '#f80', angle: 0
    });
}

function spawnBubble() {
    ensureEffects();
    if (!effects.bubbles) return;
    effects.bubbles.push({
        x: Math.random() * w, y: h + 20,
        speed: 1 + Math.random() * 1.5, wobble: Math.random() * Math.PI * 2,
        size: Math.random() * 6 + 2, alpha: 0.8,
        color: ['#f88','#8f8','#88f','#f8f','#8ff'][Math.floor(Math.random() * 5)]
    });
}

function spawnOrb() {
    ensureEffects();
    if (!effects.orbs) return;
    effects.orbs.push({
        x: Math.random() * w, y: h + 15,
        speed: 1.5 + Math.random() * 2, life: 1,
        size: Math.random() * 8 + 3,
        color: ['#fe0','#e0f','#0fe'][Math.floor(Math.random() * 3)]
    });
}

function spawnSpecialEvent() {
    // Rare special events
    if (Math.random() < 0.001) {
        ensureEffects();
        var type = Math.random();
        if (type < 0.3) {
            // Eclipse
            effects.eclipse = {
                x: w/2, y: h * 0.3, size: 80,
                angle: 0, darkness: 1, color: '#222'
            };
        } else if (type < 0.6) {
            // Aurora
            effects.aurora = {
                x1: -50, x2: w + 50, y: h * 0.3,
                time: 0, color: ['#0f8','#80f','#08f'][Math.floor(Math.random() * 3)]
            };
        } else if (type < 0.85) {
            // Storm
            effects.storm = {
                x: w/2, y: h * 0.4, width: w * 0.6, height: h * 0.25,
                time: 0, flashes: Math.floor(Math.random() * 5) + 3,
                drops: Math.floor(Math.random() * 40) + 20
            };
        } else {
            // Supernova
            effects.supernova = {
                x: w * 0.8, y: h * 0.3, radius: 10,
                speed: 8, life: 1, flash: 1,
                color: ['#f80','#f08','#08f'][Math.floor(Math.random() * 3)]
            };
        }
    }
}

function addClickBurst(x, y, power, isCrit) {
    if (!visualCtx || !w || !h) return;
    ensureEffects();
    
    var cx = x || w/2, cy = y || h/2;
    var color = isCrit ? '#f60' : '#0af';
    var count = isCrit ? 35 : 18;
    
    if (effects.shockwaves) effects.shockwaves.push({
        x: cx, y: cy, radius: isCrit ? 180 : 90, alpha: 1, speed: isCrit ? 18 : 8, color: color, width: isCrit ? 12 : 5
    });
    
    if (effects.particles) for (var i = 0; i < count; i++) {
        var a = Math.random() * Math.PI * 2;
        var s = 28 + Math.random() * 75;
        effects.particles.push({
            x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
            size: isCrit ? 7 : 3,
            color: isCrit ? ['#f60','#f80','#fa0'][Math.floor(Math.random() * 3)] : ['#0cf','#0fc','#08f'][Math.floor(Math.random() * 3)]
        });
    }
    
    if (power > 40 && effects.spirals) effects.spirals.push({
        x: cx, y: cy, radius: 35, grow: 5, spin: 0.12, life: 1, maxRadius: 170 + power * 0.2,
        arcs: isCrit ? 4 : 2, color: color, angle: 0
    });
    
    if (isCrit && effects.blasts) effects.blasts.push({x: cx, y: cy, radius: 12, color: '#f80', life: 1});
}

function spawnObjects() {
    ensureEffects();
    // Random comet
    if (Math.random() < 0.22) {
        var start = Math.random() > 0.5;
        if (effects.comets) effects.comets.push({
            x: start ? -60 : w + 60, y: Math.random() * h * 0.7,
            angle: start ? 0.18 : 0.82, speed: 5 + Math.random() * 5,
            size: 2 + Math.random() * 3.5, brightness: 1, trail: [], maxTrail: 35
        });
    }
    // Random meteor
    if (Math.random() < 0.1) spawnMeteor();
    // Rare special events
    if (Math.random() < 0.0008) spawnSpecialEvent();
}

setInterval(function() { ensureEffects(); spawnObjects(); }, 500);

window.initVisuals = initVisuals;
window.addClickBurst = addClickBurst;
window.visualTime = visualTime;