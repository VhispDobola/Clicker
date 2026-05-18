// ========================
// CHRONOMANCER BOSS
// ========================

class TimeClone {
    constructor(x, y, timeOffset) {
        this.x = x;
        this.y = y;
        this.width = 80;
        this.height = 80;
        this.timeOffset = timeOffset;
        this.lifetime = 300;
        this.projectiles = [];
        this.alpha = 0.7;
    }
    
    update(currentTime, playerX, playerY) {
        this.lifetime--;
        const timePhase = (currentTime + this.timeOffset) * 0.001;
        this.x += Math.sin(timePhase) * 2;
        this.y += Math.cos(timePhase * 0.8) * 1.5;
        
        if (Math.random() < 0.05) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 3;
            this.projectiles.push(new Projectile(this.x + this.width/2, this.y + this.height/2, Math.cos(angle) * speed, Math.sin(angle) * speed, 6, '#8888ff', 5));
        }
        
        this.projectiles = this.projectiles.filter(p => p.update(1000, 700));
        
        return this.lifetime > 0;
    }
    
    draw(ctx) {
        ctx.strokeStyle = `rgba(100, 100, 255, ${this.alpha})`;
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        const rippleRadius = 20 + Math.sin(Date.now() * 0.01) * 5;
        ctx.strokeStyle = 'rgba(150, 150, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, rippleRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        this.projectiles.forEach(p => p.draw(ctx));
    }
}

class Chronomancer extends BossBase {
    constructor() {
        super('Chronomancer', 750, '#8888ff', 3);
        this.width = 100;
        this.height = 100;
        
        this.timeClones = [];
        this.timeZones = [];
        this.timeFieldActive = false;
        this.rewindActive = false;
        this.clockworkProjectiles = [];
        
        this.initAttackCooldowns = () => {
            this.attackCooldowns = { clone: 0, field: 0, stop: 0, paradox: 0, orb: 0, rewind: 0, clock: 0 };
        };
        this.initAttackCooldowns();
    }
    
    initAttackCooldowns() {
        this.attackCooldowns = { clone: 0, field: 0, stop: 0, paradox: 0, orb: 0, rewind: 0, clock: 0 };
    }
    
    movement() {
        const move = MovementPatterns.hover(this, 100, 1);
        this.x += move.dx;
        this.y += move.dy;
        
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
            if (this.attackCooldowns.clone <= 0) {
                this.spawnTimeClone();
                this.attackCooldowns.clone = 180;
            }
            if (this.attackCooldowns.field <= 0) {
                this.createTimeField(px, py, 'slow');
                this.attackCooldowns.field = 150;
            }
            if (this.attackCooldowns.orb <= 0) {
                this.spawnTimeOrb(px, py);
                this.attackCooldowns.orb = 120;
            }
        }
        
        if (this.phase === 2) {
            if (this.attackCooldowns.clone <= 0) {
                this.spawnTimeClone();
                this.spawnTimeClone();
                this.attackCooldowns.clone = 120;
            }
            if (this.attackCooldowns.stop <= 0) {
                this.timeStop(px, py);
                this.attackCooldowns.stop = 200;
            }
            if (this.attackCooldowns.field <= 0) {
                this.createTimeField(px, py, Math.random() > 0.5 ? 'slow' : 'fast');
                this.attackCooldowns.field = 100;
            }
            if (this.attackCooldowns.clock <= 0) {
                this.clockworkBarrage();
                this.attackCooldowns.clock = 180;
            }
        }
        
        if (this.phase === 3) {
            if (this.attackCooldowns.paradox <= 0) {
                this.paradoxMode();
                this.attackCooldowns.paradox = 180;
            }
            if (this.attackCooldowns.clone <= 0) {
                for (let i = 0; i < 3; i++) {
                    setTimeout(() => this.spawnTimeClone(), i * 200);
                }
                this.attackCooldowns.clone = 80;
            }
            if (this.attackCooldowns.stop <= 0) {
                this.timeStop(px, py);
                this.attackCooldowns.stop = 150;
            }
            if (this.attackCooldowns.rewind <= 0) {
                this.rewindAbility();
                this.attackCooldowns.rewind = 300;
            }
            if (this.attackCooldowns.clock <= 0) {
                this.clockworkBarrage();
                this.attackCooldowns.clock = 100;
            }
        }
        
        this.timeClones = this.timeClones.filter(c => c.update(this.time, px, py));
    }
    
    spawnTimeClone() {
        const clone = new TimeClone(
            50 + Math.random() * (this.canvasWidth - 100),
            50 + Math.random() * 150,
            Math.random() * 1000
        );
        this.timeClones.push(clone);
        window.bossAudio.playTeleport();
    }
    
    createTimeField(x, y, type) {
        const field = type === 'slow' ? 
            new HazardZone(x, y, 80, 3, 180, 'slow') :
            new HazardZone(x, y, 80, 8, 180, 'damage');
        this.arenaHazards.push(field);
        
        const telegraph = new Telegraph(x, y, 180, 80, type === 'slow' ? '#4488ff' : '#ff4444', type === 'slow' ? 3 : 8);
        telegraph.activeStart = 30;
        this.effects.push(telegraph);
    }
    
    timeStop(targetX, targetY) {
        const telegraph = new Telegraph(targetX, targetY, 60, 40, '#8888ff', 20);
        telegraph.activeStart = 40;
        this.effects.push(telegraph);
        
        setTimeout(() => {
            for (let i = 0; i < 5; i++) {
                const proj = new Projectile(targetX + (Math.random() - 0.5) * 60, targetY - 30, 0, 8, 20, '#8888ff', 8);
                this.projectiles.push(proj);
            }
            window.bossAudio.playAbility();
        }, 700);
    }
    
    paradoxMode() {
        for (let i = 0; i < 4; i++) {
            this.spawnTimeClone();
        }
        
        AttackPatterns.ring(this, 2, 10, 5, 12);
        
        window.bossAudio.playBossDefeat();
    }
    
    spawnTimeOrb(targetX, targetY) {
        const bx = this.x + this.width / 2;
        const by = this.y + this.height / 2;
        
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 / 5) * i;
            const proj = new Projectile(bx, by, Math.cos(angle) * 4, Math.sin(angle) * 4, 8, '#00ffff', 12);
            proj.timeOrb = true;
            proj.slowRadius = 60;
            this.projectiles.push(proj);
        }
    }
    
    clockworkBarrage() {
        const bx = this.x + this.width / 2;
        
        for (let i = 0; i < 4; i++) {
            setTimeout(() => {
                const x = 100 + i * 200;
                const y = 50 + Math.random() * 50;
                
                const clock = {
                    x: x, y: y, rotation: 0,
                    update: function() {
                        this.rotation += 0.1;
                        return true;
                    },
                    draw: function(ctx) {
                        ctx.save();
                        ctx.translate(this.x, this.y);
                        ctx.rotate(this.rotation);
                        ctx.strokeStyle = '#ffff00';
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.arc(0, 0, 20, 0, Math.PI * 2);
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.moveTo(0, 0);
                        ctx.lineTo(15, 0);
                        ctx.stroke();
                        ctx.restore();
                    }
                };
                
                this.effects.push(clock);
                
                for (let j = 0; j < 3; j++) {
                    setTimeout(() => {
                        const angle = Math.random() * Math.PI * 2;
                        const proj = new Projectile(x, y, Math.cos(angle) * 6, Math.sin(angle) * 6, 10, '#ffff00', 6);
                        this.projectiles.push(proj);
                    }, j * 200);
                }
            }, i * 300);
        }
    }
    
    rewindAbility() {
        this.rewindActive = true;
        
        const originalProjectiles = [...this.projectiles];
        
        setTimeout(() => {
            for (const proj of originalProjectiles) {
                if (proj.x > 0 && proj.x < this.canvasWidth && proj.y > 0 && proj.y < this.canvasHeight) {
                    proj.x = this.x + this.width / 2 + (Math.random() - 0.5) * 100;
                    proj.y = this.y + this.height / 2 - 50;
                    proj.dx = (Math.random() - 0.5) * 5;
                    proj.dy = (Math.random() - 0.5) * 5;
                }
            }
            
            this.particleSystem.emitBurst(
                this.x + this.width / 2,
                this.y + this.height / 2,
                '#ffffff', 25, 12, 40
            );
            
            window.bossAudio.playTeleport();
        }, 500);
        
        setTimeout(() => {
            this.rewindActive = false;
        }, 1500);
    }
    
    draw(ctx) {
        this.timeClones.forEach(c => c.draw(ctx));
        
        this.particleSystem.draw(ctx);
        
        ctx.save();
        const gradient = ctx.createRadialGradient(this.x + this.width/2, this.y + this.height/2, 0, this.x + this.width/2, this.y + this.height/2, this.width);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, this.color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width * 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width * 0.5, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x + this.width/2 - 12, this.y + this.height/2 - 8, 6, 0, Math.PI * 2);
        ctx.arc(this.x + this.width/2 + 12, this.y + this.height/2 - 8, 6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        this.effects.forEach(e => e.draw(ctx));
        this.projectiles.forEach(p => p.draw(ctx));
    }
}

window.Chronomancer = Chronomancer;