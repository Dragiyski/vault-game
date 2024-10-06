import gsap from './gsap';

export async function sleep(timeout: number) {
    return new Promise(resolve => {
        gsap.delayedCall(timeout, onWaitDone);

        function onWaitDone() {
            resolve(undefined);
        }
    });
}
