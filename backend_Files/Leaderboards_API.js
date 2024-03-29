module.exports = function (app, connection) {
    app.get('/api/leaderboards', function (req, res) {
        // Getting sort order defined by client
        let sort = req.query.sort;
        console.log("SORT: " + sort);
        let query = "";

        if (sort == "wins") {
            // sorted by wins
            query = `SELECT username, wins as value FROM geo2002.users ORDER BY wins DESC LIMIT 50;`;

        } else if (sort == "gamesPlayed") {
            // sorting by no of wins
            query = `SELECT username, games_played as value FROM geo2002.users ORDER BY games_played DESC LIMIT 50;`

        } else if (sort == "winRate") {
            // sorting by win rate
            query = `SELECT username, win_rate as value FROM geo2002.users ORDER BY win_rate DESC LIMIT 50;`
        }

        // if query empty, sort invalid
        if (query == "") {
            // invalid query
            res.status(401).send({ "status": "sort invalid"} );

        // PERFORMING SQL QUERY OTHERWISE
        } else {
            // Performing sql query
            let promise = new Promise(function(resolve) {
                connection.query(query, (err, result) => {
                    if (err) {
                        // Error occurred when performing SQL query
                        console.log("ERROR CHECKING IF USERNAME TAKEN: " + err);
                        resolve(null);
                    }
                    // Evaluating result
                    resolve(result);
                });
            });

            // Evaluating SQL query
            promise.then((response) => {
                if (response == null) {
                    // SQL query failed. Informing client of this
                    res.status(401).send( { "status": "Could not get leaderboards"} );
                } else {
                    // Sending leaderboards back to client
                    res.status(200).send( {"leaderboards": response} );
                }
            });
        }
    });
}