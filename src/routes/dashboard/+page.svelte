<script>
	import { onMount } from 'svelte';
	import { dataStore } from '$lib/data';

	let stats = {
		totalUsers: 0,
		totalProducts: 0,
		totalOrders: 0,
		totalRevenue: 0,
		recentOrders: [],
		lowStockProducts: []
	};

	onMount(() => {
		const users = dataStore.getUsers();
		const products = dataStore.getProducts();
		const orders = dataStore.getOrders();

		stats = {
			totalUsers: users.length,
			totalProducts: products.length,
			totalOrders: orders.length,
			totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
			recentOrders: orders
				.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
				.slice(0, 5),
			lowStockProducts: products.filter(p => p.stock < 20).slice(0, 5)
		};
	});

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
</script>

<svelte:head>
	<title>Dashboard - E-commerce Dashboard</title>
</svelte:head>

<div class="container">
	<h1 class="text-3xl mb-8">Dashboard Overview</h1>

	<!-- Stats Cards -->
	<div class="grid grid-cols-4 gap-6 mb-8">
		<div class="card">
			<div class="card-body">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-secondary mb-1">Total Users</p>
						<p class="text-3xl font-bold" style="color: var(--primary-color);">{stats.totalUsers}</p>
					</div>
					<div class="bg-primary text-white p-4 rounded-full">
						<svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
							<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
						</svg>
					</div>
				</div>
			</div>
		</div>

		<div class="card">
			<div class="card-body">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-secondary mb-1">Total Products</p>
						<p class="text-3xl font-bold" style="color: var(--success-color);">{stats.totalProducts}</p>
					</div>
					<div class="bg-success text-white p-4 rounded-full">
						<svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
							<path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z"/>
						</svg>
					</div>
				</div>
			</div>
		</div>

		<div class="card">
			<div class="card-body">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-secondary mb-1">Total Orders</p>
						<p class="text-3xl font-bold" style="color: var(--warning-color);">{stats.totalOrders}</p>
					</div>
					<div class="bg-warning text-white p-4 rounded-full">
						<svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
							<path d="M19 7H16V6C16 4.9 15.1 4 14 4H10C8.9 4 8 4.9 8 6V7H5C3.9 7 3 7.9 3 9V18C3 19.1 3.9 20 5 20H19C20.1 20 21 19.1 21 18V9C21 7.9 20.1 7 19 7ZM10 6H14V7H10V6ZM19 18H5V9H19V18Z"/>
						</svg>
					</div>
				</div>
			</div>
		</div>

		<div class="card">
			<div class="card-body">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-secondary mb-1">Total Revenue</p>
						<p class="text-3xl font-bold" style="color: var(--error-color);">${stats.totalRevenue.toFixed(2)}</p>
					</div>
					<div class="bg-error text-white p-4 rounded-full">
						<svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
							<path d="M11.8 10.9C9.53 10.31 8.8 9.7 8.8 8.75C8.8 7.66 9.81 6.9 11.5 6.9C13.28 6.9 13.94 7.75 14 9H16.21C16.14 7.28 15.09 5.7 13 5.19V3H10V5.16C8.06 5.58 6.5 6.84 6.5 8.77C6.5 11.08 8.41 12.23 11.2 12.9C13.7 13.5 14.2 14.38 14.2 15.31C14.2 16 13.71 17.1 11.5 17.1C9.44 17.1 8.63 16.18 8.5 15H6.32C6.44 17.19 8.08 18.42 10 18.83V21H13V18.85C14.95 18.5 16.5 17.35 16.5 15.3C16.5 12.46 14.07 11.5 11.8 10.9Z"/>
						</svg>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="grid grid-cols-2 gap-6 mb-6">
		<!-- Recent Orders -->
		<div class="card">
			<div class="card-header">
				<div class="flex items-center justify-between">
					<h3>Recent Orders</h3>
					<a href="/orders" class="text-sm text-primary font-semibold hover:underline">View All</a>
				</div>
			</div>
			<div class="card-body p-0">
				{#if stats.recentOrders.length === 0}
					<div class="p-8 text-center">
						<p class="text-secondary">No orders yet</p>
					</div>
				{:else}
					<div class="overflow-x-auto">
						<table class="table">
							<thead>
								<tr>
									<th class="text-xs">Order ID</th>
									<th class="text-xs">Customer</th>
									<th class="text-xs">Total</th>
									<th class="text-xs">Status</th>
								</tr>
							</thead>
							<tbody>
								{#each stats.recentOrders as order}
									<tr>
										<td>#{order.id}</td>
										<td>
											<div class="font-medium text-sm">{order.userName}</div>
										</td>
										<td class="font-semibold">${order.total.toFixed(2)}</td>
										<td>
											<span class="badge {getStatusBadgeClass(order.status)}">
												{order.status}
											</span>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>
		</div>

		<!-- Low Stock Products -->
		<div class="card">
			<div class="card-header">
				<div class="flex items-center justify-between">
					<h3>Low Stock Alert</h3>
					<a href="/products" class="text-sm text-primary font-semibold hover:underline">View All</a>
				</div>
			</div>
			<div class="card-body p-0">
				{#if stats.lowStockProducts.length === 0}
					<div class="p-8 text-center">
						<p class="text-success font-semibold">All products are well stocked!</p>
					</div>
				{:else}
					<div class="overflow-x-auto">
						<table class="table">
							<thead>
								<tr>
									<th class="text-xs">Product</th>
									<th class="text-xs">Category</th>
									<th class="text-xs">Stock</th>
									<th class="text-xs">Action</th>
								</tr>
							</thead>
							<tbody>
								{#each stats.lowStockProducts as product}
									<tr>
										<td>
											<div class="font-medium text-sm">{product.name}</div>
										</td>
										<td>
											<span class="badge badge-info">{product.category}</span>
										</td>
										<td class="font-semibold {product.stock < 10 ? 'text-error' : 'text-warning'}">
											{product.stock}
										</td>
										<td>
											<a href="/products" class="text-primary hover:underline text-sm">Manage</a>
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

	<!-- Quick Actions -->
	<div class="grid grid-cols-3 gap-6">
		<div class="card">
			<div class="card-body">
				<div class="flex items-center gap-4">
					<div class="bg-primary text-white p-3 rounded-lg">
						<svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
							<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
						</svg>
					</div>
					<div class="flex-1">
						<h4 class="font-semibold mb-1">Manage Users</h4>
						<p class="text-sm text-secondary">Add, edit, and manage user accounts</p>
					</div>
					<a href="/users" class="btn btn-outline btn-sm">View</a>
				</div>
			</div>
		</div>

		<div class="card">
			<div class="card-body">
				<div class="flex items-center gap-4">
					<div class="bg-success text-white p-3 rounded-lg">
						<svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
							<path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7Z"/>
						</svg>
					</div>
					<div class="flex-1">
						<h4 class="font-semibold mb-1">Manage Products</h4>
						<p class="text-sm text-secondary">Add, edit, and manage products</p>
					</div>
					<a href="/products" class="btn btn-outline btn-sm">View</a>
				</div>
			</div>
		</div>

		<div class="card">
			<div class="card-body">
				<div class="flex items-center gap-4">
					<div class="bg-warning text-white p-3 rounded-lg">
						<svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
							<path d="M19 7H16V6C16 4.9 15.1 4 14 4H10C8.9 4 8 4.9 8 6V7H5C3.9 7 3 7.9 3 9V18C3 19.1 3.9 20 5 20H19C20.1 20 21 19.1 21 18V9C21 7.9 20.1 7 19 7Z"/>
						</svg>
					</div>
					<div class="flex-1">
						<h4 class="font-semibold mb-1">Manage Orders</h4>
						<p class="text-sm text-secondary">View and process customer orders</p>
					</div>
					<a href="/orders" class="btn btn-outline btn-sm">View</a>
				</div>
			</div>
		</div>
	</div>
</div>
