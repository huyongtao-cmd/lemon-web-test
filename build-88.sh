echo "Installing dependencies..."
yarn install
echo "Building..."
rm -rf dist/ && yarn build-88
echo "Deploying..."
tar cf tw-web-env88.tar -C dist/ .
du -sh *
ssh administrator@192.168.0.144 'del /s/q c:\_temp\nginx-1.15.6\tw-web-env88.tar'
scp tw-web-env88.tar administrator@192.168.0.144:'c:\_temp\nginx-1.15.6\'
echo "send file success !! and go tu rd /s/q "
ssh administrator@192.168.0.144 'rd /s/q c:\_temp\nginx-1.15.6\telework_8888 && md c:\_temp\nginx-1.15.6\telework_8888'
ssh administrator@192.168.0.144 'cd c:\_temp\nginx-1.15.6\ && tar -xf tw-web-env88.tar -C telework_8888'
