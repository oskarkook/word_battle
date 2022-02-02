<script lang="ts">
  export let shake: boolean;
</script>

<div class:animate-shake={shake} class="flex grow w-full h-full">
  <slot/>
</div>