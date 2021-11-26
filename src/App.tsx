import React from 'react';
import * as THREE from 'three';
import styles from './App.module.css';
import ItemContainer from './ItemContainer';

interface itemsStateType {
  itemIndex: number,
  isFullList: boolean
}



const ItemsWrapper = ({children, setRef, itemsCount} : any) => {
  const [itemsState, setItemsState] = React.useState<itemsStateType>({itemIndex: 0, isFullList: true});

  const childrenWithProps = React.Children.map(children, (child, index) => {
    if (index >= itemsCount) return;
    if (itemsState.isFullList && index <= itemsCount - 1) {
      if (itemsCount - 1 === index) {
        console.log(index)
        return React.cloneElement(child, {index, itemsState, setItemsState, ref:setRef})
      }
      else 
        return React.cloneElement(child, {index, itemsState, setItemsState})
    }
    else if (index === itemsState.itemIndex) {
      return React.cloneElement(child, {index, itemsState, setItemsState})
    }
  })

  return (<div>{childrenWithProps}</div>)
}

function App() {
  let lastChildRef = React.useRef(null)
  let observer : IntersectionObserver;

  const [itemsCount, setItemsCount] = React.useState(3);
  const callbackFunction = (entries : any) => {
console.log(entries)
    const [entry] = entries;
    if (entry.isIntersecting) setItemsCount(count => count + 3);
  }

  const options = {
    root: null,
    rootMargin: "0px",
    threshold: 0.8
  }

  const setRef = (ref : any) => {
    if (lastChildRef.current) observer.unobserve(lastChildRef.current);
    lastChildRef.current = ref
  }

  React.useEffect(() => {
    observer = new IntersectionObserver(callbackFunction, options);
    if (lastChildRef.current) observer.observe(lastChildRef.current)

    return () => {
        if (lastChildRef.current) observer.unobserve(lastChildRef.current);
    }
}, [lastChildRef, options])

  return (
    <div className={styles.container}>
        <img src="assets/Red_LEGO.png"/>
      <ItemsWrapper setRef={setRef} itemsCount={itemsCount}>
        <ItemContainer/>
        <ItemContainer/>
        <ItemContainer/>
        <ItemContainer/>
        <ItemContainer/>
        <ItemContainer/>
        <ItemContainer/>
      </ItemsWrapper>
    </div>
  );
}

export default App;
