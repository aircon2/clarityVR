ClarityVR/                  <-- repo root
│
├── unity-client/               <-- Unity project
│   ├── Assets/                 <-- all scenes, scripts, prefabs, audio
│   │   ├── Scenes/
│   │   │   └── MainScene.unity
│   │   ├── Scripts/            <-- mic input, backend API calls, UI
│   │   ├── Prefabs/            <-- avatar, UI prefabs
│   │   ├── Audio/              <-- placeholder or TTS audio
│   │   └── Materials/          <-- textures, colors, etc.
│   ├── ProjectSettings/
│   └── Packages/
│
├── backend/                    <-- Node backend
│   ├── app.js / app.py         <-- main server code
│   ├── routes/                 <-- endpoint handlers
│   ├── utils/                  <-- STT, LLM, TTS helpers
│   ├── package.json / requirements.txt
│   └── static/audio/           <-- generated audio files for Unity
│
├── README.md                   <-- setup instructions for hackathon
└── .gitignore                  <-- Unity + Node ignore rules

