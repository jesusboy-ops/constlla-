import * as THREE from 'three';

const PHYSICS_CONFIG = {
  G: 0.035,
  EPSILON: 1.5,
  R_MAX: 80.0,
  K_REPULSION: 8.0,
  D_MIN: 12.0,
  K_SPRING: 0.025,
  GAMMA: 0.7,           // reduced damping for faster motion
  FIXED_DT: 1 / 60,
  MAX_SPEED: 6.0,       // allow faster velocity
  ENERGY_ALPHA: 0.35,
};

class PhysicsBody {
  constructor(initialPosition = [0, 0, 0], mass = 1.0) {
    this.position = new THREE.Vector3(...initialPosition);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.acceleration = new THREE.Vector3(0, 0, 0);
    this.mass = mass;
    this.anchor = new THREE.Vector3(...initialPosition);
    this.id = Math.random().toString(36).substr(2, 9);
    this._tempVector1 = new THREE.Vector3();
  }

  setAnchor(x, y, z) {
    this.anchor.set(x, y, z);
  }

  injectEnergy(magnitude = PHYSICS_CONFIG.ENERGY_ALPHA) {
    const randomDir = this._tempVector1.set(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2
    ).normalize();
    this.velocity.add(randomDir.multiplyScalar(magnitude));
  }

  update(totalForce, dt) {
    this.acceleration.copy(totalForce).divideScalar(this.mass);
    this.velocity.add(this._tempVector1.copy(this.acceleration).multiplyScalar(dt));

    if (this.velocity.length() > PHYSICS_CONFIG.MAX_SPEED) {
      this.velocity.normalize().multiplyScalar(PHYSICS_CONFIG.MAX_SPEED);
    }

    this.position.add(this._tempVector1.copy(this.velocity).multiplyScalar(dt));
  }
}

class PhysicsEngine {
  constructor() {
    this.bodies = new Map();
    this.accumulator = 0;
    this._tempForce = new THREE.Vector3();
    this._tempDirection = new THREE.Vector3();
    this._tempDistance = new THREE.Vector3();
  }

  addBody(id, position, mass = 1.0) {
    const body = new PhysicsBody(position, mass);
    body.id = id;
    this.bodies.set(id, body);
    return body;
  }

  removeBody(id) {
    this.bodies.delete(id);
  }

  getBody(id) {
    return this.bodies.get(id);
  }

  injectEnergy(id, magnitude) {
    const body = this.bodies.get(id);
    if (body) body.injectEnergy(magnitude);
  }

  calculateGravitationalForce(a, b, targetForce) {
    this._tempDistance.subVectors(b.position, a.position);
    const dist = this._tempDistance.length();
    if (dist > PHYSICS_CONFIG.R_MAX) return targetForce.set(0, 0, 0);

    const soft = Math.sqrt(dist * dist + PHYSICS_CONFIG.EPSILON ** 2);
    const mag = PHYSICS_CONFIG.G * a.mass * b.mass / (soft ** 3);
    targetForce.copy(this._tempDistance).normalize().multiplyScalar(mag);
    return targetForce;
  }

  calculateRepulsionForce(a, b, targetForce) {
    this._tempDistance.subVectors(a.position, b.position);
    const dist = this._tempDistance.length();
    if (dist < PHYSICS_CONFIG.D_MIN && dist > 0) {
      const mag = PHYSICS_CONFIG.K_REPULSION * (1 - dist / PHYSICS_CONFIG.D_MIN);
      targetForce.copy(this._tempDistance).normalize().multiplyScalar(mag);
    } else targetForce.set(0, 0, 0);
    return targetForce;
  }

  calculateAnchorForce(body, targetForce) {
    targetForce.subVectors(body.anchor, body.position).multiplyScalar(PHYSICS_CONFIG.K_SPRING);
    return targetForce;
  }

  calculateDampingForce(body, targetForce) {
    targetForce.copy(body.velocity).multiplyScalar(-PHYSICS_CONFIG.GAMMA);
    return targetForce;
  }

  calculateTotalForce(body) {
    this._tempForce.set(0, 0, 0);
    const totalForce = new THREE.Vector3();
    const tempForce = new THREE.Vector3();

    for (const [id, other] of this.bodies) {
      if (id !== body.id) {
        this.calculateGravitationalForce(body, other, tempForce);
        totalForce.add(tempForce);
        this.calculateRepulsionForce(body, other, tempForce);
        totalForce.add(tempForce);
      }
    }

    this.calculateAnchorForce(body, tempForce); totalForce.add(tempForce);
    this.calculateDampingForce(body, tempForce); totalForce.add(tempForce);

    return totalForce;
  }

  update(deltaTime) {
    this.accumulator += Math.min(deltaTime, 0.05);
    while (this.accumulator >= PHYSICS_CONFIG.FIXED_DT) {
      const forces = new Map();
      for (const [id, body] of this.bodies) forces.set(id, this.calculateTotalForce(body));
      for (const [id, body] of this.bodies) body.update(forces.get(id), PHYSICS_CONFIG.FIXED_DT);
      this.accumulator -= PHYSICS_CONFIG.FIXED_DT;
    }
  }

  getBodyPositions() {
    const positions = new Map();
    for (const [id, body] of this.bodies) positions.set(id, body.position.toArray());
    return positions;
  }

  getStats() {
    let totalKinetic = 0, totalPotential = 0;
    for (const body of this.bodies.values()) {
      totalKinetic += 0.5 * body.mass * body.velocity.lengthSq();
      totalPotential += 0.5 * PHYSICS_CONFIG.K_SPRING * body.position.distanceTo(body.anchor) ** 2;
    }
    return { bodyCount: this.bodies.size, totalKineticEnergy: totalKinetic, totalPotentialEnergy: totalPotential };
  }
}

export { PhysicsEngine, PHYSICS_CONFIG, PhysicsBody };
