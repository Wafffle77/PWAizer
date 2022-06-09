console.log("Pwaizer: getIcons.js is running.");

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

function generatePWA() {
    let icons = new Array().concat(
        Array.from(document.getElementsByTagName('link')).filter(x => x.rel.search('icon') != -1).map(x => x.href),
        Array.from(document.getElementsByTagName("meta")).filter(x => (x.getAttribute('property') || '').match(/^og:(image|logo)$/)).map(x => x.content),
    );

    fetch(window.location.origin + "/favicon.ico", { mode: 'no-cors' }).then(faviconResponse => {
        if (faviconResponse.ok || faviconResponse.status == 0) {
            icons.push(window.location.origin + "/favicon.ico");
        }

        if(icons.length == 0) {
            icons.push("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABhWlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AYht+makUrHewg4pChOlkQFXGUKhbBQmkrtOpgcukfNGlIUlwcBdeCgz+LVQcXZ10dXAVB8AfE0clJ0UVK/C4ptIjxjuMe3vvel7vvAKFRYarZNQGommWk4jExm1sVA6/ooTmIEPolZuqJ9GIGnuPrHj6+30V5lnfdn2NAyZsM8InEc0w3LOIN4plNS+e8TxxmJUkhPiceN+iCxI9cl11+41x0WOCZYSOTmicOE4vFDpY7mJUMlXiaOKKoGuULWZcVzluc1UqNte7JXxjMaytprtMaQRxLSCAJETJqKKMCC1HaNVJMpOg85uEfdvxJcsnkKoORYwFVqJAcP/gf/O6tWZiadJOCMaD7xbY/RoHALtCs2/b3sW03TwD/M3Cltf3VBjD7SXq9rUWOgNA2cHHd1uQ94HIHGHrSJUNyJD8toVAA3s/om3LA4C3Qt+b2rXWO0wcgQ71avgEODoGxImWve7y7t7Nv/9a0+vcDHdFyhdirZqgAAAAGYktHRAAAACMA/+5KrEsAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAHdElNRQfmBgYTEBGY8NfJAAAAGXRFWHRDb21tZW50AENyZWF0ZWQgd2l0aCBHSU1QV4EOFwAAAM9JREFUWMPlllEOxCAIRBnSq3IqD8v+uMnW1BYRZTdrYvpFmXkgSvTvC/WrjpiQxY4YzRYQug4jYt3ZAzCif+wFETnFlFLwEyXQqp4a9UM/bt2nN+EV/iEBLZHZ2t8JABGhE4SPvX4OtCJaZyKi7719EPWSjuD/imPInu6Ncu8iMFNv99XqSWpxv6wH6tRUyyXGkW487weedIqO+/g5YKFwk1y3vO8ecGO1APWcupWT0PS040XuYSWMjfgv8yIh+Sl3+m0YTQCDpMDZZo9sii9/A04NFgfvYgAAAABJRU5ErkJggg==")
        }

        Promise.all(icons.map(async function(link) {
            let img = new Image();
            img.src = link;
            await getPromiseFromEvent(img, "load");
            return ({
                sizes: img.naturalWidth + 'x' + img.naturalHeight,
                src: link
            });
        })).then(icons => {
            if(!icons.map(x => x.sizes).includes('192x192')) {
                let largestIcon = icons.filter(x => new URL(x.src).host == window.location.host).reduce((p,c,i,a) => {
                    let pSize = parseInt(p.sizes.split("x")[0]) * parseInt(p.sizes.split("x")[1]);
                    let cSize = parseInt(c.sizes.split("x")[0]) * parseInt(c.sizes.split("x")[1]);
                    if(pSize < cSize) {
                        return(c);
                    } else {
                        return(p);
                    }
                });
                let img = new Image();
                img.src = largestIcon.src;
                let sizes = largestIcon.sizes.split("x").map(x => parseInt(x));

                let canvas = document.createElement('canvas');
                let ctx = canvas.getContext('2d');
                ctx.imageSmoothingQuality = 'low';
                canvas.width  = 192;
                canvas.height = 192;
                ctx.drawImage(img, 0, 0, 192, 192);

                icons.push({
                    sizes: "192x192",
                    src: canvas.toDataURL('image/png')
                });
            }
            globalThis.icons = icons;
        });
    });
}

generatePWA();
globalThis.icons;