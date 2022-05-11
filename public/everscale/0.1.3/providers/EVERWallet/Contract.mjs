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

import everscaleUtils from "../../everscaleUtils.mjs";
import utils from "../../utils.mjs";

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
        let rawAccount = await this.ton.net.query_collection({
            collection: 'accounts',
            filter: {id: {eq: this.address}},
            result: 'balance acc_type id acc_type_name workchain_id'
        })

        return {...rawAccount.result[0],};
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
        return await everscaleUtils.runLocal(this.ton, this.abi, this.address, method, args)
    }

    /**
     * Deploy method
     * @param {string} method
     * @param {undefined|array|object} args
     * @returns {Promise<*>}
     */
    async deployMethod(method, args = {}) {

        throw new Error('Not implemented yet');

        /*
        let params = {
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

        return result;
        */

    }

    /**
     * Get call payload
     * @param method
     * @param args
     * @returns {Promise<*>}
     */
    async deployPayload(method, args = {}) {

        return {
            abi: JSON.stringify(this.abi),
            method: method,
            params: args
        }
    }

    /**
     * Return contract state
     * @returns {Promise<{}|{state: {balance: number, lastTransactionId: *, isDeployed: boolean, boc, genTimings: {genLt: string, genUtime: number}}}>}
     */
    async getState() {
        return await utils.getFullContractState(this.ton, this.address);
    }

    /**
     * Get contract transactions
     * @param filter Not implemented yet
     * @param order Not implemented yet
     * @param limit Not implemented yet
     * @returns {Promise<*[]>}
     */
    async getTransactions(filter = null, order = null, limit = null) {
        return await utils.getTransactions(this.ton, this.address);
    }

    /**
     * Get decoded transactions
     * @param methods
     * @param filter
     * @param order
     * @param limit
     * @returns {Promise<*[]>}
     */
    async getDecodedTransactions(methods = [], filter = null, order = null, limit = null) {
        let transactions = await this.getTransactions(filter, order, limit);
        let decodedTransactions = [];
        for (let transaction of transactions) {
            let decodedTransaction = await utils.decodeTransaction(this.ton, transaction,this.abi, methods);
            decodedTransactions.push(decodedTransaction);
        }
        return decodedTransactions;
    }

}

export default Contract;