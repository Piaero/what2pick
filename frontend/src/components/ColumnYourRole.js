import React from 'react';
import './ColumnYourRole.css';

import Top from '../assets/images/Top_icon.png';
import Jungle from '../assets/images/Jungle_icon.png';
import Middle from '../assets/images/Middle_icon.png';
import Bottom from '../assets/images/Bottom_icon.png';
import Support from '../assets/images/Support_icon.png';

export class ColumnYourRole extends React.Component {
    render() {
        return (
            <React.Fragment>
                <h2 className="grid-picks__title">Select Your Role</h2>
                <div className="role-container inactive"><img src={Top} alt="Top" className="role-icon" />
                <span className="role-caption">Top</span>
                </div>
                <div className="role-container inactive"><img src={Jungle} alt="Jungle" className="role-icon" />
                <span className="role-caption">Jungle</span>
                </div>
                <div className="role-container inactive"><img src={Middle} alt="Middle" className="role-icon" />
                <span className="role-caption">Middle</span>
                </div>
                <div className="role-container inactive"><img src={Bottom} alt="Bottom" className="role-icon" />
                <span className="role-caption">Bottom</span>
                </div>
                <div className="role-container inactive"><img src={Support} alt="Support" className="role-icon" />
                <span className="role-caption">Support</span>
                </div>
            </React.Fragment>
        )
    };
}