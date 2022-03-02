/*
  _______          _____                _     _
 |__   __|        |  __ \              (_)   | |
    | | ___  _ __ | |__) | __ _____   ___  __| | ___ _ __
    | |/ _ \| '_ \|  ___/ '__/ _ \ \ / / |/ _` |/ _ \ '__|
    | | (_) | | | | |   | | | (_) \ V /| | (_| |  __/ |
    |_|\___/|_| |_|_|   |_|  \___/ \_/ |_|\__,_|\___|_|
 */

/**
 * @name FreeTON connection provider
 * @copyright SVOI.dev Labs - https://svoi.dev
 * @license Apache-2.0
 * @version 1.0
 */
import utils from "../../utils.mjs";
import everscaleUtils from "../../everscaleUtils.mjs";

/**
 * Contract class
 */
class Contract {
    constructor(abi, address, ton, parent) {
        //this.provider = provider;
        this.parent = parent;
        this.abi = abi;
        this.address = address;
        //this.contract = new freeton.Contract(provider, abi, address);
        this.ton = ton;


        let that = this;

        //Setup methods
        for (let {name} of abi.functions) {
            if(name === 'constructor') {
                continue;
            }
            this[name] = async function (args = undefined) {
                return await that.getMethod(name, args);
            }

            //Make method deployable
            this[name].deploy = async function (args = undefined) {
                return await that.deployMethod(name, args);
            }

            this[name].payload = async function (args = undefined) {
                return await that.deployPayload(name, args);
            }
        }
    }

    /**
     * Get current provider
     * @returns {*}
     */
    getProvider() {
        return this.ton;
    }

    /**
     * Get TON client
     * @returns {TONClient}
     */
    getTONClient() {
        return this.ton;
    }

    /**
     * Get raw contract object
     * @returns {*}
     */
    getProviderContract() {
        return this.contract;
    }

    /**
     * Return account info for contract
     * @returns {Promise<*>}
     */
    async getAccount() {
        return await this.ton.contracts.getAccount(this.address);
    }

    /**
     * Return balance for contract
     * @returns {Promise<number>}
     */
    async getBalance() {
        let account = await this.getAccount();
        let balance = Number(account.balance);
        return balance;
    }

    /**
     * Run method locally
     * @param {string} method
     * @param {array|object} args
     * @returns {Promise<*>}
     */
    async getMethod(method, args = {}) {


        return await everscaleUtils.runLocal(this.ton, this.abi, this.address, this.method, args);

        /*

        try {
            return (await this.ton.contracts.runLocal({
                abi: this.abi,
                functionName: method,
                input: args,
                address: this.address
            })).output;
        } catch (e) {

            //WASM error, need to reload WASM
            if(e.code === 6) {
                console.log('DETECTED WASM BUG. START WORKAROUND ', e);
                await utils.wait(3000);
                //Reload TonWeb
                this.ton = await getTONWeb();

                console.log(this.ton);
                //console.log(ton);

                await this.ton.setServers([this.parent.networkServer]);

                return (await this.ton.contracts.runLocal({
                    abi: this.abi,
                    functionName: method,
                    input: args,
                    address: this.address
                })).output;
            }

            throw e;
        }
        //return await this.contract.functions[method].runGet(args);*/
    }

    /**
     * Deploy method
     * @param {string} method
     * @param {undefined|array|object} args
     * @returns {Promise<*>}
     */
    async deployMethod(method, args = {}) {
        throw new Error('Not implemented yet');
        /*let params = {
            address: this.address,
            abi: this.abi,
            functionName: method,
            input: args,
            keyPair: await this.parent.getKeypair()
        };
        console.log('DEPLOY METHOD', params);
        let message = await this.parent.provider.contracts.createRunMessage(params);
        console.log('MESSAGE', message, await this.parent.provider);
        let transaction = await this.parent.provider.contracts.sendMessage(message.message);
        console.log('TX', transaction);

        let result = await this.parent.provider.contracts.waitForRunTransaction(message, transaction);

        result.tx = transaction;

        return result;*/
    }

    /**
     * Get call payload
     * @param method
     * @param args
     * @returns {Promise<*>}
     */
    async deployPayload(method, args = {}) {

        const ton = this.ton;

        const callSet = {
            function_name: method,
            input: args
        }
        const encoded_msg = await ton.abi.encode_message_body({
            abi: {
                type: 'Json',
                value: JSON.stringify(this.abi)
            },
            call_set: callSet,
            is_internal: true,
            signer: {
                type: 'None'
            }
        });

        return encoded_msg.body;

    }

}

export default Contract;