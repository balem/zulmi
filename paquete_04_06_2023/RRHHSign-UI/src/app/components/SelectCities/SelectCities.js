import React, { Component } from "react";
import { SelectFormsy } from "@fuse";
import { MenuItem } from "@material-ui/core";
import './SelectCities.css';

export default class SelectCities extends Component {
    render() {
        if (this.props.cities.length === 0) {
            return (
                <SelectFormsy 
                    className="my-16 fullWidthSelect" 
                    name="contact_type" 
                    label="Ciudad" 
                    value={this.props.selected}
                    validations="isNotEqualToNone" 
                    validationError="Seleccione uno"  
                    required
                    onChange={this.props.onChange}
                >
                <MenuItem value="none">
                    <em>Seleccione un Departamento</em>
                </MenuItem>
                </SelectFormsy>
            );
        } else {
            return (
                <SelectFormsy 
                    className="my-16 fullWidthSelect" 
                    name="contact_type" 
                    label="Ciudad" 
                    value={this.props.selected}
                    validations="isNotEqualToNone" 
                    validationError="Seleccione uno"
                    required
                    onChange={this.props.onChange}
                >
                    <MenuItem value="none">
                        <em>Seleccione</em>
                    </MenuItem>
                    {this.props.cities.map(city =>
                        <MenuItem key={city.id} value={city.id}>
                            {city.city_name}
                        </MenuItem>
                    )};
                </SelectFormsy>
            );
        }
    }
}