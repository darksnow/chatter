<script>
import { loggedIn } from 'services/user.js';
import Login from 'components/Login.svelte';
</script>

<svelte:head>
	<title>User Login</title>
</svelte:head>

<h1>Login</h1>
<h2>Logged {#if $loggedIn}in{:else}oot{/if}</h2>
<Login />