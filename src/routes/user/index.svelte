<script>
  import { onMount, onDestroy } from 'svelte';
  import { writable } from 'svelte/store';
  import { docStore } from 'services/user.js';
  import { changePassword } from 'lib/superlogin-client/index.js';

  let disabled = false;

  let profile = docStore('profile', {
    username: '',
    email: '',
    name: '',
  });

  let formFields = {
    pass: null,
    newPass: null,
    confirm: null
  }

	onMount(async () => {
    await profile.load();
	})

  async function updateRecord() {
    await profile.save();
  }

  /**
   * Validation rules.
   *
   * Make sure passwords match
   */
  function validatePasswords(event) {
    formFields.pass.setCustomValidity(formFields.pass.value === '' ? 'Current password is required' : '')
    formFields.newPass.setCustomValidity('')
    formFields.confirm.setCustomValidity('')
    if (formFields.newPass.value === '') {
      formFields.newPass.setCustomValidity('New password is required')
    }
    else if (formFields.newPass.value == formFields.pass.value) {
      formFields.newPass.setCustomValidity('New password is the same as old password')
    }
    else if (formFields.newPass.value != formFields.confirm.value) {
      formFields.confirm.setCustomValidity('New passwords do not match')
    }
    return true
  }

  /**
	 * Call the authentication API to change the password.
	 */
	function handlePassword(ev) {
    changePassword(formFields.pass.value, formFields.newPass.value)
	}

</script>

<svelte:head>
	<title>User profile</title>
</svelte:head>

<h1>User Profile</h1>

<div class="panel">
<form>

  <label for="email" id="email-label">Email Address</label>
  <input required type="email" value={$profile.email} id="email" aria-labelledby="email-label" />

  <label for="display-name" id="dispname-label">Display Name</label>
	<input id="display-name" aria-labelledby="dispname-label" on:blur={updateRecord} bind:value={$profile.name}/>

</form>

<form
  on:submit|preventDefault="{handlePassword}"
	on:invalid={validatePasswords}
  on:changed={validatePasswords}
  on:input={validatePasswords}
>
  <fieldset id="password-set" aria-labelledby="passset-label" aria-describedby="passset-desc">
    <legend id="passset-label">Change your password</legend>
    <p id="passset-desc">Your password can only be changed when we are online.</p>

  <label id="pass-label" for="password">Current Password</label>
    <input required type="password" id="password" aria-labelledby="pass-label" bind:this={formFields.pass} />

    <label id="newpass-label" for="new-password">New Password</label>
    <input required type="password" id="new-password" aria-labelledby="newpass-label" bind:this={formFields.newPass} />

    <label id="repeat-label" for="repeat-password">Repeat New Password</label>
    <input required type="password" id="repeat-password" aria-labelledby="repeat-label" aria-describedby="repeat-desc" bind:this={formFields.confirm} />
    <p id="repeat-desc" class="description">We ask you to repeat your password to help prevent typing mistakes.</p>
    
    <button type="submit" { disabled }>Change Password</button>
  </fieldset>
</form>
</div>