import { EventEmitter } from 'pixi.js';

enum VaultWheelDirection {
    Clockwise = 'clockwise',
    CounterClockwise = 'counterclockwise'
};

interface VaultRotationStep {
    direction: VaultWheelDirection,
    count: number
}

export function generateState(): Array<VaultRotationStep> {
    const result = new Array(3);
    // Only the first direction is chosen at random.
    // All subsequent directions are opposite of the last direction;
    let lastDirection = Math.random() < 0.5 ? VaultWheelDirection.Clockwise : VaultWheelDirection.CounterClockwise;
    for (let i = 0; i < 3; ++i) {
        const count = Math.floor(Math.random() * 9) + 1;
        result[i] = { direction: lastDirection, count };
        lastDirection = lastDirection === VaultWheelDirection.Clockwise ? VaultWheelDirection.CounterClockwise : VaultWheelDirection.Clockwise;
    }
    return result;
}

function fireNextTick(target: EventEmitter, event: string, ...args: any[]) {
    (async () => {})().then(() => {
        console.log(event);
        target.emit(event, ...args);
    });
}

export default class VaultGameModel extends EventEmitter {
    target: Array<VaultRotationStep> | null = null;
    currentIndex: number = 0;
    currentCount: number = 0;
    lastDirection: VaultWheelDirection | null = null;

    resetState() {
        this.target = generateState();
        this.currentIndex = 0;
        this.currentCount = 0;
        this.lastDirection = null;
        fireNextTick(this, 'vault.reset');
        return this;
    }

    move(direction: VaultWheelDirection) {
        if (this.target == null) {
            // If not initialized - do nothing;
            return this;
        }
        if (this.lastDirection == null) {
            // If the first move is in the wrong direction, reset immediately.
            if (direction !== this.target[0].direction) {
                fireNextTick(this, 'vault.error');
                return this;
            }
            this.lastDirection = direction;
        }
        if (this.lastDirection !== direction) {
            if (this.currentCount < this.target[this.currentIndex].count) {
                fireNextTick(this, 'vault.error');
                return this;
            }
            ++this.currentIndex;
            this.currentCount = 1;
            this.lastDirection = direction;
            if (this.currentIndex >= this.target.length) {
                fireNextTick(this, 'vault.error');
                return this;
            }
        } else {
            ++this.currentCount;
            if (this.currentCount > this.target[this.currentIndex].count) {
                fireNextTick(this, 'vault.error');
                return this;
            }
        }
        if (this.currentIndex >= this.target.length - 1 && this.currentCount == this.target[this.currentIndex].count) {
            fireNextTick(this, 'valut.unlock');
            // Do nothing until the state is reset;
            this.target = null;
            return this;
        }
        return this;
    }

    printTarget() {
        if (this.target == null) {
            console.log('No target');
        } else {
            console.log(this.target.map(step => `${step.count} ${step.direction}`).join(', '));
        }
    }
}
