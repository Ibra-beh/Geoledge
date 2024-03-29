
module.exports = function (app, connection) {

    ////////////// VIEW ACCOUNT API Start //////////////
    app.get('/api/viewAccount', (req, res) => {
        // SENDS BACK TO CLIENT: STATUS 

        // Checking to see if the user is logged in
        let username = req.username;
        
        if (username == null) {
            // Client is not logged in
            res.status(401).send({ "status":"client not logged" });
        } else {
            // Fetching account details from SQL
            let promise = new Promise(function(resolve) {
                let query = `SELECT username, games_played, wins, losses FROM users WHERE username = '${ username }'`;

                connection.query(query, (err, result) => {
                    if (err) {
                        // Error occurred when performing SQL query
                        console.log("ERROR GETTING USER ACCOUNT INFO:  " + err);
                        resolve(null);
                    } else {
                        // Reading SQL query results
                        if (result.length == 0) {
                            // No account under such username (very unusual result);
                            console.log("User attempted to get account information but failed (hacker?)");
                            res.status(401).send({ "status":"client not logged" });
                        } else {
                            // Account found and returning account with specified username
                            resolve(result[0]);
                        }
                    }
                });
            });

            promise.then((response) => {
                
                if (!(response == null)) {
                    // sending user account details to user
                    res.status(200).send({"username":response.username, "games_played": response.games_played, "wins": response.wins, "losses": response.losses });
                }
            });
        }
    });

    ////////////// VIEW ACCOUNT API End //////////////
}