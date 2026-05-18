// ========================
// MULTI-STAGE BOSS BASE CLASS
// ========================

class BossStage {
    constructor(name, health, color, introText) {
        this.name = name;
        this.health = health;
        this.color = color;
        this.introText = introText;
        this.attackCooldown = 0;
    }
    
    getIntroDialogue() {
        return this.introText;
    }
    
    runAttacks(boss) {
        // Override in subclass
    }
    
    tickCooldowns() {
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
        }
    }
    
    canAttack() {
        return this.attackCooldown <= 0;
    }
}

class BossBase {
    constructor(name, health, color, phases = 1) {
        this.name = name;
        this.maxHealth = health;
        this.health = health;
        this.color = color;
        this.phases = phases;
        this.phase = 1;
        
        this.x = 0;
        this.y = 0;
        this.width = 100;
        this.height = 100;
        
        this.projectiles = [];
        this.effects = [];
        this.arenaHazards = [];
        
        this.time = 0;
        
        this.canvasWidth = 1000;
        this.canvasHeight = 700;
        
        this.introTimer = 180;
        this.showingIntro = true;
        
        this.particleSystem = new ParticleSystem();
        
        this.attackCooldowns = {};
        this.initAttackCooldowns();
    }
    
    initAttackCooldowns() {
        this.attackCooldowns = {};
    }
    
    updateAttackCooldowns(cooldowns) {
        if (!this.attackCooldowns) this.attackCooldowns = {};
        
        for (let key in cooldowns) {
            if (this.attackCooldowns[key] !== undefined && this.attackCooldowns[key] > 0) {
                this.attackCooldowns[key]--;
            }
            cooldowns[key] = this.attackCooldowns[key] || 0;
        }
    }
    
    setCooldown(name, value) {
        if (!this.attackCooldowns) this.attackCooldowns = {};
        this.attackCooldowns[name] = value;
    }
    
    checkPhaseTransition() {
        if (this.phases > 1) {
            const healthPercent = this.health / this.maxHealth;
            
            if (this.phase === 1 && healthPercent <= 0.75) {
                this.transitionToPhase(2);
            } else if (this.phase === 2 && healthPercent <= 0.50) {
                this.transitionToPhase(3);
            } else if (this.phase === 3 && healthPercent <= 0.25) {
                this.transitionToPhase(4);
            }
        }
    }
    
    transitionToPhase(newPhase) {
        const oldPhase = this.phase;
        this.phase = newPhase;
        
        this.particleSystem.emitBurst(
            this.x + this.width / 2,
            this.y + this.height / 2,
            this.color, 30, 10, 90
        );
        
        if (window.bossScreenShake) {
            window.bossScreenShake.start(15, 10);
        }
        
        this.onPhaseTransition(oldPhase, newPhase);
    }
    
    onPhaseTransition(oldPhase, newPhase) {
        // Override in subclass
    }
    
    runAttacks() {
        // Override in subclass
    }
    
    movement() {
        // Override in subclass
    }
    
    update() {
        this.time++;
        
        if (!this.canvasWidth || !this.canvasHeight) {
            this.canvasWidth = 1000;
            this.canvasHeight = 700;
        }
        
        this.projectiles = this.projectiles.filter(p => 
            p.update && p.update(this.canvasWidth, this.canvasHeight)
        );
        
        this.effects = this.effects.filter(e => e.update && e.update());
        
        this.arenaHazards = this.arenaHazards.filter(h => h.update && h.update());
        
        if (this.particleSystem && this.particleSystem.update) {
            this.particleSystem.update();
        }
        
        this.checkPhaseTransition();
        
        try {
            this.movement();
        } catch (e) {
            console.warn('Boss movement error:', e);
        }
        
        try {
            this.runAttacks();
        } catch (e) {
            console.warn('Boss attacks error:', e);
        }
    }
    
    draw(ctx) {
        this.particleSystem.draw(ctx);
        
        this.effects.forEach(e => e.draw(ctx));
        
        this.projectiles.forEach(p => p.draw(ctx));
        
        this.arenaHazards.forEach(h => h.draw(ctx));
    }
    
    drawIntro(ctx, width, height) {
        if (this.showingIntro && this.introTimer > 0) {
            ctx.save();
            ctx.font = '36px Orbitron, sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            
            const text = this.name;
            const textWidth = ctx.measureText(text).width;
            
            ctx.fillStyle = '#000000';
            ctx.fillRect(width / 2 - textWidth / 2 - 20, height / 2 - 20, textWidth + 40, 40);
            
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 3;
            ctx.strokeRect(width / 2 - textWidth / 2 - 20, height / 2 - 20, textWidth + 40, 40);
            
            ctx.fillStyle = '#ffffff';
            ctx.fillText(text, width / 2, height / 2 + 10);
            
            ctx.restore();
            
            this.introTimer--;
            
            if (this.introTimer <= 0) {
                this.showingIntro = false;
            }
        }
    }
    
    takeDamage(damage) {
        this.health -= damage;
        
        this.particleSystem.emit(
            this.x + this.width / 2,
            this.y + this.height / 2,
            (Math.random() - 0.5) * 5,
            (Math.random() - 0.5) * 5,
            '#ffffff', 5, 30, 3
        );
        
        return this.health <= 0;
    }
    
    isDead() {
        return this.health <= 0;
    }
    
    getHealthPercent() {
        return this.health / this.maxHealth;
    }
}

class MultiStageBoss extends BossBase {
    constructor(stages, name) {
        super(name, stages[0].health, stages[0].color, stages.length);
        this.stages = stages;
        this.currentStageIndex = 0;
        this.currentStage = stages[0];
        this.maxHealth = stages[0].health;
        this.health = this.maxHealth;
        
        this.transitionEffects = [];
    }
    
    transitionToStage(stageIndex) {
        const oldHealthPercent = this.health / this.maxHealth;
        
        this.currentStageIndex = stageIndex;
        this.currentStage = this.stages[stageIndex];
        this.maxHealth = this.currentStage.health;
        this.color = this.currentStage.color;
        
        if (stageIndex > 0) {
            this.health = Math.max(this.maxHealth * 0.8, this.maxHealth * oldHealthPercent);
        } else {
            this.health = this.maxHealth;
        }
        
        this.phase = stageIndex + 1;
        
        for (let i = 0; i < 30; i++) {
            this.transitionEffects.push({
                x: this.x + this.width / 2 + (Math.random() - 0.5) * 40,
                y: this.y + this.height / 2 + (Math.random() - 0.5) * 40,
                vx: (Math.random() - 0.5) * 20,
                vy: (Math.random() - 0.5) * 20,
                lifetime: 90,
                color: this.currentStage.color
            });
        }
        
        if (window.bossScreenShake) {
            window.bossScreenShake.start(15, 10);
        }
        
        this.currentStage.attackCooldown = Math.max(this.currentStage.attackCooldown, 60);
    }
    
    checkStageTransition() {
        if (this.currentStageIndex < this.stages.length - 1) {
            const healthPercent = this.health / this.maxHealth;
            
            if (this.currentStageIndex === 0 && healthPercent <= 0.75) {
                this.transitionToStage(1);
            } else if (this.currentStageIndex === 1 && healthPercent <= 0.50) {
                this.transitionToStage(2);
            } else if (this.currentStageIndex === 2 && healthPercent <= 0.25) {
                this.transitionToStage(3);
            }
        }
    }
    
    runAttacks() {
        if (this.currentStage) {
            this.currentStage.tickCooldowns();
            this.currentStage.runAttacks(this);
        }
        
        this.checkStageTransition();
        
        this.transitionEffects = this.transitionEffects.filter(e => {
            e.x += e.vx;
            e.y += e.vy;
            e.lifetime--;
            return e.lifetime > 0;
        });
    }
    
    draw(ctx) {
        this.transitionEffects.forEach(effect => {
            const alpha = effect.lifetime / 60;
            const r = parseInt(this.currentStage.color.slice(1,3), 16);
            const g = parseInt(this.currentStage.color.slice(3,5), 16);
            const b = parseInt(this.currentStage.color.slice(5,7), 16);
            ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, 5, 0, Math.PI * 2);
            ctx.fill();
        });
        
        super.draw(ctx);
    }
}

window.BossStage = BossStage;
window.BossBase = BossBase;
window.MultiStageBoss = MultiStageBoss;