module.exports = function (app, DBconnection) {

    // submit a guess, will return correct status and the stats of guess country and stats of answer country 
    app.get('/api/make_a_guess', (req, res) => {
        let user = "";
        let current_quiz_session = "";
        let user_verified = true;
        let answer_submitted = "AGO";
        //change to AFG to get a correct status

        if (!user_verified) {
            res.send({
                auth_status: user_verified
            });
        }

        DBconnection.query("call check_country_guess_correct(?,?,?)",
            [answer_submitted, user, current_quiz_session], function (error, results) {

                guess = results[0][0]
                actual_docted = results[1][0];
                status_of_correct = guess.country_id == actual_docted.country_id;

                delete actual_docted["country_name"];
                delete actual_docted["country_id"];
                delete actual_docted["map"];

                res.send({
                    auth_status: user_verified,
                    correct_status: status_of_correct,
                    guess_country: guess,
                    actual_country: actual_docted
                });
            })

    });

    app.get('/api/has_everyone_answered', (req, res) => {
        res.send({ status: false });
    });

}