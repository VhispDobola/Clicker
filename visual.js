// ========================
// EPIC VISUAL SYSTEM  
// ========================
var visualCanvas, visualCtx;
var visualTime = 0;
var effects = null;

function ensureEffects() {
    if (!effects) {
        effects = { stars: [], asteroids: [], comets: [], particles: [], auras: [], shockwaves: [], blackholes: [] };
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
            document.body.appendChild(visualCanvas);
        }
        visualCtx = visualCanvas.getContext('2d');
        
        var w = window.innerWidth || 1920;
        var h = window.innerHeight || 1080;
        visualCanvas.width = w;
        visualCanvas.height = h;
        
        ensureEffects();
        
        for (var i = 0; i < 200; i++) {
            effects.stars.push({
                x: Math.random() * w,
                y: Math.random() * h,
                size: Math.random() * 2 + 0.5,
                brightness: Math.random(),
                twinkle: Math.random() * Math.PI * 2,
                color: '#ffffff'
            });
        }
        
        requestAnimationFrame(animateVisuals);
    } catch (e) {
        console.log('Visual init error:', e);
    }
}

function animateVisuals() {
    if (!visualCtx || !visualCanvas) {
        requestAnimationFrame(animateVisuals);
        return;
    }
    
    visualTime += 0.016;
    ensureEffects();
    
    // Clear
    visualCtx.fillStyle = '#050510';
    visualCtx.fillRect(0, 0, visualCanvas.width, visualCanvas.height);
    
    drawBackground();
    drawStars();
    drawComets();
    drawParticles();
    drawAuras();
    drawShockwaves();
    drawEpicPlanet();
    
    requestAnimationFrame(animateVisuals);
}

function drawBackground() {
    if (!visualCtx || !visualCanvas) return;
    var gradient = visualCtx.createRadialGradient(visualCanvas.width / 2, visualCanvas.height / 2, 0, visualCanvas.width / 2, visualCanvas.height / 2, visualCanvas.width);
    gradient.addColorStop(0, '#0a0a20');
    gradient.addColorStop(1, '#020205');
    visualCtx.fillStyle = gradient;
    visualCtx.fillRect(0, 0, visualCanvas.width, visualCanvas.height);
}

function drawStars() {
    if (!effects || !effects.stars || !visualCtx) return;
    
    for (var i = 0; i < effects.stars.length; i++) {
        var star = effects.stars[i];
        if (!star) continue;
        
        star.twinkle += 0.05;
        var twinkleBright = star.brightness * (0.5 + Math.sin(star.twinkle) * 0.5);
        
        visualCtx.fillStyle = star.color;
        visualCtx.globalAlpha = twinkleBright;
        visualCtx.beginPath();
        visualCtx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        visualCtx.fill();
    }
    visualCtx.globalAlpha = 1;
}

function drawComets() {
    if (!effects || !effects.comets || !visualCtx || !visualCanvas) return;
    
    var w = visualCanvas.width;
    var h = visualCanvas.height;
    
    for (var i = effects.comets.length - 1; i >= 0; i--) {
        var comet = effects.comets[i];
        if (!comet) continue;
        
        if (!comet.trail) comet.trail = [];
        
        // Update position
        if (comet.angle !== undefined && comet.speed !== undefined) {
            comet.x += Math.cos(comet.angle) * comet.speed;
            comet.y += Math.sin(comet.angle) * comet.speed;
        }
        
        // Add trail
        if (comet.x !== undefined && comet.y !== undefined) {
            comet.trail.push({ x: comet.x, y: comet.y, brightness: comet.brightness || 1 });
            if (comet.trail.length > 30) comet.trail.shift();
        }
        
        // Remove if off screen
        if (comet.x < -100 || comet.x > w + 100 || comet.y < -100 || comet.y > h + 100) {
            effects.comets.splice(i, 1);
            continue;
        }
        
        // Draw trail
        for (var j = 0; j < comet.trail.length; j++) {
            var p = comet.trail[j];
            if (!p) continue;
            var alpha = (j / comet.trail.length) * (p.brightness || 1) * 0.8;
            visualCtx.fillStyle = '#aaddff';
            visualCtx.globalAlpha = alpha;
            visualCtx.beginPath();
            var size = (j / comet.trail.length) * (comet.size || 2);
            visualCtx.arc(p.x, p.y, size, 0, Math.PI * 2);
            visualCtx.fill();
        }
        
        // Draw head
        visualCtx.fillStyle = '#ffffff';
        visualCtx.globalAlpha = (comet.brightness || 1);
        visualCtx.beginPath();
        visualCtx.arc(comet.x, comet.y, (comet.size || 2) * 1.5, 0, Math.PI * 2);
        visualCtx.fill();
    }
    visualCtx.globalAlpha = 1;
}

function drawParticles() {
    if (!effects || !effects.particles || !visualCtx) return;
    
    for (var i = effects.particles.length - 1; i >= 0; i--) {
        var p = effects.particles[i];
        if (!p) continue;
        
        // Update position
        if (p.vx !== undefined) p.x += p.vx;
        if (p.vy !== undefined) p.y += p.vy;
        
        // Remove if off screen
        if (!visualCanvas) continue;
        if (!p.x || !p.y || p.x < 0 || p.x > visualCanvas.width || p.y < 0 || p.y > visualCanvas.height) {
            effects.particles.splice(i, 1);
            continue;
        }
        
        visualCtx.fillStyle = p.color || '#ffffff';
        visualCtx.globalAlpha = 0.8;
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
    
    // Try to get click power
    var power = 0;
    try { if (typeof getClickPower === 'function') power = getClickPower(); } catch(e) {}
    
    if (power > 10 && effects.auras) {
        effects.auras.push({
            x: cx, y: cy,
            radius: 150,
            maxRadius: 250,
            alpha: 0.3,
            speed: 0.5,
            color: '#00aaff'
        });
    }
    
    if (!effects.auras) return;
    
    for (var i = effects.auras.length - 1; i >= 0; i--) {
        var aura = effects.auras[i];
        if (!aura) continue;
        
        aura.radius += aura.speed || 0.5;
        aura.alpha -= 0.005;
        
        if (aura.alpha <= 0 || aura.radius > (aura.maxRadius || 250)) {
            effects.auras.splice(i, 1);
            continue;
        }
        
        var gradient = visualCtx.createRadialGradient(aura.x || cx, aura.y || cy, (aura.radius || 150) * 0.5, aura.x || cx, aura.y || cy, aura.radius || 150);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0.7, aura.color || '#00aaff');
        gradient.addColorStop(1, 'transparent');
        
        visualCtx.fillStyle = gradient;
        visualCtx.globalAlpha = aura.alpha || 0.3;
        visualCtx.beginPath();
        visualCtx.arc(aura.x || cx, aura.y || cy, aura.radius || 150, 0, Math.PI * 2);
        visualCtx.fill();
    }
    visualCtx.globalAlpha = 1;
}

function drawShockwaves() {
    if (!effects || !effects.shockwaves || !visualCtx) return;
    
    for (var i = effects.shockwaves.length - 1; i >= 0; i--) {
        var sw = effects.shockwaves[i];
        if (!sw) continue;
        
        sw.radius += sw.speed || 5;
        sw.alpha -= 0.02;
        
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
    }
    visualCtx.globalAlpha = 1;
}

var planetRotation = 0;
var planetPulse = 0;

function drawEpicPlanet() {
    if (!visualCtx || !visualCanvas) return;
    
    var cx = visualCanvas.width / 2;
    var cy = visualCanvas.height / 2;
    var baseR = 80;
    
    planetRotation += 0.01;
    planetPulse += 0.032;
    
    // Get energy safely
    var energy = 0;
    try { energy = window.GAME ? window.GAME.energy : 0; } catch(e) {}
    
    var planetR = baseR * (1 + Math.log(Math.max(1, energy + 1)) / 10);
    
    // Get zone
    var zone = 'v';
    try { zone = window.GAME ? window.GAME.currentZone : 'v'; } catch(e) {}
    
    var colors = getPlanetColors(zone);
    
    // Outer glow
    var glowR = planetR * 1.5;
    var glow = visualCtx.createRadialGradient(cx, cy, planetR * 0.8, cx, cy, glowR);
    glow.addColorStop(0, colors.core);
    glow.addColorStop(0.5, colors.mantle + '44');
    glow.addColorStop(1, 'transparent');
    visualCtx.fillStyle = glow;
    visualCtx.fillRect(cx - glowR - 20, cy - glowR - 20, (glowR + 20) * 2, (glowR + 20) * 2);
    
    // Corona arcs
    for (var i = 0; i < 3; i++) {
        var angle = planetRotation * 2 + (Math.PI * 2 / 3) * i;
        var arcR = planetR * (1.2 + Math.sin(planetPulse + i) * 0.1);
        
        visualCtx.strokeStyle = '#88ccff';
        visualCtx.globalAlpha = 0.3;
        visualCtx.lineWidth = 3;
        visualCtx.beginPath();
        visualCtx.arc(cx, cy, arcR, angle - 0.3, angle + 0.3);
        visualCtx.stroke();
    }
    
    // Main planet body
    var bodyGrad = visualCtx.createRadialGradient(cx - planetR * 0.3, cy - planetR * 0.3, 0, cx, cy, planetR);
    bodyGrad.addColorStop(0, colors.core);
    bodyGrad.addColorStop(0.7, colors.surface);
    bodyGrad.addColorStop(1, colors.mantle);
    visualCtx.fillStyle = bodyGrad;
    visualCtx.beginPath();
    visualCtx.arc(cx, cy, planetR, 0, Math.PI * 2);
    visualCtx.fill();
    
    // Highlight
    visualCtx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    visualCtx.beginPath();
    visualCtx.arc(cx - planetR * 0.3, cy - planetR * 0.3, planetR * 0.4, 0, Math.PI * 2);
    visualCtx.fill();
    
    visualCtx.globalAlpha = 1;
}

function getPlanetColors(zone) {
    var colors = {
        v: { core: '#6688aa', mantle: '#446688', surface: '#557799', accent: '#88aacc' },
        q: { core: '#aa66ff', mantle: '#8844dd', surface: '#9966ee', accent: '#cc88ff' },
        t: { core: '#ffaa44', mantle: '#dd8822', surface: '#ee9944', accent: '#ffbb66' },
        m: { core: '#66aaff', mantle: '#4488dd', surface: '#5599ee', accent: '#88bbff' },
        l: { core: '#ffff66', mantle: '#dddd44', surface: '#eeee55', accent: '#ffff88' },
        d: { core: '#aa44aa', mantle: '#882288', surface: '#994499', accent: '#cc66cc' },
        e: { core: '#ffffff', mantle: '#cccccc', surface: '#dddddd', accent: '#ffffff' },
        inf: { core: '#ff44ff', mantle: '#cc22cc', surface: '#ee33ee', accent: '#ff66ff' }
    };
    return colors[zone] || colors.v;
}

function spawnComet() {
    if (!effects) ensureEffects();
    if (!effects.comets) return;
    
    var w = visualCanvas ? visualCanvas.width : 1920;
    var startSide = Math.random() > 0.5;
    
    effects.comets.push({
        x: startSide ? -100 : w + 100,
        y: Math.random() * 1080,
        angle: startSide ? Math.PI * 0.1 : Math.PI * 0.9,
        speed: Math.random() * 4 + 3,
        size: Math.random() * 3 + 2,
        brightness: 1,
        trail: []
    });
}

function addClickBurst(x, y, power, isCrit) {
    if (!visualCtx || !visualCanvas) return;
    
    ensureEffects();
    
    var w = visualCanvas.width;
    var h = visualCanvas.height;
    var cx = x || w / 2;
    var cy = y || h / 2;
    var color = isCrit ? '#ff6600' : '#00aaff';
    var size = isCrit ? 20 : 10;
    
    // Add shockwave
    if (effects.shockwaves) {
        effects.shockwaves.push({
            x: cx, y: cy,
            radius: 80,
            alpha: 1,
            speed: isCrit ? 8 : 5,
            color: color,
            width: isCrit ? 6 : 3
        });
    }
    
    // Add particles
    var numParticles = isCrit ? 20 : 10;
    for (var i = 0; i < numParticles; i++) {
        if (!effects.particles) break;
        var angle = Math.random() * Math.PI * 2;
        var spd = 50 + Math.random() * 100;
        effects.particles.push({
            x: cx, y: cy,
            vx: Math.cos(angle) * spd,
            vy: Math.sin(angle) * spd,
            size: isCrit ? 5 : 3,
            color: isCrit ? '#ff6600' : '#00ccff'
        });
    }
}

function spawnBackgroundObjects() {
    ensureEffects();
    
    // Comets
    if (Math.random() < 0.002) {
        spawnComet();
    }
}

// Start comet spawning
setInterval(spawnBackgroundObjects, 1000);

// Make global
window.initVisuals = initVisuals;
window.addClickBurst = addClickBurst;
window.visualTime = visualTime;