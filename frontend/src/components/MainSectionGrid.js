import React from 'react';
import { DragDropContext } from 'react-beautiful-dnd'
import { Droppable } from 'react-beautiful-dnd';
import { Draggable } from 'react-beautiful-dnd';

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
                    Top: {
                        champion: null,
                        inputValue: ""
                    },
                    Jungle: {
                        champion: null,
                        inputValue: ""
                    },
                    Middle: {
                        champion: null,
                        inputValue: ""
                    },
                    Bottom: {
                        champion: null,
                        inputValue: ""
                    },
                    Support: {
                        champion: null,
                        inputValue: ""
                    },
                    Unknown: {
                        champion: null,
                        inputValue: ""
                    },
                },
                enemy: {
                    Top: {
                        champion: null,
                        inputValue: ""
                    },
                    Jungle: {
                        champion: null,
                        inputValue: ""
                    },
                    Middle: {
                        champion: null,
                        inputValue: ""
                    },
                    Bottom: {
                        champion: null,
                        inputValue: ""
                    },
                    Support: {
                        champion: null,
                        inputValue: ""
                    },
                    Unknown: {
                        champion: null,
                        inputValue: ""
                    },
                },
            },
            lanes: ["Top", "Jungle", "Middle", "Bottom", "Support", "Unknown"],
            suggestions: "none",
            championsList: null,
        }

        this.handleMyRoleChange = this.handleMyRoleChange.bind(this);
        this.handleChampionChange = this.handleChampionChange.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    componentDidMount() {
        this.getChampionsList();
    }

    getChampionsList = () => {
        fetch('/champions-list')
            .then(res => res.json())
            .then(champions => this.setState({ championsList: champions }))
    }

    ifSelectionsEmpty = (object) => {
        let isEmpty = true

        for (let property in object.teammate) {
            if (object.teammate[property] !== null) {
                isEmpty = false
            }
        }

        for (let property in object.enemy) {
            if (object.enemy[property] !== null) {
                isEmpty = false
            }
        }

        return isEmpty
    }

    componentDidUpdate(prevProps, prevState) {
        if (JSON.stringify(this.state.selections) !== JSON.stringify(prevState.selections) && (this.ifSelectionsEmpty(this.state.selections) === false || this.ifSelectionsEmpty(prevState.selections) === false)) {
            this.sendSelectedChampions();
        }
        console.log(this.state)
    }

    sendSelectedChampions = () => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ post: this.state.selections })
        };

        if (this.state.selections.myRole !== "none") {
            fetch('/selections', requestOptions)
                .then(response => response.json())
                .then(data => {
                    this.setState({ suggestions: data })
                });
        }
    }

    handleMyRoleChange(role) {
        this.setState(prevState => ({
            selections: {
                ...prevState.selections,
                myRole: role
            }
        }))
    }


    handleChampionChange(lane, champion, team) {
        this.setState(prevState => ({
            selections: {
                ...prevState.selections,
                [team]: {
                    ...prevState.selections[team],
                    [lane]: {
                        ...prevState.selections[team][lane],
                        champion: champion,
                    }
                }
            }
        }))
    }

    handleInputChange(lane, input, team) {
        this.setState(prevState => ({
            selections: {
                ...prevState.selections,
                [team]: {
                    ...prevState.selections[team],
                    [lane]: {
                        ...prevState.selections[team][lane],
                        inputValue: input,
                    }
                }
            }
        }))
    }

    onDragEnd = (result) => {
        const { destination, source, draggableId } = result;
        let team = source.droppableId

        if (!destination) {
            return;
        }

        if (destination.droppableId === source.droppableId && destination.index === source.index) {
            return;
        }

        const NameOfDraggedChampion = this.state.selections[team][draggableId].champion
        const laneOfDraggedChampion = draggableId
        const inputValueOfDraggedChampion = this.state.selections[team][draggableId].inputValue

        const NameOfSwappedChampion = Object.values(this.state.selections[team])[destination.index].champion
        const laneOfSwappedChampion = Object.keys(this.state.selections[team])[destination.index]
        const inputValueOfSwappedChampion = Object.values(this.state.selections[team])[destination.index].inputValue

        this.setState(prevState => ({
            selections: {
                ...prevState.selections,
                [team]: {
                    ...prevState.selections[team],
                    [laneOfDraggedChampion]: {
                        ...prevState.selections[team][laneOfDraggedChampion],
                        champion: NameOfSwappedChampion,
                        inputValue: inputValueOfSwappedChampion
                    },
                    [laneOfSwappedChampion]: {
                        ...prevState.selections[team][laneOfSwappedChampion],
                        champion: NameOfDraggedChampion,
                        inputValue: inputValueOfDraggedChampion
                    }
                }
            }
        }))
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

                <DragDropContext onDragEnd={this.onDragEnd}>
                    <Droppable droppableId="teammate">
                        {(provided) => (
                            <div className="grid-column" ref={provided.innerRef}
                                {...provided.droppableProps}>
                                <h2 className="grid-picks__title">Your Team Column</h2>
                                {
                                    this.state.lanes.map((lane, index) => {
                                        return (
                                            <Draggable draggableId={lane} index={index} key={lane}>
                                                {(provided) =>
                                                    <div
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        ref={provided.innerRef}
                                                        key={index}>
                                                        <ChooseChampion
                                                            lane={lane}
                                                            team="teammate"
                                                            championsList={this.state.championsList}
                                                            handleChampionChange={this.handleChampionChange}
                                                            handleInputChange={this.handleInputChange}
                                                            championSelected={this.state.selections.teammate[lane].champion}
                                                            inputValue={this.state.selections.teammate[lane].inputValue} />
                                                    </div>
                                                }
                                            </Draggable>
                                        )
                                    })
                                }
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>

                <DragDropContext onDragEnd={this.onDragEnd}>
                    <Droppable droppableId="enemy">
                        {(provided) => (
                            <div className="grid-column" ref={provided.innerRef}
                                {...provided.droppableProps}>
                                <h2 className="grid-picks__title">Enemy Team Column</h2>
                                {
                                    this.state.lanes.map((lane, index) => {
                                        return (
                                            <Draggable draggableId={lane} index={index} key={lane}>
                                                {(provided) =>
                                                    <div
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        ref={provided.innerRef}
                                                        key={index}>

                                                        <ChooseChampion
                                                            lane={lane}
                                                            team="enemy"
                                                            championsList={this.state.championsList}
                                                            handleChampionChange={this.handleChampionChange}
                                                            handleInputChange={this.handleInputChange}
                                                            championSelected={this.state.selections.enemy[lane].champion}
                                                            inputValue={this.state.selections.enemy[lane].inputValue} />
                                                    </div>
                                                }
                                            </Draggable>
                                        )
                                    })
                                }
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>

                <div className="sugestions-column">
                    <div className="grid-picks__title"><h2>Best champion for your selected role:</h2></div>
                    <div> <SuggestionRow suggestions={this.state.suggestions} row={1} counterOrAvoid="counter" /> </div>
                    <div> <SuggestionRow suggestions={this.state.suggestions} row={2} counterOrAvoid="counter" /> </div>
                    <div> <SuggestionRow suggestions={this.state.suggestions} row={3} counterOrAvoid="counter" /> </div>
                    <div className="grid-picks__title"><h2>Avoid to pick</h2></div>
                    <div><SuggestionRow suggestions={this.state.suggestions} row={1} counterOrAvoid="avoid" /></div>
                    <div><SuggestionRow suggestions={this.state.suggestions} row={2} counterOrAvoid="avoid" /></div>
                    <div><SuggestionRow suggestions={this.state.suggestions} row={3} counterOrAvoid="avoid" /></div>
                </div>

            </section>
        )
    };
}