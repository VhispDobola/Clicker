// ========================
// ETERNAL GUARDIAN BOSS
// ========================

class EternalGuardian extends BossBase {
    constructor() {
        super('Eternal Guardian', 510, '#8800ff', 3);
        this.width = 200;
        this.height = 200;
        
        this.energyCorePulse = 0;
        this.dashCooldown = 0;
        this.targetX = 500;
        
        this.initAttackCooldowns = () => {
            this.attackCooldowns = { orb: 0, burst: 0, dash: 0, mega: 0 };
        };
        this.initAttackCooldowns();
    }
    
    initAttackCooldowns() {
        this.attackCooldowns = { orb: 0, burst: 0, dash: 0, mega: 0 };
    }
    
    movement() {
        if (Math.abs(this.x - this.targetX) < 5) {
            this.targetX = 50 + Math.random() * (this.canvasWidth - 100 - this.width);
        }
        const dx = this.targetX > this.x ? 2 : -2;
        this.x += dx;
        
        this.energyCorePulse = (this.energyCorePulse + 0.05) % (Math.PI * 2);
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
            if (this.attackCooldowns.orb <= 0) {
                this.cosmicOrbSweep(px, py);
                this.attackCooldowns.orb = 180;
            }
            if (this.attackCooldowns.burst <= 0) {
                this.radialBurst();
                this.attackCooldowns.burst = 120;
            }
        }
        
        if (this.phase === 2) {
            if (this.attackCooldowns.orb <= 0) {
                this.cosmicOrbSweep(px, py);
                this.attackCooldowns.orb = 140;
            }
            if (this.attackCooldowns.burst <= 0) {
                this.radialBurst();
                this.attackCooldowns.burst = 90;
            }
            if (this.attackCooldowns.dash <= 0 && Math.random() < 0.01) {
                this.dashAttack(px, py);
                this.attackCooldowns.dash = 150;
            }
        }
        
        if (this.phase === 3) {
            if (this.attackCooldowns.orb <= 0) {
                this.twinCosmicOrbSweep(px, py);
                this.attackCooldowns.orb = 100;
            }
            if (this.attackCooldowns.mega <= 0) {
                this.megaBurst();
                this.attackCooldowns.mega = 60;
            }
            if (this.attackCooldowns.dash <= 0 && Math.random() < 0.02) {
                this.dashAttack(px, py);
                this.attackCooldowns.dash = 100;
            }
        }
    }
    
    cosmicOrbSweep(targetX, targetY) {
        const bx = this.x + this.width / 2;
        const by = this.y + this.height;
        const angle = Math.atan2(targetY - by, targetX - bx);
        
        for (let i = 0; i < 8; i++) {
            const a = angle + (i - 4) * Math.PI / 16;
            const pulse = 1 + 0.3 * Math.sin(this.energyCorePulse + i * 0.5);
            const proj = new Projectile(bx, by, Math.cos(a) * 10 * pulse, Math.sin(a) * 10 * pulse, 20, '#aa44ff', 15);
            proj.crystalline = true;
            this.projectiles.push(proj);
        }
    }
    
    twinCosmicOrbSweep(targetX, targetY) {
        const bx = this.x + this.width / 2;
        const by = this.y + this.height;
        const angle = Math.atan2(targetY - by, targetX - bx);
        
        for (let offset of [-60, 60]) {
            for (let i = 0; i < 6; i++) {
                const wave = Math.sin(Date.now() * 0.005 + i * 0.5) * 20;
                const a = angle + (i - 3) * Math.PI / 12 + Math.PI * offset / 180 + wave * Math.PI / 180;
                const pulse = 1 + 0.4 * Math.sin(this.energyCorePulse + i * 0.3);
                const proj = new Projectile(bx + offset / 2, by, Math.cos(a) * 8 * pulse, Math.sin(a) * 8 * pulse, 25, '#aa44ff', 20);
                proj.crystalline = true;
                this.projectiles.push(proj);
            }
        }
    }
    
    radialBurst() {
        const bx = this.x + this.width / 2;
        const by = this.y + this.height / 2;
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            for (let r = 0; r < 3; r++) {
                const reflectAngle = angle + (r - 1) * Math.PI / 16;
                const speed = 5 + r * 1.5;
                const colors = ['#aa44ff', '#4488ff', '#ffffff'];
                const proj = new Projectile(bx, by, Math.cos(reflectAngle) * speed, Math.sin(reflectAngle) * speed, 6, colors[r % 3], 8);
                proj.crystalline = true;
                proj.dimensional = true;
                this.projectiles.push(proj);
            }
        }
    }
    
    megaBurst() {
        const bx = this.x + this.width / 2;
        const by = this.y + this.height / 2;
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 / 12) * i;
            for (let layer = 0; layer < 4; layer++) {
                const layerAngle = angle + layer * Math.PI / 24;
                const speed = 4 + layer * 1.5;
                const colors = ['#aa44ff', '#4488ff', '#44ffff', '#ffffff'];
                const proj = new Projectile(bx, by, Math.cos(layerAngle) * speed, Math.sin(layerAngle) * speed, 8, colors[layer % 4], 6);
                this.projectiles.push(proj);
            }
        }
    }
    
    dashAttack(targetX, targetY) {
        this.x = targetX - this.width / 2;
        this.y = Math.max(50, Math.min(180, targetY - 100));
        if (window.bossAudio) window.bossAudio.playTeleport();
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
        ctx.fillRect(this.x + 50, this.y + 50, this.width - 100, this.height - 100);
        
        const pulseSize = 30 + Math.sin(this.energyCorePulse) * 10;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, pulseSize, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(this.x + this.width/2 - 20, this.y + this.height/2 - 15, 10, 0, Math.PI * 2);
        ctx.arc(this.x + this.width/2 + 20, this.y + this.height/2 - 15, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        this.effects.forEach(e => e.draw(ctx));
        this.projectiles.forEach(p => p.draw(ctx));
    }
}

window.EternalGuardian = EternalGuardian;