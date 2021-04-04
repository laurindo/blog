const { MongoClient } = require("mongodb")
const {generateUuid} = require("../utils/uuid");

const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zcmnk.mongodb.net/blog-jornal-crypto?retryWrites=true&w=majority`;
const client = new MongoClient(url, {useUnifiedTopology: true});
const dbName = process.env.DB_NAME;

async function openConnection() {
    try {
         await client.connect();
         console.log("Connected correctly to database");
        } catch (err) {
            console.log(err.stack);
        }
     finally {
        //await client.close();
    }
}

async function closeConnection() {
    await client.close(); 
}

/**
 * 
 * @param {*} collection string
 * @param {*} data object
 * data example - People Collection
 * {
        "uuid": generateUuid(),
        "name": { "first": "Daniel", "last": "Turing" },
        "birth": new Date(1912, 5, 23), // June 23, 1912                                                                                                                                 
        "death": new Date(1954, 5, 7),  // June 7, 1954                                                                                                                                  
        "contribs": [ "Turing machine", "Turing test", "Turingery" ],
        "views": 1250000,
        "createdAt": new Date().toISOString()
    }
 */
const insert = async (collection, data, debug = process.env.DEBUG) => {
    // Use the collection "people"
    const col = client.db(dbName).collection(collection);
    // Insert a single document, wait for promise so we can read it back
    const result = await col.insertOne(data);
    // Find one document
    const myDoc = await col.findOne();
    // Print to the console
    debug ? console.log(myDoc) : null;
};

const findAll = async (collection, debug = process.env.DEBUG) => {
    try {
        // Use the collection "people"
        const col = client.db(dbName).collection(collection);
        // Insert a single document, wait for promise so we can read it back
        const result = await col.find({}).toArray();
        // Print to the console
        debug ? console.log(result) : null;
        return result;
    } catch (error) {
        return error;
    }
};

const findOne = async (collection, query = {}, debug = process.env.DEBUG) => {
    // Use the collection "people"
    const col = client.db(dbName).collection(collection);
    // Insert a single document, wait for promise so we can read it back
    const result = await col.findOne(query);
    // Print to the console
    debug ? console.log(result) : null;
    return result;
};

const findOneAndUpdate = async (collection, query = {}, data, debug = process.env.DEBUG) => {
    try {
        // Use the collection "people"
        const col = client.db(dbName).collection(collection);
        // Insert a single document, wait for promise so we can read it back
        const result = await col.findOneAndUpdate(query, {$set: data}, {upsert: false});
        // Print to the console
        debug ? console.log(result) : null;
        return result;
    } catch (error) {
        return error;
    }
};

const findOneAndDelete = async (collection, query = {}, debug = process.env.DEBUG) => {
    try {
        // Use the collection "people"
        const col = client.db(dbName).collection(collection);
        // Insert a single document, wait for promise so we can read it back
        const result = await col.findOneAndDelete(query);
        // Print to the console
        debug ? console.log(result) : null;
        return result;
    } catch (error) {
        return error;
    }
};

module.exports = {
    openConnection,
    closeConnection,
    insert,
    findAll,
    findOne,
    findOneAndUpdate,
    findOneAndDelete,
};