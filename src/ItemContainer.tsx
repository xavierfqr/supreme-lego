import React from 'react';
import * as THREE from 'three';
import styles from "./ItemContainer.module.css";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { AmbientLight, DirectionalLight, AnimationMixer, Clock, TextureLoader, MeshStandardMaterial } from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import {Models} from './App';


interface ItemContainerProps {
    index?: number,
    setItemsState?: any,
    itemsState?: any,
    model: Models
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

type ItemType = 'arms' | 'legs' | 'shirt' | 'pelvis';


const ItemContainer = React.forwardRef<HTMLDivElement, ItemContainerProps>((props : ItemContainerProps, ref) => {

    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    const [isZoomed, setIsZoomed] = React.useState(!props.itemsState.isFullList);
    const [inputColor, setInputColor] = React.useState({arms: 'red', legs: 'blue', shirt: 'black', pelvis: 'blue'});
    let scene : THREE.Scene;
    let camera : THREE.PerspectiveCamera;
    let renderer = React.useRef<THREE.WebGLRenderer>();
    let mixer : AnimationMixer;
    let gltfModel = React.useRef<THREE.Group>();
    const clock = new Clock();

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

    const animate = () => {
        let delta = clock.getDelta();
        requestAnimationFrame(animate);
        // mixer?.update(delta);
        if (gltfModel.current){
            gltfModel.current.rotation.y += delta;
            // gltfModel.current.rotation.x += 0.0;
        }
        if (resizeRendererToDisplaySize(renderer.current!)) {
            const canvas = canvasRef.current;
            if (canvas){
                camera.aspect = canvas.clientWidth / canvas.clientHeight;
                camera.updateProjectionMatrix();
            }
        }


        renderer.current!.render( scene, camera );
    };

    React.useEffect(() => {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000 );

        renderer.current = new THREE.WebGLRenderer({canvas: canvasRef.current!, antialias: true, preserveDrawingBuffer: true} );
        


        console.log(props.model)
        const loader = new GLTFLoader();
        loader.load(
            `assets/gltf/${props.model.name}/scene.gltf`,
            gltf => {
                mixer = new AnimationMixer(gltf.scene);
                gltfModel.current = gltf.scene;
                gltf.scene.position.y = -5 ;
                scene.add(gltf.scene)
                gltf.animations.forEach(element => {
                    mixer.clipAction(element).play();
                });
            }
        )

        loader.load(
            `assets/gltf/${props.model.name}/scene.gltf`,
            gltf => {
                mixer = new AnimationMixer(gltf.scene);
                gltf.scene.position.y = -5 ;
                gltf.scene.position.x = -5 ;
                scene.add(gltf.scene)
            }
        )
        const texture = new TextureLoader().load('sky_cloud_evening.jpg');

        const light = new DirectionalLight();
        light.add(light.target);
        light.position.set(-20, 20, 20);
        light.intensity = 1;

        camera.position.z = 10;
        scene.background = texture;

        scene.add(light, light.target);

        animate();
    }, [])
    


    const onColorChange = (e : any, item: ItemType) => {
        const material = new THREE.MeshStandardMaterial( { color: e.target.value} );
        gltfModel.current!.traverse(function (child: any) {
            if (child.material){
                if (item === 'arms' && (child.name === "Arm_Right_Red_Mat_0" || child.name === "Arm_Left_Red_Mat_0"))
                    child.material = material
                else if (item === 'legs' && (child.name === "Leg1_Blue_Mat_0" || child.name === "Leg2_Blue_Mat_0"))
                    child.material = material
                else if (item === 'shirt' && child.name === "polySurface1_Red_Mat_0")
                    child.material = material
                else if (item === 'pelvis' && child.name === "Pelvis1_Blue_Mat_0")
                    child.material = material
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

    const onArrowClick = () => {
        props.setItemsState({itemIndex: props.index! + 1, isFullList: false});
        setIsZoomed(!isZoomed);
    }

    return (
        <div className={styles.container} ref={ref}>
            <motion.canvas variants={canvasAppear}
                initial="hidden" animate="visible" exit="exit"
                ref={canvasRef} className={`${styles.canvas} ${isZoomed ? styles.big : styles.little}`} onClick={onCanvasClick}>
            </motion.canvas>
            <AnimatePresence>
            {
                isZoomed ? 
                <div>
                    <motion.div className={styles.pannel} variants={panelAppear}
                            initial="hidden" animate="visible" exit="exit">
                            <label>Change arms color</label>
                            <input type="color" value={inputColor.arms} onChange={(e) => onColorChange(e, 'arms')}/>
                            <label>Change legs color</label>
                            <input type="color" value={inputColor.legs} onChange={(e) => onColorChange(e, 'legs')}/>
                            <label>Change shirt color</label>
                            <input type="color" value={inputColor.shirt} onChange={(e) => onColorChange(e, 'shirt')}/>
                            <label>Change pelvis color</label>
                            <input type="color" value={inputColor.pelvis} onChange={(e) => onColorChange(e, 'pelvis')}/>
                    </motion.div>
                    <button onClick={() => onArrowClick()}>Next</button>

                </div>
                
                :
                null
            }
            </AnimatePresence>
        </div>
    )
})

export default ItemContainer
