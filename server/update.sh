#!/bin/bash

export APP=api

cd $HOME/$APP
git pull origin master
npm install
sudo stop $APP
sudo start $APP