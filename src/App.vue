<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { createGame } from "./game/createGame.js";
import { initialState, loadState, saveState } from "./game/state.js";

const gameHost = ref(null);
const roundMenu = ref(null);
const stats = ref({ ...loadState(), score: 0, pilot: "Bob" });
const screen = ref("start");
const selectedChoice = ref(0);
const pilots = [
  ["Bob", "New guy"],
  ["Vinston", "Shotgun FTW"],
  ["Betty", "Blind as a bat"],
  ["Jack", "One eyed"],
  ["Rosanna", "Night raid"],
  ["Alexei", "Contrarian"],
].map(([name, description]) => ({
  name,
  description,
  portrait: new URL(
    `../old_game/graphics/characters/${name}.svg`,
    import.meta.url,
  ).href,
}));
const offeredPilots = ref([pilots[0]]);
let game;

function focusChoice(index) {
  selectedChoice.value = index;
  nextTick(() => roundMenu.value?.querySelectorAll("button")[index]?.focus());
}

function navigateMenu(event) {
  const key = event.key.toLowerCase();
  if (key === "enter" || key === " ") {
    event.preventDefault();
    event.stopPropagation();
    if (!event.repeat)
      startRound(
        screen.value === "end" &&
          selectedChoice.value === offeredPilots.value.length,
      );
    return;
  }
  const previous = ["arrowleft", "arrowup", "a", "w", "j", "i"].includes(key);
  const next = ["arrowright", "arrowdown", "d", "s", "l", "k"].includes(key);
  if (!previous && !next) return;
  event.preventDefault();
  const count = offeredPilots.value.length + (screen.value === "end" ? 1 : 0);
  focusChoice((selectedChoice.value + (next ? 1 : -1) + count) % count);
}

function updateStats(state) {
  const previousState = stats.value;
  stats.value = state;
  if (
    ["bridge", "score", "pilot", "run"].some(
      (field) => state[field] !== previousState[field],
    )
  ) {
    saveState(state);
  }
}

function endRound(state) {
  stats.value = state;
  const choices = [...pilots];
  for (let index = choices.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [choices[index], choices[other]] = [choices[other], choices[index]];
  }
  offeredPilots.value = choices.slice(0, 3);
  screen.value = "end";
  focusChoice(1);
}

function startRound(reset = false) {
  if (screen.value === "playing") return;
  const state = {
    ...initialState(),
    bridge: reset ? 0 : stats.value.bridge,
    run: reset ? 1 : stats.value.run + (screen.value === "end" ? 1 : 0),
  };
  stats.value = state;
  saveState(state);
  screen.value = "playing";
  if (game) {
    game.scene.getScene("river").scene.restart({ state });
  } else {
    game = createGame(gameHost.value, state, updateStats);
    game.events.on("round-ended", endRound);
  }
}

onMounted(() => focusChoice(0));

onBeforeUnmount(() => {
  game?.events.off("round-ended", endRound);
  game?.destroy(true);
});
</script>

<template>
  <main class="game-page">
    <section class="game-shell" aria-label="River Rogue">
      <div
        class="game-stage"
        :class="{ 'game-stage-menu': screen !== 'playing' }"
      >
        <div
          ref="gameHost"
          class="game-viewport"
          role="img"
          aria-label="River Rogue game field"
          :aria-hidden="screen !== 'playing'"
        ></div>
        <section
          v-if="screen !== 'playing'"
          ref="roundMenu"
          class="round-screen"
          :class="
            screen === 'start' ? 'round-screen-start' : 'round-screen-end'
          "
          role="dialog"
          aria-modal="true"
          aria-labelledby="round-title"
          @keydown="navigateMenu"
        >
          <h1 v-if="screen === 'start'" id="round-title">
            River Rogue<br />Legacy Raid
          </h1>
          <h1 v-else id="round-title">Choose your new pilot</h1>
          <div class="pilot-chooser">
            <div
              class="pilot-list"
              :class="{ 'pilot-list-single': screen === 'start' }"
            >
              <button
                v-for="(pilot, index) in offeredPilots"
                :key="pilot.name"
                type="button"
                class="pilot-choice"
                :class="{ 'pilot-choice-selected': selectedChoice === index }"
                @focus="selectedChoice = index"
                @click="startRound()"
              >
                <img :src="pilot.portrait" alt="" />
                <b>{{ pilot.name }}</b>
                <i>({{ pilot.description }})</i>
              </button>
            </div>
            <template v-if="screen === 'end'">
              <span class="pilot-alternative">OR</span>
              <button
                type="button"
                class="restart-game"
                :class="{
                  'pilot-choice-selected':
                    selectedChoice === offeredPilots.length,
                }"
                @focus="selectedChoice = offeredPilots.length"
                @click="startRound(true)"
              >
                Restart Game
              </button>
            </template>
          </div>
        </section>
      </div>
      <dl class="game-stats" aria-label="Game statistics">
        <div>
          <dt>Bridge</dt>
          <dd>{{ stats.bridge }}</dd>
        </div>
        <div>
          <dt>Score</dt>
          <dd>{{ stats.score }}</dd>
        </div>
        <div class="fuel-stat">
          <dt><label for="fuel">Fuel</label></dt>
          <dd>
            <progress id="fuel" :value="stats.fuel" max="125">
              {{ stats.fuel }}
            </progress>
          </dd>
        </div>
        <div>
          <dt>Pilot</dt>
          <dd>{{ stats.pilot }}</dd>
        </div>
        <div>
          <dt>Run</dt>
          <dd>{{ stats.run }}</dd>
        </div>
      </dl>
    </section>
  </main>
</template>
