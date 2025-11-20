const CACHE_NAME = 'slot-game-pwa-v2'; // 版本号递增，确保更新

// 需要缓存的所有文件路径
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
    
    // PWA Manifest
    './manifest.json',
    
    // 您上传的图片文件
    './1565.jpg', 
    './1566.jpg', 
    
    // 游戏资源文件 (根据 config.js 推断的路径)
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
    './symbols/11.png', // Wild
    './symbols/12.png', // Scatter
    './symbols/13.png', // Bonus
    
    // 音频文件 (根据 index.html 推断的路径)
    './music/background/bg.mp3'
    
    // 请务必检查这些资源路径在您的服务器上是否准确！
];

// 1. 安装事件: 缓存所有文件
self.addEventListener('install', (evt) => {
    console.log('[ServiceWorker] 正在安装...');
    evt.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[ServiceWorker] 正在预缓存所需资源');
            return cache.addAll(FILES_TO_CACHE);
        }).catch(error => {
            console.error('[ServiceWorker] 预缓存失败 (可能因为某些路径404):', error);
            // 失败不应阻止安装，但在生产环境中应确保所有路径正确
            return Promise.resolve(); 
        })
    );
    self.skipWaiting(); 
});

// 2. 激活事件: 清理旧的缓存
self.addEventListener('activate', (evt) => {
    console.log('[ServiceWorker] 正在激活...');
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
