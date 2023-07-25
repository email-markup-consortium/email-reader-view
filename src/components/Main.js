import React, { useState, useEffect } from 'react'
import disableReaderView from '../utils/disableReaderView'
import enableReaderView from '../utils/enableReaderView'

const Main = () => {
  const initialProfiles = [
    {
      id: 'A',
      profile: 'readerViewA',
      name: 'Light',
      backgroundColor: '#FFFDD0',
      color: '#202020',
      linkColor: '#3101ee',
    },
    {
      id: 'B',
      profile: 'readerViewB',
      name: 'Dark',
      backgroundColor: '#202020',
      color: '#eeeeee',
      linkColor: '#8ab4f8',
    },
    {
      id: 'C',
      profile: 'readerViewC',
      name: 'Sepia',
      backgroundColor: '#ffeedd',
      color: '#332211',
      linkColor: '#3101ee',
    },
  ]
  const initialSettings = {
    textAlign: 'start',
    fontFamily: 'sans-serif',
    fontSize: 1,
    lineHeight: 1.5,
    wordSpacing: 0.2,
    letterSpacing: 0.08,
    maxWidth: 40,
    linkColor: '#3101ee',
    blockImages: false,
  }
  const profilesFromLocalStorage = JSON.parse(localStorage.getItem('localProfiles')) || initialProfiles
  const settingsFromLocalStorage = JSON.parse(localStorage.getItem('localSettings')) || initialSettings
  const currentProfileFromLocalStorage = localStorage.getItem('currentProfile') || 'A'
  const toggleButtonFromLocalStorage = JSON.parse(localStorage.getItem('toggleButton')) || false

  const [toggleButton, setToggleButton] = useState(toggleButtonFromLocalStorage)
  const [currentProfile, setCurrentProfile] = useState(currentProfileFromLocalStorage)
  const [profiles, setProfiles] = useState(profilesFromLocalStorage)
  const [settings, setSettings] = useState(settingsFromLocalStorage)

  const toggleReaderView = (toggleButton, profiles, settings, currentProfile) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTabId = tabs[0].id
      chrome.scripting.executeScript({
        target: { tabId: activeTabId },
        function: toggleButton ? enableReaderView : disableReaderView,
        args: [profiles, settings, currentProfile],
      })
      chrome.tabs.sendMessage(activeTabId, { toggleButton, profiles, settings, currentProfile })
    })
  }

  useEffect(() => {
    toggleReaderView(toggleButton, profiles, settings, currentProfile)
    localStorage.setItem('localProfiles', JSON.stringify(profiles))
    localStorage.setItem('localSettings', JSON.stringify(settings))
    localStorage.setItem('currentProfile', currentProfile)
    localStorage.setItem('toggleButton', toggleButton)
  }, [toggleButton, profiles, settings, currentProfile])

  return (
    <>
      <button
        type='button'
        className='button toggle-button'
        onClick={() => {
          setToggleButton(!toggleButton)
        }}
      >
        {toggleButton ? 'Disable' : 'Enable'} Reader View
      </button>
      <menu role='menubar' className='profiles'>
        <fieldset className='profiles'>
          <legend>Select Profile</legend>
          <div>
            {profiles.map(({ id, profile, name }) => {
              return (
                <React.Fragment key={id}>
                  <input
                    type='radio'
                    name='profiles'
                    id={profile}
                    checked={currentProfile === id}
                    value={id}
                    onChange={(e) => {
                      setCurrentProfile(e.target.value)
                    }}
                  />
                  <label className='button' htmlFor={profile}>
                    {name}
                  </label>
                </React.Fragment>
              )
            })}
          </div>
        </fieldset>
      </menu>

      {profiles.map(({ id, name }, index) => {
        return (
          <fieldset key={id} className={currentProfile === id ? 'display-profile' : ''} hidden>
            <legend>{name} Profile</legend>
            <div className='selectStyles'>
              <label>
                <span>Name:</span>
                <span>
                  <input
                    type='text'
                    value={profiles[index].name}
                    onChange={(e) => {
                      setProfiles((previousProfiles) => {
                        const updatedProfiles = [...previousProfiles]
                        updatedProfiles[index].name = e.target.value
                        return updatedProfiles
                      })
                    }}
                  />
                </span>
              </label>
              <label>
                <span>Background:</span>
                <span>
                  <input
                    type='color'
                    value={profiles[index].backgroundColor}
                    onChange={(e) => {
                      setProfiles((previousProfiles) => {
                        const updatedProfiles = [...previousProfiles]
                        updatedProfiles[index].backgroundColor = e.target.value
                        return updatedProfiles
                      })
                    }}
                  />
                </span>
              </label>
              <label>
                <span>Text:</span>
                <span>
                  <input
                    type='color'
                    value={profiles[index].color}
                    onChange={(e) => {
                      setProfiles((previousProfiles) => {
                        const updatedProfiles = [...previousProfiles]
                        updatedProfiles[index].color = e.target.value
                        return updatedProfiles
                      })
                    }}
                  />
                </span>
              </label>
              <label>
                <span>Links:</span>
                <span>
                  <input
                    type='color'
                    value={profiles[index].linkColor}
                    onChange={(e) => {
                      setProfiles((previousProfiles) => {
                        const updatedProfiles = [...previousProfiles]
                        updatedProfiles[index].linkColor = e.target.value
                        return updatedProfiles
                      })
                    }}
                  />
                </span>
              </label>
            </div>
          </fieldset>
        )
      })}
      <details>
        <summary>General settings</summary>
        <div className='selectStyles'>
          <label>
            <span>Width:</span>
            <span>
              <input
                type='range'
                name='maxWidth'
                id='maxWidth'
                min='20'
                max='70'
                step='.5'
                value={settings.maxWidth}
                onChange={(e) => {
                  setSettings({ ...settings, maxWidth: e.target.value })
                }}
              />
            </span>
          </label>
          <label>
            <span>Font family:</span>
            <span>
              <select
                name='fontFamily'
                id='fontFamily'
                value={settings.fontFamily}
                onChange={(e) => {
                  setSettings({ ...settings, fontFamily: e.target.value })
                }}
              >
                {['serif', 'sans-serif', 'monospace', 'cursive'].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </span>
          </label>
          <label>
            <span>Font size:</span>
            <span>
              <input
                type='range'
                name='fontSize'
                id='fontSize'
                min='.5'
                max='3'
                step='.25'
                value={settings.fontSize}
                onChange={(e) => {
                  setSettings({ ...settings, fontSize: e.target.value })
                }}
              />
            </span>
          </label>
          <label>
            <span>Line height:</span>
            <span>
              <input
                type='range'
                name='lineHeight'
                id='lineHeight'
                min='1'
                max='2'
                step='.1'
                value={settings.lineHeight}
                onChange={(e) => {
                  setSettings({ ...settings, lineHeight: e.target.value })
                }}
              />
            </span>
          </label>
          <label>
            <span>Word spacing:</span>
            <span>
              <input
                type='range'
                name='wordSpacing'
                id='wordSpacing'
                min='0'
                max='1'
                step='.1'
                value={settings.wordSpacing}
                onChange={(e) => {
                  setSettings({ ...settings, wordSpacing: e.target.value })
                }}
              />
            </span>
          </label>
          <label>
            <span>Letter spacing:</span>
            <span>
              <input
                type='range'
                name='letterSpacing'
                id='letterSpacing'
                min='0'
                max='.3'
                step='.02'
                value={settings.letterSpacing}
                onChange={(e) => {
                  setSettings({ ...settings, letterSpacing: e.target.value })
                }}
              />
            </span>
          </label>
          <label>
            <span>Block images:</span>
            <span>
              <input
                type='checkbox'
                name='blockImages'
                id='blockImages'
                checked={settings.blockImages}
                onChange={(e) => {
                  setSettings({ ...settings, blockImages: e.target.checked })
                }}
              />
            </span>
          </label>
        </div>
        <button
          type='button'
          className='button button-reset'
          onClick={() => {
            setProfiles(initialProfiles)
            setSettings(initialSettings)
          }}
        >
          Reset
        </button>
      </details>
    </>
  )
}

export default Main
