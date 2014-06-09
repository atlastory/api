#!/bin/bash
# Simple setup Ubuntu 13.04 EC2 instance
# To run:
# $ chmod a+x setup.sh
# $ ./setup.sh

# SET APP NAME (github repo name):
export APP="api"

sudo apt-get -y update
sudo apt-get -y upgrade

# Install git and curl
sudo apt-get install -y git git-core build-essential
sudo apt-get install -y curl

# Install Node & dependencies
sudo apt-get install -y python-software-properties python g++ make
echo 'yes' | sudo add-apt-repository ppa:chris-lea/node.js
sudo apt-get -y update
sudo apt-get install -y nodejs

# Load nvm and install latest production node
curl https://raw.github.com/creationix/nvm/master/install.sh | sh
source $HOME/.nvm/nvm.sh
nvm install v0.10.26 #may need to restart to work
nvm use v0.10.26

# Install rlwrap to provide libreadline features with node
# See: http://nodejs.org/api/repl.html#repl_repl
sudo apt-get install -y rlwrap

# Set git user info
git config --global user.name "atlastory-bot"

# Clone and install repo
echo 'yes' | git clone git@github.com:atlastory/$APP.git
cd $APP
npm install

# Server deployment
chmod a+x run.sh server/update.sh
export PORT=80
sudo apt-get install -y upstart monit
sudo cp $HOME/$APP/server/upstart.conf /etc/init/$APP.conf
REGEX=s/@@@/$APP/g
sudo sed -i $REGEX /etc/init/$APP.conf
sudo chmod a+x /etc/init/$APP.conf
exec sudo -E sh -c "echo 'check process nodejs with pidfile \"$HOME/$APP/server/pid.pid\"
    start program = \"/sbin/start $APP\"
    stop program  = \"/sbin/stop $APP\"
    if failed port 80 protocol HTTP
        request /
        with timeout 10 seconds
        then restart' >> /etc/monit/monitrc"

echo '"./run.sh" to start'
