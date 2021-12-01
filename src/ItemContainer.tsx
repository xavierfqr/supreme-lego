import React, { MouseEventHandler } from 'react';
import * as THREE from 'three';
import styles from "./ItemContainer.module.css";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { AmbientLight, DirectionalLight, AnimationMixer, Clock, TextureLoader, MeshStandardMaterial, CubeTextureLoader, PMREMGenerator, PointLight, Mesh, SphereGeometry, Vector2, Raycaster, Object3D } from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import {ModelType, ItemType} from './App';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { canvasAppear, infosAppear, panelAppear } from './utils/animations';

interface ItemContainerProps {
    setItemsState: any,
    itemsState: any,
    model: ModelType,
    setProgress: Function
}

type SizeType = 'height' | 'width';

const ItemContainer = (props : ItemContainerProps) => {

    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    const [inputColor, setInputColor] = React.useState({hair: 'brown', arms: 'red', legs: 'blue', shirt: 'red', pelvis: 'blue', brick: 'black'});
    const [brickSize, setBrickSize] = React.useState({width: 1, height: 1});
    const [isVisible, setIsVisible] = React.useState(true);
    const [isAnnotationVisible, setAnnotationVisible] = React.useState(true);
    let scene = React.useRef(new THREE.Scene());
    let camera = React.useRef<THREE.PerspectiveCamera | null>(null);
    let renderer = React.useRef<THREE.WebGLRenderer>();
    let labelRenderer = React.useRef<CSS2DRenderer>();
    let mixer : AnimationMixer;
    let gltfModelContainer = React.useRef<THREE.Object3D>();
    const clock = new Clock();
    let controls : OrbitControls;
    const isIdle = React.useRef(false);
    let idleSettingDelay = setTimeout(() => isIdle.current = true, 2000);
    const rotationSpeed = React.useRef(1);
    let rotationSpeedChange : NodeJS.Timeout;
    const [isLoaded, setIsLoaded] = React.useState(false);

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
        controls.update();
        if (gltfModelContainer.current && isIdle.current) {
            gltfModelContainer.current.rotation.y += delta * rotationSpeed.current;
        }
        if (resizeRendererToDisplaySize(renderer.current!)) {
            const canvas = canvasRef.current;
            if (canvas && camera.current) {
                camera.current.aspect = canvas.clientWidth / canvas.clientHeight;
                camera.current.updateProjectionMatrix();
            }
        }
    };

    const animate = () => {
        let delta = clock.getDelta();
        update(delta);
        renderer.current!.render( scene.current, camera.current! );
        labelRenderer.current!.render( scene.current, camera.current! );
        requestAnimationFrame(animate);
    };

    React.useEffect(() => {
        console.log('pass here');
        if (gltfModelContainer.current) {
            const visibility = isAnnotationVisible ? 'visible' : 'hidden';
            props.model!.parts.forEach(part => {
                const elem = document.getElementById(part.label + '_annotation');
                if (elem) elem.style.visibility = visibility;
            });
        }
    }, [isAnnotationVisible]);

    React.useEffect(() => {

        const loader = new GLTFLoader();
        loader.load(
            `assets/gltf/${props.model.name}/scene.gltf`,
            gltf => {
                gltf.scene.traverse((child: any) => {
                    child.castShadow = true
                    child.receiveShadow = true
                    if (child.material) {
                        child.material.transparent = true;
                    }
                });

                props.model!.parts.forEach(part => {
                    const div = document.createElement('div');
                    div.id = part.label + '_annotation';
                    div.className = styles.annotation;
                    div.textContent = part.label;
                    const divLabel = new CSS2DObject(div);
                    divLabel.position.set(...part.position);
                    gltf.scene.add(divLabel);
                });

                gltfModelContainer.current = new Object3D();
                gltfModelContainer.current.add(gltf.scene);
                scene.current.add(gltfModelContainer.current);

                if (props.model.parts.length === 1) {
                    const material = new THREE.MeshStandardMaterial( { color: '#000000' } );
                    gltf.scene.traverse((child: any) => {
                        if (child.material && props.model.parts[0].tags.includes(child.name)) {
                            child.material = material;
                        }
                    });
                }
                setAnnotationVisible(true);
                rotationSpeedChange = setInterval(() => {
                    if (rotationSpeed.current === 1) {
                        clearInterval(rotationSpeedChange);
                        setIsLoaded(true);
                    } else {
                        rotationSpeed.current -= 1; 
                    }
                }, 20);
            }   
        );

        setBrickSize({width: 1, height: 1});
        return () => {
            gltfModelContainer.current!.remove(...gltfModelContainer.current!.children);

            labelRenderer.current!.domElement.innerHTML = '';
        }
    }, [props.model]);

    React.useEffect(() => {
        camera.current = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 2000 );
        camera.current.position.set(0, 15, 15);

        renderer.current = new THREE.WebGLRenderer({canvas: canvasRef.current!, antialias: true} );
        labelRenderer.current = new CSS2DRenderer();
        labelRenderer.current.domElement.className = styles.label_renderer;
        canvasRef.current!.parentElement!.appendChild(labelRenderer.current.domElement);
        
        controls = new OrbitControls(camera.current, renderer.current.domElement)
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
        gltfModelContainer.current!.traverse((child: any) => {
            if (child.material) {
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

    const modelTransition = (direction: number) => {
        if (isLoaded) {
            rotationSpeedChange = setInterval(() => {
                if (rotationSpeed.current === 40) {
                    clearInterval(rotationSpeedChange);
                    props.setItemsState({itemIndex: props.model.index + direction, isFullList: false});
                } else {
                    rotationSpeed.current += 1;
                }
            }, 20); 
            setIsLoaded(false);
        }
    }

    const onArrowRightClick = () => {
        modelTransition(1);
    }

    const onArrowLeftClick = () => {
        modelTransition(-1);
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
        raycaster.setFromCamera(normalizedMouse, camera.current!);
        const intersection = raycaster.intersectObject(scene.current, true);
        if (intersection && intersection.length > 0) {
            const target = intersection[0].point
            camera.current!.position.set(target.x, target.y, target.z);
        }
    }

    const onBackButtonClick = () => {
        setIsVisible(false);
        setTimeout(() => {
            props.setItemsState({itemIndex: props.itemsState.index, isFullList: true})
            props.setProgress(0);
        }, 1000)
    }

    React.useEffect(() => {
        if (gltfModelContainer.current) {
            gltfModelContainer.current!.remove(...gltfModelContainer.current!.children);

            const material = new THREE.MeshStandardMaterial( { color: inputColor['brick']} );
            const loader = new GLTFLoader();

            Array.from(Array(brickSize.height).keys()).forEach(x => {
                Array.from(Array(brickSize.width).keys()).forEach(z => {
                    loader.load(
                        `assets/gltf/${props.model.name}/scene.gltf`,
                        gltf => {
                            gltf.scene.traverse(child => child.castShadow = true);
                            gltf.scene.traverse(child => child.receiveShadow = true);
                            gltf.scene.position.set((x - brickSize.height / 2) * 2 + 1, 0, (z - brickSize.width / 2) * 2 + 1);
                            gltf.scene.traverse((child: any) => {
                                if (child.material) {
                                    const res = props.model!.parts.filter(part => part.label === props.model.parts[0].label && part.tags.includes(child.name)).length
                                    if (res > 0) {
                                        child.material = material
                                    }
                                }
                            });
                            gltfModelContainer.current!.add(gltf.scene);
                        }
                    );
                });
            });
        }
    }, [brickSize]);

    const onChangeSize = (e: any, size: SizeType) => {
        const newValue = parseInt(e.target.value);
        if (size === 'width') {
            setBrickSize({width: newValue, height: brickSize.height});
        } else {
            setBrickSize({width: brickSize.width, height: newValue});
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.backButton}>
                <img className={styles.backButtonImage} onClick={() => onBackButtonClick()} src='arrow.png'></img>
            </div>
            <AnimatePresence>
                {isVisible &&
                <div className={styles.middle}>
                    <motion.div style={{position:'relative'}} variants={canvasAppear}
                            initial="hidden" animate="visible" exit="exit">
                        <canvas
                            ref={canvasRef} className={`${styles.canvas}`} 
                            onMouseDown={onCanvasMouseDown} onMouseUp={onCanvasMouseUp} onDoubleClick={onCanvasDoubleClick}>
                        </canvas>
                        <div>
                            <div onClick={() => onArrowRightClick()} className={styles.arrowRight}>
                                <img src={'right-arrow.png'}></img>
                            </div>
                            <div onClick={() => onArrowLeftClick()} className={styles.arrowLeft}>
                                <img src={'right-arrow.png'}></img>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div className={styles.infos} variants={infosAppear} 
                        initial="hidden" animate="visible" exit="exit">
                        <h2>Informations</h2>
                        <div>{props.model.infos}</div>
                    </motion.div>
                </div>
                }
            </AnimatePresence>
            <AnimatePresence>
                {isVisible &&
                    <motion.div className={styles.pannel} variants={panelAppear} 
                                initial="hidden" animate="visible" exit="exit">
                        <h2>Customization Panel</h2>
                        <table style={{borderSpacing: '1rem'}}>
                            <tbody>
                                {props.model?.parts.map(part =>
                                    <tr key={part.label}>
                                        <td><label>{`Change ${part.label} color`}</label></td>
                                        <td><input type="color" className={styles.colorPicker} value={inputColor[part.label]} onChange={(e) => onColorChange(e, part.label)}/></td>
                                    </tr>
                                )}
                                {props.model?.parts.length === 1 &&
                                    Object.entries(brickSize).map(size => {
                                        return (
                                            <tr key={size[0]}>
                                                <td><label>{`Change ${size[0]}`}</label></td>
                                                <td><select value={size[1]} onChange={(e) => onChangeSize(e, size[0] as SizeType)}>
                                                    {Array.from(Array(8).keys()).map(x => x + 1).map(i => <option key={i} value={i}>{i}</option>)}
                                                </select></td>
                                            </tr>
                                        )
                                    })
                                }
                                <tr>
                                    <td><label>Annotations visible</label></td>
                                    <td><input type='checkbox' checked={isAnnotationVisible} onChange={(e) => setAnnotationVisible(e.target.checked)}/></td>
                                </tr>
                            </tbody>
                        </table>
                    </motion.div>
                }
            </AnimatePresence>
        </div>
    )
}

export default ItemContainer
