const {insert, findAll, findOne, findOneAndUpdate, findOneAndDelete} = require("../config/database");
const {generateUuid} = require("../utils/uuid");
const collection = "user";

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
const addUser = async value => {
    const data = {
        uuid: generateUuid(),
        userId: value.profile.nickname,
        createdAt: new Date().toISOString(),
        googleId: value.profile.id,
        displayName: value.profile.displayName,
        nickname: value.profile.nickname,
        picture: value.profile.picture,
        locale: value.profile.locale,
    };
    const user = await listUser(value.profile.nickname);
    if (user && (user.nickname === value.profile.nickname)) {
        console.log("User already exists");
        return;
    }
    return await insert(collection, data).catch(err => ({error: err, message: "Is not possible to insert"}));
};

const listUsers = async () => {
    return await findAll(collection).catch(err => ({error: err, message: "Is not possible to find all users"}));
};

const listUser = async nickName => {
    return await findOne(collection, {nickName}).catch(err => ({error: err, message: "Is not possible to find one user"}));
};

const listUserAndUpdate = async (uuid, data) => {
    data.updatedAt = new Date().toISOString();
    return await findOneAndUpdate(collection, {uuid}, data).catch(err => ({error: err, message: "Is not possible to find one and update a user"}));
};

const listUserAndDelete = async uuid => {
    return await findOneAndDelete(collection, {uuid}).catch(err => ({error: err, message: "Is not possible to find one and delete a post"}));
};

module.exports = {
    addUser,
    listUsers,
    listUser,
    listUserAndUpdate,
    listUserAndDelete,
};