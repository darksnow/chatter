<script>
  import { createEventDispatcher } from 'svelte';
  import { slide } from 'svelte/transition';
  export let message;
  const dispatch = createEventDispatcher();

  let date = '';

  function afterTransition() {
    dispatch('added');
  }
  function resend() {
    if (message.status == 2) {
      dispatch('resend', message)
    }
  }
  $: {
    let dte = new Date(message.time)
    date = dte.toLocaleString('default', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }) + ' ' + dte.toLocaleTimeString()
  }
</script>

<style>
  article {
    border-radius: 2.5rem;
    margin-bottom: var(--ui-spacing);
  }
  article.incoming {
    margin-right: 3rem;
    border-bottom-right-radius: 0;
  }
  article.outgoing {
    margin-left: 3rem;
    border-bottom-left-radius: 0;
  }
  article.failed {
    cursor: pointer;
  }
  time {
    border-top: 1px dotted var(--ui-border);
    text-align: right;
    display: block;
  }
  .meta {
    border-bottom: 1px dotted var(--ui-border);
  }
  .meta span {
    font-weight: bold;
  }
  .message {
    margin: var(--ui-spacing);
    font-size: 1.2rem;
  }
</style>

<article transition:slide class="panel {message.from ? 'incoming' : 'outgoing'}"
  on:introend={afterTransition}
  on:click={resend}
  class:pending={message.status == 1}
  class:failed={message.status == 2}
>
  {#if message.from}<div class="meta"><span>From</span> {message.from}</div>{/if}
  {#if message.to}<div class="meta"><span>To</span> {message.to}</div>{/if}
  <div class="message">
    { message.body }
  </div>
  <time datetime="{message.time}">{date}</time>
  {#if message.status}
  <footer>
  {#if message.status == 1}Sending&hellip;{/if}
  {#if message.status == 2}Send failed. Click to retry.{/if}
  </footer>
  {/if}
</article>
