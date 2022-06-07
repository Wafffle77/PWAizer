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

async function generatePWA() {
    let style = window.getComputedStyle(document.body);

    //#region manifest generation
    let icons = Array.from(document.getElementsByTagName('link')).filter(x => x.rel.search('icon') != -1).map(x => x.href);

    if ((await fetch(window.location.origin + "/favicon.ico", { mode: 'no-cors' })).status == 0) {
        icons.push("/favicon.ico");
    }

    icons = icons.map(async function(link) {
        let img = new Image();
        img.src = link;
        await getPromiseFromEvent(img, "load");
        return ({
            sizes: img.naturalWidth + 'x' + img.naturalHeight,
            src: link
        });
    });

    let manifest = {
        background_color: style.backgroundColor,
        display: atob(window.pwaizerInject.display) || "standalone",
        icons: await Promise.all(icons),
        name: atob(window.pwaizerInject.name) || document.title,
        scope: window.location.origin,
        start_url: atob(window.pwaizerInject.start_url) || window.location.origin,
        id: window.location.origin + "/"
    }

    let manifestURL = "data:application/manifest+json," + encodeURIComponent(JSON.stringify(manifest));
    localStorage.setItem("pwaizerManifest", manifestURL);

    if (!document.querySelector("link[rel='manifest']")) {
        let manifestLink = document.createElement("link");
        manifestLink.setAttribute("rel", "manifest");
        manifestLink.setAttribute("href", manifestURL);
        document.head.appendChild(manifestLink);
    }
    //#endregion manifest generation
    //#region service worker
    if (navigator.serviceWorker.getRegistration() !== undefined) {
        await navigator.serviceWorker.register("/pwaizerServiceWorker.js", { scope: '/' });
    }
    //#endregion service worker
    //#region install prompt
    addEventListener('beforeinstallprompt', function(e) {
        e.prompt();
    });
    //#endregion install prompt
}

generatePWA();