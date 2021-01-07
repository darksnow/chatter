<!--script context="module">
	import { protectPage, loginRoute } from "services/user.js";

  export async function preload(page, session) {
		console.log('Preload ' + page.path);

    if (protectPage(page, false)) {
			return this.redirect(302, loginRoute);
		}
	}
</script-->

<script>
  import { onMount, onDestroy } from 'svelte';
  import { goto, stores } from '@sapper/app';
  import { protectPage } from "services/user.js";

  import Nav from 'components/Nav.svelte';
	import Notifications from 'components/Notifications.svelte';

	export let segment;

	const { preloading, page } = stores();
	var pageSubscription = null;

  onMount(() => {
		pageSubscription = page.subscribe(page => protectPage(page));
	});

	onDestroy(() => {
    if (pageSubscription) pageSubscription();
	})
</script>

<style>
	main {
		position: relative;
		width: 56em;
		max-width: 100%;
		padding: 2em;
		margin: 0 auto;
		box-sizing: border-box;
	}
</style>

<Nav {segment}/>
<Notifications />

<main>
	<slot></slot>
</main>