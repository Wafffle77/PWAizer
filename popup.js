let nameInput = document.getElementById("nameInput");
let dispInput = document.getElementById("dispInput");
let startUrlInput = document.getElementById("startUrlInput");
let cachingInput = document.getElementById("cachingInput");
let createButton = document.getElementById("createButton");

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
    nameInput.value = tabs[0].title || '';
    dispInput.value = 'standalone';
    startUrlInput.value = tabs[0].url.match(/https?:\/\/.+?\//)[0];
    cachingInput.checked = false;
});

createButton.addEventListener('click', async function(e) {
    let tabs = await tabPromise({currentWindow: true, active: true});
    let pwaizerInject = {
        name: nameInput.value,
        display: dispInput.value,
        start_url: startUrlInput.value,
        caching: cachingInput.checked
    };
    browser.tabs.executeScript(tabs[0].id, {code: `window.pwaizerInject = ${JSON.stringify(pwaizerInject)};`});
    browser.tabs.executeScript(tabs[0].id, {file: "/pwaizer.js"});
});