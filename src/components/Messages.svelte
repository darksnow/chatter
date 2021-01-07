<script>
  import Message from 'components/Message.svelte';
  export let messages = [];
</script>

<section>
  {#each messages as message}
  <Message message={message} on:added on:resend/>
  {/each}
</section>
