let defaultStyles = {
  currentProfile:'A',
  profileA: { 
    name: 'Light',
    backgroundColor: '#fffff5',
    color: '#202020',
    linkColor: '#0045bd'
  },
  profileB: { 
    name: 'Dark',
    backgroundColor: '#202020',
    color: '#eeeeee',
    linkColor: '#8ab4f8'
  },
  profileC: { 
    name: 'Sepia',
    backgroundColor: '#ffeedd',
    color: '#332211',
    linkColor: '#8f2600'
  },
  fontFamily: 'sans-serif',
  fontSize: '1',
  lineHeight: '1.5',
  wordSpacing: '.2',
  letterSpacing: '.08',
  maxWidth: '40',
  linkColor: '#3101ee',
  blockImages: false
};
const resetStyles = {
  ...defaultStyles,
};
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ defaultStyles });
  chrome.storage.sync.set({ resetStyles });
  console.log(defaultStyles);
});

// Wrap in an onInstalled callback in order to avoid unnecessary work
// every time the background script is run
chrome.runtime.onInstalled.addListener(() => {
  // Page actions are disabled by default and enabled on select tabs
  chrome.action.disable();

  // Clear all rules to ensure only our expected rules are set
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    // Declare a rule to enable the action on supported webmail pages
    let webmailPage = {
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {hostSuffix: 'mail.google.com'},
        }),
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {hostSuffix: 'mail.yahoo.com'},
        }),
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {hostSuffix: 'mail.aol.com'},
        }),
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {hostSuffix: 'outlook.live.com'},
        }),
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {hostSuffix: 'outlook.office.com'},
        })
      ],
      actions: [new chrome.declarativeContent.ShowAction()],
    };

    // Finally, apply our new array of rules
    let rules = [webmailPage];
    chrome.declarativeContent.onPageChanged.addRules(rules);
  });
});