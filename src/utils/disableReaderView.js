const disableReaderView = () => {
  const email = document.querySelectorAll('.readerView *')
  for (let item of Array.from(email)) {
    // Replace styling attributes
    restoreAttribute('style')
    restoreAttribute('class')
    restoreAttribute('id')
    restoreAttribute('align')
    restoreAttribute('color')
    restoreAttribute('background')
    restoreAttribute('bgcolor')
    restoreAttribute('width')
    restoreAttribute('height')
    function restoreAttribute(attribute) {
      if (item.hasAttribute('data-removed' + attribute)) {
        let attributeValue = item.getAttribute('data-removed' + attribute)
        let attributeName = 'data-removed' + attribute
        item.setAttribute(attribute, attributeValue)
        item.removeAttribute('data-removed' + attribute)
      }
    }
    if (item.hasAttribute('data-hidden')) {
      item.removeAttribute('data-hidden')
    }
    if (item.hasAttribute('data-erv-emoji')) {
      item.remove()
    }
  }

  const wrapper = document.querySelectorAll('.readerView')
  for (let item of Array.from(wrapper)) {
    item.classList.remove('readerView')
    item.removeAttribute('data-readerviewprofile')
  }

  const style = document.querySelectorAll('.blockedImage')
  for (let item of Array.from(style)) {
    item.remove()
  }
}
export default disableReaderView
