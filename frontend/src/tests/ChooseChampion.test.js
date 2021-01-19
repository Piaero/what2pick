require('./setupTests.js')
import React from 'react';
import ReactDOM from 'react-dom';
import { shallow, mount, render } from 'enzyme';

import { ChooseChampion } from '../components/ChooseChampion.js'

const lanes = ["Top", "Jungle", "Middle", "Bottom", "Support"]
const champions = ["Aatrox", "Ahri", "Akali", "Alistar", "Amumu", "Anivia", "Annie", "Aphelios", "Ashe", "Aurelion Sol", "Azir", "Bard", "Blitzcrank", "Brand", "Braum", "Caitlyn", "Camille", "Cassiopeia", "Cho'Gath", "Corki", "Darius", "Diana", "Dr. Mundo", "Draven", "Ekko", "Elise", "Evelynn", "Ezreal", "Fiddlesticks", "Fiora", "Fizz", "Galio", "Gangplank", "Garen", "Gnar", "Gragas", "Graves", "Hecarim", "Heimerdinger", "Illaoi", "Irelia", "Ivern", "Janna", "Jarvan IV", "Jax", "Jayce", "Jhin", "Jinx", "Kai'Sa", "Kalista", "Karma", "Karthus", "Kassadin", "Katarina", "Kayle", "Kayn", "Kennen", "Kha'Zix", "Kindred", "Kled", "Kog'Maw", "LeBlanc", "Lee Sin", "Leona", "Lissandra", "Lucian", "Lulu", "Lux", "Malphite", "Malzahar", "Maokai", "Master Yi", "Miss Fortune", "Mordekaiser", "Morgana", "Nami", "Nasus", "Nautilus", "Neeko", "Nidalee", "Nocturne", "Nunu", "Olaf", "Orianna", "Ornn", "Pantheon", "Poppy", "Pyke", "Qiyana", "Quinn", "Rakan", "Rammus", "Rek'Sai", "Renekton", "Rengar", "Riven", "Rumble", "Ryze", "Sejuani", "Senna", "Sett", "Shaco", "Shen", "Shyvana", "Singed", "Sion", "Sivir", "Skarner", "Sona", "Soraka", "Swain", "Sylas", "Syndra", "Tahm Kench", "Taliyah", "Talon", "Taric", "Teemo", "Thresh", "Tristana", "Trundle", "Tryndamere", "Twisted Fate", "Twitch", "Udyr", "Urgot", "Varus", "Vayne", "Veigar", "Vel'Koz", "Vi", "Viktor", "Vladimir", "Volibear", "Warwick", "Wukong", "Xayah", "Xerath", "Xin Zhao", "Yasuo", "Yorick", "Yuumi", "Zac", "Zed", "Ziggs", "Zilean", "Zoe", "Zyra"];

const handleChampionChange = jest.fn();
const ChooseChampionComponent = <ChooseChampion lane="Top" championsList={champions} team="teammate" handleChampionChange={handleChampionChange} />
const wrapper = mount(ChooseChampionComponent);

describe('Choose Champion rendering in various cases', () => {

  it('Renders ChooseChampion Component on every lane', () => {
    for (let i = 0; i < lanes.length; i++) {
      expect(shallow(<ChooseChampion lane={lanes[i]} />)).toBeTruthy();
    }
  });

  it('Renders when safe champion is invoked', () => {
    wrapper.find('input').simulate('change', { target: { value: "Aatrox" } });

    expect(wrapper.state('championSelected')).toBe("Aatrox");
    expect(wrapper.find('.champion-caption').text()).toEqual("Aatrox");
  });


  it('Renders every champion from list', () => {
    champions.forEach(e => {
      wrapper.find('input').simulate('change', { target: { value: e } });

      expect(wrapper.state('championSelected')).toBe(e);
      expect(wrapper.find('.champion-caption').text()).toEqual(e);
    })
  });

  it('Renders on random single letter input', () => {
    for (let i = 32; i <= 126; i++) {
      wrapper.find('input').simulate('change', { target: { value: String.fromCharCode(i) } });

      expect(wrapper).toBeTruthy();
    }
  });

});