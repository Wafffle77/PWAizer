console.log("Pwaizer: popup.js is running.");

let nameInput = document.getElementById("nameInput");
let dispInput = document.getElementById("dispInput");
let startUrlInput = document.getElementById("startUrlInput");
let cachingInput = document.getElementById("cachingInput");
let createButton = document.getElementById("createButton");
let iconsDiv = document.getElementById("iconsDiv");

let browser = window.browser || window.chrome;

function tabPromise(q) {
    return(new Promise(resolve => {
        browser.tabs.query(q, tabs => {
            resolve(tabs);
        });
    }));
}

window.addEventListener("load", async function() {
    let tabs = await tabPromise({currentWindow: true, active: true});
    //TODO: replace with chrome.scripting.executeScript when manifest V3 is ready
    browser.tabs.executeScript(tabs[0].id, {file: "/getIcons.js"}, function(icons) {
        icons[0].forEach(i => {
            let img = new Image();
            img.src = i.src;
            img.addEventListener("click", function(e) {
                e.target.classList.toggle('deselected');
                if(iconsDiv.querySelectorAll('img.deselected').length == iconsDiv.childElementCount) {
                    alert("There must be at least one icon.");
                    e.target.classList.toggle('deselected');
                }
            });
            iconsDiv.appendChild(img);
        });
        globalThis.icons = icons[0];
    });

    nameInput.value = tabs[0].title || '';
    dispInput.value = 'standalone';
    startUrlInput.value = new URL(tabs[0].url).origin;
    cachingInput.checked = false;
});

createButton.addEventListener('click', async function(e) {
    let tabs = await tabPromise({currentWindow: true, active: true});
    let pwaizerInject = {
        icons: globalThis.icons.filter(x => iconsDiv.querySelector(`img[src="${x.src}"]`).className.includes("deselected") <= 0),
        name: nameInput.value,
        display: dispInput.value,
        start_url: startUrlInput.value,
        caching: cachingInput.checked
    };
    browser.tabs.executeScript(tabs[0].id, {code: `window.pwaizerInject = ${JSON.stringify(pwaizerInject)};`});
    browser.tabs.executeScript(tabs[0].id, {file: "/generatePWA.js"});
});