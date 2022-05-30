// make sure to run this beforehand:
// $ npm ci

const 
    log = console.log,
    err = console.error;

// returns a promise that resolves/rejects after random ms
function randomWait(shouldReject = false): Promise<number> {
    return new Promise<number>((resolve, reject) => {
        const duration: number = Math.floor(Math.random() * 1000);
        log(`waiting for ${duration} ms...`);
        const timeout = setTimeout(() => {
            clearTimeout(timeout);
            log(`${duration} ms passed, ${shouldReject ? 'rejecting' : 'resolving'}`);
            shouldReject ? reject(duration) : resolve(duration);    
        }, duration);
    });
}

function randomWaitResolve() {
    return randomWait();
}

function randomWaitReject() {
    return randomWait(true);
}

// eval is evil, don't use it, here it is done so only for demo purposes
export function ex() {
    try {
        const fn = `ex${process.env.N}()`;
        log(`---------------------------------`);
        log(`Calling ${fn} ...`);
        eval(fn);
    } catch (e) {
        err(e);
    }
}

// used to store promise result, declared here only to decrease code pollution
let dur: number;

// used to store sync state for deasync, declared here only to decrease code pollution
let sync: boolean = true;

// ============== EXAMPLES ============== 

// to run an example function from commandline, lets say ex2(), then:
// $ N=2 npm run ex

// simply waiting for a resolving promise with legacy then
function ex1() {
    randomWaitResolve()
        .then(num => log(`resolved: ${num}`));    
}

// simply waiting for a rejecting promise with legacy then
function ex2() {
    randomWaitReject()
        .then(
            num => log('You should not see this'),
            num => err(`rejected: ${num}`)
        );    
}

// simply waiting for a rejecting promise with legacy catch
function ex3() {
    randomWaitReject()
        .catch(num => err(`rejected: ${num}`));    
}

// simply waiting for a resolving promise with await
async function ex4() {
    dur = await randomWaitResolve();
    log(`resolved: ${dur}`);
}

// simply waiting for a rejecting promise with await in try/catch
async function ex5() {
    try {
        dur = await randomWaitReject();
        log(`you should not see this`);
    } catch (e) {
        err(`rejected: ${e}`);
    }
}

// waiting for a resolving promise in a non-async function with anonymus function
function ex6() {
    (async () => {
        dur = await randomWaitResolve();
        log(`resolved: ${dur}`);
    })();
}

// waiting for a resolving promise in a non-async function with deasync
// (see: https://www.npmjs.com/package/deasync)
function ex7() {    
    (async () => {
        dur = await randomWaitResolve();
        sync = false;
    })();
    while (sync) {
        require('deasync').sleep(100);
    }
    log(`resolved: ${dur}`);
}

// waiting for a rejecting promise in a non-async function with deasync
function ex8() {
    (async () => {
        try {
            dur = await randomWaitReject();
            log(`you should not see this`);
        } catch (e) {
            err(`rejected: ${e}`);
            sync = false;
        }
    })();
    while (sync) {
        require('deasync').sleep(100);
    }
    log(`end`);
}

// waiting for more promises in a sequential manner with cycled await
async function ex9() {
    for (let i = 0; i < 5; i++) {
        try {
            dur = await randomWaitResolve();
            log(`resolved: ${dur}`);
        } catch (e) {
            log(`you should not see this`);
        }
    }
    log(`end`);
}

// same without async using deasync
function ex10() {
    (async () => {
        for (let i = 0; i < 5; i++) {
            try {
                dur = await randomWaitResolve();
                log(`resolved: ${dur}`);
            } catch (e) {
                log(`you should not see this`);
            }
        }
        sync = false;
    })();
    while (sync) {
        require('deasync').sleep(100);
    }
    log(`end`);
}

// waiting for more promises in a parallel manner with Promise.all
async function ex11() {
    const promises = [randomWaitResolve(), randomWaitResolve(), randomWaitResolve(), randomWaitResolve(), randomWaitResolve()];
    const durations = await Promise.all(promises);
    log(`durations:`, durations);
    log(`end`);
}

// waiting for more promises in a parallel manner with Promise.all 
async function ex12() {
    const promises = [randomWaitResolve(), randomWaitResolve(), randomWaitReject(), randomWaitResolve(), randomWaitResolve()];
    try {
        const durations = await Promise.all(promises);
    } catch (e) {
        log(`rejected duration:`, e);
    }    
    log(`end`);
}

// waiting for more promises in a parallel manner with Promise.race 
async function ex13() {
    const promises = [randomWaitResolve(), randomWaitResolve(), randomWaitReject(), randomWaitResolve(), randomWaitResolve()];
    try {
        const durations = await Promise.race(promises);
        log(`durations:`, durations);
    } catch (e) {
        log(`rejected duration:`, e);
    }    
    log(`end`);
}
