<script>
  import { fly, slide } from 'svelte/transition';
  import { notifications, rmNotification } from 'services/ui.js';
</script>

<style>
section {
  position: absolute;
  bottom: 0;
  z-index: 10;
}
article {
  margin: 0 0 0.5rem 0.5rem;
  cursor: pointer;
  border: 2px solid var(--ui-component-bg);
}
article.warning {
  border-color: var(--ui-col-warning);
}
article.error {
  border-color: var(--ui-col-error);
}
</style>

<section>
  {#each $notifications as notification}
  <article class="dark panel {notification.type}" transition:slide on:click={() => rmNotification(notification.stamp)}>
    {notification.content}
  </article>
  {/each}
</section>
