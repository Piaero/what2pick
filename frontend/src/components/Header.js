import React from 'react';
import './Header.css';

import logo from '../assets/images/logo.png'

export class Header extends React.Component {
  render() {
    return (
      <header>
        <img src={logo} alt="www.what2pick.com" className="logo" />
        <a href="www.what2pick.com"><h1 className="title">what2pick.com</h1></a>
      </header>
    )
  };
}