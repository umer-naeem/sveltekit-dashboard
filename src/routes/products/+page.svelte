<script>
	import { onMount } from 'svelte';
	import { dataStore } from '$lib/data';

	let products = [];
	let filteredProducts = [];
	let searchTerm = '';
	let showModal = false;
	let showDeleteModal = false;
	let editingProduct = null;
	let deletingProduct = null;
	let formData = {
		name: '',
		description: '',
		price: 0,
		category: '',
		stock: 0,
		imageUrl: ''
	};
	let error = '';
	let loading = false;
	let validationErrors = {};
	let formSubmitted = false;

	onMount(() => {
		loadProducts();
	});

	function loadProducts() {
		products = dataStore.getProducts();
		filteredProducts = [...products];
	}

	function filterProducts() {
		if (!searchTerm.trim()) {
			filteredProducts = products.map(p => p); // Create a new array to trigger reactivity
			return;
		}
		
		const term = searchTerm.toLowerCase();
		// Create a new array with filter to trigger reactivity
		filteredProducts = products.filter(product => 
			product.name.toLowerCase().includes(term) ||
			product.description.toLowerCase().includes(term) ||
			product.category.toLowerCase().includes(term)
		);
	}

	function validateForm() {
		validationErrors = {};
		
		if (!formData.name.trim()) {
			validationErrors.name = 'Product name is required';
		}
		
		if (!formData.description.trim()) {
			validationErrors.description = 'Description is required';
		}
		
		if (formData.price <= 0) {
			validationErrors.price = 'Price must be greater than 0';
		}
		
		if (formData.stock < 0) {
			validationErrors.stock = 'Stock cannot be negative';
		}
		
		if (!formData.category.trim()) {
			validationErrors.category = 'Category is required';
		}
		
		return Object.keys(validationErrors).length === 0;
	}

	function openCreateModal() {
		editingProduct = null;
		formData = {
			name: '',
			description: '',
			price: 0,
			category: '',
			stock: 0,
			imageUrl: ''
		};
		error = '';
		validationErrors = {};
		formSubmitted = false;
		showModal = true;
	}

	function openEditModal(product) {
		editingProduct = product;
		formData = {
			name: product.name,
			description: product.description,
			price: product.price,
			category: product.category,
			stock: product.stock,
			imageUrl: product.imageUrl || ''
		};
		error = '';
		validationErrors = {};
		formSubmitted = false;
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editingProduct = null;
		formData = {
			name: '',
			description: '',
			price: 0,
			category: '',
			stock: 0,
			imageUrl: ''
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
			if (editingProduct) {
				const updatedProduct = dataStore.updateProduct(editingProduct.id, formData);
				if (updatedProduct) {
					products = dataStore.getProducts();
					filteredProducts = [...products];
					closeModal();
				} else {
					error = 'Failed to update product';
				}
			} else {
				const newProduct = dataStore.createProduct(formData);
				if (newProduct) {
					products = dataStore.getProducts();
					filteredProducts = [...products];
					closeModal();
				} else {
					error = 'Failed to create product';
				}
			}
		} catch (err) {
			console.error('Error creating/updating product:', err);
			error = 'An error occurred. Please try again.';
		} finally {
			loading = false;
		}
	}

	function deleteProduct(product) {
		deletingProduct = product;
		showDeleteModal = true;
	}

	function confirmDelete() {
		if (deletingProduct) {
			const success = dataStore.deleteProduct(deletingProduct.id);
			if (success) {
				products = dataStore.getProducts();
				filteredProducts = [...products];
				showDeleteModal = false;
				deletingProduct = null;
			} else {
				error = 'Failed to delete product';
			}
		}
	}

	function cancelDelete() {
		showDeleteModal = false;
		deletingProduct = null;
	}

	function getStockBadgeClass(stock) {
		if (stock === 0) return 'badge-error';
		if (stock < 10) return 'badge-warning';
		return 'badge-success';
	}

	function getStockText(stock) {
		if (stock === 0) return 'Out of Stock';
		if (stock < 10) return 'Low Stock';
		return 'In Stock';
	}

	// Reactive filtering - runs automatically when searchTerm or products change
	$: searchTerm, filterProducts();
</script>

<svelte:head>
	<title>Products - E-commerce Dashboard</title>
</svelte:head>

<div class="container">
	<div class="flex justify-between items-center mb-6">
		<h1 class="text-3xl">Products Management</h1>
		<button class="btn btn-primary" on:click={openCreateModal}>
			<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" class="mr-2">
				<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
			</svg>
			Add Product
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
						placeholder="Search products by name, description, or category..."
						bind:value={searchTerm}
					/>
				</div>
				<div class="text-sm text-secondary">
					{filteredProducts.length} of {products.length} products
				</div>
			</div>
		</div>
	</div>

	<div class="card">
		<div class="card-header">
			<h3>Products ({filteredProducts.length})</h3>
		</div>
		<div class="card-body p-0">
			{#if filteredProducts.length === 0}
				<div class="text-center py-8">
					<p class="text-secondary">No products found</p>
				</div>
			{:else}
				<div class="overflow-x-auto">
					<table class="table">
						<thead>
							<tr>
								<th>Image</th>
								<th>Product Name</th>
								<th>Category</th>
								<th>Price</th>
								<th>Stock</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each filteredProducts as product (product.id)}
								<tr>
									<td>
										{#if product.imageUrl}
											<img
												src={product.imageUrl}
												alt={product.name}
												class="w-12 h-12 object-cover rounded"
												on:error={(e) => {
													e.currentTarget.style.display = 'none';
													const placeholder = e.currentTarget.parentElement?.querySelector('.placeholder');
													if (placeholder) placeholder.style.display = 'flex';
												}}
											/>
											<div class="placeholder w-12 h-12 bg-gray-200 rounded flex items-center justify-center" style="display: none">
												<svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
													<path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z"/>
												</svg>
											</div>
										{:else}
											<div class="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
												<svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
													<path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z"/>
												</svg>
											</div>
										{/if}
									</td>
									<td>
										<div>
											<div class="font-medium">{product.name}</div>
											<div class="text-sm text-secondary truncate max-w-xs">
												{product.description}
											</div>
										</div>
									</td>
									<td>
										<span class="badge badge-info">
											{product.category}
										</span>
									</td>
									<td>
										<div class="font-medium">${product.price.toFixed(2)}</div>
									</td>
									<td>
										<div class="flex items-center gap-2">
											<span class="badge {getStockBadgeClass(product.stock)}">
												{getStockText(product.stock)}
											</span>
											<span class="text-sm text-secondary">
												({product.stock})
											</span>
										</div>
									</td>
									<td>
										<div class="flex gap-2">
											<button
												class="btn btn-outline btn-sm"
												on:click={() => openEditModal(product)}
											>
												Edit
											</button>
											<button
												class="btn btn-error btn-sm"
												on:click={() => deleteProduct(product)}
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

<!-- Create/Edit Modal -->
{#if showModal}
	<div class="modal-overlay" on:click={closeModal}>
		<div class="modal" on:click={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h3>{editingProduct ? 'Edit Product' : 'Create Product'}</h3>
				<button class="btn btn-outline btn-sm" on:click={closeModal}>
					<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
						<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
					</svg>
				</button>
			</div>
			<form on:submit={handleSubmit}>
				<div class="modal-body">
					<div class="form-group">
						<label for="name" class="form-label">Product Name</label>
						<input
							type="text"
							id="name"
							class="form-input"
							class:error={formSubmitted && validationErrors.name}
							bind:value={formData.name}
							required
							placeholder="Enter product name"
						/>
						{#if formSubmitted && validationErrors.name}
							<div class="text-error text-sm mt-1">{validationErrors.name}</div>
						{/if}
					</div>
					<div class="form-group">
						<label for="description" class="form-label">Description</label>
						<textarea
							id="description"
							class="form-input form-textarea"
							class:error={formSubmitted && validationErrors.description}
							bind:value={formData.description}
							required
							placeholder="Enter product description"
						></textarea>
						{#if formSubmitted && validationErrors.description}
							<div class="text-error text-sm mt-1">{validationErrors.description}</div>
						{/if}
					</div>
					<div class="grid grid-cols-2 gap-4">
						<div class="form-group">
							<label for="price" class="form-label">Price ($)</label>
							<input
								type="number"
								id="price"
								class="form-input"
								class:error={formSubmitted && validationErrors.price}
								bind:value={formData.price}
								min="0"
								step="0.01"
								required
								placeholder="0.00"
							/>
							{#if formSubmitted && validationErrors.price}
								<div class="text-error text-sm mt-1">{validationErrors.price}</div>
							{/if}
						</div>
						<div class="form-group">
							<label for="stock" class="form-label">Stock</label>
							<input
								type="number"
								id="stock"
								class="form-input"
								class:error={formSubmitted && validationErrors.stock}
								bind:value={formData.stock}
								min="0"
								required
								placeholder="0"
							/>
							{#if formSubmitted && validationErrors.stock}
								<div class="text-error text-sm mt-1">{validationErrors.stock}</div>
							{/if}
						</div>
					</div>
					<div class="form-group">
						<label for="category" class="form-label">Category</label>
						<input
							type="text"
							id="category"
							class="form-input"
							class:error={formSubmitted && validationErrors.category}
							bind:value={formData.category}
							required
							placeholder="Enter product category"
						/>
						{#if formSubmitted && validationErrors.category}
							<div class="text-error text-sm mt-1">{validationErrors.category}</div>
						{/if}
					</div>
					<div class="form-group">
						<label for="imageUrl" class="form-label">Image URL (optional)</label>
						<input
							type="url"
							id="imageUrl"
							class="form-input"
							bind:value={formData.imageUrl}
							placeholder="https://example.com/image.jpg"
						/>
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
						{loading ? 'Saving...' : (editingProduct ? 'Update' : 'Create')}
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
				<p class="mb-4">Are you sure you want to delete "{deletingProduct?.name}"?</p>
				<p class="text-sm text-secondary">This action cannot be undone.</p>
			</div>
			<div class="modal-footer">
				<button type="button" class="btn btn-outline" on:click={cancelDelete}>
					Cancel
				</button>
				<button type="button" class="btn btn-error" on:click={confirmDelete}>
					Delete Product
				</button>
			</div>
		</div>
	</div>
{/if}
