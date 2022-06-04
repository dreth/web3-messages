// Unpkg imports
const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;

// message selected to edit
var messageSelectedToEdit;
var typeOfMessageSelectedToEdit;

// timers for auto reload
var signedMessagesTimer;
var storedMessagesTimer;
var signedMessagesTimerStatus = 1;
var storedMessagesTimerStatus = 1;

// hidden/deleted stored msgs
var hiddenStoredMsgsStatus = 0;

// Chosen wallet provider given by the dialog window
let provider;
let web3;

// load messages contract data
// contract ABI and address
var messagesContract;
var messagesABI;
var messagesAddress;
const contractData = getContractData()
contractData.then((response) => {
    messagesABI = response.data.abi;
    messagesAddress = response.data.address;
})

// Address of the selected account
var selectedAccount;

// connected or not
var connected = false;

// general variables that change depending on connect/disconnect
var chainId;
var accounts;
var selectedAccount;
var balance;
var ethBalance;
var humanFriendlyBalance;

// pages for signed/stored msgs
var pageSigned = 1;
var pageStored = 1;
const pageModulus = 10;
var amountOfPagesSigned;

// messages
var signedMessages;

// messages
var storedMessages;
var amountOfPagesStored;
