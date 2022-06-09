console.log("Pwaizer: generatePWA.js is running.");

//https://stackoverflow.com/a/30407959
function blobToDataURL(blob, callback) {
    var a = new FileReader();
    a.onload = function(e) {callback(e.target.result);}
    a.readAsDataURL(blob);
}

(async function() {
    let style = window.getComputedStyle(document.body);

    //#region manifest generation
    let manifest = {
        background_color: style.backgroundColor,
        display: window.pwaizerInject.display || "standalone",
        icons: window.pwaizerInject.icons,
        name: window.pwaizerInject.name || document.title,
        scope: window.location.origin,
        start_url: window.pwaizerInject.start_url || window.location.origin,
        id: window.location.origin + "/"
    }

    let manifestURL = "data:application/manifest+json," + encodeURIComponent(JSON.stringify(manifest));
    
    localStorage.setItem("pwaizerManifest", manifestURL);
    let smallestIcon = icons.reduce((p,c,i,a) => {
        let pSize = parseInt(p.sizes.split("x")[0]);
        let cSize = parseInt(c.sizes.split("x")[0]);
        if(pSize > cSize) {
            return(c);
        } else {
            return(p);
        }
    });
    if(manifest.icons.every(x => !x.src.match(/data:/))) {
        blobToDataURL((await (await fetch(smallestIcon.src)).blob()),x => localStorage.setItem("pwaizerIcon", x));
    }

    if (!document.querySelector("link[rel='manifest']")) {
        let manifestLink = document.createElement("link");
        manifestLink.setAttribute("rel", "manifest");
        manifestLink.setAttribute("href", manifestURL);
        document.head.appendChild(manifestLink);
    } else if(document.querySelector("link[rel='manifest']").href.match(/data:application\/manifest\+json,.+/)) {
        document.querySelector("link[rel='manifest']").setAttribute("href", manifestURL);
    }
    //#endregion manifest generation
    //#region service worker
    let workers = await navigator.serviceWorker.getRegistrations();
    if (!workers || workers.length == 0) {
        await navigator.serviceWorker.register(`/pwaizerServiceWorker.js?caching=${window.pwaizerInject.caching}`, { scope: '/' });
    } else if(workers.filter(x => x.active.scriptURL.match(/.*\/pwaizerServiceWorker\.js.*/))) {
        workers.filter(x => x.active.scriptURL.match(/.*\/pwaizerServiceWorker\.js.*/)).forEach(x => x.unregister());
        await navigator.serviceWorker.register(`/pwaizerServiceWorker.js?caching=${window.pwaizerInject.caching}`, { scope: '/' });
    }
    //#endregion service worker
    //#region install prompt
    let installListener = e => {
        e.prompt();
        removeEventListener('beforeinstallprompt', installListener);
    };
    addEventListener('beforeinstallprompt', installListener);
    //#endregion install prompt
})();