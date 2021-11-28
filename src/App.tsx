import React from 'react';
import * as THREE from 'three';
import styles from './App.module.css';
import ItemContainer from './ItemContainer';
import HiddenCanvas from './components/HiddenCanvas';

interface itemsStateType {
  itemIndex: number,
  isFullList: boolean
}

export interface Models {
  index: number,
  name: string
}


function App() {
  let lastChildRef = React.useRef<HTMLCanvasElement | null>(null)
  const modelsRef = React.useRef<Array<HTMLCanvasElement | null>>([])
  const [models, setModels] = React.useState(
    [
      {index: 0, name: 'character_male'},
      {index: 1, name: 'character_male'},
      {index: 2, name: 'character_male'},
      {index: 3, name: 'character_male'},
      {index: 4, name: 'character_male'},
      {index: 5, name: 'character_male'},
      {index: 6, name: 'character_male'},
      {index: 7, name: 'character_male'},

    ]
  )
  const [itemsCount, setItemsCount] = React.useState(3);
  const [itemsState, setItemsState] = React.useState<itemsStateType>({itemIndex: 0, isFullList: true});

  let observer : IntersectionObserver;

  const callbackFunction = (entries : any) => {
    const [entry] = entries;
    if (entry.isIntersecting) {
      if (lastChildRef.current) observer.unobserve(lastChildRef.current);
      lastChildRef.current = modelsRef.current[itemsCount];
      if (lastChildRef.current) observer.observe(lastChildRef.current)
      console.log(itemsCount)
      setItemsCount(count => count + 1);
    }
  }

  const options = {
    root: null,
    rootMargin: "0px",
    threshold: 1
  }



  const setRef = (ref : any, index: number) => {
    modelsRef.current[index] = ref;
    if (index === itemsCount - 1){
      lastChildRef.current = ref;
    }
  }

  React.useEffect(() => {
    observer = new IntersectionObserver(callbackFunction, options);
    if (lastChildRef.current) observer?.observe(lastChildRef.current)

    return () => {
        if (lastChildRef.current) observer.unobserve(lastChildRef.current);
    }
}, [lastChildRef, options])

  React.useEffect(() => {
    models.forEach((model) => {
      if (model.index >= itemsCount){
        modelsRef.current[model.index]!.style.display = 'none';
      }
      else {
        modelsRef.current[model.index]!.style.display = 'block';
      }
    })
  }, [itemsCount])
  
  React.useEffect(() => {
    if (itemsState.isFullList){
      setItemsCount(3);
    }
    console.log(models)
  }, [itemsState.isFullList])

  const onCanvasClick = (index: number) => () => {
    setItemsState({itemIndex: index, isFullList: false})
  }


  return (
    <div className={styles.container}>
      {itemsState.isFullList ?
      <div>
        {
          models.map((model, index) => {
            return <canvas className={styles.canvas} onClick={onCanvasClick(index)} key={model.index} ref={(ref) => setRef(ref, index)}></canvas>
          })
        }
        <HiddenCanvas models={models} modelsRef={modelsRef}></HiddenCanvas>
      </div>
      :
      <ItemContainer model={models[itemsState.itemIndex]} itemsState={itemsState} setItemsState={setItemsState}></ItemContainer>

    }
    </div>
  );
}

export default App;