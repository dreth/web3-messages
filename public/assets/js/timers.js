// timer toggle to check signed messages every so often
function toggleTimers(timer) {
    if (timer == "signed") {
        // clear signed messages timer if it's on
        if (signedMessagesTimerStatus === 1) {
            clearInterval(signedMessagesTimer);
            signedMessagesTimerStatus = 0;
        }
        // start signed messages timer if it's off
        else {
            signedMessagesTimer = setInterval(loadSignedMessages, 10000)
            signedMessagesTimerStatus = 1;
        }
        // hide on link and show off link
        $("#autoUpdatingSignedOn").toggle()
        $("#autoUpdatingSignedOff").toggle()

    } else if (timer == "stored") {
        // clear stored messages timer if it's on
        if (storedMessagesTimerStatus === 1) {
            clearInterval(storedMessagesTimer);
            storedMessagesTimerStatus = 0;
        } 
        // start stored messages timer if it's off
        else {
            storedMessagesTimer = setInterval(loadstoredMessages, 10000)
            storedMessagesTimerStatus = 1;
        }
        // hide on link and show off link
        $("#autoUpdatingStoredOn").toggle()
        $("#autoUpdatingStoredOff").toggle()
    }
}

// set autoreload timer for signed messages
signedMessagesTimer = setInterval(loadSignedMessages, 10000)

// set autoreload timer
storedMessagesTimer = setInterval(loadStoredMessages, 10000);
