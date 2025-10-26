// Data types and interfaces
export interface User {
	id: string;
	name: string;
	email: string;
	role: 'admin' | 'customer' | 'employee';
	createdAt: Date;
	updatedAt: Date;
}

export interface Product {
	id: string;
	name: string;
	description: string;
	price: number;
	category: string;
	stock: number;
	imageUrl?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface Order {
	id: string;
	userId: string;
	userName: string;
	userEmail: string;
	products: OrderItem[];
	total: number;
	status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
	shippingAddress: Address;
	createdAt: Date;
	updatedAt: Date;
}

export interface OrderItem {
	productId: string;
	productName: string;
	quantity: number;
	price: number;
}

export interface Address {
	street: string;
	city: string;
	state: string;
	zipCode: string;
	country: string;
}

// Simple in-memory data store
class DataStore {
	private users: User[] = [];
	private products: Product[] = [];
	private orders: Order[] = [];
	private nextUserId = 1;
	private nextProductId = 1;
	private nextOrderId = 1;

	constructor() {
		this.loadFromStorage();
		this.initializeData();
	}

	private loadFromStorage() {
		if (typeof window !== 'undefined') {
			try {
				const savedUsers = localStorage.getItem('ecommerce_users');
				const savedProducts = localStorage.getItem('ecommerce_products');
				const savedOrders = localStorage.getItem('ecommerce_orders');
				const savedNextUserId = localStorage.getItem('ecommerce_nextUserId');
				const savedNextProductId = localStorage.getItem('ecommerce_nextProductId');
				const savedNextOrderId = localStorage.getItem('ecommerce_nextOrderId');

				if (savedUsers) {
					this.users = JSON.parse(savedUsers);
				}
				if (savedProducts) {
					this.products = JSON.parse(savedProducts);
				}
				if (savedOrders) {
					this.orders = JSON.parse(savedOrders);
				}
				if (savedNextUserId) {
					this.nextUserId = parseInt(savedNextUserId);
				}
				if (savedNextProductId) {
					this.nextProductId = parseInt(savedNextProductId);
				}
				if (savedNextOrderId) {
					this.nextOrderId = parseInt(savedNextOrderId);
				}
			} catch (error) {
				console.error('Error loading from localStorage:', error);
			}
		}
	}

	private saveToStorage() {
		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem('ecommerce_users', JSON.stringify(this.users));
				localStorage.setItem('ecommerce_products', JSON.stringify(this.products));
				localStorage.setItem('ecommerce_orders', JSON.stringify(this.orders));
				localStorage.setItem('ecommerce_nextUserId', this.nextUserId.toString());
				localStorage.setItem('ecommerce_nextProductId', this.nextProductId.toString());
				localStorage.setItem('ecommerce_nextOrderId', this.nextOrderId.toString());
			} catch (error) {
				console.error('Error saving to localStorage:', error);
			}
		}
	}

	private initializeData() {
		// Sample users
		this.users = [
			{
				id: '1',
				name: 'Admin User',
				email: 'admin@shop.com',
				role: 'admin',
				createdAt: new Date('2024-01-01'),
				updatedAt: new Date('2024-01-01')
			},
			{
				id: '2',
				name: 'John Doe',
				email: 'john@example.com',
				role: 'customer',
				createdAt: new Date('2024-01-15'),
				updatedAt: new Date('2024-01-15')
			},
			{
				id: '3',
				name: 'Jane Smith',
				email: 'jane@example.com',
				role: 'customer',
				createdAt: new Date('2024-02-01'),
				updatedAt: new Date('2024-02-01')
			}
		];

		// Sample products
		this.products = [
			{
				id: '1',
				name: 'Wireless Headphones',
				description: 'High-quality wireless headphones with noise cancellation',
				price: 199.99,
				category: 'Electronics',
				stock: 50,
				imageUrl: '/placeholder-headphones.jpg',
				createdAt: new Date('2024-01-01'),
				updatedAt: new Date('2024-01-01')
			},
			{
				id: '2',
				name: 'Smart Watch',
				description: 'Fitness tracking smart watch with heart rate monitor',
				price: 299.99,
				category: 'Electronics',
				stock: 25,
				imageUrl: '/placeholder-watch.jpg',
				createdAt: new Date('2024-01-05'),
				updatedAt: new Date('2024-01-05')
			},
			{
				id: '3',
				name: 'Coffee Maker',
				description: 'Automatic coffee maker with programmable timer',
				price: 89.99,
				category: 'Appliances',
				stock: 15,
				imageUrl: '/placeholder-coffee.jpg',
				createdAt: new Date('2024-01-10'),
				updatedAt: new Date('2024-01-10')
			}
		];

		// Sample orders
		this.orders = [
			{
				id: '1',
				userId: '2',
				userName: 'John Doe',
				userEmail: 'john@example.com',
				products: [
					{
						productId: '1',
						productName: 'Wireless Headphones',
						quantity: 1,
						price: 199.99
					}
				],
				total: 199.99,
				status: 'delivered',
				shippingAddress: {
					street: '123 Main St',
					city: 'New York',
					state: 'NY',
					zipCode: '10001',
					country: 'USA'
				},
				createdAt: new Date('2024-01-20'),
				updatedAt: new Date('2024-01-25')
			},
			{
				id: '2',
				userId: '3',
				userName: 'Jane Smith',
				userEmail: 'jane@example.com',
				products: [
					{
						productId: '2',
						productName: 'Smart Watch',
						quantity: 1,
						price: 299.99
					},
					{
						productId: '3',
						productName: 'Coffee Maker',
						quantity: 1,
						price: 89.99
					}
				],
				total: 389.98,
				status: 'processing',
				shippingAddress: {
					street: '456 Oak Ave',
					city: 'Los Angeles',
					state: 'CA',
					zipCode: '90210',
					country: 'USA'
				},
				createdAt: new Date('2024-02-05'),
				updatedAt: new Date('2024-02-05')
			}
		];

		this.nextUserId = 4;
		this.nextProductId = 4;
		this.nextOrderId = 3;
		
		// Save initial data to localStorage
		this.saveToStorage();
	}

	// User methods
	getUsers(): User[] {
		return [...this.users];
	}

	getUserById(id: string): User | undefined {
		return this.users.find(user => user.id === id);
	}

	createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
		const user: User = {
			...userData,
			id: this.nextUserId.toString(),
			createdAt: new Date(),
			updatedAt: new Date()
		};
		this.users.push(user);
		this.nextUserId++;
		this.saveToStorage();
		return user;
	}

	updateUser(id: string, userData: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): User | null {
		const index = this.users.findIndex(user => user.id === id);
		if (index === -1) return null;

		this.users[index] = {
			...this.users[index],
			...userData,
			updatedAt: new Date()
		};
		this.saveToStorage();
		return this.users[index];
	}

	deleteUser(id: string): boolean {
		const index = this.users.findIndex(user => user.id === id);
		if (index === -1) return false;
		this.users.splice(index, 1);
		this.saveToStorage();
		return true;
	}

	// Product methods
	getProducts(): Product[] {
		return [...this.products];
	}

	getProductById(id: string): Product | undefined {
		return this.products.find(product => product.id === id);
	}

	createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
		const product: Product = {
			...productData,
			id: this.nextProductId.toString(),
			createdAt: new Date(),
			updatedAt: new Date()
		};
		this.products.push(product);
		this.nextProductId++;
		this.saveToStorage();
		return product;
	}

	updateProduct(id: string, productData: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): Product | null {
		const index = this.products.findIndex(product => product.id === id);
		if (index === -1) return null;

		this.products[index] = {
			...this.products[index],
			...productData,
			updatedAt: new Date()
		};
		this.saveToStorage();
		return this.products[index];
	}

	deleteProduct(id: string): boolean {
		const index = this.products.findIndex(product => product.id === id);
		if (index === -1) return false;
		this.products.splice(index, 1);
		this.saveToStorage();
		return true;
	}

	// Order methods
	getOrders(): Order[] {
		return [...this.orders];
	}

	getOrderById(id: string): Order | undefined {
		return this.orders.find(order => order.id === id);
	}

	createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order {
		const order: Order = {
			...orderData,
			id: this.nextOrderId.toString(),
			createdAt: new Date(),
			updatedAt: new Date()
		};
		this.orders.push(order);
		this.nextOrderId++;
		this.saveToStorage();
		return order;
	}

	updateOrder(id: string, orderData: Partial<Omit<Order, 'id' | 'createdAt' | 'updatedAt'>>): Order | null {
		const index = this.orders.findIndex(order => order.id === id);
		if (index === -1) return null;

		this.orders[index] = {
			...this.orders[index],
			...orderData,
			updatedAt: new Date()
		};
		this.saveToStorage();
		return this.orders[index];
	}

	deleteOrder(id: string): boolean {
		const index = this.orders.findIndex(order => order.id === id);
		if (index === -1) return false;
		this.orders.splice(index, 1);
		this.saveToStorage();
		return true;
	}

	// Authentication
	authenticateUser(email: string, password: string): User | null {
		// Simple authentication - in real app, you'd hash passwords
		const user = this.users.find(u => u.email === email);
		if (user && password === 'password123') { // Simple password for demo
			return user;
		}
		return null;
	}
}

// Export singleton instance
export const dataStore = new DataStore();
