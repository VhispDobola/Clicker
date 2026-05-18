// ========================
// PROJECTILE SYSTEM
// ========================

const ProjectileBehavior = {
    NORMAL: 'normal',
    HOMING: 'homing',
    SEEKING: 'seeking',
    REWIND: 'rewind',
    LASER: 'laser',
    DIAMOND: 'diamond',
    GLITCH: 'glitch',
    PHOENIX: 'phoenix',
    MUTATION: 'mutation',
    ANTIBODY: 'antibody',
    CHAIN: 'chain',
    PIERCING: 'piercing',
    SPIRAL: 'spiral',
    SPIRAL_REVERSE: 'spiral_reverse',
    BOUNCING: 'bouncing'
};

class Projectile {
    constructor(x, y, dx, dy, damage, color, radius = 5, behavior = null) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.damage = damage;
        this.color = color;
        this.radius = radius;
        this.behavior = behavior || ProjectileBehavior.NORMAL;
        this.lifetime = 600;
        this.age = 0;
        this.delay = 0;
        this.pierceCount = 0;
        this.maxPierce = 0;
        this.targetX = null;
        this.targetY = null;
        this.glow = true;
        this.outline = true;
        this.useCustomSprite = false;
        this.customSprite = null;
        this.spriteSize = 0;
        this.crystalline = false;
        this.dimensional = false;
        this.mirror = false;
        this.temporal = false;
        this.timePhase = 0;
        this.weaving = false;
        this.laser = false;
        this.bladeTrail = false;
        this.shadowTrail = false;
    }

    update(canvasWidth, canvasHeight) {
        if (this.delay > 0) {
            this.delay--;
            return true;
        }

        if (this.age >= this.lifetime) return false;

        this.age++;

        switch (this.behavior) {
            case ProjectileBehavior.HOMING:
                if (this.targetX !== null) {
                    this.steerToward(this.targetX, this.targetY, 5.6, 0.05, 0.18);
                }
                break;
            case ProjectileBehavior.SEEKING:
                if (this.targetX !== null) {
                    this.steerToward(this.targetX, this.targetY, 7.0, 0.08, 0.28);
                }
                break;
            case ProjectileBehavior.REWIND:
                this.dy *= -0.98;
                this.dx *= 0.98;
                break;
            case ProjectileBehavior.GLITCH:
                if (Math.random() < 0.1) {
                    this.x += (Math.random() - 0.5) * 4;
                    this.y += (Math.random() - 0.5) * 4;
                }
                break;
            case ProjectileBehavior.MUTATION:
                if (Math.random() < 0.025) {
                    this.damage = Math.min(this.damage + 1, 20);
                    this.radius = Math.min(this.radius + 1, 12);
                }
                break;
            case ProjectileBehavior.BOUNCING:
                if (this.x < 0 || this.x > canvasWidth) this.dx *= -1;
                if (this.y < 0 || this.y > canvasHeight) this.dy *= -1;
                break;
        }

        this.x += this.dx;
        this.y += this.dy;

        return this.x > -50 && this.x < canvasWidth + 50 &&
               this.y > -50 && this.y < canvasHeight + 50;
    }

    steerToward(targetX, targetY, desiredSpeed, maxTurn, accel) {
        const tx = targetX - this.x;
        const ty = targetY - this.y;
        const dist = Math.sqrt(tx * tx + ty * ty);
        if (dist <= 0) return;

        const currentSpeed = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
        let currentAngle, currentSpeedActual;

        if (currentSpeed < 0.001) {
            currentAngle = Math.atan2(ty, tx);
            currentSpeedActual = desiredSpeed || 4.0;
        } else {
            currentAngle = Math.atan2(this.dy, this.dx);
            currentSpeedActual = currentSpeed;
        }

        let targetAngle = Math.atan2(ty, tx);
        let delta = targetAngle - currentAngle;
        while (delta > Math.PI) delta -= Math.PI * 2;
        while (delta < -Math.PI) delta += Math.PI * 2;

        delta = Math.max(-maxTurn, Math.min(maxTurn, delta));
        const newAngle = currentAngle + delta;

        const targetSpeed = desiredSpeed || currentSpeedActual;
        const newSpeed = currentSpeedActual + (targetSpeed - currentSpeedActual) *
                        Math.max(0, Math.min(1, accel));

        this.dx = Math.cos(newAngle) * newSpeed;
        this.dy = Math.sin(newAngle) * newSpeed;
    }

    draw(ctx) {
        if (this.delay > 0) return;

        ctx.save();

        if (this.glow) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.color;
        }

        if (this.laser) {
            const angle = Math.atan2(this.dy, this.dx);
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.radius / 2;
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x - Math.cos(angle) * 50, this.y - Math.sin(angle) * 50);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
        
        if (this.pulseRing) {
            const progress = this.age / this.lifetime;
            const ringSize = this.radius * (1 - progress);
            const alpha = 1 - progress;
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 4;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(this.x, this.y, ringSize, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
            return;
        }
        
        if (this.bladeTrail) {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x - this.dx * 3, this.y - this.dy * 3);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }

        if (this.crystalline) {
            const pulse = 1 + 0.3 * Math.sin(Date.now() * 0.005);
            const size = this.radius * pulse;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y - size);
            ctx.lineTo(this.x + size * 0.866, this.y + size * 0.5);
            ctx.lineTo(this.x - size * 0.866, this.y + size * 0.5);
            ctx.closePath();
            ctx.fill();
        } else {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        if (this.outline) {
            ctx.strokeStyle = this.dimensional ? '#ffffff' : this.color;
            ctx.lineWidth = this.crystalline ? 2 : 1;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    }

    checkCollision(player) {
        const px = player.x + (player.width || 30) / 2;
        const py = player.y + (player.height || 30) / 2;
        const dist = Math.sqrt((this.x - px) ** 2 + (this.y - py) ** 2);
        return dist < this.radius + (player.width || 30) / 2;
    }
}

window.ProjectileBehavior = ProjectileBehavior;
window.Projectile = Projectile;