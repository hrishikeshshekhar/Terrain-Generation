// An attempt at terrain generation
const width = window.innerWidth;
const height = window.innerHeight;
const ratio = width / height;
const view_ang = 45;
const near = 0.1;
const far = 1000;
let rotation_const = 0.01;
const zoom_lev = 30;
const init_max = 5;
const viewX = 0 * zoom_lev;
const viewY = 5 * zoom_lev;
const viewZ = 5 * zoom_lev;
const roughness = 0.5;
const detail = 7;
const length = Math.pow(2, detail) + 1;
const max = length - 1;
const segment = 10;
let length_temp = max;

// Storing all the vertices into an array
let vertices = new Array();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(view_ang, ratio, near, far);
camera.position.set(viewX, viewY, viewZ);
camera.lookAt(0, 0, 0);

// Creating and setting renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);

// Adding the onclick functionality
const container = document.getElementById("main");
container.appendChild(renderer.domElement);
document.body.onclick = function(){
    divide(length_temp);
    length_temp /= 2;
}

// Adding lights
const light = new THREE.DirectionalLight(0xFFFFFF, 1);
light.position.set(viewX, viewY, viewZ);
scene.add(light);

// Creating the plane
const plane_geo = new THREE.PlaneGeometry(max + 2, max + 2, max + 2, max + 2);
const material = new THREE.MeshPhongMaterial({
    color : 0x2CFF34,
    wireframe : true
});
const plane = new THREE.Mesh(plane_geo, material);
scene.add(plane);

// Creating a ground to percive the land
const dist = max * 1.5;
const ground_geo = new THREE.PlaneGeometry(dist, dist, dist, dist);
ground_geo.translate(0, 0, 0);
ground_geo.rotateX(-Math.PI / 2);
const ground_mat = new THREE.MeshLambertMaterial({
    color : 0x654321
})
const ground = new THREE.Mesh(ground_geo, ground_mat);
scene.add(ground);

// Adding user controls
const controls = new THREE.OrbitControls( camera, renderer.domElement);

function init(){
    // Creating the array
    for(let i = 0; i < length; ++i){
        let row = new Array();
        for(let j = 0; j < length; ++j){
            row.push(0);
        }
        vertices.push(row);
    }

    // Setting the corner 4 vertices with some random value
    vertices[0][0] = Math.random() * init_max;
    vertices[0][max] = Math.random() * init_max;
    vertices[max][0] = Math.random() * init_max;
    vertices[max][max] = Math.random() * init_max;

    // Rotating the plane to face us
    plane.rotation.x -= Math.PI / 2;

    // Setting the plane to update vertices
    plane_geo.verticesNeedUpdate = true;

    // Calling divide
    divide(length_temp);
    length_temp /= 2;
}

// Starting the square and diamond process
function divide(size){
    const half = Math.floor(size / 2); 
    if(half < 1){
        return;
    }

    // Doing the square iteration
    for(let y = half; y <= max; y += size){
        for(let x = half; x <= max; x += size){
            const scale = roughness * size;
            const offset = Math.random() * scale - (scale / 2);
            square(x, y, half, offset);
        }
    }

    // Doing the diamond iterations
    for(let y = 0; y <= max; y += half){
        let x = 0;
        if(y % size == 0){
            x = half;
        }
        for(; x <= max; x += size){
            const scale = roughness * size;
            const offset = Math.random() * scale - (scale / 2);
            diamond(x, y, half, offset);
        }   
    }

    // Setting the vertices of the plane to these vertices
    for(let y = 0; y < length; ++y){
        for(let x = 0; x < length; ++x){
            plane_geo.vertices[(y + 1) * (length + 2) + (x + 1)].z = vertices[y][x];
        }
    }

    // Forcing the plane to update the vertives dynamically
    plane_geo.verticesNeedUpdate = true;
}

// Function to check valid position
function isValid(x, y){
    return (x >= 0 && x <= max && y >= 0 && y <= max);
}

// Function to decide height for squares
function square(x, y, size, offset){
    let sum = 0;
    let count = 0;
    if(isValid(y + size, x + size)){
        sum += vertices[y + size][x + size];
        ++count;
    }
    if(isValid(y - size, x + size)){
        sum += vertices[y - size][x + size];
        ++count;
    }
    if(isValid(y + size, x - size)){
        sum += vertices[y + size][x - size];
        ++count;
    }
    if(isValid(y - size, x - size)){
        sum += vertices[y - size][x - size];
        ++count;
    }
    if(count != 0){
        // Setting the position as the average of the 4 positions plus the offset
        const new_height = (sum / count) + offset;
        vertices[y][x] = new_height; 
    }
    else{
        vertices[y][x] = offset;
    }
}

// Function to decide heights of diamond squares
function diamond(x, y, size, offset){
    let sum = 0;
    let count = 0;
    console.log(size);
    if(isValid(y, x + size)){
        sum += vertices[y][x + size];
        ++count;
    }
    if(isValid(y - size, x)){
        sum += vertices[y - size][x];
        ++count;
    }
    if(isValid(y, x - size)){
        sum += vertices[y][x - size];
        ++count;
    }
    if(isValid(y + size, x)){
        sum += vertices[y + size][x];
        ++count;
    }
    if(count != 0){
        // Setting the position as the average of the 4 positions plus the offset
        const new_height = (sum / count) + offset;
        vertices[y][x] = new_height; 
    }
    else{
        vertices[y][x] = offset;
    }
}

// Calling the init function
init();

// Drawing the axes

// X - Axis : Purple
const line_geo1 = new THREE.Geometry();
const line_mat1 = new THREE.LineBasicMaterial({
    color : 0xFF00FF
});
line_geo1.vertices.push(new THREE.Vector3(-100, 0, 0));
line_geo1.vertices.push(new THREE.Vector3(100, 0, 0));
const line1 = new THREE.Line(line_geo1, line_mat1);
scene.add(line1);

// Y - Axis : Yellow
const line_geo2 = new THREE.Geometry();
const line_mat2 = new THREE.LineBasicMaterial({
    color : 0xFFFF00
});
line_geo2.vertices.push(new THREE.Vector3(0, -100, 0));
line_geo2.vertices.push(new THREE.Vector3(0, 100, 0));
const line2 = new THREE.Line(line_geo2, line_mat2);
scene.add(line2);

// Z - Axis : Cyan
const line_geo3 = new THREE.Geometry();
const line_mat3 = new THREE.LineBasicMaterial({
    color : 0x00FFFF
});
line_geo3.vertices.push(new THREE.Vector3(0, 0, -100));
line_geo3.vertices.push(new THREE.Vector3(0, 0, 100));
const line3 = new THREE.Line(line_geo3, line_mat3);
scene.add(line3);

// Adding fog
scene.fog = new THREE.Fog(0xCC2F4F, near, far);

// Function to animate
function animate(){
    requestAnimationFrame(animate); 
    renderer.render(scene, camera);

    // Rotating the plane
    //plane.rotation.x += rotation_const;
    // plane.rotation.y += rotation_const * 2;
    // plane.rotation.z += rotation_const * 4;
}

animate();


