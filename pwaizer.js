console.log("Pwaizer script started.");

//https://stackoverflow.com/a/70789108
function getPromiseFromEvent(item, event) {
    return new Promise((resolve) => {
        const listener = () => {
            item.removeEventListener(event, listener);
            resolve();
        }
        item.addEventListener(event, listener);
    })
}

//https://stackoverflow.com/a/30407959
function blobToDataURL(blob, callback) {
    var a = new FileReader();
    a.onload = function(e) {callback(e.target.result);}
    a.readAsDataURL(blob);
}

async function generatePWA() {
    let style = window.getComputedStyle(document.body);

    //#region manifest generation
    let icons = Array.from(document.getElementsByTagName('link')).filter(x => x.rel.search('icon') != -1).map(x => x.href);

    if ((await fetch(window.location.origin + "/favicon.ico", { mode: 'no-cors' })).status == 0) {
        icons.push("/favicon.ico");
    }

    if(icons.length == 0) {
        icons.push("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABhWlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AYht+makUrHewg4pChOlkQFXGUKhbBQmkrtOpgcukfNGlIUlwcBdeCgz+LVQcXZ10dXAVB8AfE0clJ0UVK/C4ptIjxjuMe3vvel7vvAKFRYarZNQGommWk4jExm1sVA6/ooTmIEPolZuqJ9GIGnuPrHj6+30V5lnfdn2NAyZsM8InEc0w3LOIN4plNS+e8TxxmJUkhPiceN+iCxI9cl11+41x0WOCZYSOTmicOE4vFDpY7mJUMlXiaOKKoGuULWZcVzluc1UqNte7JXxjMaytprtMaQRxLSCAJETJqKKMCC1HaNVJMpOg85uEfdvxJcsnkKoORYwFVqJAcP/gf/O6tWZiadJOCMaD7xbY/RoHALtCs2/b3sW03TwD/M3Cltf3VBjD7SXq9rUWOgNA2cHHd1uQ94HIHGHrSJUNyJD8toVAA3s/om3LA4C3Qt+b2rXWO0wcgQ71avgEODoGxImWve7y7t7Nv/9a0+vcDHdFyhdirZqgAAAAGYktHRAAAACMA/+5KrEsAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAHdElNRQfmBgYTEBGY8NfJAAAAGXRFWHRDb21tZW50AENyZWF0ZWQgd2l0aCBHSU1QV4EOFwAAAM9JREFUWMPlllEOxCAIRBnSq3IqD8v+uMnW1BYRZTdrYvpFmXkgSvTvC/WrjpiQxY4YzRYQug4jYt3ZAzCif+wFETnFlFLwEyXQqp4a9UM/bt2nN+EV/iEBLZHZ2t8JABGhE4SPvX4OtCJaZyKi7719EPWSjuD/imPInu6Ncu8iMFNv99XqSWpxv6wH6tRUyyXGkW487weedIqO+/g5YKFwk1y3vO8ecGO1APWcupWT0PS040XuYSWMjfgv8yIh+Sl3+m0YTQCDpMDZZo9sii9/A04NFgfvYgAAAABJRU5ErkJggg==")
    }

    icons = await Promise.all(icons.map(async function(link) {
        let img = new Image();
        img.src = link;
        await getPromiseFromEvent(img, "load");
        return ({
            sizes: img.naturalWidth + 'x' + img.naturalHeight,
            src: link
        });
    }));

    if(!icons.map(x => x.sizes).includes('192x192')) {
        let largestIcon = icons.reduce((p,c,i,a) => {
            let pSize = parseInt(p.sizes.split("x")[0]);
            let cSize = parseInt(c.sizes.split("x")[0]);
            if(pSize < cSize) {
                return(c);
            } else {
                return(p);
            }
        });
        let img = new Image();
        img.src = largestIcon.src;

        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        canvas.width  = 192;
        canvas.height = 192;
        ctx.drawImage(img, 0, 0, 192, 192);

        icons.push({
            src: canvas.toDataURL('image/png'),
            sizes: "192x192"
        });
    }

    let manifest = {
        background_color: style.backgroundColor,
        display: window.pwaizerInject.display || "standalone",
        icons: icons,
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
    if (navigator.serviceWorker.getRegistration() !== undefined) {
        await navigator.serviceWorker.register(`/pwaizerServiceWorker.js?caching=${window.pwaizerInject.caching}`, { scope: '/' });
    }
    //#endregion service worker
    //#region install prompt
    addEventListener('beforeinstallprompt', function(e) {
        e.prompt();
    });
    //#endregion install prompt
}

generatePWA();