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
        
        this.initAttackCooldowns = () => {
            this.attackCooldowns = { ring: 0, slash: 0, charge: 0, mirror: 0 };
        };
        this.initAttackCooldowns();
    }
    
    initAttackCooldowns() {
        this.attackCooldowns = { ring: 0, slash: 0, charge: 0, mirror: 0 };
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
        }
        
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
    
    draw(ctx) {
        this.mirrorClones.forEach(c => c.draw(ctx));
        
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

// ========================
// CYBER OVERLORD BOSS
// ========================

class DroneSwarm {
    constructor(x, y, swarmType = 'attack') {
        this.x = x;
        this.y = y;
        this.swarmType = swarmType;
        this.drones = [];
        this.lifetime = 300;
        this.adaptationLevel = 0;
        
        for (let i = 0; i < 6; i++) {
            this.createDrone();
        }
    }
    
    createDrone() {
        this.drones.push({
            x: this.x + (Math.random() - 0.5) * 60,
            y: this.y + (Math.random() - 0.5) * 60,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            health: 20,
            lifespan: 180
        });
    }
    
    update(playerX, playerY, bossX, bossY) {
        this.lifetime--;
        
        this.drones = this.drones.filter(drone => {
            drone.lifespan--;
            
            if (this.swarmType === 'attack') {
                const dx = playerX - drone.x;
                const dy = playerY - drone.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 0 && dist > 30) {
                    drone.x += (dx / dist) * 3;
                    drone.y += (dy / dist) * 3;
                }
            } else if (this.swarmType === 'defend') {
                const dx = bossX - drone.x;
                const dy = bossY - drone.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 60 && dist < 150) {
                    drone.x += (dx / dist) * 2;
                    drone.y += (dy / dist) * 2;
                } else if (dist <= 60) {
                    drone.x -= (dx / dist) * 1;
                    drone.y -= (dy / dist) * 1;
                }
            }
            
            return drone.lifespan > 0;
        });
        
        if (this.drones.length < 4 && Math.random() < 0.1) {
            this.createDrone();
        }
        
        return this.lifetime > 0;
    }
    
    draw(ctx) {
        const colors = { attack: 'rgb(255, 0, 0)', defend: 'rgb(0, 255, 0)', scout: 'rgb(0, 0, 255)' };
        
        this.drones.forEach(drone => {
            ctx.fillStyle = colors[this.swarmType];
            ctx.beginPath();
            ctx.arc(drone.x, drone.y, 8, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = colors[this.swarmType];
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(drone.x, drone.y, 12, 0, Math.PI * 2);
            ctx.stroke();
        });
    }
}

class CyberOverlord extends BossBase {
    constructor() {
        super('Cyber Overlord', 900, '#00ff00', 3);
        this.width = 130;
        this.height = 130;
        
        this.droneSwarms = [];
        this.firewallTimer = 0;
        
        this.initAttackCooldowns = () => {
            this.attackCooldowns = { drone: 0, firewall: 0, corruption: 0, crash: 0 };
        };
        this.initAttackCooldowns();
    }
    
    initAttackCooldowns() {
        this.attackCooldowns = { drone: 0, firewall: 0, corruption: 0, crash: 0 };
    }
    
    movement() {
        const move = MovementPatterns.chase(this, 1, 0.2);
        this.x += move.dx;
        this.y += move.dy;
        
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
            if (this.attackCooldowns.drone <= 0) {
                this.spawnDroneSwarm('attack');
                this.attackCooldowns.drone = 180;
            }
            if (this.attackCooldowns.corruption <= 0) {
                this.dataCorruption(px, py);
                this.attackCooldowns.corruption = 150;
            }
        }
        
        if (this.phase === 2) {
            if (this.attackCooldowns.drone <= 0) {
                this.spawnDroneSwarm('attack');
                this.spawnDroneSwarm('defend');
                this.attackCooldowns.drone = 120;
            }
            if (this.attackCooldowns.firewall <= 0) {
                this.firewallAttack();
                this.attackCooldowns.firewall = 150;
            }
            if (this.attackCooldowns.corruption <= 0) {
                this.dataCorruption(px, py);
                this.dataCorruption(px + 50, py - 50);
                this.attackCooldowns.corruption = 100;
            }
        }
        
        if (this.phase === 3) {
            if (this.attackCooldowns.crash <= 0) {
                this.systemCrash();
                this.attackCooldowns.crash = 200;
            }
            if (this.attackCooldowns.drone <= 0) {
                this.spawnDroneSwarm('attack');
                this.spawnDroneSwarm('scout');
                this.attackCooldowns.drone = 80;
            }
            if (this.attackCooldowns.corruption <= 0) {
                for (let i = 0; i < 5; i++) {
                    this.dataCorruption(100 + Math.random() * (this.canvasWidth - 200), 100 + Math.random() * 200);
                }
                this.attackCooldowns.corruption = 80;
            }
        }
        
        this.droneSwarms = this.droneSwarms.filter(s => s.update(px, py, this.x + this.width/2, this.y + this.height/2));
    }
    
    spawnDroneSwarm(type) {
        const swarm = new DroneSwarm(
            50 + Math.random() * (this.canvasWidth - 100),
            50 + Math.random() * 150,
            type
        );
        this.droneSwarms.push(swarm);
        window.bossAudio.playAbility();
    }
    
    dataCorruption(targetX, targetY) {
        const proj = new Projectile(targetX, targetY - 30, 0, 6, 12, '#00ff00', 10, ProjectileBehavior.GLITCH);
        this.projectiles.push(proj);
    }
    
    firewallAttack() {
        for (let i = 0; i < 4; i++) {
            const x = 100 + i * 250;
            const zone = new HazardZone(x, 250, 25, 8, 200, 'damage');
            this.arenaHazards.push(zone);
        }
    }
    
    systemCrash() {
        AttackPatterns.ring(this, 2, 16, 6, 15);
        
        for (let i = 0; i < 8; i++) {
            const proj = new Projectile(
                this.x + this.width/2,
                this.y + this.height/2,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10,
                20, '#00ff00', 12, ProjectileBehavior.GLITCH
            );
            this.projectiles.push(proj);
        }
        
        if (window.bossScreenShake) {
            window.bossScreenShake.start(25, 15);
        }
        
        window.bossAudio.playExplosion();
    }
    
    draw(ctx) {
        this.droneSwarms.forEach(s => s.draw(ctx));
        
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
        
        ctx.fillStyle = '#001100';
        ctx.fillRect(this.x + 20, this.y + 20, this.width - 40, this.height - 40);
        
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x + 30, this.y + 30, this.width - 60, this.height - 60);
        
        ctx.fillStyle = '#00ff00';
        for (let i = 0; i < 8; i++) {
            const lineY = this.y + 40 + i * 10;
            ctx.fillRect(this.x + 35, lineY, this.width - 70, 4);
        }
        
        ctx.fillStyle = '#ffffff';
        const scanline = Math.sin(Date.now() * 0.01) > 0;
        if (scanline) {
            ctx.fillRect(this.x + 30, this.y + 30, this.width - 60, 2);
        }
        
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.arc(this.x + this.width/2 - 15, this.y + this.height/2 - 10, 8, 0, Math.PI * 2);
        ctx.arc(this.x + this.width/2 + 15, this.y + this.height/2 - 10, 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        this.effects.forEach(e => e.draw(ctx));
        this.projectiles.forEach(p => p.draw(ctx));
    }
}

window.CyberOverlord = CyberOverlord;