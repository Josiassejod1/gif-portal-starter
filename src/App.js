import twitterLogo from './assets/twitter-logo.svg';
import mvc2Logo from './assets/mvc2_logo.png';
import './App.css';
import React, { useEffect, useState } from 'react';

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  const [walletAddress, setAddress] = useState(null);

  const renderNotConnectedContainer = () => {
    <button
    className="cta-button connect-wallet-button"
    onClick={connectWallet}>
        Connect Wallet
    </button>
  }

  const connectWallet = async () => {
    const { solana } = window;

    if (solana) {
      const response = await solana.connect();
      console.log("Connected with Public Key:", response);
      setAddress(response.publicKey.toString());
    }
  }

  const connectButton   = async ()  => {
    const { solana } = window;

    try {
        if (solana) {
          if (solana.isPhantom) {
            console.log('Phantom wallet found!');

            const response = await solana.connect();
            console.log(
              'Connected with Public Key:', response.publicKey.toString()
            );
            setAddress(response.publicKey.toString());
          } else {
            alert("Solana wallet not detected. Might want to get a Phantom Wallet")
          }
        }
    } catch(error) {
      console.log("Can't connect to wallet");
    }
  }

  useEffect(() => {
    const onLoad = async () => {
      await connectButton();
    };

    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);


  return (
    <div className="App">
      <div className={walletAddress ? 'authed-container' : 'container'} >
        <div className="header-container">
          <img src={mvc2Logo} width="250" height="150"/>
          <p className="header">Hero Head Shots</p>
          <p className="sub-text">
            View your Hero collection in the metaverse ✨
          </p>
          {!walletAddress && renderNotConnectedContainer()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
