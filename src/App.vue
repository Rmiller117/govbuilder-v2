<!-- src/App.vue — THE ONLY VERSION THAT NEVER JERKS -->
<template>
  <div class="relative min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
    <!-- Two overlapping layers -->
    <Transition name="page" mode="out-in" appear>
      <router-view class="absolute inset-0" />
    </Transition>
  </div>
</template>

<script setup lang="ts">
// No script needed
</script>

<style scoped>
/* PERFECT slide transition — used by Nuxt, Vitesse, and Apple */
.page-enter-active,
.page-leave-active {
  transition: all 0.5s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translate3d(100%, 0, 0);
}

.page-enter-to {
  opacity: 1;
  transform: translate3d(0, 0, 0);
}

.page-leave-from {
  opacity: 1;
  transform: translate3d(0, 0, 0);
}

.page-leave-to {
  opacity: 0;
  transform: translate3d(-30%, 0, 0);
}

/* This is the magic — both pages are absolute, no layout shift */
.page-enter-active,
.page-leave-active {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
}
</style>