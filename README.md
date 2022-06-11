PWAizer
=======

PWAizer (rhymes with 'wiser') is a browser extension that dynamically generates a PWA (Progressive Web Application) manifest and service worker for any website to use. This allows (nearly) any chosen website to meet the [requirements](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Installable_PWAs) to be installable as a PWA. 
Use this at your own risk, as it relies on many unintended interactions to do what it does. It may cause (possibly severe) issues. Read through the Usage section completely and familiarize yourself with the concepts brefore doing anything.
The PWA logo was created by Love2Dev and was sourced from https://github.com/docluv/pwa-logo

Usage
-----

In addition to the browser extension, you need to use a proxy server to enable installation of the service worker. An easy one to use is [mitmproxy](https://mitmproxy.org/). If you decide to use mitmproxy, you will need to [install the certificates](https://docs.mitmproxy.org/stable/concepts-certificates/). Once you have mitmproxy installed and set up, you can start the proxy with the correct arguments with the command `mitmproxy -p8080 --map-local '!.*/pwaizerServiceWorker\.js.*|./pwaizerServiceWorker.js'` in the PWAizer directory. This will pass all requests through except ones for the PWAizer service worker, which will get redirected to the file.

Next, point your browser's proxy settings to 127.0.0.1:8080 to foce it to use the proxy. [Firefox](https://support.mozilla.org/en-US/kb/connection-settings-firefox) has built-in proxy settings, but (most) [chromium-based browsers](https://en.wikipedia.org/wiki/Chromium_(web_browser)#Browsers_based_on_Chromium) does not. Instead, they can be started with the `--proxy-server="https://127.0.0.1:8080"` [commandline argument](https://chromium.googlesource.com/chromium/src/+/HEAD/net/docs/proxy.md#Manual-proxy-settings). This has the added benefit of reverting your proxy settings when the browser is closed. If you do use a method to change your proxy settings that doesn't revert when the browser is closed, remember to change them back once the PWA is installed and the proxy is shut off, otherwise you will not be able to access the internet. 

Once the proxy server is running, you can tell if the browser is using it by checking the output. By defauly, mitmproxy gives output for every web request, so simply loading a page in the web browser and checking if mitmproxy sees it is a good indicator. Once the traffic is flowing through the proxy server, you can start installing PWAs. To do this, you can use the extension button to open a menu. This menu allows you to customize some of the manifest fields for the PWA. 

- The name field sets the name for the PWA, which is what it will show on your desktop/homescreen.
- The display type sets the display mode for the PWA when opened. Details on each of the four options can be found [here](https://developer.mozilla.org/en-US/docs/Web/Manifest/display).
- The start URL is the initial page opened when you launch the PWA. It must have the same origin as the PWA itself. 'https:/[]()/example.com/index.html' will match 'https:/[]()/example.com/different.html', but 'https:/[]()/example.com/' won't match 'https:/[]()/example.net/')
- The caching checkbox will enable page caching when checked. This will store every resource the page loads for offline use. It may take up a lot of space, so be careful when using it.
- The icon list shows all icons autodetected by the extension. You can deselect an icon by clicking it. This will prevent it from being added to the manifest.

Once all the options have been set, pressing the 'Create PWA' button will register the service worker and manifest. The website should now be installable as a PWA, and a popup may appear prompting you to install.

Troubleshooting
---------------

As mentioned above, this extension relies on many unintended interactions to do what it does. Since it is creating manifest files and service workers for websites that weren't intended to have them, there may be problems with certain websites. If something goes wrong, a good first step is to reload the page. This will remove anything temporary that PWAizer left when generating the PWA. If that doesn't fix it, then reseting the site data may also work.