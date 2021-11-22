import React from 'react';
import * as THREE from 'three';
import styles from './App.module.css';
import ItemContainer from './ItemContainer';

function App() {

  return (
    <div className={styles.container}>
      <div>Fancy app</div>
      <ItemContainer/>
      <input type="color"/>
    </div>
  );
}

export default App;
