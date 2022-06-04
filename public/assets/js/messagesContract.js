// if the wallet has been connected, use the contract
async function getStoredMessagesFromTheBlockchain() {
    // arrays we can fully get from the contract
    let largestMessageId = await messagesContract.methods.messageId().call();
    let messagesArrayContract = await messagesContract.methods.viewAllMessages().call();
    let authorsArrayContract = await messagesContract.methods.viewAllAuthors().call();

    // messages array with all the messages 
    // each time a user loads the site
    // a post request will be made to update the data within the server
    let messagesArray = [];

    for (let i = 0; i < largestMessageId; i++) {
        // get current message
        let messageI = messagesArrayContract[i];

        // if message is empty, just skip to the next
        let blockI = await messagesContract.methods.messagesBlocks(i).call();
        let addressI = authorsArrayContract[i];
    
        messagesArray.push({
            message:messageI,
            id:i,
            address:addressI,
            block:blockI
        })
    }
    // return messages array
    return messagesArray;
}

// push messages array to server: only done once when user visits + connects wallet
async function pushStoredMessages() {
    try {
        // get messages
        let storedMessagesArray = await getStoredMessagesFromTheBlockchain();
    
        // push the stuff to the server     
        await axios.post('/api/save-stored-messages', {messagesArray:storedMessagesArray})

        // reload everything
        loadStoredMessages(fadeinId=true)

    } catch (e) {
        console.log(e)
    }
}

// estimate gas cost of writing to the blockchain
async function getEstimatedGasCost(message) {
    // get estimated cost using message length
    try {
        // ask for signature
        let gasCost = await messagesContract.methods.writeMessage(message).estimateGas();

        // return gas cost
        return gasCost;

    } catch(e) {
        console.log(e)
    }
}

// store message on the blockchain
async function addStoredMessage(message) {
    // request message
    try {        
        // ask for signature
        let storeMessageTx = await messagesContract.methods.writeMessage(message).send({'from':selectedAccount});

        // perform post request to add element to JSON
        await axios.post('/api/store-message/add', {
            message:message,
            id:Number(storeMessageTx.events.newMessage.returnValues._messageId),
            address:storeMessageTx.events.newMessage.returnValues._sender,
            block:`${storeMessageTx.blockNumber}`
        })

        // push the stored messages again
        pushStoredMessages()

        // clean up input box
        cleanUpInputBox()

    } catch(e) {
        console.log(e)
        // alert if the message signature is rejected
        alert(langs['content']['rejected_signature'][language])
    }
}

// remove stored message
async function removeStoredMessage(id) {
    try {
        // ask for signature
        let removeMessageTx = await messagesContract.methods.removeIndividualMessage(id).send({
            'from':selectedAccount
        })

        // post request to remove message
        await axios.post('/api/store-message/remove', {
            id:removeMessageTx.events.messageRemoved.returnValues._messageI
        })

        // push the stored messages again
        pushStoredMessages()

    } catch(e) {
        console.log(e)
        // alert if the signature is rejected
        alert(langs['content']['rejected_signature'][language])
    }
}

// edit stored message
async function editStoredMessage(id, message) {
    try {
        // ask for signature
        let editMessageTx = await messagesContract.methods.modifyIndividualMessage(id, message).send({
            'from':selectedAccount
        })

        // post request to remove message
        await axios.post('/api/store-message/edit', {
            message:message,
            id:editMessageTx.events.messageEdited.returnValues._messageId
        })

        // push the stored messages again
        pushStoredMessages()

        // clean up input box
        cleanUpInputBox()

        // editing mode off
        editingModeOff()

    } catch(e) {
        console.log(e)
        // alert if the signature is rejected
        alert(langs['content']['rejected_signature'][language])
    }
}


// load stored messages (generate divs)
async function loadStoredMessages(fadeinId=false) {
    // get signed messages from API
    storedMessages = await getStoredMessages();
    storedMessages = storedMessages.data.reverse();
    storedMessages = hiddenStoredMsgsStatus == 0 ? storedMessages.filter((obj) => obj.message !== '') : storedMessages.filter((obj) => obj.message == '');

    // amount of pages
    let maxI;
    var maxItems = storedMessages.length;
    if (maxItems % pageModulus > 0) {
        amountOfPagesStored = Math.floor(maxItems/pageModulus) + 1;
        maxI = true;
    } else {
        amountOfPagesStored = Math.ceil(maxItems/pageModulus);
        maxI = false;
    }

    // max i for looping pages
    let iPagecount = (pageStored*pageModulus);
    let correction = maxItems >= 10 ? 10 : maxItems;
    let loopIVal = (maxI ? (pageStored == amountOfPagesStored ? maxItems : iPagecount) : iPagecount) - correction

    // generate html object with signed messages
    let storedMessagesBlock = "";
    
    for (let i = loopIVal; i < iPagecount; i++) {
        // solving this in a poor way because im too lazy to figure out what i gooched
        if (i == maxItems) {
            break;
        }
        
        // message parameters
        let message = storedMessages[i]["message"];

        // only add non-empty messages if
        // hiddenStoredMsgsStatus == 1
        let condition = Boolean(!message && (hiddenStoredMsgsStatus == 1)) | Boolean(message && (hiddenStoredMsgsStatus == 0));
        if (condition) {
            let address = storedMessages[i]["address"];
            let id = storedMessages[i]["id"];
            let block = storedMessages[i]["block"];

            // link options if account matches address
            let messageOptions = selectedAccount == address ? `
                <a onclick="removeStoredMessage(id=${id})">🗑️</a>
                <a onclick="editingModeOn(message='${message}', typeOfMsg=0, id=${id})">✏️</a>
                <br><br>
                ` : '';


            // html code for each message block
            let fadeinObject = fadeinId ? 'fadein' : '';
            storedMessagesBlock += `
                <div class="storedMessagesDivs smallPaddingAllAround ${fadeinObject}">
                <span>${message}</span><br><br>
                ${messageOptions}
                <span class="evenSmaller">Block: ${block} - id: ${id}</span><br><b><span class="evenSmaller">${address}</span></b>
                </div>
                <br>
            `
        }
    }

    // append message blocks
    $("#storedMessagesList").html(storedMessagesBlock)

    // show/hide page switcher depending on amount of messages
    if (maxItems < 11) {
        $("#storedMessagePageSwitcher").hide()
    } else {
        $("#storedMessagePageSwitcher").show()
    }
}

// hide/show deleted messages
async function toggleDeletedMessages() {
    // change value of hiddenStoredMsgsStatus
    hiddenStoredMsgsStatus = hiddenStoredMsgsStatus == 1 ? 0 : 1;

      // if hidden messages shown, hide hidden messages hide
    if (hiddenStoredMsgsStatus == 1) {
        $("#showHideHiddenMsgOff").hide()
        $("#showHideHiddenMsgOn").show()
    } else {
        $("#showHideHiddenMsgOff").show()
        $("#showHideHiddenMsgOn").hide()
    }

    // reload stored messages
    loadStoredMessages();
}

// load stored messages
loadStoredMessages();
