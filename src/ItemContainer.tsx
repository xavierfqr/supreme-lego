import React, { MouseEventHandler } from 'react';
import * as THREE from 'three';
import styles from "./ItemContainer.module.css";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { AmbientLight, DirectionalLight, AnimationMixer, Clock, TextureLoader, MeshStandardMaterial, CubeTextureLoader, PMREMGenerator, PointLight, Mesh, SphereGeometry, Vector2, Raycaster } from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import {ModelType, ItemType} from './App';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';


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

    const [inputColor, setInputColor] = React.useState({arms: 'white', legs: 'white', shirt: 'white', pelvis: 'white', brick: 'white'});
    let scene = React.useRef(new THREE.Scene());
    let camera : THREE.PerspectiveCamera;
    let renderer = React.useRef<THREE.WebGLRenderer>();
    let labelRenderer = React.useRef<CSS2DRenderer>();
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
            labelRenderer.current!.setSize(width, height);
        }
        return needResize;
    }

    const update = (delta: number) => {
        // mixer?.update(delta);
        controls.update();
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
        labelRenderer.current!.render( scene.current, camera );
        requestAnimationFrame(animate);
    };

    React.useEffect(() => {
        console.log(inputColor);
        if (gltfModel.current) {
            props.model!.parts.forEach(part => {
                document.getElementById(part.label + '_annotation')!.style.color = inputColor[part.label];
            });
        }
    }, [inputColor]);

    React.useEffect(() => {
        const currentItem = gltfModel.current?.getObjectByName('item_name')!;
        const parent = currentItem?.parent;
        parent?.remove(currentItem);

        const loader = new GLTFLoader();
        loader.load(
            `assets/gltf/${props.model.name}/scene.gltf`,
            gltf => {
                mixer = new AnimationMixer(gltf.scene);
                gltf.scene.traverse(child => child.castShadow = true);
                gltf.scene.traverse(child => child.receiveShadow = true);
                gltf.scene.name = 'item_name';

                props.model!.parts.forEach(part => {
                    const div = document.createElement('div');
                    div.id = part.label + '_annotation';
                    div.className = styles.annotation;
                    div.textContent = part.label;
                    const divLabel = new CSS2DObject(div);
                    divLabel.position.set(...part.position);
                    gltf.scene.add(divLabel);
                });

                gltfModel.current = gltf.scene;
                scene.current.add(gltf.scene)
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
    }, [props.model]);

    React.useEffect(() => {
        camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 2000 );
        camera.position.set(0, 15, 15);

        renderer.current = new THREE.WebGLRenderer({canvas: canvasRef.current!, antialias: true} );
        labelRenderer.current = new CSS2DRenderer();
        labelRenderer.current.domElement.className = styles.label_renderer;
        canvasRef.current!.parentElement!.appendChild(labelRenderer.current.domElement);
        
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
    }, []);
    


    const onColorChange = (e : any, item: ItemType) => {
        const material = new THREE.MeshStandardMaterial( { color: e.target.value} );
        gltfModel.current!.traverse((child: any) => {
            if (child.material) {
                console.log(child);
                const res = props.model!.parts.filter(part => part.label === item && part.tags.includes(child.name)).length
                if (res > 0) {
                    child.material = material
                }
            }
        }); 
        const newInputColors = {...inputColor}
        newInputColors[item] = e.target.value;
        setInputColor(newInputColors);
    }

    const onArrowClick = () => {
        props.setItemsState({itemIndex: props.model.index + 1, isFullList: false});
    }

    const onCanvasMouseDown = () => {
        clearTimeout(idleSettingDelay);
        isIdle.current = false;
        canvasRef.current!.style.cursor = 'grabbing';
    }

    const onCanvasMouseUp = () => {
        idleSettingDelay = setTimeout(() => isIdle.current = true, 2000);
        canvasRef.current!.style.cursor = 'grab';
    }

    const onCanvasDoubleClick = (e : any) => {
        e.preventDefault();

        const width = renderer.current!.domElement.clientWidth;
        const height = renderer.current!.domElement.clientHeight;

        const normalizedMouse = new Vector2();
        
        normalizedMouse.set(
            ((e.clientX - canvasRef.current!.offsetLeft) / width) * 2.0 - 1.0,
            ((e.clientY - canvasRef.current!.offsetTop) / height) * 2.0 - 1.0
        );

        const raycaster = new Raycaster();
        raycaster.setFromCamera(normalizedMouse, camera);
        const intersection = raycaster.intersectObject(scene.current, true);
        console.log('dblclick');
        if (intersection && intersection.length > 0) {
            console.log(intersection[0]);
            const target = intersection[0].point
            camera.position.set(target.x, target.y, target.z);
        }
    }

    return (
        <div className={styles.viewer_container}>
            <div  ref={ref}>
                <motion.canvas variants={canvasAppear}
                    initial="hidden" animate="visible" exit="exit"
                    ref={canvasRef} className={`${styles.canvas} ${styles.big}`} 
                    onMouseDown={onCanvasMouseDown} onMouseUp={onCanvasMouseUp} onDoubleClick={onCanvasDoubleClick}>
                </motion.canvas>
                <AnimatePresence>
                    <motion.div className={styles.pannel} variants={panelAppear} 
                                initial="hidden" animate="visible" exit="exit">
                        {props.model?.parts.map(part => 
                            <div key={part.label}>
                                <label>{`Change ${part.label} color`}</label>
                                <input type="color" value={inputColor[part.label]} onChange={(e) => onColorChange(e, part.label)}/>
                            </div>
                        )}
                    </motion.div>
                    <button onClick={() => onArrowClick()}>Next</button>
                </AnimatePresence>
            </div>
        </div>
    )
})

export default ItemContainer
