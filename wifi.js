var cp = require('child_process');
var fs = require('fs');
//顺序执行异步操作的一个库，我尝试失败。可能是我的代码逻辑错误，这个库可以作为参考。
//var async = require('async');

var jsonObj = JSON.parse(fs.readFileSync('info.json','utf-8'));
/**
var dataArr = jsonObj.networks;
console.log(dataArr);
async.eachSeries(dataArr,function(item,callback){
    var json = JSON.parse(obj2str(item));
    console.log('json: '+json.ssid);
    connectWIFI(json.key_mgmt,json.psk,json.ssid);
},function(err){
    console.log('over, err:'+err);
});
*/
//console.log(jsonObj);

connectWIFI(jsonObj.networks[0].key_mgmt,jsonObj.networks[0].psk,jsonObj.networks[0].ssid);
setTimeout(function(){
//console.log('connect next'); //通过这个可以知道程序一开始就加载setTimeout的function。这个“content next”会出现在所有输出的第一条。
connectWIFI(jsonObj.networks[1].key_mgmt,jsonObj.networks[1].psk,jsonObj.networks[1].ssid);
},30000);


function connectWIFI(key_mgmt,psk,ssid,callback){
    cpc('sudo',['./bash-wifi.sh',key_mgmt,psk,ssid],function(){
        //console.log('cpc callback');
        getIp();
    });
}


/**
*   获取本机的ip地址，并传递内网的ip前缀给ping遍历函数。
*/
function getIp(){
   // cpc('sudo',['wpa_cli','-iwlan0','status','|','grep','ip_address','|','grep','-o','[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}'],function(data){ 错误的方式，第二个‘|’后面的代码都不会被执行到。
   
   cpc('sudo',['wpa_cli','-iwlan0','status','|','grep','ip_address'],function(data){
        //console.log('getIP:'+data);
        //使用正则获取ip地址
        var ip = data.match(/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/);
        console.log('IP:'+ip);
        //prefix_ip IP地址的前三位包含‘.’例如“192.168.10.”，目的是为了方便遍历局域网内的ip地址1--255,其中1和255固定被占用，故只遍历2--254
        var prefix_ip = ip.toString().match(/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\./);    
        console.log('prefix_ip:'+prefix_ip);
        ping(prefix_ip,function(){
            console.log('ping callback');
        });
    });
}

/**
*   调用子进程执行command语句
*   args是command的参数，callback回调函数，用于传递执行的结果。
*   注意：使用sudo时，command是‘sudo’，需要执行的命令降格为参数。例如： cpc('sudo',['ls','../'],function(data){});
*/
function cpc(command,args,callback){
    var scp = cp.spawn(command,args, {});
    var result = "";
    scp.stdout.on('data', function (data) {
        //console.log('stdout: ' + data);
		result = data+"";
		result = result.replace("\n","");
    });
    scp.stderr.on('data', function (data) {
       // console.log('stderr: ' + data);
    });
    scp.on('close', function (code) {
		callback(result);
	});	
}


/**
*   通过内网ip前缀，遍历路由器上的所有ip地址。并通过ping库对所有内网ip进行ping操作，达到更新arp表的目的。
*/
function ping(prefix_ip,callback){
    var ping = require('ping');
    var hosts = [];
    //内网的ip地址默认已经使用了0和255。所以这2个地址不需要ping了。
    for(var i=1;i<255;i++){
        hosts.push(prefix_ip+i);
        //console.log(prefix_ip+i);
    }
    hosts.forEach(function(host){
        ping.sys.probe(host, function(isAlive){
            //console.log(isAlive); 判断出isAlive是布尔类型的数据，仅仅告知ping成功或失败。
            if(isAlive){
                console.log(host+' is alive');
                //对ping返回有效的ip地址执行获取mac的操作。其中会出现一个undefind，原因是该ip是本机的ip，arp表不存放本机的ip对因的mac
                getMac(host);
            }else{}
        });
    });
    callback();
}


/**
*   通过ip地址从arp表中获取mac值
*/
function getMac(ip){
    var arp = require('node-arp');
    arp.getMAC(ip,function(err,mac){
        if(!err){
            console.log(mac);
         }
    });
}

/**
function obj2str(o){ 
        var r = [], i, j = 0, len; 
        if(o == null) { 
            return o; 
        } 
        if(typeof o == 'string'){ 
            return '"'+o+'"'; 
        } 
        if(typeof o == 'object'){ 
            if(!o.sort){ 
                r[j++]='{'; 
                for(i in o){ 
                    r[j++]= '"'; 
                    r[j++]= i; 
                    r[j++]= '":'; 
                    r[j++]= obj2str(o[i]); 
                    r[j++]= ','; 
                } 
                //可能的空对象 
                //r[r[j-1] == '{' ? j:j-1]='}'; 
                r[j-1] = '}'; 
            }else{ 
                r[j++]='['; 
                for(i =0, len = o.length;i < len; ++i){ 
                    r[j++] = obj2str(o[i]); 
                    r[j++] = ','; 
                } 
                //可能的空数组 
                r[len==0 ? j:j-1]=']'; 
            } 
            return r.join(''); 
        } 
        return o.toString(); 
    } 
 */
