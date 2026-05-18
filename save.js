// ========================
// SAVE/LOAD SYSTEM
// ========================

function saveGame(showToast = true) {
    let now = Date.now();
    if (!saveGame.lastSave || now - saveGame.lastSave > 2000) {
        GAME.lastLogin = now;
        localStorage.setItem('quantumGenesis', JSON.stringify(GAME));
        if (showToast) toast('Game saved!');
        saveGame.lastSave = now;
    }
}
saveGame.lastSave = 0;

// Make save functions global
window.saveGame = saveGame;
window.loadGame = loadGame;
window.resetGame = resetGame;
window.checkAchievements = checkAchievements;
window.checkMilestones = checkMilestones;
window.toast = toast;
window.formatNumber = formatNumber;

function loadGame() {
    const saved = localStorage.getItem('quantumGenesis');
    if (saved) {
        const data = JSON.parse(saved);

        if (data.prestigeBonus === undefined) {
            data.prestigeBonus = (data.prestigeRank + 1) * 0.5;
        }
        if (data.lastLogin === undefined) data.lastLogin = Date.now();
        if (data.maxCombo === undefined) data.maxCombo = 1;

        if (data.relics === undefined) data.relics = {};
        if (data.relicDust === undefined) data.relicDust = 0;
        if (data.ascensionCrystals === undefined) data.ascensionCrystals = 0;
        if (data.pityCounter === undefined) data.pityCounter = 0;
        if (data.totalPulls === undefined) data.totalPulls = 0;
        if (data.achievements === undefined) data.achievements = [];
        if (data.milestones === undefined) data.milestones = [];
        if (data.relicAchievements === undefined) data.relicAchievements = [];
        if (data.relicShopItems === undefined) data.relicShopItems = data.relicshopItems || [];
        if (data.relicShopRotation === undefined) data.relicShopRotation = data.relicshopRotation || 0;

        Object.assign(GAME, data);

        calculateRelicBonuses();

        if (data.lastLogin && data.energy !== undefined) {
            const offlineMs = Date.now() - data.lastLogin;
            const offlineHours = Math.min(offlineMs / 1000 / 3600, GAME_CONFIG.MAX_OFFLINE_HOURS);
            const offlineSeconds = offlineHours * 3600;
            const cps = getCps();
            if (cps > 0 && offlineSeconds > 10) {
                let offlineEnergy = cps * offlineSeconds;

                if (relicBonuses.offlinePassive || relicBonuses.doubleOffline) {
                    offlineEnergy *= 2;
                }
                if (relicBonuses.offlineGain > 0) {
                    offlineEnergy *= (1 + relicBonuses.offlineGain);
                }
                if (relicBonuses.energyStorage > 0) {
                    offlineEnergy *= (1 + relicBonuses.energyStorage);
                }

                GAME.energy += offlineEnergy;
                GAME.lifetimeEnergy += offlineEnergy;
                if (offlineEnergy > 100) {
                    toast('Welcome back! +' + formatNumber(offlineEnergy) + ' offline energy', 'success');
                }
            }
        }

        if (typeof checkRelicAchievements === 'function') checkRelicAchievements();
    }
}

function resetGame() {
    if (confirm('Reset all progress? This cannot be undone!')) {
        localStorage.removeItem('quantumGenesis');
        location.reload();
    }
}

// ========================
// ACHIEVEMENT CHECKING
// ========================
function checkAchievements() {
    if (!GAME.achievements) GAME.achievements = [];
    
    ACHIEVEMENTS.forEach(a => {
        if (GAME.achievements.includes(a.id)) return;
        
        let achieved = false;
        if (a.type === 'clicks') achieved = GAME.clicks >= a.val;
        else if (a.type === 'energy') achieved = GAME.lifetimeEnergy >= a.val;
        else if (a.type === 'bosses') achieved = GAME.bossesWon >= a.val;
        else if (a.type === 'prestige') achieved = GAME.prestigeRank >= a.val;
        else if (a.type === 'combo') achieved = GAME.maxCombo >= a.val;
        else if (a.type === 'cps') achieved = getCps() >= a.val;
        
        if (achieved) {
            GAME.achievements.push(a.id);
            playAchievement();
            toast('🏆 Achievement: ' + a.name, 'success');
            saveGame(false);
        }
    });
}

function checkMilestones() {
    const milestones = [10, 50, 100, 500, 1000, 5000, 10000, 50000, 100000];
    milestones.forEach(m => {
        if (GAME.clicks === m || GAME.lifetimeEnergy >= m * 10) {
            if (!GAME.milestones || !GAME.milestones.includes(m)) {
                if (!GAME.milestones) GAME.milestones = [];
                GAME.milestones.push(m);
                playMilestone();
                toast('MILESTONE: ' + m + ' clicks!', 'success');
            }
        }
    });
}