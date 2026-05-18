// ========================
// MAIN GAME LOGIC
// ========================
let clickCombo = 1;
let clickParticles = [];
let shockwaves = [];
let screenShake = 0;
let abilityCooldowns = {};

// Make global
window.clickCombo = clickCombo;
window.clickParticles = clickParticles;
window.shockwaves = shockwaves;
window.screenShake = screenShake;
window.abilityCooldowns = abilityCooldowns;

function handleClick() {
    initAudio();
    
    calculateRelicBonuses();
    
    const isCrit = Math.random() < getCritChance();
    let power = getClickPower();
    if (isCrit) { power *= getCritMult(); playCrit(); }
    else { playClick(); }
    
    power *= (1 + relicBonuses.combo);
    
    const moltenBonus = checkMoltenStarSpawn();
    if (moltenBonus > 0) power += moltenBonus;
    
    GAME.energy += power;
    GAME.lifetimeEnergy += power;
    GAME.clicks++;
    
    const maxComboBonus = relicBonuses.maxCombo || 0;
    clickCombo = Math.min(10 + maxComboBonus, clickCombo + 0.1);
    GAME.combo = clickCombo;
    
    if (clickCombo > GAME.maxCombo) {
        GAME.maxCombo = clickCombo;
    }
    
    const shakeAmount = Math.min(10, Math.log10(power + 1) * 2);
    screenShake = isCrit ? shakeAmount * 2 : shakeAmount;
    
    spawnParticles(power, isCrit);
    
    if (typeof addClickBurst === 'function') {
        addClickBurst(window.innerWidth / 2, window.innerHeight / 2, power, isCrit);
    }
    
    showClickText(power, isCrit);
    checkMilestones();
    
    updateDisplay();
}

function spawnParticles(power, isCrit) {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const planetR = 80;
    const count = Math.min(20, Math.floor(Math.log10(power + 1) * 3));
    
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * planetR * 0.8;
        clickParticles.push({
            x: cx + Math.cos(angle) * dist,
            y: cy + Math.sin(angle) * dist,
            vx: (Math.random() - 0.5) * 20,
            vy: (Math.random() - 0.5) * 20 - (isCrit ? 8 : 5),
            life: 1,
            color: isCrit ? (Math.random() > 0.3 ? '#ff6600' : '#ffaa00') : (Math.random() > 0.5 ? '#00ccff' : '#00ffaa'),
            size: isCrit ? 10 : 4
        });
    }
    
    // Shockwave
    if (isCrit || power > 50) {
        shockwaves.push({
            x: cx,
            y: cy,
            radius: planetR,
            maxRadius: isCrit ? planetR * 2 : planetR * 1.5,
            color: isCrit ? '#ff6600' : '#00aaff',
            width: isCrit ? 6 : 3,
            speed: isCrit ? 8 : 5,
            opacity: 1
        });
    }
}

function updateParticles() {
    // Update click particles
    for (let i = clickParticles.length - 1; i >= 0; i--) {
        const p = clickParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.5;
        p.life -= 0.03;
        
        if (p.life <= 0) {
            clickParticles.splice(i, 1);
            continue;
        }
        
        // Draw particle
        const el = document.getElementById('particle-' + i);
        if (!el) {
            const newEl = document.createElement('div');
            newEl.id = 'particle-' + i;
            newEl.style.cssText = 'position:fixed;pointer-events:none;z-index:50;border-radius:50%;';
            document.body.appendChild(newEl);
        }
        
        const el2 = document.getElementById('particle-' + i);
        el2.style.left = p.x + 'px';
        el2.style.top = p.y + 'px';
        el2.style.width = p.size * p.life + 'px';
        el2.style.height = p.size * p.life + 'px';
        el2.style.background = p.color;
        el2.style.opacity = p.life;
    }
    
    // Update shockwaves
    for (let i = shockwaves.length - 1; i >= 0; i--) {
        const s = shockwaves[i];
        s.radius += s.speed;
        s.opacity = 1 - (s.radius / s.maxRadius);
        
        if (s.radius >= s.maxRadius) {
            shockwaves.splice(i, 1);
            continue;
        }
        
        const el = document.getElementById('shockwave-' + i);
        if (!el) {
            const newEl = document.createElement('div');
            newEl.id = 'shockwave-' + i;
            newEl.style.cssText = 'position:fixed;pointer-events:none;z-index:40;border-radius:50%;border-style:solid;';
            document.body.appendChild(newEl);
        }
        
        const el2 = document.getElementById('shockwave-' + i);
        el2.style.left = (s.x - s.radius) + 'px';
        el2.style.top = (s.y - s.radius) + 'px';
        el2.style.width = s.radius * 2 + 'px';
        el2.style.height = s.radius * 2 + 'px';
        el2.style.borderColor = s.color;
        el2.style.borderWidth = s.width + 'px';
        el2.style.opacity = s.opacity;
    }
    
    // Clean up old DOM elements
    const maxParticles = 50;
    while (clickParticles.length > maxParticles) {
        const old = clickParticles.shift();
        const el = document.getElementById('particle-' + clickParticles.length);
        if (el) el.remove();
    }
}

function applyScreenShake() {
    var canvas = window.visualCanvas || document.getElementById('visualCanvas') || document.getElementById('bgCanvas');
    if (screenShake > 0 && canvas) {
        const shakeX = (Math.random() - 0.5) * screenShake;
        const shakeY = (Math.random() - 0.5) * screenShake;
        canvas.style.transform = `translate(${shakeX}px, ${shakeY}px)`;
        screenShake *= 0.9;
        if (screenShake < 0.5) {
            screenShake = 0;
            canvas.style.transform = '';
        }
    }
}

// ========================
// ABILITIES
// ========================
function activateAbility(index) {
    const ab = ABILITIES[index];
    if (!GAME.abilities[index] || abilityCooldowns[index] > 0) return;
    
    playAbility();
    const effect = ab.desc;
    
    const maxComboBonus = relicBonuses.maxCombo || 0;
    if (effect.includes('3x clicks')) clickCombo = Math.min(10 + maxComboBonus, clickCombo + 3);
    else if (effect.includes('10x all')) GAME.energy *= 10;
    else if (effect.includes('All x5')) GAME.energy *= 5;
    else if (effect.includes('100x click')) GAME.energy *= 100;
    else if (effect.includes('crit')) { /* crit bonus */ }
    else if (effect.includes('Max combo')) clickCombo = 10 + maxComboBonus;
    
    if (clickCombo > GAME.maxCombo) {
        GAME.maxCombo = clickCombo;
    }
    
    abilityCooldowns[index] = ab.cd;
    
    // Visual effect
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    for (let i = 0; i < 30; i++) {
        const angle = (Math.PI * 2 * i) / 30;
        clickParticles.push({
            x: cx, y: cy,
            vx: Math.cos(angle) * 10,
            vy: Math.sin(angle) * 10,
            life: 1,
            color: '#00ffff',
            size: 8
        });
    }
    
    toast(ab.name + ' activated!');
    updateDisplay();
}

function renderAbilityBar() {
    const bar = document.getElementById('abilityBar');
    bar.innerHTML = '';
    if (!window.ABILITIES) return;
    window.ABILITIES.forEach((ab, i) => {
        const unlocked = GAME.abilities[i];
        const cd = abilityCooldowns[i] || 0;
        const btn = document.createElement('div');
        btn.className = 'ability-btn' + (!unlocked ? ' locked' : '') + (cd > 0 ? ' cooldown' : '');
        btn.innerHTML = '<span class="key">' + ab.key + '</span>' +
            '<span class="icon">' + (unlocked ? 'O' : 'X') + '</span>' +
            (cd > 0 ? '<span class="cd-timer">' + cd + '</span>' : '');
        if (unlocked && cd === 0) btn.onclick = () => activateAbility(i);
        bar.appendChild(btn);
    });
}

// ========================
// KEYBOARD SHORTCUTS
// ========================
window.addEventListener('keydown', e => {
    if (e.key === 'u') openShop();
    if (e.key === 'r') openRelics();
    if (e.key === 'z') openPanel('zones');
    if (e.key === 's') openPanel('stats');
    if (e.key === 'p') openPanel('prestige');
    if (e.key === 'm') openPanel('achievements');
    if (e.key === 'b') startBoss();
    
    // Ability keys
    if (e.key >= '1' && e.key <= '7') {
        activateAbility(parseInt(e.key) - 1);
    }
});

// Make game functions global
window.handleClick = handleClick;
window.spawnParticles = spawnParticles;
window.updateParticles = updateParticles;
window.applyScreenShake = applyScreenShake;
window.activateAbility = activateAbility;
window.renderAbilityBar = renderAbilityBar;
window.abilityCooldowns = abilityCooldowns;
window.checkMilestones = checkMilestones;
window.checkAchievements = checkAchievements;
window.buyUpgrade = buyUpgrade;
window.doPrestige = doPrestige;
window.startBoss = startBoss;
window.quitBoss = quitBoss;
window.toggleFullscreen = toggleFullscreen;