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

未解决的问题
---
无法通过程序在遍历第一个无线网络的mac值之后，由程序切换到其他网络。问题的原因在于nodejs的异步操作。尝试通过”async“库执行，失败。失败的问题出在第一个子线程结束后主线程也退出，并不会执行第二个子线程。

目前使用setTimeout执行第二个子线程，可以使用，但效果不理想。不理想在于无法自行判断需要执行的网络个数。
