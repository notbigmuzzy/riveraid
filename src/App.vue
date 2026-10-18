<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { createGame } from "./game/createGame.js";
import {
  clearState,
  initialState,
  loadState,
  saveState,
} from "./game/state.js";
import { getPilot, pilots as pilotDefinitions } from "./game/pilots/index.js";

const gameHost = ref(null);
const gameFrame = ref(null);
const gameShell = ref(null);
const gameScale = ref(1);
const roundMenu = ref(null);
const stats = ref({ ...loadState(), score: 0, pilot: "Bob" });
const hudStyle = computed(() => getPilot(stats.value.pilot).hud ?? {});
const weaponStatus = ref({ activeShots: 0, cooldown: 0 });
const ammoLevels = computed(() => {
  const weapon = getPilot(stats.value.pilot).weapon;
  const available =
    weapon.offsets.length > 1 && weaponStatus.value.activeShots > 0
      ? 0
      : weapon.maxProjectiles - weaponStatus.value.activeShots;
  const reload = weapon.cooldown
    ? Math.max(0, 1 - weaponStatus.value.cooldown / weapon.cooldown)
    : 1;
  return Array.from({ length: weapon.maxProjectiles }, (_, index) =>
    index < available ? reload : 0,
  );
});
const screen = ref("start");
const selectedChoice = ref(0);
const confirmingRestart = ref(false);
const pilots = pilotDefinitions.map(({ name, description }) => ({
  name,
  description,
  portrait: `${import.meta.env.BASE_URL}characters/${name}.png`,
}));
const offeredPilots = ref([pilots[0]]);
let game;
let layoutObserver;

function updateWeaponStatus(status) {
  weaponStatus.value = status;
}

function fitGameShell() {
  const frame = gameFrame.value;
  const shell = gameShell.value;
  if (!frame || !shell || !shell.offsetWidth || !shell.offsetHeight) return;
  gameScale.value = Math.min(
    1,
    frame.clientWidth / shell.offsetWidth,
    frame.clientHeight / shell.offsetHeight,
  );
}

function focusChoice(index) {
  selectedChoice.value = index;
  nextTick(() =>
    roundMenu.value?.querySelectorAll(".pilot-choice")[index]?.focus(),
  );
}

function navigateMenu(event) {
  const key = event.key.toLowerCase();
  if (key === "enter" || key === " ") {
    event.preventDefault();
    event.stopPropagation();
    if (
      !event.repeat &&
      selectedChoice.value >= 0 &&
      (key === "enter" || screen.value !== "end")
    )
      startRound();
    return;
  }
  const previous = ["arrowleft", "arrowup", "a", "w", "j", "i"].includes(key);
  const next = ["arrowright", "arrowdown", "d", "s", "l", "k"].includes(key);
  if (!previous && !next) return;
  event.preventDefault();
  if (event.repeat) return;
  const count = offeredPilots.value.length;
  focusChoice(
    selectedChoice.value < 0
      ? next
        ? 0
        : count - 1
      : (selectedChoice.value + (next ? 1 : -1) + count) % count,
  );
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
  selectedChoice.value = -1;
  nextTick(() => roundMenu.value?.focus({ preventScroll: true }));
}

function restartGame() {
  clearState();
  weaponStatus.value = { activeShots: 0, cooldown: 0 };
  stats.value = initialState();
  offeredPilots.value = [pilots[0]];
  confirmingRestart.value = false;
  screen.value = "start";
  focusChoice(0);
}

function startRound(
  reset = false,
  pilot = offeredPilots.value[selectedChoice.value]?.name ?? "Bob",
) {
  if (screen.value === "playing") return;
  weaponStatus.value = { activeShots: 0, cooldown: 0 };
  confirmingRestart.value = false;
  const state = {
    ...initialState(),
    pilot: reset ? "Bob" : pilot,
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
    game.events.on("weapon-status", updateWeaponStatus);
  }
}

onMounted(() => {
  layoutObserver = new ResizeObserver(fitGameShell);
  layoutObserver.observe(gameFrame.value);
  layoutObserver.observe(gameShell.value);
  fitGameShell();
  focusChoice(0);
});

onBeforeUnmount(() => {
  layoutObserver?.disconnect();
  game?.events.off("weapon-status", updateWeaponStatus);
  game?.events.off("round-ended", endRound);
  game?.destroy(true);
});
</script>

<template>
  <main
    class="game-page"
    :class="{ 'game-page-night': stats.pilot === 'Rosanna' }"
  >
    <div ref="gameFrame" class="game-frame">
      <section
        ref="gameShell"
        class="game-shell"
        :style="{ '--game-scale': gameScale }"
        aria-label="River Rogue"
      >
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
            tabindex="-1"
            @keydown="navigateMenu"
          >
            <span
              v-for="cloud in 5"
              :key="cloud"
              class="menu-cloud"
              aria-hidden="true"
            ></span>
            <header class="round-heading">
              <template v-if="screen === 'start'">
                <h1 id="round-title">River Rogue</h1>
                <p class="round-subtitle nes-text is-warning">Legacy Raid</p>
              </template>
              <template v-else>
                <p class="round-kicker nes-text is-error">Flight ended</p>
                <h1 id="round-title">Choose your next pilot</h1>
              </template>
            </header>
            <div class="pilot-chooser">
              <div
                class="pilot-list"
                :class="{ 'pilot-list-single': screen === 'start' }"
              >
                <button
                  v-for="(pilot, index) in offeredPilots"
                  :key="pilot.name"
                  type="button"
                  class="nes-btn pilot-choice"
                  :class="{
                    'pilot-choice-selected':
                      screen === 'end' && selectedChoice === index,
                    'is-warning': screen === 'end' && selectedChoice === index,
                  }"
                  @focus="selectedChoice = index"
                  @click="startRound(false, pilot.name)"
                >
                  <img :src="pilot.portrait" alt="" />
                  <b>{{ pilot.name }}</b>
                  <span class="pilot-description">{{ pilot.description }}</span>
                  <span v-if="screen === 'start'" class="pilot-action"
                    >Start Flight</span
                  >
                </button>
              </div>
              <p v-if="screen === 'end'" class="round-title">-- or --</p>
              <div v-if="screen === 'end'" class="round-actions" @keydown.stop>
                <div
                  class="restart-confirmation"
                  :class="{ 'restart-action-hidden': !confirmingRestart }"
                  role="alert"
                >
                  <p>This will erase all progress. Are you sure?</p>
                  <div class="restart-confirmation-actions">
                    <button
                      type="button"
                      class="nes-btn is-error restart-game"
                      @click="restartGame"
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      class="nes-btn restart-game"
                      @click="confirmingRestart = false"
                    >
                      No
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  class="nes-btn is-error restart-game"
                  :class="{ 'restart-action-hidden': confirmingRestart }"
                  tabindex="-1"
                  @click="confirmingRestart = true"
                >
                  Restart Game
                </button>
              </div>
            </div>
          </section>
        </div>
        <dl class="game-stats" :style="hudStyle" aria-label="Game statistics">
          <div>
            <dt>Bridge</dt>
            <dd>{{ stats.bridge }}</dd>
          </div>
          <div>
            <dt>Score</dt>
            <dd>{{ stats.score }}</dd>
          </div>
          <div class="fuel-stat">
            <dt>
              <label for="fuel">Fuel</label>
              <span
                class="ammo-indicator"
                role="img"
                :aria-label="`${ammoLevels.filter((level) => level === 1).length} of ${ammoLevels.length} projectiles ready`"
              >
                <span
                  v-for="(level, index) in ammoLevels"
                  :key="index"
                  class="ammo-round"
                  :style="{ '--ammo-fill': `${level * 100}%` }"
                  aria-hidden="true"
                ></span>
              </span>
            </dt>
            <dd>
              <progress
                id="fuel"
                class="nes-progress"
                :class="
                  stats.fuel <= 25
                    ? 'is-error'
                    : stats.fuel <= 50
                      ? 'is-warning'
                      : 'is-success'
                "
                :value="stats.fuel"
                max="125"
              >
                {{ stats.fuel }}
              </progress>
            </dd>
          </div>
          <div class="pilot-stat">
            <dt>Pilot</dt>
            <dd>{{ stats.pilot }}</dd>
          </div>
          <div class="run-stat">
            <dt>Run</dt>
            <dd>{{ stats.run }}</dd>
          </div>
        </dl>
      </section>
    </div>
  </main>
</template>
