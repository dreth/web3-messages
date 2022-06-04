// GENERAL STUFF ------------ links to all the profiles + email
const home = 'https://dac.ac';
var language;
var darkThemeLabel;
var lightThemeLabel;

// toggle off timer links out on load
$("#autoUpdatingSignedOff").toggle()
$("#autoUpdatingStoredOff").toggle()
$("#autoUpdatingStoredOn").toggle()
$("#showHideHiddenMsgOff").toggle()
$("#showHideHiddenMsgOn").toggle()
$("#editMessageTextarea").toggle()
$("#editMessageButton").toggle()
$("#cancelMessageEdit").toggle()

// logging something cool cause life's too short and this may make someone smile, hopefully.
console.log(`
                                 #######*                ##*                    
                               ###########           ###    ###                 
                ####        ##############       (((        ###                 
               #####      ###############        (((        ###                 
             ######    #################      ###(((        #                   
            ######   #################      #####(((                            
           ##########################     #######(((                            
          ##########################   ##########(((                            
         #########################   ############(((          ##########        
       ##########################  ##############(((        ############        
      #########################*                #(((        ############        
     ######################                                 ###########         
    ############# #######                                   ##########          
   ###########   ######           #############             ########            
    *######     ######         ##################(((        #######             
              #######         ###################(((        ######              
             #######         ####################(((        #####               
            ########         ####################(((        ####                
           ########         #####################(((        ##                  
         ##########         #####################(((        #       #####       
        ###########         ##################  #(((             ##########     
       ###########          ################   ##(((         ##############     
       #########             ############     ###(((        ##############      
         ####      ##         ########      #####(((        #############       
                  ####          ####       ######(((        ############        
                #######                   #######(((        ###########         
               ##########                                   ##########          
             ###############                                #########           
             ############                                  #########            
              ########                #############         #######             
                                       #########                                
`)
console.log('Welcome to my site (:')

// LANGUAGES -------------- get languages and labels
const langsJSON = $.getJSON('/data/languages.json');
var langs; 

langsJSON.done(langsJSON, (langsData) => {
    langs = langsData;
})

// ALL FILES LOADED?
allFiles = $.when(langsJSON);

// COOKIES ---------------------------------------
function setCookie(key, value, time_in_days=365) {
    var expires = new Date();
    expires.setTime(expires.getTime() + (time_in_days * 24 * 60 * 60 * 1000)); // expire in a year
    document.cookie = key + '=' + value + ';expires=' + expires.toUTCString() + ';SameSite=Lax' + ';path=/';
}

function getCookie(key) {
    var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
    return keyValue ? keyValue[2] : null;
}

// FAVICON ---------------------------------------
var link = $('#icon').attr('href',"/assets/icons/icon.ico");

// DETECT BROWSER LOCALE -------------------------
if (navigator.language.substring(0,2) == 'es') {
    var browserLocale = 'es';
} else if (navigator.language.substring(0,2) == 'nl') {
    var browserLocale = 'nl';
} else {
    var browserLocale = 'en';
}

// take language from browser locale
language = getCookie('language') ? getCookie('language') : browserLocale;

// detect if user agent has safari
function isSafari() {
    return (navigator.userAgent.includes("Safari"))
}

// get window width
function getWidth() {
    return Math.max(
      document.body.scrollWidth,
      document.documentElement.scrollWidth,
      document.body.offsetWidth,
      document.documentElement.offsetWidth,
      document.documentElement.clientWidth
    );
  }
  
  function getHeight() {
    return Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
      document.documentElement.clientHeight
    );
  }
  


// HIDING STUFF THAT STARTS HIDDEN ---------------
function toggleSkeletonExpanders() {
    // hide lang name
    $("#langName").toggle()
}
// hide everything on page load
toggleSkeletonExpanders()

// generate menus
function loadObjects(langsObj, l=language) {
    // loop over fields
    for (const [itemType, items] of Object.entries(langsObj["objectIds_Field"])) {

        // check if field is actually in the page before doing anything
        for (const [fieldId, content] of Object.entries(items)) {
            // get translation
            translation = langsObj["content"][content][l]

            // loop over items
            if (document.getElementById(fieldId) && itemType == 2) {
                // PAGE TITLES ------------------------------------------------------------------------------
                $(`#${fieldId}`).html(`${translation} | Daniel A.`);

            } else if (document.getElementById(fieldId) && itemType == 1) {
                // field contents
                let fieldContent = '';
                // SPECIAL FIELDS ---------------------------------------------------------------------------
                switch(fieldId) {
                    // theme switcher
                    case 'themeSwitcher':
                        // arrangement of theme link
                        if (getCookie('theme') == 0) {
                            $("#themeSwitcher").html(`<a class='dt dts' onclick='changeTheme()'>🌒</a>`)
                            $("#mainStylesheet").attr('href','/assets/css/styles-light.css')
                    
                            // for articles
                            if (document.getElementById('articleStylesheet')) {
                                $("#articleStylesheet").attr('href','/assets/css/articleStyles-light.css')
                            }
                        } else {
                            $("#themeSwitcher").html(`<a class='lt lts' onclick='changeTheme()'>☀️</a>`)
                            $("#mainStylesheet").attr('href','/assets/css/styles.css')
                    
                            // for articles
                            if (document.getElementById('articleStylesheet')) {
                                $("#articleStylesheet").attr('href','/assets/css/articleStyles.css')
                            }
                        }

                        break;
    
                    // about me preview
                    case 'aboutHomepagePreview':
                        // homepage self description
                        fieldContent = `<br><span class="notThatSmall">${translation}</span>`;

                        // add stuff to object
                        $(`#${fieldId}`).html(fieldContent)

                        break;
                    
                    // about me in CV page
                    case 'aboutMeDescription':
                        // homepage self description
                        aboutMeDescription = `<span>${translation}</span>`;

                        // add stuff to object
                        $(`#${fieldId}`).html(aboutMeDescription)

                        break;
    
                    // cool links preview
                    case 'coolLinksHomepagePreview':
                        // cool wikipedia links preview
                        fieldContent = `<br><span class="notThatSmall">${translation}</span><br><br>`;
                        let maxAmountOfLinks = 3;
                        let cnt = 0;
                        var wikipediaArticles = coolLinksContent['wikipedia'];
                        for (const name of Object.keys(wikipediaArticles).reverse()) {
                            // extract language of article
                            let articleLang = wikipediaArticles[name].slice(0,2);

                            // create article URL
                            let articleURL = `https://${articleLang}.${wikipediaBaseLink}${wikipediaArticles[name].slice(3)}`;

                            // append to article list html object
                            if (cnt < (maxAmountOfLinks-1)) {
                                fieldContent += `<a class="notThatSmall bp" href="${articleURL}">🔗 ${name}</a><br><br>`;
                            } else {
                                fieldContent += `<a class="notThatSmall bp" href="${articleURL}">🔗 ${name}</a><br>`;
                            }
                            
                            // increase counter
                            cnt += 1;
                            
                            // break if counter reaches 3
                            if (cnt >= maxAmountOfLinks) {break;}
                        }

                        // add stuff to object
                        $(`#${fieldId}`).html(fieldContent)

                        break;
    
    
                    // playlists preview
                    case 'playlistsHomepagePreview':
                        // set homepage playlists stuff
                        fieldContent = `<br><span class="notThatSmall">${translation}</span><br>`;

                        // creating homepage playlists list
                        for (const [name, page] of Object.entries(homepagePlaylist)) {
                            // construct playlist url
                            let playlistURL = `${baseSpotifyLink}${page}`;
                            // append to article list html object
                            fieldContent += `
                                <div class="column img__wrap homepagePlaylist">
                                    <a href="${playlistURL}"><br>
                                    <img class="playlistImages-hp" src="/assets/playlist_images/${name}.png" title="${name}">
                                        <div class="homepagePlaylist img__description_layer img__dl_hover_panel">
                                            <span class="img__description">${name}</span>
                                        </div>
                                    </a>
                                </div>
                            <br>`;
                        }

                        $(`#${fieldId}`).html(fieldContent)
                        break;
                }
    
            } else if (document.getElementById(fieldId) && itemType == 0) {
                // SITE TEXT FIELDS ---------------------------------------------------------------------------
                $(`#${fieldId}`).html(translation);
            }
        }

    }
}

// detecting the language to abstract language-based links
function updateLang(l) {
    setCookie('language',l)
    language = l;

    // reload all objectes
    allFiles.done(() => {
        // load all site objects specified the langs.json file
        loadObjects(langs)

        // if wallet is connected, fetch account data
        if (connected) {
            fillAccountData()
        }
    })
}

// change theme
function changeTheme() {
    // translation lang for changing language
    if (getCookie('theme') == 0) {
        setCookie('theme',1)
        $("#themeSwitcher").html(`<a class='lt lts' onclick='changeTheme()'>☀️</a>`)
        $("#mainStylesheet").attr('href','/assets/css/styles.css')

        // for articles
        if (document.getElementById('articleStylesheet')) {
            $("#articleStylesheet").attr('href','/assets/css/articleStyles.css')
        }
    } else {
        setCookie('theme',0)
        $("#themeSwitcher").html(`<a class='dt dts' onclick='changeTheme()'>🌒</a>`)
        $("#mainStylesheet").attr('href','/assets/css/styles-light.css')

        // for articles
        if (document.getElementById('articleStylesheet')) {
            $("#articleStylesheet").attr('href','/assets/css/articleStyles-light.css')
        }
    }
}

// show lang text on right col
function toggleLangText(l, event) {
    // preview the language on mouse entry
    if (l != language) {
        if (event===1) {
            allFiles.done(() => {
                // reload objects with hover lang
                loadObjects(langs, l)

                // if wallet is connected, fetch account data
                if (connected) {
                    fillAccountData()
                }
            })
        // go back to normal on mouse exit
        } else {
            allFiles.done(() => {
                // reload objects back with original lang
                loadObjects(langs, language)

                // if wallet is connected, fetch account data
                if (connected) {
                    fillAccountData()
                }
            })
        }
    }
}


// ADD HOMEPAGE EVENTS ----------------------------------
// change text of about me, cool links and playlists on hover or clicking the div
function addTextChangeEvents() {
    // sections' divs and their respective link
    let expandedSec = {
        'aboutHomepageDIV':'aboutHomepageLink',
        'coolLinksHomepageDIV':'coolLinksHomepageLink',
        'playlistsHomepageDIV':'playlistsHomepageLink'
    };
    // keys to search the language for
    let expandedLangKey = {
        'aboutHomepageDIV':'about',
        'coolLinksHomepageDIV':'cool_links',
        'playlistsHomepageDIV':'playlists'
    }
    // add onmousenter and onmouseleave events
    for (const div of Object.keys(expandedSec)) {
        // event listeners for divs
        $(`#${div}`).mouseenter(function() {
            // change link text
            $(`#${expandedSec[div]}`).html(langs['content'][`${expandedLangKey[div]}_full`][language])
        })
        $(`#${div}`).mouseleave(function() {
            // back to original link text
            $(`#${expandedSec[div]}`).html(langs['content'][`${expandedLangKey[div]}_title`][language])
        })

        // event listeners for links
        $(`#${expandedSec[div]}`).mouseenter(function() {
            // change background color
            $(`#${div}`).addClass('alt')
        })
        $(`#${expandedSec[div]}`).mouseleave(function() {
            // change background color to original
            $(`#${div}`).removeClass('alt')
        })
    }
}

// LOAD ALL OBJECTS -------------------------------------
allFiles.done(() => {
    // load stuff
    loadObjects(langs)
    // add the events
    if (document.getElementById('homepageMainDiv')) {
        addTextChangeEvents()
    }
})

// OBJECTS TO TOGGLE -------------------------------------
// hide stuff when not connected
const stuffToToggle = [
    "#accountInfo",
    "#connectedAccount",
    "#connectedBlockchain",
    "#disconnectButton",
    "#connectButton",
    "#connectedBalance",
    "#messageInputBox",
    "#wrongChainDiv",
    "#connectWalletToStart",
    "#storedMessagesNotLoaded",
    "#storedMessagesAutoupdateLinks"
]
function toggleEverything(except=[]) {
    for (let i = 0; i < stuffToToggle.length; i++) {
        if (!except.includes(stuffToToggle[i])) {
            $(stuffToToggle[i]).toggle()
        }
    }
}
// hide stuff in stufftotoggle
toggleEverything(except=["#connectButton","#connectWalletToStart","#storedMessagesNotLoaded"])

// cleanup input box
function cleanUpInputBox() {
    $("#inputBox").val('')
}
