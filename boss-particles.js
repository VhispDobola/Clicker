// ========================
// PARTICLE SYSTEM
// ========================

class Particle {
    constructor(x, y, vx, vy, color, lifetime, size = 3, 
                gravity = 0, friction = 0.95, fadeOut = true, shape = 'circle') {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.lifetime = lifetime;
        this.maxLifetime = lifetime;
        this.size = size;
        this.gravity = gravity;
        this.friction = friction;
        this.fadeOut = fadeOut;
        this.shape = shape;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 10;
        this.trail = [];
        this.trailLength = 5;
    }
    
    update() {
        this.vy += this.gravity;
        this.vx *= this.friction;
        this.vy *= this.friction;
        
        this.x += this.vx;
        this.y += this.vy;
        
        this.rotation += this.rotationSpeed;
        
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.trailLength) {
            this.trail.shift();
        }
        
        this.lifetime--;
        
        return this.lifetime > 0;
    }
    
    draw(ctx) {
        if (this.lifetime <= 0) return;
        
        let alpha = 255;
        if (this.fadeOut) {
            alpha = Math.floor(255 * (this.lifetime / this.maxLifetime));
        }
        
        ctx.fillStyle = this.color;
        ctx.globalAlpha = alpha / 255;
        
        for (let i = 0; i < this.trail.length; i++) {
            const trailAlpha = Math.floor(alpha * (i / this.trail.length));
            ctx.globalAlpha = trailAlpha / 255;
            ctx.beginPath();
            ctx.arc(this.trail[i].x, this.trail[i].y, Math.max(1, this.size / 2), 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.globalAlpha = alpha / 255;
        
        if (this.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.shape === 'square') {
            ctx.fillRect(this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
        } else if (this.shape === 'spark') {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let i = 0; i < 4; i++) {
                const angle = (this.rotation + i * 90) * Math.PI / 180;
                const px = this.x + Math.cos(angle) * this.size;
                const py = this.y + Math.sin(angle) * this.size;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.stroke();
        }
        
        ctx.globalAlpha = 1;
    }
}

class TimeOrb extends Particle {
    static ORB_COLORS = {
        'slow': 'rgb(120, 220, 255)',
        'fast': 'rgb(255, 170, 120)',
        'paradox': 'rgb(170, 120, 255)'
    };
    
    constructor(x, y, orbType = 'slow', lifetime = 300, size = 20) {
        const color = TimeOrb.ORB_COLORS[orbType] || 'rgb(200, 200, 255)';
        super(x, y, 0, 0, color, lifetime, size, 0, 1.0, true, 'circle');
        this.orbType = orbType;
    }
    
    draw(ctx) {
        const pulse = 1 + 0.2 * Math.sin(Date.now() * 0.01);
        const drawSize = this.size * pulse;
        
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, drawSize, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, drawSize * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
    }
    
    emit(x, y, vx, vy, color, count = 1, lifetime = 60, size = 3) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(
                x + (Math.random() - 0.5) * 10,
                y + (Math.random() - 0.5) * 10,
                vx + (Math.random() - 0.5) * 2,
                vy + (Math.random() - 0.5) * 2,
                color, lifetime, size
            ));
        }
    }
    
    emitBurst(x, y, color, count = 10, speed = 5, lifetime = 60) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = Math.random() * speed;
            this.particles.push(new Particle(
                x, y,
                Math.cos(angle) * spd,
                Math.sin(angle) * spd,
                color, lifetime, 3 + Math.random() * 3
            ));
        }
    }
    
    update() {
        this.particles = this.particles.filter(p => p.update());
    }
    
    draw(ctx) {
        this.particles.forEach(p => p.draw(ctx));
    }
    
    clear() {
        this.particles = [];
    }
}

window.Particle = Particle;
window.TimeOrb = TimeOrb;
window.ParticleSystem = ParticleSystem;