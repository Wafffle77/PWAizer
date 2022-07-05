console.log("Pwaizer: checker.js is running.")
let manifestURL = localStorage.getItem("pwaizerManifest");
if (manifestURL != null) {
    if (!document.querySelector("link[rel='manifest']")) {
        let manifestLink = document.createElement("link");
        manifestLink.setAttribute("rel", "manifest");
        manifestLink.setAttribute("href", manifestURL);
        document.head.appendChild(manifestLink);
    }
}