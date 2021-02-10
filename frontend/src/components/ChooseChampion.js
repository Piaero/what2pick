import React from 'react';
import './ChooseChampion.css';

import SearchIcon from '../assets/icons/search.svg'
import Question from '../assets/images/question-mark.png';

const ChampionAvatar = ({ currentChampion, championsList, onClickHandler }) => {
    if (championsList.includes(currentChampion)) {
        return (
            <div>
                <img className="champion-avatar" src={require(`../assets/images/champions/${currentChampion.replace(" ", "_")}Square.png`)} alt={currentChampion} />
                <img src={require(`../assets/icons/cancel.svg`)} className="cancel-button" alt="Cancel" onClick={onClickHandler} />
            </div>
        )
    } else if (currentChampion === "Wrong name!") {
        return (
            <div>
                <img className="champion-avatar-other" src={require(`../assets/images/exclamation-mark.png`)} alt={currentChampion} />
                <img src={require(`../assets/icons/cancel.svg`)} className="cancel-button" alt="Cancel" onClick={onClickHandler} />
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
    } else if (currentChampion == null) {
        return (
            <div>
                <span className="choose-champion-caption">Choose champion</span>
            </div>
        )
    } else {
        return (
            <div>
                <span className="choose-champion-caption">{currentChampion}</span>
            </div>
        )
    }
};

export class ChooseChampion extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            championSelected: this.props.championSelected,
            championsList: this.props.championsList,
        };

        this.onInputHandler = this.onInputHandler.bind(this);
        this.getFilteredChampion = this.getFilteredChampion.bind(this);
        this.cancelChampion = this.cancelChampion.bind(this);
    }

    cancelChampion = () => {
        this.props.handleInputChange(this.props.lane, "", this.props.team)
        this.props.handleChampionChange(this.props.lane, null, this.props.team)
    }

    onInputHandler(event) {
        const input = event.target.value;
        const filteredChampion = this.getFilteredChampion(input, this.state.championsList)

        this.props.handleInputChange(this.props.lane, input, this.props.team)
        this.props.handleChampionChange(this.props.lane, filteredChampion, this.props.team)

        // Left for mount unit testing purposes
        this.setState({
            championSelected: filteredChampion
        });
    }

    getFilteredChampion(input, championsList) {
        if (input === "") {
            return null
        }

        let inputEscapeSpecial = input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        let regEx = new RegExp("^" + inputEscapeSpecial, "i")
        let result = ""

        for (var i = 0; i < championsList.length; i++) {
            if (regEx.test(championsList[i])) {
                return championsList[i];
            } else {
                result = championsList.find(champion => champion.toLowerCase().includes(input.toLowerCase()))
            }
        }
        return result ? result : "Wrong name!"
    }

    render() {
        return (
            <div className="choose-champion-container">
                <div className={`role-and-caption ${this.props.championSelected !== "Choose champion" && this.props.championSelected !== "Wrong name!" && this.props.championSelected !== null ? "active" : "inactive"}`}>
                    <img className="role-icon" src={require(`../assets/images/${this.props.lane}_icon.png`)} alt={this.props.lane} />
                    <span className="role-caption">{this.props.lane}</span>
                </div>

                <div className="champion-avatar-and-caption">
                    <ChampionAvatar currentChampion={this.props.championSelected} championsList={this.state.championsList} onClickHandler={this.cancelChampion} />
                    <ChampionCaption currentChampion={this.props.championSelected} championsList={this.state.championsList} />
                </div>

                <div className="search-container">
                    <button type="submit" className="search-button"><img src={SearchIcon} className="search-icon" alt="Search" /></button>
                    <input value={this.props.inputValue} type="text" placeholder="Find champion..." name="search" onChange={this.onInputHandler} ref={(el) => this.myInput = el} />
                </div>
            </div>
        )
    };
}