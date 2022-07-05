#!/bin/env python3

from zipfile import ZipFile
from argparse import ArgumentParser
import sys

manifestVersions = ["v2","v3"]

packageFiles = [
    "generatePWA.js",
    "checker.js",
    "getIcons.js",
    "popup.js",
    "popup.html",
    "PWAS3-transparent-132x132.png"
]

def log(data, force=False):
    if args.verbose or force:
        print(f"[{sys.argv[0]}] {data}")

def package(zipName, version):
    log(f"Writing zip file {zipName}")
    with ZipFile(zipName, "w") as package:
        log(f"Adding manifest.{version}.json as manifest.json")
        package.write(f"manifest.{version}.json", "manifest.json")
        for file in packageFiles:
            log(f"Adding {file}")
            package.write(file)

parser = ArgumentParser(description="Packages PWAizer into a zip file, accounting for different manifest versions.")
parser.add_argument("--manifest-version", "-m", choices=manifestVersions, default="v3", dest="manifestVersion", help="Sets the manifest version to package for. Default: v3")
parser.add_argument("--zip-name", '-n', default="PWAizer.zip", dest="zipName", help="Name of the output ZIP file. Default: PWAizer.zip")
parser.add_argument("--all", "-a", action="store_true", dest="all", help="Package all formats.")
parser.add_argument("--verbose", "-v", action="store_true", dest="verbose", help="Verbose output.")

args = parser.parse_args()

if args.all:
    for version in manifestVersions: 
        package(args.zipName + "." + version, version)
else: 
    package(args.zipName, args.manifestVersion)
log("Finished")