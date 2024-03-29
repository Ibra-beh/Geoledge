// https://stackoverflow.com/questions/33946972/how-to-split-node-js-files-in-several-files/33947204#33947204
// promise multiple sql https://medium.com/swlh/dealing-with-multiple-promises-in-javascript-41d6c21f20ff
// promise w3schools
module.exports = function (app, connection) {
    /* ==============  API DESCRIPTIONS  ==============
        1. createLobby
            - description:
                - sets up lobby on dbo.
                - host added to participents.
                - returns session_id
        2. joinLobby
            - description:
                - guest user joins via code
        3. getLobbyPlayers
            - description:
                - returns participents where session_id
        4. getSessionID
            - description:
                - returns session_iD where user
        5. startGame
            - description:
                - creates country_set
                - writes game configs to dbo 
    */

    //==================   FUNCTIONS   ====================
    function RemoveFromParts(userID, sessionID, res) {
        let query = "call remove_a_participent(?,?)";
        connection.query(query, [userID, sessionID], (err, result) => {
            if (err) {
                console.log("ERROR WHEN REMOVING PARTS: " + err);
                res.status(500).send({ status: "Server side error" });
            }
        });
    }

    function RemoveFromPartsPromise(userID, sessionID) {
        let promise = new Promise(function(resolve, reject) {
            let query = "call remove_a_participent(?,?)";
            connection.query(query, [userID, sessionID], (err, result) => {
                if (err) {
                    console.log("ERROR WHEN REMOVING PARTS: " + err);
                    reject(null);
                } else {
                    resolve();
                }
            });
        });
        return promise;
    }

    function NewHost(sessionID, res) {
        let promise = new Promise(function(resolve, reject) {
            let query = "call select_parts(?)";
            connection.query(query, [sessionID], (err, result) => {
                if (err) {
                    console.log("ERROR WHEN SELECTING PARTS: " + err);
                    reject(null);
                } else {
                    resolve(result);
                }
            });
        });

        promise.then(
            function(result) {
                if (result[0].length == 0) {
                    console.log("no participents in session")
                    let query = "call expire_session(?)";
                    connection.query(query, [sessionID], (err, result) => {
                        if (err) {
                            console.log("ERROR WHEN ASSIGNING NEW HOST: " + err);
                            res.status(500).send({ status: "Server side error" });
                        } else {
                           console.log(`Session ${sessionID} was expired since it had no more players`);
                        }
                    });
                } else {
                    console.log("participents in session")
                    console.log(result)
                    let newHostID = result[0][0].user_id
                    let query = "call new_host(?,?)";
                    connection.query(query, [newHostID, sessionID], (err, result) => {
                        if (err) {
                            console.log("ERROR WHEN ASSIGNING NEW HOST: " + err);
                            res.status(500).send({ status: "Server side error" });
                        } else {
                            console.log(`New host was assigning to previous game: ${sessionID}`);
                        }
                    });
                }
            }
            , function(reject) {
                console.log("sql error")
            }
        )
    }

    function getPrevSessionIDPromise(userID) {
        let promise = new Promise(function(resolve, reject) {
            // Gets sessionID the user was in, if he was in one
            let query = "call select_curr_session(?)";
            connection.query(query, [userID], (err, result) => {
                if (err) {
                    console.log("Couldn't get the previous session ID: " + err);
                    reject(null);
                } else {
                    resolve(result);
                }
            });
        });
        return promise;
    }

    function join(userID, sessionID, res) {
        let query = "call join_lobby(?,?)"
        connection.query(query, [userID, sessionID], (err, result) => {
            if (err) {
                console.log("sql broken: " + err)
                res.status(500).json({ "status": "error occurred on the server" });
            } else {
                res.status(200).json({ "status": 'participent added' });
            }
        })
    }
    // ====================   API   =======================
    app.get('/api/checkLoggedIn', (req, res) => {
        if (req.loggedIn == "true") {
            res.status(200).send({ status:"User is logged in.", username: req.username });
        } else {
            res.status(401).send({ status: "Error: User is unauthorised/not logged in. Try logging in." });
        }
    });

    app.post('/api/createLobby', (req, res) => {
        let userID = req.userID

        let promise = getPrevSessionIDPromise(userID);
        promise.then(
            function(result) {
                if (result[0].length == 0) {
                    console.log("user was not in a previous session")
                    let query = "call create_lobby(?)";
                    connection.query(query, [userID], (err, result) => {
                        if (err) {
                            console.log("sql broken: " + err);
                            res.status(500).json({ "status": "Server side error" })
                        } else {
                            let sessionID = result[1][0].id
                            res.status(200).json(
                                {
                                    "status": "Lobby Created Successfully?",
                                    "id": sessionID
                                })
                        }
                    });
                } else {   
                    console.log("user was in a previous session")
                    let prevSessionID = result[0][0].session_id
                    let host_user = result[0][0].host_user
                    
                    let myPromise = new Promise(function(myResolve, myReject) {
                        // assign new host if you were prev sessn's host
                        if (host_user == userID) {
                            let promise1 = RemoveFromPartsPromise(userID, prevSessionID)
                            promise1.then(
                                function() {
                                    NewHost(prevSessionID, res)
                                    myResolve()
                                }
                                , function() {
                                    myReject()
                                }
                            )
                        } else {
                            RemoveFromParts(userID, prevSessionID, res)
                            myResolve()
                        }
                    });

                    myPromise.then(
                        function() {
                            let query = "call create_lobby(?)";
                            connection.query(query, [userID], (err, result) => {
                                if (err) {
                                    console.log("sql broken: " + err);
                                    res.status(500).json({ "status": "Server side error" })
                                } else {
                                    let sessionID = result[1][0].id
                                    res.status(200).json(
                                        {
                                            "status": "Lobby Created Successfully?",
                                            "id": sessionID
                                        })
                                }
                            });
                        }
                        , function(error) {
                            res.status(500).json({ "status": "Server side error" })
                        }
                    )
                }
            }
            , function(error) {
                res(500).send({ "status": "Server side error."})
            }
        )
    });

    function joinAfterChecks(userID, sessionID, res) {
        // Checking to see if session is full
        let promise = new Promise(function(resolve, reject) {
            let query = "call check_if_session_is_full(?)"
            connection.query(query, [sessionID], (err, result) => {
                if (err) {
                    console.log("ERROR WHEN CHECKING IF SESSION IS FULL: " + err);
                    reject(null);
                } else {
                    resolve(result);
                }
            });
        });

        promise.then(
            function(result) {
                if (result[0].length == 0) {
                    // no such sessionID exists
                    res.status(200).json({ "status": "no such sessionID exists" });
                } else {
                    if (result[0][0].num_of_participents < result[0][0].max_participents) {
                        // the session is not full. check if session expired
                        if (result[0][0].expired == 1) {
                            res.status(401).json({ "status": "session has expired" });
                        } else {
                            // adding client to session
                            join(userID, sessionID, res);
                        }
                    } else {
                        // the session is full
                        res.status(200).json({ "status": "session is full" });
                    }
                }
            },

            function(reject) {
                // SQL error when checking if session is full
                console.log("sql broken: " + reject)
                res.status(200).json({ "status": "error occurred on the server" });
            }
        );
    }

    app.get('/api/joinLobby', (req, res) => {
        let userID = req.userID;
        let sessionID = req.query.sessionID;
        if (req.userID == null) {
            res.status(401).json({ "status": "Unable to join game: User is not logged in." })
        } else {
            let promise = getPrevSessionIDPromise(userID);
            promise.then(
                function(result) {
                    if (result[0].length == 0) {
                        console.log("user was not in a previous session")
                        joinAfterChecks(userID, sessionID, res);
                    } else {   
                        console.log("user was in a previous session")
                        let prevSessionID = result[0][0].session_id
                        let host_user = result[0][0].host_user
                        
                        let myPromise = new Promise(function(myResolve, myReject) {
                            // assign new host if you were prev sessn's host
                            if (host_user == userID) {
                                let promise1 = RemoveFromPartsPromise(userID, prevSessionID)
                                promise1.then(
                                    function() {
                                        NewHost(prevSessionID, res)
                                        myResolve()
                                    }
                                    , function() {
                                        myReject()
                                    }
                                )
                            } else {
                                RemoveFromParts(userID, prevSessionID, res)
                                myResolve()
                            }
                        });
    
                        myPromise.then(
                            function() {
                                joinAfterChecks(userID, sessionID, res);
                            }
                            , function(error) {
                                res.status(500).json({ "status": "Server side error" })
                            }
                        )
                    }
                }
                , function(error) {
                    res.status(500).send({ "status": "error occurred on the server" });
                }
            )
        }
    });

    app.get('/api/getLobbyPlayers', (req, res) => {
        let sessionID = req.query.sessionID ;
        let query = "call get_lobby_players(?)"

        if (sessionID == undefined) {
            res.status(410).send("Invalid sessionID");
        } else {

            connection.query(query, [sessionID], (err, result) => {
                if (err) {
                    console.log("sql broken: " + err)
                    res.status(500).send(err);
                } else {
                    if (result[0][0] == null) {
                        res.status(500).send("lobby players is empty or doesn't exist");
                    } else {
                        res.status(200).send({ players: result[0]});
                    }
                }
            })
        }
    });

    app.get('/api/getSessionID', (req, res) => {
        let user_id = req.userID;
        if (user_id != null) {
            let query = `call get_curren_session_id(?)`
            connection.query(query,[user_id], (err, result) => {
                if (err) {
                    console.log("sql broken: " + err)
                    res.status(500).send(err);
                } else {
                    //console.log( result[1][0].session_id)
                    res.status(200).send( result[1][0] );
                }
            })
        } else {
            res.status(500).send("you're not logged in.");
        }
    })

    http://localhost:5000/api/SubmitGameSettings?session_id=&=107&num_of_questions=10&max_guesses=10&time_limit=6
    app.post('/api/SubmitGameSettings', (req, res) => {
        let sessionID = req.query.sessionID ;
        let num_of_questions = req.query.num_of_questions;
        let countries;
        let quiz_id;
        let max_guesses = req.query.max_guesses;
        let time_limit = req.query.time_limit;
        console.log(time_limit)


        // Country Set Creation:
        let myPromise = new Promise(function(myResolve, myReject) {
            let query =`SELECT quiz_id FROM session WHERE session_id=${sessionID};`
           // console.log(query);
            connection.query(query, (err, result) => {
                if (err) {
                    myReject(err);
                } else {
                    console.log(result);
                    myResolve(result); // pass quiz_id to next promise
                }
            })
        });
        myPromise.then(
            function (result) {
                quiz_id = result[0].quiz_id
                let myPromise = new Promise(function (myResolve, myReject) {
                    let query = `SELECT country_id FROM geo2002.country where population >= 36910558 order by rand();`
                    connection.query(query, (err, result) => {
                        if (err) {
                            res.status(500).send("Failed to select all country ids");
                            myReject(err);
                        } else {
                            myResolve(result); // pass countries to next promise
                        }
                    })
                });
                myPromise.then(
                    function (result) {
                        countries = result;
                        for (let i = 0; i < num_of_questions; i++) {
                            let country_id = countries[i].country_id;
                            let query = `INSERT INTO country_set (country_id, quiz_id, question_no) VALUES ('${country_id}', ${quiz_id}, ${i + 1});`
                            connection.query(query, (err) => {
                                if (err) {
                                    res.status(500).send("Failed to create country set");
                                }
                            });
                        }
                    }, function(error){console.log(error)}
                );
            }, function(error){console.log(error)}
        );

        // Game Config:
        let query = "call game_config(?,?,?,?)"
        connection.query(query, [sessionID, max_guesses, time_limit, num_of_questions], (err, result) => {
            if (err) {
                console.log("sql broken: " + err)
                res.status(500).send(err);
            }
        })

        res.status(200).send("Ready to start game");
    });

    app.get('/api/LobbyValidation', (req, res) => {
        let sessionID = req.query.sessionID;
        let userID = req.userID;
        let query = `select * from session where session_id=${sessionID}`
        connection.query(query, (err, session) => {
            if (err) {
                console.log("sql broken: " + err)
                res.status(500).send(err);
            } else {
                // sql returns [] -> no ID exists.
                if (session.length == 0) { 
                    res.status(401).send(
                        { status: "Incorrect lobby code. Session ID does not exist. Please check the session ID was entered correctly" }
                    );
                } else {
                    // flags: user not host, session expired, state not waiting
                    if (userID != session[0].host_user) {
                        res.status(401).send(
                            { status: "User is not the host of this session" }
                        );
                    } else if (session[0].expired == 1) {
                        res.status(401).send(
                            { status: "The lobby you are trying to access has expired. Please check the session ID was entered correctly" }
                        );
                    } 
                    else if (session[0].game_state != "waiting for players") {
                        res.status(401).send(
                            { status: "The lobby you are trying to access is in an invalid state. Please check the session ID was entered correctly" }
                        );
                    } 
                    else {
                        res.status(200).send(
                            { status: "Lobby Verification Successful" }
                         );
                    }
                }
            }
        })
    })
}