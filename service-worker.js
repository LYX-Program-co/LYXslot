// Service Worker 版本号，每次更新缓存时需要递增
const CACHE_NAME = 'slot-game-pwa-v1';

// 需要缓存的所有文件路径
// 这里的路径假设您的结构是：/index.html, /style.css, /js/..., /symbols/..., /music/...
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
    
    // 资源文件 (请根据您的实际文件路径调整)
    // 假设符号图片在 symbols 目录下
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
    
    // 假设背景音乐在 music/background 目录下
    './music/background/bg.mp3', 
    
    // PWA 图标 (请根据 manifest.json 中的配置添加)
    './icons/icon-192.png' 
];

// 1. 安装事件: 缓存所有文件
self.addEventListener('install', (evt) => {
    console.log('[ServiceWorker] 安装中...');
    evt.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[ServiceWorker] 正在预缓存所需资源');
            // 注意: cache.addAll 只要有一个文件失败，整个安装就会失败
            return cache.addAll(FILES_TO_CACHE);
        }).catch(error => {
            console.error('[ServiceWorker] 预缓存失败:', error);
            // 捕获错误但仍然返回 Promise 解决，防止 Service Worker 注册失败
            // 生产环境中应确保 FILES_TO_CACHE 路径完全正确
        })
    );
    // 强制新 SW 立即激活
    self.skipWaiting(); 
});

// 2. 激活事件: 清理旧的缓存
self.addEventListener('activate', (evt) => {
    console.log('[ServiceWorker] 激活中...');
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
    // 确保立即接管页面控制权
    self.clients.claim();
});

// 3. 抓取 (Fetch) 事件: 缓存优先策略
self.addEventListener('fetch', (evt) => {
    // 仅处理同源请求
    if (evt.request.url.startsWith(self.location.origin)) {
        evt.respondWith(
            caches.match(evt.request).then((response) => {
                // 缓存命中则返回缓存资源
                return response || fetch(evt.request);
            })
        );
    }
});
