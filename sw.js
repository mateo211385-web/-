const C='az-v4';
const FONT_CSS='https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css';
self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(C).then(async cache=>{
    try{
      const r=await fetch(FONT_CSS);
      if(r.ok){
        await cache.put(FONT_CSS,r.clone());
        const text=await r.text();
        const urls=[...text.matchAll(/url\(([^)]+)\)/g)].map(m=>m[1].replace(/['"]/g,''));
        await Promise.allSettled(urls.map(async u=>{
          try{const fr=await fetch(u);if(fr.ok)await cache.put(u,fr);}catch(ex){}
        }));
      }
    }catch(ex){}
  }));
});
self.addEventListener('activate',e=>e.waitUntil(
  caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==C).map(k=>caches.delete(k))))
  .then(()=>self.clients.claim())
));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(
    caches.match(e.request).then(cached=>{
      if(cached)return cached;
      return fetch(e.request).then(res=>{
        if(res&&res.ok){const clone=res.clone();caches.open(C).then(c=>c.put(e.request,clone));}
        return res;
      }).catch(()=>cached||new Response('آفلاین',{status:503}));
    })
  );
});
