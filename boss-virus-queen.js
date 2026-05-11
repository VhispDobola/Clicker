// ========================
// VIRUS QUEEN BOSS
// ========================

class InfectionZone {
    constructor(x, y, radius = 60) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.lifetime = 180;
        this.infectionLevel = 0;
        this.particles = [];
        
        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * radius;
            this.particles.push(new Particle(
                x + Math.cos(angle) * distance,
                y + Math.sin(angle) * distance,
                0, 0, 'rgb(255, 0, 255)', 120, 3
            ));
        }
    }
    
    update() {
        this.lifetime--;
        this.infectionLevel++;
        
        this.particles = this.particles.filter(p => p.update());
        
        return this.lifetime > 0;
    }
    
    draw(ctx) {
        const alpha = 128 + 127 * Math.sin(Date.now() * 0.01);
        
        ctx.save();
        ctx.fillStyle = `rgba(255, 0, 255, ${alpha / 255})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = `rgba(255, 100, 255, ${alpha / 255 * 0.8})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        this.particles.forEach(p => p.draw(ctx));
        
        ctx.restore();
    }
    
    checkCollision(player) {
        const px = player.x + (player.width || 30) / 2;
        const py = player.y + (player.height || 30) / 2;
        const dist = Math.sqrt((this.x - px) ** 2 + (this.y - py) ** 2);
        
        if (dist < this.radius + (player.width || 30) / 2) {
            return 5;
        }
        return 0;
    }
}

class VirusSpore {
    constructor(x, y, targetX, targetY) {
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.speed = 3.0;
        this.lifetime = 240;
        this.size = 6;
        this.color = 'rgb(255, 100, 255)';
        this.trail = [];
    }
    
    update(playerX, playerY) {
        this.lifetime--;
        this.targetX = playerX;
        this.targetY = playerY;
        
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
        }
        
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 10) this.trail.shift();
        
        return this.lifetime > 0;
    }
    
    draw(ctx) {
        for (let i = 0; i < this.trail.length; i++) {
            const alpha = Math.floor(255 * (i / this.trail.length));
            ctx.fillStyle = `rgba(255, 100, 255, ${alpha / 255})`;
            ctx.beginPath();
            ctx.arc(this.trail[i].x, this.trail[i].y, Math.max(1, this.size - i / 2), 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.stroke();
    }
}

class BioOrganicShield {
    constructor(bossX, bossY) {
        this.bossX = bossX;
        this.bossY = bossY;
        this.radius = 80;
        this.health = 100;
        this.maxHealth = 100;
        this.regenerationRate = 0.5;
        this.active = true;
        this.pulseTimer = 0;
    }
    
    update(bossX, bossY) {
        this.bossX = bossX;
        this.bossY = bossY;
        this.pulseTimer++;
        
        if (this.health < this.maxHealth) {
            this.health += this.regenerationRate;
        }
        
        return this.health > 0;
    }
    
    takeDamage(damage) {
        this.health -= damage;
        return this.health <= 0;
    }
    
    draw(ctx) {
        const pulse = 1 + 0.2 * Math.sin(this.pulseTimer * 0.1);
        const drawRadius = this.radius * pulse;
        
        const centerX = this.bossX + 70;
        const centerY = this.bossY + 70;
        
        ctx.save();
        
        ctx.fillStyle = 'rgba(100, 255, 100, 0.3)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, drawRadius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, drawRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        const barWidth = 60;
        const barHeight = 6;
        const healthPercent = this.health / this.maxHealth;
        
        ctx.fillStyle = '#333333';
        ctx.fillRect(centerX - 30, centerY - 100, barWidth, barHeight);
        
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(centerX - 30, centerY - 100, barWidth * healthPercent, barHeight);
        
        ctx.restore();
    }
}

class VirusQueenStage extends BossStage {
    constructor(name, health, color, introText, mutationType) {
        super(name, health, color, introText);
        this.mutationType = mutationType;
    }
    
    getIntroDialogue() {
        return this.introText;
    }
}

class VirusQueen extends MultiStageBoss {
    constructor() {
        const stages = [
            new VirusQueenStage('Viral Awakening', 250, '#ff00ff', 'The infection spreads...', 'spread'),
            new VirusQueenStage('Mutation', 250, '#ff0088', 'I evolve... adapt... consume!', 'aggressive'),
            new VirusQueenStage('Bio-Plague', 250, '#8800ff', 'Nothing can stop the swarm!', 'swarm'),
            new VirusQueenStage('Total Infection', 250, '#ff0000', 'PERFECTION IS AT HAND!', 'overwhelming')
        ];
        
        super(stages, 'The Virus Queen');
        
        this.infectionZones = [];
        this.virusSpores = [];
        this.bioShield = null;
        this.sporeTimer = 0;
        this.infectionTimer = 0;
        this.mutationActive = false;
        
        this.initAttackCooldowns = () => {
            this.attackCooldowns = {
                spore: 0,
                infection: 0,
                shield: 0,
                burst: 0
            };
        };
        this.initAttackCooldowns();
    }
    
    initAttackCooldowns() {
        this.attackCooldowns = {
            spore: 0,
            infection: 0,
            shield: 0,
            burst: 0
        };
    }
    
    onPhaseTransition(oldPhase, newPhase) {
        this.mutationActive = true;
        
        window.bossAudio.playExplosion();
        
        if (newPhase === 4 && !this.bioShield) {
            this.bioShield = new BioOrganicShield(this.x, this.y);
        }
        
        AttackPatterns.randomBurst(this, 15, [4, 8], [10, 20]);
    }
    
    movement() {
        const move = MovementPatterns.hover(this, 100, 1);
        this.x += move.dx;
        this.y += move.dy;
        
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
            if (this.attackCooldowns.spore <= 0) {
                this.spawnVirusSpore(px, py);
                this.attackCooldowns.spore = 60;
            }
            
            if (this.attackCooldowns.infection <= 0) {
                this.createInfectionZone(px, py);
                this.attackCooldowns.infection = 180;
            }
        }
        
        if (this.phase === 2) {
            if (this.attackCooldowns.spore <= 0) {
                this.spawnVirusSpore(px, py);
                this.spawnVirusSpore(px, py);
                this.attackCooldowns.spore = 40;
            }
            
            if (this.attackCooldowns.infection <= 0) {
                this.createInfectionZone(px, py);
                this.createInfectionZone(px + 100, py - 50);
                this.attackCooldowns.infection = 150;
            }
            
            if (this.attackCooldowns.burst <= 0) {
                AttackPatterns.ring(this, 2, 8, 4, 8);
                this.attackCooldowns.burst = 120;
            }
        }
        
        if (this.phase === 3) {
            if (this.attackCooldowns.spore <= 0) {
                for (let i = 0; i < 3; i++) {
                    this.spawnVirusSpore(px + (Math.random() - 0.5) * 100, py + (Math.random() - 0.5) * 100);
                }
                this.attackCooldowns.spore = 30;
            }
            
            if (this.attackCooldowns.infection <= 0) {
                for (let i = 0; i < 3; i++) {
                    this.createInfectionZone(
                        100 + Math.random() * (this.canvasWidth - 200),
                        100 + Math.random() * 200
                    );
                }
                this.attackCooldowns.infection = 120;
            }
            
            if (this.attackCooldowns.burst <= 0) {
                AttackPatterns.spiral(this, 12, 5, 10, 8);
                this.attackCooldowns.burst = 90;
            }
        }
        
        if (this.phase === 4) {
            if (this.attackCooldowns.spore <= 0) {
                for (let i = 0; i < 5; i++) {
                    this.spawnVirusSpore(px + (Math.random() - 0.5) * 150, py + (Math.random() - 0.5) * 150);
                }
                this.attackCooldowns.spore = 20;
            }
            
            if (this.attackCooldowns.burst <= 0) {
                AttackPatterns.ring(this, 3, 12, 6, 12);
                this.attackCooldowns.burst = 60;
            }
            
            if (this.bioShield) {
                this.bioShield.update(this.x, this.y);
                
                if (this.bioShield.health <= 0) {
                    this.bioShield = new BioOrganicShield(this.x, this.y);
                }
            }
        }
        
        this.infectionZones = this.infectionZones.filter(z => z.update());
        this.virusSpores = this.virusSpores.filter(s => s.update(px, py));
    }
    
    spawnVirusSpore(targetX, targetY) {
        const spore = new VirusSpore(
            this.x + this.width / 2,
            this.y + this.height / 2,
            targetX, targetY
        );
        this.virusSpores.push(spore);
        
        window.bossAudio.playShoot();
    }
    
    createInfectionZone(x, y) {
        const zone = new InfectionZone(x, y, 60);
        this.infectionZones.push(zone);
        
        const telegraph = new Telegraph(x, y, 180, 60, '#ff00ff', 5);
        telegraph.activeStart = 30;
        this.effects.push(telegraph);
    }
    
    takeDamage(damage) {
        if (this.bioShield && this.bioShield.active && this.bioShield.health > 0) {
            this.bioShield.takeDamage(damage);
            window.bossAudio.playShield();
            return false;
        }
        
        return super.takeDamage(damage);
    }
    
    draw(ctx) {
        this.infectionZones.forEach(z => z.draw(ctx));
        
        this.virusSpores.forEach(s => s.draw(ctx));
        
        if (this.bioShield) {
            this.bioShield.draw(ctx);
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
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#00ff00';
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 / 6) * i + this.time * 0.02;
            const x = this.x + this.width / 2 + Math.cos(angle) * 25;
            const y = this.y + this.height / 2 + Math.sin(angle) * 25;
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
        
        this.effects.forEach(e => e.draw(ctx));
        this.projectiles.forEach(p => p.draw(ctx));
    }
}

window.VirusQueen = VirusQueen;