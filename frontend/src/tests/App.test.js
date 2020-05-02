require('./setupTests.js')
import React from 'react';
import ReactDOM from 'react-dom';
import App from '../App';
import { shallow, mount, render } from 'enzyme';

import { Header } from '../components/Header';
import { MainSectionGrid } from '../components/MainSectionGrid';
import { Footer } from '../components/Footer';

it('Renders App Component without crashing', () => {
  shallow(<App />);
});

it('Renders Header Component without crashing', () => {
  shallow(<Header />);
});

it('Renders MainSectionGrid Component without crashing', () => {
  shallow(<MainSectionGrid />);
});

it('Renders Footer Component without crashing', () => {
  shallow(<Footer />);
});
