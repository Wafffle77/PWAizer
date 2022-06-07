console.log("Background script started.");

let browser = window.browser || window.chrome;

browser.browserAction.onClicked.addListener(function(tab) {
    console.log(tab);
    browser.tabs.executeScript(tab.id, {file: "/pwaizer.js"})
});