import React, { useEffect, useState } from "react";
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import myEpicNft from './utils/myEpicNft.json'
import { ethers } from 'ethers'

// Constants
const BUILDSPACE_TWITTER_HANDLE = '_buildspace';
const TWITTER_HANDLE = 'staa99';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = 'https://testnets.opensea.io/collection/staa-squares';
const TOTAL_MINT_COUNT = 50;
const CONTRACT_ADDRESS = "0xa40e689b8F5b11Ce953694C51401DD49F44D5091";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenLink, setTokenLink] = useState()
  const [contract, setContract] = useState()
  const [tokenCount, setTokenCount] = useState()

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    let chainId = await ethereum.request({ method: 'eth_chainId' });
    console.log("Connected to chain " + chainId);

    // String, hex code of the chainId of the Rinkebey test network
    const rinkebyChainId = "0x4";
    if (chainId !== rinkebyChainId) {
      alert("You are not connected to the Rinkeby Test Network!");
      return;
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      const account = accounts[0];
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);
      setContract(connectedContract);
      console.log("Found an authorized account:", account);
      setCurrentAccount(account)
    } else {
      console.log("No authorized account found")
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      let chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log("Connected to chain " + chainId);

      // String, hex code of the chainId of the Rinkebey test network
      const rinkebyChainId = "0x4";
      if (chainId !== rinkebyChainId) {
        alert("You are not connected to the Rinkeby Test Network!");
        return;
      }

      /*
      * Fancy method to request access to account.
      */
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      /*
      * Boom! This should print out public address once we authorize Metamask.
      */
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);
      setContract(connectedContract);
    } catch (error) {
      console.log(error)
    }
  }

  const goToTokenLink = () => window.open(tokenLink);
  const goToCollections = () => window.open(OPENSEA_LINK);

  const askContractToMintNft = async () => {
    
      setLoading(true);
      if (tokenCount >= TOTAL_MINT_COUNT) {
        alert("Can no longer mint tokens. You can buy on OpenSea");
      }

    try {
      const { ethereum } = window;

      if (ethereum && contract) {
        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await contract.makeAnEpicNFT();

        console.log("Mining...please wait.")
        await nftTxn.wait();

        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
      setLoading(false);
  }

  // Render Methods
  const renderNotConnectedContainer = () => (<>
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
    <button className="cta-button opensea-button">🌊 View on OpenSea</button>
  </>);

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  useEffect(() => {
    if (!contract) return;
    contract.getNFTCount().then(count => setTokenCount(count.toString()));

    contract.on('NewEpicNFTMinted', (sender, tokenId) => {
      if (sender.toLowerCase() === currentAccount.toLowerCase()) {
        setTokenLink(`https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId}`);
      }

      contract.getNFTCount().then(count => setTokenCount(count.toString()));
    })
  }, [contract])

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          {tokenCount !== undefined && <p className="mint-count">{tokenCount}/50 squares minted.</p>}
          <p className="header gradient-text">Staa Squares Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {currentAccount === "" ? (
            renderNotConnectedContainer()
          ) : loading ? (
            <div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
            ) : (
              <>
              <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
                Mint NFT
            </button>
            <button onClick={goToCollections} className="cta-button opensea-button">🌊 View collection on OpenSea</button>
            </>
            )}
            {tokenLink && 
            <div className="mt-15">
              <button onClick={goToTokenLink} className="cta-button opensea-button">🌊 Minted! View on OpenSea</button>
            </div>
            }
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${BUILDSPACE_TWITTER_HANDLE} by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;