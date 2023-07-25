import ReactDOM from 'react-dom/client'
import React from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import Main from './components/Main'

import './css/styles.css'

const root = ReactDOM.createRoot(document.getElementById('email-reader-view'))

root.render(
  <>
    <Header />
    <Main />
    <Footer />
  </>,
)
