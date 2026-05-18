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

    relicShopItems: [],
    relicShopRotation: 0,
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
    {id: 'v', name: 'The Void', mult: 1, cost: 0, unlocked: true, desc: 'Starting realm', theme: 'void'},
    {id: 'q', name: 'Quantum Realm', mult: 2, cost: 500, unlocked: false, desc: '2x all production', theme: 'quantum', unlockUpgrade: 'zone_q'},
    {id: 't', name: 'Time Stream', mult: 5, cost: 2500, unlocked: false, desc: '5x all production', theme: 'time', unlockUpgrade: 'zone_t'},
    {id: 'm', name: 'Matter Plains', mult: 10, cost: 15000, unlocked: false, desc: '10x all production', theme: 'matter', unlockUpgrade: 'zone_m'},
    {id: 'l', name: 'Light Domain', mult: 25, cost: 75000, unlocked: false, desc: '25x all production', theme: 'light', unlockUpgrade: 'zone_l'},
    {id: 'd', name: 'Dark Abyss', mult: 50, cost: 300000, unlocked: false, desc: '50x all production', theme: 'dark', unlockUpgrade: 'zone_d'},
    {id: 'e', name: 'Eternal Plane', mult: 100, cost: 1500000, unlocked: false, desc: '100x all production', theme: 'eternal', unlockUpgrade: 'zone_e'},
    {id: 'inf', name: 'Infinity', mult: 250, cost: 10000000, unlocked: false, desc: '250x all production', theme: 'infinity', unlockUpgrade: 'zone_inf'},
];

function checkZoneUnlocks() {
    ZONES.forEach(z => {
        if (!z.unlocked) {
            if (z.unlockUpgrade) {
                if (GAME.upgrades[z.unlockUpgrade] && GAME.upgrades[z.unlockUpgrade] > 0) {
                    z.unlocked = true;
                }
            } else if (GAME.lifetimeEnergy >= z.cost) {
                z.unlocked = true;
            }
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
    
    // Zone Unlock Upgrades
    {id: 'zone_q', name: 'Quantum Gateway', base: 100, scale: 1, max: 1, effect: 0, desc: 'Unlock Quantum Realm', rank: 0, type: 'special'},
    {id: 'zone_t', name: 'Time Warp Gate', base: 500, scale: 1, max: 1, effect: 0, desc: 'Unlock Time Stream', rank: 1, type: 'special'},
    {id: 'zone_m', name: 'Matter Transmuter', base: 2500, scale: 1, max: 1, effect: 0, desc: 'Unlock Matter Plains', rank: 2, type: 'special'},
    {id: 'zone_l', name: 'Light Beacon', base: 10000, scale: 1, max: 1, effect: 0, desc: 'Unlock Light Domain', rank: 3, type: 'special'},
    {id: 'zone_d', name: 'Dark Portal', base: 50000, scale: 1, max: 1, effect: 0, desc: 'Unlock Dark Abyss', rank: 4, type: 'special'},
    {id: 'zone_e', name: 'Eternal Rift', base: 250000, scale: 1, max: 1, effect: 0, desc: 'Unlock Eternal Plane', rank: 5, type: 'special'},
    {id: 'zone_inf', name: 'Infinity Key', base: 2500000, scale: 1, max: 1, effect: 0, desc: 'Unlock Infinity', rank: 6, type: 'special'},
];

// ========================
// RELICS - Complete Space Relic System
// ========================
const RELICS = [
    // ===== COSMIC CORE RELICS (Economy/Production) =====
    { id: 'nebula_heart', name: 'Nebula Heart', icon: '🌌', rarity: 'rare', tags: ['cosmic', 'passive', 'synergy'], 
      rarityTier: 2, maxLevel: 10, desc: '+15% passive income, +1% per different relic',
      baseBonus: { cpsMult: 0.15, relicSynergy: 0.01 },
      combo: { starforge_core: 'doubleFactory', void_battery: 'offlinePassive' } },
    
    { id: 'starforge_core', name: 'Starforge Core', icon: '🔥', rarity: 'rare', tags: ['cosmic', 'click', 'burst'], 
      rarityTier: 2, maxLevel: 10, desc: '10% chance clicks create molten stars',
      baseBonus: { clickPower: 0.2, moltenChance: 0.1 },
      combo: { solar_crown: 'chainReaction', quantum_fingers: 'moltenSpeed' } },
    
    { id: 'void_battery', name: 'Void Battery', icon: '🔋', rarity: 'rare', tags: ['cosmic', 'offline', 'storage'], 
      rarityTier: 2, maxLevel: 10, desc: 'Store unused energy, converts to boosts',
      baseBonus: { offlineGain: 0.3, energyStorage: 0.2 },
      combo: { time_dilation_engine: 'exponentialOffline', dark_matter_reactor: 'overflowCap' } },
    
    { id: 'galactic_treasury', name: 'Galactic Treasury', icon: '💰', rarity: 'uncommon', tags: ['cosmic', 'scaling', 'click'], 
      rarityTier: 1, maxLevel: 15, desc: 'Every 100 clicks = +0.1% income permanently',
      baseBonus: { clickPower: 0.1, permanentScaling: 0.001 },
      combo: { greed_singularity: 'fastGrowth', chrono_vault: 'idleCredit' } },
    
    { id: 'dark_matter_reactor', name: 'Dark Matter Reactor', icon: '⚛️', rarity: 'epic', tags: ['cosmic', 'duplication', 'upgrade'], 
      rarityTier: 3, maxLevel: 8, desc: 'Randomly duplicates purchased upgrades',
      baseBonus: { upgradeDuplication: 0.15, rareDupeNeg: 0.1 },
      combo: { entropy_prism: 'corruptionBonus', void_battery: 'freeDupe' } },

    // ===== CLICKING RELICS =====
    { id: 'quantum_fingers', name: 'Quantum Fingers', icon: '👌', rarity: 'uncommon', tags: ['click', 'crit'], 
      rarityTier: 1, maxLevel: 10, desc: 'Clicks crit for 5x, crit chance grows with combos',
      baseBonus: { clickPower: 0.25, critChance: 0.05, critMult: 0.5 },
      combo: { neutron_gauntlet: 'critShockwave', pulse_accelerator: 'slowDecay' } },
    
    { id: 'neutron_gauntlet', name: 'Neutron Gauntlet', icon: '🥊', rarity: 'uncommon', tags: ['click', 'auto'], 
      rarityTier: 1, maxLevel: 10, desc: 'Every 25 clicks unleashes energy blast',
      baseBonus: { clickPower: 0.2, blastPower: 0.15 },
      combo: { plasma_orbitals: 'blastBounce', solar_crown: 'igniteBurn' } },
    
    { id: 'pulse_accelerator', name: 'Pulse Accelerator', icon: '⚡', rarity: 'rare', tags: ['click', 'speed'], 
      rarityTier: 2, maxLevel: 8, desc: 'Click speed increases over time while clicking',
      baseBonus: { clickSpeedBonus: 0.3, comboRetention: 0.2 },
      combo: { time_dilation_engine: 'slowReset', quantum_fingers: 'critChain' } },
    
    { id: 'asteroid_knuckles', name: 'Asteroid Knuckles', icon: '🌑', rarity: 'uncommon', tags: ['click', 'loot'], 
      rarityTier: 1, maxLevel: 10, desc: 'Clicking spawns asteroid impacts with loot',
      baseBonus: { clickPower: 0.15, lootChance: 0.1 },
      combo: { gravity_well: 'pullRewards', comet_engine: 'cursorBonus' } },

    // ===== TIME/REALITY RELICS =====
    { id: 'time_dilation_engine', name: 'Time Dilation Engine', icon: '⏱️', rarity: 'epic', tags: ['time', 'speed', 'prestige'], 
      rarityTier: 3, maxLevel: 8, desc: 'Game speed increases every minute',
      baseBonus: { timeSpeedBonus: 0.1, globalSpeed: 0.05 },
      combo: { chrono_vault: 'preservedSpeed', void_battery: 'doubleOffline' } },
    
    { id: 'chrono_vault', name: 'Chrono Vault', icon: '🗄️', rarity: 'epic', tags: ['time', 'prestige', 'preservation'], 
      rarityTier: 3, maxLevel: 8, desc: 'Preserves percentage of boosts after prestige',
      baseBonus: { prestigePreserve: 0.2, resetBonus: 0.15 },
      combo: { eternal_seed: 'permanentScale', paradox_loop: 'stackPreserved' } },
    
    { id: 'paradox_loop', name: 'Paradox Loop', icon: '🔄', rarity: 'epic', tags: ['time', 'prestige', 'scaling'], 
      rarityTier: 3, maxLevel: 8, desc: 'Each reset = alternate timeline bonus',
      baseBonus: { prestigeBonus: 0.3, timelineBonus: 0.05 },
      combo: { mirror_universe_core: 'timelineInteract', entropy_prism: 'mutateTimeline' } },
    
    { id: 'mirror_universe_core', name: 'Mirror Universe Core', icon: '🪞', rarity: 'rare', tags: ['time', 'shadow', 'collection'], 
      rarityTier: 2, maxLevel: 8, desc: 'Creates shadow copies of relics',
      baseBonus: { shadowCopyPower: 0.3, setProgress: 0.1 },
      combo: { paradox_loop: 'shadowScale', celestial_archive: 'copyCount' } },

    // ===== STAR/PLANET RELICS =====
    { id: 'solar_crown', name: 'Solar Crown', icon: '👑', rarity: 'rare', tags: ['star', 'heat', 'production'], 
      rarityTier: 2, maxLevel: 10, desc: 'Heat builds over time, more heat = bigger multiplier',
      baseBonus: { heatMultiplier: 0.25, productionBonus: 0.2 },
      combo: { cryo_prism: 'preventOverheat', starforge_core: 'moltenValue' } },
    
    { id: 'cryo_prism', name: 'Cryo Prism', icon: '❄️', rarity: 'rare', tags: ['star', 'slow', 'freeze'], 
      rarityTier: 2, maxLevel: 10, desc: 'Slows negative effects, freezes combo decay',
      baseBonus: { cooldownReduction: 0.2, comboFreeze: 0.15 },
      combo: { frost_nova_capsule: 'frozenShatter', solar_crown: 'heatConvert' } },
    
    { id: 'planetary_core', name: 'Planetary Core', icon: '🪐', rarity: 'rare', tags: ['star', 'planet', 'multiplier'], 
      rarityTier: 2, maxLevel: 10, desc: 'Each planet upgrade increases all multipliers',
      baseBonus: { planetBonus: 0.15, globalMult: 0.1 },
      combo: { orbital_matrix: 'systemBonus', terraform_beacon: 'evolvingPlanets' } },
    
    { id: 'terraform_beacon', name: 'Terraform Beacon', icon: '🏗️', rarity: 'epic', tags: ['star', 'planet', 'evolution'], 
      rarityTier: 3, maxLevel: 8, desc: 'Planets slowly evolve, gaining unique traits',
      baseBonus: { evolutionSpeed: 0.2, traitBonus: 0.15 },
      combo: { bio_stellar_seed: 'lifeBonus', planetary_core: 'doubleEvolved' } },

    // ===== WEIRD/ALIEN RELICS =====
    { id: 'entropy_prism', name: 'Entropy Prism', icon: '🌈', rarity: 'epic', tags: ['alien', 'random', 'mutation'], 
      rarityTier: 3, maxLevel: 8, desc: 'Randomizes one stat every few minutes',
      baseBonus: { randomBonus: 0.25, mutationChance: 0.1 },
      combo: { chaos_bloom: 'strongerRandoms', dark_matter_reactor: 'mutateDupe' } },
    
    { id: 'chaos_bloom', name: 'Chaos Bloom', icon: '🌸', rarity: 'epic', tags: ['alien', 'random', 'scaling'], 
      rarityTier: 3, maxLevel: 8, desc: 'More random effects = stronger all bonuses',
      baseBonus: { chaosBonus: 0.2, randomMult: 0.1 },
      combo: { entropy_prism: 'chainMutation', void_parasite: 'permanentUnstable' } },
    
    { id: 'void_parasite', name: 'Void Parasite', icon: '🕳️', rarity: 'epic', tags: ['alien', 'consume', 'evolution'], 
      rarityTier: 3, maxLevel: 8, desc: 'Consumes weak effects to strengthen itself',
      baseBonus: { consumePower: 0.2, evolveSpeed: 0.15 },
      combo: { eternal_seed: 'consumedPermanent', black_hole_eye: 'devourGravity' } },
    
    { id: 'alien_monolith', name: 'Alien Monolith', icon: '🗿', rarity: 'rare', tags: ['alien', 'signal', 'event'], 
      rarityTier: 2, maxLevel: 10, desc: 'Unlocks mysterious signals with rewards/disasters',
      baseBonus: { signalChance: 0.15, eventBonus: 0.2 },
      combo: { deep_space_antenna: 'moreSignals', oracle_engine: 'predictOutcomes' } },

    // ===== GRAVITY/BLACK HOLE RELICS =====
    { id: 'gravity_well', name: 'Gravity Well', icon: '🕳️', rarity: 'uncommon', tags: ['gravity', 'pull', 'auto'], 
      rarityTier: 1, maxLevel: 10, desc: 'Pulls nearby rewards automatically',
      baseBonus: { autoPull: 0.2, pullSpeed: 0.15 },
      combo: { black_hole_eye: 'compressionMult', asteroid_knuckles: 'dragLoot' } },
    
    { id: 'black_hole_eye', name: 'Black Hole Eye', icon: '👁️', rarity: 'rare', tags: ['gravity', 'compress', 'burst'], 
      rarityTier: 2, maxLevel: 10, desc: 'Compresses small rewards into huge bursts',
      baseBonus: { compression: 0.25, burstPower: 0.2 },
      combo: { singularity_throne: 'noLoss', void_parasite: 'consumedPower' } },
    
    { id: 'singularity_throne', name: 'Singularity Throne', icon: '🪑', rarity: 'legendary', tags: ['gravity', 'global', 'scaling'], 
      rarityTier: 4, maxLevel: 5, desc: 'Every active relic boosts every other relic',
      baseBonus: { globalBoost: 0.05, relicSynergy: 0.03 },
      combo: {} }, // Literally combos with everything

    // ===== RARE MYTHIC RELICS =====
    { id: 'eternal_seed', name: 'Eternal Seed', icon: '🌱', rarity: 'legendary', tags: ['mythic', 'permanent', 'account'], 
      rarityTier: 4, maxLevel: 5, desc: 'Every hour = permanent account-wide growth',
      baseBonus: { permanentGrowth: 0.02, neverReset: 0.01 },
      combo: { chrono_vault: {}, void_parasite: {} } },
    
    { id: 'celestial_archive', name: 'Celestial Archive', icon: '📚', rarity: 'legendary', tags: ['mythic', 'collection', 'set'], 
      rarityTier: 4, maxLevel: 5, desc: 'Completing sets unlocks hidden bonuses',
      baseBonus: { setCompletion: 0.25, constellationBonus: 0.15 },
      combo: { mirror_universe_core: {}, oracle_engine: {} } },
    
    { id: 'oracle_engine', name: 'Oracle Engine', icon: '🔮', rarity: 'legendary', tags: ['mythic', 'predict', 'choice'], 
      rarityTier: 4, maxLevel: 5, desc: 'Predicts boosts/events, lets choose outcomes',
      baseBonus: { predictionBonus: 0.2, choiceChance: 0.15 },
      combo: { alien_monolith: {}, entropy_prism: {} } },

    // ===== SET BONUS RELICS (For completing sets) =====
    { id: 'supernova_core', name: 'Supernova Core', icon: '💥', rarity: 'epic', tags: ['set', 'supernova'], 
      rarityTier: 3, maxLevel: 5, desc: 'Supernova Set reward - Stars explode for giant waves',
      baseBonus: { supernovaWaves: 0.3, starExplosion: 0.25 },
      setRequired: 'supernova_set' },
    
    { id: 'voidborn_essence', name: 'Voidborn Essence', icon: '🌑', rarity: 'epic', tags: ['set', 'voidborn'], 
      rarityTier: 3, maxLevel: 5, desc: 'Voidborn Set reward - Offline can mutate',
      baseBonus: { voidMutate: 0.25, offlineMutate: 0.2 },
      setRequired: 'voidborn_set' },
    
    { id: 'timebreaker_eye', name: 'Timebreaker Eye', icon: '⏰', rarity: 'epic', tags: ['set', 'timebreaker'], 
      rarityTier: 3, maxLevel: 5, desc: 'Timebreaker Set reward - Skip time chance',
      baseBonus: { timeSkip: 0.15, instantProduction: 0.2 },
      setRequired: 'timebreaker_set' },
    
    { id: 'cosmic_hive_queen', name: 'Cosmic Hive Queen', icon: '🐝', rarity: 'epic', tags: ['set', 'cosmic_hive'], 
      rarityTier: 3, maxLevel: 5, desc: 'Cosmic Hive Set reward - Living planets spawn drones',
      baseBonus: { droneSpawn: 0.2, autonomousIncome: 0.15 },
      setRequired: 'cosmic_hive_set' },

    // ===== ADDITIONAL UNIQUELY-NAMED RELICS =====
    { id: 'frost_nova_capsule', name: 'Frost Nova Capsule', icon: '💠', rarity: 'rare', tags: ['cold', 'burst', 'freeze'], 
      rarityTier: 2, maxLevel: 10, desc: 'Frozen bonuses shatter for bursts',
      baseBonus: { shatterDamage: 0.3, frozenBonus: 0.2 },
      combo: { cryo_prism: {} } },
    
    { id: 'bio_stellar_seed', name: 'Bio-Stellar Seed', icon: '🌿', rarity: 'rare', tags: ['organic', 'planet', 'life'], 
      rarityTier: 2, maxLevel: 10, desc: 'Planets develop life bonuses',
      baseBonus: { lifeBonus: 0.25, organicGrowth: 0.15 },
      combo: { terraform_beacon: {} } },
    
    { id: 'deep_space_antenna', name: 'Deep Space Antenna', icon: '📡', rarity: 'uncommon', tags: ['signal', 'alien', 'event'], 
      rarityTier: 1, maxLevel: 10, desc: 'Signals happen more often',
      baseBonus: { signalFreq: 0.3, eventBonus: 0.15 },
      combo: { alien_monolith: {} } },
    
    { id: 'greed_singularity', name: 'Greed Singularity', icon: '💎', rarity: 'rare', tags: ['scaling', 'income', 'cosmic'], 
      rarityTier: 2, maxLevel: 10, desc: 'Multiplier grows twice as fast',
      baseBonus: { growthMult: 0.25, incomeMult: 0.2 },
      combo: { galactic_treasury: {} } },
    
    { id: 'plasma_orbitals', name: 'Plasma Orbitals', icon: '☄️', rarity: 'rare', tags: ['orbit', 'blast', 'bounce'], 
      rarityTier: 2, maxLevel: 10, desc: 'Blasts bounce between targets',
      baseBonus: { blastBounce: 0.2, orbitalDamage: 0.15 },
      combo: { neutron_gauntlet: {} } },
    
    { id: 'comet_engine', name: 'Comet Engine', icon: '☄️', rarity: 'uncommon', tags: ['cursor', 'impact', 'speed'], 
      rarityTier: 1, maxLevel: 10, desc: 'Impacts happen more often while moving cursor',
      baseBonus: { cursorBonus: 0.2, impactFreq: 0.15 },
      combo: { asteroid_knuckles: {} } },
    
    { id: 'orbital_matrix', name: 'Orbital Matrix', icon: '🌀', rarity: 'rare', tags: ['orbit', 'system', 'planet'], 
      rarityTier: 2, maxLevel: 10, desc: 'Planet bonuses affect nearby systems',
      baseBonus: { systemBonus: 0.25, orbitMult: 0.2 },
      combo: { planetary_core: {} } },

    // ===== BOSS COMBAT RELICS =====
    { id: 'assassin_blade', name: 'Assassin Blade', icon: '🗡️', rarity: 'rare', tags: ['boss', 'damage', 'combat'], 
      rarityTier: 2, maxLevel: 10, desc: '+30% boss damage, crits against bosses deal extra',
      baseBonus: { bossDmg: 0.3, bossCritDmg: 0.2 },
      combo: { war_dragon_heart: 'executeBonus', shadow_strike_core: 'backstab' } },
    
    { id: 'war_dragon_heart', name: 'War Dragon Heart', icon: '🐲', rarity: 'epic', tags: ['boss', 'execute', 'damage'], 
      rarityTier: 3, maxLevel: 8, desc: 'Bosses below 20% HP take 50% more damage',
      baseBonus: { bossDmg: 0.4, executeBonus: 0.5 },
      combo: { assassin_blade: 'executeBonus', titan_fist: 'executeCrit' } },
    
    { id: 'shadow_strike_core', name: 'Shadow Strike Core', icon: '🌑', rarity: 'uncommon', tags: ['boss', 'crit', 'damage'], 
      rarityTier: 1, maxLevel: 10, desc: '+15% boss damage, +5% crit chance vs bosses',
      baseBonus: { bossDmg: 0.15, bossCritChance: 0.05 },
      combo: { assassin_blade: 'backstab', void_leech: 'soulDrain' } },
    
    { id: 'void_leech', name: 'Void Leech', icon: '🦇', rarity: 'rare', tags: ['boss', 'lifesteal', 'drain'], 
      rarityTier: 2, maxLevel: 10, desc: 'Heal 5% of boss damage dealt',
      baseBonus: { bossDmg: 0.2, bossLifesteal: 0.05 },
      combo: { shadow_strike_core: 'soulDrain', necro_orb: 'lifeStealMult' } },
    
    { id: 'titan_fist', name: 'Titan Fist', icon: '👊', rarity: 'rare', tags: ['boss', 'damage', 'stun'], 
      rarityTier: 2, maxLevel: 10, desc: '+35% boss damage, chance to stun bosses',
      baseBonus: { bossDmg: 0.35, bossStunChance: 0.03 },
      combo: { war_dragon_heart: 'executeCrit', hammer_of_gods: 'stunDuration' } },
    
    { id: 'necro_orb', name: 'Necro Orb', icon: '💀', rarity: 'epic', tags: ['boss', 'lifesteal', 'soul'], 
      rarityTier: 3, maxLevel: 8, desc: 'Lifesteal scales with boss kills',
      baseBonus: { bossLifesteal: 0.08, soulHarvest: 0.1 },
      combo: { void_leech: 'lifeStealMult', spirit_link: 'shareHealing' } },
    
    { id: 'hammer_of_gods', name: 'Hammer of Gods', icon: '🔨', rarity: 'epic', tags: ['boss', 'stun', 'damage'], 
      rarityTier: 3, maxLevel: 8, desc: 'Stunned bosses take 25% more damage',
      baseBonus: { bossDmg: 0.3, stunDmgMult: 0.25 },
      combo: { titan_fist: 'stunDuration', earthquake_totem: 'aoeStun' } },
    
    { id: 'spirit_link', name: 'Spirit Link', icon: '⛓️', rarity: 'rare', tags: ['boss', 'heal', 'drain'], 
      rarityTier: 2, maxLevel: 10, desc: 'Share lifesteal with nearby relics',
      baseBonus: { bossLifesteal: 0.06, shareHealing: 0.1 },
      combo: { necro_orb: 'shareHealing', healing_crystal: 'healMult' } },
    
    { id: 'earthquake_totem', name: 'Earthquake Totem', icon: '🌋', rarity: 'uncommon', tags: ['boss', 'aoe', 'stun'], 
      rarityTier: 1, maxLevel: 10, desc: 'Boss attacks have chance to stagger',
      baseBonus: { bossDmg: 0.2, staggerChance: 0.05 },
      combo: { hammer_of_gods: 'aoeStun', quake_generator: 'tremor' } },
    
    { id: 'quake_generator', name: 'Quake Generator', icon: '💢', rarity: 'uncommon', tags: ['boss', 'ground', 'damage'], 
      rarityTier: 1, maxLevel: 10, desc: 'Ground attacks deal 20% more damage',
      baseBonus: { groundDmg: 0.2, tremorDmg: 0.1 },
      combo: { earthquake_totem: 'tremor', tectonic_core: 'seismic' } },

    // ===== PRESTIGE RELICS =====
    { id: 'ascension_shard', name: 'Ascension Shard', icon: '💎', rarity: 'rare', tags: ['prestige', 'bonus', 'scaling'], 
      rarityTier: 2, maxLevel: 10, desc: '+25% prestige bonus, +1% per prestige',
      baseBonus: { prestigeBonus: 0.25, prestigeScaling: 0.01 },
      combo: { phoenix_feather: 'rebirthBonus', soul_crystal: 'ascensionMult' } },
    
    { id: 'phoenix_feather', name: 'Phoenix Feather', icon: '🪶', rarity: 'epic', tags: ['prestige', 'rebirth', 'bonus'], 
      rarityTier: 3, maxLevel: 8, desc: 'Start with 20% of previous run earnings',
      baseBonus: { rebirthBonus: 0.2, gracePeriod: 0.1 },
      combo: { ascension_shard: 'rebirthBonus', wisdom_orb: 'memoryKeep' } },
    
    { id: 'soul_crystal', name: 'Soul Crystal', icon: '🔮', rarity: 'rare', tags: ['prestige', 'essence', 'scaling'], 
      rarityTier: 2, maxLevel: 10, desc: 'Each prestige permanently +1% all stats',
      baseBonus: { prestigeBonus: 0.2, permanentMult: 0.01 },
      combo: { ascension_shard: 'ascensionMult', echo_chamber: 'legacyPower' } },
    
    { id: 'wisdom_orb', name: 'Wisdom Orb', icon: '🧠', rarity: 'epic', tags: ['prestige', 'knowledge', 'keep'], 
      rarityTier: 3, maxLevel: 8, desc: 'Keep more upgrades after prestige',
      baseBonus: { keepUpgrades: 0.1, knowledgeBonus: 0.15 },
      combo: { phoenix_feather: 'memoryKeep', ancient_tome: 'wisdomMult' } },
    
    { id: 'echo_chamber', name: 'Echo Chamber', icon: '🔊', rarity: 'uncommon', tags: ['prestige', 'memory', 'echo'], 
      rarityTier: 1, maxLevel: 10, desc: 'Echoes of past runs boost current run',
      baseBonus: { echoPower: 0.15, legacyPower: 0.1 },
      combo: { soul_crystal: 'legacyPower', time_loop: 'repeatBonus' } },
    
    { id: 'time_loop', name: 'Time Loop', icon: '🔁', rarity: 'rare', tags: ['prestige', 'time', 'repeat'], 
      rarityTier: 2, maxLevel: 10, desc: 'Prestige resets give bonus time boosts',
      baseBonus: { timeBoostPrestige: 0.2, repeatBonus: 0.15 },
      combo: { echo_chamber: 'repeatBonus', paradox_key: 'timelineBonus' } },
    
    { id: 'ancient_tome', name: 'Ancient Tome', icon: '📜', rarity: 'rare', tags: ['prestige', 'wisdom', 'scroll'], 
      rarityTier: 2, maxLevel: 10, desc: 'Knowledge compounds with each prestige',
      baseBonus: { knowledgeStack: 0.15, wisdomMult: 0.1 },
      combo: { wisdom_orb: 'wisdomMult', memory_fragment: 'ancientPower' } },
    
    { id: 'paradox_key', name: 'Paradox Key', icon: '🗝️', rarity: 'legendary', tags: ['prestige', 'timeline', 'key'], 
      rarityTier: 4, maxLevel: 5, desc: 'Access alternate timeline bonuses on prestige',
      baseBonus: { timelineBonus: 0.3, paradoxPower: 0.2 },
      combo: { time_loop: {}, echo_chamber: {} } },

    // ===== COMBO RELICS =====
    { id: 'combo_crown', name: 'Combo Crown', icon: '👑', rarity: 'rare', tags: ['combo', 'max', 'scaling'], 
      rarityTier: 2, maxLevel: 10, desc: '+50% combo, +2 max combo per level',
      baseBonus: { combo: 0.5, maxCombo: 0.2 },
      combo: { fury_ring: 'comboMult', Berserker: 'berserkCombo' } },
    
    { id: 'fury_ring', name: 'Fury Ring', icon: '💍', rarity: 'uncommon', tags: ['combo', 'fury', 'decay'], 
      rarityTier: 1, maxLevel: 10, desc: 'Combo builds 25% faster, decays 15% slower',
      baseBonus: { comboSpeed: 0.25, comboDecaySlow: 0.15 },
      combo: { combo_crown: 'comboMult', adrenaline_rush: 'comboBurst' } },
    
    { id: 'Berserker', name: 'Berserker', icon: '⚔️', rarity: 'epic', tags: ['combo', 'damage', 'rage'], 
      rarityTier: 3, maxLevel: 8, desc: 'High combo = massive damage boost',
      baseBonus: { highComboDmg: 0.4, rageBonus: 0.3 },
      combo: { combo_crown: 'berserkCombo', bloodlust_orb: 'rageMult' } },
    
    { id: 'adrenaline_rush', name: 'Adrenaline Rush', icon: '💉', rarity: 'uncommon', tags: ['combo', 'speed', 'burst'], 
      rarityTier: 1, maxLevel: 10, desc: 'Combo bursts restore partially',
      baseBonus: { comboBurst: 0.2, rushBonus: 0.15 },
      combo: { fury_ring: 'comboBurst', momentum_engine: 'keepCombo' } },
    
    { id: 'bloodlust_orb', name: 'Bloodlust Orb', icon: '🩸', rarity: 'rare', tags: ['combo', 'rage', 'damage'], 
      rarityTier: 2, maxLevel: 10, desc: 'Killing in combo = bonus rage',
      baseBonus: { rageOnKill: 0.25, rageMult: 0.2 },
      combo: { Berserker: 'rageMult', kill_streak_core: 'bloodlust' } },
    
    { id: 'momentum_engine', name: 'Momentum Engine', icon: '⚙️', rarity: 'rare', tags: ['combo', 'keep', 'decay'], 
      rarityTier: 2, maxLevel: 10, desc: 'Combo decays 30% slower',
      baseBonus: { comboDecaySlow: 0.3, momentumKeep: 0.2 },
      combo: { adrenaline_rush: 'keepCombo', fury_ring: 'sustainCombo' } },
    
    { id: 'kill_streak_core', name: 'Kill Streak Core', icon: '🔥', rarity: 'epic', tags: ['combo', 'kill', 'streak'], 
      rarityTier: 3, maxLevel: 8, desc: 'Kill streaks boost combo multiplier',
      baseBonus: { streakCombo: 0.3, streakMult: 0.2 },
      combo: { bloodlust_orb: 'bloodlust', Berserker: 'killRage' } },

    // ===== CRIT RELICS =====
    { id: 'lucky_star', name: 'Lucky Star', icon: '⭐', rarity: 'rare', tags: ['crit', 'luck', 'chance'], 
      rarityTier: 2, maxLevel: 10, desc: '+10% crit chance, +50% crit damage',
      baseBonus: { critChance: 0.1, critMult: 0.5 },
      combo: { precision_lens: 'critMult', fortune_cookie: 'luckyCrit' } },
    
    { id: 'precision_lens', name: 'Precision Lens', icon: '🔎', rarity: 'uncommon', tags: ['crit', 'accuracy', 'mult'], 
      rarityTier: 1, maxLevel: 10, desc: '+8% crit chance, +40% crit damage',
      baseBonus: { critChance: 0.08, critMult: 0.4 },
      combo: { lucky_star: 'critMult', laser_sight: 'pinpoint' } },
    
    { id: 'laser_sight', name: 'Laser Sight', icon: '🎯', rarity: 'rare', tags: ['crit', 'aim', 'damage'], 
      rarityTier: 2, maxLevel: 10, desc: 'Crits deal 25% more damage',
      baseBonus: { critDmgBonus: 0.25, pinpointAim: 0.1 },
      combo: { precision_lens: 'pinpoint', eagle_eye: 'trueAim' } },
    
    { id: 'fortune_cookie', name: 'Fortune Cookie', icon: '🥠', rarity: 'uncommon', tags: ['crit', 'luck', 'fortune'], 
      rarityTier: 1, maxLevel: 10, desc: 'Small chance for mega crits (3x damage)',
      baseBonus: { megaCritChance: 0.03, luckyCrit: 0.15 },
      combo: { lucky_star: 'luckyCrit', chaos_dice: 'luckyRoll' } },
    
    { id: 'eagle_eye', name: 'Eagle Eye', icon: '🦅', rarity: 'epic', tags: ['crit', 'vision', 'precision'], 
      rarityTier: 3, maxLevel: 8, desc: 'Crits have higher chance at high combos',
      baseBonus: { comboCritBonus: 0.3, trueAim: 0.2 },
      combo: { laser_sight: 'trueAim', lucky_star: 'aimCrit' } },
    
    { id: 'chaos_dice', name: 'Chaos Dice', icon: '🎲', rarity: 'epic', tags: ['crit', 'random', 'chaos'], 
      rarityTier: 3, maxLevel: 8, desc: 'Random chance for insane crits (5x)',
      baseBonus: { chaosCrit: 0.05, luckyRoll: 0.2 },
      combo: { fortune_cookie: 'luckyRoll', entropy_prism: 'chaosCrit' } },
    
    { id: 'diamond_core', name: 'Diamond Core', icon: '💠', rarity: 'legendary', tags: ['crit', 'prism', 'amplify'], 
      rarityTier: 4, maxLevel: 5, desc: 'All crits deal 100% more damage',
      baseBonus: { critMult: 1.0, critAmplify: 0.5 },
      combo: { lucky_star: {}, precision_lens: {}, eagle_eye: {} } },

    // ===== ZONE RELICS =====
    { id: 'zone_key', name: 'Zone Key', icon: '🗺️', rarity: 'rare', tags: ['zone', 'unlock', 'mult'], 
      rarityTier: 2, maxLevel: 10, desc: '+20% zone multiplier, unlock faster',
      baseBonus: { zoneMult: 0.2, unlockSpeed: 0.15 },
      combo: { portal_shard: 'fastTravel', dimension_rift: 'zoneJump' } },
    
    { id: 'portal_shard', name: 'Portal Shard', icon: '🌀', rarity: 'uncommon', tags: ['zone', 'travel', 'speed'], 
      rarityTier: 1, maxLevel: 10, desc: 'Switch zones 25% faster',
      baseBonus: { zoneSwitchSpeed: 0.25, travelBonus: 0.15 },
      combo: { zone_key: 'fastTravel', warp_gate: 'instantTravel' } },
    
    { id: 'dimension_rift', name: 'Dimension Rift', icon: '🌌', rarity: 'epic', tags: ['zone', 'rift', 'cross'], 
      rarityTier: 3, maxLevel: 8, desc: 'Cross-zone bonuses stack twice as fast',
      baseBonus: { crossZoneBonus: 0.3, zoneJump: 0.2 },
      combo: { zone_key: 'zoneJump', void_portal: 'riftMult' } },
    
    { id: 'warp_gate', name: 'Warp Gate', icon: '🚪', rarity: 'rare', tags: ['zone', 'warp', 'instant'], 
      rarityTier: 2, maxLevel: 10, desc: 'Instant zone switching when unlocked',
      baseBonus: { instantSwitch: 0.25, warpBonus: 0.2 },
      combo: { portal_shard: 'instantTravel', quantum_compass: 'warpSpeed' } },
    
    { id: 'void_portal', name: 'Void Portal', icon: '🕳️', rarity: 'rare', tags: ['zone', 'void', 'unlock'], 
      rarityTier: 2, maxLevel: 10, desc: 'Void zone gives 50% more bonus',
      baseBonus: { voidBonus: 0.5, voidUnlock: 0.2 },
      combo: { dimension_rift: 'riftMult', dark_crystal: 'voidPower' } },
    
    { id: 'quantum_compass', name: 'Quantum Compass', icon: '🧭', rarity: 'epic', tags: ['zone', 'navigate', 'bonus'], 
      rarityTier: 3, maxLevel: 8, desc: 'All zones give +15% bonus each',
      baseBonus: { allZoneBonus: 0.15, navigateSpeed: 0.2 },
      combo: { warp_gate: 'warpSpeed', zone_key: {} } },
    
    { id: 'dark_crystal', name: 'Dark Crystal', icon: '🟣', rarity: 'rare', tags: ['zone', 'dark', 'bonus'], 
      rarityTier: 2, maxLevel: 10, desc: 'Dark zones give double bonus',
      baseBonus: { darkMult: 0.5, voidPower: 0.3 },
      combo: { void_portal: 'voidPower', shadow_realm: 'darkAmplify' } },
    
    { id: 'shadow_realm', name: 'Shadow Realm', icon: '👤', rarity: 'epic', tags: ['zone', 'shadow', 'stealth'], 
      rarityTier: 3, maxLevel: 8, desc: 'Shadow zone unlocks hidden bonuses',
      baseBonus: { shadowBonus: 0.4, darkAmplify: 0.25 },
      combo: { dark_crystal: 'darkAmplify', void_portal: {} } },

    // ===== ABILITY RELICS =====
    { id: 'ability_crystal', name: 'Ability Crystal', icon: '💎', rarity: 'rare', tags: ['ability', 'cooldown', 'power'], 
      rarityTier: 2, maxLevel: 10, desc: '-15% ability cooldowns, +20% ability power',
      baseBonus: { abilityCDR: 0.15, abilityPower: 0.2 },
      combo: { mana_circuit: 'cdrMult', power_circuit: 'abilityBoost' } },
    
    { id: 'mana_circuit', name: 'Mana Circuit', icon: '🔌', rarity: 'uncommon', tags: ['ability', 'mana', 'regen'], 
      rarityTier: 1, maxLevel: 10, desc: 'Abilities cost 20% less, cooldown 10% faster',
      baseBonus: { abilityCostReduce: 0.2, abilityCDR: 0.1 },
      combo: { ability_crystal: 'cdrMult', energy_coil: 'manaEfficiency' } },
    
    { id: 'power_circuit', name: 'Power Circuit', icon: '⚡', rarity: 'uncommon', tags: ['ability', 'damage', 'boost'], 
      rarityTier: 1, maxLevel: 10, desc: 'Abilities deal 25% more damage',
      baseBonus: { abilityDmg: 0.25, abilityBoost: 0.15 },
      combo: { ability_crystal: 'abilityBoost', damage_amplifier: 'powerMult' } },
    
    { id: 'energy_coil', name: 'Energy Coil', icon: '🔋', rarity: 'rare', tags: ['ability', 'energy', 'efficiency'], 
      rarityTier: 2, maxLevel: 10, desc: 'Abilities generate bonus energy on use',
      baseBonus: { abilityEnergyGen: 0.15, manaEfficiency: 0.2 },
      combo: { mana_circuit: 'manaEfficiency', spark_generator: 'coilPower' } },
    
    { id: 'damage_amplifier', name: 'Damage Amplifier', icon: '📈', rarity: 'epic', tags: ['ability', 'damage', 'mult'], 
      rarityTier: 3, maxLevel: 8, desc: 'All abilities have 40% more effect',
      baseBonus: { abilityPower: 0.4, powerMult: 0.2 },
      combo: { power_circuit: 'powerMult', ability_crystal: {} } },
    
    { id: 'spark_generator', name: 'Spark Generator', icon: '✨', rarity: 'rare', tags: ['ability', 'spark', 'chain'], 
      rarityTier: 2, maxLevel: 10, desc: 'Ability crits chain to nearby enemies',
      baseBonus: { abilityChain: 0.25, coilPower: 0.15 },
      combo: { energy_coil: 'coilPower', chain_lightning: 'sparkMult' } },
    
    { id: 'chain_lightning', name: 'Chain Lightning', icon: '⚡', rarity: 'epic', tags: ['ability', 'chain', 'damage'], 
      rarityTier: 3, maxLevel: 8, desc: 'Abilities chain to 3 extra targets',
      baseBonus: { chainTargets: 3, sparkMult: 0.3 },
      combo: { spark_generator: 'sparkMult', ability_crystal: {} } },

    // ===== ACHIEVEMENT RELICS =====
    { id: 'milestone_medal', name: 'Milestone Medal', icon: '🏅', rarity: 'rare', tags: ['achievement', 'reward', 'bonus'], 
      rarityTier: 2, maxLevel: 10, desc: 'Milestone rewards give +30% bonus',
      baseBonus: { milestoneBonus: 0.3, rewardMult: 0.2 },
      combo: { trophy_case: 'collectBonus', achievement_hunter: 'trophyMult' } },
    
    { id: 'trophy_case', name: 'Trophy Case', icon: '🏆', rarity: 'uncommon', tags: ['achievement', 'collection', 'display'], 
      rarityTier: 1, maxLevel: 10, desc: 'Every 10 achievements = permanent boost',
      baseBonus: { achievementMult: 0.1, collectBonus: 0.15 },
      combo: { milestone_medal: 'collectBonus', master_hunter: 'huntBonus' } },
    
    { id: 'achievement_hunter', name: 'Achievement Hunter', icon: '🎯', rarity: 'epic', tags: ['achievement', 'hunt', 'power'], 
      rarityTier: 3, maxLevel: 8, desc: 'Achievements give 50% more power',
      baseBonus: { achievementPower: 0.5, trophyMult: 0.3 },
      combo: { milestone_medal: 'trophyMult', completionist: 'fullBonus' } },
    
    { id: 'master_hunter', name: 'Master Hunter', icon: '🎖️', rarity: 'rare', tags: ['achievement', 'secret', 'hidden'], 
      rarityTier: 2, maxLevel: 10, desc: 'Secret achievements give big bonuses',
      baseBonus: { secretBonus: 0.4, huntBonus: 0.2 },
      combo: { trophy_case: 'huntBonus', secret_finder: 'revealSecret' } },
    
    { id: 'secret_finder', name: 'Secret Finder', icon: '🔍', rarity: 'epic', tags: ['achievement', 'secret', 'reveal'], 
      rarityTier: 3, maxLevel: 8, desc: 'Reveals hidden achievements',
      baseBonus: { revealSecret: 0.3, hiddenBonus: 0.25 },
      combo: { master_hunter: 'revealSecret', achievement_hunter: {} } },
    
    { id: 'completionist', name: 'Completionist', icon: '📋', rarity: 'legendary', tags: ['achievement', 'complete', 'all'], 
      rarityTier: 4, maxLevel: 5, desc: 'Completing all achievements in category = bonus',
      baseBonus: { categoryBonus: 0.5, fullBonus: 0.4 },
      combo: { achievement_hunter: 'fullBonus', trophy_case: {} } },

    // ===== CPS/IDLE RELICS =====
    { id: 'idle_master', name: 'Idle Master', icon: '💤', rarity: 'rare', tags: ['cps', 'idle', 'passive'], 
      rarityTier: 2, maxLevel: 10, desc: '+40% CPS, +20% idle efficiency',
      baseBonus: { cps: 0.4, idleEfficiency: 0.2 },
      combo: { sleep_core: 'deepRest', dream_weaver: 'idleDream' } },
    
    { id: 'sleep_core', name: 'Sleep Core', icon: '😴', rarity: 'uncommon', tags: ['cps', 'sleep', 'passive'], 
      rarityTier: 1, maxLevel: 10, desc: '+30% CPS while away, auto-collect',
      baseBonus: { cps: 0.3, autoCollect: 0.2 },
      combo: { idle_master: 'deepRest', dream_catcher: 'sleepBonus' } },
    
    { id: 'dream_weaver', name: 'Dream Weaver', icon: '🌙', rarity: 'epic', tags: ['cps', 'dream', 'passive'], 
      rarityTier: 3, maxLevel: 8, desc: 'Dreams generate passive income',
      baseBonus: { dreamIncome: 0.35, idleDream: 0.25 },
      combo: { idle_master: 'idleDream', dream_catcher: 'dreamMult' } },
    
    { id: 'dream_catcher', name: 'Dream Catcher', icon: '🎐', rarity: 'uncommon', tags: ['cps', 'catch', 'bonus'], 
      rarityTier: 1, maxLevel: 10, desc: '+25% CPS, bonus for catching dreams',
      baseBonus: { cps: 0.25, sleepBonus: 0.15 },
      combo: { sleep_core: 'sleepBonus', dream_weaver: 'dreamMult' } },
    
    { id: 'auto_clicker', name: 'Auto Clicker', icon: '🤖', rarity: 'rare', tags: ['cps', 'auto', 'click'], 
      rarityTier: 2, maxLevel: 10, desc: 'Generates 10% of clicks as CPS',
      baseBonus: { autoClick: 0.1, clickAsCps: 0.1 },
      combo: { idle_master: {}, robot_companion: 'autoBoost' } },
    
    { id: 'robot_companion', name: 'Robot Companion', icon: '🤖', rarity: 'epic', tags: ['cps', 'robot', 'helper'], 
      rarityTier: 3, maxLevel: 8, desc: 'Helps generate passive income',
      baseBonus: { robotIncome: 0.3, autoBoost: 0.2 },
      combo: { auto_clicker: 'autoBoost', idle_master: {} } },
    
    { id: 'money_tree', name: 'Money Tree', icon: '🌳', rarity: 'legendary', tags: ['cps', 'tree', 'growth'], 
      rarityTier: 4, maxLevel: 5, desc: 'CPS grows 1% every minute',
      baseBonus: { cpsGrowth: 0.01, cpsMult: 0.5 },
      combo: { idle_master: {}, dream_weaver: {} } },

    // ===== HEALTH/SURVIVAL RELICS =====
    { id: 'health_crystal', name: 'Health Crystal', icon: '❤️', rarity: 'rare', tags: ['health', 'heal', 'survival'], 
      rarityTier: 2, maxLevel: 10, desc: '+25% max health, regen 5% faster',
      baseBonus: { maxHealth: 0.25, healthRegen: 0.05 },
      combo: { healing_crystal: 'healMult', vital_core: 'vitalBoost' } },
    
    { id: 'healing_crystal', name: 'Healing Crystal', icon: '💖', rarity: 'uncommon', tags: ['health', 'heal', 'restore'], 
      rarityTier: 1, maxLevel: 10, desc: '+15% healing received',
      baseBonus: { healBonus: 0.15, healMult: 0.1 },
      combo: { health_crystal: 'healMult', regenerator: 'regenBoost' } },
    
    { id: 'vital_core', name: 'Vital Core', icon: '💪', rarity: 'epic', tags: ['health', 'vital', 'survival'], 
      rarityTier: 3, maxLevel: 8, desc: 'Survive fatal hits more often',
      baseBonus: { extraLife: 0.1, vitalBoost: 0.2 },
      combo: { health_crystal: 'vitalBoost', immortal_heart: 'secondChance' } },
    
    { id: 'regenerator', name: 'Regenerator', icon: '🔄', rarity: 'uncommon', tags: ['health', 'regen', 'passive'], 
      rarityTier: 1, maxLevel: 10, desc: 'Passive health regen +20%',
      baseBonus: { healthRegen: 0.2, regenBoost: 0.15 },
      combo: { healing_crystal: 'regenBoost', vital_core: {} } },
    
    { id: 'immortal_heart', name: 'Immortal Heart', icon: '💀', rarity: 'legendary', tags: ['health', 'immortal', 'revive'], 
      rarityTier: 4, maxLevel: 5, desc: 'Auto-revive once per boss fight',
      baseBonus: { autoRevive: true, secondChance: 0.3 },
      combo: { vital_core: 'secondChance', health_crystal: {} } },

    // ===== OFFLINE RELICS =====
    { id: 'overnight_profit', name: 'Overnight Profit', icon: '💰', rarity: 'rare', tags: ['offline', 'profit', 'passive'], 
      rarityTier: 2, maxLevel: 10, desc: '+50% offline gains',
      baseBonus: { offlineGain: 0.5 },
      combo: { night_owl: 'nocturnalBonus', dream_weaver: 'dreamOffline' } },
    
    { id: 'night_owl', name: 'Night Owl', icon: '🦉', rarity: 'uncommon', tags: ['offline', 'night', 'bonus'], 
      rarityTier: 1, maxLevel: 10, desc: 'Offline gains 30% higher at night (real time)',
      baseBonus: { nocturnalBonus: 0.3 },
      combo: { overnight_profit: 'nocturnalBonus', sleeper_crab: 'sleepBoost' } },
    
    { id: 'dream_weaver_offline', name: 'Dream Weaver (Offline)', icon: '💭', rarity: 'epic', tags: ['offline', 'dream', 'passive'], 
      rarityTier: 3, maxLevel: 8, desc: 'Dreams continue while away',
      baseBonus: { dreamOffline: 0.4 },
      combo: { overnight_profit: {}, dream_catcher: 'dreamMult' } },
    
    { id: 'sleeper_crab', name: 'Sleeper Crab', icon: '🦀', rarity: 'rare', tags: ['offline', 'sleep', 'collect'], 
      rarityTier: 2, maxLevel: 10, desc: 'Collects offline earnings automatically',
      baseBonus: { autoCollect: 0.3, sleepBoost: 0.25 },
      combo: { night_owl: 'sleepBoost', overnight_profit: {} } },
];

const RARITY_RATES = { 
    common: 0.45, 
    uncommon: 0.25, 
    rare: 0.18, 
    epic: 0.08, 
    legendary: 0.03, 
    mythic: 0.01 
};

const RARITY_COLORS = { 
    common: '#888888', 
    uncommon: '#44aa44', 
    rare: '#4488ff', 
    epic: '#aa44ff', 
    legendary: '#ffaa00', 
    mythic: '#ff44ff' 
};

const RARITY_COSTS = {
    common: 10,
    uncommon: 25,
    rare: 50,
    epic: 100,
    legendary: 250,
    mythic: 500
};

// ========================
// RELIC SETS (Synergies - Combo System)
// ========================
const RELIC_SETS = [
    // ===== COSMIC CORE SETS =====
    { id: 'nebula_duo', name: 'Nebula Connection', relics: ['nebula_heart', 'starforge_core'], 
      bonus: { factoryMult: 2.0 }, desc: 'Nebula Heart + Starforge Core = Double factory output' },
    
    { id: 'offline_power', name: 'Offline Power', relics: ['nebula_heart', 'void_battery'], 
      bonus: { offlinePassive: true }, desc: 'Nebula Heart + Void Battery = Passive income continues offline' },
    
    { id: 'cosmic_economy', name: 'Cosmic Economy', relics: ['dark_matter_reactor', 'void_battery'], 
      bonus: { freeDupe: true }, desc: 'Dark Matter + Void Battery = Duplicated upgrades free' },

    // ===== SUPERNOVA SET =====
    { id: 'supernova_set', name: 'Supernova', relics: ['starforge_core', 'solar_crown', 'neutron_gauntlet'], 
      bonus: { supernovaWaves: 0.5, starExplosion: 0.5 }, setBonus: 'supernova_core',
      desc: 'Stars periodically explode for giant income waves' },

    // ===== VOIDBORN SET =====
    { id: 'voidborn_set', name: 'Voidborn', relics: ['void_battery', 'void_parasite', 'black_hole_eye'], 
      bonus: { offlineMutate: true }, setBonus: 'voidborn_essence',
      desc: 'Offline gains can mutate into rare resources' },

    // ===== TIMEBREAKER SET =====
    { id: 'timebreaker_set', name: 'Timebreaker', relics: ['time_dilation_engine', 'chrono_vault', 'paradox_loop'], 
      bonus: { timeSkip: 0.1, instantProduction: 0.3 }, setBonus: 'timebreaker_eye',
      desc: 'Small chance to skip time and gain hours of production' },

    // ===== COSMIC HIVE SET =====
    { id: 'cosmic_hive_set', name: 'Cosmic Hive', relics: ['terraform_beacon', 'bio_stellar_seed', 'alien_monolith'], 
      bonus: { droneSpawn: 0.25, autonomousIncome: 0.2 }, setBonus: 'cosmic_hive_queen',
      desc: 'Living planets generate autonomous drones' },

    // ===== TEMPORAL TRIO =====
    { id: 'temporal_trio', name: 'Temporal Trio', relics: ['time_dilation_engine', 'chrono_vault'], 
      bonus: { preservedSpeed: 0.3 }, desc: 'Preserve part of speed boost after prestige' },

    { id: 'time_offline', name: 'Time Void Sync', relics: ['time_dilation_engine', 'void_battery'], 
      bonus: { doubleOffline: true }, desc: 'Offline time counts double' },

    { id: 'paradox_mirror', name: 'Paradox Mirror', relics: ['paradox_loop', 'mirror_universe_core'], 
      bonus: { timelineInteract: 0.4 }, desc: 'Timelines interact with each other' },

    // ===== GRAVITY TRIO =====
    { id: 'gravity_pull', name: 'Gravity Pull', relics: ['gravity_well', 'black_hole_eye'], 
      bonus: { compressionMult: 0.5 }, desc: 'Rewards gain compression multipliers' },

    { id: 'asteroid_gravity', name: 'Asteroid Gravity', relics: ['asteroid_knuckles', 'gravity_well'], 
      bonus: { dragLoot: true }, desc: 'Impacts drag in bonus loot' },

    // ===== CLICKING QUARTET =====
    { id: 'click_master', name: 'Click Master', relics: ['quantum_fingers', 'neutron_gauntlet'], 
      bonus: { critShockwave: true }, desc: 'Crits fire shockwaves' },

    { id: 'combo_speed', name: 'Combo Speed', relics: ['pulse_accelerator', 'quantum_fingers'], 
      bonus: { critChain: true }, desc: 'Crit chains extend acceleration' },

    // ===== ALIEN PAIRINGS =====
    { id: 'alien_signal', name: 'Alien Signal', relics: ['alien_monolith', 'deep_space_antenna'], 
      bonus: { moreSignals: true }, desc: 'Signals happen more often' },

    { id: 'chaos_mutation', name: 'Chaos Mutation', relics: ['entropy_prism', 'chaos_bloom'], 
      bonus: { chainMutation: true }, desc: 'Chain mutations' },

    { id: 'chaos_void', name: 'Chaos Void', relics: ['chaos_bloom', 'void_parasite'], 
      bonus: { permanentUnstable: true }, desc: 'Unstable effects can become permanent' },

    // ===== STAR/PLANET SYNERGIES =====
    { id: 'thermal_balance', name: 'Thermal Balance', relics: ['solar_crown', 'cryo_prism'], 
      bonus: { preventOverheat: true }, desc: 'Prevents overheating' },

    { id: 'heat_forge', name: 'Heat Forge', relics: ['solar_crown', 'starforge_core'], 
      bonus: { moltenValue: 0.5 }, desc: 'Heat increases molten star value' },

    { id: 'planet_system', name: 'Planet System', relics: ['planetary_core', 'orbital_matrix'], 
      bonus: { systemBonus: 0.4 }, desc: 'Planet bonuses affect nearby systems' },

    // ===== GLOBAL SCALING =====
    { id: 'singularity_everything', name: 'Singularity Connection', relics: ['singularity_throne'], 
      bonus: { globalBoost: 0.1, relicSynergy: 0.05 }, desc: 'Every relic boosts every other relic' },

    // ===== MYTHIC PAIRINGS =====
    { id: 'eternal_archive', name: 'Eternal Archive', relics: ['eternal_seed', 'celestial_archive'], 
      bonus: { permanentScale: 0.3 }, desc: 'Permanent scaling bonuses' },

    { id: 'oracle_monolith', name: 'Oracle Monolith', relics: ['oracle_engine', 'alien_monolith'], 
      bonus: { safeSignals: true }, desc: 'Safer signal events' },

    { id: 'oracle_entropy', name: 'Oracle Entropy', relics: ['oracle_engine', 'entropy_prism'], 
      bonus: { previewMutation: true }, desc: 'Preview random mutations' },

    { id: 'void_eternal', name: 'Void Eternal', relics: ['void_parasite', 'eternal_seed'], 
      bonus: { consumedPermanent: true }, desc: 'Consumed effects become permanent stats' },

    { id: 'mirror_archive', name: 'Mirror Archive', relics: ['mirror_universe_core', 'celestial_archive'], 
      bonus: { copyCount: true }, desc: 'Copied relics count for collections' },
];

window.RELIC_SETS = RELIC_SETS;

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
// BOSSES - 14 Unique Bosses
// ========================
const BOSSES = [
    {id: 'VoidAssassin', name: 'Void Assassin', hp: 510, className: 'VoidAssassin', color: '#1a1a2e', phases: 3, desc: 'Shadow clones and teleport strikes'},
    {id: 'VirusQueen', name: 'The Virus Queen', hp: 1000, className: 'VirusQueen', color: '#ff00ff', phases: 4, desc: 'Infection zones and bio-organic shield'},
    {id: 'ThunderEmperor', name: 'Thunder Emperor', hp: 600, className: 'ThunderEmperor', color: '#8888ff', phases: 3, desc: 'Lightning bolts and thunder clouds'},
    {id: 'TempestLord', name: 'Tempest Lord', hp: 550, className: 'TempestLord', color: '#4488ff', phases: 3, desc: 'Wind projectiles and tornado zones'},
    {id: 'NexusCore', name: 'Nexus Core', hp: 650, className: 'NexusCore', color: '#00ffff', phases: 3, desc: 'Homing energy orbs and laser beams'},
    {id: 'MagmaSovereign', name: 'Magma Sovereign', hp: 1100, className: 'MagmaSovereign', color: '#ff4400', phases: 3, desc: 'Fireballs and lava pools'},
    {id: 'ImmortalPhoenix', name: 'Immortal Phoenix', hp: 1200, className: 'ImmortalPhoenix', color: '#ff6600', phases: 4, desc: 'Fire spiral and resurrection'},
    {id: 'IceTyrant', name: 'Ice Tyrant', hp: 700, className: 'IceTyrant', color: '#88ddff', phases: 3, desc: 'Ice shards and frozen zones'},
    {id: 'EternalGuardian', name: 'Eternal Guardian', hp: 510, className: 'EternalGuardian', color: '#8800ff', phases: 3, desc: 'Orb sweeps and radial bursts'},
    {id: 'EternalDragon', name: 'Eternal Dragon', hp: 800, className: 'EternalDragon', color: '#ff4400', phases: 3, desc: 'Fire breath and dragon dive'},
    {id: 'CrystallineDestroyer', name: 'Crystalline Destroyer', hp: 750, className: 'CrystallineDestroyer', color: '#00ffaa', phases: 3, desc: 'Crystal shards and prism beams'},
    {id: 'Chronomancer', name: 'Chronomancer', hp: 750, className: 'Chronomancer', color: '#8888ff', phases: 3, desc: 'Time clones and time zones'},
    {id: 'BladeMaster', name: 'Blade Master', hp: 700, className: 'BladeMaster', color: '#ff8800', phases: 3, desc: 'Blade rings and slash combos'},
    {id: 'CyberOverlord', name: 'Cyber Overlord', hp: 900, className: 'CyberOverlord', color: '#00ff00', phases: 3, desc: 'Drone swarms and data corruption'},
];

const BOSS_CONFIG = {
    introDuration: 180,
    phase2Threshold: 0.60,
    phase3Threshold: 0.30,
    globalHealthMult: 0.76,
    weakenedHealthMult: 0.65
};

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
window.RARITY_COSTS = RARITY_COSTS;
window.GAME_CONFIG = GAME_CONFIG;