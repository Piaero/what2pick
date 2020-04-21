import React from 'react';
import './ChooseChampion.css';

import SearchIcon from '../assets/icons/search.svg'
import Question from '../assets/images/question-mark.png';

export class ChooseChampion extends React.Component {
    render() {
        return (
            <div className="choose-champion-container">

                <div className="role-and-caption inactive">
                    <img className="role-icon" src={require(`../assets/images/${this.props.lane}_icon.png`)} alt={this.props.lane} />
                    <span className="role-caption">{this.props.lane}</span>
                </div>

                <div className="champion-icon-and-caption">
                    <img src={Question} alt="Choose champion" className="choose-champion-icon" />
                    <span className="choose-champion-caption">Choose champion</span>
                </div>

                <div className="search-container">
                    <form action="/action_page">
                        <button type="submit" className="search-button"><img src={SearchIcon} className="search-icon" alt="Search"/></button>
                        <input type="text" placeholder="Find champion..." name="search" />
                    </form>
                </div>
            </div>
        )
    };
}