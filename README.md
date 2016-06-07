#LiveLab

LiveLab is a proposal for an open source, browser-based toolkit for networked performance. The virtual collaboration space uses a peer-to-peer mesh network to share video, audio, and data streams between individuals and venues. LiveLab is based on WebRTC, and thus can be used by anyone with a web browser. The [initial prototype](https://ojack.github.io/LiveLab/public/) also allows participants to route any data stream broadcast over OSC (such as Kinect skeleton or sensor data) to remote collaborators.

Currently being developed as part of [Interactivos?'16 Possible Worlds. Creative and Collaborative Uses of Digital Technologies at MediaLab-Prado](http://comunidad.medialab-prado.es/en/groups/livelab)
#####To run:
1. Clone git repository
2. cd into folder and run <code>npm install</code>
3. "npm run start"
4. go to "https://localhost:8000" in browser
5. Get and send messages using OSC client/server implementation of your choice

#####To develop:
1. Clone git repository
2. cd into folder and run <code>npm install</code>
3. install <code>npm install -g watchify</code>
4. "npm run watch" (make sure the dev dependencies listed in package.json are installed).

###Developed by:
Jesse Ricke ([CultureHub](http://www.culturehub.org/))

Olivia Jack

#####MediaLab-Prado Collaborators:
Alexander Cobleigh ([@cblgh](https://www.twitter.com/cblgh))

