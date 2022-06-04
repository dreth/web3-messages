

// provider options
const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        infuraId: "d8034c3bb8df4b899892547355b4899a" // required
      }
    }
  };

let web3Modal = new Web3Modal({
    cacheProvider: false, // optional
    providerOptions, // required
});

async function fillAccountData() {
    // fill contents of site with account data
    $("#account").html(selectedAccount)
    // Load chain information over an HTTP API
    let chainInfo = await getChainInfo(chainId);
    $("#blockchain").html(chainInfo.data['name'])
    $("#balance").html(`${humanFriendlyBalance} ${chainInfo.data['nativeAsset']}`)
    $("#contractAddy").html(`${messagesAddress} (<a class="b" target="_blank" href="https://rinkeby.etherscan.io/address/0x8d39da7823d0bec131ed7cd84f29fb1ec6f96269#code">Rinkeby</a>)`)

    // check if chainId is rinkeby and if not show message
    if (chainId != 4) {
      $("#wrongChainDiv").show()
      $("#messageInputBox").hide()
    } else {
      $("#wrongChainDiv").hide()
      $("#messageInputBox").show()
    }
}

// get account data
async function fetchAccountData() {
    // Get a Web3 instance for the wallet
    web3 = new Web3(provider);

    // Get connected chain id from Ethereum node
    chainId = await web3.eth.getChainId();

    // Get list of accounts of the connected wallet
    accounts = await web3.eth.getAccounts();
    selectedAccount = accounts[0];

    balance = await web3.eth.getBalance(selectedAccount);
    // ethBalance is a BigNumber instance
    // https://github.com/indutny/bn.js/
    ethBalance = web3.utils.fromWei(balance, "ether");
    humanFriendlyBalance = parseFloat(ethBalance).toFixed(4);

    // fill account data
    fillAccountData()

    // connect to contract
    messagesContract = new web3.eth.Contract(messagesABI, messagesAddress);

    // load messages
    loadSignedMessages(fadeinId=true)
    loadStoredMessages(fadeinId=true)
}

/**
 * Fetch account data for UI when
 * - User switches accounts in wallet
 * - User switches networks in wallet
 * - User connects wallet initially
 */
 async function refreshAccountData() {
    // Disable button while UI is loading.
    // fetchAccountData() will take a while as it communicates
    // with Ethereum node via JSON-RPC and loads chain data
    // over an API call.
    $("#connectButton").attr("disabled",true)
    $("#disconnectButton").attr("disabled",true)
    await fetchAccountData();
    $("#connectButton").attr("disabled",false)
    $("#disconnectButton").attr("disabled",false)
}
  

/**
 * Connect wallet button pressed.
 */
 async function onConnect() {

  try {
    provider = await web3Modal.connect();
  } catch(e) {
    console.log("Could not get a wallet connection", e);
    return;
  }

  // Subscribe to accounts change
  provider.on("accountsChanged", (accounts) => {
    fetchAccountData();
  });

  // Subscribe to chainId change
  provider.on("chainChanged", (chainId) => {
    fetchAccountData();
  });

  // Subscribe to networkId change
  provider.on("networkChanged", (networkId) => {
    fetchAccountData();
  });

  await refreshAccountData();

  // show stuff on connect
  let exceptToggle = ["#wrongChainDiv", "#messageInputBox"]

  // if timer is on, hide the turn off message
  if (storedMessagesTimerStatus == 1) {
    $("#autoUpdatingStoredOn").show()
    $("#autoUpdatingStoredOff").hide()
  } else {
    $("#autoUpdatingStoredOn").hide()
    $("#autoUpdatingStoredOff").show()
  }

  // if hidden messages shown, hide hidden messages hide
  if (hiddenStoredMsgsStatus == 1) {
    $("#showHideHiddenMsgOff").hide()
    $("#showHideHiddenMsgOn").show()
  } else {
    $("#showHideHiddenMsgOff").show()
    $("#showHideHiddenMsgOn").hide()
  }

  toggleEverything(except=exceptToggle)

    // set focus on the msgbox
    $("#inputBox").focus()

  // push stored messages from the blockchain on site load
  pushStoredMessages()
}

/**
 * Disconnect wallet button pressed.
 */
 async function onDisconnect() {

    if(provider.close) {
      await provider.close();
  
      // If the cached provider is not cleared,
      // WalletConnect will default to the existing session
      // and does not allow to re-scan the QR code with a new wallet.
      // Depending on your use case you may want or want not his behavir.
      await web3Modal.clearCachedProvider();
      provider = null;
    }
  
    selectedAccount = null;
  
    // hide stuff on disconnect
    let exceptToggle = ["#wrongChainDiv"]
    toggleEverything(except=exceptToggle)

    // remove data on disconnect
    chainId = null;
    accounts = null;
    selectedAccount = null;
    balance = null;
    ethBalance = null;
    humanFriendlyBalance = null;
    web3 = null;
    messagesContract = null;

    // reload stored and signed messages
    loadSignedMessages(fadeinId=true)
    loadStoredMessages(fadeinId=true)

    // hide hidden/deleted msgs show/hide buttons
    $("#autoUpdatingStoredOn").hide()
    $("#autoUpdatingStoredOff").hide()
    $("#showHideHiddenMsgOff").hide()
    $("#showHideHiddenMsgOn").hide()
}
