import React from 'react';
import {
  Button,
  DataListItem,
  DataListCell,
  DataListToggle,
  DataListItemRow,
  DataListItemCells,
  DataListAction,
} from '@patternfly/react-core';
import { useOpenModal } from '../../../duck/hooks';
import { PlusCircleIcon } from '@patternfly/react-icons';
import AddEditStorageModal from '../../../../storage/components/AddEditStorageModal';
import StorageContent from './StorageContent';

const StorageDataListItem = ({
  id,
  dataList,
  associatedPlans,
  removeStorage,
  isExpanded,
  toggleExpanded,
  ...props }) => {
  const [isOpen, toggleOpen] = useOpenModal(false);
  if (dataList) {
    return (
      <DataListItem aria-labelledby="storage-container-item" isExpanded={isExpanded}>
        <DataListItemRow>
          <DataListToggle
            onClick={() => toggleExpanded(id)}
            isExpanded={isExpanded}
            id="storage-toggle"
          />
          <DataListItemCells
            dataListCells={[
              <DataListCell id="storage-item" key="storage">
                <span id="name">Repositories</span>
              </DataListCell>,
            ]}
          />
          <DataListAction aria-label="add-plan" aria-labelledby="plan-item" id="add-plan">
            <Button onClick={toggleOpen} variant="link" id="add-repo-btn">
              <PlusCircleIcon /> Add repository
            </Button>
            <AddEditStorageModal
              isOpen={isOpen}
              onHandleClose={toggleOpen}
            />
          </DataListAction>
        </DataListItemRow>
        <StorageContent
          associatedPlans={associatedPlans}
          dataList={dataList}
          isExpanded={isExpanded}
          removeStorage={removeStorage}
          {...props}
        />
      </DataListItem>
    );
  }
  return null;
};

export default StorageDataListItem;
