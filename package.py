from zipfile import ZipFile
from argparse import ArgumentParser

packageFiles = [
    "generatePWA.js",
    "checker.js",
    "getIcons.js",
    "popup.js",
    "popup.html",
    "PWAS3-transparent-132x132.png"
]

parser = ArgumentParser(description="Packages PWAizer into a zip file, accounting for different manifest versions.")
parser.add_argument("--manifest-version", choices=["v2","v3"], default="v3", dest="manifestVersion")

args = parser.parse_args()

with ZipFile("PWAizer.zip", "w") as package:
    package.write(f"manifest.{args.manifestVersion}.json", "manifest.json")
    for file in packageFiles:
        package.write(file)