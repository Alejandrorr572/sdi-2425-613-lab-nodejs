module.exports = {
    mongoClient: null,
    app: null,
    database: "musicStore",
    collectionName: "favorite_songs",
    init: function (app, dbClient) {
        this.dbClient = dbClient;
        this.app = app;
    },insertFavorite: function (favorite, callbackFunction) {
        this.dbClient.connect()
            .then(() => {
                const database = this.dbClient.db(this.database);
                const favoritesCollection = database.collection(this.collectionName);

                return favoritesCollection.insertOne(favorite);
            })
            .then(result => {
                this.dbClient.close();
                callbackFunction({ favoriteId: result.insertedId });
            })
            .catch(err => {
                this.dbClient.close();
                callbackFunction({ error: err.message });
            });
    },getFavorites: async function (filter, options) {
        try {
            await this.dbClient.connect();
            const database = this.dbClient.db(this.database);
            const favoritesCollection = database.collection(this.collectionName);
            const favorites = await favoritesCollection.find(filter, options).toArray();
            return favorites;
        } catch (error) {
            throw (error);
        }
    }, deleteFavorite: async function (filter) {
        try {
            await this.dbClient.connect();
            const database = this.dbClient.db(this.database);
            const favoritesCollection = database.collection(this.collectionName);
            const result = await favoritesCollection.deleteOne(filter);
            return result.deletedCount > 0;
        } catch (error) {
            throw error;
        }
    }
}