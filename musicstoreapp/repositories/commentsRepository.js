module.exports = {
    mongoClient: null,
    app: null,
    database: "musicStore",
    collectionName: "comments",
    init: function (app, dbClient) {
        this.dbClient = dbClient;
        this.app = app;
    },getComments: async function (filter, options) {
        try {
            await this.dbClient.connect();
            const database = this.dbClient.db(this.database);
            const commentsCollections = database.collection(this.collectionName);
            const comments = await commentsCollections.find(filter, options).toArray();
            return comments;
        } catch (error) {
            throw (error);
        }
    }, insertComment: function (comment, callbackFunction) {
        this.dbClient.connect()
            .then(() => {
                const database = this.dbClient.db(this.database);
                const commentsCollections = database.collection(this.collectionName);
                commentsCollections.insertOne(comment)
                    .then(result => callbackFunction({commentId: result.insertedId}))
                    .then(() => this.dbClient.close())
                    .catch(err => callbackFunction({error: err.message}));
            })
            .catch(err => callbackFunction({error: err.message}))
    }, deleteComment: async function (filter) {
        try {
            await this.dbClient.connect();
            const database = this.dbClient.db(this.database);
            const commentsCollections = database.collection(this.collectionName);
            const result = await commentsCollections.deleteOne(filter);
            return result.deletedCount > 0;
        } catch (error) {
            throw error;
        }
    }

}