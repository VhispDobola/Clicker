// ========================
// MOVEMENT PATTERNS
// ========================

const MovementPatterns = {
    sineWave: function(boss, amplitudeX = 50, amplitudeY = 30, freqX = 0.001, freqY = 0.0015) {
        const time = boss.time || 0;
        const dx = Math.sin(time * freqX) * amplitudeX;
        const dy = Math.cos(time * freqY) * amplitudeY;
        return { dx: isNaN(dx) ? 0 : dx, dy: isNaN(dy) ? 0 : dy };
    },
    
    circular: function(boss, radius = 80, speed = 0.002) {
        const time = boss.time || 0;
        const centerX = boss.centerX || boss.x || 500;
        const centerY = boss.centerY || boss.y || 100;
        
        const angle = time * speed;
        const targetX = centerX + Math.cos(angle) * radius;
        const targetY = centerY + Math.sin(angle) * radius;
        
        return {
            dx: targetX - (boss.x || 0),
            dy: targetY - (boss.y || 0)
        };
    },
    
    chase: function(boss, chaseSpeed = 2, predictionStrength = 0.3) {
        if (!boss.game || !boss.game.player) return { dx: 0, dy: 0 };
        
        const player = boss.game.player;
        if (typeof player.x !== 'number' || typeof player.y !== 'number') return { dx: 0, dy: 0 };
        
        if (!boss.lastPlayerX) {
            boss.lastPlayerX = player.x;
            boss.lastPlayerY = player.y;
            return { dx: 0, dy: 0 };
        }
        
        const playerVX = (player.x - boss.lastPlayerX) * predictionStrength;
        const playerVY = (player.y - boss.lastPlayerY) * predictionStrength;
        
        const predictedX = player.x + playerVX * 10;
        const predictedY = player.y + playerVY * 10;
        
        const dx = predictedX - boss.x;
        const dy = predictedY - boss.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        boss.lastPlayerX = player.x;
        boss.lastPlayerY = player.y;
        
        if (dist > 0 && dist < 10000) {
            return {
                dx: (dx / dist) * chaseSpeed,
                dy: (dy / dist) * chaseSpeed
            };
        }
        
        return { dx: 0, dy: 0 };
    },
    
    teleport: function(boss, teleportChance = 0.02, speed = 1) {
        if (!boss.teleportCooldown) boss.teleportCooldown = 0;
        
        if (boss.teleportCooldown > 0) {
            boss.teleportCooldown--;
            return { dx: speed, dy: 0 };
        }
        
        if (Math.random() < teleportChance) {
            const canvasWidth = boss.canvasWidth || 1000;
            boss.x = 50 + Math.random() * (canvasWidth - 100);
            boss.y = Math.max(50, Math.random() * 200);
            boss.teleportCooldown = 60;
            if (boss.createTeleportEffect) boss.createTeleportEffect();
            return { dx: 0, dy: 0 };
        }
        
        return { dx: speed, dy: 0 };
    },
    
    randomWaypoint: function(boss, speed = 2) {
        const canvasWidth = boss.canvasWidth || 1000;
        
        if (!boss.targetX || Math.abs(boss.x - boss.targetX) < 10) {
            boss.targetX = 50 + Math.random() * (canvasWidth - 100);
            boss.targetY = 50 + Math.random() * 150;
        }
        
        const dx = boss.targetX - boss.x;
        const dy = boss.targetY - boss.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0 && dist < 10000) {
            return {
                dx: (dx / dist) * speed,
                dy: (dy / dist) * speed
            };
        }
        
        return { dx: 0, dy: 0 };
    },
    
    hover: function(boss, baseY = 100, speed = 1) {
        const time = boss.time || 0;
        
        return {
            dx: speed,
            dy: Math.sin(time * 0.002) * 0.5
        };
    },
    
    erratic: function(boss, speed = 2) {
        const time = boss.time || 0;
        
        return {
            dx: Math.sin(time * 0.01) * speed,
            dy: Math.cos(time * 0.008) * speed
        };
    },
    
    horizontalOscillate: function(boss, amplitude = 100, speed = 2) {
        const time = boss.time || 0;
        const centerX = (boss.canvasWidth || 1000) / 2;
        
        return {
            dx: Math.sin(time * 0.002) * amplitude - ((boss.x || 0) - centerX),
            dy: 0
        };
    },
    
    figureEight: function(boss, width = 80, height = 40, speed = 0.002) {
        const time = boss.time || 0;
        
        return {
            dx: Math.cos(time * speed) * width - (boss.x || 0),
            dy: Math.sin(time * speed * 2) * height - (boss.y || 0)
        };
    }
};

window.MovementPatterns = MovementPatterns;