// ========================
// RELIC SYSTEM - HELPERS
// ========================

let relicBonuses = {
    clickPower: 0, cps: 0, cpsMult: 0, critChance: 0, critMult: 0, combo: 0, maxCombo: 0,
    bossDmg: 0, bossHpReduce: 0, bossLifesteal: 0, bossResurrect: 0, bossCritDmg: 0, bossCritChance: 0,
    bossStunChance: 0, stunDmgMult: 0, staggerChance: 0, groundDmg: 0, tremorDmg: 0,
    prestigeBonus: 0, prestigePreserve: 0, prestigeScaling: 0, rebirthBonus: 0, gracePeriod: 0,
    permanentMult: 0, keepUpgrades: 0, knowledgeBonus: 0, echoPower: 0, legacyPower: 0,
    timeBoostPrestige: 0, repeatBonus: 0, knowledgeStack: 0, wisdomMult: 0, paradoxPower: 0, timelineBonus: 0,
    comboSpeed: 0, comboDecaySlow: 0, comboDecay: 0, highComboDmg: 0, rageBonus: 0,
    comboBurst: 0, rushBonus: 0, rageOnKill: 0, rageMult: 0, streakCombo: 0, streakMult: 0, momentumKeep: 0,
    moltenChance: 0, blastPower: 0, blastBounce: 0,
    offlineGain: 0, offlinePassive: false, doubleOffline: false, 
    energyStorage: 0, permanentScaling: 0, growthMult: 0,
    upgradeDuplication: 0, rareDupeNeg: 0, freeDupe: false,
    clickSpeedBonus: 0, comboRetention: 0,
    lootChance: 0, autoPull: 0, pullSpeed: 0, compression: 0, burstPower: 0,
    timeSpeedBonus: 0, globalSpeed: 0, preservedSpeed: 0, resetBonus: 0,
    shadowCopyPower: 0, setProgress: 0, shadowScale: 0, copyCount: false,
    heatMultiplier: 0, productionBonus: 0, cooldownReduction: 0, comboFreeze: 0,
    planetBonus: 0, globalMult: 0, systemBonus: 0, orbitMult: 0,
    evolutionSpeed: 0, traitBonus: 0, doubleEvolved: 0,
    randomBonus: 0, mutationChance: 0, chaosBonus: 0, randomMult: 0, permanentUnstable: 0,
    chainMutation: 0, consumePower: 0, evolveSpeed: 0, devouredPower: 0, devouredGravity: 0,
    signalChance: 0, eventBonus: 0, signalFreq: 0, moreSignals: 0,
    predictionBonus: 0, choiceChance: 0, safeSignals: 0, previewMutation: 0,
    supernovaWaves: 0, starExplosion: 0, voidMutate: 0, offlineMutate: 0,
    timeSkip: 0, instantProduction: 0, droneSpawn: 0, autonomousIncome: 0,
    shatterDamage: 0, frozenBonus: 0, lifeBonus: 0, organicGrowth: 0, cursorBonus: 0, impactFreq: 0,
    factoryMult: 0, moltenValue: 0, preventOverheat: false,
    globalBoost: 0, relicSynergy: 0, setCompletion: 0, constellationBonus: 0,
    permanentGrowth: 0, neverReset: 0, 
    synergyBonus: 0, factoryOutput: 0,
    soulHarvest: 0, shareHealing: 0, healMult: 0, healBonus: 0, maxHealth: 0, healthRegen: 0,
    extraLife: 0, vitalBoost: 0, autoRevive: 0, regenBoost: 0, secondChance: 0,
    critDmgBonus: 0, megaCritChance: 0, luckyCrit: 0, comboCritBonus: 0, trueAim: 0,
    chaosCrit: 0, luckyRoll: 0, critAmplify: 0, aimCrit: 0,
    zoneMult: 0, unlockSpeed: 0, zoneSwitchSpeed: 0, travelBonus: 0, crossZoneBonus: 0, zoneJump: 0,
    instantSwitch: 0, warpBonus: 0, voidBonus: 0, voidUnlock: 0, voidPower: 0, warpSpeed: 0,
    allZoneBonus: 0, navigateSpeed: 0, darkMult: 0, shadowBonus: 0, darkAmplify: 0,
    abilityCDR: 0, abilityPower: 0, abilityCostReduce: 0, abilityDmg: 0, abilityBoost: 0,
    abilityEnergyGen: 0, manaEfficiency: 0, powerMult: 0, abilityChain: 0, coilPower: 0,
    chainTargets: 0, sparkMult: 0,
    milestoneBonus: 0, rewardMult: 0, achievementMult: 0, collectBonus: 0, achievementPower: 0,
    trophyMult: 0, secretBonus: 0, huntBonus: 0, revealSecret: 0, hiddenBonus: 0, categoryBonus: 0,
    idleEfficiency: 0, autoCollect: 0, dreamIncome: 0, idleDream: 0, sleepBonus: 0, dreamMult: 0,
    autoClick: 0, clickAsCps: 0, robotIncome: 0, autoBoost: 0, cpsGrowth: 0,
    nocturnalBonus: 0, dreamOffline: 0
};

let activeCombos = {};
let activeSets = [];

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
    const up = UPGRADES.find(function(u) { return u.id === id; });
    if (!up) return 0;
    const level = GAME.upgrades[id] || 0;
    return Math.floor(up.base * Math.pow(up.scale, level));
}

function getClickPower() {
    let power = 1;
    UPGRADES.forEach(function(u) {
        if (u.type === 'click' || u.id.startsWith('c') || u.id.startsWith('cr') || u.id.startsWith('cm')) {
            power += (u.effect || 0) * (GAME.upgrades[u.id] || 0);
        }
    });
    power *= GAME.combo;
    power *= getZoneMult();
    power *= (1 + (GAME.prestigeBonus || 0));
    power *= (1 + relicBonuses.clickPower);
    power *= (1 + relicBonuses.cpsMult);
    power *= (1 + relicBonuses.productionBonus);
    power *= (1 + relicBonuses.heatMultiplier);
    return power;
}

function getCps() {
    let cps = 0;
    UPGRADES.forEach(function(u) {
        if (u.type === 'gen' || u.id.startsWith('g')) {
            cps += (u.effect || 0) * (GAME.upgrades[u.id] || 0);
        }
    });
    if (GAME.upgrades['ov1']) cps *= 1 + GAME.upgrades['ov1'];
    cps *= getZoneMult();
    cps *= (1 + (GAME.prestigeBonus || 0));
    cps *= (1 + relicBonuses.cps);
    cps *= (1 + relicBonuses.cpsMult);
    cps *= (1 + relicBonuses.productionBonus);
    cps *= (1 + relicBonuses.heatMultiplier);
    cps *= (1 + relicBonuses.factoryMult);
    return cps;
}

function getCritChance() {
    let chance = 0.02 * (GAME.upgrades['cr1'] || 0);
    chance += relicBonuses.critChance;
    return Math.min(0.75, chance);
}

function getCritMult() {
    let mult = 2 + (GAME.upgrades['cr2'] || 0) * 0.5;
    mult *= (1 + relicBonuses.critMult);
    return mult;
}

function getZoneMult() {
    const zone = ZONES.find(function(z) { return z.id === GAME.currentZone; });
    let mult = zone ? zone.mult : 1;
    mult *= (1 + relicBonuses.globalMult);
    mult *= (1 + relicBonuses.systemBonus);
    mult *= (1 + relicBonuses.globalSpeed);
    return mult;
}

function getOwnedRelicCount() {
    return Object.keys(GAME.relics || {}).length;
}

function getRelicLevel(id) {
    return (GAME.relics && GAME.relics[id]) ? GAME.relics[id] : 0;
}

function getRelic(id) {
    return RELICS.find(function(r) { return r.id === id; }) || null;
}

// ========================
// RELIC BONUSES CALCULATION
// ========================
function calculateRelicBonuses() {
    Object.keys(relicBonuses).forEach(function(k) { relicBonuses[k] = 0; });
    activeCombos = {};
    activeSets = [];
    
    if (!GAME.relics) GAME.relics = {};
    
    calculateIndividualRelics();
    calculateRelicCombos();
    calculateSetBonuses();
    calculateTagBonuses();
    calculateGlobalSynergies();
}

function calculateIndividualRelics() {
    RELICS.forEach(function(relic) {
        if (!relic || !relic.baseBonus) return;
        const level = getRelicLevel(relic.id);
        if (level === 0) return;
        
        Object.keys(relic.baseBonus).forEach(function(bonus) {
            if (relicBonuses[bonus] !== undefined) {
                const perLevel = relic.perLevel || 0.1;
                relicBonuses[bonus] += relic.baseBonus[bonus] * (1 + perLevel * level);
            }
        });
    });
}

function calculateRelicCombos() {
    RELICS.forEach(function(relic) {
        if (!relic || !relic.combo) return;
        const level = getRelicLevel(relic.id);
        if (level === 0) return;
        
        Object.keys(relic.combo).forEach(function(comboId) {
            const comboLevel = getRelicLevel(comboId);
            if (comboLevel > 0) {
                const comboName = relic.combo[comboId];
                activeCombos[comboName] = (activeCombos[comboName] || 0) + 1;
                applyComboEffect(comboName, relic.id, comboId);
            }
        });
    });
}

function applyComboEffect(comboName, relic1, relic2) {
    const level = Math.min(getRelicLevel(relic1), getRelicLevel(relic2));
    const multiplier = 1 + 0.2 * level;
    
    switch(comboName) {
        case 'doubleFactory':
            relicBonuses.factoryMult = Math.max(relicBonuses.factoryMult, 2 * multiplier);
            break;
        case 'offlinePassive':
            relicBonuses.offlinePassive = true;
            break;
        case 'exponentialOffline':
            relicBonuses.offlineGain += 0.5 * multiplier;
            break;
        case 'overflowCap':
            relicBonuses.energyStorage += 0.3 * multiplier;
            break;
        case 'chainReaction':
            relicBonuses.starExplosion += 0.5 * multiplier;
            break;
        case 'moltenSpeed':
            relicBonuses.moltenChance += 0.15 * multiplier;
            break;
        case 'critShockwave':
            relicBonuses.critMult += 0.5 * multiplier;
            break;
        case 'slowDecay':
            relicBonuses.comboRetention += 0.3 * multiplier;
            relicBonuses.comboDecay += 0.25 * multiplier;
            break;
        case 'slowReset':
            relicBonuses.comboRetention += 0.5 * multiplier;
            break;
        case 'critChain':
            relicBonuses.critChance += 0.1 * multiplier;
            break;
        case 'doubleOffline':
            relicBonuses.doubleOffline = true;
            break;
        case 'preservedSpeed':
            relicBonuses.preservedSpeed += 0.3 * multiplier;
            break;
        case 'timelineInteract':
            relicBonuses.timelineBonus += 0.2 * multiplier;
            break;
        case 'compressionMult':
            relicBonuses.compression += 0.5 * multiplier;
            break;
        case 'dragLoot':
            relicBonuses.autoPull += 0.3 * multiplier;
            break;
        case 'preventOverheat':
            relicBonuses.preventOverheat = true;
            break;
        case 'moltenValue':
            relicBonuses.moltenValue += 0.5 * multiplier;
            break;
        case 'systemBonus':
            relicBonuses.systemBonus += 0.4 * multiplier;
            break;
        case 'moreSignals':
            relicBonuses.moreSignals = true;
            break;
        case 'safeSignals':
            relicBonuses.safeSignals = true;
            break;
        case 'previewMutation':
            relicBonuses.previewMutation = true;
            break;
        case 'chainMutation':
            relicBonuses.chainMutation += 0.5 * multiplier;
            break;
        case 'permanentUnstable':
            relicBonuses.permanentUnstable = true;
            break;
        case 'doubleEvolved':
            relicBonuses.doubleEvolved += 0.5 * multiplier;
            break;
        case 'copyCount':
            relicBonuses.copyCount = true;
            break;
        case 'shadowScale':
            relicBonuses.shadowScale += 0.3 * multiplier;
            break;
        case 'consumedPermanent':
            relicBonuses.consumedPermanent = true;
            break;
        case 'devourGravity':
            relicBonuses.devouredGravity += 0.3 * multiplier;
            break;
        case 'frozenShatter':
            relicBonuses.comboDecay += 0.4 * multiplier;
            relicBonuses.comboFreeze += 0.2 * multiplier;
            break;
        case 'heatConvert':
            relicBonuses.comboDecay += 0.3 * multiplier;
            break;
        case 'permanentScale':
            relicBonuses.permanentGrowth += 0.15 * multiplier;
            break;
    }
}

function calculateSetBonuses() {
    if (!window.RELIC_SETS) return;
    
    window.RELIC_SETS.forEach(function(set) {
        if (!set || !set.relics || !set.bonus) return;
        
        const owned = set.relics.filter(function(id) {
            return getRelicLevel(id) > 0;
        }).length;
        
        const required = set.relics.length;
        if (owned >= required) {
            activeSets.push(set.id);
            
            Object.keys(set.bonus).forEach(function(bonus) {
                const val = set.bonus[bonus];
                if (typeof val === 'boolean') {
                    relicBonuses[bonus] = true;
                } else if (typeof val === 'number') {
                    relicBonuses[bonus] += val;
                }
            });
            
            if (set.setBonus) {
                unlockSetBonusRelic(set.setBonus);
            }
        }
    });
}

function unlockSetBonusRelic(setBonusId) {
    if (!GAME.relics[setBonusId]) {
        GAME.relics[setBonusId] = 1;
        const relic = getRelic(setBonusId);
        if (relic && typeof toast === 'function') {
            toast('SET BONUS: ' + relic.name + ' unlocked!', 'success');
        }
    }
}

function calculateTagBonuses() {
    const tagCounts = {};
    
    RELICS.forEach(function(relic) {
        if (!relic || !relic.tags) return;
        const level = getRelicLevel(relic.id);
        if (level === 0) return;
        
        relic.tags.forEach(function(tag) {
            tagCounts[tag] = (tagCounts[tag] || 0) + level;
        });
    });
    
    Object.keys(tagCounts).forEach(function(tag) {
        if (tagCounts[tag] >= 3) {
            const boost = 0.5;
            if (tag === 'click') relicBonuses.clickPower += boost;
            if (tag === 'cps' || tag === 'passive') relicBonuses.cps += boost;
            if (tag === 'crit') {
                relicBonuses.critChance += boost * 0.5;
                relicBonuses.critMult += boost * 0.5;
            }
            if (tag === 'combo') relicBonuses.combo += boost;
            if (tag === 'boss') relicBonuses.bossDmg += boost;
            if (tag === 'prestige') relicBonuses.prestigeBonus += boost;
            if (tag === 'time') {
                relicBonuses.globalSpeed += boost * 0.5;
                relicBonuses.preservedSpeed += boost * 0.3;
            }
            if (tag === 'gravity') {
                relicBonuses.compression += boost * 0.5;
                relicBonuses.pullSpeed += boost * 0.5;
            }
            if (tag === 'cosmic') {
                relicBonuses.globalMult += boost * 0.3;
                relicBonuses.cpsMult += boost * 0.2;
            }
        }
    });
}

function calculateGlobalSynergies() {
    const totalRelics = getOwnedRelicCount();
    const relicCount = Object.values(GAME.relics || {}).reduce(function(a, b) { return a + b; }, 0);
    
    if (relicBonuses.relicSynergy && totalRelics > 0) {
        const synergyBoost = relicBonuses.relicSynergy * totalRelics * 0.1;
        relicBonuses.clickPower += synergyBoost;
        relicBonuses.cps += synergyBoost;
    }
    
    if (relicBonuses.globalBoost && totalRelics > 0) {
        const globalBoost = relicBonuses.globalBoost * totalRelics * 0.05;
        relicBonuses.clickPower += globalBoost;
        relicBonuses.cps += globalBoost;
        relicBonuses.bossDmg += globalBoost;
    }
    
    if (relicBonuses.setCompletion && activeSets.length > 0) {
        const setBonus = relicBonuses.setCompletion * activeSets.length * 0.15;
        relicBonuses.clickPower += setBonus;
        relicBonuses.cps += setBonus;
    }
}

// ========================
// RELIC PULLING SYSTEM (Gacha)
// ========================
function rollRarity() {
    var rand = Math.random();
    var cumulative = 0;
    var rates = RARITY_RATES;
    var bossIndex = GAME.bossesWon || 0;
    
    if ((GAME.pityCounter || 0) >= GAME_CONFIG.PITY_THRESHOLD) {
        return 'legendary';
    }
    
    var boostedRand = rand;
    if (bossIndex >= 5) boostedRand *= 0.85;
    else if (bossIndex >= 3) boostedRand *= 0.92;
    
    for (var key in rates) {
        if (rates.hasOwnProperty(key)) {
            cumulative += rates[key];
            if (boostedRand < cumulative) return key;
        }
    }
    return 'common';
}

function doRelicPull(multi) {
    multi = multi || 1;
    var cost = multi * 10;
    
    if ((GAME.ascensionCrystals || 0) < cost) {
        if (typeof playError === 'function') playError();
        if (typeof toast === 'function') toast('Not enough Ascension Crystals!', 'error');
        return;
    }
    
    GAME.ascensionCrystals -= cost;
    GAME.totalPulls = (GAME.totalPulls || 0) + multi;
    
    var pulled = [];
    var dustGained = 0;
    
    for (var i = 0; i < multi; i++) {
        var rarity = rollRarity();
        var relicsOfRarity = RELICS.filter(function(r) { return r.rarity === rarity; });
        if (relicsOfRarity.length === 0) continue;
        
        var relic = relicsOfRarity[Math.floor(Math.random() * relicsOfRarity.length)];
        
        if (rarity !== 'legendary' && rarity !== 'mythic') {
            GAME.pityCounter = (GAME.pityCounter || 0) + 1;
        } else {
            GAME.pityCounter = 0;
        }
        
        var existingLevel = getRelicLevel(relic.id);
        
        if (existingLevel > 0) {
            var dupValue = RARITY_COSTS[rarity] || 10;
            dupValue = Math.floor(dupValue * 0.9);
            GAME.ascensionCrystals += dupValue;
            
            if (typeof playSuccess === 'function') playSuccess();
            if (typeof toast === 'function') toast('Duplicate ' + relic.name + '! +' + dupValue + ' AC', 'success');
        } else {
            if (!GAME.relics) GAME.relics = {};
            GAME.relics[relic.id] = 1;
            pulled.push(relic);
            
            if (typeof playSuccess === 'function') playSuccess();
            if (typeof toast === 'function') toast('NEW RELIC: ' + relic.name + '!', 'success');
        }
    }
    
    if (dustGained > 0) {
        GAME.relicDust = (GAME.relicDust || 0) + dustGained;
    }
    
    if (typeof saveGame === 'function') saveGame(false);
    if (typeof updateDisplay === 'function') updateDisplay();
    
    if (document.getElementById('panel-relics')?.classList.contains('active')) {
        if (typeof renderRelicPanel === 'function') renderRelicPanel();
    }
}

function upgradeRelic(id) {
    var relic = getRelic(id);
    if (!relic) return;
    
    var level = getRelicLevel(id);
    if (level >= relic.maxLevel) {
        if (typeof toast === 'function') toast('Relic is maxed!', 'error');
        return;
    }
    
    var dustCost = Math.floor(level * 0.5) + 1;
    var dust = GAME.relicDust || 0;
    
    if (dust < dustCost) {
        if (typeof playError === 'function') playError();
        if (typeof toast === 'function') toast('Need ' + dustCost + ' Relic Dust to upgrade!', 'error');
        return;
    }
    
    var content = document.getElementById('relicsContent');
    var scrollPos = content ? content.scrollTop : 0;
    
    GAME.relicDust -= dustCost;
    GAME.relics[id] = level + 1;
    
    if (typeof playUpgrade === 'function') playUpgrade();
    if (typeof saveGame === 'function') saveGame(false);
    if (typeof updateDisplay === 'function') updateDisplay();
    if (typeof renderRelicPanel === 'function') {
        renderRelicPanel();
        if (content) content.scrollTop = scrollPos;
    }
    if (typeof toast === 'function') toast(relic.name + ' upgraded to Lv' + (level + 1) + '!', 'success');
}

// ========================
// RELIC SHOP SYSTEM
// ========================
function initRelicShop() {
    if (!GAME.relicShopItems || GAME.relicShopItems.length === 0) {
        var shuffled = RELICS.slice().sort(function() { return Math.random() - 0.5; });
        GAME.relicShopItems = shuffled.slice(0, 6).map(function(r) { return r.id; });
        GAME.relicShopRotation = Date.now();
    }
}

function buyRelicFromShop(id) {
    var relic = getRelic(id);
    if (!relic) return;
    
    var level = getRelicLevel(id);
    var cost = Math.floor(RARITY_COSTS[relic.rarity] * Math.pow(1.3, level) * 5);
    var ac = GAME.ascensionCrystals || 0;
    
    if (ac >= cost) {
        GAME.ascensionCrystals -= cost;
        if (!GAME.relics) GAME.relics = {};
        GAME.relics[id] = level + 1;
        
        if (typeof playSuccess === 'function') playSuccess();
        if (typeof saveGame === 'function') saveGame(false);
        if (typeof toast === 'function') toast('Purchased ' + relic.name + '!', 'success');
        if (typeof updateDisplay === 'function') updateDisplay();
        if (typeof renderRelicShop === 'function') renderRelicShop(document.getElementById('shopContent'));
    } else {
        if (typeof playError === 'function') playError();
        if (typeof toast === 'function') toast('Not enough AC!', 'error');
    }
}

function refreshRelicShop() {
    var shuffled = RELICS.slice().sort(function() { return Math.random() - 0.5; });
    GAME.relicShopItems = shuffled.slice(0, 6).map(function(r) { return r.id; });
    GAME.relicShopRotation = Date.now();
    
    if (typeof playClick === 'function') playClick();
    if (typeof renderRelicShop === 'function') renderRelicShop(document.getElementById('shopContent'));
}

// ========================
// BOSS RELIC DROPS
// ========================
function processBossRelicDrop() {
    var bossIndex = GAME.bossesWon || 0;
    var dropChance = 0.15 + bossIndex * 0.02;
    
    if (Math.random() < dropChance) {
        var rarityRoll = Math.random();
        var rarity = 'common';
        
        if (bossIndex >= 10 && rarityRoll < 0.05) rarity = 'mythic';
        else if (bossIndex >= 7 && rarityRoll < 0.08) rarity = 'legendary';
        else if (bossIndex >= 5 && rarityRoll < 0.12) rarity = 'epic';
        else if (bossIndex >= 3 && rarityRoll < 0.25) rarity = 'rare';
        else if (bossIndex >= 1 && rarityRoll < 0.50) rarity = 'uncommon';
        
        var relicsOfRarity = RELICS.filter(function(r) { return r.rarity === rarity; });
        if (relicsOfRarity.length > 0) {
            var relic = relicsOfRarity[Math.floor(Math.random() * relicsOfRarity.length)];
            var existingLevel = getRelicLevel(relic.id);
            
            if (existingLevel > 0) {
                var dupValue = Math.floor(RARITY_COSTS[rarity] * 0.3);
                GAME.ascensionCrystals = (GAME.ascensionCrystals || 0) + dupValue;
                GAME.relicDust = (GAME.relicDust || 0) + Math.floor(existingLevel * 0.3);
                if (typeof toast === 'function') toast('Duplicate relic! +' + dupValue + ' AC', 'success');
            } else {
                if (!GAME.relics) GAME.relics = {};
                GAME.relics[relic.id] = 1;
                if (typeof toast === 'function') toast('NEW RELIC: ' + relic.name, 'success');
            }
        }
    }
    
    var acReward = 10 + bossIndex * 5;
    GAME.ascensionCrystals = (GAME.ascensionCrystals || 0) + acReward;
    
    var dustReward = 5 + Math.floor(bossIndex * 1.5);
    GAME.relicDust = (GAME.relicDust || 0) + dustReward;
    
    if (typeof saveGame === 'function') saveGame(false);
}

function getBossDodge() { return GAME.upgrades['b1'] || 0; }
function getBossDamage() {
    var dmg = 20 + (GAME.upgrades['b2'] || 0) * 10;
    dmg *= (1 + relicBonuses.bossDmg);
    return dmg;
}
function getBossHpMultiplier() { return Math.max(0.1, 1 - relicBonuses.bossHpReduce); }
function getBossLastStand() { return GAME.upgrades['b4'] > 0; }
function getBossResurrect() { return relicBonuses.bossResurrect || 0; }

// ========================
// OFFLINE GAINS
// ========================
function calculateOfflineGains(hours) {
    var gains = 0;
    var cps = getCps();
    
    if (hours > 0) {
        gains = cps * hours * 3600;
        
        if (relicBonuses.offlinePassive || relicBonuses.doubleOffline) {
            gains *= 2;
        }
        
        if (relicBonuses.offlineGain > 0) {
            gains *= (1 + relicBonuses.offlineGain);
        }
        
        if (relicBonuses.energyStorage > 0) {
            gains *= (1 + relicBonuses.energyStorage);
        }
        
        if (relicBonuses.offlineMutate && Math.random() < 0.1) {
            gains *= 3;
        }
    }
    
    return gains;
}

// ========================
// SPECIAL EFFECTS
// ========================
function checkMoltenStarSpawn() {
    if (relicBonuses.moltenChance > 0) {
        if (Math.random() < relicBonuses.moltenChance) {
            var burst = getClickPower() * (5 + relicBonuses.moltenValue);
            GAME.energy += burst;
            GAME.lifetimeEnergy += burst;
            
            if (typeof moltenStarExplosion === 'function') moltenStarExplosion(burst);
            else if (typeof toast === 'function') toast('MOLTEN STAR! +' + formatNumber(burst), 'success');
            return burst;
        }
    }
    return 0;
}

function checkUpgradeDuplication() {
    if (relicBonuses.upgradeDuplication > 0 && Math.random() < relicBonuses.upgradeDuplication) {
        var availableUpgrades = UPGRADES.filter(function(u) {
            var level = GAME.upgrades[u.id] || 0;
            return level > 0 && level < u.max;
        });
        
        if (availableUpgrades.length > 0) {
            var toDupe = availableUpgrades[Math.floor(Math.random() * availableUpgrades.length)];
            var cost = getUpgradeCost(toDupe.id);
            
            if (!relicBonuses.freeDupe && GAME.energy < cost) return;
            
            GAME.upgrades[toDupe.id] = (GAME.upgrades[toDupe.id] || 0) + 1;
            
            if (typeof toast === 'function') toast('UPGRADE DUPLICATED: ' + toDupe.name, 'success');
            
            if (!relicBonuses.freeDupe) {
                GAME.energy -= cost;
            }
        }
    }
}

// ========================
// ZONE MANAGEMENT
// ========================
function setZone(zoneId) {
    var zone = null;
    for (var i = 0; i < ZONES.length; i++) {
        if (ZONES[i].id === zoneId) {
            zone = ZONES[i];
            break;
        }
    }
    if (zone && zone.unlocked) {
        GAME.currentZone = zoneId;
        if (typeof playClick === 'function') playClick();
        if (typeof toast === 'function') toast('Zone: ' + zone.name + ' (' + zone.mult + 'x)', 'success');
        if (typeof updateDisplay === 'function') updateDisplay();
    } else {
        if (typeof playError === 'function') playError();
        if (typeof toast === 'function') toast('Zone not unlocked yet!', 'error');
    }
}

// ========================
// GLOBAL EXPORTS
// ========================
window.formatNumber = formatNumber;
window.getUpgradeCost = getUpgradeCost;
window.getClickPower = getClickPower;
window.getCps = getCps;
window.getCritChance = getCritChance;
window.getCritMult = getCritMult;
window.getZoneMult = getZoneMult;
window.getOwnedRelicCount = getOwnedRelicCount;
window.getRelicLevel = getRelicLevel;
window.getRelic = getRelic;
window.calculateRelicBonuses = calculateRelicBonuses;
window.rollRarity = rollRarity;
window.doRelicPull = doRelicPull;
window.upgradeRelic = upgradeRelic;
window.initRelicShop = initRelicShop;
window.buyRelicFromShop = buyRelicFromShop;
window.refreshRelicShop = refreshRelicShop;
window.setZone = setZone;
window.getBossDodge = getBossDodge;
window.getBossDamage = getBossDamage;
window.getBossHpMultiplier = getBossHpMultiplier;
window.getBossLastStand = getBossLastStand;
window.getBossResurrect = getBossResurrect;
window.processBossRelicDrop = processBossRelicDrop;
window.calculateOfflineGains = calculateOfflineGains;
window.checkMoltenStarSpawn = checkMoltenStarSpawn;
window.checkUpgradeDuplication = checkUpgradeDuplication;
window.relicBonuses = relicBonuses;
window.activeCombos = activeCombos;
window.activeSets = activeSets;