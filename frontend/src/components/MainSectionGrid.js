import React from 'react';
import './MainSectionGrid.css';

import { ColumnYourRole } from './ColumnYourRole.js';
import { ChooseChampion } from './ChooseChampion';

export class MainSectionGrid extends React.Component {
    constructor() {
        super();
        this.state = {
            selections: {
                myRole: "none",
                teammates: {
                    top: "none",
                    jungle: "none",
                    middle: "none",
                    bottom: "none",
                    support: "none",
                    unknown: "none"
                },
                enemies: {
                    top: "none",
                    jungle: "none",
                    middle: "none",
                    bottom: "none",
                    support: "none",
                    unknown: "none"
                }
            },
            suggestions: "none",
        }

        this.handleMyRoleChange = this.handleMyRoleChange.bind(this);
        this.handleTeammateChampionChange = this.handleTeammateChampionChange.bind(this);
        this.handleEnemyChampionChange = this.handleEnemyChampionChange.bind(this);
    }

    componentDidMount() {
        this.getChampionsList();
    }

    getChampionsList = () => {
        fetch('/champions-list')
            .then(res => res.json())
            .then(champions => this.setState({ championsList: champions }))
    }

    componentDidUpdate() {
        this.sendSelectedChampions();
    }

    sendSelectedChampions = () => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // body should be whole this.state.selections
            body: JSON.stringify({ post: this.state.selections.myRole })
        };

        fetch('/selections', requestOptions)
            .then(response => response.json())
            .then(data => {
                if (this.state.suggestions !== data) {
                    this.setState({ suggestions: data })
                }
            }
            )
            // body should be whole this.state.selections
            .then(console.log(`Just send POST request and myRole was ${this.state.selections.myRole}`));
    }

    handleMyRoleChange(role) {
        this.setState({ selections: { myRole: role } })
        // Need to remove these developer logs
        console.log(`just clicked on ${role}`)
        console.log(`myRole is now: ${this.state.selections.myRole}`)
    }


    // These functions are separed because of strange bug. When there was inputted teammate champion, inputing an enemey champion would cause an error: "cannot read properdy "top" of undefined"
    handleTeammateChampionChange(lane, champion) {
        this.setState({ selections: { teammates: { [lane]: champion } } })
        console.log(`State entry: my ${lane} champion is now: ${this.state.selections.teammates[lane]}`)
    }

    handleEnemyChampionChange(lane, champion) {
        this.setState({ selections: { teammates: { [lane]: champion } } })
        console.log(`State entry: enemy ${lane} champion is now: ${this.state.selections.teammates[lane]}`)
    }

    render() {
        return (
            <section className="grid-picks">

                <div className="grid-column">
                    {this.state.suggestions}
                    <ColumnYourRole handleMyRoleChange={this.handleMyRoleChange} />
                </div>

                <div className="grid-column">
                    <h2 className="grid-picks__title">Your Team Column</h2>
                    <div><ChooseChampion lane="Top" handleTeammateChampionChange={this.handleTeammateChampionChange} team="teammate" /></div>
                    <div><ChooseChampion lane="Jungle" handleTeammateChampionChange={this.handleTeammateChampionChange} team="teammate" /></div>
                    <div><ChooseChampion lane="Middle" handleTeammateChampionChange={this.handleTeammateChampionChange} team="teammate" /></div>
                    <div><ChooseChampion lane="Bottom" handleTeammateChampionChange={this.handleTeammateChampionChange} team="teammate" /></div>
                    <div><ChooseChampion lane="Support" handleTeammateChampionChange={this.handleTeammateChampionChange} team="teammate" /></div>
                    <div><ChooseChampion lane="Unknown" handleTeammateChampionChange={this.handleTeammateChampionChange} team="teammate" /></div>
                </div>

                <div className="grid-column">
                    <h2 className="grid-picks__title">Enemy Team Column</h2>
                    <div><ChooseChampion lane="Top" handleEnemyChampionChange={this.handleEnemyChampionChange} team="enemy" /></div>
                    <div><ChooseChampion lane="Jungle" handleEnemyChampionChange={this.handleEnemyChampionChange} team="enemy" /></div>
                    <div><ChooseChampion lane="Middle" handleEnemyChampionChange={this.handleEnemyChampionChange} team="enemy" /></div>
                    <div><ChooseChampion lane="Bottom" handleEnemyChampionChange={this.handleEnemyChampionChange} team="enemy" /></div>
                    <div><ChooseChampion lane="Support" handleEnemyChampionChange={this.handleEnemyChampionChange} team="enemy" /></div>
                    <div><ChooseChampion lane="Unknown" handleEnemyChampionChange={this.handleEnemyChampionChange} team="enemy" /></div>
                </div>

                <div className="sugestions-column">
                    <div className="grid-picks__title"><h2>Best counters for Selected Your Role:</h2></div>
                    <div className="sugestion-entry">1</div>
                    <div className="sugestion-entry">2</div>
                    <div className="sugestion-entry">3</div>
                    <div className="grid-picks__title"><h2>Avoid to pick</h2></div>
                    <div className="sugestion-entry">1</div>
                    <div className="sugestion-entry">2</div>
                    <div className="sugestion-entry">3</div>
                </div>

            </section>
        )
    };
}