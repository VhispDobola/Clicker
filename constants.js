// ========================
// GAME CONFIG
// ========================
const GAME_CONFIG = {
    VERSION: '1.1.0',
    AUTOSAVE_INTERVAL: 30000,
    CPS_TICK_RATE: 100,
    COMBO_DECAY_RATE: 100,
    MAX_OFFLINE_HOURS: 8,
    PITY_THRESHOLD: 50,
};

// ========================
// GAME STATE
// ========================
let GAME = {
    energy: 0,
    lifetimeEnergy: 0,
    clicks: 0,
    combo: 1,
    maxCombo: 1,
    critChance: 0,
    critMult: 2,
    
    prestigeRank: 0,
    prestigeBonus: 0,
    
    upgrades: {},
    abilities: [true, false, false, false, false, false, false, false, false, false, false],
    unlockedUpgrades: [],
    
    currentZone: 'v',
    bossesWon: 0,
    
    relics: {},
    relicDust: 0,
    ascensionCrystals: 0,
    pityCounter: 0,
    totalPulls: 0,
    
    relics: {},
    relicshopItems: [],
    relicshopRotation: 0,
    lastRelicDrop: null,
    
    milestones: [],
    achievementCheck: 0,
    
    lastSaveTime: 0,
    lastLogin: 0,
    soundEnabled: true,
    
    achievements: [],
};

// ========================
// ZONES
// ========================
const ZONES = [
    {id: 'v', name: 'The Void', mult: 1, cost: 0, unlocked: true, desc: 'Starting realm'},
    {id: 'q', name: 'Quantum Realm', mult: 2, cost: 500, unlocked: false, desc: '2x all production'},
    {id: 't', name: 'Time Stream', mult: 5, cost: 2500, unlocked: false, desc: '5x all production'},
    {id: 'm', name: 'Matter Plains', mult: 10, cost: 15000, unlocked: false, desc: '10x all production'},
    {id: 'l', name: 'Light Domain', mult: 25, cost: 75000, unlocked: false, desc: '25x all production'},
    {id: 'd', name: 'Dark Abyss', mult: 50, cost: 300000, unlocked: false, desc: '50x all production'},
    {id: 'e', name: 'Eternal Plane', mult: 100, cost: 1500000, unlocked: false, desc: '100x all production'},
    {id: 'inf', name: 'Infinity', mult: 250, cost: 10000000, unlocked: false, desc: '250x all production'},
];

function checkZoneUnlocks() {
    ZONES.forEach(z => {
        if (!z.unlocked && GAME.lifetimeEnergy >= z.cost) {
            z.unlocked = true;
        }
    });
}

// ========================
// UPGRADES
// ========================
const UPGRADES = [
    // Rank 0
    {id: 'c1', name: 'Click Boost', base: 15, scale: 1.15, max: 30, effect: 1, desc: '+1 per click', rank: 0, type: 'click'},
    {id: 'c2', name: 'Power Click', base: 150, scale: 1.18, max: 25, effect: 5, desc: '+5 per click', rank: 0, type: 'click'},
    {id: 'g1', name: 'Energy Gen', base: 25, scale: 1.12, max: 50, effect: 5, desc: '+5/s', rank: 0, type: 'gen'},
    {id: 'g2', name: 'Matter Gen', base: 100, scale: 1.14, max: 40, effect: 20, desc: '+20/s', rank: 0, type: 'gen'},
    {id: 'cr1', name: 'Lucky', base: 250, scale: 1.25, max: 15, effect: 0.02, desc: '+2% crit', rank: 0, type: 'crit'},
    {id: 'cm1', name: 'Combo Mastery', base: 500, scale: 1.3, max: 5, effect: 0.5, desc: '+50% combo', rank: 0, type: 'combo'},
    
    // Rank 1
    {id: 'c3', name: 'Mega Click', base: 1500, scale: 1.2, max: 20, effect: 25, desc: '+25 per click', rank: 1, type: 'click'},
    {id: 'g3', name: 'Time Gen', base: 500, scale: 1.16, max: 30, effect: 75, desc: '+75/s', rank: 1, type: 'gen'},
    {id: 'b1', name: 'Dodge Boost', base: 500, scale: 1.5, max: 10, effect: 1, desc: '+1 HP', rank: 1, type: 'boss'},
    {id: 'mc1', name: 'Multi Click', base: 1000, scale: 1.25, max: 10, effect: 2, desc: '+2 clicks', rank: 1, type: 'click'},
    
    // Rank 2
    {id: 'c4', name: 'Giga Click', base: 15000, scale: 1.22, max: 15, effect: 100, desc: '+100 per click', rank: 2, type: 'click'},
    {id: 'g4', name: 'Void Gen', base: 2500, scale: 1.18, max: 25, effect: 300, desc: '+300/s', rank: 2, type: 'gen'},
    {id: 'cr2', name: 'Crit Power', base: 500, scale: 1.3, max: 10, effect: 0.5, desc: '+50% crit', rank: 2, type: 'crit'},
    {id: 'b2', name: 'Quick Strike', base: 1000, scale: 1.6, max: 10, effect: 25, desc: '+25 dmg', rank: 2, type: 'boss'},
    {id: 'g5', name: 'Light Gen', base: 10000, scale: 1.2, max: 20, effect: 1500, desc: '+1.5K/s', rank: 2, type: 'gen'},
    {id: 'b3', name: 'Phase Vision', base: 2000, scale: 1.7, max: 5, effect: 1, desc: 'See patterns', rank: 2, type: 'boss'},
    
    // Rank 3
    {id: 'ov1', name: 'Overclock', base: 500, scale: 1.4, max: 5, effect: 1, desc: '+100% CPS', rank: 3, type: 'special'},
    {id: 'ov2', name: 'Traffic Control', base: 2000, scale: 1.5, max: 5, effect: 2, desc: '+2 ship traffic', rank: 3, type: 'space'},
    {id: 'id1', name: 'Idle Mastery', base: 2000, scale: 1.5, max: 5, effect: 2, desc: '+200% idle', rank: 3, type: 'special'},
    {id: 'c5', name: 'Tera Click', base: 75000, scale: 1.25, max: 12, effect: 500, desc: '+500 per click', rank: 3, type: 'click'},
    {id: 'g6', name: 'Dark Gen', base: 25000, scale: 1.22, max: 15, effect: 8000, desc: '+8K/s', rank: 3, type: 'gen'},
    {id: 'b4', name: 'Last Stand', base: 5000, scale: 2, max: 5, effect: 1, desc: 'Resurrect', rank: 3, type: 'boss'},
    {id: 'ch1', name: 'Chaos Engine', base: 5000, scale: 1.8, max: 3, effect: 1, desc: 'Random x2', rank: 3, type: 'special'},
    {id: 'cr3', name: 'Crit Master', base: 25000, scale: 1.35, max: 8, effect: 1, desc: '+100% crit', rank: 3, type: 'crit'},
    
    // Rank 4
    {id: 'g7', name: 'Quantum Gen', base: 100000, scale: 1.25, max: 12, effect: 50000, desc: '+50K/s', rank: 4, type: 'gen'},
    {id: 'c6', name: 'Peta Click', base: 500000, scale: 1.28, max: 10, effect: 2500, desc: '+2.5K click', rank: 4, type: 'click'},
    {id: 'b5', name: 'Berserker', base: 50000, scale: 2.2, max: 5, effect: 1, desc: '+100% dmg', rank: 4, type: 'boss'},
    {id: 'bh1', name: 'Black Hole', base: 1000000, scale: 2, max: 5, effect: 1, desc: 'Add black holes', rank: 4, type: 'space'},
    {id: 'bh2', name: 'Black Hole Core', base: 5000000, scale: 2, max: 5, effect: 5, desc: '+5 black hole size', rank: 4, type: 'space'},
    {id: 'ss1', name: 'Shooting Stars', base: 500000, scale: 1.8, max: 5, effect: 1, desc: 'Star powerups', rank: 4, type: 'space'},
    {id: 'g8', name: 'Cosmic Gen', base: 500000, scale: 1.3, max: 10, effect: 250000, desc: '+250K/s', rank: 4, type: 'gen'},
    
    // Rank 5
    {id: 'c7', name: 'Exa Click', base: 5000000, scale: 1.32, max: 8, effect: 10000, desc: '+10K click', rank: 5, type: 'click'},
    {id: 'g9', name: 'Multiverse Gen', base: 10000000, scale: 1.35, max: 8, effect: 1000000, desc: '+1M/s', rank: 5, type: 'gen'},
    {id: 'c8', name: 'Zetta Click', base: 50000000, scale: 1.35, max: 6, effect: 50000, desc: '+50K click', rank: 5, type: 'click'},
    {id: 'g10', name: 'Infinity Gen', base: 100000000, scale: 1.4, max: 6, effect: 5000000, desc: '+5M/s', rank: 5, type: 'gen'},
    
    // Rank 6
    {id: 'c9', name: 'Yotta Click', base: 500000000, scale: 1.4, max: 5, effect: 250000, desc: '+250K click', rank: 6, type: 'click'},
    {id: 'g11', name: 'Omega Gen', base: 1000000000, scale: 1.5, max: 5, effect: 25000000, desc: '+25M/s', rank: 6, type: 'gen'},
    {id: 'c10', name: 'Brace Click', base: 5000000000, scale: 1.5, max: 4, effect: 1000000, desc: '+1M click', rank: 6, type: 'click'},
    {id: 'g12', name: 'Transcendental Gen', base: 10000000000, scale: 1.6, max: 4, effect: 100000000, desc: '+100M/s', rank: 6, type: 'gen'},
    
    // Rank 7
    {id: 'g13', name: 'Quantum Singularity', base: 100000000000, scale: 2, max: 3, effect: 500000000, desc: '+500M/s', rank: 7, type: 'gen'},
    {id: 'c11', name: 'Absolute Click', base: 50000000000, scale: 2, max: 3, effect: 5000000, desc: '+5M click', rank: 7, type: 'click'},
    {id: 'g14', name: 'Divine Spark', base: 500000000000, scale: 2.5, max: 2, effect: 2000000000, desc: '+2B/s', rank: 7, type: 'gen'},
    {id: 'c12', name: 'Divine Click', base: 500000000000, scale: 2.5, max: 2, effect: 25000000, desc: '+25M click', rank: 7, type: 'click'},
];

// ========================
// RELICS
// ========================
const RELICS = [
    {id: 'rc_001', name: 'Energy Shard', icon: '💎', rarity: 'common', baseBonus: {clickPower: 0.05}, perLevel: 0.03, maxLevel: 5, desc: '+5% click power'},
    {id: 'rc_002', name: 'Tiny Crystal', icon: '🔹', rarity: 'common', baseBonus: {cps: 0.03}, perLevel: 0.02, maxLevel: 5, desc: '+3% CPS'},
    {id: 'rc_003', name: 'Broken Core', icon: '🌀', rarity: 'common', baseBonus: {critChance: 0.01}, perLevel: 0.005, maxLevel: 5, desc: '+1% crit chance'},
    {id: 'rc_004', name: 'Dusty Orb', icon: '⚪', rarity: 'common', baseBonus: {combo: 0.1}, perLevel: 0.05, maxLevel: 5, desc: '+10% combo'},
    {id: 'rc_005', name: 'Chipped Stone', icon: '🪨', rarity: 'common', baseBonus: {clickPower: 0.03}, perLevel: 0.02, maxLevel: 5, desc: '+3% click'},
    {id: 'rc_006', name: 'Faded Gem', icon: '💠', rarity: 'common', baseBonus: {cps: 0.05}, perLevel: 0.03, maxLevel: 5, desc: '+5% CPS'},
    {id: 'rc_007', name: 'Old Relic', icon: '🏺', rarity: 'common', baseBonus: {prestigeBonus: 0.01}, perLevel: 0.005, maxLevel: 5, desc: '+1% prestige bonus'},
    {id: 'rc_008', name: 'Mini Idol', icon: '🗿', rarity: 'common', baseBonus: {clickPower: 0.02, cps: 0.02}, perLevel: 0.015, maxLevel: 5, desc: '+2% click & CPS'},
    {id: 'rc_009', name: 'Shattered Lens', icon: '🔍', rarity: 'common', baseBonus: {critMult: 0.05}, perLevel: 0.03, maxLevel: 5, desc: '+5% crit multiplier'},
    {id: 'rc_010', name: 'Pebble of Power', icon: '🟡', rarity: 'common', baseBonus: {bossDmg: 0.03}, perLevel: 0.02, maxLevel: 5, desc: '+3% boss damage'},
    
    {id: 'ru_001', name: 'Quantum Core', icon: '⬡', rarity: 'uncommon', baseBonus: {clickPower: 0.15}, perLevel: 0.08, maxLevel: 7, desc: '+15% click power'},
    {id: 'ru_002', name: 'Time Fragment', icon: '⏳', rarity: 'uncommon', baseBonus: {cps: 0.12}, perLevel: 0.06, maxLevel: 7, desc: '+12% CPS'},
    {id: 'ru_003', name: 'Vampire Fang', icon: '🧛', rarity: 'uncommon', baseBonus: {bossDmg: 0.1, bossLifesteal: 0.02}, perLevel: 0.05, maxLevel: 7, desc: '+10% boss dmg'},
    {id: 'ru_004', name: 'Golden Ratio', icon: '📐', rarity: 'uncommon', baseBonus: {combo: 0.2, critChance: 0.02}, perLevel: 0.1, maxLevel: 7, desc: '+20% combo'},
    {id: 'ru_005', name: 'Void Stone', icon: '◼', rarity: 'uncommon', baseBonus: {clickPower: 0.12}, perLevel: 0.07, maxLevel: 7, desc: '+12% click power'},
    
    {id: 'rr_001', name: 'Infinity Gauntlet', icon: '🧤', rarity: 'rare', baseBonus: {clickPower: 0.3}, perLevel: 0.15, maxLevel: 10, desc: '+30% click power'},
    {id: 'rr_002', name: 'Eternal Engine', icon: '⚙️', rarity: 'rare', baseBonus: {cps: 0.25}, perLevel: 0.12, maxLevel: 10, desc: '+25% CPS'},
    {id: 'rr_003', name: 'Mastery Orb', icon: '🔮', rarity: 'rare', baseBonus: {clickPower: 0.15, cps: 0.15}, perLevel: 0.08, maxLevel: 10, desc: '+15% click & CPS'},
    {id: 'rr_004', name: 'Eye of Chaos', icon: '👁️', rarity: 'rare', baseBonus: {critChance: 0.08, critMult: 0.25}, perLevel: 0.04, maxLevel: 10, desc: '+8% crit'},
    {id: 'rr_005', name: 'Combo King Crown', icon: '👑', rarity: 'rare', baseBonus: {combo: 0.5, maxCombo: 2}, perLevel: 0.2, maxLevel: 10, desc: '+50% combo'},
    
    {id: 're_001', name: 'Quantum Singularity', icon: '🔵', rarity: 'epic', baseBonus: {clickPower: 0.4, cps: 0.35}, perLevel: 0.2, maxLevel: 10, desc: '+40% click'},
    {id: 're_002', name: 'Omega Matrix', icon: 'Ω', rarity: 'epic', baseBonus: {clickPower: 0.25, cps: 0.25, critChance: 0.05}, perLevel: 0.12, maxLevel: 10, desc: '+25% all basic'},
    {id: 're_003', name: 'Destiny Thread', icon: '🧵', rarity: 'epic', baseBonus: {combo: 0.8, critChance: 0.08}, perLevel: 0.4, maxLevel: 10, desc: '+80% combo'},
    {id: 're_004', name: 'Fate Book', icon: '📖', rarity: 'epic', baseBonus: {critChance: 0.06, critMult: 0.5}, perLevel: 0.03, maxLevel: 10, desc: '+6% crit'},
    {id: 're_005', name: 'Ascension Gem', icon: '💎', rarity: 'epic', baseBonus: {prestigeBonus: 0.1}, perLevel: 0.05, maxLevel: 10, desc: '+10% prestige'},
    
    {id: 'rl_001', name: 'Void Heart', icon: '💔', rarity: 'legendary', baseBonus: {bossDmg: 1.0, bossHpReduce: 0.3}, perLevel: 0.5, maxLevel: 10, desc: '+100% boss dmg'},
    {id: 'rl_002', name: 'Cosmic Serpent', icon: '🐍', rarity: 'legendary', baseBonus: {clickPower: 0.6, cps: 0.6, bossDmg: 0.6}, perLevel: 0.3, maxLevel: 10, desc: '+60% all main'},
    {id: 'rl_003', name: 'Reality Breaker', icon: '💢', rarity: 'legendary', baseBonus: {clickPower: 0.5, critChance: 0.15, critMult: 1.0, bossDmg: 0.5}, perLevel: 0.25, maxLevel: 10, desc: '+50% click'},
    {id: 'rl_004', name: 'Infinity Star', icon: '⭐', rarity: 'legendary', baseBonus: {clickPower: 0.8, cps: 0.8}, perLevel: 0.4, maxLevel: 10, desc: '+80% click & CPS'},
    {id: 'rl_005', name: 'Ultimate Form', icon: '🌟', rarity: 'legendary', baseBonus: {clickPower: 0.75, cps: 0.75, critChance: 0.1, combo: 0.75, bossDmg: 0.75}, perLevel: 0.38, maxLevel: 10, desc: '+75% all combat'},
];

const RARITY_RATES = { common: 0.55, uncommon: 0.22, rare: 0.12, epic: 0.06, legendary: 0.025, mythic: 0.005 };
const RARITY_COLORS = { common: '#888888', uncommon: '#44aa44', rare: '#4488ff', epic: '#aa44ff', legendary: '#ffaa00', mythic: '#ff44ff' };

// ========================
// ACHIEVEMENTS
// ========================
const ACHIEVEMENTS = [
    {id: 'click1', name: 'First Click', desc: 'Click 10 times', val: 10, type: 'clicks'},
    {id: 'click2', name: 'Getting Started', desc: 'Click 100 times', val: 100, type: 'clicks'},
    {id: 'click3', name: 'Clicker', desc: 'Click 1,000 times', val: 1000, type: 'clicks'},
    {id: 'click4', name: 'Click Master', desc: 'Click 10,000 times', val: 10000, type: 'clicks'},
    {id: 'energy1', name: 'Energy Boost', desc: 'Earn 1K lifetime', val: 1000, type: 'energy'},
    {id: 'energy2', name: 'Power Up', desc: 'Earn 100K lifetime', val: 100000, type: 'energy'},
    {id: 'energy3', name: 'Energy Overload', desc: 'Earn 10M lifetime', val: 10000000, type: 'energy'},
    {id: 'boss1', name: 'Boss Slayer', desc: 'Defeat 1 boss', val: 1, type: 'bosses'},
    {id: 'boss2', name: 'Boss Hunter', desc: 'Defeat 10 bosses', val: 10, type: 'bosses'},
    {id: 'prestige1', name: 'First Ascension', desc: 'Prestige once', val: 1, type: 'prestige'},
    {id: 'combo1', name: 'Combo Starter', desc: 'Reach 5x combo', val: 5, type: 'combo'},
    {id: 'combo2', name: 'Combo Master', desc: 'Reach 10x combo', val: 10, type: 'combo'},
    {id: 'cps1', name: 'Passive Income', desc: 'Reach 100 CPS', val: 100, type: 'cps'},
    {id: 'cps2', name: 'Idle Power', desc: 'Reach 10K CPS', val: 10000, type: 'cps'},
];

// ========================
// PRESTIGE
// ========================
const PRESTIGE = [
    {name: 'Novice', min: 0, bonus: 0},
    {name: 'Apprentice', min: 3, bonus: 0.5},
    {name: 'Journeyman', min: 6, bonus: 1},
    {name: 'Expert', min: 10, bonus: 1.5},
    {name: 'Master', min: 15, bonus: 2},
    {name: 'Grandmaster', min: 22, bonus: 2.5},
    {name: 'Legend', min: 30, bonus: 3},
];

// ========================
// ABILITIES
// ========================
const ABILITIES = [
    {name: 'Energy Pulse', cost: 50, desc: '3x clicks 5s', key: '1', cd: 30},
    {name: 'Matter Surge', cost: 200, desc: '5x matter 5s', key: '2', cd: 45},
    {name: 'Void Burst', cost: 500, desc: '+5 void', key: '3', cd: 60},
    {name: 'Time Warp', cost: 1000, desc: '10x all 10s', key: '4', cd: 90},
    {name: 'Critical Eye', cost: 1500, desc: '+30% crit', key: '5', cd: 120},
    {name: 'Combo Frenzy', cost: 1500, desc: 'Max combo +3', key: '6', cd: 120},
    {name: 'Reality Warp', cost: 5000, desc: 'All x5 15s', key: '7', cd: 180},
];

// ========================
// BOSSES
// ========================
const BOSSES = [
    {id: 'VoidTitan', name: 'Void Titan', hp: 300, speed: 3, dmg: 10, color: '#ff3300', pattern: 'sweep', desc: 'Shoots fireballs'},
    {id: 'QuantumHorror', name: 'Quantum Horror', hp: 500, speed: 3.5, dmg: 15, color: '#aa00ff', pattern: 'split', desc: 'Splits at 50% HP'},
    {id: 'TimeGuardian', name: 'Time Guardian', hp: 800, speed: 3, dmg: 20, color: '#ffaa00', pattern: 'time', desc: 'Time spiral attacks'},
    {id: 'MatterLord', name: 'Matter Lord', hp: 1200, speed: 4, dmg: 25, color: '#00aaff', pattern: 'bounce', desc: 'Bouncy missiles'},
    {id: 'LightEmperor', name: 'Light Emperor', hp: 1800, speed: 4.5, dmg: 35, color: '#ffff00', pattern: 'laser', desc: 'Deadly laser beams'},
];

// Make global
window.GAME = GAME;
window.UPGRADES = UPGRADES;
window.RELICS = RELICS;
window.ZONES = ZONES;
window.ACHIEVEMENTS = ACHIEVEMENTS;
window.PRESTIGE = PRESTIGE;
window.ABILITIES = ABILITIES;
window.BOSSES = BOSSES;
window.RARITY_RATES = RARITY_RATES;
window.RARITY_COLORS = RARITY_COLORS;
window.GAME_CONFIG = GAME_CONFIG;