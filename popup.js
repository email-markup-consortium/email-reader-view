// When the button is clicked, inject readerView into current page
readerView.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: readerViewEmail,
  });
});
readerViewOff.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: readerViewOfff,
  });
});

// Function will be execueted as a content script inside the current page
function readerViewEmail() {
  // Remove previously added reader view elements
  let style = document.querySelectorAll("style[data-readerview], .blockedImage");
  for (let item of style) {
    item.remove();
  }

  // Get the default styles from background.js
  chrome.storage.sync.get("defaultStyles", ({ defaultStyles }) => {
    // Create styleSheet to revert styles and add our own
    let styleSheet = `<style data-readerview>
    .readerView.readerView * {all: revert}
    .readerView.readerView [hidden]{display:none}
    .readerView.readerView img{max-width:100%}
    .readerView.readerView table {display:block;}
    .readerView.readerView table :where(td, th, tr, tbody){display:contents; width:100%}
    .readerView.readerView :is(
      table:has(th[scope]),
      table:has(th+td):has(tr+tr),
      table:has(th):has(td + td)
    ),
    .readerView.readerView :is(
      table:has(th[scope]),
      table:has(th+td):has(tr+tr),
      table:has(th):has(td + td)
    ) :where(td, th, tr, tbody){
      display:revert;
      width:revert;
      border:1px solid;
      border-spacing:.2em
    }
    .readerView.readerView .blockedImage:not(:empty) {
      border: 1px dashed;
      padding: 1em;
      display:inline-block
    }
    .readerView.readerView .blockedImage + img {
        display: none;
    }
    .readerView.readerView :is(a, a *) {
        text-decoration: underline;
        color:${defaultStyles.linkColor};
    }
    .readerView.readerView {
      background:${defaultStyles.backgroundColor};
      color: ${defaultStyles.color};
      text-align:${defaultStyles.textAlign};
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
      text-align:${defaultStyles.textAlign};
    }
    .readerView.readerView button{display:none} /* Outlook zoom button */
    </style>`;

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
        wrapper = document.querySelectorAll(".a3s");
      }
    };
    // For Outlook.com
    if (window.location.hostname === "outlook.live.com"){
      wrapper = document.querySelectorAll("[aria-label='Message body']");
    };
    // For Yahoo
    if (window.location.hostname === "mail.yahoo.com"){
      wrapper = document.querySelectorAll(".msg-body");
    };
    // For AOL
    if (window.location.hostname === "mail.aol.com"){
      wrapper = document.querySelectorAll(".AOLWebSuite > div[id]");
    };

    // Insert stylesheet
    for (let item of wrapper) {
      item.classList.add("readerView");
      item.insertAdjacentHTML("beforebegin", styleSheet);
    }
    // Pull out all the elements in the email
    let email = document.querySelectorAll(".readerView *");
    // Loop through elements in the email
    for (let item of email) {
      // If it's a hidden element, keep it hidden
      let style = window.getComputedStyle(item);
      if (style.display === "none"){
        item.setAttribute("hidden", "");
      }
      // Replace Gmail emoji with regular ones
      if (item.hasAttribute("data-emoji")){
        let alt = item.getAttribute("alt");
        item.insertAdjacentHTML("beforebegin", alt);
        item.remove()
      }
      // Replace images with alt text
      if (defaultStyles.blockImages){
        if (item.tagName == "IMG" && !item.hasAttribute('hidden')) {
          let alt = item.getAttribute("alt");
          let fauxImg = document.createElement("span")
          fauxImg.innerText = alt;
          fauxImg.classList.add("blockedImage");
          item.insertAdjacentHTML("beforebegin", fauxImg.outerHTML);
        }
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
  }

  // Remove readerView class
  let wrapper = document.querySelectorAll(".readerView");
  for (let item of wrapper) {
    item.classList.remove("readerView");
  }

  // Remove added reader view elements
  let style = document.querySelectorAll("style[data-readerview], .blockedImage");
  for (let item of style) {
    item.remove();
  }
}

// Pull default styles from background.js and apply to controls in the popup
chrome.storage.sync.get("defaultStyles", ({ defaultStyles }) => {
  backgroundColor.value = defaultStyles.backgroundColor;
  backgroundColorValue.textContent = defaultStyles.backgroundColor;
  color.value = defaultStyles.color;
  colorValue.textContent = defaultStyles.color;
  fontSize.value = defaultStyles.fontSize;
  fontSizeValue.textContent = defaultStyles.fontSize + 'rem';
  textAlign.value = defaultStyles.textAlign;
  textAlignValue.textContent = defaultStyles.textAlign;
  fontFamily.value = defaultStyles.fontFamily;
  fontFamilyValue.textContent = defaultStyles.fontFamily;
  lineHeight.value = defaultStyles.lineHeight;
  lineHeightValue.textContent = defaultStyles.lineHeight;
  wordSpacing.value = defaultStyles.wordSpacing;
  wordSpacingValue.textContent = defaultStyles.wordSpacing + 'em';
  letterSpacing.value = defaultStyles.letterSpacing;
  letterSpacingValue.textContent = defaultStyles.letterSpacing + 'em';
  maxWidth.value = defaultStyles.maxWidth;
  maxWidthValue.textContent = defaultStyles.maxWidth + 'em';
  linkColor.value = defaultStyles.linkColor;
  linkColorValue.textContent = defaultStyles.linkColor;
  blockImages.checked = defaultStyles.blockImages;
  blockImagesValue.textContent = defaultStyles.blockImages;
});

// Listen for changes in the settings form
optionsForm.addEventListener('change', ({ defaultStyles }) => {
  var backgroundColor = document.getElementById('backgroundColor').value;
  var color= document.getElementById('color').value;
  var textAlign= document.getElementById('textAlign').value;
  var fontFamily= document.getElementById('fontFamily').value;
  var fontSize= document.getElementById('fontSize').value;
  var lineHeight= document.getElementById('lineHeight').value;
  var wordSpacing= document.getElementById('wordSpacing').value;
  var letterSpacing= document.getElementById('letterSpacing').value;
  var maxWidth= document.getElementById('maxWidth').value;
  var linkColor= document.getElementById('linkColor').value;
  var blockImages= document.getElementById('blockImages').checked;
  // update any changes to settings
  chrome.storage.sync.set({'defaultStyles':{
    backgroundColor: backgroundColor,
    color: color,
    textAlign:textAlign,
    fontFamily:fontFamily,
    fontSize:fontSize,
    lineHeight:lineHeight,
    wordSpacing:wordSpacing,
    letterSpacing:letterSpacing,
    maxWidth:maxWidth,
    linkColor:linkColor,
    blockImages:blockImages
  }})
});
