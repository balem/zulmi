import React, { Component } from "react";
import { SelectFormsy } from "@fuse";
import { MenuItem } from "@material-ui/core";
import './SelectRegions.css';

export default class SelectRegions extends Component {
    render() {
        if (this.props.regions.length === 0) {
            return (
                <SelectFormsy 
                    className="mt-16 fullWidthSelect" 
                    name="contact_type" 
                    label="Departamentos" 
                    value={this.props.selected}
                    validations="isNotEqualToNone" 
                    validationError="Seleccione uno" 
                    onChange={this.props.onChange}
                    required
                >
                <MenuItem value="none">
                    <em>Seleccione un Departamento</em>
                </MenuItem>
                </SelectFormsy>
            );
        } else {
            return (
                <SelectFormsy 
                    className="mt-16 fullWidthSelect" 
                    name="contact_type" 
                    label="Departamentos" 
                    value={this.props.selected}
                    validations="isNotEqualToNone" 
                    validationError="Seleccione uno" 
                    onChange={this.props.onChange} 
                    required
                >
                    <MenuItem value="none">
                        <em>Seleccione</em>
                    </MenuItem>
                    {this.props.regions.map(region =>
                        <MenuItem key={region.id} value={region.id}>
                            {region.region_name}
                        </MenuItem>
                    )};
                </SelectFormsy>
            );
        }
    }
}