import React from 'react';
import './SuggestionRow.css';

const ChampionAvatarAndCaption = ({ currentChampion }) => {
    if (currentChampion && currentChampion !== "No more counters" && currentChampion !== "Please select your role and enemies") {
        return (<div className="champion-avatar-and-caption">
            <div>
                <img className="champion-avatar" src={require(`../assets/images/champions/${currentChampion.replace(" ", "_")}Square.png`)} alt={currentChampion} />
            </div>
            <div>
                <span className="champion-caption">{currentChampion}</span>
            </div>
        </div>
        )
    } else {
        return null
    }
};

const Score = ({ currentChampion, score }) => {
    if (currentChampion && currentChampion !== "No more counters" && currentChampion !== "Please select your role and enemies") {
        return (
            <div className="score-container">
                SCORE: {score}%
            </div>
        )
    } else {
        return null
    }
};

const CounterTo = ({ currentChampion, counters }) => {
    if (currentChampion && currentChampion !== "No more counters" && currentChampion !== "Please select your role and enemies" && counters) {
        return (
            <div className="counter-to-container">
                COUNTERS: 
                {
                    Object.keys(counters).map(function (item, i) {
                        return <div key={i}>
                            <li>{item}</li>
                            {Object.values(counters)[i].counterRate * 100} %
        </div>
                    })

                }
            </div>
        )
    } else {
        return null
    }
};

const SynergyWith = ({ currentChampion, synergies }) => {
    if (currentChampion && currentChampion !== "No more counters" && currentChampion !== "Please select your role and enemies" && synergies) {
        return (
            <div className="synergy-to-container">
                SYNERGIES: 
                {
                    Object.keys(synergies).map(function (item, i) {
                        return <div key={i}>
                            <li>{item}</li>
                            {Object.values(synergies)[i].synergyRate * 100} %
        </div>
                    })
                }
            </div>
        )
    } else {
        return null
    }
};

export class SuggestionRow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }


    render() {
        let championName =
            this.props.suggestions.bestCountersSorted ?
                this.props.suggestions.bestCountersSorted.length > 0 ?
                    this.props.suggestions.bestCountersSorted[this.props.row - 1] ?
                        this.props.suggestions.bestCountersSorted[this.props.row - 1][0]
                        : "No more counters"
                    : "Please select your role and enemies"
                : "Please select your role and enemies"

        let score = this.props.suggestions && this.props.suggestions.bestCountersSorted && this.props.suggestions.bestCountersSorted[this.props.row - 1] && this.props.suggestions.bestCountersSorted[this.props.row - 1][1].score * 100;
        let counters = this.props.suggestions && this.props.suggestions.bestCountersSorted && this.props.suggestions.bestCountersSorted[this.props.row - 1] && this.props.suggestions.bestCountersSorted[this.props.row - 1][1].counterTo
        let synergies = this.props.suggestions && this.props.suggestions.bestCountersSorted && this.props.suggestions.bestCountersSorted[this.props.row - 1] && this.props.suggestions.bestCountersSorted[this.props.row - 1][1].synergyTo


        return (
            <div className="suggestion-row">
                <br />
                <ChampionAvatarAndCaption currentChampion={championName} />
                <br />
                <div className="details-container">

                    <div className="score">
                        <Score currentChampion={championName} score={score} />
                    </div>

                    <div className="counter-to">
                        <CounterTo currentChampion={championName} counters={counters} />
                        {console.log(championName)}
                    </div>

                    <div className="synergy-with">
                        <SynergyWith currentChampion={championName} synergies={synergies} />
                    </div>

                </div>
            </div>
        )
    };
}


