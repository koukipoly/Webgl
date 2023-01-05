// setting the enviornment
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// scene color
renderer.setClearColor( 0xe6e6e6, 1);

// adding a light to be able to see 
const light = new THREE.AmbientLight( 0xffffff ); // soft white light
scene.add( light );


//function to create cubes (play envvironment where the ball will be able to move)
//the environment contains 3 cubes, 2 symmetrycial and one big that links the 2
function createCube(size, posX, posZ, color=0x000000, posY=0){
    const geometry = new THREE.BoxGeometry(size.w, size.h, size.d);
    const material = new THREE.MeshBasicMaterial( { color: color } );
    const cube = new THREE.Mesh( geometry, material );
    cube.position.x= posX;
    cube.position.z= posZ;
    cube.position.y= posY;
    scene.add( cube );
}

//Creating the 3 cubes 
function createTrack(){
    createCube({w:start_position*2, h:1.5, d:1}, 0, -2, 0x333333);
    createCube({w:.2, h:1.5, d:1}, start_position, -1);
    createCube({w:.2, h:1.5, d:1}, end_position, -1);
    
}

//global variables
const start_position=6;
const end_position= -start_position;
const text= document.querySelector(".text")
const text2= document.querySelector(".text2")
const TIME_LIMIT = 10
let gameStat = "loading"
let isLookingBackward = false;
// camera position is set to 5 (close to the object)
camera.position.z = 5;

// loading the model
const loader = new THREE.GLTFLoader();

function delay(ms){
    return new Promise(resolve => setTimeout(resolve, ms))
}

//The game contains 2 classes, a class of doll and a class of player
//The class doll is initiated for the doll to look forward and backward
//when the function start is called, the doll starts turning
class Doll{
    constructor(){
        loader.load("../models/scene.gltf", (gltf)=>{
            scene.add(gltf.scene);
            gltf.scene.scale.set(0.03, 0.03, 0.03);
            gltf.scene.position.set(0, -2.7, 0);
            this.doll = gltf.scene;
            console.log(this.doll);
        })
    }

    lookBackward(){
        gsap.to(this.doll.rotation, {y: -3.15, duration: .45})
        setTimeout(()=>isLookingBackward = true, 150)
    }

    lookForward(){
        setTimeout(()=>isLookingBackward = false, 50)
        gsap.to(this.doll.rotation, {y: 0, duration: .45})
        
    }

    async start(){
        this.lookForward()
        await delay((Math.random() * 1500) +750)
        this.lookBackward()
        await delay((Math.random() * 500) +500)
        this.start()
    }
}

//The class player is a yellow sphere that will be able to move to the left
//when the left key arrow is pressed, the sphere will move forward.
//The player loses if the doll is looking and the veloc ity of the ball is >1
//The player wins if he attains the end position
class Player{
    constructor(){
        const geometry = new THREE.SphereGeometry( .2, 32, 16 );
        const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
        const sphere = new THREE.Mesh( geometry, material );
        sphere.position.z=-1;
        sphere.position.x=start_position;
        scene.add( sphere );
        this.player=sphere;
        this.playerInfo ={
            posX:start_position-.8,
            velocity:.0
        }
        
    }

    run(){
        this.playerInfo.velocity=.04
    }

    stop(){
        // this.playerInfo.velocity=0
        gsap.to(this.playerInfo, {velocity:0, duration:.2})
    }

   check(){
        if(this.playerInfo.velocity>0 && isLookingBackward){
            text.innerText="You lose"
            gameStat="over"
        }
        if(this.playerInfo.posX<end_position+.9){
            console.log(this.playerInfo.posX)
            text.innerText="You win"
            gameStat="over"
        }
   }

    update(){
        this.check()
        this.playerInfo.posX-=this.playerInfo.velocity
        this.player.position.x= this.playerInfo.posX
    }
}

// Creating a new player and doll
createTrack()
let player= new Player;
let doll= new Doll();
let time =0;

// Pre game
async function init(){
    await delay(500)
    text.innerText= "Starting in 3"
    await delay(500)
    text.innerText= "Starting in 2"
    await delay(500)
    text.innerText= "Starting in 1"
    await delay(500)
    text.innerText= "GOOOO!!!!"
    startGame()
}

// This is the function that will start our game
function startGame(){
    gameStat="started"
    setTimeout(()=>{
        doll.start()
    },1);
}

// This is the function that will make the game over (player lost), if player runs out of time
async function timein(){
    await delay(2000)
    let i=15;
    while( i>=0 && gameStat!="over"){
        await delay(1000)
        text2.innerText=i;
        i--;
    }
    gameStat="over";
    if(i==0){
        text.innerText="You lose";
    }
}
timein();
init()



// animating
function animate() {
    if(gameStat=="over") return
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
    player.update();
};

animate();

// responsivness
window.addEventListener( 'resize', onWindowResize, false )
function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize( window.innerWidth, window.innerHeight )
}


// controls
window.addEventListener('keydown', (e) =>{
    if(gameStat!= "started") return
    if (e.key == 'ArrowLeft'){
        player.run()
    }
})

window.addEventListener('keyup', (e) =>{
    if (e.key == 'ArrowLeft'){
        player.stop()
    }
})

