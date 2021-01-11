import React from 'react';
import './ChooseChampion.css';

import SearchIcon from '../assets/icons/search.svg'
import Question from '../assets/images/question-mark.png';

const ChampionAvatar = ({ currentChampion, championsList }) => {
    if (championsList.includes(currentChampion)) {
        return (
            <div>
                <img className="champion-avatar" src={require(`../assets/images/champions/${currentChampion.replace(" ", "_")}Square.png`)} alt={currentChampion} />
            </div>
        )
    } else if (currentChampion === "Wrong name!") {
        return (
            <div>
                <img className="champion-avatar-other" src={require(`../assets/images/exclamation-mark.png`)} alt={currentChampion} />
            </div>
        )
    } else {
        return (
            <div>
                <img className="champion-avatar-other" src={Question} alt="Choose champion" />
            </div>
        )
    };
};

const ChampionCaption = ({ currentChampion, championsList }) => {
    if (championsList.includes(currentChampion)) {
        return (
            <div>
                <span className="champion-caption">{currentChampion}</span>
            </div>
        )
    }
    return (
        <div>
            <span className="choose-champion-caption">{currentChampion}</span>
        </div>
    )
};

export class ChooseChampion extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            championSelected: "Choose champion",
            championsList: this.props.championsList,
        };

        this.onInputHandler = this.onInputHandler.bind(this);
        this.getFilteredChampion = this.getFilteredChampion.bind(this);
    }

    onInputHandler(event) {
        if (event.target.value === "") {
            this.setState({
                championSelected: "Choose champion"
            });
        } else {
            const input = event.currentTarget.value;
            const filteredChampion = this.getFilteredChampion(input, this.state.championsList)
            this.setState({
                championSelected: filteredChampion
            });

            this.props.handleChampionChange(this.props.lane.toLowerCase(), filteredChampion, this.props.team)
        }
    }

    getFilteredChampion(input, championsList) {
        function filterOneChampion(input) {
            var regEx = new RegExp(`^${input}`, "i");

            for (var i = 0; i < championsList.length; i++) {
                if (regEx.test(championsList[i])) {
                    return championsList[i];
                }
            }
            return championsList.find(champion => champion.toLowerCase().includes(input.toLowerCase()))
        }

        if (filterOneChampion(input)) {
            return filterOneChampion(input);
        } else {
            return "Wrong name!"
        }
    }

    render() {
        return (
            <div className="choose-champion-container">

                <div className="role-and-caption inactive">
                    <img className="role-icon" src={require(`../assets/images/${this.props.lane}_icon.png`)} alt={this.props.lane} />
                    <span className="role-caption">{this.props.lane}</span>
                </div>

                <div className="champion-avatar-and-caption">
                    <ChampionAvatar currentChampion={this.state.championSelected} championsList={this.state.championsList} />
                    <ChampionCaption currentChampion={this.state.championSelected} championsList={this.state.championsList} />
                </div>

                <div className="search-container">
                    <button type="submit" className="search-button"><img src={SearchIcon} className="search-icon" alt="Search" /></button>
                    <input type="text" placeholder="Find champion..." name="search" onChange={this.onInputHandler} />
                </div>
            </div>
        )
    };
}