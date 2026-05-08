// ========================
// ENHANCED EPIC VISUAL SYSTEM
// ========================
var visualCanvas, visualCtx;
var visualTime = 0;
var effects = null;
var bgObjects = [];

function ensureEffects() {
    if (!effects) {
        effects = { stars: [], asteroids: [], comets: [], particles: [], auras: [], shockwaves: [], blackholes: [], nebulas: [], rings: [], floating: [] };
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
        initStars();
        initNebulas();
        
        requestAnimationFrame(animateVisuals);
    } catch (e) { console.log('Visual init error:', e); }
}

function resizeCanvas() {
    if (visualCanvas) {
        visualCanvas.width = window.innerWidth || 1920;
        visualCanvas.height = window.innerHeight || 1080;
    }
}

function initStars() {
    if (!effects) return;
    effects.stars = [];
    for (var i = 0; i < 300; i++) {
        effects.stars.push({
            x: Math.random() * (visualCanvas?.width || 1920),
            y: Math.random() * (visualCanvas?.height || 1080),
            size: Math.random() * 2.5 + 0.3,
            brightness: Math.random(),
            twinkle: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.5 + 0.1,
            color: getStarColor(),
            size2: Math.random() > 0.9 ? Math.random() * 3 + 2 : 0
        });
    }
}

function getStarColor() {
    var colors = ['#ffffff', '#aaccff', '#ffaa88', '#88ffaa', '#ffaaff', '#ffffaa', '#aaffff'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function initNebulas() {
    if (!effects) return;
    effects.nebulas = [];
    for (var i = 0; i < 5; i++) {
        effects.nebulas.push({
            x: Math.random() * (visualCanvas?.width || 1920),
            y: Math.random() * (visualCanvas?.height || 1080),
            size: Math.random() * 200 + 100,
            color: getNebulaColor(),
            alpha: Math.random() * 0.15 + 0.05,
            speed: (Math.random() - 0.5) * 0.3,
            angle: Math.random() * Math.PI * 2
        });
    }
}

function getNebulaColor() {
    var colors = ['#4400aa', '#0044aa', '#aa4400', '#44aa00', '#aa00aa', '#4444aa'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function animateVisuals() {
    if (!visualCtx || !visualCanvas) {
        requestAnimationFrame(animateVisuals);
        return;
    }
    
    visualTime += 0.016;
    ensureEffects();
    
    drawBackground();
    drawNebulas();
    drawStars();
    drawFloatingObjects();
    drawComets();
    drawParticles();
    drawAuras();
    drawShockwaves();
    drawEpicPlanet();
    drawUpgradeVisuals();
    
    requestAnimationFrame(animateVisuals);
}

function drawBackground() {
    if (!visualCtx || !visualCanvas) return;
    var gradient = visualCtx.createRadialGradient(visualCanvas.width / 2, visualCanvas.height / 2, 0, visualCanvas.width / 2, visualCanvas.height / 2, visualCanvas.width);
    gradient.addColorStop(0, '#0a0a20');
    gradient.addColorStop(0.5, '#050515');
    gradient.addColorStop(1, '#020208');
    visualCtx.fillStyle = gradient;
    visualCtx.fillRect(0, 0, visualCanvas.width, visualCanvas.height);
}

function drawNebulas() {
    if (!effects || !effects.nebulas || !visualCtx) return;
    
    for (var i = 0; i < effects.nebulas.length; i++) {
        var nebula = effects.nebulas[i];
        if (!nebula) continue;
        
        nebula.x += nebula.speed;
        if (nebula.x < -nebula.size) nebula.x = (visualCanvas?.width || 1920) + nebula.size;
        if (nebula.x > (visualCanvas?.width || 1920) + nebula.size) nebula.x = -nebula.size;
        
        var gradient = visualCtx.createRadialGradient(nebula.x, nebula.y, 0, nebula.x, nebula.y, nebula.size);
        gradient.addColorStop(0, nebula.color + Math.floor((nebula.alpha || 0.1) * 255).toString(16));
        gradient.addColorStop(1, 'transparent');
        visualCtx.fillStyle = gradient;
        visualCtx.globalAlpha = nebula.alpha || 0.1;
        visualCtx.fillRect(0, 0, visualCanvas.width, visualCanvas.height);
    }
    visualCtx.globalAlpha = 1;
}

function drawStars() {
    if (!effects || !effects.stars || !visualCtx) return;
    
    for (var i = 0; i < effects.stars.length; i++) {
        var star = effects.stars[i];
        if (!star) continue;
        
        star.twinkle += star.speed;
        
        var twinkleBright = star.brightness * (0.4 + Math.sin(star.twinkle) * 0.4 + 0.2);
        
        visualCtx.fillStyle = star.color;
        visualCtx.globalAlpha = twinkleBright;
        visualCtx.beginPath();
        visualCtx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        visualCtx.fill();
        
        // Glow for big stars
        if (star.size2 > 0) {
            visualCtx.globalAlpha = twinkleBright * 0.3;
            visualCtx.beginPath();
            visualCtx.arc(star.x, star.y, star.size2, 0, Math.PI * 2);
            visualCtx.fill();
        }
    }
    visualCtx.globalAlpha = 1;
}

function drawFloatingObjects() {
    if (!effects || !visualCtx || !visualCanvas) return;
    
    // Get game stats for spawning
    var clickPower = 0;
    try { clickPower = getClickPower(); } catch(e) {}
    var cps = 0;
    try { cps = getCps(); } catch(e) {}
    var upgrades = 0;
    try { upgrades = window.GAME ? Object.keys(window.GAME.upgrades || {}).length : 0; } catch(e) {}
    
    // Spawn floating particles based on upgrades
    if (Math.random() < upgrades * 0.001 && effects.floating.length < upgrades * 2) {
        effects.floating.push({
            x: Math.random() * visualCanvas.width,
            y: visualCanvas.height + 20,
            targetY: Math.random() * visualCanvas.height * 0.7,
            size: Math.random() * 4 + 2,
            speed: Math.random() * 2 + 1,
            color: getFloatingColor(),
            alpha: 1,
            type: Math.random() > 0.5 ? 'dust' : 'sparkle'
        });
    }
    
    // Update and draw
    for (var i = effects.floating.length - 1; i >= 0; i--) {
        var obj = effects.floating[i];
        if (!obj) continue;
        
        obj.y -= obj.speed;
        obj.alpha -= 0.002;
        
        if (obj.alpha <= 0 || obj.y < 0) {
            effects.floating.splice(i, 1);
            continue;
        }
        
        visualCtx.fillStyle = obj.color;
        visualCtx.globalAlpha = obj.alpha;
        visualCtx.beginPath();
        visualCtx.arc(obj.x, obj.y, obj.size, 0, Math.PI * 2);
        visualCtx.fill();
        
        if (obj.type === 'sparkle') {
            visualCtx.globalAlpha = obj.alpha * 0.5;
            visualCtx.beginPath();
            visualCtx.arc(obj.x, obj.y, obj.size * 2, 0, Math.PI * 2);
            visualCtx.fill();
        }
    }
    visualCtx.globalAlpha = 1;
}

function getFloatingColor() {
    var colors = ['#88aaff', '#ffaa88', '#88ffaa', '#ff88ff', '#ffff88'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function drawComets() {
    if (!effects || !effects.comets || !visualCtx || !visualCanvas) return;
    
    var w = visualCanvas.width;
    var h = visualCanvas.height;
    
    for (var i = effects.comets.length - 1; i >= 0; i--) {
        var comet = effects.comets[i];
        if (!comet) continue;
        
        if (!comet.trail) comet.trail = [];
        
        if (comet.angle !== undefined && comet.speed !== undefined) {
            comet.x += Math.cos(comet.angle) * comet.speed;
            comet.y += Math.sin(comet.angle) * comet.speed;
        }
        
        if (comet.x !== undefined && comet.y !== undefined) {
            comet.trail.push({ x: comet.x, y: comet.y, brightness: comet.brightness || 1 });
            if (comet.trail.length > 25) comet.trail.shift();
        }
        
        if (comet.x < -150 || comet.x > w + 150 || comet.y < -150 || comet.y > h + 150) {
            effects.comets.splice(i, 1);
            continue;
        }
        
        for (var j = 0; j < comet.trail.length; j++) {
            var p = comet.trail[j];
            if (!p) continue;
            var alpha = (j / comet.trail.length) * (p.brightness || 1) * 0.7;
            visualCtx.fillStyle = '#aaddff';
            visualCtx.globalAlpha = alpha;
            var size = (j / comet.trail.length) * (comet.size || 2);
            visualCtx.beginPath();
            visualCtx.arc(p.x, p.y, size, 0, Math.PI * 2);
            visualCtx.fill();
        }
        
        visualCtx.fillStyle = '#ffffff';
        visualCtx.globalAlpha = (comet.brightness || 1);
        visualCtx.beginPath();
        visualCtx.arc(comet.x, comet.y, (comet.size || 2) * 1.5, 0, Math.PI * 2);
        visualCtx.fill();
        
        visualCtx.globalAlpha = (comet.brightness || 1) * 0.3;
        visualCtx.beginPath();
        visualCtx.arc(comet.x, comet.y, (comet.size || 2) * 3, 0, Math.PI * 2);
        visualCtx.fill();
    }
    visualCtx.globalAlpha = 1;
}

function drawParticles() {
    if (!effects || !effects.particles || !visualCtx) return;
    
    for (var i = effects.particles.length - 1; i >= 0; i--) {
        var p = effects.particles[i];
        if (!p) continue;
        
        if (p.vx !== undefined) p.x += p.vx;
        if (p.vy !== undefined) p.y += p.vy;
        
        if (!visualCanvas) continue;
        if (!p.x || !p.y || p.x < -50 || p.x > visualCanvas.width + 50 || p.y < -50 || p.y > visualCanvas.height + 50) {
            effects.particles.splice(i, 1);
            continue;
        }
        
        visualCtx.fillStyle = p.color || '#ffffff';
        visualCtx.globalAlpha = 0.9;
        visualCtx.beginPath();
        visualCtx.arc(p.x, p.y, p.size || 3, 0, Math.PI * 2);
        visualCtx.fill();
    }
    visualCtx.globalAlpha = 1;
}

function drawAuras() {
    ensureEffects();
    if (!visualCtx || !visualCanvas) return;
    
    var cx = visualCanvas.width / 2;
    var cy = visualCanvas.height / 2;
    
    var power = 0;
    try { if (typeof getClickPower === 'function') power = getClickPower(); } catch(e) {}
    
    if (power > 10 && effects.auras) {
        effects.auras.push({
            x: cx, y: cy,
            radius: 200,
            maxRadius: 300 + power * 0.5,
            alpha: 0.4,
            speed: power > 100 ? 3 : 1,
            color: getAuraColor(power),
            type: power > 100 ? 'super' : 'normal'
        });
    }
    
    if (!effects.auras) return;
    
    for (var i = effects.auras.length - 1; i >= 0; i--) {
        var aura = effects.auras[i];
        if (!aura) continue;
        
        aura.radius += aura.speed || 1;
        aura.alpha -= 0.008;
        
        if (aura.alpha <= 0 || aura.radius > (aura.maxRadius || 300)) {
            effects.auras.splice(i, 1);
            continue;
        }
        
        var gradient = visualCtx.createRadialGradient(aura.x || cx, aura.y || cy, 0, aura.x || cx, aura.y || cy, aura.radius || 200);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0.6, aura.color || '#00aaff');
        gradient.addColorStop(1, 'transparent');
        
        visualCtx.fillStyle = gradient;
        visualCtx.globalAlpha = aura.alpha || 0.3;
        visualCtx.beginPath();
        visualCtx.arc(aura.x || cx, aura.y || cy, aura.radius || 200, 0, Math.PI * 2);
        visualCtx.fill();
        
        if (aura.type === 'super') {
            visualCtx.strokeStyle = aura.color || '#ff8800';
            visualCtx.lineWidth = 2;
            visualCtx.globalAlpha = aura.alpha * 0.5;
            visualCtx.beginPath();
            visualCtx.arc(aura.x || cx, aura.y || cy, aura.radius * 0.7, 0, Math.PI * 2);
            visualCtx.stroke();
        }
    }
    visualCtx.globalAlpha = 1;
}

function getAuraColor(power) {
    if (power > 1000) return '#ff44ff';
    if (power > 500) return '#ff8800';
    if (power > 100) return '#44aaff';
    return '#00aaff';
}

function drawShockwaves() {
    if (!effects || !effects.shockwaves || !visualCtx) return;
    
    for (var i = effects.shockwaves.length - 1; i >= 0; i--) {
        var sw = effects.shockwaves[i];
        if (!sw) continue;
        
        sw.radius += sw.speed || 5;
        sw.alpha -= 0.025;
        
        if (sw.alpha <= 0) {
            effects.shockwaves.splice(i, 1);
            continue;
        }
        
        visualCtx.strokeStyle = sw.color || '#00aaff';
        visualCtx.globalAlpha = sw.alpha || 1;
        visualCtx.lineWidth = sw.width || 3;
        visualCtx.beginPath();
        visualCtx.arc(sw.x || 0, sw.y || 0, sw.radius || 80, 0, Math.PI * 2);
        visualCtx.stroke();
        
        if (sw.width > 4) {
            visualCtx.lineWidth = 1;
            visualCtx.beginPath();
            visualCtx.arc(sw.x || 0, sw.y || 0, sw.radius * 0.7, 0, Math.PI * 2);
            visualCtx.stroke();
        }
    }
    visualCtx.globalAlpha = 1;
}

var planetRotation = 0;
var planetPulse = 0;
var ringRotation = 0;

function drawEpicPlanet() {
    if (!visualCtx || !visualCanvas) return;
    
    var cx = visualCanvas.width / 2;
    var cy = visualCanvas.height / 2;
    var baseR = 80;
    
    planetRotation += 0.008;
    planetPulse += 0.02;
    ringRotation += 0.005;
    
    var energy = 0;
    try { energy = window.GAME ? window.GAME.energy : 0; } catch(e) {}
    
    var upgrades = 0;
    try { upgrades = window.GAME ? Object.keys(window.GAME.upgrades || {}).length : 0; } catch(e) {}
    
    var planetScale = 1 + Math.log(Math.max(1, energy + 1)) / 20;
    var planetR = baseR * Math.min(2.5, planetScale);
    
    var zone = 'v';
    try { zone = window.GAME ? window.GAME.currentZone : 'v'; } catch(e) {}
    
    var colors = getZoneColors(zone);
    var glowColors = getGlowColors(zone);
    
    // Outer energy field based on upgrades
    if (upgrades > 5) {
        drawEnergyRings(cx, cy, planetR, upgrades);
    }
    
    // Corona glow
    var glowR = planetR * (1.8 + Math.sin(planetPulse) * 0.1);
    var glow = visualCtx.createRadialGradient(cx, cy, planetR * 0.5, cx, cy, glowR);
    glow.addColorStop(0, glowColors.inner);
    glow.addColorStop(0.5, glowColors.mid + '66');
    glow.addColorStop(1, 'transparent');
    visualCtx.fillStyle = glow;
    visualCtx.globalAlpha = 0.6;
    visualCtx.fillRect(cx - glowR - 30, cy - glowR - 30, (glowR + 30) * 2, (glowR + 30) * 2);
    visualCtx.globalAlpha = 1;
    
    // Corona arcs
    for (var i = 0; i < 4 + Math.floor(upgrades / 10); i++) {
        var angle = planetRotation * (i % 2 === 0 ? 1.5 : -1.5) + (Math.PI * 2 / 4) * i;
        var arcR = planetR * (1.3 + Math.sin(planetPulse + i) * 0.15);
        var arcWidth = 2 + (i % 2) * 2;
        
        visualCtx.strokeStyle = i % 2 === 0 ? '#88ccff' : colors.accent;
        visualCtx.globalAlpha = 0.4 - i * 0.08;
        visualCtx.lineWidth = arcWidth;
        visualCtx.beginPath();
        visualCtx.arc(cx, cy, arcR, angle - 0.4, angle + 0.4);
        visualCtx.stroke();
    }
    
    // Main planet body with layers
    var bodyGrad = visualCtx.createRadialGradient(cx - planetR * 0.35, cy - planetR * 0.35, 0, cx, cy, planetR);
    bodyGrad.addColorStop(0, colors.highlight);
    bodyGrad.addColorStop(0.3, colors.core);
    bodyGrad.addColorStop(0.7, colors.surface);
    bodyGrad.addColorStop(1, colors.mantle);
    visualCtx.fillStyle = bodyGrad;
    visualCtx.beginPath();
    visualCtx.arc(cx, cy, planetR, 0, Math.PI * 2);
    visualCtx.fill();
    
    // Surface details
    drawPlanetSurface(cx, cy, planetR, planetRotation);
    
    // Inner highlight
    visualCtx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    visualCtx.beginPath();
    visualCtx.arc(cx - planetR * 0.35, cy - planetR * 0.35, planetR * 0.35, 0, Math.PI * 2);
    visualCtx.fill();
    
    visualCtx.globalAlpha = 1;
}

function drawEnergyRings(cx, cy, r, upgrades) {
    var numRings = Math.min(8, Math.floor(upgrades / 5));
    for (var i = 0; i < numRings; i++) {
        var ringR = r * (1.5 + i * 0.25);
        var rotation = ringRotation * (i % 2 === 0 ? 1 : -1) + i;
        
        visualCtx.strokeStyle = '#' + (['4488ff', '44ff88', 'ff8844', 'ff44ff', '88ffff'][i % 5]);
        visualCtx.globalAlpha = 0.2 - i * 0.02;
        visualCtx.lineWidth = 2;
        visualCtx.setLineDash([10 - i, 5 + i]);
        visualCtx.beginPath();
        visualCtx.ellipse(cx, cy, ringR, ringR * 0.3, rotation, 0, Math.PI * 2);
        visualCtx.stroke();
    }
    visualCtx.setLineDash([]);
    visualCtx.globalAlpha = 1;
}

function drawPlanetSurface(cx, cy, r, rotation) {
    // Rotating bands
    for (var i = 0; i < 3; i++) {
        var bandY = cy + Math.sin(rotation * 2 + i * 2) * r * 0.4;
        visualCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        visualCtx.lineWidth = 1;
        visualCtx.beginPath();
        visualCtx.moveTo(cx - r * 0.8, bandY);
        visualCtx.bezierCurveTo(cx - r * 0.4, bandY + 5, cx + r * 0.4, bandY - 5, cx + r * 0.8, bandY);
        visualCtx.stroke();
    }
}

function getZoneColors(zone) {
    var colors = {
        v: { core: '#6688aa', mantle: '#446688', surface: '#557799', highlight: '#99aadd', accent: '#88aacc' },
        q: { core: '#aa66ff', mantle: '#8844dd', surface: '#9966ee', highlight: '#cc88ff', accent: '#ddaaff' },
        t: { core: '#ffaa44', mantle: '#dd8822', surface: '#ee9944', highlight: '#ffcc66', accent: '#ffbb66' },
        m: { core: '#66aaff', mantle: '#4488dd', surface: '#5599ee', highlight: '#88bbff', accent: '#99ccff' },
        l: { core: '#ffff66', mantle: '#dddd44', surface: '#eeee55', highlight: '#ffff88', accent: '#ffff99' },
        d: { core: '#aa44aa', mantle: '#882288', surface: '#994499', highlight: '#cc66cc', accent: '#dd77dd' },
        e: { core: '#ffffff', mantle: '#cccccc', surface: '#dddddd', highlight: '#ffffff', accent: '#eeeeee' },
        inf: { core: '#ff44ff', mantle: '#cc22cc', surface: '#ee33ee', highlight: '#ff77ff', accent: '#ff88ff' }
    };
    return colors[zone] || colors.v;
}

function getGlowColors(zone) {
    var colors = {
        v: { inner: '#88aacc', mid: '#4488aa' },
        q: { inner: '#cc88ff', mid: '#8844dd' },
        t: { inner: '#ffcc66', mid: '#cc8822' },
        m: { inner: '#88bbff', mid: '#4488dd' },
        l: { inner: '#ffff88', mid: '#dddd44' },
        d: { inner: '#cc66cc', mid: '#882288' },
        e: { inner: '#ffffff', mid: '#aaaaaa' },
        inf: { inner: '#ff77ff', mid: '#cc22cc' }
    };
    return colors[zone] || colors.v;
}

function drawUpgradeVisuals() {
    if (!visualCtx || !visualCanvas) return;
    
    var upgrades = 0;
    var energy = 0;
    try {
        upgrades = window.GAME ? Object.keys(window.GAME.upgrades || {}).length : 0;
        energy = window.GAME ? window.GAME.energy : 0;
    } catch(e) {}
    
    // Add particles based on upgrades
    if (Math.random() < upgrades * 0.002) {
        spawnUpgradeParticle(upgrades);
    }
    
    // Shooting stars more often with upgrades
    if (Math.random() < upgrades * 0.001 + energy * 0.00001) {
        spawnShootingStar();
    }
}

function spawnUpgradeParticle(upgrades) {
    ensureEffects();
    if (!effects || !visualCanvas) return;
    
    var cx = visualCanvas.width / 2;
    var cy = visualCanvas.height / 2;
    var angle = Math.random() * Math.PI * 2;
    var dist = 150 + upgrades * 10;
    
    if (effects.particles) {
        effects.particles.push({
            x: cx + Math.cos(angle) * dist,
            y: cy + Math.sin(angle) * dist,
            vx: (Math.random() - 0.5) * 2,
            vy: Math.random() * -2 - 1,
            size: Math.random() * 3 + 1,
            color: '#ffffff',
            life: 1
        });
    }
}

function spawnShootingStar() {
    ensureEffects();
    if (!effects || !visualCanvas) return;
    
    var w = visualCanvas.width;
    var h = visualCanvas.height;
    
    if (effects.particles) {
        effects.particles.push({
            x: Math.random() * w,
            y: Math.random() * h * 0.4,
            vx: 15 + Math.random() * 10,
            vy: 5 + Math.random() * 3,
            size: Math.random() * 2 + 1,
            color: '#ffffff'
        });
    }
}

function spawnComet() {
    ensureEffects();
    if (!effects || !visualCanvas) return;
    
    var w = visualCanvas.width;
    var h = visualCanvas.height;
    var startSide = Math.random() > 0.5;
    
    if (effects.comets) {
        effects.comets.push({
            x: startSide ? -80 : w + 80,
            y: Math.random() * h * 0.8,
            angle: startSide ? Math.PI * 0.15 : Math.PI * 0.85,
            speed: Math.random() * 5 + 3,
            size: Math.random() * 3 + 2,
            brightness: 1,
            trail: []
        });
    }
}

function addClickBurst(x, y, power, isCrit) {
    if (!visualCtx || !visualCanvas) return;
    
    ensureEffects();
    
    var w = visualCanvas.width;
    var h = visualCanvas.height;
    var cx = x || w / 2;
    var cy = y || h / 2;
    var color = isCrit ? '#ff6600' : '#00aaff';
    var size = isCrit ? 25 : 12;
    
    if (effects.shockwaves) {
        effects.shockwaves.push({
            x: cx, y: cy,
            radius: isCrit ? 120 : 80,
            alpha: 1,
            speed: isCrit ? 12 : 6,
            color: color,
            width: isCrit ? 8 : 4
        });
    }
    
    var numParticles = isCrit ? 25 : 12;
    for (var i = 0; i < numParticles; i++) {
        if (!effects.particles) break;
        var angle = Math.random() * Math.PI * 2;
        var spd = 30 + Math.random() * 80;
        var col = isCrit ? (['#ff6600', '#ff8800', '#ffaa00'][Math.floor(Math.random() * 3)]) : (['#00ccff', '#00ffcc', '#00aaff'][Math.floor(Math.random() * 3)]);
        effects.particles.push({
            x: cx, y: cy,
            vx: Math.cos(angle) * spd,
            vy: Math.sin(angle) * spd,
            size: isCrit ? 6 : 3,
            color: col
        });
    }
    
    // Extra burst for big clicks
    if (power > 100) {
        for (var j = 0; j < 10; j++) {
            if (!effects.particles) break;
            var a = Math.random() * Math.PI * 2;
            var s = 20 + Math.random() * 40;
            effects.particles.push({
                x: cx, y: cy,
                vx: Math.cos(a) * s,
                vy: Math.sin(a) * s,
                size: 2,
                color: '#ffff00'
            });
        }
    }
}

setInterval(function() {
    ensureEffects();
    if (Math.random() < 0.3) spawnComet();
    if (Math.random() < 0.1) spawnShootingStar();
}, 800);

window.initVisuals = initVisuals;
window.addClickBurst = addClickBurst;
window.visualTime = visualTime;