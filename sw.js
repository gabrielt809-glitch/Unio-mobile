/* Unio Base Organizada v9.4 — Service Worker */
const CACHE_NAME='unio-v9-4-cache-2026-05-06';
const CORE_ASSETS=[
  './',
  './index.html',
  './manifest.webmanifest',
  './css/styles.css',
  './js/data.js',
  './js/constants.js',
  './js/state.js',
  './js/state-runtime.js',
  './js/utils.js',
  './js/ui-components.js',
  './js/app-core.js',
  './js/navigation.js',
  './js/settings.js',
  './js/home.js',
  './js/water.js',
  './js/tasks.js',
  './js/sleep.js',
  './js/nutrition.js',
  './js/health.js',
  './js/breathing.js',
  './js/habits.js',
  './js/focus.js',
  './js/finance-core.js',
  './js/finance-calculations.js',
  './js/finance-validators.js',
  './js/finance-render.js',
  './js/finance-actions.js',
  './js/finance.js',
  './js/ux.js',
  './js/onboarding.js',
  './js/app-migrations.js',
  './js/storage.js',
  './js/app.js',
  './assets/icons/favicon-32.png',
  './assets/icons/apple-touch-icon.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(CORE_ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
    const copy=response.clone();
    caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));
    return response;
  }).catch(()=>caches.match('./index.html'))));
});
