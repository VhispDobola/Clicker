// ========================
// TEMPEST LORD BOSS
// ========================

class Tornado {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 40;
        this.pullStrength = 2;
        this.damage = 8;
        this.lifetime = 300;
        this.particles = [];
        
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                offset: Math.random() * Math.PI * 2,
                radius: Math.random() * this.radius,
                height: Math.random() * 60
            });
        }
    }
    
    update() {
        this.lifetime--;
        return this.lifetime > 0;
    }
    
    draw(ctx) {
        ctx.save();
        
        this.particles.forEach(p => {
            const angle = p.offset + this.time * 0.1;
            const px = this.x + Math.cos(angle) * p.radius * 0.5;
            const py = this.y - p.height + Math.sin(Date.now() * 0.01 + p.offset) * 10;
            
            ctx.fillStyle = 'rgba(100, 200, 255, 0.5)';
            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.strokeStyle = 'rgba(150, 220, 255, 0.3)';
        ctx.lineWidth = 2;
        
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(this.x - this.radius + i * 10, this.y);
            ctx.quadraticCurveTo(
                this.x + Math.sin(this.time * 0.05 + i) * 20,
                this.y - 30,
                this.x + (Math.random() - 0.5) * 20,
                this.y - 60
            );
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    applyPull(player) {
        const px = player.x + (player.width || 30) / 2;
        const py = player.y + (player.height || 30) / 2;
        const dx = this.x - px;
        const dy = this.y - py;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < this.radius * 2 && dist > 0) {
            player.x += (dx / dist) * this.pullStrength;
            player.y += (dy / dist) * this.pullStrength;
            return this.damage;
        }
        return 0;
    }
}

class TempestLord extends BossBase {
    constructor() {
        super('Tempest Lord', 550, '#4488ff', 3);
        this.width = 120;
        this.height = 120;
        
        this.tornadoes = [];
        this.windProjectiles = [];
        this.gustTimer = 0;
        this.stormTimer = 0;
        
        this.initAttackCooldowns = () => {
            this.attackCooldowns = {
                tornado: 0,
                gust: 0,
                slash: 0,
                cyclone: 0
            };
        };
        this.initAttackCooldowns();
    }
    
    initAttackCooldowns() {
        this.attackCooldowns = {
            tornado: 0,
            gust: 0,
            slash: 0,
            cyclone: 0
        };
    }
    
    movement() {
        const move = MovementPatterns.sineWave(this, 80, 30, 0.001, 0.0015);
        this.x += move.dx * 0.1;
        this.y += move.dy * 0.1;
        
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
            if (this.attackCooldowns.gust <= 0) {
                this.windGust(px, py);
                this.attackCooldowns.gust = 80;
            }
            
            if (this.attackCooldowns.tornado <= 0) {
                this.spawnTornado(px + (Math.random() - 0.5) * 200, py + (Math.random() - 0.5) * 100);
                this.attackCooldowns.tornado = 200;
            }
        }
        
        if (this.phase === 2) {
            if (this.attackCooldowns.gust <= 0) {
                this.windGust(px, py);
                this.windGust(px, py);
                this.attackCooldowns.gust = 60;
            }
            
            if (this.attackCooldowns.slash <= 0) {
                this.windSlash(px, py);
                this.attackCooldowns.slash = 120;
            }
            
            if (this.attackCooldowns.tornado <= 0) {
                this.spawnTornado(px - 100, py);
                this.spawnTornado(px + 100, py);
                this.attackCooldowns.tornado = 150;
            }
        }
        
        if (this.phase === 3) {
            if (this.attackCooldowns.cyclone <= 0) {
                this.cycloneAttack();
                this.attackCooldowns.cyclone = 180;
            }
            
            if (this.attackCooldowns.gust <= 0) {
                for (let i = 0; i < 5; i++) {
                    setTimeout(() => this.windGust(px, py), i * 100);
                }
                this.attackCooldowns.gust = 100;
            }
            
            if (this.attackCooldowns.slash <= 0) {
                this.windSlash(px, py);
                this.windSlash(px, py);
                this.attackCooldowns.slash = 90;
            }
        }
        
        this.tornadoes = this.tornadoes.filter(t => t.update());
    }
    
    windGust(targetX, targetY) {
        const dx = targetX - (this.x + this.width / 2);
        const dy = targetY - (this.y + this.height / 2);
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            const proj = new Projectile(
                this.x + this.width / 2,
                this.y + this.height / 2,
                (dx / dist) * 6,
                (dy / dist) * 6,
                10, '#88ccff', 8
            );
            this.projectiles.push(proj);
        }
        
        window.bossAudio.playShoot();
    }
    
    windSlash(targetX, targetY) {
        const centerX = targetX;
        
        for (let i = 0; i < 8; i++) {
            const y = this.y + this.height / 2 + (i - 4) * 15;
            const proj = new Projectile(centerX, y, 0, 8, 12, '#aaddff', 10);
            this.projectiles.push(proj);
        }
        
        const hazard = new HazardZone(centerX, this.y + this.height / 2, 100, 5, 60, 'pull');
        this.arenaHazards.push(hazard);
        
        window.bossAudio.playShoot();
    }
    
    spawnTornado(x, y) {
        const tornado = new Tornado(x, y);
        this.tornadoes.push(tornado);
        
        window.bossAudio.playAbility();
    }
    
    cycloneAttack() {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.spawnTornado(
                    100 + Math.random() * (this.canvasWidth - 200),
                    100 + Math.random() * 150
                );
            }, i * 200);
        }
        
        AttackPatterns.ring(this, 2, 10, 5, 12);
    }
    
    draw(ctx) {
        this.tornadoes.forEach(t => t.draw(ctx));
        
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
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x + this.width, this.y + this.height / 2);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height);
        ctx.lineTo(this.x, this.y + this.height / 2);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2 - 15, this.y + this.height / 2 - 10, 8, 0, Math.PI * 2);
        ctx.arc(this.x + this.width / 2 + 15, this.y + this.height / 2 - 10, 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        
        this.effects.forEach(e => e.draw(ctx));
        this.projectiles.forEach(p => p.draw(ctx));
    }
}

window.TempestLord = TempestLord;