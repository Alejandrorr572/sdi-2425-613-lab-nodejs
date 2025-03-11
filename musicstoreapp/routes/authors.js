module.exports = function (app) {

    app.get('/authors',function(req,res){

        let authors = [{
            "name":"Javier",
            "group":"Ayiyiyi",
            "role":"Trompetista"
        },{
            "name":"Germán",
            "group":"Orslok",
            "role":"Saxofonista"
        },{
            "name":"Padua",
            "group":"Kidd keo",
            "role":"Cantante"
        }];

        let response = {
            seller:'Autores',
            authors: authors
        };

        res.render("authors/authors.twig",response);

    });

    app.get('/authors/add',function(req,res){
        let roles = [{
            "value":"Cantante",
            "name":"Cantante"
        },{
            "value":"Trompetista",
            "name":"Trompetista"
        },{
            "value":"Violinista",
            "name":"Violinista"
        },{
            "value":"Saxofonista",
            "name":"Saxofonista"
        },{
            "value":"Pianista",
            "name":"Pianista"
        }];

        let response = {
            roles: roles
        };

        res.render("authors/add.twig",response);
    });

    app.post('/authors/add', function (req, res) {
        let name = req.body.name;
        let group = req.body.group;
        let role = req.body.role;

        let response = '';

        response += (name != null) ? 'Nombre: ' + name + '<br>' : 'Nombre no definido' + '<br>';
        response += (group != null) ? 'Grupo: ' + group + '<br>' : 'Grupo no definido' + '<br>';
        response += (role != null) ? 'Rol: ' + role + '<br>' : 'Rol no definido' + '<br>';

        res.send(response);
    });

    app.get('/authors/filter/:role', function (req, res) {
        let authors = [
            { "name": "Javier", "group": "Ayiyiyi", "role": "Trompetista" },
            { "name": "Germán", "group": "Orslok", "role": "Saxofonista" },
            { "name": "Padua", "group": "Kidd Keo", "role": "Cantante" },
            { "name": "Luis", "group": "Random Band", "role": "Trompetista" }
        ];

        let filteredAuthors = authors.filter(author => author.role.toLowerCase() === req.params.role.toLowerCase());

        let response = {
            seller: 'Autores filtrados',
            authors: filteredAuthors
        };

        res.render("authors/authors.twig", response);
    });

    app.get('/author*', function (req, res) {
        res.redirect('/authors');
    });
}