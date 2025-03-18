const {ObjectId} = require("mongodb");
module.exports = function (app,favoriteSongsRepository, songsRepository) {

    app.get('/songs/favorites', function(req, res) {
        let filter = { user: req.session.user };

        favoriteSongsRepository.getFavorites(filter, {})
            .then(favorites => {
                let totalPrice = favorites.reduce((sum, song) => sum + parseFloat(song.price), 0);
                res.render("songs/favorites.twig", { favorites: favorites, totalPrice: totalPrice });
            })
            .catch(error => res.send("Error al obtener los favoritos: " + error));
    });

    app.post('/songs/favorites/add/:id', function (req, res) {
        let songId = req.params.id;
        let filter = {_id: new ObjectId(songId)};
        songsRepository.findSong(filter, {}).then(song => {

            let favorite = {
                songId: songId,
                title: song.title,
                price: song.price,
                user: req.session.user,
                dateAdded: new Date().toLocaleDateString('es-ES')
            };

            favoriteSongsRepository.insertFavorite(favorite, function (result) {
                if (result.error) {
                    res.send("Error al añadir a favoritos: " + result.error);
                } else {
                    res.redirect("/shop");
                }
            });

        }).catch(error => res.send("Error al buscar la canción: " + error));
    });

    app.post('/songs/favorites/delete/:id', function (req, res) {
        let songId = req.params.id;
        let filter = { songId: songId, user: req.session.user };

        favoriteSongsRepository.deleteFavorite(filter)
            .then(deleted => {
                if (deleted) {
                    res.redirect("/songs/favorites");
                } else {
                    res.send("Error: No se pudo eliminar la canción de favoritos.");
                }
            })
            .catch(error => res.send("Error al eliminar de favoritos: " + error));
    });
}