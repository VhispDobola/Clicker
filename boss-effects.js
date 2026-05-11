// ========================
// EFFECT SYSTEM
// ========================

class Telegraph {
    constructor(x, y, duration, radius, color, damage = 0) {
        this.x = x;
        this.y = y;
        this.duration = duration;
        this.radius = radius;
        this.color = color;
        this.damage = damage;
        this.age = 0;
        this.activeStart = 0;
        this.activeEnd = duration;
        this.spaceDistortion = false;
    }
    
    update() {
        this.age++;
        return this.age < this.duration;
    }
    
    draw(ctx) {
        const progress = this.age / this.duration;
        
        if (this.age < this.activeStart) {
            const pulse = 0.5 + 0.5 * Math.sin(this.age * 0.3);
            ctx.save();
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.globalAlpha = pulse;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.stroke();
            
            if (this.spaceDistortion) {
                ctx.strokeStyle = 'rgba(128, 0, 255, 0.3)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius * 1.5, 0, Math.PI * 2);
                ctx.stroke();
            }
            
            ctx.restore();
        } else if (this.age >= this.activeStart && this.age < this.activeEnd) {
            ctx.save();
            ctx.fillStyle = this.color;
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
    
    isActive() {
        return this.age >= this.activeStart && this.age < this.activeEnd;
    }
}

class ScreenShake {
    constructor() {
        this.duration = 0;
        this.intensity = 0;
        this.x = 0;
        this.y = 0;
    }
    
    start(duration, intensity) {
        this.duration = duration;
        this.intensity = intensity;
    }
    
    update() {
        if (this.duration > 0) {
            this.x = (Math.random() - 0.5) * this.intensity;
            this.y = (Math.random() - 0.5) * this.intensity;
            this.duration--;
            this.intensity *= 0.9;
            return { x: this.x, y: this.y };
        }
        return { x: 0, y: 0 };
    }
    
    getTransform() {
        if (this.duration > 0) {
            return `translate(${this.x}px, ${this.y}px)`;
        }
        return '';
    }
}

class HazardZone {
    constructor(x, y, radius, damage, lifetime, type = 'damage') {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.damage = damage;
        this.lifetime = lifetime;
        this.maxLifetime = lifetime;
        this.type = type;
        this.pulseTimer = 0;
    }
    
    update() {
        this.lifetime--;
        this.pulseTimer++;
        return this.lifetime > 0;
    }
    
    draw(ctx) {
        const alpha = (this.lifetime / this.maxLifetime) * 0.5;
        const pulse = 1 + 0.1 * Math.sin(this.pulseTimer * 0.1);
        
        ctx.save();
        
        if (this.type === 'slow') {
            ctx.fillStyle = `rgba(68, 136, 255, ${alpha})`;
            ctx.strokeStyle = '#88bbff';
        } else if (this.type === 'pull') {
            ctx.fillStyle = `rgba(128, 0, 255, ${alpha})`;
            ctx.strokeStyle = '#aa44ff';
        } else {
            ctx.fillStyle = `rgba(255, 68, 0, ${alpha})`;
            ctx.strokeStyle = '#ff6644';
        }
        
        const drawRadius = this.radius * pulse;
        ctx.beginPath();
        ctx.arc(this.x, this.y, drawRadius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, drawRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }
    
    checkCollision(player) {
        const px = player.x + (player.width || 30) / 2;
        const py = player.y + (player.height || 30) / 2;
        const dist = Math.sqrt((this.x - px) ** 2 + (this.y - py) ** 2);
        
        if (dist < this.radius + (player.width || 30) / 2) {
            return this.type === 'slow' ? this.damage * 0.3 : this.damage;
        }
        return 0;
    }
    
    applyPull(player, strength = 1) {
        if (this.type === 'pull') {
            const px = player.x + (player.width || 30) / 2;
            const py = player.y + (player.height || 30) / 2;
            const dx = this.x - px;
            const dy = this.y - py;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 0) {
                player.x += (dx / dist) * strength;
                player.y += (dy / dist) * strength;
            }
        }
    }
}

const bossScreenShake = new ScreenShake();
window.Telegraph = Telegraph;
window.ScreenShake = ScreenShake;
window.HazardZone = HazardZone;
window.bossScreenShake = bossScreenShake;