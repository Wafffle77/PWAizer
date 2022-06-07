let nameInput = document.getElementById("nameInput");
let dispInput = document.getElementById("dispInput");
let startUrlInput = document.getElementById("startUrlInput");
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
});

createButton.addEventListener('click', async function(e) {
    let tabs = await tabPromise({currentWindow: true, active: true});
    browser.tabs.executeScript(tabs[0].id, {code: `
    window.pwaizerInject = {
        name: '${btoa(nameInput.value)}',
        display: '${btoa(dispInput.value)}',
        start_url: '${btoa(startUrlInput.value)}'
    }`});
    browser.tabs.executeScript(tabs[0].id, {file: "/pwaizer.js"});
});