// ==================== UI 管理器 ====================
class UIManager {
    constructor() {
        this.elements = this.cacheElements();
        this.ctx = this.elements.canvas.getContext('2d');
        this.resizeCanvas();
        this.initializeEventListeners();
    }

    // 缓存DOM元素
    cacheElements() {
        return {
            // 显示元素
            balance: document.getElementById('balance-display'),
            bet: document.getElementById('bet-display'),
            lines: document.getElementById('lines-display'),
            totalBet: document.getElementById('total-bet-display'),
            win: document.getElementById('win-display'),
            modified: document.getElementById('modified-display'),
            jackpot: document.getElementById('jackpot-amount'),
            freeSpinsDisplay: document.getElementById('free-spins-display'),
            freeSpinsCount: document.getElementById('free-spins-count'),
            autoplayDisplay: document.getElementById('autoplay-display'),
            autoplayCount: document.getElementById('autoplay-count'),
            winLossBody: document.getElementById('win-loss-body'),
            announcementContent: document.getElementById('announcement-content'),
            
            // 游戏元素
            reels: document.querySelectorAll('.reel'),
            canvas: document.getElementById('win-lines-canvas'),
            
            // 按钮元素
            btnSpin: document.getElementById('btn-spin'),
            btnAutoplay: document.getElementById('btn-autoplay'),
            btnStopAutoplay: document.getElementById('btn-stop-autoplay'),
            btnMaxBet: document.getElementById('btn-max-bet'),
            btnPaytable: document.getElementById('btn-paytable'),
            btnBetUp: document.getElementById('btn-bet-up'),
            btnBetDown: document.getElementById('btn-bet-down'),
            btnSwitchLines: document.getElementById('btn-switch-lines'),
            
            // 弹窗按钮
            btnStartFreeSpins: document.getElementById('btn-start-free-spins'),
            btnCancelAutoplay: document.getElementById('btn-cancel-autoplay'),
            btnClosePaytable: document.getElementById('btn-close-paytable'),
            btnCloseJackpot: document.getElementById('btn-close-jackpot')
        };
    }

    // 初始化事件监听器
    initializeEventListeners() {
        // 窗口大小变化
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // 自动旋转选项
        document.querySelectorAll('.autoplay-option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const count = parseInt(e.target.dataset.count);
                this.triggerEvent('autoplaySelected', count);
            });
        });
    }

    // 调整Canvas大小
    resizeCanvas() {
        const container = document.getElementById('reels-container');
        if (container && this.elements.canvas) {
            this.elements.canvas.width = container.offsetWidth;
            this.elements.canvas.height = container.offsetHeight;
        }
    }

    // 更新显示
    updateDisplay(state) {
        this.elements.balance.textContent = state.balance.toFixed(2);
        this.elements.bet.textContent = state.bet.toFixed(2);
        this.elements.lines.textContent = state.lines;
        this.elements.totalBet.textContent = state.getTotalBet().toFixed(2);
        this.elements.win.textContent = state.win.toFixed(2);
        this.elements.modified.textContent = state.modified.toFixed(2);
        this.elements.jackpot.textContent = state.jackpot.toFixed(2);

        // 免费旋转显示
        if (state.freeSpins > 0 || state.isFreeSpinsActive) {
            this.elements.freeSpinsDisplay.classList.remove('hidden');
            this.elements.freeSpinsCount.textContent = state.freeSpins;
        } else {
            this.elements.freeSpinsDisplay.classList.add('hidden');
        }

        // 自动旋转显示
        if (state.isAutoplay && state.autoplayCount > 0) {
            this.elements.autoplayDisplay.classList.remove('hidden');
            this.elements.autoplayCount.textContent = state.autoplayCount;
            this.elements.btnAutoplay.classList.add('hidden');
            this.elements.btnStopAutoplay.classList.remove('hidden');
        } else {
            this.elements.autoplayDisplay.classList.add('hidden');
            this.elements.btnAutoplay.classList.remove('hidden');
            this.elements.btnStopAutoplay.classList.add('hidden');
        }

        // 旋转按钮状态
        if (state.isSpinning) {
            this.elements.btnSpin.disabled = true;
            this.elements.btnSpin.textContent = '旋转中...';
        } else {
            this.elements.btnSpin.disabled = false;
            this.elements.btnSpin.textContent = state.isFreeSpinsActive ? '免费旋转' : '旋转';
        }

        // 按钮状态
        this.elements.btnBetUp.disabled = state.isSpinning;
        this.elements.btnBetDown.disabled = state.isSpinning;
        this.elements.btnMaxBet.disabled = state.isSpinning;
        this.elements.btnSwitchLines.disabled = state.isSpinning;
    }

    // 添加公告
    addAnnouncement(message, type = 'info') {
        const item = document.createElement('div');
        item.className = `announcement-item ${type}`;
        item.textContent = message;
        
        this.elements.announcementContent.insertBefore(
            item,
            this.elements.announcementContent.firstChild
        );

        // 限制公告数量
        while (this.elements.announcementContent.children.length > 5) {
            this.elements.announcementContent.removeChild(
                this.elements.announcementContent.lastChild
            );
        }

        // 自动移除
        setTimeout(() => {
            if (item.parentNode) {
                item.parentNode.removeChild(item);
            }
        }, 5000);
    }

    // 更新输赢历史
    updateWinHistory(history) {
        this.elements.winLossBody.innerHTML = '';
        history.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${record.round}</td>
                <td class="${record.result === '中奖' ? 'result-win' : 'result-lose'}">
                    ${record.result}
                </td>
                <td>${record.amount.toFixed(2)}</td>
                <td class="time-cell">${record.timestamp || ''}</td>
            `;
            this.elements.winLossBody.appendChild(row);
        });
    }

    // 绘制中奖线
    drawWinLines(winningLines) {
        this.ctx.clearRect(0, 0, this.elements.canvas.width, this.elements.canvas.height);
        
        if (!winningLines || winningLines.length === 0) return;
        
        const reelWidth = this.elements.canvas.width / GAME_CONFIG.reelCount;
        const symbolHeight = this.elements.canvas.height / GAME_CONFIG.visibleSymbols;

        winningLines.forEach((line, index) => {
            this.ctx.strokeStyle = line.color || '#FFD700';
            this.ctx.lineWidth = 5;
            this.ctx.shadowBlur = 12;
            this.ctx.shadowColor = this.ctx.strokeStyle;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';

            this.ctx.beginPath();
            line.positions.forEach((pos, reelIndex) => {
                const x = reelWidth * reelIndex + reelWidth / 2;
                const y = symbolHeight * pos + symbolHeight / 2;
                
                if (reelIndex === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            });
            this.ctx.stroke();
        });
    }

    // 清除中奖线
    clearWinLines() {
        this.ctx.clearRect(0, 0, this.elements.canvas.width, this.elements.canvas.height);
    }

    // 高亮符号
    highlightSymbols(positions) {
        // 清除之前的高亮
        document.querySelectorAll('.symbol.highlight').forEach(el => {
            el.classList.remove('highlight');
        });

        // 添加新的高亮
        positions.forEach(([reelIndex, symbolIndex]) => {
            const reel = this.elements.reels[reelIndex];
            const viewport = reel.querySelector('.reel-viewport');
            const symbols = viewport.querySelectorAll('.symbol');
            if (symbols[symbolIndex]) {
                symbols[symbolIndex].classList.add('highlight');
            }
        });
    }

    // 显示弹窗
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    // 隐藏弹窗
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    // 设置免费旋转数量
    setFreeSpinsCount(count) {
        const element = document.getElementById('free-spins-awarded');
        if (element) {
            element.textContent = count;
        }
    }

    // 设置Jackpot赢取金额
    setJackpotWinAmount(amount) {
        const element = document.getElementById('jackpot-win-amount');
        if (element) {
            element.textContent = amount.toFixed(2);
        }
    }

    // 设置Big Win金额
    setBigWinAmount(amount) {
        const element = document.getElementById('big-win-amount');
        if (element) {
            element.textContent = amount.toFixed(2);
        }
    }

    // 显示Big Win动画
    async showBigWin(amount) {
        this.setBigWinAmount(amount);
        this.showModal('big-win-overlay');
        
        await new Promise(resolve => setTimeout(resolve, 2500));
        this.hideModal('big-win-overlay');
    }

    // 更新赔付表
    updatePaytable(lines) {
        const paytableContent = document.getElementById('paytable-content');
        if (!paytableContent) return;
        
        paytableContent.innerHTML = '';
        const currentPaytable = lines === 25 ? PAYTABLE_25 : PAYTABLE_40;

        Object.entries(currentPaytable).forEach(([symbol, data]) => {
            const item = document.createElement('div');
            item.className = 'paytable-item';
            
            let payoutsHTML = '';
            if (data.special) {
                payoutsHTML = `<div class="paytable-special">${data.special}</div>`;
            } else {
                payoutsHTML = `
                    <div class="paytable-payouts">
                        <div>3连: <strong>${data[3]}x</strong></div>
                        <div>4连: <strong>${data[4]}x</strong></div>
                        <div>5连: <strong>${data[5]}x</strong></div>
                    </div>
                `;
            }

            item.innerHTML = `
                <div class="paytable-symbol">
                    <img src="${symbol}" alt="${data.name || '符号'}" class="paytable-symbol-img">
                </div>
                <div style="font-size: 12px; margin-bottom: 6px;">${data.name || '符号'}</div>
                ${payoutsHTML}
            `;
            paytableContent.appendChild(item);
        });
    }

    // 触发自定义事件
    triggerEvent(eventName, data) {
        const event = new CustomEvent(eventName, { detail: data });
        document.dispatchEvent(event);
    }

    // 绑定事件
    on(eventName, callback) {
        document.addEventListener(eventName, callback);
    }

    // 显示加载状态
    showLoading() {
        // 可以实现加载动画
    }

    // 隐藏加载状态
    hideLoading() {
        // 隐藏加载动画
    }

    // 显示错误信息
    showError(message) {
        this.addAnnouncement(`错误: ${message}`, 'error');
    }

    // 显示成功信息
    showSuccess(message) {
        this.addAnnouncement(message, 'success');
    }
}