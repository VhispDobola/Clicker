// UI functions - reference globals via window when needed
const G = () => window;

// ========================
// UI FUNCTIONS
// ========================
let lastPanel = null;
let buyMulti = 1;
let clickTextEl = null;
window.relicFilter = 'all';

function updateDisplay() {
    const game = G().GAME || {};
    document.getElementById('energyDisplay').textContent = formatNumber(game.energy || 0);
    document.getElementById('comboVal').textContent = 'x' + (game.combo || 1).toFixed(1);
    document.getElementById('cpsVal').textContent = formatNumber(typeof getCps === 'function' ? getCps() : 0);
    document.getElementById('critVal').textContent = Math.round((typeof getCritChance === 'function' ? getCritChance() : 0) * 100) + '%';
    document.getElementById('zoneVal').textContent = 'x' + (typeof getZoneMult === 'function' ? getZoneMult() : 1);
    document.getElementById('acVal').textContent = formatNumber(game.ascensionCrystals || 0);
    document.getElementById('relicsVal').textContent = typeof getOwnedRelicCount === 'function' ? getOwnedRelicCount() : 0;
}

let toastQueue = [];
let activeToasts = 0;
const MAX_TOASTS = 3;

function toast(msg, type = 'success', skipQueue = false) {
    if (activeToasts >= MAX_TOASTS && !skipQueue) {
        toastQueue.push({ msg, type });
        return;
    }
    
    activeToasts++;
    const t = document.getElementById('toast');
    const m = document.createElement('div');
    m.className = 'toast-msg ' + type;
    m.textContent = msg;
    t.appendChild(m);
    if (type === 'error') playError();
    else playToast();
    setTimeout(() => {
        m.remove();
        activeToasts--;
        if (toastQueue.length > 0) {
            const next = toastQueue.shift();
            toast(next.msg, next.type, true);
        }
    }, 2500);
}

function showClickText(power, isCrit) {
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;pointer-events:none;z-index:50;font-weight:bold;transition:all 0.8s ease-out;';
    el.textContent = '+' + formatNumber(power) + (isCrit ? ' CRIT!' : '');
    el.style.left = (window.innerWidth / 2) + 'px';
    el.style.top = (window.innerHeight / 2) + 'px';
    el.style.color = isCrit ? '#ff6600' : '#00ffaa';
    el.style.fontSize = isCrit ? '1.8rem' : '1.2rem';
    el.style.transform = 'translate(-50%,0)';
    el.style.opacity = '1';
    document.body.appendChild(el);
    
    requestAnimationFrame(() => {
        el.style.transform = 'translate(-50%,-60px)';
        el.style.opacity = '0';
    });
    
    setTimeout(() => el.remove(), 800);
}

function openShop() {
    initAudio();
    playMenuOpen();
    lastPanel = 'shop';
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.getElementById('panel-shop').classList.add('active');
    renderShopTab('click');
    startShopRefresh();
}

let shopRefreshInterval = null;

function startShopRefresh() {
    if (shopRefreshInterval) clearInterval(shopRefreshInterval);
    shopRefreshInterval = setInterval(() => {
        if (document.getElementById('panel-shop')?.classList.contains('active')) {
            const activeTab = document.querySelector('.shop-tab.active')?.textContent?.toLowerCase();
            if (activeTab) renderShopTab(activeTab);
        } else {
            if (shopRefreshInterval) {
                clearInterval(shopRefreshInterval);
                shopRefreshInterval = null;
            }
        }
    }, 500);
}

function openPanel(name) {
    initAudio();
    playMenuOpen();
    lastPanel = name;
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.getElementById('panel-' + name).classList.add('active');
    renderPanel(name);
}

function closePanel() {
    playMenuClose();
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
}

function switchShopTab(tab, evt) {
    playPanelSwitch();
    document.querySelectorAll('.shop-tab').forEach(b => b.classList.remove('active'));
    (evt || window.event).target.classList.add('active');
    renderShopTab(tab);
}

// ========================
// SHOP RENDERING
// ========================
function renderShopTab(tab) {
    const content = document.getElementById('shopContent');
    content.innerHTML = '';
    
    if (tab === 'abilities') { renderAbilitiesShop(content); return; }
    if (tab === 'relics') { renderRelicShop(content); return; }
    
    // Buy toggle
    const toggle = document.createElement('div');
    toggle.style.cssText = 'display:flex;gap:0.5rem;margin-bottom:1rem;';
    toggle.innerHTML = '<span style="color:#88aacc;">Buy:</span>' +
        '<button onclick="buyMulti=buyMulti===1?5:(buyMulti===5?10:(buyMulti===10?50:(buyMulti===50?999:1))" ' +
        'style="min-width:50px;background:#334466;color:#aaccff;padding:0.3rem;cursor:pointer;border:1px solid #4466aa;border-radius:3px;">' +
        (buyMulti === 999 ? 'MAX' : buyMulti) + '</button>';
    content.appendChild(toggle);
    
    let filter;
    if (tab === 'click') filter = u => u.type === 'click' || u.id.startsWith('c') || u.id.startsWith('cr') || u.id.startsWith('cm');
    else if (tab === 'gen') filter = u => u.type === 'gen' || u.id.startsWith('g');
    else if (tab === 'combat') filter = u => u.type === 'boss';
    else if (tab === 'special') filter = u => u.type === 'special' || u.type === 'space';
    
    const filtered = window.UPGRADES.filter(filter).sort((a, b) => a.base - b.base);
    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:0.5rem;';
    
    filtered.forEach(u => {
        const level = GAME.upgrades[u.id] || 0;
        const cost = getUpgradeCost(u.id);
        const maxed = level >= u.max;
        const canAfford = GAME.energy >= cost;
        
        const card = document.createElement('div');
        card.style.cssText = `background:${maxed ? '#223344' : (canAfford ? '#224433' : '#1a1a22')};padding:0.5rem;border-radius:4px;cursor:${canAfford && !maxed ? 'pointer' : 'default'};border:2px solid ${maxed ? '#ff44ff' : (canAfford ? '#44ff88' : '#333344')};`;
        
        card.innerHTML = `<div style="color:#aabbcc;font-weight:bold;">${u.name}</div>
            <div style="color:#44aaff;font-size:0.8rem;">${maxed ? 'MAX' : 'Lv' + level}</div>
            <div style="color:#558877;font-size:0.7rem;">${u.desc}</div>
            <div style="color:${canAfford ? '#44ff88' : '#aa8866'};font-size:0.8rem;">${maxed ? 'MAXED' : formatNumber(cost)}</div>`;
        
        if (canAfford && !maxed) {
            card.onclick = () => buyUpgrade(u.id);
        }
        grid.appendChild(card);
    });
    content.appendChild(grid);
}

function renderRelicShop(content) {
    initRelicShop();
    const ac = GAME.ascensionCrystals || 0;
    const shopAge = GAME.relicShopRotation ? (Date.now() - GAME.relicShopRotation) / 1000 / 60 : 999;
    const needsRefresh = shopAge > 30;
    
    let html = `
        <div style="text-align:center;margin-bottom:1rem;">
            <div style="color:#ffaa00;font-size:1.2rem;">💎 ${formatNumber(ac)} AC</div>
            <div style="color:#88aacc;font-size:0.8rem;">Relic Shop</div>
            ${needsRefresh ? '<div style="color:#ff6644;font-size:0.7rem;">Shop expired - refresh!</div>' : '<div style="color:#558877;font-size:0.7rem;">Refreshes in ' + Math.max(0, Math.ceil(30 - shopAge)) + ' min</div>'}
            <button onclick="refreshRelicShop()" style="background:#334466;color:#aaccff;padding:0.3rem;cursor:pointer;border:1px solid #4466aa;border-radius:3px;margin-top:0.3rem;">🔄 Refresh Shop</button>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:0.5rem;">
    `;
    
    GAME.relicShopItems.forEach(id => {
        const relic = RELICS.find(r => r.id === id);
        if (!relic) return;
        
        const level = GAME.relics?.[id] || 0;
        const cost = Math.floor((RARITY_COSTS[relic.rarity] || 10) * Math.pow(1.3, level) * 5);
        const canAfford = ac >= cost;
        const color = RARITY_COLORS[relic.rarity];
        
        html += `
            <div style="background:#1a1a2e;border:2px solid ${color};border-radius:8px;padding:0.5rem;text-align:center;">
                <div style="font-size:2rem;">${relic.icon}</div>
                <div style="color:${color};font-weight:bold;font-size:0.8rem;">${relic.name}</div>
                <div style="color:#88aacc;font-size:0.65rem;">${relic.rarity}</div>
                ${level > 0 ? '<div style="color:#44ff88;font-size:0.7rem;">Owned: Lv' + level + '</div>' : '<div style="color:' + (canAfford ? '#44ff88' : '#aa8866') + ';font-size:0.8rem;">' + formatNumber(cost) + ' AC</div>'}
                ${!level && canAfford ? '<button onclick="buyRelicFromShop(\'' + id + '\')" style="background:#6644aa;border:1px solid #8866cc;color:#fff;cursor:pointer;border-radius:4px;margin-top:0.3rem;padding:0.3rem 0.8rem;">Buy</button>' : ''}
            </div>
        `;
    });
    
    html += '</div>';
    content.innerHTML = html;
}

function renderAbilitiesShop() {
    const content = document.getElementById('shopContent');
    content.innerHTML = '';
    
    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:0.5rem;';
    
    ABILITIES.forEach((a, i) => {
        const unlocked = GAME.abilities[i];
        const card = document.createElement('div');
        card.style.cssText = 'background:#223344;padding:0.5rem;border-radius:4px;border:1px solid ' + (unlocked ? '#44aa66' : '#334455') + ';cursor:' + (unlocked ? 'default' : (GAME.energy >= a.cost ? 'pointer' : 'default')) + ';';
        card.innerHTML = `<div style="color:#aabbcc;font-weight:bold;">${a.name}</div>
            <div style="color:#558877;font-size:0.75rem;">${a.desc}</div>
            <div style="color:${unlocked ? '#44ff88' : '#aa8866'};">${unlocked ? 'UNLOCKED' : formatNumber(a.cost)}</div>`;
        
        if (!unlocked && GAME.energy >= a.cost) {
            card.onclick = () => {
                GAME.energy -= a.cost;
                GAME.abilities[i] = true;
                playUpgrade();
                saveGame(false);
                renderAbilitiesShop();
                renderAbilityBar();
            };
        }
        grid.appendChild(card);
    });
    content.appendChild(grid);
}

function buyUpgrade(id) {
    const up = UPGRADES.find(u => u.id === id);
    if (!up) return;
    
    const level = GAME.upgrades[id] || 0;
    const cost = getUpgradeCost(id);
    
    if (level >= up.max) return;
    if (GAME.energy < cost) {
        playError();
        toast('Not enough energy!', 'error');
        return;
    }
    
    GAME.energy -= cost;
    GAME.upgrades[id] = level + 1;
    playUpgrade();
    saveGame(false);
    updateDisplay();
    renderShopTab(document.querySelector('.shop-tab.active')?.textContent?.toLowerCase() || 'click');
}

// ========================
// PANEL RENDERING
// ========================
function renderPanel(name) {
    const content = document.getElementById(name + 'Content');
    content.innerHTML = '';
    
    if (name === 'stats') {
        const bonus = Math.round((GAME.prestigeBonus || 0) * 100);
        const cps = getCps();
        const clickPower = getClickPower();
        content.innerHTML = `<div style="line-height:2;">
            <div>💎 Energy: ${formatNumber(GAME.energy)}</div>
            <div>📊 Lifetime Energy: ${formatNumber(GAME.lifetimeEnergy)}</div>
            <div>👆 Total Clicks: ${formatNumber(GAME.clicks)}</div>
            <div>🔥 Max Combo: ${GAME.maxCombo.toFixed(1)}x</div>
            <div>⚡ Current CPS: ${formatNumber(cps)}</div>
            <div>💥 Click Power: ${formatNumber(clickPower)}</div>
            <div>🎯 Crit Chance: ${Math.round(getCritChance() * 100)}%</div>
            <div>👹 Bosses Defeated: ${GAME.bossesWon}</div>
            <div>⭐ Prestige Rank: ${GAME.prestigeRank} (${bonus}% bonus)</div>
            <div>💎 Ascension Crystals: ${formatNumber(GAME.ascensionCrystals || 0)}</div>
            <div>🏆 Relics: ${getOwnedRelicCount()} / ${RELICS.length}</div>
        </div>`;
    }
    
    if (name === 'prestige') {
        const rank = PRESTIGE[GAME.prestigeRank];
        const next = PRESTIGE[GAME.prestigeRank + 1];
        const bonus = Math.round((GAME.prestigeBonus || 0) * 100);
        content.innerHTML = `<div style="text-align:center;padding:2rem;">
            <div style="font-size:1.5rem;color:#aa66ff;">Rank: ${rank.name}</div>
            <div style="color:#44ff88;">Bonus: +${bonus}% production</div>
            ${next ? `<div style="margin:1rem;">Next: ${next.name} (${next.min} bosses)</div>
            <button onclick="doPrestige()" style="background:#aa44ff;color:#fff;padding:0.5rem 2rem;cursor:pointer;border:none;border-radius:4px;margin-top:1rem;">PRESTIGE</button>` : '<div style="color:#ffaa00;margin-top:1rem;">MAX RANK!</div>'}
        </div>`;
    }
    
    if (name === 'achievements') {
        if (!GAME.achievements) GAME.achievements = [];
        
        let html = '<div style="display:flex;flex-direction:column;gap:0.3rem;max-height:70vh;overflow-y:auto;">';
        ACHIEVEMENTS.forEach(a => {
            const achieved = GAME.achievements.includes(a.id);
            html += `<div style="padding:0.4rem;border-radius:3px;background:${achieved ? 'rgba(68,255,136,0.15)' : '#1a1a22'};border:1px solid ${achieved ? '#44ff88' : '#333344'};">
                <div style="color:${achieved ? '#44ff88' : '#88aacc'};font-weight:bold;">${achieved ? '✓' : '○'} ${a.name}</div>
                <div style="color:#556677;font-size:0.7rem;">${a.desc}</div>
            </div>`;
        });
        html += '</div>';
        content.innerHTML = `<div style="margin-bottom:0.5rem;color:#ffaa00;">🏆 ${GAME.achievements.length} / ${ACHIEVEMENTS.length} Achievements</div>` + html;
    }
    
    if (name === 'zones') {
        renderZoneSelector(content);
    }
    
    if (name === 'relics') {
        renderRelicPanel();
    }
}

function doPrestige() {
    const next = PRESTIGE[GAME.prestigeRank + 1];
    if (!next || GAME.bossesWon < next.min) {
        toast('Need ' + next.min + ' bosses', 'error');
        return;
    }
    
    playPrestige();
    GAME.prestigeRank++;
    GAME.prestigeBonus = (GAME.prestigeRank + 1) * 0.5;
    GAME.energy = 0;
    GAME.upgrades = {};
    GAME.abilities = [true, false, false, false, false, false, false, false, false, false, false];
    GAME.bossesWon = 0;
    
    const acReward = GAME.prestigeRank * 100;
    GAME.ascensionCrystals = (GAME.ascensionCrystals || 0) + acReward;
    
    UPGRADES.forEach(u => {
        if (u.rank <= GAME.prestigeRank && !GAME.unlockedUpgrades?.includes(u.id)) {
            if (!GAME.unlockedUpgrades) GAME.unlockedUpgrades = [];
            GAME.unlockedUpgrades.push(u.id);
        }
    });
    
    saveGame();
    renderPanel('prestige');
    toast('Prestiged to ' + next.name + '! +' + acReward + ' AC');
}

function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen();
}

// ========================
// ZONE SELECTOR
// ========================
function renderZoneSelector(content) {
    let html = '<div style="margin-bottom:1rem;"><h3 style="color:#6688ff;margin-bottom:0.5rem;">Select Zone</h3>';
    
    const zoneThemeColors = {
        void: {bg: '#1a1a2e', border: '#666', text: '#88aacc'},
        quantum: {bg: '#1a1a3e', border: '#88f', text: '#aaccff'},
        time: {bg: '#2a2a1e', border: '#cc8', text: '#ffcc88'},
        matter: {bg: '#2e1a2a', border: '#f8a', text: '#ffaacc'},
        light: {bg: '#2e2e1a', border: '#ffa', text: '#ffffaa'},
        dark: {bg: '#0a0a1a', border: '#448', text: '#88aaff'},
        eternal: {bg: '#1a1a1a', border: '#aaa', text: '#cccccc'},
        infinity: {bg: '#2a1a3a', border: '#a4f', text: '#ddaaff'}
    };
    
    ZONES.forEach(z => {
        const isActive = z.id === GAME.currentZone;
        const isUnlocked = z.unlocked;
        const theme = zoneThemeColors[z.theme] || zoneThemeColors.void;
        
        html += `<div onclick="${isUnlocked && !isActive ? "setZone('" + z.id + "')" : ''}" 
            style="padding:0.5rem;margin:0.3rem 0;border-radius:4px;cursor:${isUnlocked && !isActive ? 'pointer' : 'default'};
            background:${isActive ? 'rgba(0,255,136,0.2)' : (isUnlocked ? theme.bg : '#1a1a22')};
            border:2px solid ${isActive ? '#44ff88' : (isUnlocked ? theme.border : '#333344')};">
            <div style="color:${isActive ? '#44ff88' : (isUnlocked ? theme.text : '#666')};font-weight:bold;">${z.name} ${!isUnlocked ? '🔒' : ''}</div>
            <div style="color:#558877;font-size:0.75rem;">${z.desc}</div>
            <div style="color:${isUnlocked ? '#44ff88' : '#aa8866'};font-size:0.8rem;">${z.mult}x multiplier</div>
            ${!isUnlocked && z.unlockUpgrade ? '<div style="color:#ffaa00;font-size:0.65rem;">Buy: ' + (UPGRADES.find(u => u.id === z.unlockUpgrade)?.name || z.unlockUpgrade) + '</div>' : ''}
        </div>`;
    });
    
    html += '</div>';
    content.innerHTML = html;
}

// ========================
// RELIC PANELS - IMPROVED UI
// ========================
let relicView = 'owned';
let relicSortBy = 'rarity';

function renderRelicPanel() {
    const content = document.getElementById('relicsContent');
    const ac = GAME.ascensionCrystals || 0;
    const dust = GAME.relicDust || 0;
    const owned = getOwnedRelicCount();
    const total = RELICS.length;
    
    calculateRelicBonuses();
    
    const totalDustNeeded = getTotalDustNeeded();
    const totalACNeeded = getTotalACNeeded();
    const upgradeableCount = getUpgradeableCount();
    
    let html = `
        <div style="background:linear-gradient(135deg,#1a1a2e 0%,#2a1a3e 100%);padding:1rem;border-radius:10px;margin-bottom:1rem;text-align:center;">
            <div style="display:flex;justify-content:space-around;margin-bottom:0.5rem;">
                <div>
                    <div style="color:#44ff88;font-size:1.4rem;font-weight:bold;">✨ ${formatNumber(dust)}</div>
                    <div style="color:#88aacc;font-size:0.7rem;">Relic Dust</div>
                </div>
                <div>
                    <div style="color:#ffaa00;font-size:1.4rem;font-weight:bold;">💎 ${formatNumber(ac)}</div>
                    <div style="color:#88aacc;font-size:0.7rem;">Ascension Crystals</div>
                </div>
            </div>
            <div style="color:#ff88ff;font-size:0.8rem;">⚡ ${Object.keys(activeCombos).filter(k => activeCombos[k] > 0).length} Active Combos</div>
            <div style="color:#44ff88;font-size:0.8rem;">🎯 ${activeSets.length} Sets Completed</div>
            <div style="color:#aa88ff;font-size:0.75rem;margin-top:0.3rem;">${upgradeableCount} relics can be upgraded</div>
        </div>
        
        <div style="display:flex;gap:0.5rem;margin-bottom:1rem;">
            <button onclick="doRelicPull(1)" style="flex:1;padding:0.5rem;background:#6644aa;border:1px solid #8866cc;color:#fff;cursor:pointer;border-radius:6px;font-weight:bold;"
                ${ac < 10 ? 'disabled style="opacity:0.4"' : ''}>🔮 Pull x1</button>
            <button onclick="doRelicPull(10)" style="flex:1;padding:0.5rem;background:#8855cc;border:1px solid #aa77ee;color:#fff;cursor:pointer;border-radius:6px;font-weight:bold;"
                ${ac < 90 ? 'disabled style="opacity:0.4"' : ''}>🎁 Pull x10</button>
        </div>
        
        <div style="display:flex;gap:0.3rem;margin-bottom:0.5rem;flex-wrap:wrap;">
            <button onclick="relicView='owned';renderRelicPanel()" style="padding:0.4rem 0.6rem;background:${relicView==='owned'?'#4455aa':'#334'};border:1px solid #556;color:#fff;cursor:pointer;border-radius:4px;font-size:0.75rem;">📦 Owned (${owned})</button>
            <button onclick="relicView='shop';renderRelicPanel()" style="padding:0.4rem 0.6rem;background:${relicView==='shop'?'#4455aa':'#334'};border:1px solid #556;color:#fff;cursor:pointer;border-radius:4px;font-size:0.75rem;">🛒 Shop</button>
            <button onclick="relicView='upgrades';renderRelicPanel()" style="padding:0.4rem 0.6rem;background:${relicView==='upgrades'?'#4455aa':'#334'};border:1px solid #556;color:#fff;cursor:pointer;border-radius:4px;font-size:0.75rem;">⬆️ Upgrades (${upgradeableCount})</button>
            <button onclick="relicView='sets';renderRelicPanel()" style="padding:0.4rem 0.6rem;background:${relicView==='sets'?'#4455aa':'#334'};border:1px solid #556;color:#fff;cursor:pointer;border-radius:4px;font-size:0.75rem;">⭐ Sets</button>
            <button onclick="relicView='combos';renderRelicPanel()" style="padding:0.4rem 0.6rem;background:${relicView==='combos'?'#4455aa':'#334'};border:1px solid #556;color:#fff;cursor:pointer;border-radius:4px;font-size:0.75rem;">⚡ Combos</button>
        </div>
    `;
    
    if (relicView === 'owned') {
        html += renderOwnedRelics(ac, dust);
    } else if (relicView === 'shop') {
        html += renderRelicShopContent(ac, dust);
    } else if (relicView === 'upgrades') {
        html += renderUpgradeableRelics(ac, dust);
    } else if (relicView === 'sets') {
        html += renderRelicSets();
    } else if (relicView === 'combos') {
        html += renderRelicCombos();
    }
    
    html += renderActiveBonuses();
    
    content.innerHTML = html;
}

function renderOwnedRelics(ac, dust) {
    const ownedRelics = RELICS.filter(r => (GAME.relics?.[r.id] || 0) > 0);
    const unownedRelics = RELICS.filter(r => (GAME.relics?.[r.id] || 0) === 0);
    
    let html = `
        <div style="margin-bottom:0.5rem;">
            <span style="color:#ffaa00;">Your Relics: ${ownedRelics.length}</span>
            <div style="display:flex;gap:0.2rem;margin-top:0.3rem;flex-wrap:wrap;">
                <button onclick="relicFilter='all';renderRelicPanel()" style="padding:0.25rem 0.4rem;background:${window.relicFilter==='all'?'#556':'#333'};border:1px solid #445;color:#88aacc;cursor:pointer;border-radius:3px;font-size:0.65rem;">All</button>
                <button onclick="relicFilter='common';renderRelicPanel()" style="padding:0.25rem 0.4rem;background:${window.relicFilter==='common'?'#888':'#333'};border:1px solid #666;color:#fff;cursor:pointer;border-radius:3px;font-size:0.65rem;">Common</button>
                <button onclick="relicFilter='uncommon';renderRelicPanel()" style="padding:0.25rem 0.4rem;background:${window.relicFilter==='uncommon'?'#4a4':'#333'};border:1px solid #383;color:#fff;cursor:pointer;border-radius:3px;font-size:0.65rem;">Uncommon</button>
                <button onclick="relicFilter='rare';renderRelicPanel()" style="padding:0.25rem 0.4rem;background:${window.relicFilter==='rare'?'#48f':'#333'};border:1px solid #37c;color:#fff;cursor:pointer;border-radius:3px;font-size:0.65rem;">Rare</button>
                <button onclick="relicFilter='epic';renderRelicPanel()" style="padding:0.25rem 0.4rem;background:${window.relicFilter==='epic'?'#a4f':'#333'};border:1px solid #93c;color:#fff;cursor:pointer;border-radius:3px;font-size:0.65rem;">Epic</button>
                <button onclick="relicFilter='legendary';renderRelicPanel()" style="padding:0.25rem 0.4rem;background:${window.relicFilter==='legendary'?'#fa0':'#333'};border:1px solid #c90;color:#fff;cursor:pointer;border-radius:3px;font-size:0.65rem;">Legendary</button>
            </div>
        </div>
        
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(85px,1fr));gap:0.4rem;padding-bottom:0.5rem;">
    `;
    
    let filtered = (window.relicFilter === 'all') ? ownedRelics : ownedRelics.filter(r => r.rarity === window.relicFilter);
    
    filtered.sort((a, b) => {
        if (relicSortBy === 'rarity') return getRarityOrder(b.rarity) - getRarityOrder(a.rarity);
        if (relicSortBy === 'level') return (GAME.relics?.[b.id] || 0) - (GAME.relics?.[a.id] || 0);
        return a.name.localeCompare(b.name);
    });
    
    filtered.forEach(r => {
        html += renderRelicCard(r, ac, dust, true);
    });
    
    html += '</div>';
    return html;
}

function renderRelicShopContent(ac, dust) {
    initRelicShop();
    
    let html = `
        <div style="background:#1a1a2e;padding:0.8rem;border-radius:8px;margin-bottom:0.5rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <div>
                    <div style="color:#ffaa00;font-size:0.9rem;">🛒 Relic Shop</div>
                    <div style="color:#88aacc;font-size:0.7rem;">Refreshes every 30 min</div>
                </div>
                <button onclick="refreshRelicShop()" style="padding:0.3rem 0.6rem;background:#334466;color:#aaccff;border:1px solid #4466aa;cursor:pointer;border-radius:4px;">🔄 Refresh</button>
            </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:0.4rem;padding-bottom:0.5rem;">
    `;
    
    GAME.relicShopItems.forEach(id => {
        const relic = getRelic(id);
        if (!relic) return;
        html += renderRelicCard(relic, ac, dust, false, true);
    });
    
    html += '</div>';
    return html;
}

function renderUpgradeableRelics(ac, dust) {
    let html = '<div style="margin-bottom:0.5rem;"><span style="color:#44ff88;">Ready to Upgrade:</span></div>';
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:0.4rem;padding-bottom:0.5rem;">';
    
    const upgradeable = RELICS.filter(r => {
        const level = GAME.relics?.[r.id] || 0;
        if (level === 0 || level >= r.maxLevel) return false;
        const dustCost = Math.floor(level * 0.5) + 1;
        return dust >= dustCost;
    }).sort((a, b) => {
        const aLevel = GAME.relics?.[a.id] || 0;
        const bLevel = GAME.relics?.[b.id] || 0;
        return bLevel - aLevel;
    });
    
    upgradeable.forEach(r => {
        html += renderRelicCard(r, ac, dust, true, false, true);
    });
    
    html += '</div>';
    
    if (upgradeable.length === 0) {
        html += '<div style="text-align:center;padding:2rem;color:#666;">No relics ready to upgrade yet.<br>Earn more Relic Dust from bosses!</div>';
    }
    
    return html;
}

function renderRelicSets() {
    let html = '<div style="margin-bottom:0.5rem;"><span style="color:#ff88ff;">Relic Sets:</span></div>';
    html += '<div style="max-height:50vh;overflow-y:auto;">';
    
    window.RELIC_SETS.forEach(set => {
        const owned = set.relics.filter(id => getRelicLevel(id) > 0).length;
        const total = set.relics.length;
        const complete = owned >= total;
        const progress = Math.round((owned / total) * 100);
        
        html += `
            <div style="background:${complete ? 'rgba(68,255,136,0.15)' : '#1a1a2e'};border:2px solid ${complete ? '#44ff88' : '#333'};border-radius:8px;padding:0.6rem;margin-bottom:0.4rem;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.3rem;">
                    <span style="color:${complete ? '#44ff88' : '#ff88ff'};font-weight:bold;">${set.name}</span>
                    <span style="color:${complete ? '#44ff88' : '#888'};">${owned}/${total}</span>
                </div>
                <div style="background:#333;height:6px;border-radius:3px;margin-bottom:0.3rem;">
                    <div style="background:${complete ? '#44ff88' : '#6688ff'};height:100%;width:${progress}%;border-radius:3px;"></div>
                </div>
                <div style="color:#88aacc;font-size:0.65rem;">${set.desc || ''}</div>
                ${set.setBonus ? '<div style="color:#ffaa00;font-size:0.6rem;margin-top:0.2rem;">🎁 Set Bonus: ' + getRelicName(set.setBonus) + '</div>' : ''}
                <div style="display:flex;gap:0.3rem;flex-wrap:wrap;margin-top:0.4rem;">
                    ${set.relics.map(id => {
                        const r = getRelic(id);
                        const lvl = getRelicLevel(id);
                        return r ? '<span style="background:#223;padding:0.2rem 0.4rem;border-radius:3px;font-size:0.6rem;color:' + (lvl > 0 ? '#44ff88' : '#666') + ';">' + r.icon + ' ' + (lvl > 0 ? 'Lv' + lvl : r.name) + '</span>' : '';
                    }).join('')}
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

function renderRelicCombos() {
    let html = '<div style="margin-bottom:0.5rem;"><span style="color:#ff88ff;">Active Combos:</span></div>';
    html += '<div style="max-height:50vh;overflow-y:auto;">';
    
    const activeComboList = Object.keys(activeCombos).filter(k => activeCombos[k] > 0);
    
    if (activeComboList.length === 0) {
        html += '<div style="text-align:center;padding:2rem;color:#666;">No active combos yet.<br>Collect paired relics to activate synergies!</div>';
    } else {
        RELICS.forEach(relic => {
            if (!relic.combo) return;
            const level = getRelicLevel(relic.id);
            if (level === 0) return;
            
            Object.keys(relic.combo).forEach(comboId => {
                const comboLevel = getRelicLevel(comboId);
                if (comboLevel === 0) return;
                
                const otherRelic = getRelic(comboId);
                const comboName = relic.combo[comboId];
                if (!otherRelic || typeof comboName !== 'string') return;
                
                html += `
                    <div style="background:#2a1a3e;border:1px solid #6644aa;border-radius:8px;padding:0.6rem;margin-bottom:0.4rem;">
                        <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.3rem;">
                            <span style="font-size:1.5rem;">${relic.icon}</span>
                            <span style="color:#ff88ff;">+</span>
                            <span style="font-size:1.5rem;">${otherRelic.icon}</span>
                        </div>
                        <div style="color:#aa88ff;font-size:0.8rem;font-weight:bold;">${formatComboName(comboName)}</div>
                        <div style="color:#88aacc;font-size:0.65rem;">${relic.name} (Lv${level}) + ${otherRelic.name} (Lv${comboLevel})</div>
                    </div>
                `;
            });
        });
    }
    
    html += '</div>';
    return html;
}

function renderRelicCard(r, ac, dust, isOwned, isShop, showUpgrade) {
    const level = GAME.relics?.[r.id] || 0;
    const maxed = level >= r.maxLevel;
    const color = RARITY_COLORS[r.rarity];
    
    const dustCost = Math.floor(level * 0.5) + 1;
    const acCost = Math.floor((RARITY_COSTS[r.rarity] || 10) * Math.pow(1.5, level));
    
    const canUpgrade = isOwned && !maxed && dust >= dustCost;
    const canBuy = isShop && level === 0 && ac >= acCost;
    
    const comboNames = getRelicCombos(r);
    const setNames = getRelicSets(r);
    
    return `
        <div onclick="${canUpgrade ? "upgradeRelic('" + r.id + "')" : (canBuy ? "buyRelicFromShop('" + r.id + "')" : '')}"
            style="background:#1a1a2e;border:2px solid ${isOwned ? color : (isShop ? '#334' : '#222')};border-radius:8px;padding:0.5rem;text-align:center;cursor:${canUpgrade || canBuy ? 'pointer' : 'default'};opacity:${isOwned || isShop ? 1 : 0.4};">
            <div style="font-size:1.6rem;">${r.icon}</div>
            <div style="color:${color};font-size:0.6rem;font-weight:bold;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${r.name}</div>
            <div style="color:#88aacc;font-size:0.5rem;">${r.rarity}</div>
            
            ${isOwned ? '<div style="color:#ffaa00;font-size:0.7rem;">Lv' + level + (maxed ? ' MAX' : '') + '</div>' : ''}
            
            ${isShop && !isOwned ? '<div style="color:#ffaa00;font-size:0.6rem;">' + formatNumber(acCost) + ' AC</div>' : ''}
            
            ${showUpgrade && isOwned && !maxed ? '<div style="color:#44ff88;font-size:0.6rem;">✨' + dustCost + ' dust</div>' : ''}
            
            ${canUpgrade ? '<div style="background:#44aa44;padding:0.2rem;border-radius:3px;margin-top:0.2rem;"><span style="color:#fff;font-size:0.6rem;">⬆️ UPGRADE</span></div>' : ''}
            ${canBuy ? '<div style="background:#6644aa;padding:0.2rem;border-radius:3px;margin-top:0.2rem;"><span style="color:#fff;font-size:0.6rem;">BUY</span></div>' : ''}
            
            ${setNames.length > 0 ? '<div style="color:#44ff88;font-size:0.5rem;">' + setNames.slice(0, 1).join(', ') + '</div>' : ''}
        </div>
    `;
}

function renderActiveBonuses() {
    const activeSetCount = renderActiveSets().length;
    return `
        <div style="margin-top:1rem;padding:0.8rem;background:#1a1a2e;border-radius:8px;">
            <div style="color:#6688ff;font-weight:bold;margin-bottom:0.5rem;">📊 Active Bonuses:</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.3rem;font-size:0.75rem;">
                <div>👆 +${(relicBonuses.clickPower * 100).toFixed(1)}% Click</div>
                <div>⚡ +${(relicBonuses.cps * 100).toFixed(1)}% CPS</div>
                <div>🎯 +${(relicBonuses.critChance * 100).toFixed(1)}% Crit</div>
                <div>💥 +${(relicBonuses.critMult * 100).toFixed(1)}% Crit Mult</div>
                <div>🔥 +${(relicBonuses.combo * 100).toFixed(1)}% Combo</div>
                <div>👹 +${(relicBonuses.bossDmg * 100).toFixed(1)}% Boss Dmg</div>
                ${relicBonuses.moltenChance > 0 ? '<div>🔥 +' + (relicBonuses.moltenChance * 100).toFixed(1) + '% Molten Star</div>' : ''}
                ${relicBonuses.offlineGain > 0 ? '<div>💤 +' + (relicBonuses.offlineGain * 100).toFixed(1) + '% Offline</div>' : ''}
                ${relicBonuses.globalBoost > 0 ? '<div>🌌 +' + (relicBonuses.globalBoost * 100).toFixed(1) + '% Global</div>' : ''}
            </div>
        </div>
    `;
}

function getRarityOrder(rarity) {
    const order = { mythic: 6, legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 };
    return order[rarity] || 0;
}

function getRelicName(id) {
    const r = getRelic(id);
    return r ? r.name : id;
}

function getTotalDustNeeded() {
    let total = 0;
    RELICS.forEach(r => {
        const level = GAME.relics?.[r.id] || 0;
        if (level > 0 && level < r.maxLevel) {
            total += Math.floor(level * 0.5) + 1;
        }
    });
    return total;
}

function getTotalACNeeded() {
    let total = 0;
    RELICS.forEach(r => {
        const level = GAME.relics?.[r.id] || 0;
        if (level === 0) {
            total += RARITY_COSTS[r.rarity] || 10;
        } else if (level < r.maxLevel) {
            total += Math.floor((RARITY_COSTS[r.rarity] || 10) * Math.pow(1.5, level));
        }
    });
    return total;
}

function getUpgradeableCount() {
    return RELICS.filter(r => {
        const level = GAME.relics?.[r.id] || 0;
        if (level === 0 || level >= r.maxLevel) return false;
        const dustCost = Math.floor(level * 0.5) + 1;
        return GAME.relicDust >= dustCost;
    }).length;
}

function openRelics() {
    openPanel('relics');
    renderRelicPanel();
}

function getRelicCombos(r) {
    if (!r.combo) return [];
    return Object.keys(r.combo).filter(id => (GAME.relics?.[id] || 0) > 0);
}

function getRelicSets(r) {
    if (!r.set) return [];
    const sets = [];
    if (window.RELIC_SETS) {
        window.RELIC_SETS.forEach(s => {
            if (s.relics && s.relics.includes(r.id) && s.relics.every(id => (GAME.relics?.[id] || 0) > 0)) {
                sets.push(s.name);
            }
        });
    }
    return sets;
}

function renderActiveCombos() {
    const combos = [];
    RELICS.forEach(r => {
        if (!r.combo) return;
        Object.keys(r.combo).forEach(id => {
            if ((GAME.relics?.[r.id] || 0) > 0 && (GAME.relics?.[id] || 0) > 0) {
                combos.push({ relic: r, comboId: id, name: r.combo[id] });
            }
        });
    });
    return combos;
}

function renderActiveSets() {
    if (!window.RELIC_SETS) return [];
    return window.RELIC_SETS.filter(s => 
        s.relics && s.relics.every(id => (GAME.relics?.[id] || 0) > 0)
    );
}

function formatComboName(name) {
    if (!name || typeof name !== 'string') return '';
    return name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ========================
// ZONES PANEL
// ========================
function renderZonesPanel() {
    const content = document.getElementById('zonesContent');
    renderZoneSelector(content);
}

// Make UI functions global
window.updateDisplay = updateDisplay;
window.toast = toast;
window.showClickText = showClickText;
window.openShop = openShop;
window.openPanel = openPanel;
window.closePanel = closePanel;
window.switchShopTab = switchShopTab;
window.renderShopTab = renderShopTab;
window.renderAbilitiesShop = renderAbilitiesShop;
window.renderRelicShop = renderRelicShop;
window.buyUpgrade = buyUpgrade;
window.renderPanel = renderPanel;
window.doPrestige = doPrestige;
window.toggleFullscreen = toggleFullscreen;
window.renderZoneSelector = renderZoneSelector;
window.renderRelicPanel = renderRelicPanel;
window.openRelics = openRelics;
window.renderZonesPanel = renderZonesPanel;
window.renderActiveCombos = renderActiveCombos;
window.renderActiveSets = renderActiveSets;
window.getRelicCombos = getRelicCombos;
window.getRelicSets = getRelicSets;
window.formatComboName = formatComboName;
window.formatNumber = formatNumber;
window.initRelicShop = initRelicShop;
window.buyRelicFromShop = buyRelicFromShop;
window.refreshRelicShop = refreshRelicShop;
window.buyMulti = buyMulti;
window.relicView = relicView;
window.relicSortBy = relicSortBy;
window.getRarityOrder = getRarityOrder;
window.getRelicName = getRelicName;
window.getTotalDustNeeded = getTotalDustNeeded;
window.getTotalACNeeded = getTotalACNeeded;
window.getUpgradeableCount = getUpgradeableCount;