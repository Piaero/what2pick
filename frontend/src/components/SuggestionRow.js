import React from 'react';
import './SuggestionRow.css';

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

        return (
            <div className="suggestion-row">
                <br />
                { championName}
                <br />
                { score}

            </div>
        )
    };
}


