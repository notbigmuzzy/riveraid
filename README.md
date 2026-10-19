# 𐘿 river rogue 𐘿

A browser-based tribute to River Raid with a little rogue-lite spin, rebuilt with Vue, Phaser and Vite using plain JavaScript. Fly through a procedurally generated river, destroy targets and bridges, and keep your fuel tank from running dry.

River Raid was created by [Carol Shaw](https://en.wikipedia.org/wiki/Carol_Shaw) and first released in 1982. Here is a [short documentary about the game](https://www.youtube.com/watch?v=1OcT5zJzVV0). It was also the first video game I ever played, on a C64C my parents bought in 1989. Also it kinda kicked-off my interest in computer stuff.

<img width="1277" height="923" alt="image" src="https://github.com/user-attachments/assets/d36e95fd-3f16-4d06-a0f8-21e5952f8a41" />

## Demo

[Play River Rogue](https://notbigmuzzy.github.io/riveraid/)

## Gameplay

Start your first flight as Bob. After a crash, choose one of three randomly offered pilots to continue your campaign. Bridge progress carries over between flights; score and fuel reset for each flight.

Refuel at fuel stations, avoid the banks and incoming fire, and shoot targets to work toward the next bridge. Each pilot changes how you fly or fight.

Progress is saved in your browser's local storage. **Restart Game** asks for confirmation, clears the saved progress and returns to the start screen.

### Controls

| Action                     | Keys                              |
| -------------------------- | --------------------------------- |
| Move left / right          | Left / Right arrows, A / D, J / L |
| Accelerate / brake         | Up / Down arrows, W / S, I / K    |
| Fire                       | Space, once per press             |
| Select a pilot in the menu | Arrow keys, WASD or IJKL          |
| Confirm a pilot            | Enter or click the pilot          |

### Pilots

| Pilot   | Specialty                                                                                                      |
| ------- | -------------------------------------------------------------------------------------------------------------- |
| Bob     | The standard aircraft and weapon.                                                                              |
| Vinston | Three-shot volleys with a reload delay, increased fuel use and a grayscale view.                               |
| Jack    | One side of the view is obscured; piercing shots can destroy multiple targets, and targets award extra points. |
| Rosanna | Night Raid: a dark river, faster flight and a fixed flight speed.                                              |
| Alexei  | An inverted view with reduced fuel consumption.                                                                |
| Ada     | A heavy shell that creates a randomly shaped, four-cell blast on impact or at its range limit.                 |
| Vera    | No fuel stations: destroyed targets drop collectible fuel packs.                                               |

## Built With

- Vue 3 for menus and the HUD.
- Phaser 4 with Canvas rendering for gameplay and audio.
- Vite 8 for development and production builds.
- NES.css and Press Start 2P for the interface.
- PNG gameplay graphics and the original OGG sound assets.

## Credits

- [Sound pack: LittleRobotSoundFactory / freesound.org](https://freesound.org/people/LittleRobotSoundFactory/packs/16681/)
- [Main music theme: Fesliyan Studios](https://www.fesliyanstudios.com/)
- [NES.css](https://github.com/nostalgic-css/NES.css)

## License

[MIT](LICENSE)

Third-party graphics, sound effects and music remain subject to their respective licenses and usage terms.
