module.exports = function (app, connection) {
    /* ==============  INFORMATION ON GAME_STATE  ==============
       Game states held by game_state:
            1. "waiting for players"
            2. "starting game"
            3. "displaying question"
            4. "revealing answer"
            5. "showing current scores"
            6. "starting next question"
            7. "Showing final scores"


            Start game api: 1, 2, 3, 4, 5 or 7
            Next question api: 5, 6, 3, 4, 5 or 7
    
    */

    

    // http://localhost:5000/api/startGame?sessionID=35

    // =================   FUNCTIONS   ====================
    function startGame(res, sessionID) {
        // Function that starts the game for the given session
        let promise = new Promise(function (resolve) {
            let query = `UPDATE session SET game_state = "displaying question" WHERE session_id = "${ sessionID }"`;
            
            connection.query(query, (err, result) => {
                if (err) {
                    console.log("ERROR: Error when changing game_state from 'starting' to 'displaying question'");
                    res.status(500).send("Error occured on the server");
                }
                resolve();
            })
        });
        
        promise.then(function (result) {
            // Waiting for question to end
            let promise2 = new Promise(function (resolve) {
                let query = `SELECT time_limit, current_question FROM geo2002.session WHERE session_id = "${ sessionID }"`;

                connection.query(query, (err, result) => {
                    if (err) {
                        console.log("ERROR: Error when getting time limit for session");
                        res.status(500).send("Error occured on the server");
                        resolve(100);
                    }
                    else {
                        resolve(result);
                    }
                })
            });
    
            promise2.then( 
                function (result) {
                    setTimeout(function() { roundEnd(res, sessionID, result[0].current_question) }, result[0].time_limit * 1000);
                }
            );
        });
    }

    function roundEnd(res, sessionID, current_question) {
        // if game_state still in "displaying question", and question number remains the same, then change game_state to "displaying answer"
        let promise = new Promise(function(resolve) {
            let query = `SELECT game_state, current_question FROM geo2002.session WHERE session_id = "${ sessionID }"`;

            connection.query(query, (err, result) => {
                if (err) {
                    console.log("Error when trying to get game state: " + err);
                    resolve(false);
                } else {
                    if (result.length != 0) {
                        if (result[0].game_state == "displaying question" && result[0].current_question == current_question) {
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    }
                }
            });
        });

        promise.then(function(result) {
            if (result) {
                // Switching game state from "displaying question" to "revealing answer"
                let query = `UPDATE session SET game_state = "revealing answer" WHERE session_id = "${ sessionID }"`;

                connection.query(query, (err, result) => {
                    if (err) {
                        console.log("ERROR: Error when changing game_state from starting to displaying question");
                        res.status(500).send("Error occured on the server");
                    } else {
                        res.status(200).send("OK");
                    }
                })
            } else {
                res.status(200).send("OK");
            }
        });
    }
    

    // ====================   API   =======================
    app.get('/api/startGame', (req, res) => {
        // Getting userID of host
        let userID = req.userID
        let sessionID = req.query.sessionID;

        
        
        // 1. SQL query to check if client is the host of the session
        // 2. If yes, update game_state, and then start countdown


        if (sessionID != undefined) {
            // Checking if client is the host of the lobby
            let promise = new Promise(function(resolve, reject) {
                let query = "call validate_host_in_session(?,?)";

                connection.query(query, [userID, sessionID], (err, result) => {
                    if (err) {
                        // Error occurred when performing SQL query
                        console.log("ERROR: Error occured when trying to match userId and sessionID using SQL query");
                        reject("SQL error");
                    } else {
                        // Evaluating result
                        connection.query("call initialise_Values_On_Round_Start(?)", [sessionID], (err) => {
                            if (err) {
                                console.log("Couldn't Initialize Participant Round Limits: " + err)
                                res.status(500).send("Error occured on the server - Couldn't Initialize Participant Round Limits");
                            }
                        })
                        resolve(result[0][0].result);
                    }
                });
            });

            promise.then(
                function(result) {
                    // Evaluating result found
                    if(result == 1) {
                        // Client is found to be the host of the session
                        // Changing the game_state

                        let promise2 = new Promise(function(resolve, reject) {
                            let query2 = `UPDATE session SET game_state = "starting game" WHERE session_id = "${ sessionID }"`;

                            connection.query(query2, (err, result) => {
                                if (err) {
                                    // Error occurred when performing SQL query
                                    console.log("ERROR: Error when changing game_state from waiting to starting");
                                    reject("SQL error");
                                } else {
                                    // SQL query successful
                                    resolve();
                                }
                            });
                        });

                        promise2.then(function() {
                            // Game state changed from "waiting" to "starting"
                            // Starting countdown for the game to start
                            setTimeout(function() { startGame(res, sessionID) }, 5000);     // 5s timer
                        },
                        function() { 
                            // Error when attempting to change the game state. Informing the client of this error
                            res.status(401).send("Session could not be started");
                        });


                    } else {
                        // Client is not the host of the session (or sessionID does not not exist)
                        res.status(401).send("Unauthorised request");
                    }

                },
                function(error) {
                    // Error occurred in SQL query (likely server-side error). Informing client of this error
                    res.status(500).send("Error occured on the server");
                }
            )

        } else {
            res.status(401).send({ "status": "invalid sessionID"} );
        }

    });

}