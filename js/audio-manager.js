// ==================== 音乐管理器 ====================
class AudioManager {
    constructor() {
        this.audioElements = {};
        this.isMuted = false;
        this.isBackgroundMusicPlaying = false;
        this.userInteracted = false;
        this.initializeAudio();
    }

    // 初始化音频
    initializeAudio() {
        // 创建音频元素
        Object.entries(GAME_CONFIG.musicPaths).forEach(([key, path]) => {
            const audio = new Audio();
            audio.src = path;
            audio.preload = 'auto';
            audio.loop = key === 'background';
            
            // 添加错误处理
            audio.addEventListener('error', (e) => {
                console.error(`音频加载失败 [${key}]:`, path, e);
            });
            
            audio.addEventListener('canplaythrough', () => {
                console.log(`音频已加载 [${key}]:`, path);
            });
            
            this.audioElements[key] = audio;
        });

        // 预加载音频
        this.preloadAudio();
        
        // 监听用户首次交互
        this.setupUserInteraction();
    }

    // 设置用户交互监听
    setupUserInteraction() {
        const handleFirstInteraction = () => {
            if (!this.userInteracted) {
                this.userInteracted = true;
                console.log('✅ 检测到用户交互，准备播放背景音乐');
                this.playBackgroundMusic();
                
                // 移除监听器
                document.removeEventListener('click', handleFirstInteraction);
                document.removeEventListener('touchstart', handleFirstInteraction);
                document.removeEventListener('keydown', handleFirstInteraction);
            }
        };

        document.addEventListener('click', handleFirstInteraction);
        document.addEventListener('touchstart', handleFirstInteraction);
        document.addEventListener('keydown', handleFirstInteraction);
    }

    // 预加载音频
    preloadAudio() {
        console.log('开始预加载音频文件...');
        Object.entries(this.audioElements).forEach(([key, audio]) => {
            audio.load();
        });
    }

    // 播放背景音乐
    playBackgroundMusic() {
        if (this.isMuted || this.isBackgroundMusicPlaying) {
            console.log('背景音乐已静音或正在播放');
            return;
        }
        
        const bgMusic = this.audioElements.background;
        if (bgMusic) {
            bgMusic.volume = 0.3;
            
            const playPromise = bgMusic.play();
            
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        this.isBackgroundMusicPlaying = true;
                        console.log('✅ 背景音乐开始播放');
                    })
                    .catch(e => {
                        console.warn('❌ 背景音乐播放失败:', e.message);
                        console.log('提示：请确保文件路径正确，并且用户已进行交互');
                        
                        // 显示友好提示
                        if (window.slotGame && window.slotGame.ui) {
                            window.slotGame.ui.addAnnouncement('点击任意位置启用音乐', 'info');
                        }
                    });
            }
        } else {
            console.error('❌ 背景音乐元素未找到');
        }
    }

    // 停止背景音乐
    stopBackgroundMusic() {
        const bgMusic = this.audioElements.background;
        if (bgMusic) {
            bgMusic.pause();
            bgMusic.currentTime = 0;
            this.isBackgroundMusicPlaying = false;
            console.log('背景音乐已停止');
        }
    }

    // 播放旋转音效
    playSpinSound() {
        if (this.isMuted) return;
        
        const spinSound = this.audioElements.spin;
        if (spinSound) {
            spinSound.volume = 0.5;
            spinSound.currentTime = 0;
            spinSound.play().catch(e => {
                console.log('旋转音效播放失败:', e.message);
            });
        }
    }

    // 播放停止音效 (新增)
    playStopSound() {
        if (this.isMuted) return;
        
        const stopSound = this.audioElements.stop;
        if (stopSound) {
            stopSound.volume = 0.4;
            stopSound.currentTime = 0;
            stopSound.play().catch(e => {
                console.log('停止音效播放失败:', e.message);
            });
        }
    }

    // 播放中奖音效
    playWinSound(amount = 0) {
        if (this.isMuted) return;
        
        let soundToPlay;
        if (amount >= GAME_CONFIG.bigWinThreshold * 5) {
            soundToPlay = this.audioElements.jackpot;
        } else if (amount >= GAME_CONFIG.bigWinThreshold) {
            soundToPlay = this.audioElements.bigWin;
        } else {
            soundToPlay = this.audioElements.win;
        }
        
        if (soundToPlay) {
            soundToPlay.volume = 0.6;
            soundToPlay.currentTime = 0;
            soundToPlay.play().catch(e => {
                console.log('中奖音效播放失败:', e.message);
            });
        }
    }

    // 播放免费旋转音效
    playFreeSpinsSound() {
        if (this.isMuted) return;
        
        const freeSpinsSound = this.audioElements.freeSpins;
        if (freeSpinsSound) {
            freeSpinsSound.volume = 0.6;
            freeSpinsSound.currentTime = 0;
            freeSpinsSound.play().catch(e => {
                console.log('免费旋转音效播放失败:', e.message);
            });
        }
    }

    // 静音/取消静音
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        Object.values(this.audioElements).forEach(audio => {
            audio.muted = this.isMuted;
        });
        
        // 如果取消静音且背景音乐没播放，则播放
        if (!this.isMuted && !this.isBackgroundMusicPlaying && this.userInteracted) {
            this.playBackgroundMusic();
        }
        
        // 如果静音，停止背景音乐
        if (this.isMuted) {
            this.isBackgroundMusicPlaying = false;
        }
        
        console.log(this.isMuted ? '🔇 已静音' : '🔊 已取消静音');
        return this.isMuted;
    }

    // 设置音量
    setVolume(volume) {
        const clampedVolume = Math.max(0, Math.min(1, volume));
        Object.values(this.audioElements).forEach(audio => {
            audio.volume = clampedVolume;
        });
        console.log(`音量已设置为: ${(clampedVolume * 100).toFixed(0)}%`);
    }

    // 设置背景音乐音量
    setBackgroundVolume(volume) {
        const bgMusic = this.audioElements.background;
        if (bgMusic) {
            bgMusic.volume = Math.max(0, Math.min(1, volume));
        }
    }

    // 停止所有音效
    stopAllSounds() {
        Object.values(this.audioElements).forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
        this.isBackgroundMusicPlaying = false;
        console.log('所有音效已停止');
    }

    // 获取音频状态
    getAudioStatus() {
        return {
            isMuted: this.isMuted,
            isBackgroundPlaying: this.isBackgroundMusicPlaying,
            userInteracted: this.userInteracted,
            loadedAudio: Object.keys(this.audioElements).filter(key => {
                const audio = this.audioElements[key];
                return audio.readyState >= 2; // HAVE_CURRENT_DATA
            })
        };
    }

    // 测试音频
    testAudio() {
        console.log('=== 音频测试 ===');
        console.log('用户已交互:', this.userInteracted);
        console.log('是否静音:', this.isMuted);
        console.log('背景音乐播放中:', this.isBackgroundMusicPlaying);
        
        Object.entries(this.audioElements).forEach(([key, audio]) => {
            console.log(`${key}:`, {
                src: audio.src,
                readyState: audio.readyState,
                paused: audio.paused,
                error: audio.error ? audio.error.message : 'none'
            });
        });
    }

    // 销毁音频管理器
    destroy() {
        this.stopAllSounds();
        
        // 移除所有事件监听器
        Object.values(this.audioElements).forEach(audio => {
            audio.removeEventListener('error', null);
            audio.removeEventListener('canplaythrough', null);
        });
        
        this.audioElements = {};
        console.log('音频管理器已销毁');
    }
}
