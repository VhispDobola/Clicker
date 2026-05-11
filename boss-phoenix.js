// ========================
// IMMORTAL PHOENIX BOSS (Multi-Stage)
// ========================

class PhoenixStage extends BossStage {
    constructor(name, health, color, introText) {
        super(name, health, color, introText);
    }
}

class ImmortalPhoenix extends MultiStageBoss {
    constructor() {
        const stages = [
            new PhoenixStage('Phoenix Rising', 300, '#ff6600', 'From the ashes, I rise!'),
            new PhoenixStage('Blazing Fury', 300, '#ff4400', 'Feel the burning wrath!'),
            new PhoenixStage('Inferno', 300, '#ff2200', 'Nothing survives my flames!'),
            new PhoenixStage('Immortal Rebirth', 300, '#ff8800', 'WITNESS MY RESURRECTION!')
        ];
        
        super(stages, 'Immortal Phoenix');
        
        this.width = 140;
        this.height = 140;
        
        this.hasResurrected = false;
        this.fireSpiralTimer = 0;
        this.flameBurstTimer = 0;
        
        this.initAttackCooldowns = () => {
            this.attackCooldowns = {
                spiral: 0,
                burst: 0,
                dive: 0,
                rebirth: 0
            };
        };
        this.initAttackCooldowns();
    }
    
    initAttackCooldowns() {
        this.attackCooldowns = {
            spiral: 0,
            burst: 0,
            dive: 0,
            rebirth: 0
        };
    }
    
    onPhaseTransition(oldPhase, newPhase) {
        if (newPhase === 4 && !this.hasResurrected) {
            this.hasResurrected = true;
            this.health = this.maxHealth * 0.5;
            
            this.particleSystem.emitBurst(
                this.x + this.width / 2,
                this.y + this.height / 2,
                '#ff8800', 50, 15, 120
            );
            
            if (window.bossScreenShake) {
                window.bossScreenShake.start(30, 20);
            }
            
            window.bossAudio.playBossDefeat();
        }
    }
    
    movement() {
        if (this.phase < 4) {
            const move = MovementPatterns.sineWave(this, 50, 25, 0.001, 0.0015);
            this.x += move.dx * 0.1;
            this.y += move.dy * 0.1;
        } else {
            const move = MovementPatterns.chase(this, 2, 0.3);
            this.x += move.dx;
            this.y += move.dy;
        }
        
        this.x = Math.max(50, Math.min(this.canvasWidth - this.width - 50, this.x));
        this.y = Math.max(50, Math.min(180, this.y));
    }
    
    runAttacks() {
        if (this.currentStage) {
            this.currentStage.tickCooldowns();
        }
        
        const cooldowns = { ...this.attackCooldowns };
        this.updateAttackCooldowns(cooldowns);
        this.attackCooldowns = cooldowns;
        
        this.checkStageTransition();
        
        if (!this.game || !this.game.player) return;
        const player = this.game.player;
        const px = player.x + (player.width || 30) / 2;
        const py = player.y + (player.height || 30) / 2;
        
        if (this.phase === 1) {
            if (this.attackCooldowns.spiral <= 0) {
                this.fireSpiral();
                this.attackCooldowns.spiral = 100;
            }
            
            if (this.attackCooldowns.burst <= 0) {
                this.flameBurst();
                this.attackCooldowns.burst = 120;
            }
        }
        
        if (this.phase === 2) {
            if (this.attackCooldowns.spiral <= 0) {
                this.fireSpiral();
                this.attackCooldowns.spiral = 80;
            }
            
            if (this.attackCooldowns.burst <= 0) {
                this.flameBurst();
                this.flameBurst();
                this.attackCooldowns.burst = 90;
            }
            
            if (this.attackCooldowns.dive <= 0) {
                this.phoenixDive(px, py);
                this.attackCooldowns.dive = 150;
            }
        }
        
        if (this.phase === 3) {
            if (this.attackCooldowns.spiral <= 0) {
                this.fireSpiral();
                this.fireSpiral();
                this.attackCooldowns.spiral = 60;
            }
            
            if (this.attackCooldowns.burst <= 0) {
                AttackPatterns.ring(this, 2, 10, 5, 12);
                this.attackCooldowns.burst = 80;
            }
            
            if (this.attackCooldowns.dive <= 0) {
                this.phoenixDive(px, py);
                this.phoenixDive(px + 50, py + 50);
                this.attackCooldowns.dive = 120;
            }
        }
        
        if (this.phase === 4) {
            if (this.attackCooldowns.spiral <= 0) {
                this.fireSpiral();
                this.fireSpiral();
                this.fireSpiral();
                this.attackCooldowns.spiral = 40;
            }
            
            if (this.attackCooldowns.burst <= 0) {
                AttackPatterns.ring(this, 3, 12, 6, 15);
                this.attackCooldowns.burst = 60;
            }
            
            if (this.attackCooldowns.dive <= 0) {
                this.phoenixDive(px, py);
                this.phoenixDive(px + 30, py - 30);
                this.phoenixDive(px - 30, py + 30);
                this.attackCooldowns.dive = 80;
            }
        }
    }
    
    fireSpiral() {
        AttackPatterns.spiral(this, 12, 4, 10, 8);
        window.bossAudio.playShoot();
    }
    
    flameBurst() {
        AttackPatterns.randomBurst(this, 15, [3, 6], [8, 15]);
        window.bossAudio.playExplosion();
    }
    
    phoenixDive(targetX, targetY) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            const speed = 12;
            const steps = 8;
            
            for (let i = 0; i < steps; i++) {
                setTimeout(() => {
                    this.x += (dx / dist) * speed;
                    this.y += (dy / dist) * speed;
                    
                    this.x = Math.max(50, Math.min(this.canvasWidth - this.width - 50, this.x));
                    this.y = Math.max(50, Math.min(250, this.y));
                    
                    this.particleSystem.emitBurst(
                        this.x + this.width / 2,
                        this.y + this.height / 2,
                        '#ff4400', 5, 6, 20
                    );
                }, i * 40);
            }
        }
        
        window.bossAudio.playExplosion();
    }
    
    draw(ctx) {
        this.particleSystem.draw(ctx);
        
        ctx.save();
        
        const pulse = 1 + 0.25 * Math.sin(this.time * 0.15);
        
        const gradient = ctx.createRadialGradient(
            this.x + this.width / 2, this.y + this.height / 2, 0,
            this.x + this.width / 2, this.y + this.height / 2, this.width * pulse
        );
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, this.color);
        gradient.addColorStop(0.6, '#ff2200');
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width * pulse, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x + this.width, this.y + this.height / 2);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height);
        ctx.lineTo(this.x, this.y + this.height / 2);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#ffff00';
        const wingAngle = Math.sin(this.time * 0.1) * 0.3;
        
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(-wingAngle);
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(-40, -20);
        ctx.lineTo(-30, 0);
        ctx.lineTo(-40, 20);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(wingAngle);
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(40, -20);
        ctx.lineTo(30, 0);
        ctx.lineTo(40, 20);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2 - 12, this.y + this.height / 2 - 5, 6, 0, Math.PI * 2);
        ctx.arc(this.x + this.width / 2 + 12, this.y + this.height / 2 - 5, 6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        
        this.effects.forEach(e => e.draw(ctx));
        this.projectiles.forEach(p => p.draw(ctx));
    }
}

window.ImmortalPhoenix = ImmortalPhoenix;