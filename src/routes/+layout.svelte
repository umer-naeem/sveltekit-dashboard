<script>
	import '../app.css';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { authService } from '$lib/auth';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	let currentUser = null;

	onMount(() => {
		if (browser) {
			// Load user immediately
			currentUser = authService.getCurrentUser();
			
			// Only redirect on client side
			if (!currentUser && $page.url.pathname !== '/login') {
				goto('/login');
			}
			
			// Poll for auth changes every 50ms when on login page or dashboard
			const interval = setInterval(() => {
				const user = authService.getCurrentUser();
				if (user !== currentUser) {
					currentUser = user;
				}
			}, 50);
			
			return () => {
				clearInterval(interval);
			};
		}
	});

	function logout() {
		authService.logout();
		currentUser = null;
	}
</script>

<svelte:head>
	<title>E-commerce Dashboard</title>
	<meta name="description" content="E-commerce Dashboard Management System" />
</svelte:head>

{#if $page.url.pathname === '/login'}
	<slot />
{:else if currentUser}
	<div class="nav">
		<div class="nav-container">
			<a href="/dashboard" class="nav-brand">E-commerce Dashboard</a>
			<nav>
				<ul class="nav-links">
					<li><a href="/dashboard" class="nav-link" class:active={$page.url.pathname === '/dashboard'}>Dashboard</a></li>
					<li><a href="/users" class="nav-link" class:active={$page.url.pathname.startsWith('/users')}>Users</a></li>
					<li><a href="/products" class="nav-link" class:active={$page.url.pathname.startsWith('/products')}>Products</a></li>
					<li><a href="/orders" class="nav-link" class:active={$page.url.pathname.startsWith('/orders')}>Orders</a></li>
				</ul>
			</nav>
			<div class="flex items-center gap-4">
				<span class="text-sm text-secondary">Welcome, {currentUser.name}</span>
				<button class="btn btn-outline btn-sm" on:click={logout}>Logout</button>
			</div>
		</div>
	</div>

	<div class="dashboard-layout">
		<aside class="sidebar">
			<nav>
				<ul class="sidebar-nav">
					<li><a href="/dashboard" class:active={$page.url.pathname === '/dashboard'}>Dashboard</a></li>
					<li><a href="/users" class:active={$page.url.pathname.startsWith('/users')}>Users</a></li>
					<li><a href="/products" class:active={$page.url.pathname.startsWith('/products')}>Products</a></li>
					<li><a href="/orders" class:active={$page.url.pathname.startsWith('/orders')}>Orders</a></li>
				</ul>
			</nav>
		</aside>
		<main class="main-content">
			<slot />
		</main>
	</div>
{:else}
	<div class="flex items-center justify-center min-h-screen">
		<div class="text-center">
			<h1 class="text-2xl mb-4">Loading...</h1>
		</div>
	</div>
{/if}
