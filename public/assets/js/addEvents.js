// add event listeners
window.addEventListener('load', async () => {
    $("#connectButton").on('click', () => {
        onConnect()
        connected = true;
    })
    $("#disconnectButton").on('click', () => {
        onDisconnect()
        connected = false;
    })
    $("#switchToRinkeby").on('click', () => {
        switchToRinkeby()
    })
    $("#signMessageButton").on('click', () => {
        addSignedMessage($("#inputBox").val())
    })
    $("#storeMessageButton").on('click', () => {
        addStoredMessage($("#inputBox").val())
    })
    $("#editMessageButton").on('click', () => {
        editMessage(type=typeOfMessageSelectedToEdit, message=$("#inputBox").val(), id=messageSelectedToEdit)
    })
    $("#cancelMessageEdit").on('click', () => {
        editingModeOff()
    })

    // page switchers
    $("#goBackFirstPageSigned").on('click', () => {pageSigned = pageSwitch('first', pageSigned, 'signed')})
    $("#goBackOnePageSigned").on('click', () => {pageSigned = pageSwitch('back', pageSigned, 'signed')})
    $("#goForwardOnePageSigned").on('click', () => {pageSigned = pageSwitch('forward', pageSigned, 'signed')})
    $("#goForwardLastPageSigned").on('click', () => {pageSigned = pageSwitch('last', pageSigned, 'signed')})

    // page switchers
    $("#goBackFirstPageStored").on('click', () => {pageStored = pageSwitch('first', pageStored, 'stored')})
    $("#goBackOnePageStored").on('click', () => {pageStored = pageSwitch('back', pageStored, 'stored')})
    $("#goForwardOnePageStored").on('click', () => {pageStored = pageSwitch('forward', pageStored, 'stored')})
    $("#goForwardLastPageStored").on('click', () => {pageStored = pageSwitch('last', pageStored, 'stored')})

    // auto updating events
    $("#autoUpdatingSignedOn").on('click', () => {toggleTimers("signed")})
    $("#autoUpdatingSignedOff").on('click', () => {toggleTimers("signed")})
    $("#autoUpdatingStoredOn").on('click', () => {toggleTimers("stored")})
    $("#autoUpdatingStoredOff").on('click', () => {toggleTimers("stored")})

    // hidden/deleted messages toggles
    $("#showHideHiddenMsgOn").on('click', () => {toggleDeletedMessages()})
    $("#showHideHiddenMsgOff").on('click', () => {toggleDeletedMessages()})
})
