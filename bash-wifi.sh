#!/bin/bash

psk=\""$2"\"
ssid=\""$3"\"
str=$(wpa_cli -iwlan0 disconnect)
echo $str
str=$(for i in `wpa_cli list_networks | grep ^[0-9] | cut -f1`; do wpa_cli -iwlan0 remove_network $i; done)
echo $str
str=$(wpa_cli -iwlan0 add_network)
echo $str
str=$(wpa_cli -iwlan0 set_network 0 auth_alg OPEN)
echo $str
str=$(wpa_cli -iwlan0 set_network 0 key_mgmt "$1")
echo $str
str=$(wpa_cli -iwlan0 set_network 0 psk $psk)
echo $str
str=$(wpa_cli -iwlan0 set_network 0 mode 0)
echo $str
str=$(wpa_cli -iwlan0 set_network 0 ssid $ssid)
echo $str
str=$(wpa_cli -iwlan0 select_network 0)
echo $str
str=$(wpa_cli -iwlan0 enable_network 0)
echo $str
str=$(wpa_cli -iwlan0 reassociate)
echo $str
str=$(wpa_cli -iwlan0 status)
echo $str
str=$(iw wlan0 link)
echo $str
str=$(dhclient wlan0)
echo $str
