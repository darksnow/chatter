<script>
  import { onMount } from 'svelte';
	import { docStore, search } from 'services/user.js';
	import { addNotification } from 'services/ui.js';
	import AutoComplete from 'simple-svelte-autocomplete';
	import Messages from 'components/Messages.svelte';
	import { makeRequest } from 'lib/superlogin-client/index.js';

  let messageBody, messageTo;
  let disabled = false;
	let messages = docStore('messages', {list: []});
  let container;

  function setScroll() {
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  };

	onMount(async () => {
    await messages.load();
	})

  /**
	 * Get list of users that match the search string from the API.
	 *
	 * TODO: Debounch this.
	 */
  async function loadUsers(keyword) {
		if (keyword.length > 2) {
			const names = await search(keyword);
			return names || [];
		}
  	return [];
	}

	/**
	 * Send the message to the API.
	 */
	async function sendMessage(message) {
		makeRequest('/message', 'POST', message)
		.then((ans) => {
			if (ans.status == 201) {
				delete message.status;
				$messages = $messages;
			} else {
				throw new Error();
			}
		})
		.catch((err) => {
			message.status = 2 // failed
			$messages = $messages;
		})
		$messages.save();
	}

	function resubmit(ev) {
		ev.detail.status = 1 // pending
		sendMessage(ev.detail)
	}

  /**
	 * The send button has been pressed, create and send a message.
	 */
  async function submitMessage(ev) {
		if (messageTo) {
			disabled = true;
			const message = {
				to: messageTo,
				time: Date.now(),
				body: messageBody
			};
			sendMessage(message);
			// Add the message to our list (this will sync back to CouchDB).
			$messages.list = [...$messages.list, message];
			await messages.save();

			// Clear the UI for the next message.
			messageBody = messageTo = '';
			disabled = false;
		}
		else {
			addNotification('Please select a valid user to send the message to.');
		}
  }
</script>

<style>
  form {
		margin-top: var(--ui-spacing);
	}
  form div {
		display: flex;
		margin: 0.5rem 0 0;
	}
	.search-box {
		flex-grow: 1;
		margin: 0 0.5rem;
	}
	label {
		margin-top: 0.2rem;
	}
	button {
		margin: 0;
	}
	.layout {
		height: 100%;
		display: flex;
		flex-direction: column;
	}
	.messages {
		flex-grow: 1;
		overflow: auto;
		padding: 0 0.5rem;
  }
</style>

<svelte:head>
	<title>Chatter</title>
</svelte:head>

<div class="layout">
	<div class="messages" bind:this={container}>
	  <Messages messages={$messages.list} on:added={setScroll} on:resend={resubmit}/>
	</div>

	<form on:submit|preventDefault="{submitMessage}" class="panel">
		<textarea placeholder="Message text" rows="3" bind:value={messageBody}></textarea>
		<div>
			<label for="to">To:</label>
			<span class="search-box">
			<AutoComplete searchFunction={loadUsers} 
			  valueFieldName="_id" labelFieldName="_id" keywordsFieldName="_id"
				bind:value={messageTo} />
			</span>
			<button type="submit">Send</button>
		</div>
	</form>
</div>
 