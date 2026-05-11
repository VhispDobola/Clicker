// ========================
// ATTACK PATTERNS
// ========================

const AttackPatterns = {
    spiral: function(boss, count = 8, speed = 4.0, damage = 6, size = 6, clockwise = true) {
        const time = Date.now() * 0.001;
        const direction = clockwise ? 1 : -1;
        
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + time * 50 * direction;
            const dx = Math.cos(angle) * speed;
            const dy = Math.sin(angle) * speed;
            
            const proj = new Projectile(
                boss.x + boss.width / 2,
                boss.y + boss.height / 2,
                dx, dy, damage, boss.color, size,
                clockwise ? ProjectileBehavior.SPIRAL : ProjectileBehavior.SPIRAL_REVERSE
            );
            boss.projectiles.push(proj);
        }
    },
    
    wave: function(boss, waves = 3, countPerWave = 5, speed = 5.0, damage = 8) {
        for (let wave = 0; wave < waves; wave++) {
            setTimeout(() => {
                for (let i = 0; i < countPerWave; i++) {
                    const x = boss.x + boss.width / 2 + (i - countPerWave / 2) * 30;
                    const y = boss.y + boss.height;
                    boss.projectiles.push(new Projectile(x, y, 0, speed, damage, boss.color, 8));
                }
            }, wave * 200);
        }
    },
    
    shotgun: function(boss, spreadAngle = 30, pellets = 5, speed = 6.0, damage = 10) {
        if (!boss.game || !boss.game.player) return;
        
        const player = boss.game.player;
        const dx = (player.x + (player.width || 30) / 2) - boss.x;
        const dy = (player.y + (player.height || 30) / 2) - boss.y;
        const baseAngle = Math.atan2(dy, dx);
        
        for (let i = 0; i < pellets; i++) {
            const angle = baseAngle + (i - pellets / 2) * (spreadAngle / pellets);
            const velX = Math.cos(angle) * speed;
            const velY = Math.sin(angle) * speed;
            
            boss.projectiles.push(new Projectile(
                boss.x + boss.width / 2,
                boss.y + boss.height / 2,
                velX, velY, damage, boss.color, 6
            ));
        }
    },
    
    laserSweep: function(boss, startAngle = 0, sweepSpeed = 2, length = 300, damage = 15) {
        const angle = startAngle + Date.now() * 0.001 * sweepSpeed;
        
        for (let i = 0; i < length; i += 20) {
            const x = boss.x + boss.width / 2 + Math.cos(angle) * i;
            const y = boss.y + boss.height / 2 + Math.sin(angle) * i;
            
            const proj = new Projectile(x, y, 0, 0, damage, boss.color, 10, ProjectileBehavior.LASER);
            proj.laser = true;
            boss.projectiles.push(proj);
        }
    },
    
    bouncing: function(boss, count = 3, speed = 4.0, damage = 12) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dx = Math.cos(angle) * speed;
            const dy = Math.sin(angle) * speed;
            
            const proj = new Projectile(
                boss.x + boss.width / 2,
                boss.y + boss.height / 2,
                dx, dy, damage, boss.color, 8, ProjectileBehavior.BOUNCING
            );
            boss.projectiles.push(proj);
        }
    },
    
    homing: function(boss, count = 2, speed = 3.0, damage = 8) {
        for (let i = 0; i < count; i++) {
            const proj = new Projectile(
                boss.x + boss.width / 2,
                boss.y + boss.height / 2,
                0, 0, damage, boss.color, 10, ProjectileBehavior.HOMING
            );
            
            if (boss.game && boss.game.player) {
                const player = boss.game.player;
                proj.targetX = player.x + (player.width || 30) / 2;
                proj.targetY = player.y + (player.height || 30) / 2;
            }
            
            proj.lifetime = 240;
            boss.projectiles.push(proj);
        }
    },
    
    seeking: function(boss, count = 2, speed = 4.0, damage = 10) {
        for (let i = 0; i < count; i++) {
            const proj = new Projectile(
                boss.x + boss.width / 2,
                boss.y + boss.height / 2,
                0, 0, damage, boss.color, 8, ProjectileBehavior.SEEKING
            );
            
            if (boss.game && boss.game.player) {
                const player = boss.game.player;
                proj.targetX = player.x + (player.width || 30) / 2;
                proj.targetY = player.y + (player.height || 30) / 2;
            }
            
            proj.lifetime = 180;
            boss.projectiles.push(proj);
        }
    },
    
    cross: function(boss, speed = 5.0, damage = 10) {
        const cx = boss.x + boss.width / 2;
        const cy = boss.y + boss.height / 2;
        
        for (let i = -5; i <= 5; i++) {
            boss.projectiles.push(new Projectile(cx + i * 20, cy, 0, speed, damage, boss.color, 6));
        }
        for (let i = -5; i <= 5; i++) {
            boss.projectiles.push(new Projectile(cx, cy + i * 20, speed, 0, damage, boss.color, 6));
        }
    },
    
    randomBurst: function(boss, count = 12, speedRange = [3, 7], damageRange = [5, 15]) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = speedRange[0] + Math.random() * (speedRange[1] - speedRange[0]);
            const dmg = Math.floor(damageRange[0] + Math.random() * (damageRange[1] - damageRange[0]));
            
            boss.projectiles.push(new Projectile(
                boss.x + boss.width / 2,
                boss.y + boss.height / 2,
                Math.cos(angle) * spd,
                Math.sin(angle) * spd,
                dmg, boss.color, 4 + Math.random() * 6
            ));
        }
    },
    
    ring: function(boss, rings = 3, countPerRing = 8, speed = 4.0, damage = 8) {
        for (let ring = 0; ring < rings; ring++) {
            const delay = ring * 20;
            setTimeout(() => {
                for (let i = 0; i < countPerRing; i++) {
                    const angle = (Math.PI * 2 / countPerRing) * i;
                    boss.projectiles.push(new Projectile(
                        boss.x + boss.width / 2,
                        boss.y + boss.height / 2,
                        Math.cos(angle) * speed,
                        Math.sin(angle) * speed,
                        damage, boss.color, 6
                    ));
                }
            }, delay);
        }
    },
    
    createHazard: function(boss, x, y, radius, damage, duration, type = 'damage') {
        const hazard = new HazardZone(x, y, radius, damage, duration, type);
        
        if (!boss.arenaHazards) boss.arenaHazards = [];
        boss.arenaHazards.push(hazard);
        
        const telegraph = new Telegraph(x, y, duration, radius, '#ff0000', damage);
        telegraph.activeStart = 30;
        boss.effects.push(telegraph);
        
        return hazard;
    },
    
    dash: function(boss, targetX, targetY, damage = 15, duration = 30) {
        const dx = targetX - boss.x;
        const dy = targetY - boss.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            return {
                vx: (dx / dist) * (dist / duration),
                vy: (dy / dist) * (dist / duration),
                duration: duration,
                damage: damage
            };
        }
        return null;
    }
};

window.AttackPatterns = AttackPatterns;