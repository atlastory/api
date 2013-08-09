#!/bin/bash

export APP=api

cd $HOME/$APP
git pull origin master
npm install
chmod a+x run.sh
sudo stop $APP
sudo start $APP