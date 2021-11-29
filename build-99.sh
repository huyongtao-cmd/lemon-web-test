echo "Installing dependencies..."
yarn install
echo "Building..."
rm -rf dist/ && yarn build-99
echo "Deploying..."
tar cf tw-web-env99.tar -C dist/ .
du -sh *
ssh administrator@192.168.0.144 'del /s/q c:\_temp\nginx-1.15.6\tw-web-env99.tar'
scp tw-web-env99.tar administrator@192.168.0.144:'c:\_temp\nginx-1.15.6\'
echo "send file success !! and go tu rd /s/q "
ssh administrator@192.168.0.144 'rd /s/q c:\_temp\nginx-1.15.6\telework_9999 && md c:\_temp\nginx-1.15.6\telework_9999'
ssh administrator@192.168.0.144 'cd c:\_temp\nginx-1.15.6\ && tar -xf tw-web-env99.tar -C telework_9999'
rm tw-web-env99.tar