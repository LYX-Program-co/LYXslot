// ==================== Reel Manager ====================
// 负责卷轴的创建、旋转动画、停止控制，以及与 RTP/游戏状态的衔接

class ReelManager {
    constructor(config, gameState, rtpManager) {
        this.config = config;
        this.gameState = gameState;
        this.rtpManager = rtpManager;

        this.reels = [];
        this.isSpinning = false;
        this.spinStartTime = 0;

        this.reelStopOrder = [];
        this.currentStopIndex = 0;

        this.winLinesCanvas = null;
        this.winLinesCtx = null;

        this.currentResult = null;
        this.currentWinLines = [];

        this.animationFrameId = null;
        this.lastFrameTime = 0;

        this.reelSpinConfig = {
            acceleration: 1.2,
            maxSpeed: 35,
            deceleration: 0.95
        };

        this.queuedResult = null;
        this.spinResolve = null;
        this.spinReject = null;

        this.mobileOptimization = true;
        this.pixelRatio = window.devicePixelRatio || 1;

        this.symbolPreloadDone = false;
        this.symbolImageCache = new Map();

        this.initDOM();
    }

    initDOM() {
        const reelsContainer = document.getElementById('reels-container');
        if (!reelsContainer) {
            console.error('[ReelManager] 未找到 #reels-container');
            return;
        }

        this.winLinesCanvas = document.getElementById('win-lines-canvas');
        if (!this.winLinesCanvas) {
            this.winLinesCanvas = document.createElement('canvas');
            this.winLinesCanvas.id = 'win-lines-canvas';
            reelsContainer.prepend(this.winLinesCanvas);
        }
        this.winLinesCtx = this.winLinesCanvas.getContext('2d');

        const reelElements = reelsContainer.querySelectorAll('.reel');
        this.reels = [];

        reelElements.forEach((reelEl, index) => {
            const viewport = reelEl.querySelector('.reel-viewport');
            const strip = reelEl.querySelector('.reel-strip');

            if (!viewport || !strip) {
                console.error(`[ReelManager] 第 ${index} 个卷轴缺少 viewport/strip`);
                return;
            }

            const reelObj = {
                index,
                root: reelEl,
                viewport,
                strip,
                position: 0,
                speed: 0,
                isStopping: false,
                stopTargetIndex: null,
                visibleSymbols: this.config.visibleSymbols || 3,
                symbolHeight: 0,
                totalSymbols: this.config.symbolsPerReel || 30,
                currentSymbols: []
            };

            this.reels.push(reelObj);
        });

        window.addEventListener('resize', () => this.handleResize());
        this.handleResize();

        this.preloadSymbols();
        this.initialFillStrips();
    }

    handleResize() {
        if (!this.winLinesCanvas || !this.winLinesCtx) return;

        const reelsContainer = document.getElementById('reels-container');
        if (!reelsContainer) return;

        const rect = reelsContainer.getBoundingClientRect();
        const ratio = this.pixelRatio;

        this.winLinesCanvas.width = rect.width * ratio;
        this.winLinesCanvas.height = rect.height * ratio;

        this.winLinesCanvas.style.width = `${rect.width}px`;
        this.winLinesCanvas.style.height = `${rect.height}px`;

        this.winLinesCtx.setTransform(ratio, 0, 0, ratio, 0, 0);

        this.reels.forEach(reel => {
            const viewportRect = reel.viewport.getBoundingClientRect();
            reel.symbolHeight = viewportRect.height / reel.visibleSymbols;
        });

        this.redrawWinLines();
    }

    preloadSymbols() {
        if (this.symbolPreloadDone) return;

        const uniqueSymbols = new Set(this.config.symbols);
        uniqueSymbols.forEach(symbolPath => {
            const img = new Image();
            img.src = "/" + symbolPath;
            this.symbolImageCache.set(symbolPath, img);
        });

        this.symbolPreloadDone = true;
    }

    initialFillStrips() {
        this.reels.forEach(reel => {
            reel.strip.innerHTML = '';
            reel.currentSymbols = [];

            const total = reel.totalSymbols;
            for (let i = 0; i < total; i++) {
                const symbolIndex = Math.floor(Math.random() * this.config.symbols.length);
                const symbol = this.config.symbols[symbolIndex];
                reel.currentSymbols.push(symbol);
                this.appendSymbol(reel, symbol);
            }

            reel.position = 0;
            reel.strip.style.transform = 'translateY(0px)';
        });
    }

    appendSymbol(reel, symbol) {
        const symbolEl = document.createElement('div');
        symbolEl.className = 'symbol';

        const img = document.createElement('img');
        img.src = "/" + symbol;  // ★★★ 已修复：指向根目录 /symbols/xx.png
        img.alt = '符号';
        img.className = 'symbol-img';

        symbolEl.appendChild(img);
        symbolEl.setAttribute('data-symbol', symbol);
        reel.strip.appendChild(symbolEl);
    }

    prepareSpin(resultMatrix, winLines) {
        this.currentResult = resultMatrix;
        this.currentWinLines = winLines || [];

        this.reelStopOrder = [];
        for (let i = 0; i < this.reels.length; i++) {
            this.reelStopOrder.push(i);
        }

        this.currentStopIndex = 0;
        this.queuedResult = resultMatrix;
    }

    spin() {
        if (this.isSpinning) {
            console.warn('[ReelManager] 正在旋转，忽略新的 spin 请求');
            return Promise.reject(new Error('SPIN_IN_PROGRESS'));
        }
        if (!this.reels.length) {
            console.error('[ReelManager] 尚未初始化 reels');
            return Promise.reject(new Error('NO_REELS'));
        }

        this.clearWinLinesCanvas();

        this.reels.forEach(reel => {
            reel.isStopping = false;
            reel.stopTargetIndex = null;
            reel.speed = 0;
        });

        this.isSpinning = true;
        this.spinStartTime = performance.now();
        this.lastFrameTime = this.spinStartTime;

        if (!this.animationFrameId) {
            this.animationFrameId = requestAnimationFrame(ts => this.spinLoop(ts));
        }

        return new Promise((resolve, reject) => {
            this.spinResolve = resolve;
            this.spinReject = reject;
        });
    }

    spinLoop(timestamp) {
        if (!this.isSpinning) {
            this.animationFrameId = null;
            return;
        }

        const deltaTime = Math.min(50, timestamp - this.lastFrameTime);
        this.lastFrameTime = timestamp;

        const elapsed = timestamp - this.spinStartTime;

        this.reels.forEach((reel, index) => {
            if (reel.speed < this.reelSpinConfig.maxSpeed) {
                reel.speed += this.reelSpinConfig.acceleration;
                if (reel.speed > this.reelSpinConfig.maxSpeed) {
                    reel.speed = this.reelSpinConfig.maxSpeed;
                }
            }

            reel.position += reel.speed;

            const reelHeight = reel.symbolHeight * reel.totalSymbols;
            if (reel.position >= reelHeight) {
                reel.position -= reelHeight;
            }

            reel.strip.style.transform = `translateY(${-reel.position}px)`;

            const delayBeforeStop = (index * this.config.reelStopDelay) || 200;

            if (!reel.isStopping && elapsed > delayBeforeStop) {
                reel.isStopping = true;

                let visibleSymbols;
                if (this.currentResult && this.currentResult[index]) {
                    visibleSymbols = this.currentResult[index];
                } else {
                    visibleSymbols = [];
                    for (let i = 0; i < reel.visibleSymbols; i++) {
                        const randomSymbol = this.config.symbols[Math.floor(Math.random() * this.config.symbols.length)];
                        visibleSymbols.push(randomSymbol);
                    }
                }

                this.setReelStopTarget(reel, visibleSymbols);
            }

            if (reel.isStopping && reel.stopTargetIndex !== null) {
                const targetOffset = reel.stopTargetIndex * reel.symbolHeight;
                const currentOffset = reel.position;
                let diff = currentOffset - targetOffset;

                const reelHeight = reel.symbolHeight * reel.totalSymbols;
                if (diff < -reelHeight / 2) diff += reelHeight;
                if (diff > reelHeight / 2) diff -= reelHeight;

                const decel = this.reelSpinConfig.deceleration;
                reel.speed *= decel;

                if (Math.abs(diff) < 3 && reel.speed < 3) {
                    reel.position = targetOffset;
                    reel.strip.style.transform = `translateY(${-reel.position}px)`;
                    reel.speed = 0;
                    reel.isStopping = false;
                }
            }
        });

        const allStopped = this.reels.every(r => !r.isStopping && r.speed === 0);
        if (allStopped && this.isSpinning) {
            this.isSpinning = false;
            this.animationFrameId = null;

            this.onSpinComplete();
            return;
        }

        this.animationFrameId = requestAnimationFrame(ts => this.spinLoop(ts));
    }

    setReelStopTarget(reel, visibleSymbols) {
        const total = reel.totalSymbols;
        if (!reel.currentSymbols || reel.currentSymbols.length !== total) {
            reel.currentSymbols = [];
            reel.strip.innerHTML = '';
            for (let i = 0; i < total; i++) {
                const randomSymbol = this.config.symbols[Math.floor(Math.random() * this.config.symbols.length)];
                reel.currentSymbols.push(randomSymbol);
                this.appendSymbol(reel, randomSymbol);
            }
        }

        const targetIndex = Math.floor(reel.position / reel.symbolHeight);
        const newSymbols = [...reel.currentSymbols];

        for (let i = 0; i < visibleSymbols.length; i++) {
            const symbolIndex = (targetIndex + i) % total;
            newSymbols[symbolIndex] = visibleSymbols[i];

            const symbolEl = reel.strip.children[symbolIndex];
            if (symbolEl) {
                const img = symbolEl.querySelector('.symbol-img');
                if (img) {
                    img.src = "/" + visibleSymbols[i];
                    symbolEl.setAttribute('data-symbol', visibleSymbols[i]);
                }
            }
        }

        reel.currentSymbols = newSymbols;
        reel.stopTargetIndex = targetIndex;
    }

    onSpinComplete() {
        if (this.currentWinLines && this.currentWinLines.length > 0) {
            this.drawWinLines(this.currentWinLines);
        }

        if (this.spinResolve) {
            this.spinResolve({
                resultMatrix: this.currentResult,
                winLines: this.currentWinLines
            });
        }

        this.currentResult = null;
        this.currentWinLines = [];
        this.spinResolve = null;
        this.spinReject = null;
    }

    drawWinLines(winLines) {
        if (!this.winLinesCanvas || !this.winLinesCtx) return;

        const ctx = this.winLinesCtx;
        this.clearWinLinesCanvas();

        const reelsContainer = document.getElementById('reels-container');
        if (!reelsContainer) return;

        const rect = reelsContainer.getBoundingClientRect();
        const reelWidth = rect.width / this.reels.length;
        const rowHeight = rect.height / (this.config.visibleSymbols || 3);

        winLines.forEach((line, index) => {
            if (!line || !line.positions || !line.positions.length) return;

            const path = line.positions;

            ctx.save();
            ctx.lineWidth = 3;
            ctx.strokeStyle = this.getLineColor(index);
            ctx.beginPath();

            path.forEach((pos, i) => {
                const x = (pos.reel + 0.5) * reelWidth;
                const y = (pos.row + 0.5) * rowHeight;

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });

            ctx.stroke();
            ctx.restore();
        });
    }

    getLineColor(index) {
        const colors = [
            '#FFD700',
            '#00FFFF',
            '#FF1493',
            '#00FF00',
            '#FF4500',
            '#1E90FF',
            '#ADFF2F',
            '#FF69B4',
            '#00CED1',
            '#FFA500'
        ];
        return colors[index % colors.length];
    }

    clearWinLinesCanvas() {
        if (!this.winLinesCanvas || !this.winLinesCtx) return;
        this.winLinesCtx.clearRect(
            0,
            0,
            this.winLinesCanvas.width,
            this.winLinesCanvas.height
        );
    }

    redrawWinLines() {
        if (this.currentWinLines && this.currentWinLines.length > 0) {
            this.drawWinLines(this.currentWinLines);
        }
    }

    forceStopAll() {
        if (!this.isSpinning) return;

        this.reels.forEach(reel => {
            reel.isStopping = false;
            reel.speed = 0;
            reel.stopTargetIndex = null;
        });

        this.isSpinning = false;

        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        this.clearWinLinesCanvas();

        if (this.spinReject) {
            this.spinReject(new Error('SPIN_FORCE_STOP'));
        }

        this.spinResolve = null;
        this.spinReject = null;
        this.currentResult = null;
        this.currentWinLines = [];
    }
}

// 导出为全局（如果需要）
window.ReelManager = ReelManager;
