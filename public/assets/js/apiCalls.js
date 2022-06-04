// OTHER HELPER FUNCTIONS -------------------------------------
// fetch resource from API
async function fetchAPIResource(path) {
    let response = await fetch(path);
    let data = response.json();
    return data;
}

// switch to rinkeby
async function switchToRinkeby() {
    await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x4' }],
    });
}

// get contract data
async function getContractData() {
    let data = await fetchAPIResource('/api/contract');
    return data;
}

// get current date
async function getCurrentDate() {
    let data = await fetchAPIResource('/api/get-date-iso');
    return data;
}

// get chains data
async function getChainInfo(chainId) {
    let data = await fetchAPIResource(`/api/chains/${chainId}`);
    return data;
}

// get signed messages
async function getSignedMessages() {
    let data = await fetchAPIResource('/api/messages/signed');
    return data;
}

// get signed messages
async function getStoredMessages() {
    let data = await fetchAPIResource('/api/messages/stored');
    return data;
}

// get last message
async function getLastSignedMessage() {
    let data = await fetchAPIResource('/api/messages/signed/latest');
    return data;
}

// get last message
async function getLastSignedMessageIndex() {
    let data = await fetchAPIResource('/api/messages/signed/latestIndex');
    return data;
}
