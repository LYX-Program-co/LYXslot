const CACHE_NAME = 'slot-game-pwa-v3'; // 版本号递增，确保更新

// 需要缓存的所有文件路径 (包含所有代码、PWA文件和游戏资源)
const FILES_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    
    // JS 文件
    './js/config.js',
    './js/game-state.js',
    './js/rtp-manager.js',
    './js/audio-manager.js',
    './js/reel-manager.js',
    './js/ui-manager.js',
    './js/game.js',
    
    // PWA Manifest 和 Icon
    './manifest.json',
    './1565.jpg', 
    './1566.jpg', 
    
    // 游戏符号资源 (从 config.js 推断)
    './symbols/01.png',
    './symbols/02.png',
    './symbols/03.png',
    './symbols/04.png',
    './symbols/05.png',
    './symbols/06.png',
    './symbols/07.png',
    './symbols/08.png',
    './symbols/09.png',
    './symbols/10.png',
    './symbols/11.png', 
    './symbols/12.png', 
    './symbols/13.png', 
    
    // 音频文件 (从 index.html 推断)
    './music/background/bg.mp3'
];

// 1. 安装事件: 缓存所有文件
self.addEventListener('install', (evt) => {
    evt.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[ServiceWorker] 正在预缓存所需资源');
            return cache.addAll(FILES_TO_CACHE);
        }).catch(error => {
            console.error('[ServiceWorker] 预缓存失败:', error);
            return Promise.resolve(); 
        })
    );
    self.skipWaiting(); 
});

// 2. 激活事件: 清理旧的缓存
self.addEventListener('activate', (evt) => {
    evt.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    console.log('[ServiceWorker] 移除旧缓存:', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    self.clients.claim();
});

// 3. 抓取 (Fetch) 事件: 缓存优先策略
self.addEventListener('fetch', (evt) => {
    if (evt.request.url.startsWith(self.location.origin)) {
        evt.respondWith(
            caches.match(evt.request).then((response) => {
                return response || fetch(evt.request);
            })
        );
    }
});
