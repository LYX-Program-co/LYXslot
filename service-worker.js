const CACHE_NAME = 'slot-game-pwa-v1';

// 需要缓存的所有文件路径 (基于您上传的文件列表)
const FILES_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './js/config.js',
    './js/game-state.js',
    './js/rtp-manager.js',
    './js/audio-manager.js',
    './js/reel-manager.js',
    './js/ui-manager.js',
    './js/game.js',
    './manifest.json',
    
    // 您上传的图片文件 (作为 PWA 图标和缓存资源)
    './1565.jpg' 
];

// 1. 安装事件: 缓存所有文件
self.addEventListener('install', (evt) => {
    evt.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[ServiceWorker] 正在预缓存所需资源');
            return cache.addAll(FILES_TO_CACHE);
        }).catch(error => {
            console.error('[ServiceWorker] 预缓存失败:', error);
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
