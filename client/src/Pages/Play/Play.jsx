import React from 'react';
import { useState } from 'react';
import button from 'react-bootstrap/button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import "./Play.css";
import { Link } from 'react-router-dom';


function Play(){
  const[NumberOfRounds, setNOR] = useState(0)
  const[TimePerRound, setTPR] = useState(0)
  const[Players, setPlayers] = useState([]);
  const [No, setNo] = useState(0)

  const changeNOR = (event) => {
    setNOR(event.target.id);
  };

  const changeTPR = (event) => {
    setTPR(event.target.id);
  }
  
  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Number of Rounds:', NumberOfRounds, 'Time per Round', TimePerRound);
  };
  return (
  <div >
  <div class="lob">
  <h1>LOBBY</h1>
  </div>
  <div class="row">
    <div class="col-md-8">
    <table class = "table">
        <thead> <tr> <th>no:</th><th>Player</th></tr></thead>
        <tbody>
          <tr><td>{No}</td></tr>
        </tbody>

      </table>
    </div>
    <div class="col-md-4">
      <div class="settingscontainer">

        <div class="settings">
          <h2 class="h2"> Settings </h2>
          <div>
            
              <h3>Number Of Rounds</h3>
              <ButtonGroup> 
                <button class="styledbutton2" id="1" onClick={changeNOR}>1</button><button class="styledbutton2" id="2" onClick={changeNOR}>2</button><button class="styledbutton2" id="3" onClick={changeNOR}>3</button>
                <button class="styledbutton2" id="4" onClick={changeNOR}>4</button><button class="styledbutton2" id="5" onClick={changeNOR}>5</button><button class="styledbutton2" id="6" onClick={changeNOR}>6</button>
                <button class="styledbutton2" id="7" onClick={changeNOR}>7</button><button class="styledbutton2" id="8" onClick={changeNOR}>8</button><button class="styledbutton2" id="9" onClick={changeNOR}>9</button>
                <button class="styledbutton2" id="10" onClick={changeNOR}>10</button>
              </ButtonGroup>

              <h3>Time Per Round </h3>
              <ButtonGroup className="me-2" aria-label="Second group">
                
                
                <button class="styledbutton2" id="15" onClick={changeTPR}>15s</button><button class="styledbutton2" id="30" onClick={changeTPR}>30s</button><button class="styledbutton2" id="45" onClick={changeTPR}>45s</button>
                <button class="styledbutton2" id="60" onClick={changeTPR}>60s</button>
              </ButtonGroup>
 
          </div> <Link to='../JoinLobby'>    
          <form onSubmit={handleSubmit}>
         
          <button class='styledbutton3'>Play</button>  
          
          </form></Link>
        </div>
    
      </div>
    </div>
  </div>
  </div>
  );
};

export default Play;

