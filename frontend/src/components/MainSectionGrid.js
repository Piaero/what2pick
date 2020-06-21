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
        }

        this.handleMyRoleChange = this.handleMyRoleChange.bind(this);
        this.handleChampionChange = this.handleChampionChange.bind(this);
    }

    // Due to a unfixed (yet) bug champions list is called by each ChooseChampion component. Hovewer in the future it needs to be called once from MainSectinGrid component.  
    // componentDidMount() {
    //     this.getChampionsList();
    // }

    // getChampionsList = () => {
    //     fetch('/champions-list')
    //         .then(res => res.json())
    //         .then(champions => this.setState({ championsList: champions }))
    // }

    componentDidUpdate() {
        this.sendSelectedChampions();
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
                if (this.state.suggestions !== data) {
                    this.setState({ suggestions: data })
                }
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
        return (
            <section className="grid-picks">

                <div className="grid-column">
                    {this.state.suggestions}
                    <ColumnYourRole handleMyRoleChange={this.handleMyRoleChange} />
                </div>

                <div className="grid-column">
                    <h2 className="grid-picks__title">Your Team Column</h2>
                    <div><ChooseChampion lane="Top" handleChampionChange={this.handleChampionChange} team="teammate" /></div>
                    <div><ChooseChampion lane="Jungle" handleChampionChange={this.handleChampionChange} team="teammate" /></div>
                    <div><ChooseChampion lane="Middle" handleChampionChange={this.handleChampionChange} team="teammate" /></div>
                    <div><ChooseChampion lane="Bottom" handleChampionChange={this.handleChampionChange} team="teammate" /></div>
                    <div><ChooseChampion lane="Support" handleChampionChange={this.handleChampionChange} team="teammate" /></div>
                    <div><ChooseChampion lane="Unknown" handleChampionChange={this.handleChampionChange} team="teammate" /></div>
                </div>

                <div className="grid-column">
                    <h2 className="grid-picks__title">Enemy Team Column</h2>
                    <div><ChooseChampion lane="Top" handleChampionChange={this.handleChampionChange} team="enemy" /></div>
                    <div><ChooseChampion lane="Jungle" handleChampionChange={this.handleChampionChange} team="enemy" /></div>
                    <div><ChooseChampion lane="Middle" handleChampionChange={this.handleChampionChange} team="enemy" /></div>
                    <div><ChooseChampion lane="Bottom" handleChampionChange={this.handleChampionChange} team="enemy" /></div>
                    <div><ChooseChampion lane="Support" handleChampionChange={this.handleChampionChange} team="enemy" /></div>
                    <div><ChooseChampion lane="Unknown" handleChampionChange={this.handleChampionChange} team="enemy" /></div>
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