function debounce (func, wait, immediate) {
  let timeout
  return function() {
    let context = this, args = arguments
    let later = function() {
      timeout = null
      if (!immediate) func.apply(context, args)
    }
    let callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func.apply(context, args)
  };
}

const _optionsForm = document.querySelector('#optionsForm')
const _readerViewA = document.querySelector('#readerViewA')
const _readerViewB = document.querySelector('#readerViewB')
const _readerViewC = document.querySelector('#readerViewC')

// invoke the readerview 
const _tabManager = async (option) => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: option,
  });
}

const BUTTON_STATE = {
  ENABLE: 'Enable Reader View',
  DISABLE: 'Disable Reader View'
}

// set initial state of toggle button from local storage, defatult to true
const toggleState = localStorage.getItem('toggleState') || 'true'


// initialize the toggle button
// can probably refactor without the data attribute, works for now
// refactor this to be less DRY
const toggleBtn = document.querySelector('#toggleReaderView')
JSON.parse(toggleState) ? toggleBtn.classList.remove('active') : toggleBtn.classList.add('active')
toggleBtn.dataset.toggle = toggleState
toggleBtn.textContent = JSON.parse(toggleState) ? BUTTON_STATE.ENABLE : BUTTON_STATE.DISABLE
console.log('toggleState', toggleState)

// attributes to apply when individual profiles are selected when calling readerViewEmail()
// refactor this to be less DRY
const stateManagement = () => {
  toggleBtn.textContent = BUTTON_STATE.DISABLE
  toggleBtn.dataset.toggle = 'false'
  JSON.parse(toggleState) ? toggleBtn.classList.remove('active') : toggleBtn.classList.add('active')
  localStorage.setItem('toggleState', JSON.parse(toggleBtn.dataset.toggle))
}

// main toggle event listener
// need to refactor the logic here
toggleBtn.addEventListener('click', () => {
  toggleBtn.classList.toggle('active') // toggle class for style purposes
  !JSON.parse(toggleBtn.dataset.toggle) ? _tabManager(readerViewOfff) : _tabManager(readerViewEmail) // call the appropriate function to enable/disable reader view
  toggleBtn.textContent = !JSON.parse(toggleBtn.dataset.toggle) ? BUTTON_STATE.ENABLE : BUTTON_STATE.DISABLE // update the button text
  toggleBtn.dataset.toggle = !JSON.parse(toggleBtn.dataset.toggle) // update the data attribute
  localStorage.setItem('toggleState', JSON.parse(toggleBtn.dataset.toggle))
})

// input events on color input elements, enable reader view
for(let el of [...document.querySelectorAll('input[type=color]')]){
  el.addEventListener('input', debounce(function() {
    _tabManager(readerViewEmail)
  }, 100)) 
}

// change events on input elements, enable reader view
_optionsForm.addEventListener('change', debounce(function() {
  _tabManager(readerViewEmail)
}, 100));

// click on button element, enable reader view
_readerViewA.addEventListener('click', () => {
  _tabManager(readerViewEmail)
  stateManagement()
});
_readerViewB.addEventListener('click', () => {
  _tabManager(readerViewEmail)
  stateManagement()
});
_readerViewC.addEventListener('click', () => {
  _tabManager(readerViewEmail)
  stateManagement()
});

// Function will be executed as a content script inside the current page
function readerViewEmail() {
  // Remove previously added reader view elements
  let style = document.querySelectorAll(".blockedImage");
  for (let item of style) {
    item.remove();
  }

  // Get the default styles from background.js
  chrome.storage.sync.get("defaultStyles", ({ defaultStyles }) => {
    // Create styleSheet to revert styles and add our own
    let styleSheet = `
    .readerView.readerView * {
      all: revert
    }
    .readerView.readerView [date-hidden]{
      display:none !important
    }
    .readerView.readerView img{max-width:100%}
    .readerView.readerView table {display:block;}
    .readerView.readerView table:not([role="table"]):not([role="grid"]) :where(tbody, thead, tfoot, th, td){
      display:contents;
      font-weight:unset;
    }
    .readerView.readerView table:not([role="table"]):not([role="grid"]) > * > tr{
      display:block;
      margin:1em 0;
    }
    .readerView.readerView table:not([role="presentation"]):not([role="none"]):is(
      :has(>thead ~ tbody),
      :has(>tbody ~ tfoot),
      :has(>tbody>tr>th[scope]),
      :has(>tbody>tr>th+td):has(>tbody>tr+tr),
      :has(>tbody>tr>th):has(>tbody>tr>td + td)
    ),
    .readerView.readerView table:not([role="presentation"]):not([role="none"]):is(
      :has(>thead ~ tbody),
      :has(>tbody ~ tfoot),
      :has(>tbody>tr>th[scope]),
      :has(>tbody>tr>th+td):has(>tbody>tr+tr),
      :has(>tbody>tr>th):has(>tbody>tr>td + td)
    ) :where(tbody, thead, tfoot, tbody > tr, thead > tr, tfoot > tr,  tbody > tr > td,  tbody > tr > th,   thead > tr > th, thead > tr > td, tfoot > tr > th, tfoot > tr > td){
      display:revert;
      width:revert;
      border:1px solid;
      border-spacing:.2em;
      padding:.2em;
      word-break: normal;
      font-weight:revert;
    }
    .readerView.readerView thead::after,
    .readerView.readerView tfoot::before{
      content:'';
      display:block;
      height:.4em;
    }
    .readerView.readerView .blockedImage:not(:empty){
      border: 1px dashed;
      padding: 1em;
      display:inline-block;
      overflow-wrap: anywhere;
    }
    .readerView.readerView .blockedImage + img {
        display: none;
    }
    .readerView[data-readerviewprofile="A"]{
      background:${defaultStyles.profileA.backgroundColor};
      color: ${defaultStyles.profileA.color};
    }
    .readerView[data-readerviewprofile="A"] :is(a, a *) {
        text-decoration: underline;
        color:${defaultStyles.profileA.linkColor};
    }
    .readerView[data-readerviewprofile="B"]{
      background:${defaultStyles.profileB.backgroundColor};
      color: ${defaultStyles.profileB.color};
    }
    .readerView[data-readerviewprofile="B"] :is(a, a *) {
        text-decoration: underline;
        color:${defaultStyles.profileB.linkColor};
    }
    .readerView[data-readerviewprofile="C"]{
      background:${defaultStyles.profileC.backgroundColor};
      color: ${defaultStyles.profileC.color};
    }
    .readerView[data-readerviewprofile="C"] :is(a, a *) {
        text-decoration: underline;
        color:${defaultStyles.profileC.linkColor};
    }
    .readerView.readerView {
      text-align:start;
      font-family:${defaultStyles.fontFamily};
      font-size:${defaultStyles.fontSize}rem;
      line-height:${defaultStyles.lineHeight};
      word-spacing:${defaultStyles.wordSpacing}em;
      letter-spacing:${defaultStyles.letterSpacing}em;
      max-width: ${defaultStyles.maxWidth}em;
      margin: 0 auto;
      overflow: auto; /* For when things can't collapse far enough */
      padding: 1em !important; /* override yahoo */
    }
    .readerView.readerView *{
      text-align:start;
    }
    .readerView.readerView button{display:none} /* Outlook zoom button */
    `;

    // Find elements wrapping the email content
    let wrapper = '';
    // for Gmail
    if (window.location.hostname === "mail.google.com"){
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      const view = urlParams.get('view')
      // If clipped view
      if (view === "lg"){
        wrapper = document.querySelectorAll("table.message > tbody > tr > td > table > tbody > tr:last-of-type > td > div");
      } else {
      // If inbox view
        wrapper = document.querySelectorAll(".ii");
      }
    };
    // For Outlook.com
    if (window.location.hostname === "outlook.live.com" || window.location.hostname === "outlook.office.com"){
      wrapper = document.querySelectorAll("[aria-label='Message body']");
    };
    // For Yahoo
    if (window.location.hostname === "mail.yahoo.com"){
      wrapper = document.querySelectorAll(".msg-body");
    };
    // For AOL
    if (window.location.hostname === "mail.aol.com"){
      // 2 selectors for AOL, as the new version uses the same as Yahoo
      wrapper = document.querySelectorAll(".AOLWebSuite > div[id], .msg-body");
    };

    // inject empty style element
    if(!document.querySelector('#ervStyleElement')) {
      const ervStyleElement = document.createElement('style');
      ervStyleElement.setAttribute('id', 'ervStyleElement'); // setting [data-readerview] attribute interferes with cleanly appending new styles. needs debugging  
      [...wrapper][0].parentElement.prepend(ervStyleElement)
    }

    // Insert CSS into style element
    for (let item of wrapper) {
      // Ignore AMP emails
      const iframe = item.querySelector('iframe');
      if (iframe === null){
        item.classList.add("readerView");
        item.setAttribute("data-readerViewProfile", defaultStyles.currentProfile);
        document.querySelector('#ervStyleElement').replaceChildren(styleSheet)
      } else {
        alert("Reader view does not yet support AMP email");
        break;
      }
    }
    // Pull out all the elements in the email
    let email = document.querySelectorAll(".readerView *");
    // Loop through elements in the email
    for (let item of email) {
      // If it's a hidden element, keep it hidden
      let style = window.getComputedStyle(item);
      if (style.display === "none"){
        item.setAttribute("date-hidden", "");
      }
      if (item.getAttribute("aria-hidden") == 'true'){
        item.setAttribute("date-hidden", "");
      }
      // Remove old emoji before appling new ones
      if (item.hasAttribute("data-erv-emoji")){
        item.remove()
      }
      // Replace Gmail emoji with regular ones
      if (item.hasAttribute("data-emoji") && defaultStyles.blockImages == false){
        let alt = item.getAttribute("alt");
        item.insertAdjacentHTML("beforebegin", '<span data-erv-emoji>' + alt + '</span>');
        item.setAttribute("date-hidden", "");
      }
      // Replace images with alt text
      if (defaultStyles.blockImages){
        if (item.tagName == "IMG" && !item.hasAttribute('hidden')) {
          let alt = item.getAttribute("alt");
          if (alt == null|| alt.trim() == ''){
            alt = '' 
          }
          let fauxImg = document.createElement("span")
          // If linked image with no alt text, show href as alt
          if (item.parentNode.tagName == 'A' && item.parentNode.children.length == '1'  && item.parentNode.textContent.trim() == ''){
            if (alt == ''){
              alt = item.parentNode.getAttribute("href");
            }
          }
          fauxImg.innerText = alt.trim();
          fauxImg.classList.add("blockedImage");
          item.insertAdjacentHTML("beforebegin", fauxImg.outerHTML);
        }
      }
      // If a link has no content then show the href
      if (item.tagName == 'A' && item.innerHTML.trim() == ''){
        let href = item.getAttribute("href");
        item.insertAdjacentHTML("afterbegin", href);
      }
      // Remove spacer elements, if the only content is a &nbsp;
      if (item.innerHTML.trim() == "&nbsp;"){
        item.innerHTML = "";
      }
      // Replace styling attributes
      replaceAttribute("style")
      replaceAttribute("class")
      replaceAttribute("id")
      replaceAttribute("align")
      replaceAttribute("color")
      replaceAttribute("background")
      replaceAttribute("bgcolor")
      replaceAttribute("width")
      replaceAttribute("height")
      function replaceAttribute(attribute) {
        if (item.hasAttribute(attribute)){
          let attributeValue = item.getAttribute(attribute);
          let attributeName = "data-removed" + attribute;
          item.setAttribute(attributeName, attributeValue);
          item.removeAttribute(attribute)
        }
      }
    }; 
  });
}
function readerViewOfff() {
  // Replace removed attributes
  let email = document.querySelectorAll(".readerView *");
  for (let item of email) {
    // Replace styling attributes
    restoreAttribute("style")
    restoreAttribute("class")
    restoreAttribute("id")
    restoreAttribute("align")
    restoreAttribute("color")
    restoreAttribute("background")
    restoreAttribute("bgcolor")
    restoreAttribute("width")
    restoreAttribute("height")
    function restoreAttribute(attribute) {
      if (item.hasAttribute("data-removed" + attribute)){
        let attributeValue = item.getAttribute("data-removed" + attribute);
        let attributeName = "data-removed" + attribute;
        item.setAttribute(attribute, attributeValue);
        item.removeAttribute("data-removed" + attribute)
      }
    }
    if (item.hasAttribute("data-hidden")){
      item.removeAttribute("data-hidden")
    }
    if (item.hasAttribute("data-erv-emoji")){
      item.remove()
    }
  }

  // Remove readerView class
  let wrapper = document.querySelectorAll(".readerView");
  for (let item of wrapper) {
    item.classList.remove("readerView");
    item.removeAttribute("data-readerviewprofile");
  }

  // Remove added reader view elements
  let style = document.querySelectorAll(".blockedImage");
  for (let item of style) {
    item.remove();
  }
}

// Pull default styles from background.js and apply to controls in the popup
chrome.storage.sync.get("defaultStyles", ({ defaultStyles }) => {
  applyChromeStorageStyles(defaultStyles)
});

// Listen for changes in the settings form
const _manageDefaultStyles = ({ defaultStyles }) => {
  var currentProfile = document.querySelector('input[name="readerviewProfile"]:checked').value;
  var nameA = document.getElementById('nameA').value;
  var backgroundColorA = document.getElementById('backgroundColorA').value;
  var colorA= document.getElementById('colorA').value;
  var linkColorA= document.getElementById('linkColorA').value;
  var nameB = document.getElementById('nameB').value;
  var backgroundColorB = document.getElementById('backgroundColorB').value;
  var colorB= document.getElementById('colorB').value;
  var linkColorB= document.getElementById('linkColorB').value;
  var nameC = document.getElementById('nameC').value;
  var backgroundColorC = document.getElementById('backgroundColorC').value;
  var colorC= document.getElementById('colorC').value;
  var linkColorC= document.getElementById('linkColorC').value;
  var fontFamily= document.getElementById('fontFamily').value;
  var fontSize= document.getElementById('fontSize').value;
  var lineHeight= document.getElementById('lineHeight').value;
  var wordSpacing= document.getElementById('wordSpacing').value;
  var letterSpacing= document.getElementById('letterSpacing').value;
  var maxWidth= document.getElementById('maxWidth').value;
  var blockImages= document.getElementById('blockImages').checked;
  
  // update any changes to settings
  chrome.storage.sync.set({'defaultStyles':{
    currentProfile:currentProfile,
    profileA:{
      name: nameA,
      backgroundColor: backgroundColorA,
      color: colorA,
      linkColor:linkColorA
    },
    profileB:{
      name: nameB,
      backgroundColor: backgroundColorB,
      color: colorB,
      linkColor:linkColorB
    },
    profileC:{
      name: nameC,
      backgroundColor: backgroundColorC,
      color: colorC,
      linkColor:linkColorC
    },
    fontFamily:fontFamily,
    fontSize:fontSize,
    lineHeight:lineHeight,
    wordSpacing:wordSpacing,
    letterSpacing:letterSpacing,
    maxWidth:maxWidth,
    blockImages:blockImages
  }})
}

// Listen for specific events
_optionsForm.addEventListener('change', debounce(_manageDefaultStyles, 100));
_optionsForm.addEventListener('input', debounce(_manageDefaultStyles, 100));

// update form UI values in real time
_optionsForm.addEventListener('change', () => {
  document.getElementById('backgroundColorValueA').textContent = document.querySelector('#backgroundColorA').value
  document.getElementById('colorValueA').textContent = document.querySelector('#colorA').value
  document.getElementById('linkColorValueA').textContent = document.querySelector('#linkColorA').value
  document.getElementById('readerViewA').textContent = document.querySelector('#nameA').value
  document.getElementById('readerViewA').style.backgroundColor = document.querySelector('#backgroundColorA').value
  document.getElementById('readerViewA').style.color = document.querySelector('#colorA').value

  document.getElementById('backgroundColorValueB').textContent = document.querySelector('#backgroundColorB').value
  document.getElementById('colorValueB').textContent = document.querySelector('#colorB').value
  document.getElementById('linkColorValueB').textContent = document.querySelector('#linkColorB').value
  document.getElementById('readerViewB').textContent = document.querySelector('#nameB').value
  document.getElementById('readerViewB').style.backgroundColor = document.querySelector('#backgroundColorB').value
  document.getElementById('readerViewB').style.color = document.querySelector('#colorB').value

  document.getElementById('backgroundColorValueC').textContent = document.querySelector('#backgroundColorC').value
  document.getElementById('colorValueC').textContent = document.querySelector('#colorC').value
  document.getElementById('linkColorValueC').textContent = document.querySelector('#linkColorC').value
  document.getElementById('readerViewC').textContent = document.querySelector('#nameC').value
  document.getElementById('readerViewC').style.backgroundColor = document.querySelector('#backgroundColorC').value
  document.getElementById('readerViewC').style.color = document.querySelector('#colorC').value
});

_optionsForm.addEventListener('change', () => {
  document.getElementById('fontFamilyValue').textContent = document.querySelector('#fontFamily').value
  document.getElementById('maxWidthValue').textContent = document.querySelector('#maxWidth').value
  document.getElementById('fontSizeValue').textContent = document.querySelector('#fontSize').value
  document.getElementById('lineHeightValue').textContent = document.querySelector('#lineHeight').value
  document.getElementById('wordSpacingValue').textContent = document.querySelector('#wordSpacing').value
  document.getElementById('letterSpacingValue').textContent = document.querySelector('#letterSpacing').value
  document.getElementById('blockImagesValue').textContent = document.querySelector('#blockImages').checked
});

// refactor this in the future
// loop through all profiles, add event listeners, and update corresponding UI
// values must match the profile name
const profiles = Array.from(document.querySelectorAll('.profiles input'))
for(let profile of profiles) {
  document.querySelector(`fieldset.profile${profile.value}`).addEventListener('input', () => {
    document.querySelector(`#readerView${profile.value}Label`).textContent = document.querySelector(`#name${profile.value}`).value
    document.querySelector(`#readerView${profile.value}Label`).style.backgroundColor = document.querySelector(`#backgroundColor${profile.value}`).value
    document.querySelector(`#readerView${profile.value}Label`).style.color = document.querySelector(`#color${profile.value}`).value
  })
}


document.querySelector('#resetStyles').addEventListener('click', () => {
  chrome.storage.sync.get('resetStyles', (result) => {
    chrome.storage.sync.set({ 'defaultStyles': result.resetStyles })
    applyChromeStorageStyles(result.resetStyles)
  })
  _tabManager(readerViewEmail)
  stateManagement()
})

function applyChromeStorageStyles(styles) {
  if (styles.currentProfile == 'A') {
    // readerViewA.setAttribute("checked", "");
    document.querySelector('#readerViewA').checked = true
  }
  if (styles.currentProfile == 'B') {
    // readerViewB.setAttribute("checked", "");
    document.querySelector('#readerViewB').checked = true
  }
  if (styles.currentProfile == 'C') {
    // readerViewC.setAttribute("checked", "");
    document.querySelector('#readerViewC').checked = true
  }
  // set button style
  readerViewALabel.textContent = styles.profileA.name;
  readerViewALabel.style.backgroundColor = styles.profileA.backgroundColor;
  readerViewALabel.style.color = styles.profileA.color;

  readerViewBLabel.textContent = styles.profileB.name;
  readerViewBLabel.style.backgroundColor = styles.profileB.backgroundColor;
  readerViewBLabel.style.color = styles.profileB.color;

  readerViewCLabel.textContent = styles.profileC.name;
  readerViewCLabel.style.backgroundColor = styles.profileC.backgroundColor;
  readerViewCLabel.style.color = styles.profileC.color;
  // set input values
  nameA.value = styles.profileA.name
  backgroundColorA.value = styles.profileA.backgroundColor;
  backgroundColorValueA.textContent = styles.profileA.backgroundColor;
  colorA.value = styles.profileA.color;
  colorValueA.textContent = styles.profileA.color;
  linkColorA.value = styles.profileA.linkColor;
  linkColorValueA.textContent = styles.profileA.linkColor;

  nameB.value = styles.profileB.name
  backgroundColorB.value = styles.profileB.backgroundColor;
  backgroundColorValueB.textContent = styles.profileB.backgroundColor;
  colorB.value = styles.profileB.color;
  colorValueB.textContent = styles.profileB.color;
  linkColorB.value = styles.profileB.linkColor;
  linkColorValueB.textContent = styles.profileB.linkColor;

  nameC.value = styles.profileC.name
  backgroundColorC.value = styles.profileC.backgroundColor;
  backgroundColorValueC.textContent = styles.profileC.backgroundColor;
  colorC.value = styles.profileC.color;
  colorValueC.textContent = styles.profileC.color;
  linkColorC.value = styles.profileC.linkColor;
  linkColorValueC.textContent = styles.profileC.linkColor;

  fontSize.value = styles.fontSize;
  fontSizeValue.textContent = styles.fontSize + 'rem';
  fontFamily.value = styles.fontFamily;
  fontFamilyValue.textContent = styles.fontFamily;
  lineHeight.value = styles.lineHeight;
  lineHeightValue.textContent = styles.lineHeight;
  wordSpacing.value = styles.wordSpacing;
  wordSpacingValue.textContent = styles.wordSpacing + 'em';
  letterSpacing.value = styles.letterSpacing;
  letterSpacingValue.textContent = styles.letterSpacing + 'em';
  maxWidth.value = styles.maxWidth;
  maxWidthValue.textContent = styles.maxWidth + 'em';
  blockImages.checked = styles.blockImages;
  blockImagesValue.textContent = styles.blockImages;
}