var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var fs = require('fs');
var app = express();

// get chains data
var chainsJSON;
fs.readFile('./data/chains_small.json', 'utf8', (err,result) => {
  if (err) {
    chainsJSON = {
      name:"Error reading chain",
      nativeAsset:"ETH"
    };
  } else {
    chainsJSON = JSON.parse(result);
  }
})

// get message signatures data
var signedMessagesJSON;
fs.readFile('./data/signed_messages.json', 'utf8', (err,result) => {
  if (err) {
    signedMessagesJSON = {
      success:false,
      data:[]
    };
  } else {
    signedMessagesJSON = {
      success:true,
      data:JSON.parse(result)
    }
  }
})

// get message signatures data
var storedMessagesJSON;
fs.readFile('./data/stored_messages.json', 'utf8', (err,result) => {
  if (err) {
    storedMessagesJSON = {
      success:false,
      data:[]
    };
  } else {
    storedMessagesJSON = {
      success:true,
      data:JSON.parse(result)
    }
  }
})

// get smart contract data
var contractData;
fs.readFile('./contracts/artifacts/abi.json', 'utf8', (err,result) => {
  if (err) {
    contractData = {
      success:false,
      data:[]
    };
  } else {
    contractData = {
      success:true,
      data:{
        abi:JSON.parse(result),
        address:"0x8d39da7823d0bec131ed7cd84f29fb1ec6f96269"
      }
    }
  }
})

// HELPER FUNCTIONS -------------------------------------
// write to JSON files
async function writeToJSONFiles(filename, JSONContent, errorMessage, successMessage, sortBy='id') {
  // sort by id field if parameter is true
  if (sortBy) {
    JSONContent = JSONContent.sort((a,b) => {
      return eval(`a.${sortBy} - b.${sortBy}`);
    })
  }

  // write the JSON file asynchronously
  fs.writeFile(`./data/${filename}.json`, JSON.stringify(JSONContent, null, 2), (err) => {
    if (err) {
      return {
        success:false,
        data:errorMessage
      };
    } else {
      return {
        success:true,
        data:successMessage
      };
    }
  })
}

// get blockchain messages data

// view engine setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// set up static files
app.use(express.static(path.join(__dirname, 'public')));

// API ------------------------------------------------- 
// -------------- GET REQUESTS -------------------- 
// get chain name and native asset
app.get('/api/chains/:chainId', (req,res) => {
  const { chainId } = req.params;
  res.send({
    success:true,
    data:chainsJSON[chainId]
  })
})

// get signed messages
app.get('/api/messages/signed', (req,res) => {
  res.send(signedMessagesJSON)
})

// get last signed message
app.get('/api/messages/signed/latest', (req,res) => {
  res.send(signedMessagesJSON.data[signedMessagesJSON.data.length-1])
})

// get last signed message index
app.get('/api/messages/signed/latestIndex', (req,res) => {
  res.send({index:signedMessagesJSON.data.length-1})
})

// get stored messages
app.get('/api/messages/stored', (req,res) => {
  res.send(storedMessagesJSON)
})

// get contract data
app.get('/api/contract', (req,res) => {
  res.send(contractData)
})

// get date
app.get('/api/get-date-iso', (req,res) => {
  let cd = new Date();
  // correct month, days, hour and mins to include 0 in units
  let corr = {
    month:cd.getUTCMonth()+1,
    day:cd.getUTCDate(),
    hour:cd.getHours(),
    mins:cd.getMinutes()
  };
  for (const [field, value] of Object.entries(corr)) {
    corr[field] = value < 10 ? `0${value}` : value
  }
  // return date
  res.send({
    success:true,
    data:`${cd.getFullYear()}-${corr.month}-${corr.day} ${corr.hour}:${corr.mins}`
  })
})

// -------------- POST REQUESTS -------------------- 
// request to add signed message to JSON
app.post('/api/sign-message/add', (req,res) => {
  const {message, address, date} = req.body;
  let maxId = Math.max(...signedMessagesJSON['data'].map((obj) => obj.id));

  // if do not add message if message has more than 500 characters 
  // and if there's 500 messages
  if (message.length > 499) {
    return res.status(401).send({
      success:false,
      data:'Message too long'
    })
  } else if (signedMessagesJSON['data'].length > 499) {
    return res.status(401).send({
      success:false,
      data:`There's already 500 messages in the db`
    })
  } else {
    // add message with author
      signedMessagesJSON['data'].push({
        message:message,
        address:address,
        id:maxId+1,
        date:date
      })
    }
  
    // write JSON file with the signature
    writeToJSONFiles(
      filename='signed_messages',
      JSONContent=signedMessagesJSON['data'],
      errorMessage='Message failed to be added for an unknown reason',
      successMessage='Message successfully added'
    )
    
    // end request
    res.end()
})

// request to add signed message to JSON
app.post('/api/sign-message/remove', (req,res) => {
  const {id} = req.body;

  // filter out the ID that was requested to be removed
  signedMessagesJSON['data'] = signedMessagesJSON['data'].filter((obj) => obj.id != id);

  // write JSON file with the signature
  writeToJSONFiles(
    filename='signed_messages',
    JSONContent=signedMessagesJSON['data'],
    errorMessage='Message failed to be removed for an unknown reason',
    successMessage='Message successfully removed'
  )
  
  // end request
  res.end()
})

// edit signed message
app.post('/api/sign-message/edit', (req,res) => {
  const {message, date, id} = req.body;
  
  // if do not add message if message has more than 500 characters 
  if (message.length > 499) {
    return res.status(401).send({
      success:false,
      data:'Message too long'
    })
  } else {
      // edit message
      let editedMessage = signedMessagesJSON['data'].find((obj) => obj.id == id)

      // add new message
      editedMessage['message'] = message
      editedMessage['date'] = date
    }
  
    // write JSON file with the signature
    writeToJSONFiles(
      filename='signed_messages',
      JSONContent=signedMessagesJSON['data'],
      errorMessage='Message failed to be added for an unknown reason',
      successMessage='Message successfully added'
    )
    
    // end request
    res.end()
})

// request to upload/update all messages from the blockchain
app.post('/api/store-message/add', (req,res) => {
  const {message, id, address, block} = req.body;

  // if message is not present already, add it
  if (storedMessagesJSON['data'].filter((obj) => obj.id == id).length > 0) {
    // message exists
    res.end('Message already exists')
  } else {
    // add the new message
    storedMessagesJSON['data'][id] = {
      message:message,
      id:id,
      address:address,
      block:block
    }

    // write JSON file with the signature
    writeToJSONFiles(
      filename='stored_messages',
      JSONContent=storedMessagesJSON['data'],
      errorMessage='Message failed to be added for an unknown reason',
      successMessage='Message successfully added'
    )
  }
  // end request
  res.end()
})

// remove stored message
app.post('/api/store-message/remove', (req,res) => {
  const {id} = req.body;

  // filter out the ID that was requested to be removed
  storedMessagesJSON['data'] = storedMessagesJSON['data'].filter((obj) => obj.id != id);

  // write JSON file with the signature
  writeToJSONFiles(
    filename='stored_messages',
    JSONContent=storedMessagesJSON['data'],
    errorMessage='Message failed to be removed for an unknown reason',
    successMessage='Message successfully removed'
  )
  
  // end request
  res.end()
})

// edit stored message
app.post('/api/store-message/edit', (req,res) => {
  const {message, id} = req.body;

  // edit message
  let editedMessage = storedMessagesJSON['data'].find((obj) => obj.id == id)

  // add new message
  editedMessage['message'] = message
  
  // write JSON file with the signature
  writeToJSONFiles(
    filename='stored_messages',
    JSONContent=storedMessagesJSON['data'],
    errorMessage='Message failed to be added for an unknown reason',
    successMessage='Message successfully added'
  )
  
  // end request
  res.end()
})


// request to upload/update all messages from the blockchain
app.post('/api/save-stored-messages', (req,res) => {
  const { messagesArray } = req.body;

  // if do not add message if message has more than 500 characters 
  // and if there's 500 messages
  for (let i = 0; i < messagesArray.length; i ++) {
    // add message with author
    storedMessagesJSON['data'][i] = messagesArray[i]
  }

  // write JSON file
  writeToJSONFiles(
    filename='stored_messages',
    JSONContent=storedMessagesJSON['data'],
    errorMessage='Messages failed to be added for an unknown reason',
    successMessage='Messages successfully added'
  )

  // end request
  res.end()
})


// local server
app.listen(5000, () => {
  console.log('listening on port 5000')
})

module.exports = app;
