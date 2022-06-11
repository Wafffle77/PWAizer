console.log("Pwaizer: popup.js is running.");

let nameInput = document.getElementById("nameInput");
let dispInput = document.getElementById("dispInput");
let startUrlInput = document.getElementById("startUrlInput");
let cachingInput = document.getElementById("cachingInput");
let createButton = document.getElementById("createButton");
let iconsDiv = document.getElementById("iconsDiv");

let browser = window.browser || window.chrome;

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

async function processIcons(urlList) {
    if (urlList.length == 0) {
        urlList.push("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABhWlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AYht+makUrHewg4pChOlkQFXGUKhbBQmkrtOpgcukfNGlIUlwcBdeCgz+LVQcXZ10dXAVB8AfE0clJ0UVK/C4ptIjxjuMe3vvel7vvAKFRYarZNQGommWk4jExm1sVA6/ooTmIEPolZuqJ9GIGnuPrHj6+30V5lnfdn2NAyZsM8InEc0w3LOIN4plNS+e8TxxmJUkhPiceN+iCxI9cl11+41x0WOCZYSOTmicOE4vFDpY7mJUMlXiaOKKoGuULWZcVzluc1UqNte7JXxjMaytprtMaQRxLSCAJETJqKKMCC1HaNVJMpOg85uEfdvxJcsnkKoORYwFVqJAcP/gf/O6tWZiadJOCMaD7xbY/RoHALtCs2/b3sW03TwD/M3Cltf3VBjD7SXq9rUWOgNA2cHHd1uQ94HIHGHrSJUNyJD8toVAA3s/om3LA4C3Qt+b2rXWO0wcgQ71avgEODoGxImWve7y7t7Nv/9a0+vcDHdFyhdirZqgAAAAGYktHRAAAACMA/+5KrEsAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAHdElNRQfmBgYTEBGY8NfJAAAAGXRFWHRDb21tZW50AENyZWF0ZWQgd2l0aCBHSU1QV4EOFwAAAM9JREFUWMPlllEOxCAIRBnSq3IqD8v+uMnW1BYRZTdrYvpFmXkgSvTvC/WrjpiQxY4YzRYQug4jYt3ZAzCif+wFETnFlFLwEyXQqp4a9UM/bt2nN+EV/iEBLZHZ2t8JABGhE4SPvX4OtCJaZyKi7719EPWSjuD/imPInu6Ncu8iMFNv99XqSWpxv6wH6tRUyyXGkW487weedIqO+/g5YKFwk1y3vO8ecGO1APWcupWT0PS040XuYSWMjfgv8yIh+Sl3+m0YTQCDpMDZZo9sii9/A04NFgfvYgAAAABJRU5ErkJggg==")
    }

    let icons = await Promise.all(urlList.map(async function(link) {
        let img = new Image();
        img.src = link;
        await getPromiseFromEvent(img, "load");
        return ({
            sizes: img.naturalWidth + 'x' + img.naturalHeight,
            src: link
        });
    }));
    return (icons);
}

function tabPromise(q) {
    return (new Promise(resolve => {
        browser.tabs.query(q, tabs => {
            resolve(tabs);
        });
    }));
}

window.addEventListener("load", async function() {
    let tabs = await tabPromise({ currentWindow: true, active: true });
    //TODO: replace with chrome.scripting.executeScript when manifest V3 is ready
    browser.tabs.executeScript(tabs[0].id, { file: "/getIcons.js" }, async function(urlList) {
        if (tabs[0].favIconUrl) { urlList[0].push(tabs[0].favIconUrl); }
        let icons = await processIcons(urlList[0]);
        console.log(icons);

        icons.forEach(i => {
            let img = new Image();
            img.src = i.src;
            img.addEventListener("click", function(e) {
                e.target.classList.toggle('deselected');
                if (iconsDiv.querySelectorAll('img.deselected').length == iconsDiv.childElementCount) {
                    alert("There must be at least one icon.");
                    e.target.classList.toggle('deselected');
                }
            });
            iconsDiv.appendChild(img);
        });
        globalThis.icons = icons;
    });

    nameInput.value = tabs[0].title || '';
    dispInput.value = 'standalone';
    startUrlInput.value = new URL(tabs[0].url).origin;
    cachingInput.checked = false;
});

createButton.addEventListener('click', async function(e) {
    let tabs = await tabPromise({ currentWindow: true, active: true });
    let icons = globalThis.icons.filter(x => iconsDiv.querySelector(`img[src="${x.src}"]`).className.includes("deselected") <= 0);

    if (!icons.map(x => x.sizes).includes('192x192')) {
        let largestIcon = icons.reduce((p, c, i, a) => {
            let pSize = parseInt(p.sizes.split("x")[0]) * parseInt(p.sizes.split("x")[1]);
            let cSize = parseInt(c.sizes.split("x")[0]) * parseInt(c.sizes.split("x")[1]);
            if (pSize < cSize) {
                return (c);
            } else {
                return (p);
            }
        });

        let img = new Image();
        img.src = largestIcon.src;
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        ctx.imageSmoothingQuality = 'low';
        canvas.width = 192;
        canvas.height = 192;

        ctx.drawImage(
            img,
            Math.abs(img.naturalWidth - img.naturalHeight) / 2,
            0,
            Math.min(img.naturalHeight, img.naturalWidth),
            Math.min(img.naturalHeight, img.naturalWidth),
            0,
            0,
            192,
            192);
        icons.push({
            sizes: "192x192",
            src: canvas.toDataURL('image/png')
        });
    }

    let pwaizerInject = {
        icons: icons,
        name: nameInput.value,
        display: dispInput.value,
        start_url: startUrlInput.value,
        caching: cachingInput.checked
    };
    browser.tabs.executeScript(tabs[0].id, { code: `window.pwaizerInject = ${JSON.stringify(pwaizerInject)};` });
    browser.tabs.executeScript(tabs[0].id, { file: "/generatePWA.js" });
});