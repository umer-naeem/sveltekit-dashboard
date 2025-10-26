<script>
	import { onMount } from 'svelte';
	import { dataStore } from '$lib/data';

	let orders = [];
	let filteredOrders = [];
	let products = [];
	let searchTerm = '';
	let showModal = false;
	let showDeleteModal = false;
	let deletingOrder = null;
	let editingOrder = null;
	let selectedProducts = [];
	let selectedProduct = '';
	let productQuantity = 1;
	let formData = {
		userId: '',
		userName: '',
		userEmail: '',
		products: [],
		total: 0,
		status: 'pending',
		shippingAddress: {
			street: '',
			city: '',
			state: '',
			zipCode: '',
			country: ''
		}
	};
	let error = '';
	let loading = false;
	let validationErrors = {};
	let formSubmitted = false;

	onMount(() => {
		loadOrders();
		loadProducts();
	});

	function loadProducts() {
		products = dataStore.getProducts();
	}

	function loadOrders() {
		const loadedOrders = dataStore.getOrders();
		orders = loadedOrders; // Trigger reactivity
		filteredOrders = [...loadedOrders]; // Create a new array to trigger reactivity
		console.log('Loaded orders:', loadedOrders);
		console.log('Orders array:', orders);
	}

	function filterOrders() {
		if (!searchTerm.trim()) {
			filteredOrders = orders.map(o => o); // Create a new array to trigger reactivity
			return;
		} else {
			const term = searchTerm.toLowerCase();
			// Create a new array with filter to trigger reactivity
			filteredOrders = orders.filter(order => 
				order.userName.toLowerCase().includes(term) ||
				order.userEmail.toLowerCase().includes(term) ||
				order.id.toLowerCase().includes(term) ||
				order.status.toLowerCase().includes(term)
			);
		}
	}

	function validateForm() {
		validationErrors = {};
		
		if (!formData.userName.trim()) {
			validationErrors.userName = 'User name is required';
		}
		
		if (!formData.userEmail.trim()) {
			validationErrors.userEmail = 'User email is required';
		} else if (!/\S+@\S+\.\S+/.test(formData.userEmail)) {
			validationErrors.userEmail = 'Please enter a valid email address';
		}
		
		if (!formData.shippingAddress.street.trim()) {
			validationErrors.street = 'Street address is required';
		}
		
		if (!formData.shippingAddress.city.trim()) {
			validationErrors.city = 'City is required';
		}
		
		if (selectedProducts.length === 0) {
			validationErrors.products = 'Please select at least one product';
		}
		
		return Object.keys(validationErrors).length === 0;
	}

	function openCreateModal() {
		editingOrder = null;
		selectedProducts = [];
		formData = {
			userId: '',
			userName: '',
			userEmail: '',
			products: [],
			total: 0,
			status: 'pending',
			shippingAddress: {
				street: '',
				city: '',
				state: '',
				zipCode: '',
				country: ''
			}
		};
		error = '';
		validationErrors = {};
		formSubmitted = false;
		showModal = true;
	}

	function openEditModal(order) {
		editingOrder = order;
		selectedProducts = [...order.products]; // Load products for editing
		formData = {
			userId: order.userId,
			userName: order.userName,
			userEmail: order.userEmail,
			products: order.products,
			total: order.total,
			status: order.status,
			shippingAddress: { ...order.shippingAddress }
		};
		error = '';
		validationErrors = {};
		formSubmitted = false;
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editingOrder = null;
		selectedProducts = [];
		formData = {
			userId: '',
			userName: '',
			userEmail: '',
			products: [],
			total: 0,
			status: 'pending',
			shippingAddress: {
				street: '',
				city: '',
				state: '',
				zipCode: '',
				country: ''
			}
		};
		error = '';
	}

	async function handleSubmit(event) {
		event.preventDefault();
		formSubmitted = true;
		
		console.log('Form submitted', {
			formData,
			selectedProducts,
			validationErrors: {}
		});
		
		if (!validateForm()) {
			console.log('Validation failed', validationErrors);
			return;
		}
		
		console.log('Validation passed');
		loading = true;
		error = '';

		try {
			if (editingOrder) {
				// Update existing order
				const updatedOrder = dataStore.updateOrder(editingOrder.id, formData);
				if (updatedOrder) {
					loadOrders();
					filterOrders();
					closeModal();
				} else {
					error = 'Failed to update order';
				}
			} else {
				// Create new order
				console.log('Creating order with data:', formData);
				console.log('FormData total:', formData.total);
				console.log('FormData products:', formData.products);
				const newOrder = dataStore.createOrder(formData);
				console.log('Order created:', newOrder);
				if (newOrder) {
					console.log('Loading orders...');
					// Force reload from data store
					orders = dataStore.getOrders();
					console.log('Orders array after reload:', orders);
					console.log('Orders count after reload:', orders.length);
					filteredOrders = [...orders];
					console.log('Filtered orders count:', filteredOrders.length);
					console.log('Closing modal...');
					closeModal();
				} else {
					console.log('Failed to create order');
					error = 'Failed to create order';
				}
			}
		} catch (err) {
			console.error('Error creating/updating order:', err);
			error = 'An error occurred. Please try again.';
		} finally {
			loading = false;
		}
	}

	function deleteOrder(order) {
		deletingOrder = order;
		showDeleteModal = true;
	}

	function confirmDelete() {
		if (deletingOrder) {
			const success = dataStore.deleteOrder(deletingOrder.id);
			if (success) {
				// Force reload from data store
				orders = dataStore.getOrders();
				filteredOrders = [...orders];
				showDeleteModal = false;
				deletingOrder = null;
			} else {
				error = 'Failed to delete order';
			}
		}
	}

	function cancelDelete() {
		showDeleteModal = false;
		deletingOrder = null;
	}

	function getStatusBadgeClass(status) {
		switch (status) {
			case 'pending': return 'badge-warning';
			case 'processing': return 'badge-info';
			case 'shipped': return 'badge-success';
			case 'delivered': return 'badge-success';
			case 'cancelled': return 'badge-error';
			default: return 'badge-info';
		}
	}

	function formatAddress(address) {
		return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`;
	}

	function addProduct(product) {
		const existingProduct = selectedProducts.find(p => p.productId === product.id);
		if (existingProduct) {
			existingProduct.quantity += 1;
		} else {
			selectedProducts.push({
				productId: product.id,
				productName: product.name,
				quantity: 1,
				price: product.price
			});
		}
		updateTotal();
	}

	function addProductWithQuantity(product, quantity) {
		// Create a new array for reactivity
		const existingProduct = selectedProducts.find(p => p.productId === product.id);
		let newSelectedProducts;
		
		if (existingProduct) {
			newSelectedProducts = selectedProducts.map(p => 
				p.productId === product.id 
					? { ...p, quantity: p.quantity + quantity }
					: p
			);
		} else {
			newSelectedProducts = [...selectedProducts, {
				productId: product.id,
				productName: product.name,
				quantity: quantity,
				price: product.price
			}];
		}
		
		selectedProducts = newSelectedProducts;
		updateTotal();
	}

	function removeProduct(productId) {
		selectedProducts = selectedProducts.filter(p => p.productId !== productId);
		updateTotal();
	}

	function updateProductQuantity(productId, quantity) {
		const product = selectedProducts.find(p => p.productId === productId);
		if (product) {
			if (quantity <= 0) {
				removeProduct(productId);
			} else {
				// Create a new array for reactivity
				selectedProducts = selectedProducts.map(p => 
					p.productId === productId 
						? { ...p, quantity: quantity }
						: p
				);
				updateTotal();
			}
		}
	}

	function updateTotal() {
		formData.total = selectedProducts.reduce((sum, product) => sum + (product.price * product.quantity), 0);
		formData.products = [...selectedProducts];
	}

	// Reactive filtering - runs automatically when searchTerm or orders change
	$: searchTerm, filterOrders();
</script>

<svelte:head>
	<title>Orders - E-commerce Dashboard</title>
</svelte:head>

<div class="container">
	<div class="flex justify-between items-center mb-6">
		<h1 class="text-3xl">Orders Management</h1>
		<button class="btn btn-primary" on:click={openCreateModal}>
			<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" class="mr-2">
				<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
			</svg>
			Add Order
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
						placeholder="Search orders by customer name, email, ID, or status..."
						bind:value={searchTerm}
					/>
				</div>
				<div class="text-sm text-secondary">
					{filteredOrders.length} of {orders.length} orders
				</div>
			</div>
		</div>
	</div>

	<div class="card">
		<div class="card-header">
			<h3>Orders ({filteredOrders.length})</h3>
		</div>
		<div class="card-body p-0">
			{#if filteredOrders.length === 0}
				<div class="text-center py-8">
					<p class="text-secondary">No orders found</p>
				</div>
			{:else}
				<div class="overflow-x-auto">
					<table class="table">
						<thead>
							<tr>
								<th>Order ID</th>
								<th>Customer</th>
								<th>Products</th>
								<th>Total</th>
								<th>Status</th>
								<th>Date</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each filteredOrders as order (order.id)}
								<tr>
									<td>
										<div class="font-medium">#{order.id}</div>
									</td>
									<td>
										<div>
											<div class="font-medium">{order.userName}</div>
											<div class="text-sm text-secondary">{order.userEmail}</div>
										</div>
									</td>
									<td>
										<div class="text-sm">
											{order.products.length} item{order.products.length !== 1 ? 's' : ''}
											<div class="text-secondary">
												{order.products.slice(0, 2).map(p => p.productName).join(', ')}
												{#if order.products.length > 2}
													... and {order.products.length - 2} more
												{/if}
											</div>
										</div>
									</td>
									<td>
										<div class="font-medium">${order.total.toFixed(2)}</div>
									</td>
									<td>
										<span class="badge {getStatusBadgeClass(order.status)}">
											{order.status}
										</span>
									</td>
									<td>
										<div class="text-sm text-secondary">
											{new Date(order.createdAt).toLocaleDateString()}
										</div>
									</td>
									<td>
										<div class="flex gap-2">
											<button
												class="btn btn-outline btn-sm"
												on:click={() => openEditModal(order)}
											>
												Edit
											</button>
											<button
												class="btn btn-error btn-sm"
												on:click={() => deleteOrder(order)}
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
				<h3>{editingOrder ? 'Edit Order' : 'Create Order'}</h3>
				<button class="btn btn-outline btn-sm" on:click={closeModal}>
					<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
						<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
					</svg>
				</button>
			</div>
			<form on:submit={handleSubmit}>
				<div class="modal-body">
					<div class="form-group">
						<label for="userName" class="form-label">Customer Name</label>
						<input
							type="text"
							id="userName"
							class="form-input"
							class:error={formSubmitted && validationErrors.userName}
							bind:value={formData.userName}
							required
							placeholder="Enter customer name"
						/>
						{#if formSubmitted && validationErrors.userName}
							<div class="text-error text-sm mt-1">{validationErrors.userName}</div>
						{/if}
					</div>
					<div class="form-group">
						<label for="userEmail" class="form-label">Customer Email</label>
						<input
							type="email"
							id="userEmail"
							class="form-input"
							class:error={formSubmitted && validationErrors.userEmail}
							bind:value={formData.userEmail}
							required
							placeholder="Enter customer email"
						/>
						{#if formSubmitted && validationErrors.userEmail}
							<div class="text-error text-sm mt-1">{validationErrors.userEmail}</div>
						{/if}
					</div>
					
					<!-- Product Selection -->
					<div class="form-group">
						<label for="productSelect" class="form-label">Select Product</label>
						<div class="flex gap-2">
							<select
								id="productSelect"
								class="form-input form-select flex-1"
								bind:value={selectedProduct}
							>
								<option value="">-- Select a product --</option>
								{#each products as product}
									<option value={product.id}>{product.name} - ${product.price.toFixed(2)}</option>
								{/each}
							</select>
							<input
								type="number"
								class="form-input w-24"
								placeholder="Qty"
								bind:value={productQuantity}
								min="1"
							/>
							<button
								type="button"
								class="btn btn-primary"
								on:click={() => {
									if (selectedProduct && productQuantity > 0) {
										const product = products.find(p => p.id === selectedProduct);
										if (product) {
											addProductWithQuantity(product, productQuantity);
											selectedProduct = '';
											productQuantity = 1;
										}
									}
								}}
								disabled={!selectedProduct || productQuantity <= 0}
							>
								Add
							</button>
						</div>
					</div>
					
					<!-- Selected Products Display -->
					{#if selectedProducts.length > 0}
						<div class="border rounded-lg p-3">
							<h4 class="font-medium mb-2">Selected Products</h4>
							{#each selectedProducts as product}
								<div class="flex justify-between items-center py-2 border-b last:border-b-0">
									<div>
										<div class="font-medium">{product.productName}</div>
										<div class="text-sm text-secondary">${product.price.toFixed(2)} each</div>
									</div>
									<div class="flex items-center gap-2">
										<button
											type="button"
											class="btn btn-outline btn-sm"
											on:click={() => updateProductQuantity(product.productId, product.quantity - 1)}
										>
											-
										</button>
										<span class="w-8 text-center">{product.quantity}</span>
										<button
											type="button"
											class="btn btn-outline btn-sm"
											on:click={() => updateProductQuantity(product.productId, product.quantity + 1)}
										>
											+
										</button>
										<button
											type="button"
											class="btn btn-error btn-sm"
											on:click={() => removeProduct(product.productId)}
										>
											Remove
										</button>
									</div>
								</div>
							{/each}
							<div class="mt-3 pt-3 border-t">
								<div class="flex justify-between items-center">
									<span class="font-medium">Total:</span>
									<span class="font-bold text-lg">${formData.total.toFixed(2)}</span>
								</div>
							</div>
						</div>
					{/if}
					
					<div class="form-group">
						<label for="status" class="form-label">Order Status</label>
						<select
							id="status"
							class="form-input form-select"
							bind:value={formData.status}
							required
						>
							<option value="pending">Pending</option>
							<option value="processing">Processing</option>
							<option value="shipped">Shipped</option>
							<option value="delivered">Delivered</option>
							<option value="cancelled">Cancelled</option>
						</select>
					</div>
					<div class="form-group">
						<label class="form-label">Shipping Address</label>
						<div class="grid grid-cols-2 gap-2">
							<input
								type="text"
								class="form-input"
								class:error={formSubmitted && validationErrors.street}
								bind:value={formData.shippingAddress.street}
								placeholder="Street"
								required
							/>
							<input
								type="text"
								class="form-input"
								class:error={formSubmitted && validationErrors.city}
								bind:value={formData.shippingAddress.city}
								placeholder="City"
								required
							/>
							<input
								type="text"
								class="form-input"
								bind:value={formData.shippingAddress.state}
								placeholder="State"
								required
							/>
							<input
								type="text"
								class="form-input"
								bind:value={formData.shippingAddress.zipCode}
								placeholder="ZIP Code"
								required
							/>
						</div>
						{#if formSubmitted && (validationErrors.street || validationErrors.city)}
							<div class="text-error text-sm mt-1">
								{validationErrors.street || validationErrors.city}
							</div>
						{/if}
						<input
							type="text"
							class="form-input mt-2"
							bind:value={formData.shippingAddress.country}
							placeholder="Country"
							required
						/>
					</div>
					{#if formSubmitted && validationErrors.products}
						<div class="text-error text-sm mb-2">{validationErrors.products}</div>
					{/if}
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
						{loading ? 'Saving...' : (editingOrder ? 'Update' : 'Create')}
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
				<p class="mb-4">Are you sure you want to delete order #{deletingOrder?.id}?</p>
				<p class="text-sm text-secondary">This action cannot be undone.</p>
			</div>
			<div class="modal-footer">
				<button type="button" class="btn btn-outline" on:click={cancelDelete}>
					Cancel
				</button>
				<button type="button" class="btn btn-error" on:click={confirmDelete}>
					Delete Order
				</button>
			</div>
		</div>
	</div>
{/if}
