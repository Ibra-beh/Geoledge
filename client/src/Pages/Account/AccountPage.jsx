import React, { useEffect } from 'react';
import "./AccountPage.css";
import { useState } from 'react';


function ScoreBoard(){
  const [wins, setWins] = useState(0)
  const [GamePlayed,setGamePlayed ] =  useState(0)
  const [WinRate, SetWinrate] = useState(0)
  const [Account, SetAccount] = useState({})


  useEffect(() => {
    fetch('/country_name_list.json').then(res =>res).then(Account =>{
      SetAccount(Account);
    });
    }, []);


  return (<div className='wrapper'>
          <h1>My Account { JSON.stringify(Account)}</h1>
          <table>
          <thead>
          <tr>
              <th>Wins</th>
              <th>Game Played</th>
              <th>Win rate</th>
          </tr>
      </thead>
          <tbody><tr><td align="center">{wins}</td><td align="center">{GamePlayed}</td><td align="center">{WinRate}</td></tr></tbody>
      </table>
  </div>)
}

const About = () => {
  return (
    <div>
          <div>
            
            <ScoreBoard/>
          
          </div>
    </div>
 
  );
};

export default About;