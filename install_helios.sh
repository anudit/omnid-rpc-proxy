#!/bin/sh
curl https://raw.githubusercontent.com/a16z/helios/master/heliosup/install | bash
heliosup
helios --rpc-port 8547 --execution-rpc https://eth-mainnet.g.alchemy.com/v2/jz1AlVEXLDxlzNMcKDg9To03aBnOssyH
