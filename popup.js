console.log("Pwaizer: popup.js is running.");

let nameInput = document.getElementById("nameInput");
let dispInput = document.getElementById("dispInput");
let startUrlInput = document.getElementById("startUrlInput");
let cachingInput = document.getElementById("cachingInput");
let createButton = document.getElementById("createButton");
let iconsDiv = document.getElementById("iconsDiv");
let addIconInput = document.getElementById("addIconInput");
let serviceWorkerError = document.getElementById("serviceWorkerError");

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

function addIcon(i) {
    let img = new Image();
    let con = document.createElement('div');
    let sizeDiv = document.createElement('div');
    sizeDiv.classList = "sizeIndicator";
    con.appendChild(sizeDiv);
    img.onload = function(event) {
        sizeDiv.textContent = img.naturalWidth + 'x' + img.naturalHeight;
    }
    con.appendChild(img);
    img.src = i.src;
    img.addEventListener("click", function(e) {
        if (iconsDiv.querySelectorAll('img.deselected').length + 1 == iconsDiv.childElementCount - 1 && !e.target.className.includes("deselected")) {
            alert("There must be at least one icon.");
        } else {
            e.target.classList.toggle('deselected');
        }
    });
    iconsDiv.insertBefore(con,addIconInput.parentNode);
    return(img);
}

async function processIconUrlList(urlList) {
    let tabs = await tabPromise({ currentWindow: true, active: true });
    urlList = urlList[0].result || urlList[0];
    if (tabs[0].favIconUrl) { urlList.push(tabs[0].favIconUrl); }
    let icons = await processIcons(urlList);

    icons.forEach(addIcon);
    globalThis.icons = icons;
}

window.addEventListener("load", async function() {
    let tabs = await tabPromise({ currentWindow: true, active: true });
    let testUrl = new URL(tabs[0].url)
    testUrl.pathname = "/pwaizerServiceWorker.js";
    try {
        let serviceWorkerResponse = await fetch(testUrl);
        if(serviceWorkerResponse.status != 200) {
            serviceWorkerError.style.display = "block";
            createButton.disabled = true;
        }
    } catch {
        serviceWorkerError.style.display = "block";
        createButton.disabled = true;
    }
    if(chrome.scripting) {chrome.scripting.executeScript({target: {tabId: tabs[0].id},  files: ["/getIcons.js"] }, processIconUrlList);}
    else {browser.tabs.executeScript(tabs[0].id, { file: "/getIcons.js" }, processIconUrlList);}

    nameInput.value = tabs[0].title || '';
    dispInput.value = 'standalone';
    startUrlInput.value = new URL(tabs[0].url).origin;
    cachingInput.checked = false;
});

createButton.addEventListener('click', async function(e) {
    let tabs = await tabPromise({ currentWindow: true, active: true });
    let icons = Array.from(iconsDiv.querySelectorAll('img:not(.deselected)')).map(img => ({sizes: img.naturalWidth + 'x' + img.naturalHeight, src: img.src}))

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

    if(chrome.scripting) {
        chrome.scripting.executeScript({
            target: {tabId: tabs[0].id}, 
            func: x => {window.pwaizerInject = JSON.parse(x);},
            args: [JSON.stringify(pwaizerInject)]
        });
        chrome.scripting.executeScript({
            target: {tabId: tabs[0].id}, 
            files: ["/generatePWA.js"]
        });
    } else {
        browser.tabs.executeScript(tabs[0].id, { code: `window.pwaizerInject = ${JSON.stringify(pwaizerInject)};` });
        browser.tabs.executeScript(tabs[0].id, { file: "/generatePWA.js" });
    }
});

let inputFileReader = new FileReader();
addIconInput.addEventListener("input", function(event) {
    inputFileReader.readAsDataURL(addIconInput.files[0]);
})
inputFileReader.addEventListener("load", function() {
    let img = addIcon({src: inputFileReader.result});
    
    globalThis.icons.push({sizes: img.naturalWidth + 'x' + img.naturalHeight, src: img.src});
});