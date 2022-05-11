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


export const TONMnemonicDictionary = {
    TON: 0,
    ENGLISH: 1,
    CHINESE_SIMPLIFIED: 2,
    CHINESE_TRADITIONAL: 3,
    FRENCH: 4,
    ITALIAN: 5,
    JAPANESE: 6,
    KOREAN: 7,
    SPANISH: 8,
};

export const SEED_LENGTH = {
    w12: 12,
    w24: 24,
    private: null
}

// 'abandon math mimic master filter design carbon crystal rookie group knife young'

/**
 * Account class. Holds seed and private key
 */
class Account {
    constructor(ton, publicKey, seed, seedLength = SEED_LENGTH.w12, dict = TONMnemonicDictionary.ENGLISH,) {
        this.publicKey = publicKey;
        this._seed = seed;
        this.ton = ton;
        this.seedLength = seedLength;
        this.dict = dict
    }

    /**
     * Get public key
     * @returns {Promise<*>}
     */
    async getPublic() {
        if(this.seedLength === SEED_LENGTH.private) {
            return this.publicKey;
        }

        let keys = await this.ton.crypto.mnemonicDeriveSignKeys({
            phrase: this._seed,
            wordCount: this.seedLength,
            path: 'm',
            dictionary: this.dict
        });
        keys.secret = undefined;
        delete keys.secret;

        return keys.public
    }


    /**
     * Get private key
     * @param description
     * @returns {Promise<null|*>}
     */
    async getPrivate(description = 'Action unknown') {
        if(confirm('Allow the application to use the PRIVATE key for: ' + description)) {

            if(this.seedLength === SEED_LENGTH.private) {
                return this._seed;
            }

            let keys = await this.ton.crypto.mnemonicDeriveSignKeys({
                phrase: this._seed,
                wordCount: this.seedLength,
                path: 'm',
                dictionary: this.dict
            });
            return keys.secret;
        }

        return null;
    }

    /**
     * Get key pair
     * @param description
     * @returns {Promise<{public: *, secret: (null|*)}>}
     */
    async getKeys(description = 'Action unknown') {
        return {public: await this.getPublic(), secret: await this.getPrivate(description)};
    }
}

export default Account;