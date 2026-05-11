// ========================
// THUNDER EMPEROR BOSS
// ========================

class ThunderCloud {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 100;
        this.height = 40;
        this.damage = 12;
        this.lifetime = 300;
        this.boltTimer = 0;
    }
    
    update() {
        this.lifetime--;
        this.boltTimer++;
        return this.lifetime > 0;
    }
    
    canStrike() {
        return this.boltTimer >= 60;
    }
    
    resetBolt() {
        this.boltTimer = 0;
    }
    
    draw(ctx) {
        ctx.save();
        
        ctx.fillStyle = `rgba(100, 100, 150, ${this.lifetime / 300 * 0.6})`;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(150, 150, 200, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }
}

class ThunderEmperor extends BossBase {
    constructor() {
        super('Thunder Emperor', 600, '#8888ff', 3);
        this.width = 130;
        this.height = 130;
        
        this.thunderClouds = [];
        this.lightningBolts = [];
        
        this.initAttackCooldowns = () => {
            this.attackCooldowns = {
                bolt: 0,
                cloud: 0,
                chain: 0,
                storm: 0
            };
        };
        this.initAttackCooldowns();
    }
    
    initAttackCooldowns() {
        this.attackCooldowns = {
            bolt: 0,
            cloud: 0,
            chain: 0,
            storm: 0
        };
    }
    
    movement() {
        const move = MovementPatterns.sineWave(this, 70, 30, 0.001, 0.0012);
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
            if (this.attackCooldowns.bolt <= 0) {
                this.lightningBolt(px, py);
                this.attackCooldowns.bolt = 80;
            }
            
            if (this.attackCooldowns.cloud <= 0) {
                this.spawnThunderCloud(px);
                this.attackCooldowns.cloud = 200;
            }
        }
        
        if (this.phase === 2) {
            if (this.attackCooldowns.bolt <= 0) {
                this.lightningBolt(px, py);
                this.lightningBolt(px + (Math.random() - 0.5) * 80, py);
                this.attackCooldowns.bolt = 60;
            }
            
            if (this.attackCooldowns.chain <= 0) {
                this.chainLightning(px, py);
                this.attackCooldowns.chain = 150;
            }
            
            this.thunderClouds = this.thunderClouds.filter(c => {
                c.update();
                if (c.canStrike()) {
                    this.lightningBolt(c.x, c.y + 20);
                    c.resetBolt();
                }
                return c.lifetime > 0;
            });
        }
        
        if (this.phase === 3) {
            if (this.attackCooldowns.storm <= 0) {
                this.thunderStorm();
                this.attackCooldowns.storm = 180;
            }
            
            if (this.attackCooldowns.bolt <= 0) {
                this.lightningBolt(px, py);
                this.attackCooldowns.bolt = 40;
            }
        }
    }
    
    lightningBolt(targetX, targetY) {
        const telegraph = new Telegraph(targetX, targetY, 30, 20, '#ffff00', 20);
        telegraph.activeStart = 20;
        this.effects.push(telegraph);
        
        setTimeout(() => {
            const proj = new Projectile(targetX, targetY - 50, 0, 15, 20, '#ffff00', 8);
            proj.lifetime = 20;
            this.projectiles.push(proj);
            
            window.bossAudio.playAbility();
        }, 400);
    }
    
    chainLightning(targetX, targetY) {
        let currentX = targetX;
        let currentY = targetY;
        
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const proj = new Projectile(
                    currentX, currentY - 30,
                    (Math.random() - 0.5) * 8,
                    8, 15, '#ffff88', 6
                );
                this.projectiles.push(proj);
                
                currentX += (Math.random() - 0.5) * 60;
                currentY += 30;
            }, i * 80);
        }
        
        window.bossAudio.playShoot();
    }
    
    spawnThunderCloud(targetX) {
        const cloud = new ThunderCloud(targetX, 30);
        this.thunderClouds.push(cloud);
    }
    
    thunderStorm() {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.spawnThunderCloud(100 + Math.random() * (this.canvasWidth - 200));
            }, i * 200);
        }
        
        AttackPatterns.ring(this, 2, 8, 5, 12);
        
        window.bossAudio.playExplosion();
    }
    
    draw(ctx) {
        this.thunderClouds.forEach(c => c.draw(ctx));
        
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
        ctx.fillRect(this.x + 20, this.y + 20, this.width - 40, this.height - 40);
        
        ctx.fillStyle = '#ffff00';
        const pulse = Math.sin(this.time * 0.2) > 0;
        if (pulse) {
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 15, 0, Math.PI * 2);
            ctx.fill();
        }
        
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

window.ThunderEmperor = ThunderEmperor;