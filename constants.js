// ========================
// GAME CONFIGURATION
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
    
    relicShopItems: [],
    relicShopRotation: 0,
    lastRelicDrop: null,
    
    milestones: [],
    achievementCheck: 0,
    
    lastSaveTime: 0,
    lastLogin: 0,
    soundEnabled: true,
    
    achievements: [],
    relicAchievements: [],
};

// ========================
// ZONES - Different realms with multipliers
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

// Unlock zones based on lifetime energy
function checkZoneUnlocks() {
    ZONES.forEach(z => {
        if (!z.unlocked && GAME.lifetimeEnergy >= z.cost) {
            z.unlocked = true;
            toast('🌌 New Zone: ' + z.name + '!', 'success');
        }
    });
}

// ========================
// UPGRADES DEFINITION
// ========================
const UPGRADES = [
    // Rank 0 - Early game
    {id: 'c1', name: 'Click Boost', base: 15, scale: 1.15, max: 30, effect: 1, desc: '+1 per click', rank: 0, type: 'click'},
    {id: 'c2', name: 'Power Click', base: 150, scale: 1.18, max: 25, effect: 5, desc: '+5 per click', rank: 0, type: 'click'},
    {id: 'g1', name: 'Energy Gen', base: 25, scale: 1.12, max: 50, effect: 5, desc: '+5/s', rank: 0, type: 'gen'},
    {id: 'g2', name: 'Matter Gen', base: 100, scale: 1.14, max: 40, effect: 20, desc: '+20/s', rank: 0, type: 'gen'},
    {id: 'cr1', name: 'Lucky', base: 250, scale: 1.25, max: 15, effect: 0.02, desc: '+2% crit', rank: 0, type: 'crit'},
    {id: 'cm1', name: 'Combo Mastery', base: 500, scale: 1.3, max: 5, effect: 0.5, desc: '+50% combo', rank: 0, type: 'combo'},
    
    // Rank 1 - Mid early
    {id: 'c3', name: 'Mega Click', base: 1500, scale: 1.2, max: 20, effect: 25, desc: '+25 per click', rank: 1, type: 'click'},
    {id: 'g3', name: 'Time Gen', base: 500, scale: 1.16, max: 30, effect: 75, desc: '+75/s', rank: 1, type: 'gen'},
    {id: 'b1', name: 'Dodge Boost', base: 500, scale: 1.5, max: 10, effect: 1, desc: '+1 HP', rank: 1, type: 'boss'},
    {id: 'mc1', name: 'Multi Click', base: 1000, scale: 1.25, max: 10, effect: 2, desc: '+2 clicks', rank: 1, type: 'click'},
    
    // Rank 2 - Mid game
    {id: 'c4', name: 'Giga Click', base: 15000, scale: 1.22, max: 15, effect: 100, desc: '+100 per click', rank: 2, type: 'click'},
    {id: 'g4', name: 'Void Gen', base: 2500, scale: 1.18, max: 25, effect: 300, desc: '+300/s', rank: 2, type: 'gen'},
    {id: 'cr2', name: 'Crit Power', base: 500, scale: 1.3, max: 10, effect: 0.5, desc: '+50% crit', rank: 2, type: 'crit'},
    {id: 'b2', name: 'Quick Strike', base: 1000, scale: 1.6, max: 10, effect: 25, desc: '+25 dmg', rank: 2, type: 'boss'},
    {id: 'g5', name: 'Light Gen', base: 10000, scale: 1.2, max: 20, effect: 1500, desc: '+1.5K/s', rank: 2, type: 'gen'},
    {id: 'b3', name: 'Phase Vision', base: 2000, scale: 1.7, max: 5, effect: 1, desc: 'See patterns', rank: 2, type: 'boss'},
    
    // Rank 3 - Special abilities
    {id: 'ov1', name: 'Overclock', base: 500, scale: 1.4, max: 5, effect: 1, desc: '+100% CPS', rank: 3, type: 'special'},
    {id: 'ov2', name: 'Traffic Control', base: 2000, scale: 1.5, max: 5, effect: 2, desc: '+2 ship traffic', rank: 3, type: 'space'},
    {id: 'id1', name: 'Idle Mastery', base: 2000, scale: 1.5, max: 5, effect: 2, desc: '+200% idle', rank: 3, type: 'special'},
    {id: 'c5', name: 'Tera Click', base: 75000, scale: 1.25, max: 12, effect: 500, desc: '+500 per click', rank: 3, type: 'click'},
    {id: 'g6', name: 'Dark Gen', base: 25000, scale: 1.22, max: 15, effect: 8000, desc: '+8K/s', rank: 3, type: 'gen'},
    {id: 'b4', name: 'Last Stand', base: 5000, scale: 2, max: 5, effect: 1, desc: 'Resurrect', rank: 3, type: 'boss'},
    {id: 'ch1', name: 'Chaos Engine', base: 5000, scale: 1.8, max: 3, effect: 1, desc: 'Random x2', rank: 3, type: 'special'},
    {id: 'cr3', name: 'Crit Master', base: 25000, scale: 1.35, max: 8, effect: 1, desc: '+100% crit', rank: 3, type: 'crit'},
    
    // Rank 4 - Late game
    {id: 'g7', name: 'Quantum Gen', base: 100000, scale: 1.25, max: 12, effect: 50000, desc: '+50K/s', rank: 4, type: 'gen'},
    {id: 'c6', name: 'Peta Click', base: 500000, scale: 1.28, max: 10, effect: 2500, desc: '+2.5K click', rank: 4, type: 'click'},
    {id: 'b5', name: 'Berserker', base: 50000, scale: 2.2, max: 5, effect: 1, desc: '+100% dmg', rank: 4, type: 'boss'},
    {id: 'bh1', name: 'Black Hole', base: 1000000, scale: 2, max: 5, effect: 1, desc: 'Add black holes', rank: 4, type: 'space'},
    {id: 'bh2', name: 'Black Hole Core', base: 5000000, scale: 2, max: 5, effect: 5, desc: '+5 black hole size', rank: 4, type: 'space'},
    {id: 'ss1', name: 'Shooting Stars', base: 500000, scale: 1.8, max: 5, effect: 1, desc: 'Star powerups', rank: 4, type: 'space'},
    {id: 'g8', name: 'Cosmic Gen', base: 500000, scale: 1.3, max: 10, effect: 250000, desc: '+250K/s', rank: 4, type: 'gen'},
    
    // Rank 5 - End game
    {id: 'c7', name: 'Exa Click', base: 5000000, scale: 1.32, max: 8, effect: 10000, desc: '+10K click', rank: 5, type: 'click'},
    {id: 'g9', name: 'Multiverse Gen', base: 10000000, scale: 1.35, max: 8, effect: 1000000, desc: '+1M/s', rank: 5, type: 'gen'},
    {id: 'c8', name: 'Zetta Click', base: 50000000, scale: 1.35, max: 6, effect: 50000, desc: '+50K click', rank: 5, type: 'click'},
    {id: 'g10', name: 'Infinity Gen', base: 100000000, scale: 1.4, max: 6, effect: 5000000, desc: '+5M/s', rank: 5, type: 'gen'},
    
    // Rank 6 - Ultra late
    {id: 'c9', name: 'Yotta Click', base: 500000000, scale: 1.4, max: 5, effect: 250000, desc: '+250K click', rank: 6, type: 'click'},
    {id: 'g11', name: 'Omega Gen', base: 1000000000, scale: 1.5, max: 5, effect: 25000000, desc: '+25M/s', rank: 6, type: 'gen'},
    {id: 'c10', name: 'Brace Click', base: 5000000000, scale: 1.5, max: 4, effect: 1000000, desc: '+1M click', rank: 6, type: 'click'},
    {id: 'g12', name: 'Transcendental Gen', base: 10000000000, scale: 1.6, max: 4, effect: 100000000, desc: '+100M/s', rank: 6, type: 'gen'},
    
    // Rank 7 - Max level
    {id: 'g13', name: 'Quantum Singularity', base: 100000000000, scale: 2, max: 3, effect: 500000000, desc: '+500M/s', rank: 7, type: 'gen'},
    {id: 'c11', name: 'Absolute Click', base: 50000000000, scale: 2, max: 3, effect: 5000000, desc: '+5M click', rank: 7, type: 'click'},
    {id: 'g14', name: 'Divine Spark', base: 500000000000, scale: 2.5, max: 2, effect: 2000000000, desc: '+2B/s', rank: 7, type: 'gen'},
    {id: 'c12', name: 'Divine Click', base: 500000000000, scale: 2.5, max: 2, effect: 25000000, desc: '+25M click', rank: 7, type: 'click'},
];

// ========================
// RELICS DEFINITION
// ========================
const RELICS = [
    // Common (10 relics) - Basic bonuses
    {id: 'rc_001', name: 'Energy Shard', icon: '💎', rarity: 'common', tags: ['click'], baseBonus: {clickPower: 0.05}, perLevel: 0.03, maxLevel: 5, desc: '+5% click power'},
    {id: 'rc_002', name: 'Tiny Crystal', icon: '🔹', rarity: 'common', tags: ['cps'], baseBonus: {cps: 0.03}, perLevel: 0.02, maxLevel: 5, desc: '+3% CPS'},
    {id: 'rc_003', name: 'Broken Core', icon: '🌀', rarity: 'common', tags: ['crit'], baseBonus: {critChance: 0.01}, perLevel: 0.005, maxLevel: 5, desc: '+1% crit chance'},
    {id: 'rc_004', name: 'Dusty Orb', icon: '⚪', rarity: 'common', tags: ['combo'], baseBonus: {combo: 0.1}, perLevel: 0.05, maxLevel: 5, desc: '+10% combo'},
    {id: 'rc_005', name: 'Chipped Stone', icon: '🪨', rarity: 'common', tags: ['click'], baseBonus: {clickPower: 0.03}, perLevel: 0.02, maxLevel: 5, desc: '+3% click'},
    {id: 'rc_006', name: 'Faded Gem', icon: '💠', rarity: 'common', tags: ['cps'], baseBonus: {cps: 0.05}, perLevel: 0.03, maxLevel: 5, desc: '+5% CPS'},
    {id: 'rc_007', name: 'Old Relic', icon: '🏺', rarity: 'common', tags: ['prestige'], baseBonus: {prestigeBonus: 0.01}, perLevel: 0.005, maxLevel: 5, desc: '+1% prestige bonus'},
    {id: 'rc_008', name: 'Mini Idol', icon: '🗿', rarity: 'common', tags: ['click', 'cps'], baseBonus: {clickPower: 0.02, cps: 0.02}, perLevel: 0.015, maxLevel: 5, desc: '+2% click & CPS'},
    {id: 'rc_009', name: 'Shattered Lens', icon: '🔍', rarity: 'common', tags: ['crit'], baseBonus: {critMult: 0.05}, perLevel: 0.03, maxLevel: 5, desc: '+5% crit multiplier'},
    {id: 'rc_010', name: 'Pebble of Power', icon: '🟡', rarity: 'common', tags: ['boss'], baseBonus: {bossDmg: 0.03}, perLevel: 0.02, maxLevel: 5, desc: '+3% boss damage'},
    
    // Uncommon (15 relics) - Special abilities begin
    {id: 'ru_001', name: 'Quantum Core', icon: '⬡', rarity: 'uncommon', tags: ['click'], baseBonus: {clickPower: 0.15}, perLevel: 0.08, maxLevel: 7, desc: '+15% click power'},
    {id: 'ru_002', name: 'Time Fragment', icon: '⏳', rarity: 'uncommon', tags: ['cps'], baseBonus: {cps: 0.12}, perLevel: 0.06, maxLevel: 7, desc: '+12% CPS'},
    {id: 'ru_003', name: 'Vampire Fang', icon: '🧛', rarity: 'uncommon', tags: ['boss'], baseBonus: {bossDmg: 0.1, bossLifesteal: 0.02}, perLevel: 0.05, maxLevel: 7, desc: '+10% boss dmg', passive: 'onHitLifesteal', passiveDesc: 'Heal on boss hits'},
    {id: 'ru_004', name: 'Golden Ratio', icon: '📐', rarity: 'uncommon', tags: ['combo', 'crit'], baseBonus: {combo: 0.2, critChance: 0.02}, perLevel: 0.1, maxLevel: 7, desc: '+20% combo'},
    {id: 'ru_005', name: 'Void Stone', icon: '◼', rarity: 'uncommon', tags: ['click'], baseBonus: {clickPower: 0.12}, perLevel: 0.07, maxLevel: 7, desc: '+12% click power'},
    {id: 'ru_006', name: 'Solar Flare', icon: '☀️', rarity: 'uncommon', tags: ['cps'], baseBonus: {cps: 0.1}, perLevel: 0.06, maxLevel: 7, desc: '+10% CPS'},
    {id: 'ru_007', name: 'Lunar Crystal', icon: '🌙', rarity: 'uncommon', tags: ['crit'], baseBonus: {critChance: 0.03, critMult: 0.1}, perLevel: 0.02, maxLevel: 7, desc: '+3% crit'},
    {id: 'ru_008', name: 'Combo Matrix', icon: '🔢', rarity: 'uncommon', tags: ['combo'], baseBonus: {combo: 0.25, maxCombo: 1}, perLevel: 0.1, maxLevel: 7, desc: '+25% combo'},
    {id: 'ru_009', name: 'Prism Shard', icon: '🔶', rarity: 'uncommon', tags: ['click', 'cps', 'crit'], baseBonus: {clickPower: 0.05, cps: 0.05, critChance: 0.01}, perLevel: 0.03, maxLevel: 7, desc: '+5% all basic'},
    {id: 'ru_010', name: 'Cosmic Dust', icon: '🌌', rarity: 'uncommon', tags: ['prestige'], baseBonus: {prestigeBonus: 0.02}, perLevel: 0.01, maxLevel: 7, desc: '+2% prestige'},
    {id: 'ru_011', name: 'Titan\'s Fist', icon: '👊', rarity: 'uncommon', tags: ['boss'], baseBonus: {bossDmg: 0.15}, perLevel: 0.08, maxLevel: 7, desc: '+15% boss damage'},
    {id: 'ru_012', name: 'Mirror Shield', icon: '🛡️', rarity: 'uncommon', tags: ['boss'], baseBonus: {bossHpReduce: 0.05}, perLevel: 0.03, maxLevel: 7, desc: '-5% boss HP'},
    {id: 'ru_013', name: 'Energy Totem', icon: '🗿', rarity: 'uncommon', tags: ['energyGain'], baseBonus: {energyGain: 0.1}, perLevel: 0.05, maxLevel: 7, desc: '+10% energy gain'},
    {id: 'ru_014', name: 'Star Fragment', icon: '⭐', rarity: 'uncommon', tags: ['cps'], baseBonus: {cps: 0.08}, perLevel: 0.05, maxLevel: 7, desc: '+8% CPS'},
    {id: 'ru_015', name: 'Phoenix Feather', icon: '🪶', rarity: 'uncommon', tags: ['boss'], baseBonus: {bossResurrect: 1}, perLevel: 0, maxLevel: 1, desc: '+1 resurrect'},
    
    // Rare (15 relics) - Stronger bonuses + specials
    {id: 'rr_001', name: 'Infinity Gauntlet', icon: '🧤', rarity: 'rare', tags: ['click'], baseBonus: {clickPower: 0.3}, perLevel: 0.15, maxLevel: 10, desc: '+30% click power'},
    {id: 'rr_002', name: 'Eternal Engine', icon: '⚙️', rarity: 'rare', tags: ['cps'], baseBonus: {cps: 0.25}, perLevel: 0.12, maxLevel: 10, desc: '+25% CPS'},
    {id: 'rr_003', name: 'Mastery Orb', icon: '🔮', rarity: 'rare', tags: ['click', 'cps'], baseBonus: {clickPower: 0.15, cps: 0.15}, perLevel: 0.08, maxLevel: 10, desc: '+15% click & CPS'},
    {id: 'rr_004', name: 'Eye of Chaos', icon: '👁️', rarity: 'rare', tags: ['crit'], baseBonus: {critChance: 0.08, critMult: 0.25}, perLevel: 0.04, maxLevel: 10, desc: '+8% crit'},
    {id: 'rr_005', name: 'Combo King Crown', icon: '👑', rarity: 'rare', tags: ['combo'], baseBonus: {combo: 0.5, maxCombo: 2}, perLevel: 0.2, maxLevel: 10, desc: '+50% combo'},
    {id: 'rr_006', name: 'Multiverse Essence', icon: '🧬', rarity: 'rare', tags: ['prestige'], baseBonus: {prestigeBonus: 0.05}, perLevel: 0.02, maxLevel: 10, desc: '+5% prestige'},
    {id: 'rr_007', name: 'Ascension Stone', icon: '🪨', rarity: 'rare', tags: ['prestige', 'click', 'cps'], baseBonus: {prestigeBonus: 0.03, clickPower: 0.1, cps: 0.1}, perLevel: 0.02, maxLevel: 10, desc: '+3% prestige'},
    {id: 'rr_008', name: 'Dragon Scale', icon: '🐉', rarity: 'rare', tags: ['boss'], baseBonus: {bossDmg: 0.25, bossHpReduce: 0.1}, perLevel: 0.12, maxLevel: 10, desc: '+25% boss dmg'},
    {id: 'rr_009', name: 'Divine Hammer', icon: '🔨', rarity: 'rare', tags: ['boss'], baseBonus: {bossDmg: 0.3}, perLevel: 0.15, maxLevel: 10, desc: '+30% boss damage'},
    {id: 'rr_010', name: 'Angel Wings', icon: '😇', rarity: 'rare', tags: ['click', 'boss'], baseBonus: {clickPower: 0.2, bossDmg: 0.15}, perLevel: 0.1, maxLevel: 10, desc: '+20% click'},
    {id: 'rr_011', name: 'Demon Horn', icon: '😈', rarity: 'rare', tags: ['crit', 'boss'], baseBonus: {critChance: 0.05, bossDmg: 0.2}, perLevel: 0.03, maxLevel: 10, desc: '+5% crit'},
    {id: 'rr_012', name: 'Reality Anchor', icon: '⚓', rarity: 'rare', tags: ['energyGain'], baseBonus: {energyGain: 0.2}, perLevel: 0.1, maxLevel: 10, desc: '+20% energy gain'},
    {id: 'rr_013', name: 'Time Machine', icon: '⏰', rarity: 'rare', tags: ['cps'], baseBonus: {cps: 0.2}, perLevel: 0.1, maxLevel: 10, desc: '+20% CPS'},
    {id: 'rr_014', name: 'Gravity Well', icon: '🕳️', rarity: 'rare', tags: ['click', 'cps'], baseBonus: {clickPower: 0.12, cps: 0.18}, perLevel: 0.06, maxLevel: 10, desc: '+12% click'},
    {id: 'rr_015', name: 'Chain Lightning', icon: '⚡', rarity: 'rare', tags: ['click'], baseBonus: {clickPower: 0.2, chainDamage: 0.15}, perLevel: 0.1, maxLevel: 10, desc: '+20% click', passive: 'chainLightning', passiveDesc: 'Chain to nearby enemies'},
    
    // Epic (10 relics) - Very strong + special powers
    {id: 're_001', name: 'Quantum Singularity', icon: '🔵', rarity: 'epic', tags: ['click', 'cps'], baseBonus: {clickPower: 0.4, cps: 0.35}, perLevel: 0.2, maxLevel: 10, desc: '+40% click'},
    {id: 're_002', name: 'Omega Matrix', icon: 'Ω', rarity: 'epic', tags: ['click', 'cps', 'crit'], baseBonus: {clickPower: 0.25, cps: 0.25, critChance: 0.05}, perLevel: 0.12, maxLevel: 10, desc: '+25% all basic'},
    {id: 're_003', name: 'Destiny Thread', icon: '🧵', rarity: 'epic', tags: ['combo', 'crit'], baseBonus: {combo: 0.8, critChance: 0.08}, perLevel: 0.4, maxLevel: 10, desc: '+80% combo'},
    {id: 're_004', name: 'Fate Book', icon: '📖', rarity: 'epic', tags: ['crit', 'critMult'], baseBonus: {critChance: 0.06, critMult: 0.5}, perLevel: 0.03, maxLevel: 10, desc: '+6% crit'},
    {id: 're_005', name: 'Ascension Gem', icon: '💎', rarity: 'epic', tags: ['prestige'], baseBonus: {prestigeBonus: 0.1}, perLevel: 0.05, maxLevel: 10, desc: '+10% prestige'},
    {id: 're_006', name: 'Transcendence', icon: '🌀', rarity: 'epic', tags: ['prestige', 'click', 'cps'], baseBonus: {prestigeBonus: 0.08, clickPower: 0.2, cps: 0.2}, perLevel: 0.04, maxLevel: 10, desc: '+8% prestige'},
    {id: 're_007', name: 'God Slayer', icon: '⚔️', rarity: 'epic', tags: ['boss'], baseBonus: {bossDmg: 0.5}, perLevel: 0.25, maxLevel: 10, desc: '+50% boss damage'},
    {id: 're_008', name: 'Anti Matter', icon: '❌', rarity: 'epic', tags: ['boss'], baseBonus: {bossDmg: 0.4, bossHpReduce: 0.2}, perLevel: 0.2, maxLevel: 10, desc: '+40% boss dmg'},
    {id: 're_009', name: 'Cosmic Emperor', icon: '👑', rarity: 'epic', tags: ['click', 'cps', 'boss'], baseBonus: {clickPower: 0.3, cps: 0.3, bossDmg: 0.3}, perLevel: 0.15, maxLevel: 10, desc: '+30% all main'},
    {id: 're_010', name: 'Soul Siphon', icon: '👻', rarity: 'epic', tags: ['boss'], baseBonus: {bossDmg: 0.35, bossLifesteal: 0.1}, perLevel: 0.15, maxLevel: 10, desc: '+35% boss dmg', passive: 'vampiric', passiveDesc: 'Life steal from bosses'},
    
    // Legendary (5 relics) - Ultimate + active abilities
    {id: 'rl_001', name: 'Void Heart', icon: '💔', rarity: 'legendary', tags: ['boss'], baseBonus: {bossDmg: 1.0, bossHpReduce: 0.3}, perLevel: 0.5, maxLevel: 10, desc: '+100% boss dmg'},
    {id: 'rl_002', name: 'Cosmic Serpent', icon: '🐍', rarity: 'legendary', tags: ['click', 'cps', 'boss'], baseBonus: {clickPower: 0.6, cps: 0.6, bossDmg: 0.6}, perLevel: 0.3, maxLevel: 10, desc: '+60% all main'},
    {id: 'rl_003', name: 'Reality Breaker', icon: '💢', rarity: 'legendary', tags: ['click', 'crit', 'boss'], baseBonus: {clickPower: 0.5, critChance: 0.15, critMult: 1.0, bossDmg: 0.5}, perLevel: 0.25, maxLevel: 10, desc: '+50% click'},
    {id: 'rl_004', name: 'Infinity Star', icon: '⭐', rarity: 'legendary', tags: ['click', 'cps'], baseBonus: {clickPower: 0.8, cps: 0.8}, perLevel: 0.4, maxLevel: 10, desc: '+80% click & CPS'},
    {id: 'rl_005', name: 'Ultimate Form', icon: '🌟', rarity: 'legendary', tags: ['click', 'cps', 'crit', 'combo', 'boss'], baseBonus: {clickPower: 0.75, cps: 0.75, critChance: 0.1, combo: 0.75, bossDmg: 0.75}, perLevel: 0.38, maxLevel: 10, desc: '+75% all combat'},
];

// Cosmic Relics - NEW SET
const COSMIC_RELICS = [
    {id: 'cr_nebula', name: 'Nebula Heart', icon: '🌌', rarity: 'epic', tags: ['cps', 'synergy'], baseBonus: {cps: 0.15, synergyBonus: 0.01}, perLevel: 0.08, maxLevel: 10, desc: '+15% CPS, +1% per relic', passive: 'synergy', passiveDesc: 'Gains +1% for each relic owned'},
    {id: 'cr_starforge', name: 'Starforge Core', icon: '⚙️', rarity: 'epic', tags: ['click', 'crit'], baseBonus: {clickPower: 0.1, moltenChance: 0.1}, perLevel: 0.05, maxLevel: 10, desc: '+10% clicks, 10% molten stars', passive: 'molten', passiveDesc: '10% chance for molten star bursts'},
    {id: 'cr_voidbattery', name: 'Void Battery', icon: '🔋', rarity: 'epic', tags: ['cps', 'offline'], baseBonus: {offlineStore: 0.5, overflow: 0.25}, perLevel: 0.15, maxLevel: 10, desc: '+50% offline storage', passive: 'offline', passiveDesc: 'Stores energy while offline'},
    {id: 'cr_treasury', name: 'Galactic Treasury', icon: '🏛️', rarity: 'rare', tags: ['click', 'scale'], baseBonus: {clickPower: 0.01, treasury: 0.001}, perLevel: 0, maxLevel: 100, desc: '+0.1% per 100 clicks (infinite)', passive: 'infinite', passiveDesc: 'Scales infinitely with clicks'},
    {id: 'cr_darkmatter', name: 'Dark Matter Reactor', icon: '⚛️', rarity: 'legendary', tags: ['special', 'upgrade'], baseBonus: {dupChance: 0.02, corruption: 0.05}, perLevel: 0.01, maxLevel: 5, desc: '2% chance to duplicate', passive: 'duplicate', passiveDesc: 'Randomly duplicates upgrades'},
    {id: 'cr_quantum', name: 'Quantum Fingers', icon: '👆', rarity: 'rare', tags: ['click', 'crit'], baseBonus: {clickPower: 0.08, critMult: 0.5}, perLevel: 0.04, maxLevel: 10, desc: '+8% click, 5x crits', passive: 'quantum', passiveDesc: 'Clicks can crit for 5x'},
    {id: 'cr_neutron', name: 'Neutron Gauntlet', icon: '🥊', rarity: 'rare', tags: ['click', 'blast'], baseBonus: {clickPower: 0.12, blastFreq: 25}, perLevel: 0.06, maxLevel: 10, desc: 'Every 25 clicks = blast', passive: 'blast', passiveDesc: 'Every 25 clicks unleashes energy blast'},
    {id: 'cr_pulse', name: 'Pulse Accelerator', icon: '📈', rarity: 'uncommon', tags: ['click', 'speed'], baseBonus: {clickPower: 0.05, accel: 0.02}, perLevel: 0.03, maxLevel: 10, desc: '+5% click, builds speed', passive: 'accelerate', passiveDesc: 'Click speed increases over time'},
    {id: 'cr_asteroid', name: 'Asteroid Knuckles', icon: '☄️', rarity: 'uncommon', tags: ['click', 'loot'], baseBonus: {clickPower: 0.06, lootChance: 0.05}, perLevel: 0.03, maxLevel: 7, desc: '6% click, asteroid loot', passive: 'loot', passiveDesc: 'Spawns asteroid impacts with loot'},
    {id: 'cr_timedilate', name: 'Time Dilation Engine', icon: '⏲️', rarity: 'epic', tags: ['cps', 'time'], baseBonus: {cps: 0.05, timeScale: 0.001}, perLevel: 0.03, maxLevel: 10, desc: '+5% CPS, speeds over time', passive: 'timewarp', passiveDesc: 'Speed increases every minute'},
    {id: 'cr_chronovault', name: 'Chrono Vault', icon: '🗄️', rarity: 'epic', tags: ['prestige', 'save'], baseBonus: {prestigeBonus: 0.08, preserve: 0.15}, perLevel: 0.04, maxLevel: 10, desc: 'Preserves 15% boosts', passive: 'preserve', passiveDesc: 'Saves boosts after prestige'},
    {id: 'cr_paradox', name: 'Paradox Loop', icon: '🔄', rarity: 'legendary', tags: ['prestige', 'scale'], baseBonus: {prestigeBonus: 0.1, timeline: 0.05}, perLevel: 0.05, maxLevel: 10, desc: '+10% prestige, stronger each', passive: 'timeline', passiveDesc: 'Stronger rewards per prestige'},
    {id: 'cr_mirror', name: 'Mirror Universe Core', icon: '🪞', rarity: 'epic', tags: ['synergy'], baseBonus: {shadowRelics: 0.25, synergyBonus: 0.15}, perLevel: 0.1, maxLevel: 10, desc: '25% shadow relic copies', passive: 'shadow', passiveDesc: 'Creates shadow copies of relics'},
    {id: 'cr_solarcrown', name: 'Solar Crown', icon: '👑', rarity: 'epic', tags: ['click', 'cps', 'heat'], baseBonus: {clickPower: 0.15, cps: 0.1, heat: 0.02}, perLevel: 0.08, maxLevel: 10, desc: '+15% click, heat builds', passive: 'heat', passiveDesc: 'Heat builds into production multiplier'},
    {id: 'cr_cryo', name: 'Cryo Prism', icon: '❄️', rarity: 'rare', tags: ['special', 'cool'], baseBonus: {cooldownReduce: 0.15, freezeDecay: 0.1}, perLevel: 0.08, maxLevel: 7, desc: '15% faster cooldowns', passive: 'freeze', passiveDesc: 'Slows negative effects'},
    {id: 'cr_planetcore', name: 'Planetary Core', icon: '🌍', rarity: 'rare', tags: ['cps', 'planet'], baseBonus: {cps: 0.1, planetBonus: 0.05}, perLevel: 0.05, maxLevel: 10, desc: '+10% CPS, planet boosts', passive: 'planets', passiveDesc: 'Each planet upgrade boosts all'},
    {id: 'cr_terraform', name: 'Terraform Beacon', icon: '🚦', rarity: 'epic', tags: ['cps', 'evolve'], baseBonus: {cps: 0.12, evolve: 0.02}, perLevel: 0.06, maxLevel: 10, desc: '+12% CPS, evolves', passive: 'evolve', passiveDesc: 'Planets evolve over time'},
    {id: 'cr_entropy', name: 'Entropy Prism', icon: '🌈', rarity: 'legendary', tags: ['random', 'chaos'], baseBonus: {randomBonus: 0.1, mutation: 0.05}, perLevel: 0.05, maxLevel: 10, desc: '10% random boost', passive: 'random', passiveDesc: 'Randomizes stats occasionally'},
    {id: 'cr_chaos', name: 'Chaos Bloom', icon: '🌸', rarity: 'epic', tags: ['random', 'scale'], baseBonus: {chaosScale: 0.1, randomBonus: 0.08}, perLevel: 0.05, maxLevel: 10, desc: 'More randoms = stronger', passive: 'chaos', passiveDesc: 'Random effects stack multiplicatively'},
    {id: 'cr_voidparasite', name: 'Void Parasite', icon: '🦑', rarity: 'legendary', tags: ['consume', 'evolve'], baseBonus: {consume: 0.1, evolve: 0.05}, perLevel: 0.05, maxLevel: 10, desc: 'Consumes weak effects', passive: 'consume', passiveDesc: 'Consumes relics to grow stronger'},
    {id: 'cr_monolith', name: 'Alien Monolith', icon: '🗿', rarity: 'epic', tags: ['special', 'event'], baseBonus: {signalChance: 0.05, reward: 0.15}, perLevel: 0.03, maxLevel: 10, desc: '5% chance signals', passive: 'signal', passiveDesc: 'Unlocks mysterious signals'},
    {id: 'cr_gravity', name: 'Gravity Well', icon: '🕳️', rarity: 'rare', tags: ['auto', 'pull'], baseBonus: {autoPull: 0.1, speedBonus: 0.15}, perLevel: 0.05, maxLevel: 10, desc: 'Auto-collects rewards', passive: 'gravity', passiveDesc: 'Pulls nearby rewards automatically'},
    {id: 'cr_blackhole', name: 'Black Hole Eye', icon: '👁️', rarity: 'legendary', tags: ['compress', 'boss'], baseBonus: {compress: 0.15, bossDmg: 0.2}, perLevel: 0.08, maxLevel: 10, desc: '15% compression', passive: 'compress', passiveDesc: 'Compresses small rewards'},
    {id: 'cr_singularity', name: 'Singularity Throne', icon: '🌀', rarity: 'legendary', tags: ['synergy', 'scale'], baseBonus: {globalBonus: 0.03, relicScale: 0.02}, perLevel: 0.02, maxLevel: 10, desc: '+3% per relic', passive: 'singularity', passiveDesc: 'Every relic boosts everything'},
    {id: 'cr_seed', name: 'Eternal Seed', icon: '🌱', rarity: 'mythic', tags: ['permanent', 'time'], baseBonus: {permanent: 0.001, hourly: 0.01}, perLevel: 0.001, maxLevel: 100, desc: '+0.1% per hour played', passive: 'eternal', passiveDesc: 'Permanent growth forever'},
    {id: 'cr_archive', name: 'Celestial Archive', icon: '📚', rarity: 'mythic', tags: ['set', 'synergy'], baseBonus: {setBonus: 0.1, constellation: 0.05}, perLevel: 0.05, maxLevel: 10, desc: 'Set completion bonuses', passive: 'sets', passiveDesc: 'Completing relic sets unlocks bonuses'},
    {id: 'cr_oracle', name: 'Oracle Engine', icon: '🔮', rarity: 'mythic', tags: ['predict', 'choice'], baseBonus: {predict: 0.1, choice: 0.05}, perLevel: 0.05, maxLevel: 10, desc: 'Predicts events', passive: 'predict', passiveDesc: 'Can predict and choose outcomes'},
];

const RELIC_SETS = [
    {id: 'supernova', name: 'Supernova', relics: ['cr_starforge', 'cr_solarcrown', 'cr_neutron'], bonus: {cps: 0.5}, desc: 'Stars explode for waves'},
    {id: 'voidborn', name: 'Voidborn', relics: ['cr_voidbattery', 'cr_voidparasite', 'cr_blackhole'], bonus: {offlineMutate: 0.25}, desc: 'Offline can mutate'},
    {id: 'timebreaker', name: 'Timebreaker', relics: ['cr_timedilate', 'cr_chronovault', 'cr_paradox'], bonus: {timeSkip: 0.1}, desc: 'Skip time occasionally'},
    {id: 'cosmic_hive', name: 'Cosmic Hive', relics: ['cr_terraform', 'cr_monolith', 'cr_planetcore'], bonus: {drones: 0.15}, desc: 'Auto-generating drones'},
];

const RARITY_RATES = { common: 0.55, uncommon: 0.22, rare: 0.12, epic: 0.06, legendary: 0.025, mythic: 0.005 };
const RARITY_COLORS = { common: '#888888', uncommon: '#44aa44', rare: '#4488ff', epic: '#aa44ff', legendary: '#ffaa00', mythic: '#ff44ff' };

const RELIC_PASSIVES = {
    onHitLifesteal: { name: 'Life Drain', desc: 'Heal for %s of damage dealt to bosses', trigger: 'onBossHit' },
    chainLightning: { name: 'Chain Lightning', desc: 'Damage chains to %s nearby enemies', trigger: 'onClick', effect: 'chain' },
    vampiric: { name: 'Vampiric Touch', desc: 'Life steal %s from boss damage', trigger: 'onBossHit' },
    shield: { name: 'Energy Shield', desc: 'Block %s damage once per battle', trigger: 'onBossStart' },
    thorns: { name: 'Thorns', desc: 'Reflect %s damage back to attacker', trigger: 'onHit' },
    fury: { name: 'Fury', desc: 'Gain %s crit chance when below 25% HP', trigger: 'onLowHp' },
};

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
// PRESTIGE RANKS
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

// Make global for other scripts
window.GAME = GAME;
window.UPGRADES = UPGRADES;
window.RELICS = RELICS;
window.COSMIC_RELICS = COSMIC_RELICS;
window.RELIC_SETS = RELIC_SETS;
window.RARITY_RATES = RARITY_RATES;
window.RARITY_COLORS = RARITY_COLORS;
window.ACHIEVEMENTS = ACHIEVEMENTS;
window.PRESTIGE = PRESTIGE;
window.ABILITIES = ABILITIES;
window.BOSSES = BOSSES;
window.ZONES = ZONES;
window.RELIC_PASSIVES = RELIC_PASSIVES;