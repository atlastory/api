#!/bin/bash
# Simple setup Ubuntu 12.04 LTS EC2 instance
# To run:
# $ chmod a+x setup.sh
# $ ./setup.sh

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
nvm install v0.10
nvm use v0.10

# Install rlwrap to provide libreadline features with node
# See: http://nodejs.org/api/repl.html#repl_repl
sudo apt-get install -y rlwrap

# Set git user info and SSH key
git config --global user.name "Max Olson"
git config --global user.emal "maxprogram@gmail.com"
echo "-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAuaVzn+dTfeYCxG2TrOp19SVLBtoB00hoMO+3IyK55BEUQFlN
WX62s2s4//nMKIdykrCZL5Evsg2O4Gh046xrxVkUUwz/3C8hciZnD9r/iCp79JJW
vrViqZXf28Cyvt2Z1zFiQ+Cl/5O/CipunBcXVH2ediOLcqgeo6ykZlthyHGoP7Gl
81mpnk6geusm619T1qYovcQKHUKjfBLDFf+AH4pA504FgDLOwn/CqynT7xZxmzxx
wQFWtaQNRgIP+xZ/k9A163Lcf2Gvcm8EKngPcM4Q4qmFF8e2IKseConYfq3bNkUo
qC6VZnTq9cdvVBDssBUVh6z23MlgaT2EUhJeJQIDAQABAoIBACkOnFm68U4gtm/2
w/g0Ck5jJwqm4Ex38QMRoPEWVwJHfLEWjvLCAWoAxqRl/G7iNcaXY+mPNHsuYHDk
6SUJFvSYVNRhRZzOl5kFQTnSdz0IGE3op2KZ/u3+hXm2TlHD9KgQ9eiJIG07ob5/
z+KZgMFg3tDF36tF3zDXl6xDfYa0q8uMpzGmgO8sigtH8ePIfEjcnjOc1r7PoiI1
8ZEJfXjpT2WNehyHrt4DLFEXr7KsfG1dtyB3l+hmtk76Z+woBjLhWSxIUlf4/KGZ
BsGK1iylYqnlYI0G1pfDMIsf9PHoRoS15J1XMqae6z//nEQA6kW5H7HZnOjTZV6s
cjgmyoECgYEA3uWfUahi8ikHCLwUiQTcbNW9AxGJTfmqp/3n0cBRTl/A5UjOENmC
vK28CwAD1AjtQdrIUhciDx1X81a1Dji/FxNAMeiChyQl3bCPDSG11D3KSZx4w/Rh
YUl/vzms63QkLSiTChDqPsvytH1adeqPFfpLABaVLTpdB1jaEVVFe/UCgYEA1TeW
Jh4kRoeobqprs+mmDKvnJnIjBooipslNdYnoS3509gttNDxmCkeYr5MOh6WDUP7D
qrMLQKvbObuSi7qAD5vOXQBngj/MSazc0JcyN2Swfo2CxWfMtbnsl676PpLV1T8t
xM7xQQ77jmnSPwthcNtixL4K/JC4VBT75Vvyq3ECgYEAy1ScqVj6Kf3TNNydvwB4
M7Am5A2zOzZtvyGXv3e4s84VoRNxJ13ELWovB7nTxDEAffqekoQXxcH24TxPndGW
P+6HuP9pUu5evIS7ejcuL5bOWagrYlYkHyN1LXPnkkI4XhmNSLl1diOGG6/ePYLj
VCEnGcV//+olwvYCt50Z7aECgYBVeRMX9L1WCMvckTTbyq5mJgNjxh2EYZvCgLAs
jjwxB2CbwbjlV9EQDeOHfsw0VIVv0rFdnKjGJB6d5jO5D+qGV09CuQbFkA20+zcJ
55KZ4iNemBv0RsgpkX7mz55Bt1tBQTJ30v2jtv3g+UrvOwC03T2a4RRGaz15d3AD
YfjGAQKBgGBBv/U2E+KOtNs6wIqc9GJi+8dpDbR1Oz9Nac5Uz6RsZSkvWqJm5yCj
fVf8OSXHl1KSJRjZMTBqOKofuFp+jEeFeWRSLtyfZh53ToNmqVpAW/msMr/ehW9H
YJsqHSRBNFqnFfIGvDXGEtGqB62HJjnErjN6nIm6XkpShY5MEARu
-----END RSA PRIVATE KEY-----" >> ~/.ssh/id_rsa
chmod 400 ~/.ssh/id_rsa

# Clone and install API repo
echo 'yes' | git clone git@github.com:atlastory/api.git
cd api
npm install
chmod a+x run.sh

export PORT=80
echo '"./run.sh" to start'
