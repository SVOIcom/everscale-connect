/*_______ ____  _   _  _____
 |__   __/ __ \| \ | |/ ____|
    | | | |  | |  \| | (_____      ____ _ _ __
    | | | |  | | . ` |\___ \ \ /\ / / _` | '_ \
    | | | |__| | |\  |____) \ V  V / (_| | |_) |
    |_|  \____/|_| \_|_____/ \_/\_/ \__,_| .__/
                                         | |
                                         |_| */
/**
 * @name TONSwap project - tonswap.com
 * @copyright SVOI.dev Labs - https://svoi.dev
 * @license Apache-2.0
 */

const BigNumber = require('bignumber.js');

const utils = {
    /**
     * Shorten pubkey or address
     * @param pubkey
     * @param delimiter
     * @returns {string}
     */
    shortenPubkey: (pubkey, delimiter = '...') => {
        pubkey = String(pubkey);
        return pubkey.substr(0, 6) + delimiter + pubkey.substr(-4);
    },
    /**
     * Convert string to hex string
     * @param {string} str
     * @returns {string}
     */
    toHex(str) {
        let result = '';
        for (let i = 0; i < str.length; i++) {
            result += str.charCodeAt(i).toString(16);
        }
        return result;
    },
    /**
     * Transfer hack ABI
     */
    TRANSFER_BODY: {
        "ABI version": 2,
        "functions": [
            {
                "name": "transfer",
                "id": "0x00000000",
                "inputs": [
                    {
                        "name": "pubkey",
                        "type": "uint256"
                    }
                ],
                "outputs": []
            }
        ],
        "events": [],
        "data": []
    },

    /**
     * Big hex string to big dec string
     * @param {string} s
     * @returns {string}
     */
    hexString2DecString(s) {

        function add(x, y) {
            let c = 0, r = [];
            x = x.split('').map(Number);
            y = y.split('').map(Number);
            while (x.length || y.length) {
                let s = (x.pop() || 0) + (y.pop() || 0) + c;
                r.unshift(s < 10 ? s : s - 10);
                c = s < 10 ? 0 : 1;
            }
            if(c) {
                r.unshift(c);
            }
            return r.join('');
        }

        let dec = '0';
        s.split('').forEach(function (chr) {
            let n = parseInt(chr, 16);
            for (let t = 8; t; t >>= 1) {
                dec = add(dec, dec);
                if(n & t) {
                    dec = add(dec, '1');
                }
            }
        });
        return dec;
    },
    /**
     * Show token
     * @param {number|string} amount
     * @param {number} precision
     * @returns {string}
     */
    showToken(amount, precision = 9) {
        amount = Number(amount);
        if(!amount) {
            return '0';
        }

        return String(amount.toFixed(precision));
    },
    /**
     * Js number to raw unsigned number
     * @param num
     * @param decimals
     * @returns {number}
     */
    numberToUnsignedNumber(num, decimals = 9) {
        decimals = Number(decimals);
        if(decimals === 0) {
            return BigNumber(num).toFixed(decimals);
        }
        return (BigNumber(num).toFixed(decimals).replace('.', ''))
    },
    /**
     * Raw unsigned number to js number
     * @param num
     * @param decimals
     * @returns {number}
     */
    unsignedNumberToSigned(num, decimals = 9) {
        decimals = Number(decimals);
        if(decimals === 0) {
            return BigNumber(num).toFixed(decimals);
        }
        return BigNumber(num).div(Math.pow(10, decimals)).toFixed(decimals);
    },
    /**
     * Big number to big string
     * @param number
     * @returns {string}
     */
    bigNumberToString(number) {
        return Number(number).toLocaleString('en').replace(/,/g, '');
    },
    /**
     * @param {number} num 
     * @param {number} decimals
     */
     numberToPretty(num, length=6) { //TODO какая-то параша
        let letter = '';
        let str = BigNumber(num || 0);
        if (!str.isFinite()) {
            str = BigNumber(0);
        }
        if (str >= 1e9) {
            str = (str / 1e9)
            letter = 'b';
        } else if (str >= 1e6){
            str = (str / 1e6)
            letter = 'm';
        }

        str = str.toPrecision(length);
        if (str.includes('e')) {
            str = BigNumber(str).toFixed(0);
        }

        if (str.includes('.')) {
            str = str.replace(/0+$/g, '').replace(/\.$/g, '');
        }

        if(str.replace('.', '').length < 3) {
            str = BigNumber(str).toPrecision(3);
        }
        return str + letter;
    },
    /**
     * Extract transaction id
     * @param tx
     * @returns {null|*}
     */
    getTxId(tx) {
        if(tx.txid) {
            return tx.txid;
        }

        if(tx.transaction) {
            if(tx.transaction.id) {
                return tx.transaction.id
            }
        }

        if(tx.tx) {
            if(tx.tx.lastBlockId) {
                return tx.tx.lastBlockId
            }

        }
    },
    /**
     * Hex string to base64 string
     * @param hexstring
     * @returns {string}
     */
    hexToBase64(hexstring) {
        return btoa(hexstring.match(/\w{2}/g).map(function (a) {
            return String.fromCharCode(parseInt(a, 16));
        }).join(""));
    },


    /**
     * Create tvm cell payload with public key
     * @param pubkey
     * @returns {string}
     */
    createPubkeyTVMCELL(pubkey) {
        let data = 'b5ee9c720101010100' + '22000040' + pubkey;
        return this.hexToBase64(data);
    },
    /**
     * Hex encoded string to string
     * @param {string} hexString
     * @returns {string}
     */
    hex2String(hexString) {
        return Buffer.from(hexString, 'hex').toString();
    },

    /**
     * String to hex string
     * @param {string} str
     * @returns {string}
     */
    string2Hex(str) {
        return Buffer.from(str, 'utf8').toString('hex');
    },

    /**
     * Number to percent string
     * @param {Number} number
     * @returns {String}
     */
    numberToPercent(number) {
        number = Number(number) * 100;
        if (Number.isFinite(number)) {
            return (number > 0 ? '+' : '') + number.toFixed(2) + '%';
        } else {
            return '0.00%';
        }
    }

}
module.exports = utils;