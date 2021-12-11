import twitterLogo from "./assets/twitter-logo.svg";
import mvc2Logo from "./assets/mvc2_logo.png";
import "./App.css";
import { TEST_DATA } from "./assets/shared/const";
import React, { useEffect, useState, useRef } from "react";
import idl from './idl.json';
import Badge from '@material-ui/core/Badge';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';
import kp from './keypair.json';
import { min } from "bn.js";
import { set } from "@project-serum/anchor/dist/cjs/utils/features";
const { SystemProgram, Keypair } = web3;


const arr = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr)
const baseAccount = web3.Keypair.fromSecretKey(secret)

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
  const [mintedList, setMintList] = useState([]);
  const [characterFound, setCharacterFound] = useState(false);
  const [character, setCharacter] = useState(null);
  const [hash, setHash] = useState({});

  const inputRef = useRef();
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

  const onChange = (event) => {
    const { value } = event.target;
    setCharacter(null);
    setCharacterFound(false);
    setInputValue(value);
  }

  const onClick = () => {
    fetchCharacter();
  }

  const fetchCharacter = () => {
    console.log("Searching for characters ...")
    console.log(inputValue);
    fetch(`https://secure-hamlet-19722.herokuapp.com/api/v1/characters/${inputValue}`)
    .then(res => res.json())
    .then((result) => {
      if (result.length === 0) {
        setCharacterFound(false);
      } else {
        console.log(result);
        setCharacter(result[0]);
        setCharacterFound(true);
      }
    });
  }

  const sendGif = async () => {
    if (inputValue.length === 0) {
      console.log("No gif link given!");
      return
    }
    console.log("Gif Link:", character.head_shot);

    try {
      const provider = getProvider();
      const program = new Program(idl, programId, provider);

      await program.rpc.addGif(character.head_shot, {
        accounts:{
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        }
      });

      console.log("GIF successfully sent to program", inputValue, character.head_shot)
      await getHeroList();
    } catch(error) {
      console.log("Error sending GIF:", error);
    }

    setCharacter(null);
    setInputValue('');
    setCharacterFound(false);
    inputRef.current.value = '';
  }

  const getBadgeCount = (mintedList) => {

    mintedList.forEach((character) => {
        if (hash[character.gifLink]) {
         setHash(
          hash[character.gifLink] += 1
         )
        } else {
         setHash(
          hash[character.gifLink] = 1
         )
        }
      });
    console.log(hash);
  }

  const renderConnectedContainer = () => {
    if (mintedList === null) {
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
               if (characterFound) {
                sendGif();
               }
              }}
            >
              <p className="sub-text">Character's names are case sensitive*</p>
              <p className="sub-text">Full name list <a href="https://secure-hamlet-19722.herokuapp.com/characters" target="_blank">here</a></p>
              <input
                ref={inputRef}
                type="text"
                onChange={onChange}
                style={{ backgroundColor: "gray" }}
              />
               <button type="submit" className="cta-button search-gif-button" onClick={onClick}>
                Search
              </button>
             {
               characterFound &&  <button type="submit" className="cta-button submit-gif-button">
               Submit
             </button>
             }
            </form>
            <div className="gif-grid">
              {character && <div className="gif-item" key={character.head_shot}>
                  <img src={character.head_shot} alt={character.name} width="100"/>
                </div>}

              {character && <p className="sub-text">{character.name} HeadShot Selected</p>}
              {character && <input type="text"  value={character.head_shot} readonly style={{color: "gray", backgroundColor: "lightgray"}}/>}
            </div>
            {mintedList?.length > 0  &&  <div>
                <p className="sub-text">Minted Character List </p>
                {
                  mintedList?.map((character) => (
                    <div   className="gif-grid">
                       <Badge badgeContent={hash[character.gifLink]} color="primary">
                      <div className="gif-item" key={character.gifLink}>
                     
                      <img src={character.gifLink} alt={character.gifLink} width="100" height="100"/>
                      <p className="sub-text" style={{fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", width: 100}}> character minted by: {character.userAddress.toString()}</p>
                    </div>
                    </Badge>
                    </div>
                  ))
                }
              </div>}
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
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);

      console.log("Get the account", account);
      console.log("gif list", account.gifList);
      setMintList(account.gifList);
     // getBadgeCount(account.gifList);
    } catch(error) {
      console.log("Error is hero List: ", error);
      setMintList([]);
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
