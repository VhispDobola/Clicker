// ========================
// AUDIO SYSTEM
// ========================
let audioCtx = null;
let soundEnabled = true;

function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playSound(type, duration = 0.1, freq = 440, freqEnd = null, volume = 0.15) {
    if (!soundEnabled || !audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, audioCtx.currentTime + duration);
    gain.gain.setValueAtTime(volume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

// Click sounds
function playClick() { playSound('sine', 0.08, 600, 800, 0.1); }
function playCrit() { playSound('square', 0.15, 880, 1200, 0.12); playSound('sine', 0.2, 440, 220, 0.15); }
function playUpgrade() { playSound('triangle', 0.12, 523, 784, 0.1); }
function playError() { playSound('sawtooth', 0.3, 200, 100, 0.1); }
function playSuccess() { playSound('sine', 0.2, 523, 1047, 0.12); }
function playToast() { playSound('sine', 0.15, 400, 600, 0.08); }
function playButton() { playSound('triangle', 0.05, 500, 700, 0.06); }
function playCPS() { playSound('sine', 0.02, 800, 0, 0.02); }
function playCombo() { playSound('sine', 0.1, 400, 600 + clickCombo * 50, 0.08); }

// Ability sounds
function playAbility() { playSound('sine', 0.1, 523, 1047, 0.12); }

// Menu sounds
function playMenuOpen() { playSound('sine', 0.08, 400, 600, 0.06); }
function playMenuClose() { playSound('sine', 0.08, 600, 400, 0.06); }
function playPanelSwitch() { playSound('sine', 0.04, 400, 500, 0.04); }

// Prestige sounds
function playPrestige() {
    playSound('sawtooth', 0.5, 100, 800, 0.15);
    setTimeout(() => playSound('sawtooth', 0.5, 200, 1000, 0.15), 200);
    setTimeout(() => playSound('sine', 1, 300, 1500, 0.2), 400);
}

// Boss sounds
function playBossStart() {
    playSound('square', 0.3, 200, 400, 0.15);
    setTimeout(() => playSound('square', 0.3, 300, 500, 0.15), 150);
    setTimeout(() => playSound('square', 0.4, 400, 600, 0.15), 300);
}
function playBossHit() { playSound('square', 0.1, 150, 100, 0.15); }
function playPlayerHit() { playSound('sawtooth', 0.2, 200, 100, 0.2); }
function playBossWin() {
    playSound('sine', 0.3, 523, 1047, 0.15);
    setTimeout(() => playSound('sine', 0.3, 659, 1319, 0.15), 200);
    setTimeout(() => playSound('sine', 0.5, 784, 1568, 0.2), 400);
}
function playBossMusic() { musicPlaying = true; }

// Effect sounds
function playDamage() { playSound('square', 0.15, 100, 50, 0.2); }
function playHeal() { playSound('sine', 0.3, 400, 800, 0.12); }
function playBlackHole() { playSound('sine', 0.5, 100, 50, 0.15); }
function playShootingStar() { playSound('triangle', 0.3, 600, 1000, 0.08); }
function playShoot() { playSound('triangle', 0.05, 800, 1200, 0.08); }
function playAchievement() {
    playSound('sine', 0.15, 587, 1175, 0.12);
    setTimeout(() => playSound('sine', 0.15, 784, 1568, 0.12), 150);
    setTimeout(() => playSound('sine', 0.25, 1047, 2093, 0.15), 300);
}
function playMilestone() {
    playSound('sine', 0.3, 440, 880, 0.15);
    setTimeout(() => playSound('sine', 0.3, 554, 1108, 0.15), 150);
    setTimeout(() => playSound('sine', 0.5, 659, 1319, 0.15), 300);
}

// Sound toggle
function toggleSound() {
    soundEnabled = !soundEnabled;
    GAME.soundEnabled = soundEnabled;
    playClick();
    saveGame(false);
}

function applySettings() {
    if (GAME.soundEnabled === false) soundEnabled = false;
}

// Make audio functions global
window.initAudio = initAudio;
window.playSound = playSound;
window.playClick = playClick;
window.playCrit = playCrit;
window.playUpgrade = playUpgrade;
window.playError = playError;
window.playSuccess = playSuccess;
window.playToast = playToast;
window.playButton = playButton;
window.playCPS = playCPS;
window.playCombo = playCombo;
window.playAbility = playAbility;
window.playMenuOpen = playMenuOpen;
window.playMenuClose = playMenuClose;
window.playPanelSwitch = playPanelSwitch;
window.playPrestige = playPrestige;
window.playBossStart = playBossStart;
window.playBossHit = playBossHit;
window.playPlayerHit = playPlayerHit;
window.playBossWin = playBossWin;
window.playBossMusic = playBossMusic;
window.playDamage = playDamage;
window.playHeal = playHeal;
window.playBlackHole = playBlackHole;
window.playShootingStar = playShootingStar;
window.playShoot = playShoot;
window.playAchievement = playAchievement;
window.playMilestone = playMilestone;
window.toggleSound = toggleSound;
window.applySettings = applySettings;
window.soundEnabled = soundEnabled;