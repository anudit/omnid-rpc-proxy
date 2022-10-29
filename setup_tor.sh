#!/bin/sh
echo $HOSTNAME > /var/lib/tor/hidden_service/hostname
echo $PK > /var/lib/tor/hidden_service/hs_ed25519_public_key.b64
base64 -d /var/lib/tor/hidden_service/hs_ed25519_public_key.b64 > /var/lib/tor/hidden_service/hs_ed25519_public_key
echo $SK > /var/lib/tor/hidden_service/hs_ed25519_secret_key.b64
base64 -d /var/lib/tor/hidden_service/hs_ed25519_secret_key.b64 > /var/lib/tor/hidden_service/hs_ed25519_secret_key
/usr/bin/tor -f /etc/tor/torrc
