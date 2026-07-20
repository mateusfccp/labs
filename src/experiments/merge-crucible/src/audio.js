const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        function playSound(type) {
            if (audioCtx.state === 'suspended') audioCtx.resume();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain); gain.connect(audioCtx.destination);

            switch(type) {
                case 'select':
                    osc.type = 'sine'; osc.frequency.setValueAtTime(950, audioCtx.currentTime);
                    gain.gain.setValueAtTime(0.04, audioCtx.currentTime); gain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
                    osc.start(); osc.stop(audioCtx.currentTime + 0.05); break;
                case 'spawn':
                    osc.type = 'sine'; osc.frequency.setValueAtTime(250, audioCtx.currentTime); osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.15);
                    gain.gain.setValueAtTime(0.06, audioCtx.currentTime); gain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
                    osc.start(); osc.stop(audioCtx.currentTime + 0.15); break;
                case 'merge':
                    osc.type = 'triangle'; osc.frequency.setValueAtTime(400, audioCtx.currentTime); osc.frequency.exponentialRampToValueAtTime(1100, audioCtx.currentTime + 0.3);
                    gain.gain.setValueAtTime(0.12, audioCtx.currentTime); gain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
                    osc.start(); osc.stop(audioCtx.currentTime + 0.3); break;
                case 'fail_recipe':
                    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, audioCtx.currentTime); osc.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.2);
                    gain.gain.setValueAtTime(0.1, audioCtx.currentTime); gain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
                    osc.start(); osc.stop(audioCtx.currentTime + 0.2); break;
                case 'attack':
                    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(220, audioCtx.currentTime); osc.frequency.linearRampToValueAtTime(40, audioCtx.currentTime + 0.25);
                    gain.gain.setValueAtTime(0.12, audioCtx.currentTime); gain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
                    osc.start(); osc.stop(audioCtx.currentTime + 0.25); break;
                case 'defend':
                    osc.type = 'sine'; osc.frequency.setValueAtTime(500, audioCtx.currentTime); osc.frequency.setValueAtTime(750, audioCtx.currentTime + 0.05);
                    gain.gain.setValueAtTime(0.08, audioCtx.currentTime); gain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
                    osc.start(); osc.stop(audioCtx.currentTime + 0.2); break;
                case 'recycle':
                    osc.type = 'sine'; osc.frequency.setValueAtTime(800, audioCtx.currentTime); osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.15);
                    gain.gain.setValueAtTime(0.1, audioCtx.currentTime); gain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
                    osc.start(); osc.stop(audioCtx.currentTime + 0.15); break;
                case 'hurt':
                    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(120, audioCtx.currentTime); osc.frequency.linearRampToValueAtTime(30, audioCtx.currentTime + 0.35);
                    gain.gain.setValueAtTime(0.18, audioCtx.currentTime); gain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
                    osc.start(); osc.stop(audioCtx.currentTime + 0.35); break;
                case 'win':
                    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
                        setTimeout(() => {
                            const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
                            o.connect(g); g.connect(audioCtx.destination);
                            o.frequency.setValueAtTime(freq, audioCtx.currentTime);
                            g.gain.setValueAtTime(0.06, audioCtx.currentTime);
                            g.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
                            o.start(); o.stop(audioCtx.currentTime + 0.25);
                        }, i * 90);
                    });
                    break;
            }
        }

