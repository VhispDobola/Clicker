// UI functions - reference globals via window when needed
const G = () => window;

// ========================
// UI FUNCTIONS
// ========================
let lastPanel = null;
let buyMulti = 1;
let clickTextEl = null;
let relicFilter = 'all';

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

function toast(msg, type = 'success') {
    const t = document.getElementById('toast');
    const m = document.createElement('div');
    m.className = 'toast-msg ' + type;
    m.textContent = msg;
    t.appendChild(m);
    if (type === 'error') playError();
    else playToast();
    setTimeout(() => m.remove(), 2500);
}

function showClickText(power, isCrit) {
    if (!clickTextEl) {
        clickTextEl = document.createElement('div');
        clickTextEl.style.cssText = 'position:fixed;pointer-events:none;z-index:50;transition:all 0.8s ease-out;font-weight:bold;opacity:0;';
        document.body.appendChild(clickTextEl);
    }
    const px = window.innerWidth / 2;
    const py = window.innerHeight / 2;
    clickTextEl.textContent = '+' + formatNumber(power) + (isCrit ? ' CRIT!' : '');
    clickTextEl.style.left = px + 'px';
    clickTextEl.style.top = py + 'px';
    clickTextEl.style.color = isCrit ? '#ff6600' : '#00ffaa';
    clickTextEl.style.fontSize = isCrit ? '1.8rem' : '1.2rem';
    clickTextEl.style.transform = 'translate(-50%,0)';
    clickTextEl.style.opacity = '1';
    
    setTimeout(() => {
        clickTextEl.style.transform = 'translate(-50%,-60px)';
        clickTextEl.style.opacity = '0';
    }, 50);
}

function openShop() {
    initAudio();
    playMenuOpen();
    lastPanel = 'shop';
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.getElementById('panel-shop').classList.add('active');
    renderShopTab('click');
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

function switchShopTab(tab) {
    playPanelSwitch();
    document.querySelectorAll('.shop-tab').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    renderShopTab(tab);
}

// ========================
// SHOP RENDERING
// ========================
function renderShopTab(tab) {
    const content = document.getElementById('shopContent');
    content.innerHTML = '';
    
    if (tab === 'abilities') { renderAbilitiesShop(content); return; }
    
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

function renderAbilitiesShop(content) {
    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:0.5rem;';
    
    ABILITIES.forEach((a, i) => {
        const unlocked = GAME.abilities[i];
        const card = document.createElement('div');
        card.style.cssText = 'background:#223344;padding:0.5rem;border-radius:4px;border:1px solid ' + (unlocked ? '#44aa66' : '#334455') + ';';
        card.innerHTML = `<div style="color:#aabbcc;font-weight:bold;">${a.name}</div>
            <div style="color:#558877;font-size:0.75rem;">${a.desc}</div>
            <div style="color:#aa8866;">${unlocked ? 'UNLOCKED' : formatNumber(a.cost)}</div>`;
        
        if (!unlocked && GAME.energy >= a.cost) {
            card.onclick = () => {
                GAME.energy -= a.cost;
                GAME.abilities[i] = true;
                playUpgrade();
                saveGame(false);
                renderAbilitiesShop(content);
            };
            card.style.cursor = 'pointer';
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
    
    ZONES.forEach(z => {
        const isActive = z.id === GAME.currentZone;
        const canAfford = GAME.lifetimeEnergy >= z.cost;
        
        html += `<div onclick="${canAfford && !isActive ? "setZone('" + z.id + "')" : ''}" 
            style="padding:0.5rem;margin:0.3rem 0;border-radius:4px;cursor:${canAfford && !isActive ? 'pointer' : 'default'};
            background:${isActive ? 'rgba(0,255,136,0.2)' : (canAfford ? '#224433' : '#1a1a22')};
            border:2px solid ${isActive ? '#44ff88' : (canAfford ? '#44aa66' : '#333344')};">
            <div style="color:${isActive ? '#44ff88' : '#aabbcc'};font-weight:bold;">${z.name}</div>
            <div style="color:#558877;font-size:0.75rem;">${z.desc}</div>
            <div style="color:${canAfford ? '#44ff88' : '#aa8866'};font-size:0.8rem;">${z.mult}x multiplier</div>
        </div>`;
    });
    
    html += '</div>';
    content.innerHTML = html;
}

// ========================
// RELIC PANELS
// ========================
function renderRelicPanel() {
    const content = document.getElementById('relicsContent');
    const ac = GAME.ascensionCrystals || 0;
    const dust = GAME.relicDust || 0;
    const owned = getOwnedRelicCount();
    const total = RELICS.length;
    
    calculateRelicBonuses();
    
    let html = `
        <div style="background:#1a1a2e;padding:0.8rem;border-radius:8px;margin-bottom:1rem;">
            <div style="color:#ffaa00;font-size:1.2rem;font-weight:bold;">💎 ${formatNumber(ac)} AC</div>
            <div style="color:#88aacc;font-size:0.8rem;">✨ ${dust} Relic Dust</div>
            <div style="color:#6688aa;font-size:0.75rem;">🏆 Pity: ${GAME.pityCounter || 0} / ${GAME_CONFIG.PITY_THRESHOLD}</div>
        </div>
        
        <div style="display:flex;gap:0.5rem;margin-bottom:1rem;">
            <button onclick="doRelicPull(1)" style="flex:1;padding:0.5rem;background:#6644aa;border:1px solid #8866cc;color:#fff;cursor:pointer;border-radius:4px;"
                ${ac < 10 ? 'disabled style="opacity:0.5"' : ''}>🔮 Pull 1 (10 AC)</button>
            <button onclick="doRelicPull(10)" style="flex:1;padding:0.5rem;background:#6644aa;border:1px solid #8866cc;color:#fff;cursor:pointer;border-radius:4px;"
                ${ac < 90 ? 'disabled style="opacity:0.5"' : ''}>🎁 Pull 10 (90 AC)</button>
        </div>
        
        <div style="margin-bottom:1rem;padding:0.5rem;background:#1a1a2e;border-radius:4px;">
            <div style="color:#6688ff;font-weight:bold;margin-bottom:0.5rem;">Active Bonuses:</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.3rem;font-size:0.8rem;">
                <div>👆 +${(relicBonuses.clickPower * 100).toFixed(1)}% Click</div>
                <div>⚡ +${(relicBonuses.cps * 100).toFixed(1)}% CPS</div>
                <div>🎯 +${(relicBonuses.critChance * 100).toFixed(1)}% Crit</div>
                <div>🔥 +${(relicBonuses.combo * 100).toFixed(1)}% Combo</div>
                <div>👹 +${(relicBonuses.bossDmg * 100).toFixed(1)}% Boss Dmg</div>
                <div>⭐ +${(relicBonuses.prestigeBonus * 100).toFixed(1)}% Prestige</div>
            </div>
        </div>
        
        <div style="color:#ffaa00;margin-bottom:0.5rem;">${owned} / ${total} Relics Owned</div>
        
        <div style="display:flex;gap:0.3rem;margin-bottom:0.5rem;flex-wrap:wrap;">
            <button onclick="relicFilter='all';renderRelicPanel()" style="padding:0.3rem;background:${relicFilter==='all'?'#334466':'#223344'};border:1px solid #334455;color:#88aacc;cursor:pointer;border-radius:3px;font-size:0.7rem;">All</button>
            <button onclick="relicFilter='common';renderRelicPanel()" style="padding:0.3rem;background:${relicFilter==='common'?'#334466':'#223344'};border:1px solid #334455;color:#88aacc;cursor:pointer;border-radius:3px;font-size:0.7rem;">Common</button>
            <button onclick="relicFilter='uncommon';renderRelicPanel()" style="padding:0.3rem;background:${relicFilter==='uncommon'?'#334466':'#223344'};border:1px solid #334455;color:#88aacc;cursor:pointer;border-radius:3px;font-size:0.7rem;">Uncommon</button>
            <button onclick="relicFilter='rare';renderRelicPanel()" style="padding:0.3rem;background:${relicFilter==='rare'?'#334466':'#223344'};border:1px solid #334455;color:#88aacc;cursor:pointer;border-radius:3px;font-size:0.7rem;">Rare</button>
            <button onclick="relicFilter='epic';renderRelicPanel()" style="padding:0.3rem;background:${relicFilter==='epic'?'#334466':'#223344'};border:1px solid #334455;color:#88aacc;cursor:pointer;border-radius:3px;font-size:0.7rem;">Epic</button>
            <button onclick="relicFilter='legendary';renderRelicPanel()" style="padding:0.3rem;background:${relicFilter==='legendary'?'#334466':'#223344'};border:1px solid #334455;color:#88aacc;cursor:pointer;border-radius:3px;font-size:0.7rem;">Legendary</button>
        </div>
        
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:0.5rem;max-height:40vh;overflow-y:auto;">
    `;
    
    const filtered = relicFilter === 'all' ? RELICS : RELICS.filter(r => r.rarity === relicFilter);
    
    filtered.forEach(r => {
        const level = GAME.relics?.[r.id] || 0;
        const owned = level > 0;
        const maxed = level >= r.maxLevel;
        const color = RARITY_COLORS[r.rarity];
        
        const upgradeCost = Math.floor(10 * Math.pow(1.5, level));
        const dustCost = level + 1;
        const canUpgrade = owned && !maxed && ac >= upgradeCost && dust >= dustCost;
        
        html += `
            <div onclick="${canUpgrade ? "upgradeRelic('" + r.id + "')" : ''}"
                style="background:#1a1a2e;border:2px solid ${owned ? color : '#333'};border-radius:8px;padding:0.5rem;text-align:center;cursor:${canUpgrade ? 'pointer' : 'default'};opacity:${owned ? 1 : 0.5};">
                <div style="font-size:1.5rem;">${r.icon}</div>
                <div style="color:${color};font-size:0.65rem;font-weight:bold;">${r.name}</div>
                <div style="color:#88aacc;font-size:0.6rem;">${r.rarity}</div>
                ${owned ? '<div style="color:#ffaa00;font-size:0.7rem;">Lv' + level + (maxed ? ' MAX' : '') + '</div>' : ''}
                ${!owned ? '<div style="color:#558877;font-size:0.6rem;">' + r.desc + '</div>' : ''}
            </div>
        `;
    });
    
    html += '</div>';
    content.innerHTML = html;
}

function openRelics() {
    openPanel('relics');
    renderRelicPanel();
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
window.buyUpgrade = buyUpgrade;
window.renderPanel = renderPanel;
window.doPrestige = doPrestige;
window.toggleFullscreen = toggleFullscreen;
window.renderZoneSelector = renderZoneSelector;
window.renderRelicPanel = renderRelicPanel;
window.openRelics = openRelics;
window.renderZonesPanel = renderZonesPanel;