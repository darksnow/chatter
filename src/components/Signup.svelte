<script>
  import { slide } from 'svelte/transition';
  import { signUp } from 'services/user.js';
  import { addNotification, notificationType } from 'services/ui.js';


  let disabled = false;
  let errors = [];

  async function handleSignup(event) {
    disabled = true;
    errors = [];

    if (!event.target.checkValidity()) {
      addNotification('Fix errors before signing up.', notificationType.WARNING);
      return;
    }

    const data = await signUp(
      event.target.username.value,
      event.target.email.value,
      event.target.password.value,
      event.target.confirm.value,
      event.target.fullname.value
    );

    console.log(data);

    if (data.status === 400) {
      if (data.validationErrors) {
        errors = data.validationErrors;
      }
    }
    disabled = false;
  }

  /**
   * Validation rules.
   *
   * TODO: Make client side validation more complete.
   */
  function validateMessageEmail(event) {
    let targetId = event.target.id;
    if (targetId == 'confirm') {
      targetId = 'password';
    }
    if (errors[targetId]) {
      delete errors[targetId];
      errors = errors;
    }
    let control = event.target;
    control.setCustomValidity('');

    switch (control.id) {
      case 'email':
        if (control.value === '') {
          control.setCustomValidity('An email address is required to sign up');
        } else if (control.validity.typeMismatch){
          control.setCustomValidity('Please enter a valid email address');
        }
        break;
    }
    return true;
  }
</script>

<form
  on:submit|preventDefault="{handleSignup}"
  on:invalid={validateMessageEmail}
  on:changed={validateMessageEmail}
  on:input={validateMessageEmail}
  class="panel"
>

  <label for="username">Username</label>
  {#if errors['username'] }
  <p transition:slide class="description error">{ errors['username'].join(', ') }.</p>
  {/if}
  <input required type="text" id="username" />
  <p class="description">Your user login and public name, visible in searches.</p>

  <label for="email">Email</label>
  {#if errors['email'] }
  <p transition:slide class="description error">{ errors['email'].join(', ') }.</p>
  {/if}
  <input required type="text" id="email" />
  <p class="description">This address will be used to verify your account and recover forgotten passwords.</p>

  <label for="fullname">Full Name</label>
  <input type="text" id="fullname" />
  <p class="description">Optionally add your full name to help people find your account.</p>

  <label for="password">Password</label>
  {#if errors['password'] }
  <p transition:slide class="description error">{ errors['password'].join(', ').replace('Password does not match confirmPassword', 'Passwords do not match') }.</p>
  {/if}
  <input required type="password" id="password" />
  <label for="confirm">Confirm Password</label>
  <input required type="password" id="confirm" />
  <p class="description">Type your password again to make sure you remember it.</p>

  <button type="submit" { disabled }>Register</button>
  <a class="button" href="user/login">Log in</a>
</form>
