<script>
	import { goto } from '$app/navigation';
	import { authService } from '$lib/auth';
	import { dataStore } from '$lib/data';
	import { browser } from '$app/environment';

	let email = '';
	let password = '';
	let error = '';
	let loading = false;
	let validationErrors = {};
	let submitted = false;

	function validateForm() {
		validationErrors = {};
		
		if (!email.trim()) {
			validationErrors.email = 'Email is required';
		} else if (!/\S+@\S+\.\S+/.test(email)) {
			validationErrors.email = 'Please enter a valid email address';
		}
		
		if (!password.trim()) {
			validationErrors.password = 'Password is required';
		} else if (password.length < 6) {
			validationErrors.password = 'Password must be at least 6 characters';
		}
		
		return Object.keys(validationErrors).length === 0;
	}

	async function handleLogin() {
		submitted = true;
		
		if (!validateForm()) {
			return;
		}
		
		console.log('Login function called');
		console.log('Email:', email);
		console.log('Password:', password);
		
		loading = true;
		error = '';

		try {
			const user = dataStore.authenticateUser(email, password);
			console.log('User found:', user);
			
			if (user) {
				console.log('Logging in user...');
				authService.login({
					id: user.id,
					name: user.name,
					email: user.email,
					role: user.role
				});
				
				if (browser) {
					console.log('Redirecting to dashboard...');
					// Add small delay to ensure state is saved
					await new Promise(resolve => setTimeout(resolve, 100));
					goto('/dashboard');
				}
			} else {
				error = 'Invalid email or password';
				console.log('Authentication failed');
			}
		} catch (err) {
			console.error('Login error:', err);
			error = 'Login failed. Please try again.';
		} finally {
			loading = false;
		}
	}

	function testLogin() {
		console.log('Test login clicked');
		email = 'admin@shop.com';
		password = 'password123';
		handleLogin();
	}
</script>

<svelte:head>
	<title>Login - E-commerce Dashboard</title>
</svelte:head>

<div class="flex items-center justify-center min-h-screen bg-gray-50">
	<div class="card" style="width: 400px;">
		<div class="card-header">
			<h1 class="text-2xl text-center">Login</h1>
			<p class="text-center text-secondary mt-2">Sign in to your dashboard</p>
		</div>
		<div class="card-body">
			<div class="form-group">
				<label for="email" class="form-label">Email</label>
				<input
					type="email"
					id="email"
					class="form-input"
					class:error={submitted && validationErrors.email}
					bind:value={email}
					required
					placeholder="Enter your email"
				/>
				{#if submitted && validationErrors.email}
					<div class="text-error text-sm mt-1">{validationErrors.email}</div>
				{/if}
			</div>
			<div class="form-group">
				<label for="password" class="form-label">Password</label>
				<input
					type="password"
					id="password"
					class="form-input"
					class:error={submitted && validationErrors.password}
					bind:value={password}
					required
					placeholder="Enter your password"
				/>
				{#if submitted && validationErrors.password}
					<div class="text-error text-sm mt-1">{validationErrors.password}</div>
				{/if}
			</div>
			{#if error}
				<div class="text-error text-sm mb-4">{error}</div>
			{/if}
			<button
				type="button"
				class="btn btn-primary w-full"
				disabled={loading}
				on:click={handleLogin}
			>
				{loading ? 'Signing in...' : 'Sign In'}
			</button>
			<button
				type="button"
				class="btn btn-secondary w-full mt-2"
				on:click={testLogin}
			>
				Test Login (Auto-fill)
			</button>
		</div>
		<div class="card-footer">
			<p class="text-sm text-center text-secondary">
				Demo credentials: admin@shop.com / password123
			</p>
		</div>
	</div>
</div>