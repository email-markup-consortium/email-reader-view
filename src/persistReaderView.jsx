/*
WORK IN PROGRESS:
experimenting with a feature which will persist the reader view settings while navigating between emails in the inbox.
it's buggy and not ready for prime time, but I'm leaving it in the codebase for now.
TLDR:
  - this is Gmail only for now.
  - popup.js sends the necessary settings to the content-script.js
  - content-script stores them in local storage.
  - if the reader view is enabled when the user clicks on an email in the inbox, the content script will wait 250ms then apply the reader view to the email.
TODO: 
  - look for a better way to do this, or just remove it entirely.
  - also take into account reading pane settings.
  - utilize react if necessary or advantageous.  
*/

import enableReaderView from './utils/enableReaderView'

chrome.runtime.onMessage.addListener(({ profiles, settings, currentProfile, toggleButton }) => {
  localStorage.setItem('localProfiles', JSON.stringify(profiles))
  localStorage.setItem('localSettings', JSON.stringify(settings))
  localStorage.setItem('currentProfile', currentProfile)
  localStorage.setItem('toggleButton', toggleButton)

  const inboxPreviews = Array.from(document.querySelectorAll('tr.zA.yO'))

  for (let inboxPreview of inboxPreviews) {
    inboxPreview.addEventListener('click', (e) => {
      if (JSON.parse(localStorage.getItem('toggleButton'))) {
        setTimeout(() => {
          enableReaderView(profiles, settings, currentProfile)
        }, 250)
      }
    })
  }
})
