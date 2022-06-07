console.log("Pwaizer Service Worker Loaded.");

const offlinePage = `
<html>
    <body>
        <style>
            #flex {
                display:flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }
            img {
                width: 15%;
                image-rendering: pixelated;
            }
        </style>
        <div id="flex">
            <img id="icon"></img>
            <div>Network Error.</div>
            <div id="location"></div>
        </div>
        <script>
        (async function() {
            let manifest = await (await fetch(localStorage.getItem("pwaizerManifest"))).json();
            let iconUrl = localStorage.getItem("pwaizerIcon");
            let icon = document.getElementById("icon");
            document.getElementById("location").innerText = "'" + manifest.name + "' could not be loaded.";
            if(iconUrl) {
                icon.src = iconUrl;
            } else if(!manifest.icons.every(x => !x.src.match(/data:/))) {
                icon.src = manifest.icons.filter(x => x.src.match(/data:/))[0].src;
            } else {
                icon.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABhWlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AYht+makUqgnYQEcxQnSyIijhKFYtgobQVWnUwufQPmjQkKS6OgmvBwZ/FqoOLs64OroIg+APi6OSk6CIlfpcUWsR4x3EP733vy913gFAvM9XsmABUzTKSsaiYya6KgVd00ezHDEYkZurx1GIanuPrHj6+30V4lnfdn6NXyZkM8InEc0w3LOIN4plNS+e8TxxiRUkhPiceN+iCxI9cl11+41xwWOCZISOdnCcOEYuFNpbbmBUNlXiaOKyoGuULGZcVzluc1XKVNe/JXxjMaSsprtMaRgxLiCMBETKqKKEMCxHaNVJMJOk86uEfcvwJcsnkKoGRYwEVqJAcP/gf/O6tmZ+adJOCUaDzxbY/RoHALtCo2fb3sW03TgD/M3CltfyVOjD7SXqtpYWPgL5t4OK6pcl7wOUOMPikS4bkSH5aQj4PvJ/RN2WBgVugZ83tW/Mcpw9Amnq1fAMcHAJjBcpe93h3d3vf/q1p9u8Hrm1yv6Ktd9AAAAAGYktHRAAAACMA/+5KrEsAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAHdElNRQfmBgYSOB8j1z5TAAAAGXRFWHRDb21tZW50AENyZWF0ZWQgd2l0aCBHSU1QV4EOFwAAAT9JREFUWMO9l10OhCAMhKfITdz7n2i5yW66D2rWINApoE18UcM3/YMiIEwBhdMEEPK/uWCvIHkC3hIhHjgb1pb4fI0wCl8Umj9RAVmVEhct+AW8qgLA8raDcYjQVP830vAdPMMU0GPtaOYqAzOelyJRi0K4q+LZQg13e2/VQGDh3Z6mtuh4W4iTUGkId8A/jkyVBQyEvwWXVS8bVHjC86jbw0dgEjwHl7rIJeD7Uhfc2qJdh9FZxFmIFz6tDVv59lgonXhWD9e+W/BSCqcVYexs3FA790teapLi+9rwwRQwVQOtlDDwiyUR7MUe84Po3AVWLbDwmvfdXeDx+gLfvCeOYwe8d06wB5LZtnt/TnNzJiztikddyKo+z7PQU1czdl40NyD5c/L1hm86ntRVRv++adYrqHbvGCq20XFeAPkB6YiYlb+cDKsAAAAASUVORK5CYII=";
            }
        })();
        </script>
    </body>
</html>
`;

let caching = new URL(location).searchParams.get('caching') === 'true';

fetch("/pwaizerServiceWorker.js", { mode: 'no-cors' }).then(res => {
    if (!res.ok) {
        console.log("Unable to reach service worker. Unregistering.");
        this.registration.unregister();
    }
});

self.addEventListener('fetch', function(e) {
    if(caching) {
        e.respondWith((async function() {
            let cache = await caches.open("pwaizer");
            try {
                let res = await fetch(e.request);
                cache.put(e.request.url,res.clone());
                return(res);
            } catch {
                return(cache.match(e.request.url));
            }
        })());
        
    } else {
        e.respondWith(fetch(e.request).catch(() => new Response(
            offlinePage, {
                headers: { "content-type": "text/html" }
            })));
    }
});