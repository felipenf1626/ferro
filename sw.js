// Service worker do Ferro: guarda o app no aparelho para abrir sem internet.
// Ao publicar uma versão nova, aumente o número em CACHE.
var CACHE = 'ferro-v1';
var FILES = ['./', './index.html', './manifest.webmanifest',
  './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(FILES); }));
  self.skipWaiting();
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
// Abre do cache na hora e, se houver internet, atualiza o cache em segundo plano
// (a versão nova aparece na próxima abertura).
self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(function(c){
    return c.match(e.request, {ignoreSearch:true}).then(function(hit){
      var net = fetch(e.request).then(function(res){
        if(res && res.ok) c.put(e.request, res.clone());
        return res;
      }).catch(function(){ return hit || c.match('./index.html'); });
      return hit || net;
    });
  }));
});
