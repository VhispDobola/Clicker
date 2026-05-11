// ========================
// NEXUS CORE BOSS
// ========================

class EnergyOrb {
    constructor(x, y, targetX, targetY) {
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.speed = 2.5;
        this.radius = 15;
        this.damage = 15;
        this.lifetime = 400;
        this.trail = [];
    }
    
    update(playerX, playerY) {
        this.lifetime--;
        this.targetX = playerX;
        this.targetY = playerY;
        
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0 && dist > 80) {
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
        }
        
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 15) this.trail.shift();
        
        return this.lifetime > 0;
    }
    
    draw(ctx) {
        this.trail.forEach((t, i) => {
            const alpha = Math.floor(255 * (i / this.trail.length) * 0.5);
            ctx.fillStyle = `rgba(0, 255, 255, ${alpha / 255})`;
            ctx.beginPath();
            ctx.arc(t.x, t.y, this.radius * (i / this.trail.length), 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.save();
        
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 2);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.5, '#00ffff');
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

class NexusShield {
    constructor(boss) {
        this.boss = boss;
        this.health = 150;
        this.maxHealth = 150;
        this.radius = 90;
        this.regenRate = 0.3;
        this.active = true;
        this.pulseTimer = 0;
    }
    
    update() {
        this.pulseTimer++;
        
        if (this.health < this.maxHealth) {
            this.health += this.regenRate;
        }
        
        return this.health > 0;
    }
    
    takeDamage(damage) {
        this.health -= damage;
        return this.health <= 0;
    }
    
    draw(ctx) {
        const pulse = 1 + 0.15 * Math.sin(this.pulseTimer * 0.08);
        
        ctx.save();
        
        ctx.strokeStyle = 'rgba(0, 200, 255, 0.6)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(this.boss.x + this.boss.width / 2, this.boss.y + this.boss.height / 2, this.radius * pulse, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.fillStyle = 'rgba(0, 150, 255, 0.1)';
        ctx.beginPath();
        ctx.arc(this.boss.x + this.boss.width / 2, this.boss.y + this.boss.height / 2, this.radius * pulse, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

class NexusCore extends BossBase {
    constructor() {
        super('Nexus Core', 650, '#00ffff', 3);
        this.width = 150;
        this.height = 150;
        
        this.energyOrbs = [];
        this.nexusShield = new NexusShield(this);
        this.portalTimer = 0;
        this.laserCharging = false;
        this.laserAngle = 0;
        
        this.initAttackCooldowns = () => {
            this.attackCooldowns = {
                orb: 0,
                laser: 0,
                burst: 0,
                portal: 0
            };
        };
        this.initAttackCooldowns();
    }
    
    initAttackCooldowns() {
        this.attackCooldowns = {
            orb: 0,
            laser: 0,
            burst: 0,
            portal: 0
        };
    }
    
    onPhaseTransition(oldPhase, newPhase) {
        if (newPhase === 3) {
            this.nexusShield = new NexusShield(this);
            this.nexusShield.health = 200;
            this.nexusShield.maxHealth = 200;
        }
    }
    
    movement() {
        if (this.phase === 1) {
            const move = MovementPatterns.circular(this, 60, 0.001);
            this.x += move.dx * 0.05;
            this.y += move.dy * 0.05;
        } else if (this.phase === 2) {
            const move = MovementPatterns.chase(this, 0.8, 0.2);
            this.x += move.dx;
            this.y += move.dy;
        } else {
            const move = MovementPatterns.randomWaypoint(this, 1.5);
            this.x += move.dx;
            this.y += move.dy;
        }
        
        this.x = Math.max(50, Math.min(this.canvasWidth - this.width - 50, this.x));
        this.y = Math.max(50, Math.min(180, this.y));
    }
    
    runAttacks() {
        const cooldowns = { ...this.attackCooldowns };
        this.updateAttackCooldowns(cooldowns);
        this.attackCooldowns = cooldowns;
        
        if (!this.game || !this.game.player) return;
        const player = this.game.player;
        const px = player.x + (player.width || 30) / 2;
        const py = player.y + (player.height || 30) / 2;
        
        if (this.phase === 1) {
            if (this.attackCooldowns.orb <= 0) {
                this.spawnEnergyOrb(px, py);
                this.attackCooldowns.orb = 80;
            }
            
            if (this.attackCooldowns.burst <= 0) {
                AttackPatterns.ring(this, 1, 8, 4, 8);
                this.attackCooldowns.burst = 120;
            }
        }
        
        if (this.phase === 2) {
            this.nexusShield.update();
            
            if (this.attackCooldowns.orb <= 0) {
                this.spawnEnergyOrb(px, py);
                this.spawnEnergyOrb(px, py);
                this.attackCooldowns.orb = 60;
            }
            
            if (this.attackCooldowns.laser <= 0) {
                this.fireLaser(px, py);
                this.attackCooldowns.laser = 150;
            }
            
            if (this.attackCooldowns.burst <= 0) {
                AttackPatterns.ring(this, 2, 10, 5, 10);
                this.attackCooldowns.burst = 100;
            }
        }
        
        if (this.phase === 3) {
            this.nexusShield.update();
            
            if (this.attackCooldowns.orb <= 0) {
                for (let i = 0; i < 3; i++) {
                    this.spawnEnergyOrb(px + (Math.random() - 0.5) * 100, py + (Math.random() - 0.5) * 100);
                }
                this.attackCooldowns.orb = 40;
            }
            
            if (this.attackCooldowns.laser <= 0) {
                this.fireLaser(px, py);
                this.fireLaser(px + 50, py + 50);
                this.attackCooldowns.laser = 120;
            }
            
            if (this.attackCooldowns.burst <= 0) {
                AttackPatterns.ring(this, 3, 12, 6, 12);
                this.attackCooldowns.burst = 80;
            }
            
            if (this.attackCooldowns.portal <= 0) {
                this.teleportAttack();
                this.attackCooldowns.portal = 180;
            }
        }
        
        this.energyOrbs = this.energyOrbs.filter(o => o.update(px, py));
    }
    
    spawnEnergyOrb(targetX, targetY) {
        const orb = new EnergyOrb(
            this.x + this.width / 2,
            this.y + this.height / 2,
            targetX, targetY
        );
        this.energyOrbs.push(orb);
        
        window.bossAudio.playShoot();
    }
    
    fireLaser(targetX, targetY) {
        const dx = targetX - (this.x + this.width / 2);
        const dy = targetY - (this.y + this.height / 2);
        const angle = Math.atan2(dy, dx);
        
        const telegraph = new Telegraph(
            this.x + this.width / 2 + Math.cos(angle) * 150,
            this.y + this.height / 2 + Math.sin(angle) * 150,
            60, 30, '#00ffff', 15
        );
        telegraph.activeStart = 40;
        this.effects.push(telegraph);
        
        setTimeout(() => {
            for (let i = 0; i < 20; i++) {
                const dist = i * 20;
                const proj = new Projectile(
                    this.x + this.width / 2 + Math.cos(angle) * dist,
                    this.y + this.height / 2 + Math.sin(angle) * dist,
                    0, 0, 15, '#00ffff', 8, ProjectileBehavior.LASER
                );
                proj.laser = true;
                this.projectiles.push(proj);
            }
            
            window.bossAudio.playAbility();
        }, 1000);
    }
    
    teleportAttack() {
        const oldX = this.x;
        const oldY = this.y;
        
        this.x = Math.random() * (this.canvasWidth - this.width - 100) + 50;
        this.y = 50 + Math.random() * 150;
        
        this.particleSystem.emitBurst(oldX + this.width / 2, oldY + this.height / 2, '#00ffff', 20, 8, 30);
        this.particleSystem.emitBurst(this.x + this.width / 2, this.y + this.height / 2, '#00ffff', 20, 8, 30);
        
        AttackPatterns.randomBurst(this, 8, [4, 7], [10, 15]);
        
        window.bossAudio.playTeleport();
    }
    
    takeDamage(damage) {
        if (this.nexusShield && this.nexusShield.active && this.nexusShield.health > 0) {
            this.nexusShield.takeDamage(damage);
            window.bossAudio.playShield();
            
            if (this.nexusShield.health <= 0) {
                this.nexusShield = new NexusShield(this);
            }
            return false;
        }
        
        return super.takeDamage(damage);
    }
    
    draw(ctx) {
        this.energyOrbs.forEach(o => o.draw(ctx));
        
        if (this.nexusShield) {
            this.nexusShield.draw(ctx);
        }
        
        this.particleSystem.draw(ctx);
        
        ctx.save();
        
        const gradient = ctx.createRadialGradient(
            this.x + this.width / 2, this.y + this.height / 2, 0,
            this.x + this.width / 2, this.y + this.height / 2, this.width
        );
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, this.color);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#001122';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width * 0.6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = this.color;
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 / 6) * i + this.time * 0.03;
            const x = this.x + this.width / 2 + Math.cos(angle) * 30;
            const y = this.y + this.height / 2 + Math.sin(angle) * 30;
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2 - 15, this.y + this.height / 2 - 10, 6, 0, Math.PI * 2);
        ctx.arc(this.x + this.width / 2 + 15, this.y + this.height / 2 - 10, 6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        
        this.effects.forEach(e => e.draw(ctx));
        this.projectiles.forEach(p => p.draw(ctx));
    }
}

window.NexusCore = NexusCore;