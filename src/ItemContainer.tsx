import React from 'react';
import * as THREE from 'three';
import styles from "./ItemContainer.module.css";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { AmbientLight, DirectionalLight, AnimationMixer, Clock, TextureLoader, MeshStandardMaterial, CubeTextureLoader, PMREMGenerator, PointLight, Mesh, SphereGeometry } from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import {ModelType, ItemType} from './App';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment'


interface ItemContainerProps {
    setItemsState: any,
    itemsState: any,
    model: ModelType
}


const panelAppear = {
    hidden: {
        x: "100%",
    },
    visible: {
        x: "0%",
        transition: {
            duration: 5,
            type: "spring",
            damping: 25,
            stiffness: 200
        }
    },
    exit: {
        x: "100%",
        transition: {
            type: "spring",
            damping: 25,
            stiffness: 200
        }
    }
}

const canvasAppear = {
    hidden: {
        opacity: 0
    },
    visible: {
        opacity: 1,
        transition: {
            duration: 2
        }
    },
    exit: {
        opacity: 0
    }
}


const ItemContainer = React.forwardRef<HTMLDivElement, ItemContainerProps>((props : ItemContainerProps, ref) => {

    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    const [isZoomed, setIsZoomed] = React.useState(!props.itemsState.isFullList);
    const [inputColor, setInputColor] = React.useState({arms: 'red', legs: 'blue', shirt: 'black', pelvis: 'blue'});
    let scene = React.useRef(new THREE.Scene());
    let camera : THREE.PerspectiveCamera;
    let renderer = React.useRef<THREE.WebGLRenderer>();
    let mixer : AnimationMixer;
    let gltfModel = React.useRef<THREE.Group>();
    const clock = new Clock();
    let controls : OrbitControls;
    const isIdle = React.useRef(false);
    let idleSettingDelay = setTimeout(() => isIdle.current = true, 2000);

    function resizeRendererToDisplaySize(renderer: THREE.WebGLRenderer) {
        const canvas = renderer.domElement; 
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    const update = (delta: number) => {
        // mixer?.update(delta);
        if (gltfModel.current && isIdle.current) {
            gltfModel.current.rotation.y += delta;
        }
        if (resizeRendererToDisplaySize(renderer.current!)) {
            const canvas = canvasRef.current;
            if (canvas) {
                camera.aspect = canvas.clientWidth / canvas.clientHeight;
                camera.updateProjectionMatrix();
            }
        }
    };

    const animate = () => {
        let delta = clock.getDelta();
        update(delta);
        renderer.current!.render( scene.current, camera );
        requestAnimationFrame(animate);
    };

    React.useEffect(() => {
        console.log('model', props.model)
        const currentItem = gltfModel.current?.getObjectByName('item_name')!;
        const parent = currentItem?.parent;
        parent?.remove(currentItem);

        const loader = new GLTFLoader();
        loader.load(
            `assets/gltf/${props.model.name}/scene.gltf`,
            gltf => {
                console.log('je suis dans glft ')
                mixer = new AnimationMixer(gltf.scene);
                gltf.scene.traverse(child => child.castShadow = true);
                gltf.scene.traverse(child => child.receiveShadow = true);
                gltf.scene.name = 'item_name';
                gltfModel.current = gltf.scene;
                scene.current.add(gltf.scene)
                console.log(gltf.scene)
                gltf.animations.forEach(element => {
                    mixer.clipAction(element).play();
                });
            }   
        );

        return () => {
            const currentItem = gltfModel.current?.getObjectByName('item_name')!;
            const parent = currentItem?.parent;
            parent?.remove(currentItem);
        }
    }, [props.model])

    React.useEffect(() => {
        camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000 );
        camera.position.set(0, 15, 15);

        renderer.current = new THREE.WebGLRenderer({canvas: canvasRef.current!, antialias: true} );

        //renderer.setSize(window.innerWidth / (resizeCanvas ? 1.5 : 4), window.innerHeight / (resizeCanvas ? 1.5 : 4));
        
        controls = new OrbitControls(camera, renderer.current.domElement)
        controls.enableDamping = true;
        controls.enablePan = true;

        const loader = new GLTFLoader();
        
        loader.load(
            'assets/gltf/surroundings/scene.gltf',
            gltf => {
                gltf.scene.traverse(child => child.receiveShadow = true);
                scene.current.add(gltf.scene);
            }
        );

        const texture = new CubeTextureLoader()
        .setPath('assets/')
        .load([
            'background.jpg',
            'background.jpg',
            'background.jpg',
            'background.jpg',
            'background.jpg',
            'background.jpg',
        ]);

        scene.current.background = texture;

        const pmremGenerator = new PMREMGenerator(renderer.current);
        scene.current.environment = pmremGenerator.fromScene(new RoomEnvironment(), .1).texture;

        const lampLight = new PointLight();
        lampLight.position.set(15, 15, 0);

        const light = new DirectionalLight();
        light.position.set(15, 15, 0);
        light.add(light.target);
        light.target.position.set(-1, -1, 0);
        light.intensity = 2;

        scene.current.add(light);

        renderer.current.shadowMap.enabled = true;
        const shadowLight = new DirectionalLight();
        shadowLight.position.set(15, 15, 0);
        shadowLight.add(shadowLight.target);
        shadowLight.target.position.set(-1, -1, 0);
        shadowLight.shadow.mapSize.set(2048, 2048);
        shadowLight.castShadow = true;

        scene.current.add(shadowLight);

        animate();
    }, [])
    


    const onColorChange = (e : any, item: ItemType) => {
        const material = new THREE.MeshStandardMaterial( { color: e.target.value} );
        gltfModel.current!.traverse(function (child: any) {
            if (child.material) {
                const res = props.model?.parts.filter(part => part.label === item && part.tags.includes(child.name)).length
                if (res !== undefined && res > 0) {
                    child.material = material
                }
            }
        }); 
        const newInputColors = {...inputColor}
        newInputColors[item] = e.target.color;
        setInputColor(newInputColors);
    }

    const onCanvasClick = () => {
        props.setItemsState({itemIndex: 0, isFullList: !props.itemsState.isFullList});
        setIsZoomed(!isZoomed);
    }

    const onArrowRightClick = () => {
        props.setItemsState({itemIndex: props.model.index + 1, isFullList: false});
    }

    const onArrowLeftClick = () => {
        props.setItemsState({itemIndex: props.model.index - 1, isFullList: false});
    }

    const onCanvasMouseDown = () => {
        clearTimeout(idleSettingDelay);
        isIdle.current = false;
    }

    const onCanvasMouseUp = () => {
        idleSettingDelay = setTimeout(() => isIdle.current = true, 2000)
    }

    return (
        <div className={styles.container} ref={ref}>
            <div style={{position:'relative'}}>
                <motion.canvas variants={canvasAppear}
                    initial="hidden" animate="visible" exit="exit"
                    ref={canvasRef} className={`${styles.canvas} ${isZoomed ? styles.big : styles.little}`} 
                    onMouseDown={onCanvasMouseDown} onMouseUp={onCanvasMouseUp}>
                </motion.canvas>
                {isZoomed && <div>
                    <div onClick={() => onArrowRightClick()} className={styles.arrowRight}>
                        <img src={'right-arrow.png'} ></img>
                    </div>
                    <div onClick={() => onArrowLeftClick()} className={styles.arrowLeft}>
                        <img src={'right-arrow.png'} ></img>
                    </div>
                    </div>
                }
            </div>

            <AnimatePresence>
            {
                isZoomed ? 
                <div>
                    <button onClick={() => {setIsZoomed(false); props.setItemsState({itemIndex: props.itemsState.index, isFullList: true});}}>back</button>
                    <motion.div className={styles.pannel} variants={panelAppear} 
                                initial="hidden" animate="visible" exit="exit">
                        {props.model?.parts.map(part => 
                            <div>
                                <label>{`Change ${part.label} color`}</label>
                                <input type="color" value={inputColor[part.label]} onChange={(e) => onColorChange(e, part.label)}/>
                                </div>
                        )}
                    </motion.div>

                </div>
                
                :
                null
            }
            </AnimatePresence>
        </div>
    )
})

export default ItemContainer
