// ========================
// BLADE MASTER BOSS
// ========================

class BladeMirrorClone {
    constructor(x, y, delayFrames = 15) {
        this.x = x;
        this.y = y;
        this.width = 60;
        this.height = 60;
        this.delayFrames = delayFrames;
        this.currentDelay = delayFrames;
        this.alpha = 0.6;
        this.lifetime = 300;
        this.projectiles = [];
    }
    
    update(playerPosHistory) {
        this.lifetime--;
        
        if (playerPosHistory.length > this.delayFrames) {
            const targetPos = playerPosHistory[playerPosHistory.length - this.delayFrames];
            this.x = targetPos.x;
            this.y = targetPos.y;
        }
        
        if (Math.random() < 0.1) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 3;
            this.projectiles.push(new Projectile(this.x + this.width/2, this.y + this.height/2, Math.cos(angle) * speed, Math.sin(angle) * speed, 6, 'rgb(100, 100, 255)', 5));
        }
        
        this.projectiles = this.projectiles.filter(p => p.update(1000, 700));
        
        return this.lifetime > 0;
    }
    
    draw(ctx) {
        ctx.strokeStyle = 'rgb(200, 200, 255)';
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        ctx.strokeStyle = 'rgb(255, 255, 255)';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = 'rgb(200, 200, 255)';
            ctx.beginPath();
            ctx.arc(this.x + this.width/2 + (Math.random() - 0.5) * 20, this.y + this.height/2 + (Math.random() - 0.5) * 20, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        this.projectiles.forEach(p => p.draw(ctx));
    }
}

class BladeMaster extends BossBase {
    constructor() {
        super('Blade Master', 700, '#ff8800', 3);
        this.width = 100;
        this.height = 100;
        
        this.mirrorClones = [];
        this.playerHistory = [];
        this.isCharging = false;
        this.chargeDirection = 1;
        this.parryActive = false;
        this.bladeOrbitals = [];
        
        this.initAttackCooldowns = () => {
            this.attackCooldowns = { ring: 0, slash: 0, charge: 0, mirror: 0, flurry: 0, parry: 0, orbital: 0 };
        };
        this.initAttackCooldowns();
    }
    
    initAttackCooldowns() {
        this.attackCooldowns = { ring: 0, slash: 0, charge: 0, mirror: 0, flurry: 0, parry: 0, orbital: 0 };
    }
    
    movement() {
        if (this.isCharging) {
            this.x += this.chargeDirection * 12;
            this.x = Math.max(50, Math.min(this.canvasWidth - this.width - 50, this.x));
        } else {
            const move = MovementPatterns.erratic(this, 2);
            this.x += move.dx;
            this.y += move.dy;
            
            this.x = Math.max(50, Math.min(this.canvasWidth - this.width - 50, this.x));
            this.y = Math.max(50, Math.min(180, this.y));
        }
    }
    
    runAttacks() {
        const cooldowns = { ...this.attackCooldowns };
        this.updateAttackCooldowns(cooldowns);
        this.attackCooldowns = cooldowns;
        
        if (!this.game || !this.game.player) return;
        const player = this.game.player;
        
        this.playerHistory.push({ x: player.x, y: player.y });
        if (this.playerHistory.length > 60) this.playerHistory.shift();
        
        const px = player.x + (player.width || 30) / 2;
        const py = player.y + (player.height || 30) / 2;
        
        if (this.phase === 1) {
            if (this.attackCooldowns.ring <= 0) {
                this.bladeRing();
                this.attackCooldowns.ring = 100;
            }
            if (this.attackCooldowns.slash <= 0) {
                this.slashCombo(px, py);
                this.attackCooldowns.slash = 120;
            }
            if (this.attackCooldowns.orbital <= 0) {
                this.spawnOrbitingBlades();
                this.attackCooldowns.orbital = 180;
            }
        }
        
        if (this.phase === 2) {
            if (this.attackCooldowns.ring <= 0) {
                this.bladeRing();
                this.bladeRing();
                this.attackCooldowns.ring = 80;
            }
            if (this.attackCooldowns.charge <= 0) {
                this.chargeAttack(px, py);
                this.attackCooldowns.charge = 150;
            }
            if (this.attackCooldowns.mirror <= 0) {
                this.spawnMirrorClone();
                this.attackCooldowns.mirror = 200;
            }
            if (this.attackCooldowns.flurry <= 0) {
                this.bladeFlurry(px, py);
                this.attackCooldowns.flurry = 150;
            }
        }
        
        if (this.phase === 3) {
            if (this.attackCooldowns.slash <= 0) {
                this.slashCombo(px, py);
                this.slashCombo(px + 30, py + 30);
                this.attackCooldowns.slash = 80;
            }
            if (this.attackCooldowns.charge <= 0) {
                this.chargeAttack(px, py);
                this.attackCooldowns.charge = 100;
            }
            if (this.attackCooldowns.mirror <= 0) {
                for (let i = 0; i < 2; i++) {
                    setTimeout(() => this.spawnMirrorClone(), i * 300);
                }
                this.attackCooldowns.mirror = 150;
            }
            if (this.attackCooldowns.parry <= 0) {
                this.parryStance();
                this.attackCooldowns.parry = 200;
            }
        }
        
        this.updateOrbitingBlades();
        
        this.mirrorClones = this.mirrorClones.filter(c => c.update(this.playerHistory));
    }
    
    bladeRing() {
        AttackPatterns.ring(this, 2, 8, 5, 10);
        window.bossAudio.playShoot();
    }
    
    slashCombo(targetX, targetY) {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const proj = new Projectile(targetX + (Math.random() - 0.5) * 40, targetY - 30, (Math.random() - 0.5) * 10, 10, 15, '#ffaa00', 8);
                proj.laser = true;
                this.projectiles.push(proj);
            }, i * 50);
        }
    }
    
    chargeAttack(targetX, targetY) {
        this.isCharging = true;
        this.chargeDirection = targetX > this.x ? 1 : -1;
        
        setTimeout(() => {
            this.isCharging = false;
            
            this.particleSystem.emitBurst(this.x + this.width/2, this.y + this.height/2, '#ff8800', 20, 10, 30);
            
            window.bossAudio.playAbility();
        }, 800);
    }
    
    spawnMirrorClone() {
        const clone = new BladeMirrorClone(
            50 + Math.random() * (this.canvasWidth - 100),
            50 + Math.random() * 150,
            15
        );
        this.mirrorClones.push(clone);
        window.bossAudio.playTeleport();
    }
    
    spawnOrbitingBlades() {
        for (let i = 0; i < 4; i++) {
            this.bladeOrbitals.push({
                angle: (Math.PI * 2 / 4) * i,
                radius: 120,
                rotation: 0
            });
        }
    }
    
    updateOrbitingBlades() {
        const bx = this.x + this.width / 2;
        const by = this.y + this.height / 2;
        
        for (let i = this.bladeOrbitals.length - 1; i >= 0; i--) {
            const blade = this.bladeOrbitals[i];
            blade.angle += 0.04;
            blade.rotation += 0.1;
            
            const px = bx + Math.cos(blade.angle) * blade.radius;
            const py = by + Math.sin(blade.angle) * blade.radius;
            
            if (Math.random() < 0.02) {
                const proj = new Projectile(px, py, (Math.random() - 0.5) * 3, 5, 8, '#ffaa00', 5);
                this.projectiles.push(proj);
            }
        }
    }
    
    bladeFlurry(targetX, targetY) {
        const bx = this.x + this.width / 2;
        const by = this.y + this.height / 2;
        
        for (let i = 0; i < 12; i++) {
            setTimeout(() => {
                const angle = (Math.PI * 2 / 12) * i + Math.random() * 0.3;
                const speed = 8 + Math.random() * 4;
                const proj = new Projectile(bx, by, Math.cos(angle) * speed, Math.sin(angle) * speed, 12, '#ff6600', 8);
                proj.bladeTrail = true;
                this.projectiles.push(proj);
            }, i * 50);
        }
    }
    
    parryStance() {
        this.parryActive = true;
        
        setTimeout(() => {
            this.parryActive = false;
            
            const bx = this.x + this.width / 2;
            const by = this.y + this.height / 2;
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI * 2 / 8) * i;
                const proj = new Projectile(bx, by, Math.cos(angle) * 10, Math.sin(angle) * 10, 15, '#ffffff', 10);
                this.projectiles.push(proj);
            }
            
            window.bossAudio.playAbility();
        }, 1500);
    }
    
    drawOrbitingBlades(ctx) {
        const bx = this.x + this.width / 2;
        const by = this.y + this.height / 2;
        
        for (const blade of this.bladeOrbitals) {
            const px = bx + Math.cos(blade.angle) * blade.radius;
            const py = by + Math.sin(blade.angle) * blade.radius;
            
            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(blade.rotation);
            ctx.fillStyle = '#ffaa00';
            ctx.beginPath();
            ctx.moveTo(0, -15);
            ctx.lineTo(8, 10);
            ctx.lineTo(-8, 10);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    }
    
    draw(ctx) {
        this.mirrorClones.forEach(c => c.draw(ctx));
        this.drawOrbitingBlades(ctx);
        
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
        ctx.moveTo(this.x + this.width/2, this.y);
        ctx.lineTo(this.x + this.width, this.y + this.height/2);
        ctx.lineTo(this.x + this.width/2, this.y + this.height);
        ctx.lineTo(this.x, this.y + this.height/2);
        ctx.closePath();
        ctx.fill();
        
        if (this.isCharging) {
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width * 0.8, 0, Math.PI * 2);
            ctx.stroke();
        }
        
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

window.BladeMaster = BladeMaster;