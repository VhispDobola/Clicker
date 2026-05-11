// ========================
// VOID ASSASSIN BOSS
// ========================

class VoidAssassinShadowClone {
    constructor(x, y, cloneType = 'attack') {
        this.x = x;
        this.y = y;
        this.width = 60;
        this.height = 60;
        this.cloneType = cloneType;
        this.lifetime = 120;
        this.attackTimer = 0;
        this.movementSpeed = 3.0;
        this.alpha = 150;
        this.particles = [];
        
        for (let i = 0; i < 8; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 2 + 1;
            this.particles.push(new Particle(
                x + Math.cos(angle) * 20,
                y + Math.sin(angle) * 20,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                'rgb(50, 50, 50)', 60, 2
            ));
        }
    }
    
    update(playerX, playerY, dt) {
        this.lifetime -= 1;
        this.attackTimer -= 1;
        
        if (this.cloneType === 'attack') {
            const dx = playerX - this.x;
            const dy = playerY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0 && dist > 50) {
                this.x += (dx / dist) * this.movementSpeed;
                this.y += (dy / dist) * this.movementSpeed;
            }
        } else if (this.cloneType === 'distraction') {
            this.x += Math.sin(Date.now() * 0.01) * this.movementSpeed;
            this.y += Math.cos(Date.now() * 0.01) * this.movementSpeed;
        }
        
        this.particles = this.particles.filter(p => p.update());
        
        return this.lifetime > 0;
    }
    
    draw(ctx) {
        ctx.save();
        
        const overlay = document.createElement('canvas');
        overlay.width = ctx.canvas.width;
        overlay.height = ctx.canvas.height;
        const overlayCtx = overlay.getContext('2d');
        
        overlayCtx.fillStyle = `rgba(50, 50, 50, ${this.alpha / 255})`;
        overlayCtx.beginPath();
        overlayCtx.arc(this.x, this.y, 20, 0, Math.PI * 2);
        overlayCtx.fill();
        
        ctx.drawImage(overlay, 0, 0);
        
        this.particles.forEach(p => p.draw(ctx));
        
        ctx.restore();
    }
    
    createAttack(bossX, bossY, color) {
        if (this.attackTimer <= 0 && Math.random() < 0.05) {
            this.attackTimer = 30;
            return new Projectile(
                this.x + this.width / 2,
                this.y + this.height / 2,
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 6,
                6, color, 5
            );
        }
        return null;
    }
}

class VoidPortal {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 30;
        this.lifetime = 180;
        this.pulseTimer = 0;
    }
    
    update() {
        this.lifetime--;
        this.pulseTimer++;
        return this.lifetime > 0;
    }
    
    draw(ctx) {
        const pulse = 1 + 0.3 * Math.sin(this.pulseTimer * 0.1);
        
        ctx.save();
        
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius * pulse
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
        gradient.addColorStop(0.5, 'rgba(50, 0, 100, 0.5)');
        gradient.addColorStop(1, 'rgba(100, 50, 150, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * pulse, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#aa44ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * pulse * 0.7, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }
}

class VoidAssassin extends BossBase {
    constructor() {
        super('Void Assassin', 510, '#1a1a2e', 3);
        this.width = 140;
        this.height = 140;
        
        this.shadowClones = [];
        this.voidPortals = [];
        this.shadowCloneTimer = 0;
        this.portalTimer = 0;
        this.teleportTimer = 0;
        this.lastPlayerX = 0;
        this.lastPlayerY = 0;
        
        this.initAttackCooldowns = () => {
            this.attackCooldowns = {
                shadow: 0,
                portal: 0,
                strike: 0,
                dash: 0
            };
        };
        this.initAttackCooldowns();
    }
    
    initAttackCooldowns() {
        this.attackCooldowns = {
            shadow: 0,
            portal: 0,
            strike: 0,
            dash: 0
        };
    }
    
    movement() {
        if (this.phase === 1) {
            const move = MovementPatterns.hover(this, 100, 1.5);
            this.x += move.dx;
            this.y += move.dy;
        } else if (this.phase === 2) {
            const move = MovementPatterns.chase(this, 1.5, 0.3);
            this.x += move.dx;
            this.y += move.dy;
        } else {
            const move = MovementPatterns.teleport(this, 0.03, 2);
            this.x += move.dx;
            this.y += move.dy;
        }
        
        this.x = Math.max(50, Math.min(this.canvasWidth - this.width - 50, this.x));
        this.y = Math.max(50, Math.min(200, this.y));
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
            if (this.attackCooldowns.shadow <= 0) {
                this.spawnShadowClone();
                this.attackCooldowns.shadow = 180;
            }
            
            if (this.attackCooldowns.strike <= 0) {
                this.teleportStrike(px, py);
                this.attackCooldowns.strike = 120;
            }
        }
        
        if (this.phase === 2) {
            if (this.attackCooldowns.portal <= 0) {
                this.spawnVoidPortal(px, py);
                this.attackCooldowns.portal = 240;
            }
            
            if (this.attackCooldowns.shadow <= 0) {
                this.spawnShadowClone();
                this.spawnShadowClone();
                this.attackCooldowns.shadow = 120;
            }
            
            if (this.attackCooldowns.strike <= 0) {
                this.teleportStrike(px, py);
                this.attackCooldowns.strike = 90;
            }
        }
        
        if (this.phase === 3) {
            if (this.attackCooldowns.dash <= 0) {
                this.dashAttack(px, py);
                this.attackCooldowns.dash = 60;
            }
            
            if (this.attackCooldowns.portal <= 0) {
                this.spawnVoidPortal(px, py);
                this.attackCooldowns.portal = 150;
            }
            
            if (this.attackCooldowns.shadow <= 0) {
                this.spawnShadowClone();
                this.spawnShadowClone();
                this.spawnShadowClone();
                this.attackCooldowns.shadow = 80;
            }
            
            if (this.attackCooldowns.strike <= 0) {
                this.teleportStrike(px, py);
                this.attackCooldowns.strike = 60;
            }
        }
        
        this.shadowClones = this.shadowClones.filter(clone => 
            clone.update(px, py, 1)
        );
        
        this.voidPortals = this.voidPortals.filter(portal => portal.update());
    }
    
    spawnShadowClone() {
        const types = ['attack', 'distraction'];
        const type = types[Math.floor(Math.random() * types.length)];
        const clone = new VoidAssassinShadowClone(
            50 + Math.random() * (this.canvasWidth - 100),
            50 + Math.random() * 150,
            type
        );
        this.shadowClones.push(clone);
        
        window.bossAudio.playTeleport();
    }
    
    spawnVoidPortal(targetX, targetY) {
        const portal = new VoidPortal(targetX, targetY);
        this.voidPortals.push(portal);
        
        window.bossAudio.playTeleport();
    }
    
    teleportStrike(targetX, targetY) {
        const oldX = this.x;
        const oldY = this.y;
        
        this.x = targetX - this.width / 2 + (Math.random() - 0.5) * 100;
        this.y = Math.max(50, targetY - 100);
        
        this.x = Math.max(50, Math.min(this.canvasWidth - this.width - 50, this.x));
        this.y = Math.max(50, Math.min(200, this.y));
        
        for (let i = 0; i < 10; i++) {
            this.particleSystem.emit(
                this.x + this.width / 2,
                this.y + this.height / 2,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10,
                '#aa44ff', 10, 20, 4
            );
        }
        
        window.bossAudio.playTeleport();
        
        AttackPatterns.randomBurst(this, 5, [3, 6], [8, 15]);
    }
    
    dashAttack(targetX, targetY) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            const speed = 15;
            const steps = 10;
            
            for (let i = 0; i < steps; i++) {
                setTimeout(() => {
                    this.x += (dx / dist) * speed;
                    this.y += (dy / dist) * speed;
                    
                    this.x = Math.max(50, Math.min(this.canvasWidth - this.width - 50, this.x));
                    this.y = Math.max(50, Math.min(250, this.y));
                    
                    AttackPatterns.randomBurst(this, 3, [2, 4], [5, 10]);
                }, i * 30);
            }
        }
    }
    
    createTeleportEffect() {
        window.bossAudio.playTeleport();
        
        this.particleSystem.emitBurst(
            this.x + this.width / 2,
            this.y + this.height / 2,
            '#aa44ff', 20, 8, 30
        );
    }
    
    draw(ctx) {
        this.voidPortals.forEach(p => p.draw(ctx));
        
        this.shadowClones.forEach(clone => clone.draw(ctx));
        
        this.particleSystem.draw(ctx);
        
        ctx.save();
        
        const pulse = 1 + 0.2 * Math.sin(this.time * 0.1);
        
        const gradient = ctx.createRadialGradient(
            this.x + this.width / 2, this.y + this.height / 2, 0,
            this.x + this.width / 2, this.y + this.height / 2, this.width * pulse
        );
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, this.color);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width * pulse, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width * 0.4 * pulse, 0, Math.PI * 2);
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

window.VoidAssassin = VoidAssassin;