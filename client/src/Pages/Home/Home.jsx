import React from 'react';
import "./Home.css";
import Play from '../Play/Play';

const About = () => {


    // Search for online game
    function findOnlineGame() {
        fetch('/api/checkLoggedIn', { method: "GET" }).then((res) => res.json).then((res) => {
            if (res.status === 401) {
                // redirecting client to login page
                window.location.href = "/#/Log-in";
            } else {
                //Finding an online game to join
                fetch('/api/joinOnlineGame', { method: "GET" }).then(res => res.json()).then((res) => {
                    if (res.status == "sessionID found") {
                        let sessionID = res.sessionID;
                        console.log(sessionID);

                        fetch(`/api/joinLobby?session_id=${sessionID}`, { method: "GET" }).then(res => res.json()).then((res) => {
                            console.log(res);
                            window.location.href = "/#/Game";
                        });

                    } else if (res.status == "no avaiable sessions") {
                        // Show error message to user

                    } else if (res.status == "error occurred on the server") {
                        // Show error message to user
                    }
                });
            }
        });
    }

    // Host Game: Create Lobby
    function HostLobby() {
        fetch('/api/checkLoggedIn', { method: "GET" }).then((res) => {
            if (res.status === 401) {
                window.location.href = "/#/Log-in";
            } else {
                fetch('/api/createLobby', { method: "POST" }).then(res => res.json()).then(stateJson => {
                    let sessionID = stateJson.id
                    window.location.href =(`#/Play/${sessionID}`);
                })
            }
        })
    }


    return (
        <div>
            <div>

            </div>
            <div className="column">
                <div className="top">
                    <div className="row-md-8">
                        <div className='home-headers'>
                            <h1>GEOLEDGE</h1>
                            <h2>Prepared to test your geographical knowledge?</h2>
                        </div>
                        <div className="btns">
                        <button className="styledbutton" onClick={HostLobby}> Host Game</button>
                            <button className="styledbutton" onClick={findOnlineGame}> Play Online</button>
                            <a className="styledbutton" href='./#/join-lobby'> Join Game</a>
                        </div>
                    </div>
                </div>
                <div className="bottom">
                    <div className="row-md-12">
                        <h1>What Is Geoledge?</h1>
                        <p>Geoledge is an online quiz-type game.</p>
                        <p>Each round you will be given a list of facts describing a mystery country.</p>
                        <p>Will you be able to pinpoint the coutnry based on these facts?</p>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default About;