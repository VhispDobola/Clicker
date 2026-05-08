// ========================
// VISUAL SYSTEM - COSMIC SPACE THEME
// ========================
var visualCanvas, visualCtx, w, h;
var stars = [], nebulas = [], comets = [], meteors = [], floatingParticles = [], portalParticles = [], orbitRings = [], edgePortals = [];
var portalParticles = [], orbitRings = [], edgePortals = [];
var planetRotation = 0, planetPulse = 0;

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
    var clickL = up.click || 0;
    var genL = up.gen || 0;
    var critL = up.crit || 0;
    var comboL = up.combo || 0;
    var bossL = up.boss || 0;
    var spaceL = up.space || 0;
    var specialL = up.special || 0;
    var totalL = up.total || 0;
    
    // BACKGROUND - changes with generator upgrades
    var bgHue = (genL * 7) % 360;
    var bgSat = Math.min(35, genL * 1.5);
    var bgLight = 6 + Math.min(8, genL * 0.4);
    
    var bgGrad = visualCtx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h));
    bgGrad.addColorStop(0, 'hsl(' + bgHue + ',' + bgSat + '%,' + bgLight + '%)');
    bgGrad.addColorStop(1, '#010105');
    visualCtx.fillStyle = bgGrad;
    visualCtx.fillRect(0, 0, w, h);
    
    // STARS - colorful with click upgrades
    for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        s.twinkle += s.z * 0.08;
        var b = s.brightness * (0.6 + Math.sin(s.twinkle) * 0.3);
        
        if (clickL > 5) {
            var hue = (s.x / w) * 50 + clickL * 4;
            visualCtx.fillStyle = 'hsl(' + hue + ',75%,' + (65 + s.brightness * 35) + '%)';
        } else {
            visualCtx.fillStyle = s.color;
        }
        
        visualCtx.globalAlpha = b;
        visualCtx.beginPath();
        visualCtx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        visualCtx.fill();
    }
    visualCtx.globalAlpha = 1;
    
    // NEBULAS - more/bigger with gen upgrades
    var nebulaCount = 3 + Math.floor(genL * 0.3);
    for (var n = 0; n < Math.min(nebulaCount, nebulas.length); n++) {
        var nb = nebulas[n];
        nb.x += nb.vx;
        if (nb.x < -nb.size) nb.x = w + nb.size;
        if (nb.x > w + nb.size) nb.x = -nb.size;
        
        var ng = visualCtx.createRadialGradient(nb.x, nb.y, 0, nb.x, nb.y, nb.size * (1 + genL * 0.05));
        ng.addColorStop(0, nb.color);
        ng.addColorStop(1, 'transparent');
        visualCtx.fillStyle = ng;
        visualCtx.fillRect(0, 0, w, h);
    }
    
    // FLOATING PARTICLES - with generators
    if (Math.random() < 0.004 + genL * 0.001) {
        var angle = Math.random() * Math.PI * 2;
        var dist = 100 + Math.random() * 80 + genL * 4;
        var pcol = genL > 8 ? ['#4af','#8fa','#a8f','#fa8','#f44'][Math.floor(Math.random() * 5)] : ['#4af','#8fa','#a8f'][Math.floor(Math.random() * 3)];
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
        p.alpha -= 0.004;
        
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
    
    // PLANET GLOW - hue changes: starts blue (210), shifts toward orange-red with upgrades (30)
    // Also intensifies with combo
    var glowHue = 210 - Math.min(totalL * 10, 180);
    var comboBonus = Math.min(window.clickCombo || 1, 15) - 1; // Extra glow when combo is high
    
    var glowR = r * (1.8 + Math.sin(planetPulse) * 0.12) * (1 + comboBonus * 0.05);
    var glowGrad = visualCtx.createRadialGradient(cx, cy, r * 0.25, cx, cy, glowR);
    glowGrad.addColorStop(0, 'hsl(' + glowHue + ',85%,65%)');
    glowGrad.addColorStop(0.4, 'hsl(' + glowHue + ',75%,45%)');
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
        
        var coronaColor = critL > 3 ? '#fa4' : (i % 2 ? '#aaf' : '#8ab');
        visualCtx.strokeStyle = coronaColor;
        visualCtx.globalAlpha = 0.4 - i * 0.06;
        visualCtx.lineWidth = 2.5 - i * 0.25;
        visualCtx.beginPath();
        visualCtx.arc(cx, cy, arcR, ang - 0.4, ang + 0.4);
        visualCtx.stroke();
    }
    visualCtx.globalAlpha = 1;
    
    // PLANET BODY - starts blue, adds red/orange tones with upgrades
    var planetHue = 210 - Math.min(totalL * 8, 180); // Starts at 210 (blue), moves toward 30 (orange-red)
    var planetSat = Math.min(totalL * 2, 35);
    var planetGrad = visualCtx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
    planetGrad.addColorStop(0, 'hsl(' + planetHue + ',' + (35 + planetSat) + '%,72%)');
    planetGrad.addColorStop(0.3, 'hsl(' + planetHue + ',' + (45 + planetSat) + '%,52%)');
    planetGrad.addColorStop(0.7, 'hsl(' + planetHue + ',' + (40 + planetSat) + '%,42%)');
    planetGrad.addColorStop(1, 'hsl(' + planetHue + ',' + (30 + planetSat * 0.5) + '%,32%)');
    visualCtx.fillStyle = planetGrad;
    visualCtx.beginPath();
    visualCtx.arc(cx, cy, r, 0, Math.PI * 2);
    visualCtx.fill();
    
    // SURFACE BANDS - with any upgrades
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
        p.life -= 0.022;
        
        if (p.life <= 0) {
            clickParticles.splice(i, 1);
            continue;
        }
        
        visualCtx.globalAlpha = p.life;
        visualCtx.fillStyle = p.color;
        visualCtx.beginPath();
        visualCtx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        visualCtx.fill();
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
        
        visualCtx.strokeStyle = s.color;
        visualCtx.globalAlpha = s.alpha;
        visualCtx.lineWidth = s.width;
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

function addClickBurst(x, y, power, isCrit) {
    var cx = w / 2;
    var cy = h / 2;
    var up = getUpgradeCounts();
    var color = isCrit ? '#f60' : '#0af';
    var count = isCrit ? 35 : 12;
    
    shockwaves.push({
        radius: isCrit ? 85 : 50,
        alpha: 1,
        speed: isCrit ? 10 : 5,
        color: up.crit > 2 && isCrit ? '#f80' : color,
        width: isCrit ? 7 : 3
    });
    
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

window.initVisuals = initVisuals;
window.addClickBurst = addClickBurst;