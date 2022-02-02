<script lang="ts">
  export let endTime: string;
  let timer: NodeJS.Timer | undefined;
  let text = "";

  function formatNumber(number: number) {
    if(number < 10) {
      return "0" + String(number);
    }
    return String(number);
  }

  function updateText(seconds: number) {
    const minutes = Math.max(0, Math.floor(seconds / 60));
    text = `${formatNumber(minutes)}:${formatNumber(seconds % 60)}`;
  }

  $: {
    clearInterval(timer);
    const endDate = new Date(endTime); 
    const diff = endDate.getTime() - (new Date().getTime());
    if(diff > 0) {
      timer = setInterval(() => {
        const diff = endDate.getTime() - (new Date().getTime());
        if(diff <= 0) {
          clearInterval(timer);
          return;
        }
        updateText(Math.floor(diff / 1000));
      }, 1000);
    }
  }
</script>

<span class="bg-gray-200 rounded px-4 py-1 transition-opacity duration-300">
  {text}
</span>