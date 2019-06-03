/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import Select from 'react-select';
import { css } from '@emotion/core';
import { connect } from 'react-redux';

interface IState {
  page: number;
  perPage: number;
  pageOfItems: any[];
  rows: any;
  selectAll: any;
  checked: any;
}
interface IProps {
  values: any;
  currentPlan: any;
}

class VolumesTable extends React.Component<any, any> {
  handleTypeChange = (row, val) => {
    console.log('handleTypeChange: ', val);
    const { persistentVolumes } = this.props.values;
    const objIndex = persistentVolumes.findIndex(v => v.name === row.original.name);

    const updatedPv = { ...persistentVolumes[objIndex], type: val.value };

    const updatedPersistentVolumes = [
      ...persistentVolumes.slice(0, objIndex),
      updatedPv,
      ...persistentVolumes.slice(objIndex + 1),
    ];
    console.log('updating persistentVolumes values: ', updatedPersistentVolumes);
    this.props.setFieldValue('persistentVolumes', updatedPersistentVolumes);
  };
  state = {
    page: 1,
    selectedOption: null,
    perPage: 20,
    pageOfItems: [],
    rows: [],
    checked: [],
    selectAll: false,
  };

  getTableData() {
    console.log('getTableData currentPlan: ', this.props.currentPlan);
    console.log('getTableData values.persistentVolumes: ', this.props.values.persistentVolumes);
    return this.props.currentPlan.spec.persistentVolumes.map(planVolume => {
      let pvAction = 'copy';
      if(this.props.values.persistentVolumes.length !== 0) {
        const rowVal = this.props.values.persistentVolumes.find(v => v.name === planVolume.name);
        pvAction = rowVal.type;
      }

      return {
        name: planVolume.name,
        project: '', 
        storageClass: '',
        size: '100 Gi',
        claim: '',
        type: pvAction,
        details: '',
        supportedActions: planVolume.supportedActions,
      }
    })
  }

  componentDidMount() {
    this.props.setFieldValue('persistentVolumes', this.getTableData());
  }

  render() {
    const { values, currentPlan } = this.props;
    const { rows, selectedOption } = this.state;

    console.log("here's the current plan: ", currentPlan);

    const tableData = this.getTableData();

    if (rows !== null) {
      return (
        <React.Fragment>
          <ReactTable
            css={css`
              font-size: 14px;
              .rt-td {
                overflow: visible;
              }
            `}
            data={tableData}
            columns={[
              {
                Header: () => (
                  <div
                    style={{
                      textAlign: 'left',
                      fontWeight: 600,
                    }}
                  >
                    PV Name
                  </div>
                ),
                accessor: 'name',
                width: 180,
                resizable: false,
              },
              {
                Header: () => (
                  <div
                    style={{
                      textAlign: 'left',
                      fontWeight: 600,
                    }}
                  >
                    Project
                  </div>
                ),
                accessor: 'project',
                width: 150,
                resizable: false,
              },
              {
                Header: () => (
                  <div
                    style={{
                      textAlign: 'left',
                      fontWeight: 600,
                    }}
                  >
                    Storage Class
                  </div>
                ),
                accessor: 'storageClass',
                width: 150,
                resizable: false,
              },
              {
                Header: () => (
                  <div
                    style={{
                      textAlign: 'left',
                      fontWeight: 600,
                    }}
                  >
                    Size
                  </div>
                ),
                accessor: 'size',
                width: 75,
                resizable: false,
              },
              {
                Header: () => (
                  <div
                    style={{
                      textAlign: 'left',
                      fontWeight: 600,
                    }}
                  >
                    Claim
                  </div>
                ),
                accessor: 'claim',
                width: 180,
                resizable: false,
              },
              {
                Header: () => (
                  <div
                    style={{
                      textAlign: 'left',
                      fontWeight: 600,
                    }}
                  >
                    Type
                  </div>
                ),
                accessor: 'type',
                width: 120,
                resizable: false,
                Cell: row => (
                  <Select
                    onChange={(val: any) => this.handleTypeChange(row, val)}
                    options={row.original.supportedActions.map(a => {
                      return {value: a, label: a};
                    })}
                    name="persistentVolumes"
                    value={{
                      label: row.original.type,
                      value: row.original.type,
                    }}
                  />
                ),
              },

              {
                Header: () => (
                  <div
                    style={{
                      textAlign: 'left',
                      fontWeight: 600,
                    }}
                  >
                    Details
                  </div>
                ),
                accessor: 'details',
                width: 50,
                resizable: false,
                textAlign: 'left',
                Cell: row => (
                  <a href="https://google.com" target="_blank">
                    view
                  </a>
                ),
              },
            ]}
            defaultPageSize={5}
            className="-striped -highlight"
          />
        </React.Fragment>
      );
    } else {
      return <div />;
    }
  }
}

const mapStateToProps = state => {
  return {
    plans: state.plan.migPlanList.map(p => p.MigPlan),
  }
}

export default connect(
  mapStateToProps, null,
)(VolumesTable);
