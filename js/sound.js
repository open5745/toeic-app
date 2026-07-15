const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

// iOS/Android 要求 AudioContext 在使用者手勢中建立與恢復，
// 首次觸碰先解鎖，避免之後在 setTimeout 等非手勢情境播放時整個靜音
document.addEventListener('pointerdown', () => {
  try { initAudio(); } catch { /* 不支援就算了 */ }
}, { once: true, passive: true, capture: true });

// 用於按鈕點擊、下一題、我記得了（不刺耳的水滴/木魚聲）
export function playSoftClick() {
  try {
    initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine'; // 正弦波最柔和
    osc.frequency.setValueAtTime(450, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
  } catch (e) {
    console.error('Audio playback failed', e);
  }
}

// 用於考試點擊 ABCD 選項（比翻頁更短促、清脆的高音）
export function playSelectOption() {
  try {
    initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(750, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, audioCtx.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.08);
  } catch (e) {
    console.error('Audio playback failed', e);
  }
}

// 用於交卷完成（優雅清脆的上升和弦）
export function playSuccess() {
  try {
    initAudio();
    const playNote = (freq, delay) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'triangle'; // 三角波帶有水晶感
      osc.frequency.value = freq;
      
      gain.gain.setValueAtTime(0, audioCtx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + delay + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + delay + 0.4);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start(audioCtx.currentTime + delay);
      osc.stop(audioCtx.currentTime + delay + 0.4);
    };
    
    playNote(523.25, 0);      // C5
    playNote(659.25, 0.15);   // E5
    playNote(783.99, 0.3);    // G5
    playNote(1046.50, 0.45);  // C6
  } catch (e) {
    console.error('Audio playback failed', e);
  }
}

// 用於單題答對（短版上升雙音，比交卷的 playSuccess 輕巧）
export function playCorrect() {
  try {
    initAudio();
    const playNote = (freq, delay) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0, audioCtx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + delay + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + delay + 0.25);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(audioCtx.currentTime + delay);
      osc.stop(audioCtx.currentTime + delay + 0.25);
    };

    playNote(659.25, 0);     // E5
    playNote(1046.50, 0.1);  // C6
  } catch (e) {
    console.error('Audio playback failed', e);
  }
}

// 用於單題答錯（短促下降低音，提示但不刺耳）
export function playError() {
  try {
    initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, audioCtx.currentTime + 0.2);

    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.25);
  } catch (e) {
    console.error('Audio playback failed', e);
  }
}
