import React from 'react';
import './SuggestionRow.css';

const ChampionAvatarAndCaption = ({ currentChampion }) => {
    if (currentChampion && currentChampion !== "No more counters" && currentChampion !== "Please select your role and enemies") {
        return (<div className="champion-avatar-and-caption__suggestion">
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
        // consider putting the score under the champion name
        return (
            <div className="score-container">
                <strong>SCORE: {Math.round(score)}%</strong>
            </div>
        )
    } else {
        return null
    }
};

const CounterTo = ({ currentChampion, counters, counterOrAvoid }) => {
    let counterOrSynergyText = counterOrAvoid === "counter" ? "Counter to: " : "Countered by: "
    if (currentChampion && currentChampion !== "No more counters" && currentChampion !== "Please select your role and enemies" && counters && Object.keys(counters).length !== 0) {
        let countersSorted = Object.entries(counters).sort((a, b) => (a[1].counterRate < b[1].counterRate) ? 1 : -1)

        return (
            <div className="counter-synergy-cotainer">
                <div className="counter-or-synergy-text">{counterOrSynergyText}</div>
                {
                    countersSorted.map(function (item, i) {
                        return <div key={i} className="counter-synergy-entry">
                            {item[0]} <br />
                            <div className="score"> {Math.round(item[1].counterRate * 100)} % </div>
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
    if (currentChampion && currentChampion !== "No more counters" && currentChampion !== "Please select your role and enemies" && synergies && Object.keys(synergies).length !== 0) {
        let synergiesSorted = Object.entries(synergies).sort((a, b) => (a[1].synergyRate < b[1].synergyRate) ? 1 : -1)

        return (
            <div className="counter-synergy-cotainer">
                <div className="counter-or-synergy-text">Synergies: </div>
                {
                    synergiesSorted.map(function (item, i) {
                        return <div key={i} className="counter-synergy-entry">
                            {item[0]}<br />
                            <div className="score"> {Math.round(item[1].synergyRate * 100)} % </div>
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
        let keywordToGetData = this.props.counterOrAvoid === "counter" ? "bestCountersSorted" : "bestAvoidSorted"

        let championName =
            this.props.suggestions[keywordToGetData] ?
                this.props.suggestions[keywordToGetData].length > 0 ?
                    this.props.suggestions[keywordToGetData][this.props.row - 1] ?
                        this.props.suggestions[keywordToGetData][this.props.row - 1][0]
                        : "No more counters"
                    : "Please select your role and enemies"
                : "Please select your role and enemies"

        let score = this.props.suggestions?.[keywordToGetData]?.[this.props.row - 1]?.[1].score * 100;
        let counters = this.props.suggestions?.[keywordToGetData]?.[this.props.row - 1]?.[1].counterTo
        let synergies = this.props.suggestions?.[keywordToGetData]?.[this.props.row - 1]?.[1].synergyTo

        if (!counters) {
            return (
                <section>
                    <div></div>
                    <div></div>
                    <div></div>
                </section>
            )
        } else {
            return (
                <div className="sugestion-entry">
                    <ChampionAvatarAndCaption currentChampion={championName} />
                    <div className="details-container">

                        <div className="score">
                            <Score currentChampion={championName} score={score} />
                        </div>

                        <div className="counter-to">
                            <CounterTo currentChampion={championName} counters={counters} counterOrAvoid={this.props.counterOrAvoid} />
                        </div>

                        <div className="synergy-with">
                            <SynergyWith currentChampion={championName} synergies={synergies} />
                        </div>

                    </div>
                </div>
            )
        }

    };
}


