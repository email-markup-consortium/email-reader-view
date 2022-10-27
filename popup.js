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
      // 2 selectors for AOL, as teh new version uses the same as Yahoo
      wrapper = document.querySelectorAll(".AOLWebSuite > div[id], .msg-body");
    };


    // Insert stylesheet
    for (let item of wrapper) {
      // Ignore AMP emails
      const iframe = item.querySelector('iframe');
      if (iframe === null){
        item.classList.add("readerView");
        item.insertAdjacentHTML("beforebegin", styleSheet);
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
      // Replace Gmail emoji with regular ones
      if (item.hasAttribute("data-emoji") && defaultStyles.blockImages == false){
        let alt = item.getAttribute("alt");
        item.insertAdjacentHTML("beforebegin", '<span data-srv-emoji>' + alt + '</span>');
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
    if (item.hasAttribute("data-srv-emoji")){
      item.remove()
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
