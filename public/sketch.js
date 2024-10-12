// p5 sketch configuration constants
const PARTICLE_COUNT = 200; // quantity of particles we want to add
const MAX_SPEED = 5; // max particle speed
const ENABLE_BLUR = true;
const BLUR_INTENSITY = 20;

// global state variables for p5 sketch
let moveTowardsMouse = false;
const particles = [];

// automagically called
function mousePressed() {
  moveTowardsMouse = true;
}

// automagically called
function mouseReleased() {
  moveTowardsMouse = false;
}


// runs once
function setup() {
  // p5 app setup
  createCanvas(500, 400);

  // generate particles with random positions
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    // generate random position
    const newPos = createVector(random(), random());
    newPos.x *= width;
    newPos.y *= height;

    // create new particle instance
    const newParticle = new Particle(newPos);

    // add instance to global `particles` array
    particles.push(newParticle);
  }
}


// runs every frame (respecting frameRate)
// TODO: refactor to make it shorter and more readable
function draw() {
  // add background (clear canvas) in the beginning of each frame
  // NOTE: adjust transparency to get traces from movement
  background(255, 255, 255, 20);

  // have all particles jump towards mouse
  if (moveTowardsMouse) {
    const mouse = createVector(mouseX, mouseY);

    // for each particle
    for (const p of particles) {
      p.jumpTowards(mouse);
    }
  }
  
  // update and draw all particles
  for (const p of particles) {
    //p.addForce(createVector(0.02, 0)); // add wind
    p.update();

    // repel this particle from all particles
    // NOTE: refactor into p.update function
    for (const pp of particles) {
      p.repel(pp);
    }

    // draw this particle on canvas
    p.draw();
  }

  // add blur filter if configured
  if (ENABLE_BLUR) {
    filter(BLUR, BLUR_INTENSITY);
  }
}


/**
 * Particle class
 * TODO: seperate into own file
 */

class Particle {
  constructor(position, color = '#33c') {
    this.position = position;
    this.color = color;
    this.acceleration = createVector(0, 0);
    this.velocity = p5.Vector.random2D().mult(2);
    this.radius = 18;
  }

  repel(other) {
    const v = p5.Vector.sub(this.position, other.position);
    const vlen = v.mag();

    // // balls bouncing
    //if (v.mag() < this.radius) {
    //  v.normalize();
    //  v.mult(power);
    //  this.addForce(v);
    //}

    // balls repelling softly in 2 times the particle's radius
    if (vlen < this.radius *2) {
      const x = map(vlen, 0, this.radius*2, this.radius*2, 0)
      v.normalize();
      v.mult(x*0.015); // very soft
      this.addForce(v);
    }
  }

  jumpTowards(target, power = 1) {
    // create new vector pointing from particle to target
    const force = p5.Vector.sub(target, this.position);

    // set length of new vector to 1
    force.normalize();

    // set a contant length on the force vector
    // NOTE: determines how hard particles are pushed towards target
    force.mult(power);

    // add new vector to particle acceleration
    this.addForce(force);
  }

  addForce(force) {
    this.acceleration.add(force);
  }

  // runs every frame
  walls() {
    if (this.position.x < 0) {
      this.velocity.x *= -1;
      this.position.x = 1;
    } else if (this.position.x > width) {
      this.velocity.x *= -1;
      this.position.x = width - 1;
    }

    if (this.position.y < 0) {
      this.velocity.y *= -1;
      this.position.y = 1;
    } else if (this.position.y > height) {
      this.velocity.y *= -1;
      this.position.y = height - 1;
    }
  }

  // runs every frame
  update() {
    this.velocity.add(this.acceleration);
    this.acceleration = createVector(0, 0);
    this.velocity.limit(MAX_SPEED);
    this.position.add(this.velocity);
    this.walls();
  }

  // runs every frame
  draw() {
    fill(this.color);
    noStroke()
    circle(this.position.x, this.position.y, this.radius);
  }
}
