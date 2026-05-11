// ========================
// ENHANCED BOSS FIGHT SYSTEM
// ========================
let keys = {};
let bossActive = false;
let bossCanvas, bossCtx;
let bossIndex = 0, bossCurrent, bossHp, bossMaxHp;
let bossTime = 60, bossStartTime = 0, bossMaxTime = 60;
let bossProjectiles = [];
let bossUsedLastStand = false;
let bossPhase = 1;
let bossX = 200, bossY = 120;
let bossVx = 2.5, bossVy = 2;
let playerHp = 3, playerMaxHp = 3;
let playerX = 0, playerY = 0;
let playerIframes = 0;
let playerDash = 0;
let playerSpecial = 0;
let playerSuper = 0;
let bossShield = 0;
let bossStunTimer = 0;
let bossAiTimer = 0;
let lastFrameTime = 0;
let bossParticles = [];
let playerTrail = [];
let bossAttacks = [];
let currentAttack = null;
let attackProgress = 0;
let bossVisuals = { glow: 0, pulse: 0, shake: 0 };

const BOSS_PATTERNS = {
    VoidTitan: {
        name: 'Void Titan',
        color: '#ff3300',
        hp: 300,
        speed: 3,
        dmg: 10,
        pattern: 'sweep',
        phases: [
            { hpPercent: 100, attacks: ['fireball', 'sweep', 'radial'] },
            { hpPercent: 50, attacks: ['fireball', 'rapid', 'hellfire'], speedMult: 1.3 },
            { hpPercent: 25, attacks: ['fireball', 'sweep', 'matrix'], speedMult: 1.5 }
        ],
        abilities: {
            fireball: { name: 'Fireball', interval: 2000, damage: 15, speed: 250 },
            sweep: { name: 'Sweeping Beam', interval: 4000, damage: 20, duration: 1500 },
            radial: { name: 'Radial Burst', interval: 5000, damage: 12, count: 8 },
            rapid: { name: 'Rapid Fire', interval: 1500, damage: 10, count: 5 },
            hellfire: { name: 'Hellfire Rain', interval: 6000, damage: 25, duration: 3000 },
            matrix: { name: 'Matrix of Doom', interval: 8000, damage: 30, duration: 2000 }
        },
        size: 50,
        desc: 'Shoots fireballs and sweeping beams'
    },
    QuantumHorror: {
        name: 'Quantum Horror',
        color: '#aa00ff',
        hp: 500,
        speed: 3.5,
        dmg: 15,
        pattern: 'split',
        phases: [
            { hpPercent: 100, attacks: ['phase', 'clone', 'teleport'] },
            { hpPercent: 50, attacks: ['phase', 'clone', 'quantum'], speedMult: 1.4 },
            { hpPercent: 25, attacks: ['phase', 'clone', 'entangle'], speedMult: 1.6 }
        ],
        abilities: {
            phase: { name: 'Phase Shift', interval: 3000, damage: 20, duration: 1000 },
            clone: { name: 'Shadow Clone', interval: 5000, damage: 15, count: 2 },
            teleport: { name: 'Quantum Teleport', interval: 4000, teleport: true },
            quantum: { name: 'Quantum Storm', interval: 2000, damage: 18, count: 12 },
            entangle: { name: 'Entanglement', interval: 6000, damage: 30, duration: 2500 }
        },
        size: 45,
        desc: 'Phases through attacks and spawns clones',
        special: 'splitsAtHalf'
    },
    TimeGuardian: {
        name: 'Time Guardian',
        color: '#ffaa00',
        hp: 800,
        speed: 3,
        dmg: 20,
        pattern: 'time',
        phases: [
            { hpPercent: 100, attacks: ['slow', 'fast', 'spiral'] },
            { hpPercent: 50, attacks: ['slow', 'rewind', 'loop'], speedMult: 1.3 },
            { hpPercent: 25, attacks: ['slow', 'freeze', 'eternal'], speedMult: 1.5 }
        ],
        abilities: {
            slow: { name: 'Time Slow', interval: 3500, duration: 2000, slowAmount: 0.4 },
            fast: { name: 'Time Fast', interval: 2500, speedMult: 2 },
            spiral: { name: 'Time Spiral', interval: 4000, damage: 25, count: 10 },
            rewind: { name: 'Time Rewind', interval: 6000, healPercent: 0.15 },
            loop: { name: 'Time Loop', interval: 5000, damage: 30, duration: 1500 },
            freeze: { name: 'Time Freeze', interval: 7000, damage: 35, duration: 2000 },
            eternal: { name: 'Eternal Torment', interval: 8000, damage: 40, count: 15 }
        },
        size: 55,
        desc: 'Manipulates time to slow and damage'
    },
    MatterLord: {
        name: 'Matter Lord',
        color: '#00aaff',
        hp: 1200,
        speed: 4,
        dmg: 25,
        pattern: 'bounce',
        phases: [
            { hpPercent: 100, attacks: ['matter', 'gravity', 'collapse'] },
            { hpPercent: 50, attacks: ['matter', 'singularity', 'explode'], speedMult: 1.3 },
            { hpPercent: 25, attacks: ['matter', 'blackhole', 'annihilate'], speedMult: 1.6 }
        ],
        abilities: {
            matter: { name: 'Matter Shards', interval: 1800, damage: 20, count: 6 },
            gravity: { name: 'Gravity Well', interval: 3500, damage: 25, pull: true },
            collapse: { name: 'Matter Collapse', interval: 5000, damage: 30, duration: 1500 },
            singularity: { name: 'Mini Singularity', interval: 3000, damage: 35, pullStrength: 3 },
            explode: { name: 'Matter Explosion', interval: 4000, damage: 40, radius: 150 },
            blackhole: { name: 'Black Hole', interval: 6000, damage: 50, pullStrength: 5 },
            annihilate: { name: 'Annihilation', interval: 8000, damage: 60, duration: 2000 }
        },
        size: 60,
        desc: 'Controls matter with gravity and bouncing attacks'
    },
    LightEmperor: {
        name: 'Light Emperor',
        color: '#ffff00',
        hp: 1800,
        speed: 4.5,
        dmg: 35,
        pattern: 'laser',
        phases: [
            { hpPercent: 100, attacks: ['laser', 'beam', 'ray'] },
            { hpPercent: 50, attacks: ['laser', 'Nova', 'prism'], speedMult: 1.4 },
            { hpPercent: 25, attacks: ['laser', 'deathray', 'radiance'], speedMult: 1.7 }
        ],
        abilities: {
            laser: { name: 'Laser Burst', interval: 1500, damage: 25, speed: 300 },
            beam: { name: 'Beam Storm', interval: 3000, damage: 30, count: 4 },
            ray: { name: 'Light Ray', interval: 2500, damage: 35, tracking: true },
            Nova: { name: 'Nova Blast', interval: 5000, damage: 45, radius: 200 },
            prism: { name: 'Prism Rain', interval: 2000, damage: 25, count: 8 },
            deathray: { name: 'Death Ray', interval: 4000, damage: 60, charging: true },
            radiance: { name: 'Radiant Annihilation', interval: 7000, damage: 70, duration: 2500 }
        },
        size: 55,
        desc: 'Unleashes devastating laser attacks',
        special: 'phasesAtQuarter'
    }
};

const PLAYER_SPECIALS = {
    dash: { name: 'Dash', key: 'shift', cooldown: 3000, duration: 200, speedMult: 4, iframe: true },
    shield: { name: 'Shield', key: 'q', cooldown: 12000, duration: 1500, damageReduce: 0.6 },
    stun: { name: 'Stun Bomb', key: 'e', cooldown: 8000, damage: 50, radius: 100, stunDuration: 1500 },
    heal: { name: 'Heal', key: 'r', cooldown: 15000, healAmount: 2 },
    super: { name: 'Super Mode', key: 'x', cooldown: 30000, duration: 5000, damageMult: 3, speedMult: 1.5 }
};

// ========================
// NEW BOSS SYSTEM INTEGRATION
// ========================
let currentBoss = null;

function createNewBoss(bossIndex) {
    const bossConfig = BOSSES[bossIndex % BOSSES.length];
    const BossClass = window[bossConfig.className];
    if (BossClass) {
        const boss = new BossClass();
        boss.canvasWidth = window.innerWidth;
        boss.canvasHeight = window.innerHeight;
        boss.game = { player: { x: playerX, y: playerY, width: 30, height: 30 } };
        return boss;
    }
    return new VoidAssassin();
}

function startBoss() {
    initAudio();
    if (window.bossAudio) window.bossAudio.playBossStart();
    playBossMusic();
    bossActive = true;
    bossUsedLastStand = false;
    bossParticles = [];
    playerTrail = [];
    bossAttacks = [];
    bossShield = 0;
    bossStunTimer = 0;
    currentAttack = null;
    attackProgress = 0;
    bossVisuals = { glow: 0, pulse: 0, shake: 0 };
    
    document.getElementById('bossArena').classList.add('active');
    bossCanvas = document.getElementById('bossCanvas');
    bossCtx = bossCanvas.getContext('2d');
    bossCanvas.width = window.innerWidth;
    bossCanvas.height = window.innerHeight;
    
    bossIndex = Math.min(GAME.bossesWon, BOSSES.length - 1);
    bossCurrent = BOSSES[bossIndex];
    
    // Create new boss instance
    currentBoss = createNewBoss(bossIndex);
    if (currentBoss) {
        currentBoss.canvasWidth = bossCanvas.width;
        currentBoss.canvasHeight = bossCanvas.height;
    }
    
    bossMaxHp = bossCurrent.hp * getBossHpMultiplier();
    bossHp = bossMaxHp;
    bossMaxTime = 60 + bossIndex * 15;
    bossTime = bossMaxTime;
    bossStartTime = Date.now();
    
    // Update boss name in HUD
    const bossNameEl = document.getElementById('bossName');
    if (bossNameEl && bossCurrent) {
        bossNameEl.textContent = bossCurrent.name;
    }
    
    playerMaxHp = 3 + getBossDodge();
    playerHp = playerMaxHp;
    playerX = bossCanvas.width / 2;
    playerY = bossCanvas.height - 80;
    playerIframes = 0;
    playerDash = 0;
    playerSpecial = 0;
    playerSuper = 0;
    bossProjectiles = [];
    bossPhase = 1;
    
    keys = {};
    window.addEventListener('keydown', handleBossKeyDown);
    window.addEventListener('keyup', handleBossKeyUp);
    
    bossLoop();
}

function handleBossKeyDown(e) {
    if (!bossActive) return;
    keys[e.key.toLowerCase()] = true;
    
    if (e.key === 'Shift' && playerDash === 0) {
        playerDash = PLAYER_SPECIALS.dash.duration;
        playerIframes = PLAYER_SPECIALS.dash.duration;
    }
    if (e.key === 'q' && playerSpecial === 0) {
        playerSpecial = PLAYER_SPECIALS.shield.cooldown;
        bossShield = PLAYER_SPECIALS.shield.duration;
    }
    if (e.key === 'e' && playerSpecial <= PLAYER_SPECIALS.stun.cooldown - 8000) {
        stunNearbyBosses();
    }
    if (e.key === 'r' && playerSpecial < PLAYER_SPECIALS.heal.cooldown - 15000) {
        playerHp = Math.min(playerMaxHp, playerHp + PLAYER_SPECIALS.heal.healAmount);
        playHeal();
    }
    if (e.key === 'x' && playerSuper === 0) {
        playerSuper = PLAYER_SPECIALS.super.duration;
    }
}

function handleBossKeyUp(e) {
    keys[e.key.toLowerCase()] = false;
}

function quitBoss() {
    bossActive = false;
    window.removeEventListener('keydown', handleBossKeyDown);
    window.removeEventListener('keyup', handleBossKeyUp);
    document.getElementById('bossArena').classList.remove('active');
}

function bossLoop() {
    if (!bossActive) return;
    
    const now = Date.now();
    const dt = Math.min((now - lastFrameTime) / 1000, 0.1);
    lastFrameTime = now;
    
    bossCtx.fillStyle = '#050510';
    bossCtx.fillRect(0, 0, bossCanvas.width, bossCanvas.height);
    
    drawBossBackground();
    
    bossTime = Math.max(0, bossMaxTime - (now - bossStartTime) / 1000);
    document.getElementById('bossTimer').textContent = bossTime.toFixed(0) + 's';
    document.getElementById('bossPlayerHp').textContent = playerHp;
    document.getElementById('bossHpFill').style.width = (bossHp / bossMaxHp * 100) + '%';
    updateBossHud();
    
    // Update and draw new boss system
    if (currentBoss) {
        currentBoss.game = { player: { x: playerX, y: playerY, width: 30, height: 30 } };
        currentBoss.canvasWidth = bossCanvas.width;
        currentBoss.canvasHeight = bossCanvas.height;
        currentBoss.update();
        
        // Draw the new boss
        currentBoss.draw(bossCtx);
        
        // Draw intro if active
        if (currentBoss.showingIntro) {
            currentBoss.drawIntro(bossCtx, bossCanvas.width, bossCanvas.height);
        }
        
        // Update boss HP from new system
        bossHp = currentBoss.health;
        bossPhase = currentBoss.phase;
        
        // Copy projectiles from new boss to collision system
        bossProjectiles = [...currentBoss.projectiles];
    }
    
    updateBossPhase();
    handlePlayerMovement(dt);
    if (currentBoss) {
        // Don't use old AI - new boss has its own attacks
    } else {
        updateBossAi(dt, now);
    }
    updateProjectiles(dt);
    updateBossAttacks(dt);
    updateVisuals(dt);
    handleCollisions();
    drawBossEffects();
    
    if (bossHp <= 0) {
        bossWin();
        return;
    }
    if (playerHp <= 0) {
        if (getBossLastStand() && !bossUsedLastStand) {
            bossUsedLastStand = true;
            playerHp = 1;
            playHeal();
            toast('Last Stand activated!', 'success');
        } else if (getBossResurrect() > 0 && !bossUsedLastStand) {
            bossUsedLastStand = true;
            playerHp = playerMaxHp;
            playHeal();
            toast('Resurrected!', 'success');
        } else {
            bossLose();
            return;
        }
    }
    if (bossTime <= 0) {
        bossLose();
        return;
    }
    
    requestAnimationFrame(bossLoop);
}

function updateBossPhase() {
    const hpPercent = (bossHp / bossMaxHp) * 100;
    if (hpPercent <= 25) bossPhase = 3;
    else if (hpPercent <= 50) bossPhase = 2;
    else bossPhase = 1;
}

function handlePlayerMovement(dt) {
    let speed = 350;
    let slowFactor = 1;
    
    if (bossStunTimer > 0) slowFactor = 0.3;
    if (playerSuper > 0) speed *= PLAYER_SPECIALS.super.speedMult;
    if (playerDash > 0) speed *= PLAYER_SPECIALS.dash.speedMult;
    
    speed *= slowFactor * dt;
    
    if (keys['a'] || keys['arrowleft']) playerX -= speed;
    if (keys['d'] || keys['arrowright']) playerX += speed;
    if (keys['w'] || keys['arrowup']) playerY -= speed;
    if (keys['s'] || keys['arrowdown']) playerY += speed;
    
    playerX = Math.max(20, Math.min(bossCanvas.width - 20, playerX));
    playerY = Math.max(20, Math.min(bossCanvas.height - 20, playerY));
    
    if (playerDash > 0) playerDash -= dt * 1000;
    if (playerSuper > 0) playerSuper -= dt * 1000;
    if (playerIframes > 0) playerIframes -= dt * 1000;
    if (playerSpecial > 0) playerSpecial -= dt * 1000;
    if (bossStunTimer > 0) bossStunTimer -= dt * 1000;
    if (bossShield > 0) bossShield -= dt * 1000;
    
    playerTrail.unshift({ x: playerX, y: playerY, alpha: 1 });
    if (playerTrail.length > 10) playerTrail.pop();
    playerTrail.forEach(t => t.alpha -= dt * 3);
}

function drawPlayerTrail() {
    playerTrail.forEach((t, i) => {
        bossCtx.globalAlpha = Math.max(0, t.alpha * 0.5);
        bossCtx.fillStyle = '#00ff88';
        bossCtx.beginPath();
        bossCtx.arc(t.x, t.y, 10 - i, 0, Math.PI * 2);
        bossCtx.fill();
    });
    bossCtx.globalAlpha = 1;
}

function updateBossAi(dt, now) {
    if (bossStunTimer > 0) return;
    
    bossAiTimer += dt * 1000;
    
    bossX += bossVx * (1 + bossPhase * 0.2);
    bossY += bossVy * (1 + bossPhase * 0.15);
    
    if (bossX < 50 || bossX > bossCanvas.width - 50) bossVx *= -1;
    if (bossY < 50 || bossY > 200) bossVy *= -1;
    
    bossVisuals.pulse += dt * 5;
    bossVisuals.glow = Math.sin(now / 500) * 0.3 + 0.7;
    
    scheduleBossAttacks(now);
}

function scheduleBossAttacks(now) {
    const bossData = BOSS_PATTERNS[bossCurrent.id] || BOSS_PATTERNS.VoidTitan;
    const phase = bossData.phases[bossPhase - 1];
    if (!phase) return;
    
    phase.attacks.forEach(attackName => {
        const attack = bossData.abilities[attackName];
        if (!attack) return;
        
        const lastAttack = bossAttacks.find(a => a.name === attackName);
        if (!lastAttack || now - lastAttack.lastTime > attack.interval * (1 / phase.speedMult)) {
            triggerBossAttack(attackName, attack);
            if (!lastAttack) {
                bossAttacks.push({ name: attackName, lastTime: now });
            } else {
                lastAttack.lastTime = now;
            }
        }
    });
}

function triggerBossAttack(name, attack) {
    const now = Date.now();
    
    switch (name) {
        case 'fireball':
            for (let i = 0; i < 3 + bossPhase; i++) {
                setTimeout(() => {
                    if (!bossActive) return;
                    const angle = (Math.random() - 0.5) * 0.5;
                    bossProjectiles.push({
                        x: bossX, y: bossY + 40,
                        vx: Math.sin(angle) * attack.speed,
                        vy: attack.speed,
                        type: 'boss', damage: attack.damage, color: '#ff6600',
                        size: 12, glow: true
                    });
                    window.playShoot();
                }, i * 150);
            }
            break;
            
        case 'sweep':
            const sweepX = playerX;
            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    if (!bossActive) return;
                    bossProjectiles.push({
                        x: sweepX, y: bossY,
                        vx: 0, vy: 400,
                        type: 'boss', damage: attack.damage, color: '#ff3300',
                        size: 15, trail: true, duration: 1500
                    });
                }, i * 150);
            }
            break;
            
        case 'radial':
            for (let i = 0; i < attack.count; i++) {
                const angle = (Math.PI * 2 / attack.count) * i;
                bossProjectiles.push({
                    x: bossX, y: bossY,
                    vx: Math.cos(angle) * 200,
                    vy: Math.sin(angle) * 200,
                    type: 'boss', damage: attack.damage, color: '#ff4400',
                    size: 10, ring: true
                });
            }
            break;
            
        case 'rapid':
            for (let i = 0; i < attack.count; i++) {
                setTimeout(() => {
                    const toPlayer = Math.atan2(playerY - bossY, playerX - bossX);
                    bossProjectiles.push({
                        x: bossX, y: bossY,
                        vx: Math.cos(toPlayer) * 350,
                        vy: Math.sin(toPlayer) * 350,
                        type: 'boss', damage: attack.damage, color: '#ff5500',
                        size: 8, fast: true
                    });
                }, i * 100);
            }
            break;
            
        case 'matrix':
            for (let x = 0; x < bossCanvas.width; x += 80) {
                setTimeout(() => {
                    bossProjectiles.push({
                        x: x, y: 0,
                        vx: 0, vy: 300,
                        type: 'boss', damage: attack.damage, color: '#ff0000',
                        size: 20, column: true, duration: 2000
                    });
                }, x / 80 * 50);
            }
            break;
            
        case 'phase':
        case 'teleport':
            const distance = 150;
            const angle = Math.random() * Math.PI * 2;
            bossX = Math.max(50, Math.min(bossCanvas.width - 50, bossX + Math.cos(angle) * distance));
            bossY = Math.max(50, Math.min(200, bossY + Math.sin(angle) * distance));
            createPhaseEffect();
            break;
            
        case 'clone':
            for (let i = 0; i < attack.count; i++) {
                bossProjectiles.push({
                    x: bossX + (Math.random() - 0.5) * 200,
                    y: bossY + 50,
                    vx: (Math.random() - 0.5) * 150,
                    vy: 150,
                    type: 'clone', damage: attack.damage, color: '#aa00ff',
                    size: 25, clone: true
                });
            }
            break;
            
        case 'slow':
            playerX *= 0.95;
            playerY = Math.max(playerY * 0.98, playerY - 2);
            bossProjectiles.push({
                x: playerX, y: playerY,
                vx: 0, vy: 0, type: 'slow', duration: attack.duration,
                color: '#8844ff', size: 30
            });
            break;
            
        case 'spiral':
            for (let i = 0; i < attack.count; i++) {
                const angle = (now / 1000) + (Math.PI * 2 / attack.count) * i;
                bossProjectiles.push({
                    x: bossX, y: bossY,
                    vx: Math.cos(angle) * 200,
                    vy: Math.sin(angle) * 200,
                    type: 'boss', damage: attack.damage, color: '#ffaa00',
                    size: 8
                });
            }
            break;
            
        case 'laser':
            const toAngle = Math.atan2(playerY - bossY, playerX - bossX);
            bossProjectiles.push({
                x: bossX, y: bossY,
                vx: Math.cos(toAngle) * attack.speed,
                vy: Math.sin(toAngle) * attack.speed,
                type: 'boss', damage: attack.damage, color: '#ffff00',
                size: 10, laser: true
            });
            break;
            
        case 'beam':
            for (let i = 0; i < attack.count; i++) {
                const beamX = bossX + (i - attack.count/2) * 50;
                setTimeout(() => {
                    bossProjectiles.push({
                        x: beamX, y: bossY,
                        vx: 0, vy: 400,
                        type: 'boss', damage: attack.damage, color: '#ffff00',
                        size: 20, beam: true
                    });
                }, i * 100);
            }
            break;
            
        case 'Nova':
            createBossNova(attack.radius, attack.damage);
            break;
    }
}

function createPhaseEffect() {
    for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 50;
        bossParticles.push({
            x: bossX + Math.cos(angle) * dist,
            y: bossY + Math.sin(angle) * dist,
            vx: -Math.cos(angle) * 100,
            vy: -Math.sin(angle) * 100,
            alpha: 1, color: '#aa00ff', size: 5
        });
    }
}

function createBossNova(radius, damage) {
    for (let angle = 0; angle < Math.PI * 2; angle += 0.2) {
        bossProjectiles.push({
            x: bossX, y: bossY,
            vx: Math.cos(angle) * 200,
            vy: Math.sin(angle) * 200,
            type: 'boss', damage: damage, color: '#ffff88',
            size: 15, nova: true, radius: radius
        });
    }
}

function drawBossEffects() {
    drawPlayerTrail();
    
    bossCtx.save();
    const shakeX = (Math.random() - 0.5) * bossVisuals.shake;
    const shakeY = (Math.random() - 0.5) * bossVisuals.shake;
    bossCtx.translate(shakeX, shakeY);
    
    const bossData = BOSS_PATTERNS[bossCurrent.id] || BOSS_PATTERNS.VoidTitan;
    const size = bossData.size + Math.sin(bossVisuals.pulse) * 5;
    
    if (bossShield > 0) {
        bossCtx.strokeStyle = `rgba(100, 200, 255, ${bossShield / 1500})`;
        bossCtx.lineWidth = 5;
        bossCtx.beginPath();
        bossCtx.arc(bossX, bossY, size + 20, 0, Math.PI * 2);
        bossCtx.stroke();
    }
    
    bossCtx.shadowBlur = 20 * bossVisuals.glow;
    bossCtx.shadowColor = bossData.color;
    
    const gradient = bossCtx.createRadialGradient(bossX, bossY, 0, bossX, bossY, size);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.3, bossData.color);
    gradient.addColorStop(1, 'transparent');
    
    bossCtx.fillStyle = gradient;
    bossCtx.beginPath();
    bossCtx.arc(bossX, bossY, size, 0, Math.PI * 2);
    bossCtx.fill();
    
    bossCtx.fillStyle = bossData.color;
    bossCtx.beginPath();
    bossCtx.arc(bossX, bossY, size * 0.6, 0, Math.PI * 2);
    bossCtx.fill();
    
    bossCtx.shadowBlur = 0;
    bossCtx.restore();
    
    bossCtx.fillStyle = '#00ff88';
    const playerSize = 15 + (playerSuper > 0 ? 5 : 0);
    bossCtx.beginPath();
    bossCtx.arc(playerX, playerY, playerSize, 0, Math.PI * 2);
    bossCtx.fill();
    
    if (playerSuper > 0) {
        bossCtx.strokeStyle = '#ffff00';
        bossCtx.lineWidth = 3;
        bossCtx.beginPath();
        bossCtx.arc(playerX, playerY, playerSize + 10, 0, Math.PI * 2);
        bossCtx.stroke();
    }
    
    if (playerIframes > 0) {
        bossCtx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        bossCtx.beginPath();
        bossCtx.arc(playerX, playerY, playerSize + 5, 0, Math.PI * 2);
        bossCtx.fill();
    }
    
    bossParticles.forEach(p => {
        bossCtx.globalAlpha = p.alpha;
        bossCtx.fillStyle = p.color;
        bossCtx.beginPath();
        bossCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        bossCtx.fill();
    });
    bossCtx.globalAlpha = 1;
}

function updateVisuals(dt) {
    bossParticles = bossParticles.filter(p => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.alpha -= dt * 2;
        return p.alpha > 0;
    });
    
    if (bossVisuals.shake > 0) bossVisuals.shake -= dt * 30;
}

function updateProjectiles(dt) {
    for (let i = bossProjectiles.length - 1; i >= 0; i--) {
        const p = bossProjectiles[i];
        
        if (p.duration) {
            p.duration -= dt * 1000;
            if (p.duration <= 0) {
                bossProjectiles.splice(i, 1);
                continue;
            }
        }
        
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        
        if (p.laser || p.beam) {
            const angle = Math.atan2(p.vy, p.vx);
            bossCtx.strokeStyle = p.color;
            bossCtx.lineWidth = p.size / 2;
            bossCtx.globalAlpha = 0.7;
            bossCtx.beginPath();
            bossCtx.moveTo(p.x, p.y);
            bossCtx.lineTo(p.x - Math.cos(angle) * 50, p.y - Math.sin(angle) * 50);
            bossCtx.stroke();
            bossCtx.globalAlpha = 1;
        }
        
        if (p.trail) {
            bossCtx.fillStyle = p.color;
            bossCtx.globalAlpha = 0.5;
            for (let j = 0; j < 5; j++) {
                bossCtx.beginPath();
                bossCtx.arc(p.x - p.vx * dt * j, p.y - p.vy * dt * j, p.size * (1 - j * 0.15), 0, Math.PI * 2);
                bossCtx.fill();
            }
            bossCtx.globalAlpha = 1;
        }
        
        if (p.nova) {
            const dist = Math.sqrt((p.x - bossX) ** 2 + (p.y - bossY) ** 2);
            if (dist > p.radius) {
                bossProjectiles.splice(i, 1);
                continue;
            }
        }
        
        bossCtx.fillStyle = p.color;
        if (p.glow) {
            bossCtx.shadowBlur = 15;
            bossCtx.shadowColor = p.color;
        }
        bossCtx.beginPath();
        bossCtx.arc(p.x, p.y, p.size || 10, 0, Math.PI * 2);
        bossCtx.fill();
        bossCtx.shadowBlur = 0;
        
        if (p.y < -50 || p.y > bossCanvas.height + 50 || p.x < -50 || p.x > bossCanvas.width + 50) {
            bossProjectiles.splice(i, 1);
            continue;
        }
    }
}

function handleCollisions() {
    for (let i = bossProjectiles.length - 1; i >= 0; i--) {
        const p = bossProjectiles[i];
        if (p.type !== 'player' && p.type !== 'clone' && p.type !== 'boss') continue;
        
        const dist = Math.sqrt((p.x - playerX) ** 2 + (p.y - playerY) ** 2);
        
        if (p.type !== 'player' && dist < 20 + (p.size || 10)) {
            if (playerIframes <= 0) {
                let damage = p.damage || 10;
                if (bossShield > 0) damage *= (1 - PLAYER_SPECIALS.shield.damageReduce);
                if (playerSuper > 0) damage /= PLAYER_SPECIALS.super.damageMult;
                playerHp -= damage;
                playerIframes = 500;
                bossVisuals.shake = 10;
                playPlayerHit();
            }
            bossProjectiles.splice(i, 1);
            continue;
        }
        
        if ((p.type === 'player') && p.y < bossY + 50) {
            const distToBoss = Math.sqrt((p.x - bossX) ** 2 + (p.y - bossY) ** 2);
            if (distToBoss < 60 + (p.size || 10)) {
                let damage = getBossDamage();
                if (playerSuper > 0) damage *= PLAYER_SPECIALS.super.damageMult;
                if (bossShield > 0) damage *= 0.3;
                bossHp -= damage;
                playBossHit();
                createHitEffect(p.x, p.y);
            }
        }
    }
}

function createHitEffect(x, y) {
    for (let i = 0; i < 10; i++) {
        const angle = Math.random() * Math.PI * 2;
        bossParticles.push({
            x: x, y: y,
            vx: Math.cos(angle) * 150,
            vy: Math.sin(angle) * 150,
            alpha: 1, color: '#ffffff', size: 4
        });
    }
}

function stunNearbyBosses() {
    bossStunTimer = PLAYER_SPECIALS.stun.stunDuration;
    bossVisuals.shake = 20;
    
    for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        bossParticles.push({
            x: playerX + Math.cos(angle) * 50,
            y: playerY + Math.sin(angle) * 50,
            vx: Math.cos(angle) * 200,
            vy: Math.sin(angle) * 200,
            alpha: 1, color: '#ffff00', size: 6
        });
    }
}

function updateBossAttacks(dt) {
    for (let i = bossAttacks.length - 1; i >= 0; i--) {
        const attack = bossAttacks[i];
        if (attack.duration) {
            attack.duration -= dt * 1000;
            if (attack.duration <= 0) {
                bossAttacks.splice(i, 1);
            }
        }
    }
}

function updateBossHud() {
    const hud = document.getElementById('bossHud');
    if (hud) {
        let specialText = '';
        if (playerSuper > 0) specialText += ' [SUPER]';
        if (bossShield > 0) specialText += ' [SHIELD]';
        if (bossStunTimer > 0) specialText += ' [STUNNED]';
        hud.textContent = `HP: ${Math.ceil(playerHp)}/${playerMaxHp}${specialText}`;
    }
}

function drawBossBackground() {
    const gradient = bossCtx.createLinearGradient(0, 0, 0, bossCanvas.height);
    gradient.addColorStop(0, '#0a0a20');
    gradient.addColorStop(1, '#050510');
    bossCtx.fillStyle = gradient;
    bossCtx.fillRect(0, 0, bossCanvas.width, bossCanvas.height);
    
    for (let i = 0; i < 50; i++) {
        const x = (i * 137) % bossCanvas.width;
        const y = (i * 89) % bossCanvas.height;
        bossCtx.fillStyle = `rgba(255, 255, 255, ${0.1 + Math.sin(Date.now() / 1000 + i) * 0.05})`;
        bossCtx.beginPath();
        bossCtx.arc(x, y, 1, 0, Math.PI * 2);
        bossCtx.fill();
    }
}

function bossWin() {
    bossActive = false;
    GAME.bossesWon++;
    playBossWin();
    if (window.bossAudio) window.bossAudio.playBossDefeat();
    
    const acReward = 10 + GAME.bossesWon * 5;
    GAME.ascensionCrystals = (GAME.ascensionCrystals || 0) + acReward;
    
    const dustReward = 5 + GAME.bossesWon * 2;
    GAME.relicDust = (GAME.relicDust || 0) + dustReward;
    
    saveGame(false);
    document.getElementById('bossArena').classList.remove('active');
    toast(`Boss defeated! +${acReward} AC, +${dustReward} Dust`, 'success');
    checkAchievements();
}

function bossLose() {
    bossActive = false;
    document.getElementById('bossArena').classList.remove('active');
    playError();
    if (window.bossAudio) window.bossAudio.playError();
    toast('Boss defeated you! Try again.', 'error');
}

window.startBoss = startBoss;
window.quitBoss = quitBoss;
window.bossLoop = bossLoop;
window.BOSS_PATTERNS = BOSS_PATTERNS;
window.PLAYER_SPECIALS = PLAYER_SPECIALS;
window.bossActive = false;