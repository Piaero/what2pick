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
            }
        }

        this.handleMyRoleChange = this.handleMyRoleChange.bind(this);
    }

    handleMyRoleChange(role) {
        this.setState({ selections: { myRole: role } })
        // Need to remove these developer logs
        console.log(`just clicked on ${role}`)
        console.log(`state is now: ${this.state.selections.myRole}`)
    }

    render() {
        return (
            <section className="grid-picks">

                <div className="grid-column">
                    <ColumnYourRole handleMyRoleChange={this.handleMyRoleChange}/>
                </div>

                <div className="grid-column">
                    <h2 className="grid-picks__title">Your Team Column (component)</h2>
                    <div><ChooseChampion lane="Top" /></div>
                    <div><ChooseChampion lane="Jungle" /></div>
                    <div><ChooseChampion lane="Middle" /></div>
                    <div><ChooseChampion lane="Bottom" /></div>
                    <div><ChooseChampion lane="Support" /></div>
                    <div><ChooseChampion lane="Unknown" /></div>
                </div>

                <div className="grid-column">
                    <h2 className="grid-picks__title">Enemy Team Column (component)</h2>
                    <div>1</div>
                    <div>2</div>
                    <div>3</div>
                    <div>4</div>
                    <div>5</div>
                    <div>6</div>
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