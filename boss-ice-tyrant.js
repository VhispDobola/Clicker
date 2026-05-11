// ========================
// ICE TYRANT BOSS
// ========================

class IceTyrant extends BossBase {
    constructor() {
        super('Ice Tyrant', 700, '#88ddff', 3);
        this.width = 130;
        this.height = 130;
        
        this.iceShards = [];
        this.frozenZones = [];
        
        this.initAttackCooldowns = () => {
            this.attackCooldowns = {
                shard: 0,
                freeze: 0,
                beam: 0,
                wall: 0
            };
        };
        this.initAttackCooldowns();
    }
    
    initAttackCooldowns() {
        this.attackCooldowns = { shard: 0, freeze: 0, beam: 0, wall: 0 };
    }
    
    movement() {
        const move = MovementPatterns.horizontalOscillate(this, 80, 1.5);
        this.x += move.dx * 0.1;
        
        this.x = Math.max(50, Math.min(this.canvasWidth - this.width - 50, this.x));
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
            if (this.attackCooldowns.shard <= 0) {
                AttackPatterns.spiral(this, 8, 4, 8, 6);
                this.attackCooldowns.shard = 80;
            }
            if (this.attackCooldowns.freeze <= 0) {
                const zone = new HazardZone(px, py, 60, 5, 180, 'slow');
                this.arenaHazards.push(zone);
                this.attackCooldowns.freeze = 150;
            }
        }
        
        if (this.phase === 2) {
            if (this.attackCooldowns.shard <= 0) {
                AttackPatterns.spiral(this, 12, 5, 10, 6);
                this.attackCooldowns.shard = 60;
            }
            if (this.attackCooldowns.beam <= 0) {
                AttackPatterns.cross(this, 8, 15);
                this.attackCooldowns.beam = 100;
            }
            if (this.attackCooldowns.freeze <= 0) {
                for (let i = 0; i < 3; i++) {
                    const zone = new HazardZone(200 + i * 250, 150, 50, 6, 150, 'slow');
                    this.arenaHazards.push(zone);
                }
                this.attackCooldowns.freeze = 120;
            }
        }
        
        if (this.phase === 3) {
            if (this.attackCooldowns.shard <= 0) {
                AttackPatterns.ring(this, 2, 10, 6, 12);
                this.attackCooldowns.shard = 40;
            }
            if (this.attackCooldowns.beam <= 0) {
                AttackPatterns.cross(this, 10, 20);
                this.attackCooldowns.beam = 80;
            }
            if (this.attackCooldowns.wall <= 0) {
                for (let i = 0; i < 4; i++) {
                    const zone = new HazardZone(100 + i * 250, 200, 40, 3, 200, 'damage');
                    this.arenaHazards.push(zone);
                }
                this.attackCooldowns.wall = 150;
            }
        }
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
        ctx.moveTo(this.x + this.width/2, this.y);
        ctx.lineTo(this.x + this.width, this.y + this.height/2);
        ctx.lineTo(this.x + this.width/2, this.y + this.height);
        ctx.lineTo(this.x, this.y + this.height/2);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x + this.width/2 - 15, this.y + this.height/2 - 10, 8, 0, Math.PI * 2);
        ctx.arc(this.x + this.width/2 + 15, this.y + this.height/2 - 10, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        this.effects.forEach(e => e.draw(ctx));
        this.projectiles.forEach(p => p.draw(ctx));
    }
}

window.IceTyrant = IceTyrant;