#!/bin/bash
_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
export MIGMETA_FILE=/etc/migmeta.yaml
export VIEWS_DIR=/srv/staticroot
export STATIC_DIR=/srv/staticroot
node /srv/main.js
