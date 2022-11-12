#!/bin/sh
curl https://raw.githubusercontent.com/a16z/helios/master/heliosup/install | bash
heliosup
helios --rpc-port 8547 --execution-rpc https://eth-rpc.gateway.pokt.network
