// request message signature 
async function requestSignature(message) {
    try {
        // convert to hex and request signature
        const msg = web3.utils.asciiToHex(message);
        const sign = await ethereum.request({
            method: 'personal_sign',
            params: [msg, selectedAccount],
        });

        // return signature
        return(sign)
        
    } catch(e) {
        console.log(e)
        // alert if the message signature is rejected
        alert(langs['content']['rejected_signature'][language])
        // return false
        return false;
    }
}

// ordinary message signature when posting messages
async function addSignedMessage(message) {
    // request signature
    let sign = await requestSignature(message);

    if (sign != false) {
        // get date
        let date = await getCurrentDate();
        
        // perform post request to add element to JSON
        await axios.post('/api/sign-message/add', {
            message:message,
            address:selectedAccount,
            date:date.data
        })

        // reload everything
        loadSignedMessages(fadeinId=true)

        // clean input box
        cleanUpInputBox()
    }
}

// remove signed message
async function removeSignedMessage(id) {
    // request signature
    let sign = await requestSignature(`Remove message with internal id:${id}`);

    // remove message request
    if (sign != false) {
        await axios.post('/api/sign-message/remove', {
            id:id
        })

        // reload everything
        loadSignedMessages(fadeinId=true)
    }
}

// edit signed message
async function editSignedMessage(id, message) {
    // do nothing if id is null
    if (id == null) {
        return;
    }

    // request signature
    let sign = await requestSignature(message);

    if (sign != false) {
        // get date
        let date = await getCurrentDate();

        // perform post request to add element to JSON
        await axios.post('/api/sign-message/edit', {
            message:message,
            date:date.data,
            id:id
        })

        // reload everything
        loadSignedMessages(fadeinId=true)

        // clean input box
        cleanUpInputBox()

        // editing mode off
        editingModeOff()

    }
}

// get signed messages
async function loadSignedMessages(fadeinId=false) {
    // get signed messages from API
    signedMessages = await getSignedMessages();
    signedMessages = signedMessages.data.reverse();

    // amount of pages
    let maxI;
    var maxItems = signedMessages.length;
    if (maxItems % pageModulus > 0) {
        amountOfPagesSigned = Math.floor(maxItems/pageModulus) + 1;
        maxI = true;
    } else {
        amountOfPagesSigned = Math.ceil(maxItems/pageModulus);
        maxI = false;
    }

    // max i for looping pages
    let iPagecount = (pageSigned*pageModulus);
    let correction = maxItems >= 10 ? 10 : maxItems;
    let loopIVal = (maxI ? (pageSigned == amountOfPagesSigned ? maxItems : iPagecount) : iPagecount) - correction
 
    // generate html object with signed messages
    let signedMessagesBlock = "";

    for (let i = loopIVal; i < iPagecount; i++) {
        // solving this in a poor way because im too lazy to figure out what i gooched
        if (i == maxItems) {
            break;
        }
        
        // message parameters
        let message = signedMessages[i]["message"];
        let address = signedMessages[i]["address"];
        let date = signedMessages[i]["date"];
        let id = signedMessages[i]["id"];

        // link options if account matches address
        let messageOptions = selectedAccount == address ? `
            <a onclick="removeSignedMessage(id=${id})">🗑️</a>
            <a onclick="editingModeOn(message='${message}', typeOfMsg=1, id=${id})">✏️</a>
            <br><br>
            ` : '';

        // html code for each message block
        let fadeinObject = fadeinId ? 'fadein' : '';
        signedMessagesBlock += `
            <div class="signedMessagesDivs smallPaddingAllAround ${fadeinObject}">
            <span>${message}</span><br><br>
            ${messageOptions}
            <span class="evenSmaller">${date}</span><br>
            <b><span class="evenSmaller">${address}</span></b>
            </div>
            <br>
        `
    }

    // append message blocks
    $("#signedMessagesList").html(signedMessagesBlock)

    // show/hide page switcher depending on amount of messages
    if (maxItems < 11) {
        $("#signedMessagePageSwitcher").hide()
    } else {
        $("#signedMessagePageSwitcher").show()
    }
}

// load messaes and set reload timers
loadSignedMessages(fadein=true);

// page switches
function pageSwitch(type, pageCounter, typeMsg) {
    // only execute reload if condition passes
    let conditionMet;
    let amountOfPages = typeMsg == "signed" ? amountOfPagesSigned : amountOfPagesStored;

    // page switcher
    switch(type) {
        case 'first':
            if (pageCounter != 1) {
                pageCounter = 1;
                conditionMet = true;
            }
            break;
        
        case 'back':
            if (pageCounter > 1) {
                pageCounter -= 1;
                conditionMet = true;
            }
            break;
        
        case 'forward':
            if (pageCounter < amountOfPages) {
                pageCounter += 1;
                conditionMet = true;
            }
            break;
        
        case 'last':
            if (pageCounter != amountOfPages) {
                pageCounter = amountOfPages;
                conditionMet = true;
            }
            break;
    }

    // msg loader
    if (typeMsg == "signed" & conditionMet) {
        loadSignedMessages()
    } else if (typeMsg == "stored" & conditionMet) {
        loadStoredMessages()
    } 

    // return pagecount
    return pageCounter;
}

// SWITCH TO MESSAGE EDITING MODE
function editingModeOn(message, typeOfMsg, id=null) {
    // message textarea titles
    $("#writeMessage").hide()
    $("#editMessageTextarea").show()
    $("#inputBox").val(message)

    // message editing buttons (sign/store)
    $("#signMessageButton").hide()
    $("#storeMessageButton").hide()
    $("#editMessageButton").show()
    $("#cancelMessageEdit").show()

    // modify message selected tso edit
    messageSelectedToEdit = id;

    // set type of message
    typeOfMessageSelectedToEdit = typeOfMsg;

    // go to message editing field
    location.href = "#editMessageTextarea";

    // set focus on the msgbox
    $("#inputBox").focus()

}

function editingModeOff() {
    // message textarea titles
    $("#writeMessage").show()
    $("#editMessageTextarea").hide()
    cleanUpInputBox()

    // message editing buttons (sign/store)
    $("#signMessageButton").show()
    $("#storeMessageButton").show()
    $("#editMessageButton").hide()
    $("#cancelMessageEdit").hide()

    // modify message selected to edit
    messageSelectedToEdit = id;
}
