<script>
  import { goto } from '@sapper/app';
  import { logIn } from 'services/user.js';
  import { addNotification, notificationType } from 'services/ui.js';

  let emailError = false;
  let authMessage = '';
  let disabled = false;
  let messageClass = '';
  let password = '';
  let username = 'martin@darksnow.net';

  async function handleLogin(event) {
    disabled = true;
    console.log(event);
    const answer = await logIn(event.target.user.value, event.target.password.value);
    password = '';
    disabled = false;
  }

  /**
   * Validation rules.
   *
   * CouchDB doesn't allow a colon in a username.
   */
  function validateMessageEmail(event) {
    let textbox = event.target;
    emailError = false;
    if (textbox.value === '') {
      textbox.setCustomValidity('An email address is required to sign up');
      emailError = true;
    } else if (textbox.validity.typeMismatch){
      textbox.setCustomValidity('Please enter a valid email address');
      emailError = true;
    } else {
      textbox.setCustomValidity('');
    }
    return true;
  }
  
  /**
   * Surpress propagation of events to extensions etc.
   */
  function supressEnterPropagation(ev) {
    if (ev.key === 'Enter') {
      ev.stopPropagation();
    }
  }
</script>
  <button on:click={() => addNotification('Test')}>Open message</button>

<form
  on:submit|preventDefault="{handleLogin}"
  on:invalid={validateMessageEmail}
  on:changed={validateMessageEmail}
  on:input={validateMessageEmail}
  on:keydown={supressEnterPropagation}
  class="panel"
>
  <label for="user">Username</label>
  <input required type="text" bind:value={username} id="user" />

  <label for="password">Password</label>
  <input required type="password" id="password" bind:value={password}/>
  
  <button type="submit" { disabled }>Login</button>
  <a class="button" href="/user/signup">Create account</a>
</form>
