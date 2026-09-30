curl -s -o /dev/null localhost:8801/ || (nohup python3 -m http.server 8801 --directory /tmp/vade_main >/dev/null 2>&1 &)
curl -s -o /dev/null localhost:8802/ || (nohup python3 -m http.server 8802 --directory /home/user/ruta-comercial >/dev/null 2>&1 &)
sleep 1
