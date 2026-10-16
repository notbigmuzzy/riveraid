<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import { createGame } from "./game/createGame.js";
import { loadState, saveState } from "./game/state.js";

const gameHost = ref(null);
const stats = ref(loadState());
let game;

onMounted(() => {
  game = createGame(gameHost.value, stats.value, (state) => {
    stats.value = state;
    saveState(state);
  });
});

onBeforeUnmount(() => game?.destroy(true));
</script>

<template>
  <main class="game-page">
    <section class="game-shell" aria-label="River Rogue">
      <div
        ref="gameHost"
        class="game-viewport"
        role="img"
        aria-label="River Rogue game field"
      ></div>
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
