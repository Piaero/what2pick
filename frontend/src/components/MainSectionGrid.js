import React from 'react';
import './MainSectionGrid.css';

import { ColumnYourRole } from './ColumnYourRole.js';
import { ChooseChampion } from './ChooseChampion';

export class MainSectionGrid extends React.Component {
    render() {
        return (
            <section className="grid-picks">

                <div className="grid-column">
                    <ColumnYourRole />
                </div>

                <div className="grid-column">
                    <h2 className="grid-picks__title">Your Team Column (component)</h2>
                    <div><ChooseChampion lane="Top"/></div>
                    <div><ChooseChampion lane="Bottom"/></div>
                    <div>3</div>
                    <div>4</div>
                    <div>5</div>
                    <div>6</div>
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
                    <div class="sugestion-entry">1</div>
                    <div class="sugestion-entry">2</div>
                    <div class="sugestion-entry">3</div>
                    <div className="grid-picks__title"><h2>Avoid to pick</h2></div>
                    <div class="sugestion-entry">1</div>
                    <div class="sugestion-entry">2</div>
                    <div class="sugestion-entry">3</div>
                </div>




            </section>
        )
    };
}