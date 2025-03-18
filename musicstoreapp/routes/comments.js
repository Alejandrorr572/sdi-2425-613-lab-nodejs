const { ObjectId } = require("mongodb");

module.exports = function (app, commentsRepository) {

    app.post('/comments/:id', function (req, res) {
        let songId = req.params.id;
        let user = req.session.user;
        let text = req.body.text;

        let comment = {
            songId: songId,
            author: user,
            text: text
        };

        commentsRepository.insertComment(comment, function (result) {
            if (result.error) {
                res.send("Error al guardar el comentario: " + result.error);
            } else {
                res.redirect('/songs/' + songId);
            }
        });
    });

    app.post('/comments/delete/:id', function (req, res) {
        let commentId = req.params.id;
        let user = req.session.user;

        let filter = { _id: new ObjectId(commentId), author: user };

        commentsRepository.deleteComment(filter)
            .then(deleted => {
                if (deleted) {
                    res.redirect('back');
                } else {
                    res.send("Error: No se pudo eliminar el comentario.");
                }
            })
            .catch(error => res.send("Error al eliminar el comentario: " + error));
    });

};
