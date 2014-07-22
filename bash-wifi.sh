#!/bin/bash

psk=\""$2"\"
ssid=\""$3"\"
wpa_cli -iwlan0 disconnect
for i in `wpa_cli list_networks | grep ^[0-9] | cut -f1`; do wpa_cli -iwlan0 remove_network $i; done
wpa_cli -iwlan0 add_network
wpa_cli -iwlan0 set_network 0 auth_alg OPEN
wpa_cli -iwlan0 set_network 0 key_mgmt "$1"
wpa_cli -iwlan0 set_network 0 psk $psk
wpa_cli -iwlan0 set_network 0 mode 0
wpa_cli -iwlan0 set_network 0 ssid $ssid
wpa_cli -iwlan0 select_network 0
wpa_cli -iwlan0 enable_network 0
wpa_cli -iwlan0 reassociate
wpa_cli -iwlan0 status
iw wlan0 link
dhclient wlan0
