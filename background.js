let defaultStyles = {
  backgroundColor: '#ffeedd',
  color: '#332211',
  textAlign: 'start',
  fontFamily: 'sans-serif',
  fontSize: '1',
  lineHeight: '1.5',
  wordSpacing: '.2',
  letterSpacing: '.08',
  maxWidth: '40',
  linkColor: '#3101ee',
  blockImages: false
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ defaultStyles });
  console.log(defaultStyles);
});

// chrome.storage.onChanged.addListener(function (changes, namespace) {
//   for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
//     console.log(
//       `Storage key "${key}" in namespace "${namespace}" changed.`,
//       `Old value was "${JSON.stringify(oldValue)}", new value is "${JSON.stringify(newValue)}".`
//     );
//   }
// });
