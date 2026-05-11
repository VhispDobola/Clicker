// ========================
// MAGMA SOVEREIGN BOSS
// ========================

class MagmaLavaPool {
    constructor(x, y, radius = 40) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.lifetime = 240;
        this.damage = 10;
        this.particles = [];
        
        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * radius;
            this.particles.push(new Particle(
                x + Math.cos(angle) * dist,
                y + Math.sin(angle) * dist,
                0, 0, 'rgb(255, 100, 0)', 120, 3
            ));
        }
    }
    
    update() {
        this.lifetime--;
        this.particles = this.particles.filter(p => p.update());
        return this.lifetime > 0;
    }
    
    draw(ctx) {
        const pulse = 1 + 0.2 * Math.sin(Date.now() * 0.02);
        
        ctx.save();
        
        ctx.fillStyle = 'rgba(255, 100, 0, 0.4)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * pulse, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(255, 150, 50, 0.8)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * pulse, 0, Math.PI * 2);
        ctx.stroke();
        
        this.particles.forEach(p => p.draw(ctx));
        
        ctx.restore();
    }
    
    checkCollision(player) {
        const px = player.x + (player.width || 30) / 2;
        const py = player.y + (player.height || 30) / 2;
        const dist = Math.sqrt((this.x - px) ** 2 + (this.y - py) ** 2);
        return dist < this.radius + (player.width || 30) / 2 ? this.damage : 0;
    }
}

class MagmaBoulder {
    constructor(x, y, targetX, targetY) {
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.speed = 4.0;
        this.radius = 25;
        this.damage = 20;
        this.trail = [];
    }
    
    update() {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
        }
        
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 8) this.trail.shift();
        
        return this.x > -50 && this.x < 1050 && this.y > -50 && this.y < 750;
    }
    
    draw(ctx) {
        this.trail.forEach((t, i) => {
            const alpha = Math.floor(255 * (i / this.trail.length));
            ctx.fillStyle = `rgba(255, 150, 50, ${alpha / 255})`;
            ctx.beginPath();
            ctx.arc(t.x, t.y, this.radius - i, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.fillStyle = 'rgb(255, 100, 0)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = 'rgb(255, 200, 100)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
    }
}

class MagmaSovereign extends BossBase {
    constructor() {
        super('Magma Sovereign', 1100, '#ff4400', 3);
        this.width = 160;
        this.height = 160;
        
        this.lavaPools = [];
        this.magmaBoulders = [];
        this.lavaTimer = 0;
        this.boulderTimer = 0;
        this.earthquakeTimer = 0;
        
        this.initAttackCooldowns = () => {
            this.attackCooldowns = {
                fireball: 0,
                lava: 0,
                boulder: 0,
                eruption: 0,
                earthquake: 0
            };
        };
        this.initAttackCooldowns();
    }
    
    initAttackCooldowns() {
        this.attackCooldowns = {
            fireball: 0,
            lava: 0,
            boulder: 0,
            eruption: 0,
            earthquake: 0
        };
    }
    
    movement() {
        const move = MovementPatterns.sineWave(this, 60, 20, 0.001, 0.001);
        this.x += move.dx * 0.1;
        this.y += move.dy * 0.1;
        
        this.x = Math.max(50, Math.min(this.canvasWidth - this.width - 50, this.x));
        this.y = Math.max(50, Math.min(150, this.y));
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
            if (this.attackCooldowns.fireball <= 0) {
                this.fireFireball(px, py);
                this.attackCooldowns.fireball = 60;
            }
            
            if (this.attackCooldowns.lava <= 0) {
                this.createLavaPool(px + (Math.random() - 0.5) * 100, py + (Math.random() - 0.5) * 50);
                this.attackCooldowns.lava = 150;
            }
        }
        
        if (this.phase === 2) {
            if (this.attackCooldowns.fireball <= 0) {
                for (let i = 0; i < 3; i++) {
                    setTimeout(() => this.fireFireball(px + (Math.random() - 0.5) * 100, py), i * 150);
                }
                this.attackCooldowns.fireball = 80;
            }
            
            if (this.attackCooldowns.boulder <= 0) {
                this.spawnMagmaBoulder(px, py);
                this.attackCooldowns.boulder = 100;
            }
            
            if (this.attackCooldowns.lava <= 0) {
                this.createLavaPool(px - 80, py);
                this.createLavaPool(px + 80, py);
                this.attackCooldowns.lava = 120;
            }
        }
        
        if (this.phase === 3) {
            if (this.attackCooldowns.eruption <= 0) {
                this.volcanicEruption();
                this.attackCooldowns.eruption = 200;
            }
            
            if (this.attackCooldowns.earthquake <= 0) {
                this.earthquakeAttack();
                this.attackCooldowns.earthquake = 150;
            }
            
            if (this.attackCooldowns.fireball <= 0) {
                AttackPatterns.spiral(this, 8, 6, 12, 8);
                this.attackCooldowns.fireball = 50;
            }
        }
        
        this.lavaPools = this.lavaPools.filter(p => p.update());
        this.magmaBoulders = this.magmaBoulders.filter(b => b.update());
    }
    
    fireFireball(targetX, targetY) {
        const dx = targetX - (this.x + this.width / 2);
        const dy = targetY - (this.y + this.height / 2);
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            const proj = new Projectile(
                this.x + this.width / 2,
                this.y + this.height / 2,
                (dx / dist) * 5,
                (dy / dist) * 5,
                15, '#ff6600', 12
            );
            proj.glow = true;
            this.projectiles.push(proj);
        }
        
        window.bossAudio.playShoot();
    }
    
    createLavaPool(x, y) {
        const pool = new MagmaLavaPool(x, y, 40);
        this.lavaPools.push(pool);
        
        const telegraph = new Telegraph(x, y, 240, 40, '#ff4400', 10);
        telegraph.activeStart = 30;
        this.effects.push(telegraph);
    }
    
    spawnMagmaBoulder(targetX, targetY) {
        const boulder = new MagmaBoulder(
            this.x + this.width / 2,
            this.y + this.height / 2,
            targetX, targetY
        );
        this.magmaBoulders.push(boulder);
        
        window.bossAudio.playAbility();
    }
    
    volcanicEruption() {
        for (let i = 0; i < 6; i++) {
            setTimeout(() => {
                const x = 100 + Math.random() * (this.canvasWidth - 200);
                const pool = new MagmaLavaPool(x, 100 + Math.random() * 200, 50);
                this.lavaPools.push(pool);
            }, i * 150);
        }
        
        AttackPatterns.ring(this, 2, 12, 5, 15);
        
        if (window.bossScreenShake) {
            window.bossScreenShake.start(20, 15);
        }
        
        window.bossAudio.playExplosion();
    }
    
    earthquakeAttack() {
        if (window.bossScreenShake) {
            window.bossScreenShake.start(30, 20);
        }
        
        for (let i = 0; i < 8; i++) {
            const x = 100 + Math.random() * (this.canvasWidth - 200);
            const y = 100 + Math.random() * 200;
            
            const proj = new Projectile(x, y - 50, 0, 8, 20, '#ff4400', 15);
            this.projectiles.push(proj);
        }
        
        window.bossAudio.playExplosion();
    }
    
    draw(ctx) {
        this.lavaPools.forEach(p => p.draw(ctx));
        this.magmaBoulders.forEach(b => b.draw(ctx));
        
        this.particleSystem.draw(ctx);
        
        ctx.save();
        
        const gradient = ctx.createRadialGradient(
            this.x + this.width / 2, this.y + this.height / 2, 0,
            this.x + this.width / 2, this.y + this.height / 2, this.width
        );
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, '#ff4400');
        gradient.addColorStop(0.6, '#ff0000');
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#ff4400';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#ffff00';
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 / 5) * i + this.time * 0.02;
            const x = this.x + this.width / 2 + Math.cos(angle) * 25;
            const y = this.y + this.height / 2 + Math.sin(angle) * 25;
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
        
        this.effects.forEach(e => e.draw(ctx));
        this.projectiles.forEach(p => p.draw(ctx));
    }
}

window.MagmaSovereign = MagmaSovereign;