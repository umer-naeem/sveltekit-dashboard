<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { authService } from '$lib/auth';
	import { browser } from '$app/environment';

	onMount(() => {
		if (browser) {
			if (authService.isAuthenticated()) {
				goto('/dashboard');
			} else {
				goto('/login');
			}
		}
	});
</script>

<div class="flex items-center justify-center min-h-screen">
	<div class="text-center">
		<h1 class="text-2xl mb-4">Loading...</h1>
	</div>
</div>
