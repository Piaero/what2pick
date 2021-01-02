import React from 'react';
import './MainSectionGrid.css';

import { ColumnYourRole } from './ColumnYourRole.js';
import { ChooseChampion } from './ChooseChampion';
import { SuggestionRow } from './SuggestionRow';

export class MainSectionGrid extends React.Component {
    constructor() {
        super();
        this.state = {
            selections: {
                myRole: "none",
                teammate: {
                    top: "none",
                    jungle: "none",
                    middle: "none",
                    bottom: "none",
                    support: "none",
                    unknown: "none"
                },
                enemy: {
                    top: "none",
                    jungle: "none",
                    middle: "none",
                    bottom: "none",
                    support: "none",
                    unknown: "none"
                }
            },
            suggestions: "none",
            championsList: null,
        }

        this.handleMyRoleChange = this.handleMyRoleChange.bind(this);
        this.handleChampionChange = this.handleChampionChange.bind(this);
    }

    componentDidMount() {
        this.getChampionsList();
    }

    getChampionsList = () => {
        fetch('/champions-list')
            .then(res => res.json())
            .then(champions => this.setState({ championsList: champions }))
    }

    componentDidUpdate(prevProps, prevState) {
        if (JSON.stringify(this.state.selections) !== JSON.stringify(prevState.selections)) {
            this.sendSelectedChampions();
        }
        console.log(this.state) // TODO: to delete later
    }

    sendSelectedChampions = () => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ post: this.state.selections })
        };

        fetch('/selections', requestOptions)
            .then(response => response.json())
            .then(data => {
                this.setState({ suggestions: data })
            });
    }

    handleMyRoleChange(role) {
        this.setState(prevState => ({
            selections: {
                ...prevState.selections,
                myRole: role
            }
        }))

        // Need to remove these developer logs
        console.log(`just clicked on ${role}`)
        console.log(`myRole is now: ${this.state.selections.myRole}`)
    }


    handleChampionChange(lane, champion, team) {
        this.setState(prevState => ({
            selections: {
                ...prevState.selections,
                [team]: {
                    ...prevState.selections[team],
                    [lane]: champion
                }
            }
        }))

        console.log(`State entry: ${team} ${lane} champion is now: ${this.state.selections[team][lane]}`)
    }

    render() {
        // Don't render Child components unless there's championsList received from the database
        if (!this.state.championsList) {
            return null;
        }

        return (
            <section className="grid-picks">

                <div className="grid-column">
                    <ColumnYourRole handleMyRoleChange={this.handleMyRoleChange} />
                </div>

                <div className="grid-column">
                    <h2 className="grid-picks__title">Your Team Column</h2>
                    <div><ChooseChampion lane="Top" championsList={this.state.championsList} handleChampionChange={this.handleChampionChange} team="teammate" tst="dupa" /></div>
                    <div><ChooseChampion lane="Jungle" championsList={this.state.championsList} handleChampionChange={this.handleChampionChange} team="teammate" /></div>
                    <div><ChooseChampion lane="Middle" championsList={this.state.championsList} handleChampionChange={this.handleChampionChange} team="teammate" /></div>
                    <div><ChooseChampion lane="Bottom" championsList={this.state.championsList} handleChampionChange={this.handleChampionChange} team="teammate" /></div>
                    <div><ChooseChampion lane="Support" championsList={this.state.championsList} handleChampionChange={this.handleChampionChange} team="teammate" /></div>
                    <div><ChooseChampion lane="Unknown" championsList={this.state.championsList} handleChampionChange={this.handleChampionChange} team="teammate" /></div>
                </div>

                <div className="grid-column">
                    <h2 className="grid-picks__title">Enemy Team Column</h2>
                    <div><ChooseChampion lane="Top" championsList={this.state.championsList} handleChampionChange={this.handleChampionChange} team="enemy" /></div>
                    <div><ChooseChampion lane="Jungle" championsList={this.state.championsList} handleChampionChange={this.handleChampionChange} team="enemy" /></div>
                    <div><ChooseChampion lane="Middle" championsList={this.state.championsList} handleChampionChange={this.handleChampionChange} team="enemy" /></div>
                    <div><ChooseChampion lane="Bottom" championsList={this.state.championsList} handleChampionChange={this.handleChampionChange} team="enemy" /></div>
                    <div><ChooseChampion lane="Support" championsList={this.state.championsList} handleChampionChange={this.handleChampionChange} team="enemy" /></div>
                    <div><ChooseChampion lane="Unknown" championsList={this.state.championsList} handleChampionChange={this.handleChampionChange} team="enemy" /></div>
                </div>

                <div className="sugestions-column">
                    <div className="grid-picks__title"><h2>Best champion for your selected role:</h2></div>
                    <div> <SuggestionRow suggestions={this.state.suggestions} row={1}/> </div>
                    <div> <SuggestionRow suggestions={this.state.suggestions} row={2}/> </div>
                    <div> <SuggestionRow suggestions={this.state.suggestions} row={3}/> </div>
                    <div className="grid-picks__title"><h2>Avoid to pick</h2></div>
                    <div>1</div>
                    <div>2</div>
                    <div>3</div>
                </div>

            </section>
        )
    };
}