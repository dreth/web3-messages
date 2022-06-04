// function to edit messages
async function editMessage(type, message, id) {
    // execute specific function depending on type of message
    if (type == 1) {
        editSignedMessage(id=id, message=message)
    } else {
        editStoredMessage(id=id, message=message)
    }
}
