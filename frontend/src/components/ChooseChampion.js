import React from 'react';
import './ChooseChampion.css';

import SearchIcon from '../assets/icons/search.svg'
import Question from '../assets/images/question-mark.png';

const ChampionAvatar = ({ currentChampion, championsList }) => {
    if (championsList.includes(currentChampion)) {
        return (
            <div>
                <img className="champion-avatar" src={require(`../assets/images/champions/${currentChampion}Square.png`)} alt={currentChampion} />
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
    constructor() {
        super();
        this.state = {
            championSelected: "Choose champion",
            championsList: []
        };

        this.onInputHandler = this.onInputHandler.bind(this);
        this.getFilteredChampion = this.getFilteredChampion.bind(this);
    }

    componentDidMount() {
        this.getChampionsList();
    }

    getChampionsList = () => {
        fetch('/champions-list')
            .then(res => res.json())
            .then(champions => this.setState({ championsList: champions }))
    }

    onInputHandler(event) {
        if (event.target.value === "") {
            this.setState({
                championSelected: "Choose champion"
            });
        } else {
            const input = event.currentTarget.value;
            const filteredChampion = this.getFilteredChampion(input)
            this.setState({
                championSelected: filteredChampion
            });
        }
    }

    getFilteredChampion(input) {
        let oneFilteredChampion = this.state.championsList.find(champion => champion.toLowerCase().includes(input.toLowerCase()))
        if (oneFilteredChampion) {
            return oneFilteredChampion;
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
                    <input type="text" placeholder="Find champion..." name="search" onInput={this.onInputHandler} />
                </div>
            </div>
        )
    };
}