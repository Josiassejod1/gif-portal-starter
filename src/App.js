import twitterLogo from "./assets/twitter-logo.svg";
import mvc2Logo from "./assets/mvc2_logo.png";
import "./App.css";
import { TEST_DATA } from "./assets/shared/const";
import React, { useEffect, useState } from "react";
import idl from './idl.json';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';

const { SystemProgram, Keypair } = web3;

let baseAccount = Keypair.generate();

const programId = new PublicKey(idl.metadata.address);

const network = clusterApiUrl('devnet');

const opts = {
  preflightCommitment: "processed"
}

// Constants
const TWITTER_HANDLE = "_buildspace";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  const [walletAddress, setAddress] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [characterList, setCharacterList] = useState([]);

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection, window.solana, opts.preflightCommitment
    );

    return provider;
  }

  const renderNotConnectedContainer = () => {
    return (
      <button
        className="cta-button connect-wallet-button"
        onClick={connectWallet}
      >
        Connect Wallet
      </button>
    );
  };

  const connectWallet = async () => {
    const { solana } = window;

    if (solana) {
      const response = await solana.connect();
      console.log("Connected with Public Key:", response);
      setAddress(response.publicKey.toString());
    }
  };

  const onInputChange = (event) => {
    const { value } = event.target;
    setInputValue(value);
  }

  const sendGif = async () => {
    if (inputValue.length > 0 ) {
      setCharacterList([...characterList, inputValue]);
      console.log('hero name', inputValue);
    } else {
      console.log("Empty input. Try again");
    }
  }

  const renderConnectedContainer = () => {
    if (characterList === null) {
      return(
        <div className="connected-container">
          <button className="cta-button submit-gif-button" onClick={createHeroAccount}>
          Do One-Time Initialization For GIF Program Account
         </button>
        </div>
      )
      } else {
        return (
          <div className="connected-container">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                sendGif();
              }}
            >
              <input
                type="text"
                placeholder="Search For Your Favorite Hero"
                style={{ backgroundColor: "white" }}
                onInputChange={onInputChange}
                value={inputValue}
              />
              <button type="submit" className="cta-button submit-gif-button">
                Submit
              </button>
            </form>
            <div className="gif-grid">
              {characterList?.map((image) => (
                <div className="gif-item" key={image}>
                  <img src={image} alt={image} width="100" height="100" />
                </div>
              ))}
            </div>
          </div>
        );
      }
  };

  const createHeroAccount = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programId, provider);
      console.log("ping");
      
      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount]
      });

      console.log("Created a new BaseAccount w/ address:", baseAccount.pub);
      await getHeroList();
    } catch(error) {
      console.log("Error creating BaseAccount account!", error);
    }
  }

  const connectButton = async () => {
    const { solana } = window;

    try {
      if (solana) {
        if (solana.isPhantom) {
          console.log("Phantom wallet found!");

          const response = await solana.connect();
          console.log(
            "Connected with Public Key:",
            response.publicKey.toString()
          );
          setAddress(response.publicKey.toString());
        } else {
          alert(
            "Solana wallet not detected. Might want to get a Phantom Wallet"
          );
        }
      }
    } catch (error) {
      console.log("Can't connect to wallet");
    }
  };

  const getHeroList = async() => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programId, provider);
      const account = await program.account.baseAccount;

      console.log("Get the account", account);
      setCharacterList(account.gifList);
    } catch(error) {
      console.log("Error is hero List: ", error);
      setCharacterList([]);
    }
  }

  useEffect(() => {
    const onLoad = async () => {
      await connectButton();
    };

    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  useEffect(() => {
    if (walletAddress) {
      console.log("Fetching Heros  ...");
      getHeroList();
    }
  }, [walletAddress]);

  return (
    <div className="App">
      <div className={walletAddress ? "authed-container" : "container"}>
        <div className="header-container">
          <img src={mvc2Logo} width="250" height="150" />
          <p className="header">Hero Head Shots</p>
          <p className="sub-text">
            View your Hero collection in the metaverse ✨
          </p>
          {!walletAddress && renderNotConnectedContainer()}
          {walletAddress && renderConnectedContainer()}
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
