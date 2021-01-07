<script>
	export let segment;
	import { loggedIn, logOut } from 'services/user.js';
	import { addNotification, notificationType } from 'services/ui.js';

  async function handleLogout(event) {
		const answer = await logOut();
    addNotification('You have logged out. Data remains in local database.', notificationType.WARNING);
	}
</script>

<style>
	nav {
		border-bottom: 1px solid var(--ui-border);
		box-shadow: var(--ui-shadow);
		background: white;
		font-weight: 300;
		padding: 0 1em;
		display: flex;
		flex-direction: row;
	}

	ul {
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: row;
	}
	ul:last-child {
		text-align: right;
		flex-grow: 1;
		justify-content: flex-end;
	}

  li {
		display: inline-block;
		margin: 0;
		padding: 0 1rem;
	}

	.selected {
		position: relative;
		display: inline-block;
	}

	.selected::after {
		position: absolute;
		content: '';
		width: calc(100% - 1em);
		height: 2px;
		background-color: rgb(255,62,0);
		display: block;
		bottom: -1px;
	}

	a {
		text-decoration: none;
		padding: 1em 0.5em;
		display: block;
	}
	a:hover {
		border: none;
	}
</style>

<nav>
	<ul>
		<li><a class:selected='{segment === undefined}' href='.'>Home</a></li>
	</ul>
	<ul>
		{#if $loggedIn}
			<li><a class:selected='{segment === "user"}' href='user'>Profile</a></li>
			<li><a href='/' on:click|preventDefault="{handleLogout}">Logout</a></li>
		{:else}
			<li><a class:selected='{segment === "user/signup"}' href='user/signup'>Signup</a></li>
			<li><a class:selected='{segment === "user/login"}' href='user/login'>Login</a></li>
		{/if}
	</ul>
</nav>
