程序逻辑：

主程序通过info.json文件获取无线网络的加密方式key_mgmt、密码psk和网络名ssid，将这些信息传入子线程中，
子线程执行`bash-wifi.sh`脚本并向脚本中传入info.json获取到的数据。`bash-wifi.sh`脚本连接到对应的无线网络。
主线程通过子线程的回调函数判断网络连接，然后获取内网ip，并对内网的ip地址进行ping。当ping到可用地址时通过node-arp获取ip对应的mac。

安装
---
```
npm install 
```
依赖文件，也可分别安装node-arp库和ping库
```
npm install node-arp
npm install ping
```

使用
---
```
node wifi.js
```
