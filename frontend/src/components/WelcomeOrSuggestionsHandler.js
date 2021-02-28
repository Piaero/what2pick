import React from 'react';

import { SuggestionRow } from './SuggestionRow';

const AvoidToPickSuggestionHandler = ({ suggestions }) => {
  if (suggestions.bestAvoidSorted?.length > 0) {
    return (
      <div className="suggestions-column">
        <h2 className="grid-picks__title">Best champion for your selected role:</h2>

        <SuggestionRow suggestions={suggestions} row={1} counterOrAvoid="counter" />
        <SuggestionRow suggestions={suggestions} row={2} counterOrAvoid="counter" />
        <SuggestionRow suggestions={suggestions} row={3} counterOrAvoid="counter" />

        <h2 className="grid-picks__title">Avoid to pick</h2>

        <SuggestionRow suggestions={suggestions} row={1} counterOrAvoid="avoid" />
        <SuggestionRow suggestions={suggestions} row={2} counterOrAvoid="avoid" />
        <SuggestionRow suggestions={suggestions} row={3} counterOrAvoid="avoid" />
      </div>
    )
  } else {
    return (
      <div className="suggestions-column">
        <h2 className="grid-picks__title">Best champion for your selected role:</h2>

        <SuggestionRow suggestions={suggestions} row={1} counterOrAvoid="counter" />
        <SuggestionRow suggestions={suggestions} row={2} counterOrAvoid="counter" />
        <SuggestionRow suggestions={suggestions} row={3} counterOrAvoid="counter" />

      </div>
    )
  }
}

const WelcomeOrSuggestions = ({ suggestions }) => {

  const suggestionsExist = suggestions.bestCountersSorted?.length > 0 || suggestions.bestAvoidSorted?.length > 0 ? true : false;

  if ((!suggestionsExist)) {
    return (
      <div className="suggestions-column">
        <h2 className="grid-picks__title">Best champion for your selected role:</h2>

        <div className="welcome-instructions sugestion-entry" >
          <ol>
            <li> Select Your Role</li>
            <li> Select enemies and/or teammates</li>
            <li> You can drag and drop champion to another lane</li>
          </ol>
        </div>
      </div >
    )
  } else {
    return <AvoidToPickSuggestionHandler suggestions={suggestions} />
  }
};

export class WelcomeOrSuggestionsHandler extends React.Component {
  render() {
    return (
      <WelcomeOrSuggestions suggestions={this.props.suggestions} />
    )
  };
}