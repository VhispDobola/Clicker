// ========================
// HELPER FUNCTIONS
// ========================

function formatNumber(n) {
    if (typeof n === 'string') n = parseFloat(n);
    const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No'];
    if (n < 1000) return Math.floor(n).toString();
    let si = 0;
    while (n >= 1000 && si < suffixes.length - 1) {
        n /= 1000;
        si++;
    }
    return n.toFixed(2) + suffixes[si];
}

function getUpgradeCost(id) {
    const up = UPGRADES.find(u => u.id === id);
    if (!up) return 0;
    const level = GAME.upgrades[id] || 0;
    return Math.floor(up.base * Math.pow(up.scale, level));
}

function getClickPower() {
    let power = 1;
    UPGRADES.forEach(u => {
        if (u.type === 'click' || u.id.startsWith('c') || u.id.startsWith('cr') || u.id.startsWith('cm')) {
            power += (u.effect || 0) * (GAME.upgrades[u.id] || 0);
        }
    });
    power *= GAME.combo;
    power *= getZoneMult();
    power *= (1 + (GAME.prestigeBonus || 0));
    power *= (1 + relicBonuses.clickPower);
    power *= (1 + relicBonuses.energyGain);
    return power;
}

function getCps() {
    let cps = 0;
    UPGRADES.forEach(u => {
        if (u.type === 'gen' || u.id.startsWith('g')) {
            cps += (u.effect || 0) * (GAME.upgrades[u.id] || 0);
        }
    });
    if (GAME.upgrades['ov1']) cps *= 1 + GAME.upgrades['ov1'];
    cps *= getZoneMult();
    cps *= (1 + (GAME.prestigeBonus || 0));
    cps *= (1 + relicBonuses.cps);
    cps *= (1 + relicBonuses.energyGain);
    return cps;
}

function getCritChance() {
    let chance = 0.02 * (GAME.upgrades['cr1'] || 0);
    chance += relicBonuses.critChance;
    return Math.min(0.5, chance);
}

function getCritMult() {
    let mult = 2 + (GAME.upgrades['cr2'] || 0) * 0.5;
    mult *= (1 + relicBonuses.critMult);
    return mult;
}

function getZoneMult() {
    const zone = ZONES.find(z => z.id === GAME.currentZone);
    return zone ? zone.mult : 1;
}

function getOwnedRelicCount() {
    return Object.keys(GAME.relics || {}).length;
}

function getRelicLevel(id) {
    return GAME.relics?.[id] || 0;
}

// ========================
// RELIC BONUSES CALCULATION
// ========================
let relicBonuses = {
    clickPower: 0, cps: 0, critChance: 0, critMult: 0, combo: 0, maxCombo: 0,
    bossDmg: 0, bossHpReduce: 0, bossLifesteal: 0, bossResurrect: 0,
    prestigeBonus: 0, energyGain: 0, synergyBonus: 0, moltenChance: 0,
    offlineStore: 0, duplicate: 0, timeScale: 0, globalBonus: 0,
    randomBonus: 0, autoPull: 0, compress: 0, permanent: 0, setBonus: 0
};

function calculateRelicBonuses() {
    // Mutate existing object instead of replacing
    Object.keys(relicBonuses).forEach(k => relicBonuses[k] = 0);
    
    // Count total relics for synergy bonus
    const totalRelics = Object.keys(GAME.relics || {}).reduce((sum, id) => sum + (GAME.relics[id] || 0), 0);
    
    // Process main RELICS
    processRelicSet(RELICS);
    
    // Process COSMIC_RELICS with synergy (empty array if not defined)
    processRelicSet(typeof COSMIC_RELICS !== 'undefined' ? COSMIC_RELICS : [], totalRelics);
    
    // Check relic sets
    if (typeof RELIC_SETS !== 'undefined') {
        RELIC_SETS.forEach(set => {
            const owned = set.relics.filter(id => (GAME.relics[id] || 0) > 0).length;
            if (owned >= set.relics.length && set.bonus) {
                Object.keys(set.bonus).forEach(bonus => {
                    if (relicBonuses[bonus] !== undefined) {
                        relicBonuses[bonus] += set.bonus[bonus];
                    }
                });
            }
        });
    }
    
    // Tag bonuses (3+ relics = +50% boost) from both relic sets
    const tagCounts = {};
    [...RELICS, ...(COSMIC_RELICS || [])].forEach(relic => {
        if (!relic || !relic.tags) return;
        const level = GAME.relics?.[relic.id] || 0;
        if (level === 0) return;
        relic.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
    });
    
    Object.keys(tagCounts).forEach(tag => {
        if (tagCounts[tag] >= 3) {
            const boost = 0.5;
            const tagBoost = {
                click: () => { relicBonuses.clickPower = relicBonuses.clickPower * (1 + boost); },
                cps: () => { relicBonuses.cps = relicBonuses.cps * (1 + boost); },
                crit: () => { relicBonuses.critChance = relicBonuses.critChance * (1 + boost); relicBonuses.critMult = relicBonuses.critMult * (1 + boost); },
                combo: () => { relicBonuses.combo = relicBonuses.combo * (1 + boost); },
                boss: () => { relicBonuses.bossDmg = relicBonuses.bossDmg * (1 + boost); },
                prestige: () => { relicBonuses.prestigeBonus = relicBonuses.prestigeBonus * (1 + boost); },
                energyGain: () => { relicBonuses.energyGain = relicBonuses.energyGain * (1 + boost); }
            };
            if (tagBoost[tag]) tagBoost[tag]();
        }
    });
    
    // Apply synergy bonus per relic owned
    if (relicBonuses.synergyBonus && totalRelics > 0) {
        const synergyBoost = relicBonuses.synergyBonus * totalRelics;
        relicBonuses.clickPower += synergyBoost;
        relicBonuses.cps += synergyBoost;
    }
    
    // Apply global bonus per relic (Singularity Throne)
    if (relicBonuses.globalBonus && totalRelics > 0) {
        const globalBoost = relicBonuses.globalBonus * totalRelics;
        relicBonuses.clickPower += globalBoost;
        relicBonuses.cps += globalBoost;
    }
}

function processRelicSet(relicSet, totalRelics = 0) {
    Object.keys(GAME.relics || {}).forEach(id => {
        const relic = relicSet.find(r => r.id === id);
        if (!relic) return;
        const level = GAME.relics[id];
        if (level === 0) return;
        
        Object.keys(relic.baseBonus).forEach(type => {
            if (relicBonuses[type] !== undefined) {
                relicBonuses[type] += relic.baseBonus[type] + (relic.perLevel * level);
            }
        });
    });
}

function rollRarity() {
    const rand = Math.random();
    if ((GAME.pityCounter || 0) >= GAME_CONFIG.PITY_THRESHOLD) return 'legendary';
    
    let cumulative = 0;
    for (const [rarity, rate] of Object.entries(RARITY_RATES)) {
        cumulative += rate;
        if (rand < cumulative) return rarity;
    }
    return 'common';
}

// ========================
// RELIC PULLING SYSTEM
// ========================
function doRelicPull(multi = 1) {
    const cost = multi * 10;
    if ((GAME.ascensionCrystals || 0) < cost) {
        playError();
        toast('Not enough Ascension Crystals!', 'error');
        return;
    }
    
    GAME.ascensionCrystals -= cost;
    GAME.totalPulls = (GAME.totalPulls || 0) + multi;
    
    const pulled = [];
    for (let i = 0; i < multi; i++) {
        const rarity = rollRarity();
        const relicsOfRarity = RELICS.filter(r => r.rarity === rarity);
        const relic = relicsOfRarity[Math.floor(Math.random() * relicsOfRarity.length)];
        
        // Update pity
        if (rarity !== 'legendary') {
            GAME.pityCounter = (GAME.pityCounter || 0) + 1;
        } else {
            GAME.pityCounter = 0;
        }
        
        // Check duplicate
        if ((GAME.relics?.[relic.id] || 0) > 0) {
            // Convert duplicate to AC
            const dupValue = 9;
            GAME.ascensionCrystals = (GAME.ascensionCrystals || 0) + dupValue;
        } else {
            if (!GAME.relics) GAME.relics = {};
            GAME.relics[relic.id] = 1;
            pulled.push(relic);
        }
    }
    
    playSuccess();
    if (pulled.length > 0) {
        pulled.forEach(r => toast('✨ NEW RELIC: ' + r.name + '!', 'success'));
    }
    
    saveGame(false);
    updateDisplay();
}

function upgradeRelic(id) {
    const relic = RELICS.find(r => r.id === id);
    const level = GAME.relics?.[id] || 0;
    if (level >= relic.maxLevel) return;
    
    const upgradeCost = Math.floor(10 * Math.pow(1.5, level));
    const dustCost = level + 1;
    const ac = GAME.ascensionCrystals || 0;
    const dust = GAME.relicDust || 0;
    
    if (ac >= upgradeCost && dust >= dustCost) {
        GAME.ascensionCrystals -= upgradeCost;
        GAME.relicDust -= dustCost;
        GAME.relics[id] = level + 1;
        playUpgrade();
        saveGame(false);
        updateDisplay();
    } else {
        playError();
        toast('Need ' + formatNumber(upgradeCost) + ' AC and ' + dustCost + ' dust', 'error');
    }
}

// ========================
// RELIC SHOP SYSTEM
// ========================
function initRelicShop() {
    if (!GAME.relicShopItems || GAME.relicShopItems.length === 0) {
        const shuffled = [...RELICS].sort(() => Math.random() - 0.5);
        GAME.relicShopItems = shuffled.slice(0, 5).map(r => r.id);
        GAME.relicShopRotation = Date.now();
    }
}

function buyRelicFromShop(id) {
    const relic = RELICS.find(r => r.id === id);
    if (!relic) return;
    
    const level = GAME.relics?.[id] || 0;
    const cost = Math.floor(50 * Math.pow(1.3, level));
    const ac = GAME.ascensionCrystals || 0;
    
    if (ac >= cost) {
        GAME.ascensionCrystals -= cost;
        if (!GAME.relics) GAME.relics = {};
        GAME.relics[id] = level + 1;
        playSuccess();
        saveGame(false);
        toast('Purchased ' + relic.name + '!', 'success');
        updateDisplay();
    } else {
        playError();
        toast('Not enough AC!', 'error');
    }
}

function getBossDodge() { return (GAME.upgrades['b1'] || 0); }
function getBossDamage() { 
    let dmg = 20 + (GAME.upgrades['b2'] || 0) * 10;
    dmg *= (1 + relicBonuses.bossDmg);
    return dmg;
}
function getBossHpMultiplier() { return Math.max(0.1, 1 - relicBonuses.bossHpReduce); }
function getBossLastStand() { return GAME.upgrades['b4'] > 0; }
function getBossResurrect() { return relicBonuses.bossResurrect || 0; }

// Make functions global
window.formatNumber = formatNumber;
window.getUpgradeCost = getUpgradeCost;
window.getClickPower = getClickPower;
window.getCps = getCps;
window.getCritChance = getCritChance;
window.getCritMult = getCritMult;
window.getZoneMult = getZoneMult;
window.getOwnedRelicCount = getOwnedRelicCount;
window.getRelicLevel = getRelicLevel;
window.calculateRelicBonuses = calculateRelicBonuses;
window.rollRarity = rollRarity;
window.doRelicPull = doRelicPull;
window.upgradeRelic = upgradeRelic;
window.initRelicShop = initRelicShop;
window.buyRelicFromShop = buyRelicFromShop;
window.setZone = setZone;
window.getBossDodge = getBossDodge;
window.getBossDamage = getBossDamage;
window.getBossHpMultiplier = getBossHpMultiplier;
window.getBossLastStand = getBossLastStand;
window.getBossResurrect = getBossResurrect;
window.relicBonuses = relicBonuses;

// ========================
// ZONE MANAGEMENT
// ========================
function setZone(zoneId) {
    const zone = ZONES.find(z => z.id === zoneId);
    if (zone && zone.unlocked) {
        GAME.currentZone = zoneId;
        playClick();
        toast('Zone: ' + zone.name + ' (' + zone.mult + 'x)', 'success');
        updateDisplay();
    } else {
        playError();
        toast('Zone not unlocked yet!', 'error');
    }
}