const enableReaderView = (profile, settings, currentProfile) => {
  let wrappers = []

  const styleSheet = `
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
      background:${profile[0].backgroundColor};
      color: ${profile[0].color};
    }
    .readerView[data-readerviewprofile="A"] :is(a, a *) {
        text-decoration: underline;
        color:${profile[0].linkColor};
    }
    .readerView[data-readerviewprofile="B"]{
      background:${profile[1].backgroundColor};
      color: ${profile[1].color};
    }
    .readerView[data-readerviewprofile="B"] :is(a, a *) {
        text-decoration: underline;
        color:${profile[1].linkColor};
    }
    .readerView[data-readerviewprofile="C"]{
      background:${profile[2].backgroundColor};
      color: ${profile[2].color};
    }
    .readerView[data-readerviewprofile="C"] :is(a, a *) {
        text-decoration: underline;
        color:${profile[2].linkColor};
    }
    .readerView.readerView {
      text-align:${settings.textAlign};
      font-family:${settings.fontFamily};
      font-size:${settings.fontSize}rem;
      line-height:${settings.lineHeight};
      word-spacing:${settings.wordSpacing}em;
      letter-spacing:${settings.letterSpacing}em;
      max-width: ${settings.maxWidth}em;
      margin: 0 auto;
      overflow: auto; /* For when things can't collapse far enough */
      padding: 1em !important; /* override yahoo */
    }
    .readerView.readerView *{
      text-align:${settings.textAlign};
    }
  .readerView.readerView button{display:none} /* Outlook zoom button */
  `
  let style = document.querySelectorAll('.blockedImage')
  for (let item of Array.from(style)) {
    item.remove()
  }

  if (window.location.hostname === 'mail.google.com') {
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    const view = urlParams.get('view')
    if (view === 'lg') {
      wrappers = Array.from(document.querySelectorAll('table.message > tbody > tr > td > table > tbody > tr:last-of-type > td > div'))
    } else {
      wrappers = Array.from(document.querySelectorAll('.a3s'))
    }
  }

  if (window.location.hostname === 'outlook.live.com') {
    wrappers = Array.from(document.querySelectorAll("[aria-label='Message body']"))
  }

  if (window.location.hostname === 'mail.yahoo.com') {
    wrappers = Array.from(document.querySelectorAll('.msg-body'))
  }

  if (window.location.hostname === 'mail.aol.com') {
    wrappers = Array.from(document.querySelectorAll('.AOLWebSuite > div[id], .msg-body'))
  }

  if (!document.querySelector('#ervStyleElement')) {
    const ervStyleElement = document.createElement('style')
    ervStyleElement.setAttribute('id', 'ervStyleElement')
    wrappers[0].parentElement.prepend(ervStyleElement)
  }

  for (let wrapper of Array.from(wrappers)) {
    const iframe = wrapper.querySelector('iframe')
    if (iframe === null) {
      wrapper.classList.add('readerView')
      wrapper.setAttribute('data-readerViewProfile', currentProfile)
      document.querySelector('#ervStyleElement').replaceChildren(styleSheet)
    } else {
      alert('Reader view does not yet support AMP email')
      break
    }
  }

  const emails = Array.from(document.querySelectorAll('.readerView *'))

  for (let item of emails) {
    let style = window.getComputedStyle(item)
    if (style.display === 'none') {
      item.setAttribute('date-hidden', '')
    }

    if (item.getAttribute('aria-hidden') == 'true') {
      item.setAttribute('date-hidden', '')
    }

    if (item.hasAttribute('data-erv-emoji')) {
      item.remove()
    }

    if (item.hasAttribute('data-emoji') && settings.blockImages == false) {
      let alt = item.getAttribute('alt')
      item.insertAdjacentHTML('beforebegin', '<span data-erv-emoji>' + alt + '</span>')
      item.setAttribute('date-hidden', '')
    }

    if (settings.blockImages) {
      if (item.tagName == 'IMG' && !item.hasAttribute('hidden')) {
        let alt = item.getAttribute('alt')
        if (alt == null || alt.trim() == '') {
          alt = ''
        }
        let fauxImg = document.createElement('span')

        if (item.parentNode.tagName == 'A' && item.parentNode.children.length == '1' && item.parentNode.textContent.trim() == '') {
          if (alt == '') {
            alt = item.parentNode.getAttribute('href')
          }
        }
        fauxImg.innerText = alt.trim()
        fauxImg.classList.add('blockedImage')
        item.insertAdjacentHTML('beforebegin', fauxImg.outerHTML)
      }
    }

    if (item.tagName == 'A' && item.innerHTML.trim() == '') {
      let href = item.getAttribute('href')
      item.insertAdjacentHTML('afterbegin', href)
    }

    if (item.innerHTML.trim() == '&nbsp;') {
      item.innerHTML = ''
    }

    replaceAttribute('style')
    replaceAttribute('class')
    replaceAttribute('id')
    replaceAttribute('align')
    replaceAttribute('color')
    replaceAttribute('background')
    replaceAttribute('bgcolor')
    replaceAttribute('width')
    replaceAttribute('height')
    function replaceAttribute(attribute) {
      if (item.hasAttribute(attribute)) {
        let attributeValue = item.getAttribute(attribute)
        let attributeName = 'data-removed' + attribute
        item.setAttribute(attributeName, attributeValue)
        item.removeAttribute(attribute)
      }
    }
  }
}
export default enableReaderView
