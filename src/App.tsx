import React from 'react';
import * as THREE from 'three';
import styles from './App.module.css';
import ItemContainer from './ItemContainer';
import HiddenCanvas from './components/HiddenCanvas';

interface itemsStateType {
  itemIndex: number,
  isFullList: boolean
}

export interface ModelType {
  index: number,
  name: string,
  parts: ModelPartType[]
}

interface ModelPartType {
  label: ItemType,
  tags: string[],
  position: [number, number, number]
}

export type ItemType = 'arms' | 'legs' | 'shirt' | 'pelvis' | 'brick';



const modelsData : ModelType[] = [
  {
    index: 0,
    name: 'character_male',
    parts: [
      { label: 'shirt', tags: [ "polySurface1_Red_Mat_0002" ], position: [0, 4.5, 1] },
      { label: 'arms', tags: [ "Arm_Right_Red_Mat_0002", "Arm_Left_Red_Mat_0002" ], position: [-3, 4, 0] },
      { label: 'legs', tags: [ "Leg1_Blue_Mat_0002" , "Leg2_Blue_Mat_0002" ], position: [-2.5, 1.5, 0] },
      { label: 'pelvis', tags: [ "Pelvis1_Blue_Mat_0002" ], position: [0, 3, 1] },
    ]
  },
  {
    index: 1,
    name: 'character_female',
    parts: [
      { label: 'shirt', tags: [ "cos_leia_smooth_plastic_legoMAT_0" ], position: [0, 4.5, 1] },
      { label: 'arms', tags: [ "brasEsqLeiaSmooth_plastic_legoMAT_0", "brasDretLeiasmooth_plastic_legoMAT_0" ], position: [-3, 4, 0] },
      { label: 'legs', tags: [ "camaEsq_lowLeia_plastic_legoMAT_0" , "camaDreta_lowLeia_plastic_legoMAT_0" ], position: [-2.5, 1.5, 0] },
      { label: 'pelvis', tags: [ "entrecuixleia_plastic_legoMAT_0", "caderaleia_plastic_legoMAT_0" ], position: [0, 3, 1] },
    ]
  },
  {
    index: 2,
    name: 'brick',
    parts: [
      { label: 'brick', tags: [ "Base002" ], position: [0, 3.5, 0]}
    ]
  },
  {
    index: 3,
    name: 'brick_thin',
    parts: [
      { label: 'brick', tags: [ "pCylinder4_lambert1_0" ], position: [0, 3.5, 0]}
    ]
  }
];


function App() {
  let lastChildRef = React.useRef<HTMLCanvasElement | null>(null)
  const modelsRef = React.useRef<Array<HTMLCanvasElement | null>>([])
  const [models, setModels] = React.useState(modelsData)
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
      {
        itemsState.isFullList ?
          <div>
            {
              models.map((model, index) => {
                return <canvas className={styles.canvas} onClick={onCanvasClick(index)} key={model.index} ref={(ref) => setRef(ref, index)}></canvas>
              })
            }
            <HiddenCanvas models={models} modelsRef={modelsRef}></HiddenCanvas>
          </div>
        :
          <div className={styles.item_container}>
            <ItemContainer model={models[itemsState.itemIndex % itemsCount]} itemsState={itemsState} setItemsState={setItemsState}></ItemContainer>
          </div>
      }
    </div>
  );
}

export default App;