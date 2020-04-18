import React from 'react';
import logo from '../assets/images/logo.png'
import './Header.css';

export class Header extends React.Component {
  render() {
    return (
      <header>
        <img src={logo} alt="www.what2pick.com" className="logo" />
        <h1 className="title">what2pick.com</h1>
        <br /><br /><br /><br /><br /><br />
        <hr />
        <br /><br />
      </header>
    )
  };
}