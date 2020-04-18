import React, { Component } from 'react';

import './App.css';

import { Header } from './components/Header.js';
import { MainSectionGrid } from './components/MainSectionGrid.js';
import { Footer } from './components/Footer.js';

class App extends Component {
  state = {
    response: '',
    post: '',
    responseToPost: '',
  };

  render() {
    return (
      <div>
        <Header />
        <MainSectionGrid />
        <Footer />
      </div>
    );
  }
}

export default App;