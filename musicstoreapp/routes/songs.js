const {ObjectId} = require("mongodb");
module.exports = function (app,songsRepository, commentsRepository) {

    app.get('/shop',function(req,res){
        let filter = {};
        let options = {sort: { title: 1}};
        if(req.query.search != null && typeof(req.query.search) != "undefined" && req.query.search != ""){
            filter = {"title": { $regex: ".*" + req.query.search + ".*", $options: "i" }};
        }

        songsRepository.getSongs(filter,options).then(songs => {
            res.render("shop.twig",{songs:songs});
        }).catch(error => {
            res.send("Se ha producido un error al listar las canciones"+error)
        });
    });

    app.get('/publications', function (req, res) {
        let filter = {author : req.session.user};
        let options = {sort: {title: 1}};
        songsRepository.getSongs(filter, options).then(songs => {
            res.render("publications.twig", {songs: songs});
        }).catch(error => {
            res.send("Se ha producido un error al listar las publicaciones del usuario:" + error)
        });
    })

    app.get('/songs/add', function (req, res) {
        res.render("songs/add.twig");
    });

    app.post('/songs/add', function (req, res) {
        let song = {
            title: req.body.title,
            kind: req.body.kind,
            price: req.body.price,
            author: req.session.user
        }
        songsRepository.insertSong(song,function (result){
            if (req.files != null) {
                let image = req.files.cover;
                image.mv(app.get("uploadPath") + '/public/covers/' + result.songId + '.png')
                    .then(() => {
                        //res.send("Agregada la canción ID: " + result.songId))
                        if (req.files.audio != null) {
                            let audio = req.files.audio;
                            audio.mv(app.get("uploadPath") + '/public/audios/' + result.songId + '.mp3')
                                .then(res.send("Agregada la canción ID: " + result.songId))
                                .catch(error => res.send("Error al subir el audio de la canción"))
                        }else {
                            res.send("Agregada la canción ID: " + result.songId)
                        }
                    })
                    .catch(error => res.send("Error al subir la portada de la canción"))
            } else {
                res.send("Agregada la canción ID: " + result.songId)
            }
        });
    });

    app.get('/songs/:id', function (req, res) {
        let songId = req.params.id;
        let filter = { _id: new ObjectId(songId) };
        let options = {};

        songsRepository.findSong(filter, options)
            .then(song => {
                if (!song) {
                    res.send("Canción no encontrada.");
                    return;
                }

                let commentsFilter = { songId: songId };
                return commentsRepository.getComments(commentsFilter, {})
                    .then(comments => {
                        res.render("songs/song.twig", { song: song, comments: comments });
                    });
            })
            .catch(error => {
                res.send("Se ha producido un error al buscar la canción: " + error);
            });
    });

    app.get('/songs/edit/:id',function(req,res){
        let filter = {_id: new ObjectId(req.params.id)};
        songsRepository.findSong(filter,{}).then(song=>{
            res.render("songs/edit.twig",{song:song});
        }).catch(error =>{
            res.send("Se ha producido un error al recuperar la canción "+ error)
        });
    });

    app.post('/songs/edit/:id', function (req, res) {
        let song = {
            title: req.body.title,
            kind: req.body.kind,
            price: req.body.price,
            author: req.session.user
        }
        let songId = req.params.id;
        let filter = {_id: new ObjectId(songId)};
        //que no se cree un documento nuevo, si no existe
        const options = {upsert: false}
        songsRepository.updateSong(song, filter, options).then(result => {
            //res.send("Se ha modificado "+ result.modifiedCount + " registro");
            step1UpdateCover(req.files, songId, function (result) {
                if (result == null) {
                    res.send("Error al actualizar la portada o el audio de la canción");
                } else {
                    res.send("Se ha modificado el registro correctamente");
                }
            });
        }).catch(error => {
            res.send("Se ha producido un error al modificar la canción " + error)
        });
    });

    function step1UpdateCover(files, songId, callback) {
        if (files && files.cover != null) {
            let image = files.cover;
            image.mv(app.get("uploadPath") + '/public/covers/' + songId + '.png', function (err) {
                if (err) {
                    callback(null); // ERROR
                } else {
                    step2UpdateAudio(files, songId, callback); // SIGUIENTE
                }
            });
        } else {
            step2UpdateAudio(files, songId, callback); // SIGUIENTE
        }
    }

    function step2UpdateAudio(files, songId, callback) {
        if (files && files.audio != null) {
            let audio = files.audio;
            audio.mv(app.get("uploadPath") + '/public/audios/' + songId + '.mp3', function (err) {
                if (err) {
                    callback(null); // ERROR
                } else {
                    callback(true); // FIN
                }
            });
        } else {
            callback(true); // FIN
        }
    }


    app.get('/promo*', function (req, res) {

        res.send('Respuesta al patrón promo*');
    });

    app.get('/pro*ar', function (req, res) {
        res.send('Respuesta al patrón pro*ar');
    });
};