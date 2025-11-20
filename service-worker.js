const CACHE_NAME = 'slot-game-pwa-v1';

// 需要缓存的所有文件路径
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
    // 假设这些是您的符号图片和背景音乐
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
    './symbols/11.png', // wild
    './symbols/12.png', // scatter
    './symbols/13.png', // bonus
    './music/background/bg.mp3', // 背景音乐
    './manifest.json'
    // 请根据实际使用的所有资源文件路径进行增删
];

// 1. 安装事件: 缓存所有文件
self.addEventListener('install', (evt) => {
    evt.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[ServiceWorker] Pre-caching offline resources');
            return cache.addAll(FILES_TO_CACHE);
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
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    // 立即接管控制权
    self.clients.claim();
});

// 3. 抓取 (Fetch) 事件: 缓存优先策略
self.addEventListener('fetch', (evt) => {
    // 排除跨域请求（例如 Google 字体、外部 API）
    if (evt.request.url.startsWith(self.location.origin)) {
        evt.respondWith(
            caches.match(evt.request).then((response) => {
                // 缓存命中则返回缓存，否则进行网络请求
                return response || fetch(evt.request);
            })
        );
    }
});
