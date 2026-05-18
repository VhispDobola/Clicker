// ========================
// ETERNAL DRAGON BOSS
// ========================

class EternalDragon extends BossBase {
    constructor() {
        super('Eternal Dragon', 800, '#ff4400', 3);
        this.width = 160;
        this.height = 140;
        
        this.initAttackCooldowns = () => {
            this.attackCooldowns = { breath: 0, claw: 0, dive: 0, roars: 0 };
        };
        this.initAttackCooldowns();
    }
    
    initAttackCooldowns() {
        this.attackCooldowns = { breath: 0, claw: 0, dive: 0, roars: 0 };
    }
    
    movement() {
        const move = MovementPatterns.figureEight(this, 60, 30, 0.002);
        this.x += move.dx * 0.05;
        this.y += move.dy * 0.05;
        
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
            if (this.attackCooldowns.breath <= 0) {
                this.fireBreath(px, py);
                this.attackCooldowns.breath = 80;
            }
            if (this.attackCooldowns.claw <= 0) {
                this.clawSwipe(px, py);
                this.attackCooldowns.claw = 100;
            }
        }
        
        if (this.phase === 2) {
            if (this.attackCooldowns.breath <= 0) {
                this.fireBreath(px, py);
                this.fireBreath(px, py);
                this.attackCooldowns.breath = 60;
            }
            if (this.attackCooldowns.claw <= 0) {
                this.clawSwipe(px, py);
                this.clawSwipe(px, py);
                this.attackCooldowns.claw = 80;
            }
            if (this.attackCooldowns.dive <= 0) {
                this.dragonDive(px, py);
                this.attackCooldowns.dive = 150;
            }
        }
        
        if (this.phase === 3) {
            if (this.attackCooldowns.roars <= 0) {
                this.dragonRoars();
                this.attackCooldowns.roars = 100;
            }
            if (this.attackCooldowns.dive <= 0) {
                this.dragonDive(px, py);
                this.dragonDive(px + 30, py + 30);
                this.attackCooldowns.dive = 100;
            }
        }
    }
    
    fireBreath(targetX, targetY) {
        const dx = targetX - (this.x + this.width / 2);
        const dy = targetY - (this.y + this.height / 2);
        const angle = Math.atan2(dy, dx);
        
        for (let i = 0; i < 15; i++) {
            const proj = new Projectile(
                this.x + this.width / 2 + Math.cos(angle) * 30,
                this.y + this.height / 2 + Math.sin(angle) * 30,
                Math.cos(angle + (Math.random() - 0.5) * 0.3) * 7,
                Math.sin(angle + (Math.random() - 0.5) * 0.3) * 7,
                10, '#ff6600', 8
            );
            this.projectiles.push(proj);
        }
    }
    
    clawSwipe(targetX, targetY) {
        const hazard = new HazardZone(targetX, this.y + this.height / 2, 80, 15, 30, 'damage');
        this.arenaHazards.push(hazard);
        
        window.bossAudio.playAbility();
    }
    
    dragonDive(targetX, targetY) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    this.x += (dx / dist) * 10;
                    this.y += (dy / dist) * 8;
                    this.x = Math.max(50, Math.min(this.canvasWidth - this.width - 50, this.x));
                    this.y = Math.max(50, Math.min(250, this.y));
                    
                    AttackPatterns.randomBurst(this, 3, [3, 5], [8, 12]);
                }, i * 30);
            }
        }
        
        if (window.bossScreenShake) {
            window.bossScreenShake.start(20, 15);
        }
    }
    
    dragonRoars() {
        if (window.bossScreenShake) {
            window.bossScreenShake.start(15, 10);
        }
        
        AttackPatterns.ring(this, 2, 12, 5, 15);
        
        window.bossAudio.playExplosion();
    }
    
    draw(ctx) {
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
        ctx.ellipse(this.x + this.width/2, this.y + this.height/2, this.width/2, this.height/2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(this.x + this.width/2 - 20, this.y + this.height/2 - 10, 10, 0, Math.PI * 2);
        ctx.arc(this.x + this.width/2 + 20, this.y + this.height/2 - 10, 10, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.ellipse(this.x + this.width/2, this.y + this.height/2 + 20, 30, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        this.effects.forEach(e => e.draw(ctx));
        this.projectiles.forEach(p => p.draw(ctx));
    }
}

window.EternalDragon = EternalDragon;