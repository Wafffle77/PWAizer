console.log("Pwaizer: getIcons.js is running.");

function getIcons() {
    let icons = new Array().concat(
        Array.from(document.getElementsByTagName('link')).filter(x => x.rel.search('icon') != -1).map(x => x.href),
        Array.from(document.getElementsByTagName("meta")).filter(x => (x.getAttribute('property') || '').match(/^og:(image|logo)$/)).map(x => x.content),
    );
    return (icons);
}

getIcons();