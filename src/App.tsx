import React from 'react';
import * as THREE from 'three';
import styles from './App.module.css';
import ItemContainer from './ItemContainer';

interface itemsStateType {
  itemIndex: number,
  isFullList: boolean
}

const ItemsWrapper = ({children} : any) => {
  const [itemsState, setItemsState] = React.useState<itemsStateType>({itemIndex: 0, isFullList: true});

  const childrenWithProps = React.Children.map(children, (child, index) => {
    if (itemsState.isFullList) {
      return React.cloneElement(child, {index, itemsState, setItemsState})
    }
    else if (index === itemsState.itemIndex) {
      return React.cloneElement(child, {index, itemsState, setItemsState})
    }
  })

  return (<div>{childrenWithProps}</div>)
}

function App() {
  return (
    <div className={styles.container}>
      <ItemsWrapper>
        <ItemContainer/>
        <ItemContainer/>
        <ItemContainer/>
      </ItemsWrapper>
    </div>
  );
}

export default App;
