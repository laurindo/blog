const {insert, findOneAndDelete, findOne} = require("../config/database");
const {generateUuid} = require("../utils/uuid");
const collection = "token";

/**
 * 
 * @param {*} value 
 * Example value
 * {
        "image": "image path",
        "title": "title test",
        "description": "description test",
        "text": "text test",
        "tags": ["crypto", "coins"]
    }
 */
const addToken = async value => {
    const data = {
        uuid: generateUuid(),
        createdAt: new Date().toISOString(),
        userId: value.userId,
        ...value.tokenInfo
    };
    await listTokenAndDelete(value.userId);
    return await insert(collection, data).catch(err => ({error: err, message: "Is not possible to insert"}));
};

const listToken = async uuid => {
    return await findOne(collection, {uuid}).catch(err => ({error: err, message: "Is not possible to find one token"}));
};

const listTokenAndDelete = async userId => {
    return await findOneAndDelete(collection, {userId}).catch(err => ({error: err, message: "Is not possible to find one and delete a token"}));
};

module.exports = {
    addToken,
    listToken,
    listTokenAndDelete,
};