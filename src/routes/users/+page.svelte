<script>
	import { onMount } from 'svelte';
	import { dataStore } from '$lib/data';

	let users = [];
	let filteredUsers = [];
	let searchTerm = '';
	let showModal = false;
	let showDeleteModal = false;
	let deletingUser = null;
	let editingUser = null;
	let formData = {
		name: '',
		email: '',
		role: 'customer'
	};
	let error = '';
	let loading = false;
	let validationErrors = {};
	let formSubmitted = false;

	onMount(() => {
		loadUsers();
	});

	function loadUsers() {
		users = dataStore.getUsers();
		filteredUsers = [...users]; // Create a new array to trigger reactivity
	}

	function filterUsers() {
		if (!searchTerm.trim()) {
			filteredUsers = users.map(u => u); // Create a new array to trigger reactivity
			return;
		}
		
		const term = searchTerm.toLowerCase();
		// Create a new array with filter to trigger reactivity
		filteredUsers = users.filter(user => 
			user.name.toLowerCase().includes(term) ||
			user.email.toLowerCase().includes(term) ||
			user.role.toLowerCase().includes(term)
		);
	}

	function validateForm() {
		validationErrors = {};
		
		if (!formData.name.trim()) {
			validationErrors.name = 'Name is required';
		}
		
		if (!formData.email.trim()) {
			validationErrors.email = 'Email is required';
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			validationErrors.email = 'Please enter a valid email address';
		}
		
		return Object.keys(validationErrors).length === 0;
	}

	function openCreateModal() {
		editingUser = null;
		formData = {
			name: '',
			email: '',
			role: 'customer'
		};
		error = '';
		validationErrors = {};
		formSubmitted = false;
		showModal = true;
	}

	function openEditModal(user) {
		editingUser = user;
		formData = {
			name: user.name,
			email: user.email,
			role: user.role
		};
		error = '';
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editingUser = null;
		formData = {
			name: '',
			email: '',
			role: 'customer'
		};
		error = '';
	}

	async function handleSubmit(event) {
		event.preventDefault();
		formSubmitted = true;
		
		if (!validateForm()) {
			return;
		}
		
		loading = true;
		error = '';

		try {
			if (editingUser) {
				// Update existing user
				const updatedUser = dataStore.updateUser(editingUser.id, formData);
				if (updatedUser) {
					users = dataStore.getUsers();
					filteredUsers = [...users];
					closeModal();
				} else {
					error = 'Failed to update user';
				}
			} else {
				// Create new user
				const newUser = dataStore.createUser(formData);
				if (newUser) {
					users = dataStore.getUsers();
					filteredUsers = [...users];
					closeModal();
				} else {
					error = 'Failed to create user';
				}
			}
		} catch (err) {
			console.error('Error creating/updating user:', err);
			error = 'An error occurred. Please try again.';
		} finally {
			loading = false;
		}
	}

	function deleteUser(user) {
		deletingUser = user;
		showDeleteModal = true;
	}

	function confirmDelete() {
		if (deletingUser) {
			const success = dataStore.deleteUser(deletingUser.id);
			if (success) {
				users = dataStore.getUsers();
				filteredUsers = [...users];
				showDeleteModal = false;
				deletingUser = null;
			} else {
				error = 'Failed to delete user';
			}
		}
	}

	function cancelDelete() {
		showDeleteModal = false;
		deletingUser = null;
	}

	function getRoleBadgeClass(role) {
		switch (role) {
			case 'admin': return 'badge-error';
			case 'employee': return 'badge-warning';
			case 'customer': return 'badge-success';
			default: return 'badge-info';
		}
	}

	// Reactive filtering - runs automatically when searchTerm or users change
	$: searchTerm, filterUsers();
</script>

<svelte:head>
	<title>Users - E-commerce Dashboard</title>
</svelte:head>

<div class="container">
	<div class="flex justify-between items-center mb-6">
		<h1 class="text-3xl">Users Management</h1>
		<button class="btn btn-primary" on:click={openCreateModal}>
			<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" class="mr-2">
				<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
			</svg>
			Add User
		</button>
	</div>

	{#if error}
		<div class="bg-error text-white p-4 rounded-lg mb-6">
			{error}
		</div>
	{/if}

	<div class="card mb-6">
		<div class="card-body">
			<div class="flex items-center gap-4">
				<div class="flex-1">
					<input
						type="text"
						class="form-input"
						placeholder="Search users by name, email, or role..."
						bind:value={searchTerm}
					/>
				</div>
				<div class="text-sm text-secondary">
					{filteredUsers.length} of {users.length} users
				</div>
			</div>
		</div>
	</div>

	<div class="card">
		<div class="card-header">
			<h3>Users ({filteredUsers.length})</h3>
		</div>
		<div class="card-body p-0">
			{#if filteredUsers.length === 0}
				<div class="text-center py-8">
					<p class="text-secondary">No users found</p>
				</div>
			{:else}
				<div class="overflow-x-auto">
					<table class="table">
						<thead>
							<tr>
								<th>Name</th>
								<th>Email</th>
								<th>Role</th>
								<th>Created</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each filteredUsers as user (user.id)}
								<tr>
									<td>
										<div class="font-medium">{user.name}</div>
									</td>
									<td>{user.email}</td>
									<td>
										<span class="badge {getRoleBadgeClass(user.role)}">
											{user.role}
										</span>
									</td>
									<td>
										<div class="text-sm text-secondary">
											{new Date(user.createdAt).toLocaleDateString()}
										</div>
									</td>
									<td>
										<div class="flex gap-2">
											<button
												class="btn btn-outline btn-sm"
												on:click={() => openEditModal(user)}
											>
												Edit
											</button>
											<button
												class="btn btn-error btn-sm"
												on:click={() => deleteUser(user)}
											>
												Delete
											</button>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- Modal -->
{#if showModal}
	<div class="modal-overlay" on:click={closeModal}>
		<div class="modal" on:click={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h3>{editingUser ? 'Edit User' : 'Create User'}</h3>
				<button class="btn btn-outline btn-sm" on:click={closeModal}>
					<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
						<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
					</svg>
				</button>
			</div>
			<form on:submit={handleSubmit}>
				<div class="modal-body">
					<div class="form-group">
						<label for="name" class="form-label">Name</label>
						<input
							type="text"
							id="name"
							class="form-input"
							class:error={formSubmitted && validationErrors.name}
							bind:value={formData.name}
							required
							placeholder="Enter user name"
						/>
						{#if formSubmitted && validationErrors.name}
							<div class="text-error text-sm mt-1">{validationErrors.name}</div>
						{/if}
					</div>
					<div class="form-group">
						<label for="email" class="form-label">Email</label>
						<input
							type="email"
							id="email"
							class="form-input"
							class:error={formSubmitted && validationErrors.email}
							bind:value={formData.email}
							required
							placeholder="Enter user email"
						/>
						{#if formSubmitted && validationErrors.email}
							<div class="text-error text-sm mt-1">{validationErrors.email}</div>
						{/if}
					</div>
					<div class="form-group">
						<label for="role" class="form-label">Role</label>
						<select
							id="role"
							class="form-input form-select"
							bind:value={formData.role}
							required
						>
							<option value="customer">Customer</option>
							<option value="employee">Employee</option>
							<option value="admin">Admin</option>
						</select>
					</div>
					{#if error}
						<div class="text-error text-sm mt-4">{error}</div>
					{/if}
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-outline" on:click={closeModal}>
						Cancel
					</button>
					<button
						type="submit"
						class="btn btn-primary"
						disabled={loading}
					>
						{loading ? 'Saving...' : (editingUser ? 'Update' : 'Create')}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Delete Confirmation Modal -->
{#if showDeleteModal}
	<div class="modal-overlay" on:click={cancelDelete}>
		<div class="modal" on:click={(e) => e.stopPropagation()} style="max-width: 400px;">
			<div class="modal-header">
				<h3>Confirm Delete</h3>
				<button class="btn btn-outline btn-sm" on:click={cancelDelete}>
					<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
						<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
					</svg>
				</button>
			</div>
			<div class="modal-body">
				<p class="mb-4">Are you sure you want to delete user "{deletingUser?.name}"?</p>
				<p class="text-sm text-secondary">This action cannot be undone.</p>
			</div>
			<div class="modal-footer">
				<button type="button" class="btn btn-outline" on:click={cancelDelete}>
					Cancel
				</button>
				<button type="button" class="btn btn-error" on:click={confirmDelete}>
					Delete User
				</button>
			</div>
		</div>
	</div>
{/if}
