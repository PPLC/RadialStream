Radial Stream
Minimalistic Node.js based website to enable interactive light control in streams based on the soundworks framework.

Features
This application is divided in 3 main parts.

1. Player
A player can connect via browser and can be seated in the audience or at home/whereever. The PlayerView consists of a video (except when he is in the audience), an optional description, and a mandatory input field.
The input field is a 2D slider where the player can set a point that correlates with his mood, watching the stream/performance. Everytime the player clicks into the input field, the information is updated and sent to the Controller.

2. Controller
The controller is a backend instance that has control over the lighting situation during the performance. He can set the streaming url, the description, the timeout between player inputs, etc.
The controller reveives the information about player votes as Midi signal that can be routed to MadMapper, VDMX, Resolume, etc.

3. Server
The server is based on Node.js. Here, the configs like authentification, port, SSL etc can be set.

Development Notes

How to handle updating the dependencies and the package.json and package-lock.json files


npm ci SHOULD to be used in CI and dev environment to get a reliable build instead of npm install or npm i.

npm install or short npm i is to be used whenever we add a new dependency or update an old one (npm ci will automatically you notify if the lock file is out of sync)

Updating: Whenever we update/add a package: Change package.json, run npm i and commit newly built package-lock.json and package.json as their OWN two-file commit


Setup (Development)

Preparation

Download & install Node.js
Clone this directory into location dir

Enter dir

To install the required Node.js packages, open a console and run npm ci



Execution

To start the Node server run npm run watch. This recompiles all .js files while working, so you don't have to restart the Node.js server everytime something changed. Just reload the site
Standard for PlayerView is 127.0.0.1:8000
Standard for ControllerView is 127.0.0.1:8000/controller


Setup (Production)

Preparation

Run the steps 1-4 from the development installation above
Make sure npm run transpile and npm run minify were executed
Follow the execution steps below


