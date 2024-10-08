# Vault Game

A mini game where you can try to open a vault. The combination for the vault is in the developer console.

## Installation

To install from source, using this git repository, execute:

```
npm install
num run build
```

The generated directory can be served as static directory on web server. The simplest way is:

```
npm install -g http-server
http-server dist
```

Alternatively, the directory can be a document root of a web server or virtual host of a web server. When served under `https` additional features might become available. Those features include:

* A service worker: load all files in advance and do not contact the HTTP server again. Also allow application to run offline after the first load.
* Manifest: Allow application to be install as a progressive web app (PWA) and run in fullscreen as native app on Android devices.

An example of HTTPS deployed application can be found here: https://dragiyski.github.io/vault/

### Development

To start the application in a development environment execute

```
npm install
npm run dev
```

## Testing

To run the automated test for this application, execute (after installing the dependencies as shown above):

```
npm test
```

Testing will start a browser to run the browser/integration tests. Testing will also produce coverage report at `coverage/index.html`.

## Code description

The game code is located in `src/app`. It has 3 main components: model, view, and controller.

### The View

The view controls everything displayed on the screen:

* It reacts to browser events only to properly display the visible elements of the game when the screen size/orientation change;
* It provides animations to move the handle by one step, open and close the door, and rotate the handle wildly;
* It does not store and provide any information about the game state;
* It is not authoritative, i.e. it cannot control the game or command the game to change its rules, it is only concerned with what it should be on the screen.
* Any changes to the game presentation, new animations, and other visual and audio output should be affect mostly the view.

### The Model

The model control the game according to the game rules. It monitors the user progress so far and detects errors in the combination for opening the safe, or it detects if the correct combination matches the combination the user input so far.

* It is authoritative component. Changes to this will change the game rules and how the controller and the view should react.
* It is an event emitter reporting with events when the user makes an error.
* It is passive, it never reacts on its own or by a browser event, all events are fired in response to methods that change the game state.
* Any changes to the game rules should affect only the model.

### The controller

The controller is the glue of the above two elements.

* It uses the browser, and the view to detect user input;
* It reacts to user input and the model by calling appropriate methods in the model and the view according to the business logic.
* It provides set of methods that can be directly mapped onto user input.
* Any changes to the user input methods (like adding joystick support), should affect mostly the controller.

# How to play

Opening a vault is difficult and precise work. To start opeining the vault:

1. Open the developer console to start hacking;
2. Wait for the handle to stop moving completely;
3. Read the combination from the developer console;

Once this is done, rotate the handle:

* Counter-clockwise:
  * By clicking on the left side of the handle/door;
  * Or by swiping left;
* Clockwise:
  * By clicking on the right side of the handle/door;
  * Or by swiping right;

If you mistake, the handle will rotate wildly and the vault combination will be changed. You must start from the beginning.
If you successfully followed the combination, the vault will open and reveal what is inside. Take a moment to enjoy and start again.

Note: Hacking a vault is difficult and precise work. Be patient and wait for the valve to completely stop moving. A hasty input won't be accepted.
