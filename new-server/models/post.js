const {insert, findAll, findOne, findOneAndUpdate, findOneAndDelete} = require("../config/database");
const {generateUuid} = require("../utils/uuid");
const collection = "post";

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
const addPost = async value => {
    const data = {
        uuid: generateUuid(),
        createdAt: new Date().toISOString(),
        image: value.image,
        title: value.title,
        description: value.description,
        text: value.text,
        isActive: !!value.isActive,
        isHighlight: !!value.isHighlight,
        category: value.category,
        tags: value.tags || [],
    };
    return await insert(collection, data).catch(err => ({error: err, message: "Is not possible to insert"}));
};

const listPosts = async () => {
    return await findAll(collection).catch(err => ({error: err, message: "Is not possible to find all post"}));
};

const listPost = async uuid => {
    return await findOne(collection, {uuid}).catch(err => ({error: err, message: "Is not possible to find one post"}));
};

const listPostAndUpdate = async (uuid, data) => {
    data.updatedAt = new Date().toISOString();
    return await findOneAndUpdate(collection, {uuid}, data).catch(err => ({error: err, message: "Is not possible to find one and update a post"}));
};

const listPostAndDelete = async uuid => {
    return await findOneAndDelete(collection, {uuid}).catch(err => ({error: err, message: "Is not possible to find one and delete a post"}));
};

module.exports = {
    addPost,
    listPosts,
    listPost,
    listPostAndUpdate,
    listPostAndDelete,
};