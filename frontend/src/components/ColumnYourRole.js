import React from 'react';
import './ColumnYourRole.css';

export class ColumnYourRole extends React.Component {

    constructor() {
        super();
        this.state = {
            arr: [
                { name: "Top", isActive: false },
                { name: "Jungle", isActive: false },
                { name: "Middle", isActive: false },
                { name: "Bottom", isActive: false },
                { name: "Support", isActive: false }
            ]
        };
    }

    handleActivityChange(index) {
        let temporaryArray = this.state.arr

        temporaryArray.forEach((e) => {
            e.isActive = false;
        })

        temporaryArray[index].isActive = true;
        this.setState({ arr: temporaryArray });
    }

    render() {
        return (
            <React.Fragment>
                <h2 className="grid-picks__title">Select Your Role</h2>

                {this.state.arr.map((el, index) =>
                    <div className={`role-container ${this.state.arr[index].isActive === true ? "active" : "inactive"}`} key={index} onClick={() => {
                        this.handleActivityChange(index);
                        this.props.handleMyRoleChange(el.name)
                    }}>
                        <img src={require(`../assets/images/${el.name}_icon.png`)} alt={el.name} className="role-icon role-icon-hover" />
                        <span className="role-caption">{el.name}</span>
                    </div>
                )}
            </React.Fragment>
        )
    };
}