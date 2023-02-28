module.exports = function (app, connection) {
    app.get('/api/leaderboards', function (req, res) {
        // SELECT username, games_played, wins, losses FROM geo2002.users ORDER BY wins ASC LIMIT 50;
        
        // Getting sort order defined by client
        let sort = req.query.sort;
        let query = "";

        if (sort == "wins") {
            // sorted by wins
            query = `SELECT username, games_played, wins, losses, win_rate FROM geo2002.users ORDER BY wins ASC LIMIT 50;`;

        } else if (sort == "gamesPlayed") {
            // sorting by no of wins
            query = `SELECT username, games_played, wins, losses, win_rate FROM geo2002.users ORDER BY games_played ASC LIMIT 50;`

        } else if (sort == "winRate") {
            // sorting by win rate
            query = `SELECT username, games_played, wins, losses, win_rate FROM geo2002.users ORDER BY win_rate ASC LIMIT 50;`
        }

        // if query empty, sort invalid
        if (query == "") {
            // invalid query
            res.status(401).send({ "status": "sort invalid"} );
        } else {
            // performing sql query
            let promise = new Promise(function(resolve) {
                connection.query(query, (err, result) => {
                    if (err) {
                        // Error occurred when performing SQL query
                        console.log("ERROR CHECKING IF USERNAME TAKEN: " + err);
                        resolve(null);
                    }
                    // Evaluating result
                    resolve(result[0].result);
                });
            });

            promise.then((response) => {
                
            });
        }

        // Evaluating SQL query
    });
}