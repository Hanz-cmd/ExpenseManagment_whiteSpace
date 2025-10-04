// ExpenseFlow Application JavaScript

class ExpenseFlowApp {
    constructor() {
        this.currentUser = null;
        this.currentExpense = null;
        this.currentApproval = null;
        this.uploadedFile = null;
        this.initializeData();
        this.bindEvents();
        this.checkSession();
    }

    // Initialize application data in localStorage
    initializeData() {
        const defaultData = {
            companies: [
                {
                    id: 1,
                    name: "Tech Solutions Inc",
                    country: "United States",
                    currency: "USD",
                    created_at: "2025-01-15T10:00:00Z"
                }
            ],
            users: [
                {
                    id: 1,
                    company_id: 1,
                    username: "admin",
                    email: "admin@techsolutions.com",
                    first_name: "John",
                    last_name: "Doe",
                    role: "admin",
                    password: "admin123",
                    manager_id: null,
                    is_active: true,
                    created_at: "2025-01-15T10:00:00Z"
                },
                {
                    id: 2,
                    company_id: 1,
                    username: "manager1",
                    email: "mike@techsolutions.com",
                    first_name: "Mike",
                    last_name: "Wilson",
                    role: "manager",
                    password: "manager123",
                    manager_id: null,
                    is_active: true,
                    created_at: "2025-01-15T11:00:00Z"
                },
                {
                    id: 3,
                    company_id: 1,
                    username: "employee1",
                    email: "jane@techsolutions.com",
                    first_name: "Jane",
                    last_name: "Smith",
                    role: "employee",
                    password: "employee123",
                    manager_id: 2,
                    is_active: true,
                    created_at: "2025-01-15T12:00:00Z"
                }
            ],
            expense_categories: [
                { id: 1, company_id: 1, name: "Travel", description: "Business travel expenses", is_active: true },
                { id: 2, company_id: 1, name: "Meals", description: "Business meal expenses", is_active: true },
                { id: 3, company_id: 1, name: "Office Supplies", description: "Office supplies and equipment", is_active: true },
                { id: 4, company_id: 1, name: "Transportation", description: "Local transportation", is_active: true },
                { id: 5, company_id: 1, name: "Accommodation", description: "Hotel and lodging expenses", is_active: true }
            ],
            expenses: [
                {
                    id: 1,
                    company_id: 1,
                    employee_id: 3,
                    category_id: 2,
                    amount: 45.50,
                    currency: "USD",
                    amount_in_company_currency: 45.50,
                    description: "Business lunch with client",
                    expense_date: "2025-10-03",
                    receipt_path: null,
                    status: "pending",
                    submitted_at: "2025-10-03T14:30:00Z",
                    approved_at: null
                },
                {
                    id: 2,
                    company_id: 1,
                    employee_id: 3,
                    category_id: 4,
                    amount: 25.00,
                    currency: "USD",
                    amount_in_company_currency: 25.00,
                    description: "Taxi to airport",
                    expense_date: "2025-10-02",
                    receipt_path: null,
                    status: "approved",
                    submitted_at: "2025-10-02T09:15:00Z",
                    approved_at: "2025-10-02T11:20:00Z"
                }
            ],
            approval_workflows: [
                {
                    id: 1,
                    expense_id: 1,
                    approver_id: 2,
                    step_order: 1,
                    status: "pending",
                    comments: null,
                    approved_at: null
                }
            ],
            countries: [
                { name: "United States", currency: "USD" },
                { name: "India", currency: "INR" },
                { name: "United Kingdom", currency: "GBP" },
                { name: "Canada", currency: "CAD" },
                { name: "Australia", currency: "AUD" },
                { name: "Germany", currency: "EUR" },
                { name: "France", currency: "EUR" },
                { name: "Japan", currency: "JPY" },
                { name: "Singapore", currency: "SGD" },
                { name: "Switzerland", currency: "CHF" }
            ],
            exchange_rates: {
                USD: 1.0, EUR: 0.85, GBP: 0.73, CAD: 1.35, AUD: 1.52,
                JPY: 110.0, INR: 83.0, SGD: 1.35, CHF: 0.92, CNY: 7.2
            }
        };

        // Initialize data if not exists
        Object.keys(defaultData).forEach(key => {
            if (!localStorage.getItem(key)) {
                localStorage.setItem(key, JSON.stringify(defaultData[key]));
            }
        });
    }

    // Get data from localStorage
    getData(key) {
        return JSON.parse(localStorage.getItem(key)) || [];
    }

    // Save data to localStorage
    saveData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    // Bind event handlers
    bindEvents() {
        // Country selection for currency auto-detection
        document.addEventListener('change', (e) => {
            if (e.target.name === 'country') {
                this.handleCountryChange(e.target);
            }
        });

        // File upload handling
        document.addEventListener('DOMContentLoaded', () => {
            this.setupFileUpload();
        });

        // Form submissions
        document.addEventListener('submit', (e) => {
            e.preventDefault();
            const formId = e.target.id;
            
            switch (formId) {
                case 'signup-form':
                    this.handleSignup(e.target);
                    break;
                case 'login-form':
                    this.handleLogin(e.target);
                    break;
                case 'expense-form':
                    this.handleExpenseSubmission(e.target);
                    break;
                case 'user-form':
                    this.handleUserCreation(e.target);
                    break;
            }
        });

        // Role change in user form
        document.addEventListener('change', (e) => {
            if (e.target.name === 'role') {
                const managerField = document.getElementById('manager-field');
                if (managerField) {
                    managerField.style.display = e.target.value === 'employee' ? 'block' : 'none';
                }
            }
        });
    }

    // Handle country change for currency auto-detection
    handleCountryChange(countrySelect) {
        const countries = this.getData('countries');
        const selectedCountry = countries.find(c => c.name === countrySelect.value);
        
        if (selectedCountry) {
            const currencyInput = countrySelect.closest('form').querySelector('[name="currency"]');
            if (currencyInput) {
                currencyInput.value = selectedCountry.currency;
            }
        }
    }

    // Setup file upload functionality
    setupFileUpload() {
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('receipt-input');
        
        if (uploadArea && fileInput) {
            uploadArea.addEventListener('click', () => fileInput.click());
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });
            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('dragover');
            });
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                if (e.dataTransfer.files[0]) {
                    this.handleFileUpload(e.dataTransfer.files[0]);
                }
            });
            
            fileInput.addEventListener('change', (e) => {
                if (e.target.files[0]) {
                    this.handleFileUpload(e.target.files[0]);
                }
            });
        }
    }

    // Check for existing session
    checkSession() {
        const sessionUser = localStorage.getItem('currentUser');
        if (sessionUser) {
            this.currentUser = JSON.parse(sessionUser);
            this.showDashboard();
        } else {
            this.showLandingPage();
        }
    }

    // Show landing page
    showLandingPage() {
        document.getElementById('landing-page').classList.remove('hidden');
        document.getElementById('dashboard-container').classList.add('hidden');
        this.populateCountries();
    }

    // Populate countries dropdown
    populateCountries() {
        const countries = this.getData('countries');
        const countrySelect = document.querySelector('[name="country"]');
        if (countrySelect) {
            countrySelect.innerHTML = '<option value="">Select Country</option>';
            countries.forEach(country => {
                const option = document.createElement('option');
                option.value = country.name;
                option.textContent = country.name;
                countrySelect.appendChild(option);
            });
        }
    }

    // Handle company signup
    handleSignup(form) {
        const formData = new FormData(form);
        const companies = this.getData('companies');
        const users = this.getData('users');
        
        // Create new company
        const newCompany = {
            id: Math.max(...companies.map(c => c.id), 0) + 1,
            name: formData.get('company_name'),
            country: formData.get('country'),
            currency: formData.get('currency'),
            created_at: new Date().toISOString()
        };
        
        companies.push(newCompany);
        this.saveData('companies', companies);
        
        // Create admin user
        const newUser = {
            id: Math.max(...users.map(u => u.id), 0) + 1,
            company_id: newCompany.id,
            username: formData.get('username'),
            email: formData.get('email'),
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            role: 'admin',
            password: formData.get('password'),
            manager_id: null,
            is_active: true,
            created_at: new Date().toISOString()
        };
        
        users.push(newUser);
        this.saveData('users', users);
        
        // Auto login the new admin
        this.currentUser = newUser;
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        
        // Close modal and show dashboard
        bootstrap.Modal.getInstance(document.getElementById('signupModal')).hide();
        this.showToast('Company created successfully!', 'success');
        this.showDashboard();
    }

    // Handle user login
    handleLogin(form) {
        const formData = new FormData(form);
        const users = this.getData('users');
        
        const user = users.find(u => 
            u.username === formData.get('username') && 
            u.password === formData.get('password') &&
            u.is_active
        );
        
        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
            this.showToast(`Welcome back, ${user.first_name}!`, 'success');
            this.showDashboard();
        } else {
            this.showToast('Invalid credentials', 'error');
        }
    }

    // Show dashboard based on user role
    showDashboard() {
        document.getElementById('landing-page').classList.add('hidden');
        document.getElementById('dashboard-container').classList.remove('hidden');
        
        // Update user info and ensure logout button is visible
        const userInfo = document.getElementById('user-info');
        if (userInfo) {
            userInfo.textContent = `${this.currentUser.first_name} ${this.currentUser.last_name} (${this.currentUser.role})`;
        }
        
        // Render sidebar and content based on role
        this.renderSidebar();
        this.renderDashboardContent();
    }

    // Render sidebar based on user role
    renderSidebar() {
        const sidebar = document.getElementById('sidebar');
        const menuItems = {
            admin: [
                { icon: 'fas fa-tachometer-alt', text: 'Dashboard', action: 'showAdminDashboard' },
                { icon: 'fas fa-users', text: 'Manage Users', action: 'showUserManagement' },
                { icon: 'fas fa-receipt', text: 'All Expenses', action: 'showAllExpenses' },
                { icon: 'fas fa-plus-circle', text: 'Submit Expense', action: 'showExpenseForm' },
                { icon: 'fas fa-chart-bar', text: 'Reports', action: 'showReports' }
            ],
            manager: [
                { icon: 'fas fa-tachometer-alt', text: 'Dashboard', action: 'showManagerDashboard' },
                { icon: 'fas fa-check-circle', text: 'Pending Approvals', action: 'showPendingApprovals' },
                { icon: 'fas fa-receipt', text: 'Team Expenses', action: 'showTeamExpenses' },
                { icon: 'fas fa-plus-circle', text: 'Submit Expense', action: 'showExpenseForm' }
            ],
            employee: [
                { icon: 'fas fa-tachometer-alt', text: 'Dashboard', action: 'showEmployeeDashboard' },
                { icon: 'fas fa-plus-circle', text: 'Submit Expense', action: 'showExpenseForm' },
                { icon: 'fas fa-receipt', text: 'My Expenses', action: 'showMyExpenses' }
            ]
        };

        const items = menuItems[this.currentUser.role] || [];
        sidebar.innerHTML = `
            <ul class="sidebar-menu">
                ${items.map((item, index) => `
                    <li>
                        <a href="#" onclick="app.${item.action}(); return false;" ${index === 0 ? 'class="active"' : ''}>
                            <i class="${item.icon}"></i>
                            ${item.text}
                        </a>
                    </li>
                `).join('')}
            </ul>
        `;
    }

    // Render dashboard content based on user role
    renderDashboardContent() {
        switch (this.currentUser.role) {
            case 'admin':
                this.showAdminDashboard();
                break;
            case 'manager':
                this.showManagerDashboard();
                break;
            case 'employee':
                this.showEmployeeDashboard();
                break;
        }
    }

    // Show admin dashboard
    showAdminDashboard() {
        const content = document.getElementById('dashboard-content');
        const users = this.getData('users');
        const expenses = this.getData('expenses');
        
        const totalUsers = users.filter(u => u.company_id === this.currentUser.company_id).length;
        const totalExpenses = expenses.filter(e => e.company_id === this.currentUser.company_id).length;
        const pendingExpenses = expenses.filter(e => e.company_id === this.currentUser.company_id && e.status === 'pending').length;
        const totalAmount = expenses
            .filter(e => e.company_id === this.currentUser.company_id && e.status === 'approved')
            .reduce((sum, e) => sum + e.amount_in_company_currency, 0);
        
        content.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Admin Dashboard</h2>
                <div>
                    <button class="btn btn--primary me-2" onclick="app.showExpenseForm()">
                        <i class="fas fa-plus me-2"></i>Submit Expense
                    </button>
                    <button class="btn btn--secondary" onclick="app.showUserForm()">
                        <i class="fas fa-user-plus me-2"></i>Add User
                    </button>
                </div>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-card-header">
                        <h6 class="stat-card-title">Total Users</h6>
                        <div class="stat-card-icon bg-primary">
                            <i class="fas fa-users"></i>
                        </div>
                    </div>
                    <h2 class="stat-card-value">${totalUsers}</h2>
                </div>
                <div class="stat-card">
                    <div class="stat-card-header">
                        <h6 class="stat-card-title">Total Expenses</h6>
                        <div class="stat-card-icon bg-info">
                            <i class="fas fa-receipt"></i>
                        </div>
                    </div>
                    <h2 class="stat-card-value">${totalExpenses}</h2>
                </div>
                <div class="stat-card">
                    <div class="stat-card-header">
                        <h6 class="stat-card-title">Pending Approvals</h6>
                        <div class="stat-card-icon bg-warning">
                            <i class="fas fa-clock"></i>
                        </div>
                    </div>
                    <h2 class="stat-card-value">${pendingExpenses}</h2>
                </div>
                <div class="stat-card">
                    <div class="stat-card-header">
                        <h6 class="stat-card-title">Total Approved</h6>
                        <div class="stat-card-icon bg-success">
                            <i class="fas fa-dollar-sign"></i>
                        </div>
                    </div>
                    <h2 class="stat-card-value">$${totalAmount.toFixed(2)}</h2>
                </div>
            </div>
            
            <div class="chart-container">
                <h5 class="chart-title">Monthly Expense Trends</h5>
                <canvas id="admin-chart"></canvas>
            </div>
        `;
        
        // Render chart after DOM update
        setTimeout(() => this.renderChart('admin-chart', 'line'), 100);
    }

    // Show manager dashboard
    showManagerDashboard() {
        const content = document.getElementById('dashboard-content');
        const users = this.getData('users');
        const expenses = this.getData('expenses');
        const approvals = this.getData('approval_workflows');
        
        const teamMembers = users.filter(u => u.manager_id === this.currentUser.id);
        const teamExpenses = expenses.filter(e => 
            teamMembers.some(tm => tm.id === e.employee_id)
        );
        const pendingApprovals = approvals.filter(a => 
            a.approver_id === this.currentUser.id && a.status === 'pending'
        );
        
        content.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Manager Dashboard</h2>
                <button class="btn btn--primary" onclick="app.showExpenseForm()">
                    <i class="fas fa-plus me-2"></i>Submit Expense
                </button>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-card-header">
                        <h6 class="stat-card-title">Team Members</h6>
                        <div class="stat-card-icon bg-primary">
                            <i class="fas fa-users"></i>
                        </div>
                    </div>
                    <h2 class="stat-card-value">${teamMembers.length}</h2>
                </div>
                <div class="stat-card">
                    <div class="stat-card-header">
                        <h6 class="stat-card-title">Pending Approvals</h6>
                        <div class="stat-card-icon bg-warning">
                            <i class="fas fa-clock"></i>
                        </div>
                    </div>
                    <h2 class="stat-card-value">${pendingApprovals.length}</h2>
                </div>
                <div class="stat-card">
                    <div class="stat-card-header">
                        <h6 class="stat-card-title">Team Expenses</h6>
                        <div class="stat-card-icon bg-info">
                            <i class="fas fa-receipt"></i>
                        </div>
                    </div>
                    <h2 class="stat-card-value">${teamExpenses.length}</h2>
                </div>
            </div>
            
            <div class="quick-actions">
                <div class="quick-action-card" onclick="app.showPendingApprovals()">
                    <div class="quick-action-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h6 class="quick-action-title">Review Approvals</h6>
                </div>
                <div class="quick-action-card" onclick="app.showTeamExpenses()">
                    <div class="quick-action-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <h6 class="quick-action-title">Team Reports</h6>
                </div>
            </div>
            
            ${pendingApprovals.length > 0 ? this.renderPendingApprovalsTable(pendingApprovals.slice(0, 5)) : ''}
        `;
    }

    // Show employee dashboard
    showEmployeeDashboard() {
        const content = document.getElementById('dashboard-content');
        const expenses = this.getData('expenses');
        const userExpenses = expenses.filter(e => e.employee_id === this.currentUser.id);
        
        const totalExpenses = userExpenses.length;
        const pendingExpenses = userExpenses.filter(e => e.status === 'pending').length;
        const approvedExpenses = userExpenses.filter(e => e.status === 'approved').length;
        const totalAmount = userExpenses
            .filter(e => e.status === 'approved')
            .reduce((sum, e) => sum + e.amount_in_company_currency, 0);
        
        content.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>My Dashboard</h2>
                <button class="btn btn--primary" onclick="app.showExpenseForm()">
                    <i class="fas fa-plus me-2"></i>Submit Expense
                </button>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-card-header">
                        <h6 class="stat-card-title">Total Expenses</h6>
                        <div class="stat-card-icon bg-primary">
                            <i class="fas fa-receipt"></i>
                        </div>
                    </div>
                    <h2 class="stat-card-value">${totalExpenses}</h2>
                </div>
                <div class="stat-card">
                    <div class="stat-card-header">
                        <h6 class="stat-card-title">Pending</h6>
                        <div class="stat-card-icon bg-warning">
                            <i class="fas fa-clock"></i>
                        </div>
                    </div>
                    <h2 class="stat-card-value">${pendingExpenses}</h2>
                </div>
                <div class="stat-card">
                    <div class="stat-card-header">
                        <h6 class="stat-card-title">Approved</h6>
                        <div class="stat-card-icon bg-success">
                            <i class="fas fa-check-circle"></i>
                        </div>
                    </div>
                    <h2 class="stat-card-value">${approvedExpenses}</h2>
                </div>
                <div class="stat-card">
                    <div class="stat-card-header">
                        <h6 class="stat-card-title">Total Approved</h6>
                        <div class="stat-card-icon bg-info">
                            <i class="fas fa-dollar-sign"></i>
                        </div>
                    </div>
                    <h2 class="stat-card-value">$${totalAmount.toFixed(2)}</h2>
                </div>
            </div>
            
            <div class="quick-actions">
                <div class="quick-action-card" onclick="app.showExpenseForm()">
                    <div class="quick-action-icon">
                        <i class="fas fa-plus"></i>
                    </div>
                    <h6 class="quick-action-title">New Expense</h6>
                </div>
                <div class="quick-action-card" onclick="app.showMyExpenses()">
                    <div class="quick-action-icon">
                        <i class="fas fa-list"></i>
                    </div>
                    <h6 class="quick-action-title">View History</h6>
                </div>
            </div>
            
            <div class="chart-container">
                <h5 class="chart-title">My Monthly Expenses</h5>
                <canvas id="employee-chart"></canvas>
            </div>
        `;
        
        // Render chart after DOM update
        setTimeout(() => this.renderChart('employee-chart', 'bar'), 100);
    }

    // Show expense form modal
    showExpenseForm() {
        const categories = this.getData('expense_categories');
        const modal = new bootstrap.Modal(document.getElementById('expenseModal'));
        
        // Populate categories
        const categorySelect = document.querySelector('#expenseModal [name="category_id"]');
        if (categorySelect) {
            categorySelect.innerHTML = '<option value="">Select Category</option>';
            categories
                .filter(c => c.company_id === this.currentUser.company_id && c.is_active)
                .forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    categorySelect.appendChild(option);
                });
        }
        
        // Set default date to today
        const dateInput = document.querySelector('#expenseModal [name="expense_date"]');
        if (dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }
        
        // Reset form and file upload
        const form = document.getElementById('expense-form');
        if (form) {
            form.reset();
        }
        this.removeFile();
        
        // Setup file upload after modal is shown
        modal.show();
        setTimeout(() => this.setupFileUpload(), 100);
    }

    // Handle expense submission
    handleExpenseSubmission(form) {
        const formData = new FormData(form);
        const expenses = this.getData('expenses');
        const approvals = this.getData('approval_workflows');
        const exchangeRates = this.getData('exchange_rates');
        const companies = this.getData('companies');
        
        const company = companies.find(c => c.id === this.currentUser.company_id);
        const rate = exchangeRates[formData.get('currency')] / exchangeRates[company.currency];
        
        const newExpense = {
            id: Math.max(...expenses.map(e => e.id), 0) + 1,
            company_id: this.currentUser.company_id,
            employee_id: this.currentUser.id,
            category_id: parseInt(formData.get('category_id')),
            amount: parseFloat(formData.get('amount')),
            currency: formData.get('currency'),
            amount_in_company_currency: parseFloat(formData.get('amount')) / rate,
            description: formData.get('description'),
            expense_date: formData.get('expense_date'),
            receipt_path: this.uploadedFile || null,
            status: 'pending',
            submitted_at: new Date().toISOString(),
            approved_at: null
        };
        
        expenses.push(newExpense);
        this.saveData('expenses', expenses);
        
        // Create approval workflow
        const users = this.getData('users');
        const manager = users.find(u => u.id === this.currentUser.manager_id);
        
        if (manager) {
            const newApproval = {
                id: Math.max(...approvals.map(a => a.id), 0) + 1,
                expense_id: newExpense.id,
                approver_id: manager.id,
                step_order: 1,
                status: 'pending',
                comments: null,
                approved_at: null
            };
            
            approvals.push(newApproval);
            this.saveData('approval_workflows', approvals);
        }
        
        bootstrap.Modal.getInstance(document.getElementById('expenseModal')).hide();
        this.showToast('Expense submitted successfully!', 'success');
        this.renderDashboardContent();
    }

    // Handle file upload
    handleFileUpload(file) {
        if (!file) return;
        
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            this.showToast('Please select a valid image or PDF file', 'error');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            this.showToast('File size must be less than 5MB', 'error');
            return;
        }
        
        this.uploadedFile = `uploads/${Date.now()}_${file.name}`;
        
        // Show file preview
        const uploadArea = document.getElementById('upload-area');
        const filePreview = document.getElementById('file-preview');
        const fileName = document.getElementById('file-name');
        
        if (uploadArea && filePreview && fileName) {
            uploadArea.classList.add('hidden');
            filePreview.classList.remove('hidden');
            fileName.textContent = file.name;
        }
        
        // Simulate OCR processing
        this.simulateOCR(file);
    }

    // Remove uploaded file
    removeFile() {
        this.uploadedFile = null;
        const uploadArea = document.getElementById('upload-area');
        const filePreview = document.getElementById('file-preview');
        const ocrResults = document.getElementById('ocr-results');
        const fileInput = document.getElementById('receipt-input');
        
        if (uploadArea) uploadArea.classList.remove('hidden');
        if (filePreview) filePreview.classList.add('hidden');
        if (ocrResults) ocrResults.classList.add('hidden');
        if (fileInput) fileInput.value = '';
    }

    // Simulate OCR data extraction
    simulateOCR(file) {
        // Simulate processing delay
        setTimeout(() => {
            const mockOCRData = [
                { amount: 45.50, description: 'Business Lunch', merchant: 'Restaurant ABC' },
                { amount: 125.00, description: 'Hotel Stay', merchant: 'Grand Hotel' },
                { amount: 25.75, description: 'Taxi Ride', merchant: 'City Cab Co' },
                { amount: 15.20, description: 'Coffee Meeting', merchant: 'Coffee Shop' }
            ];
            
            const randomData = mockOCRData[Math.floor(Math.random() * mockOCRData.length)];
            
            // Auto-populate form fields
            const amountInput = document.querySelector('#expenseModal [name="amount"]');
            const descriptionInput = document.querySelector('#expenseModal [name="description"]');
            
            if (amountInput) amountInput.value = randomData.amount;
            if (descriptionInput) descriptionInput.value = randomData.description;
            
            // Show OCR results
            const ocrResults = document.getElementById('ocr-results');
            const ocrData = document.getElementById('ocr-data');
            
            if (ocrResults && ocrData) {
                ocrResults.classList.remove('hidden');
                ocrData.innerHTML = `
                    <strong>Amount:</strong> $${randomData.amount}<br>
                    <strong>Description:</strong> ${randomData.description}<br>
                    <strong>Merchant:</strong> ${randomData.merchant}
                `;
            }
            
            this.showToast('OCR processing complete!', 'success');
        }, 1500);
    }

    // Show user form modal (Admin only)
    showUserForm() {
        const modal = new bootstrap.Modal(document.getElementById('userModal'));
        const users = this.getData('users');
        
        // Populate managers dropdown
        const managerSelect = document.querySelector('#userModal [name="manager_id"]');
        if (managerSelect) {
            managerSelect.innerHTML = '<option value="">Select Manager</option>';
            users
                .filter(u => u.company_id === this.currentUser.company_id && u.role === 'manager')
                .forEach(user => {
                    const option = document.createElement('option');
                    option.value = user.id;
                    option.textContent = `${user.first_name} ${user.last_name}`;
                    managerSelect.appendChild(option);
                });
        }
        
        modal.show();
    }

    // Handle user creation
    handleUserCreation(form) {
        const formData = new FormData(form);
        const users = this.getData('users');
        
        const newUser = {
            id: Math.max(...users.map(u => u.id), 0) + 1,
            company_id: this.currentUser.company_id,
            username: formData.get('username'),
            email: formData.get('email'),
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            role: formData.get('role'),
            password: formData.get('password'),
            manager_id: formData.get('manager_id') ? parseInt(formData.get('manager_id')) : null,
            is_active: true,
            created_at: new Date().toISOString()
        };
        
        users.push(newUser);
        this.saveData('users', users);
        
        bootstrap.Modal.getInstance(document.getElementById('userModal')).hide();
        this.showToast('User created successfully!', 'success');
        form.reset();
        this.renderDashboardContent();
    }

    // Show user management
    showUserManagement() {
        const content = document.getElementById('dashboard-content');
        const users = this.getData('users').filter(u => u.company_id === this.currentUser.company_id);
        
        content.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>User Management</h2>
                <button class="btn btn--primary" onclick="app.showUserForm()">
                    <i class="fas fa-plus me-2"></i>Add User
                </button>
            </div>
            
            <div class="table-container">
                <div class="table-header">
                    <h5 class="table-title">All Users</h5>
                    <div class="table-controls">
                        <input type="text" class="search-input" placeholder="Search users..." onkeyup="app.filterTable(this, 'users-table')">
                    </div>
                </div>
                <table class="data-table" id="users-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Manager</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(user => {
                            const manager = users.find(u => u.id === user.manager_id);
                            return `
                                <tr>
                                    <td>${user.first_name} ${user.last_name}</td>
                                    <td>${user.username}</td>
                                    <td>${user.email}</td>
                                    <td><span class="role-badge ${user.role}">${user.role}</span></td>
                                    <td>${manager ? `${manager.first_name} ${manager.last_name}` : '-'}</td>
                                    <td><span class="status-badge ${user.is_active ? 'approved' : 'rejected'}">${user.is_active ? 'Active' : 'Inactive'}</span></td>
                                    <td>
                                        <button class="action-btn action-btn-primary" onclick="app.toggleUserStatus(${user.id})">
                                            ${user.is_active ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    // Show my expenses
    showMyExpenses() {
        const expenses = this.getData('expenses').filter(e => e.employee_id === this.currentUser.id);
        this.renderExpensesTable(expenses, 'My Expenses');
    }

    // Show all expenses (Admin only)
    showAllExpenses() {
        const expenses = this.getData('expenses').filter(e => e.company_id === this.currentUser.company_id);
        this.renderExpensesTable(expenses, 'All Expenses');
    }

    // Show team expenses (Manager only)
    showTeamExpenses() {
        const users = this.getData('users');
        const teamMembers = users.filter(u => u.manager_id === this.currentUser.id);
        const expenses = this.getData('expenses').filter(e => 
            teamMembers.some(tm => tm.id === e.employee_id)
        );
        this.renderExpensesTable(expenses, 'Team Expenses');
    }

    // Render expenses table
    renderExpensesTable(expenses, title) {
        const content = document.getElementById('dashboard-content');
        const categories = this.getData('expense_categories');
        const users = this.getData('users');
        
        content.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>${title}</h2>
                <button class="btn btn--primary" onclick="app.showExpenseForm()">
                    <i class="fas fa-plus me-2"></i>Submit Expense
                </button>
            </div>
            
            <div class="table-container">
                <div class="table-header">
                    <h5 class="table-title">${title}</h5>
                    <div class="table-controls">
                        <select class="form-control me-2" onchange="app.filterExpensesByStatus(this.value)">
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        <input type="text" class="search-input" placeholder="Search expenses..." onkeyup="app.filterTable(this, 'expenses-table')">
                    </div>
                </div>
                <table class="data-table" id="expenses-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Employee</th>
                            <th>Category</th>
                            <th>Description</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${expenses.map(expense => {
                            const category = categories.find(c => c.id === expense.category_id);
                            const employee = users.find(u => u.id === expense.employee_id);
                            return `
                                <tr>
                                    <td>${new Date(expense.expense_date).toLocaleDateString()}</td>
                                    <td>${employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown'}</td>
                                    <td>${category ? category.name : 'Unknown'}</td>
                                    <td>${expense.description}</td>
                                    <td>$${expense.amount_in_company_currency.toFixed(2)}</td>
                                    <td><span class="status-badge ${expense.status}">${expense.status}</span></td>
                                    <td>
                                        <button class="action-btn action-btn-primary" onclick="app.viewExpenseDetails(${expense.id})">
                                            View
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    // Show pending approvals
    showPendingApprovals() {
        const approvals = this.getData('approval_workflows').filter(a => 
            a.approver_id === this.currentUser.id && a.status === 'pending'
        );
        
        const content = document.getElementById('dashboard-content');
        content.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Pending Approvals</h2>
            </div>
            
            ${this.renderPendingApprovalsTable(approvals)}
        `;
    }

    // Render pending approvals table
    renderPendingApprovalsTable(approvals) {
        const expenses = this.getData('expenses');
        const users = this.getData('users');
        const categories = this.getData('expense_categories');
        
        return `
            <div class="table-container">
                <div class="table-header">
                    <h5 class="table-title">Pending Approvals (${approvals.length})</h5>
                </div>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Employee</th>
                            <th>Category</th>
                            <th>Description</th>
                            <th>Amount</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${approvals.map(approval => {
                            const expense = expenses.find(e => e.id === approval.expense_id);
                            const employee = users.find(u => u.id === expense.employee_id);
                            const category = categories.find(c => c.id === expense.category_id);
                            
                            return `
                                <tr>
                                    <td>${new Date(expense.expense_date).toLocaleDateString()}</td>
                                    <td>${employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown'}</td>
                                    <td>${category ? category.name : 'Unknown'}</td>
                                    <td>${expense.description}</td>
                                    <td>$${expense.amount_in_company_currency.toFixed(2)}</td>
                                    <td>
                                        <button class="action-btn action-btn-success me-1" onclick="app.showApprovalModal(${approval.id})">
                                            Review
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    // Show approval modal
    showApprovalModal(approvalId) {
        const approval = this.getData('approval_workflows').find(a => a.id === approvalId);
        const expense = this.getData('expenses').find(e => e.id === approval.expense_id);
        const employee = this.getData('users').find(u => u.id === expense.employee_id);
        const category = this.getData('expense_categories').find(c => c.id === expense.category_id);
        
        this.currentApproval = approval;
        
        const expenseDetails = document.getElementById('expense-details');
        expenseDetails.innerHTML = `
            <div class="expense-detail-row">
                <span class="expense-detail-label">Employee:</span>
                <span class="expense-detail-value">${employee.first_name} ${employee.last_name}</span>
            </div>
            <div class="expense-detail-row">
                <span class="expense-detail-label">Category:</span>
                <span class="expense-detail-value">${category.name}</span>
            </div>
            <div class="expense-detail-row">
                <span class="expense-detail-label">Amount:</span>
                <span class="expense-detail-value">$${expense.amount_in_company_currency.toFixed(2)} ${expense.currency !== 'USD' ? `(${expense.amount} ${expense.currency})` : ''}</span>
            </div>
            <div class="expense-detail-row">
                <span class="expense-detail-label">Date:</span>
                <span class="expense-detail-value">${new Date(expense.expense_date).toLocaleDateString()}</span>
            </div>
            <div class="expense-detail-row">
                <span class="expense-detail-label">Description:</span>
                <span class="expense-detail-value">${expense.description}</span>
            </div>
            <div class="expense-detail-row">
                <span class="expense-detail-label">Submitted:</span>
                <span class="expense-detail-value">${new Date(expense.submitted_at).toLocaleDateString()}</span>
            </div>
        `;
        
        const modal = new bootstrap.Modal(document.getElementById('approvalModal'));
        modal.show();
    }

    // Process approval
    processApproval(status) {
        const comments = document.getElementById('approval-comments').value;
        const approvals = this.getData('approval_workflows');
        const expenses = this.getData('expenses');
        
        // Update approval
        const approvalIndex = approvals.findIndex(a => a.id === this.currentApproval.id);
        approvals[approvalIndex].status = status;
        approvals[approvalIndex].comments = comments || null;
        approvals[approvalIndex].approved_at = new Date().toISOString();
        
        // Update expense status
        const expenseIndex = expenses.findIndex(e => e.id === this.currentApproval.expense_id);
        expenses[expenseIndex].status = status;
        if (status === 'approved') {
            expenses[expenseIndex].approved_at = new Date().toISOString();
        }
        
        this.saveData('approval_workflows', approvals);
        this.saveData('expenses', expenses);
        
        bootstrap.Modal.getInstance(document.getElementById('approvalModal')).hide();
        this.showToast(`Expense ${status} successfully!`, 'success');
        document.getElementById('approval-comments').value = '';
        this.showPendingApprovals();
    }

    // Render chart
    renderChart(canvasId, type) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const expenses = this.getData('expenses');
        const filteredExpenses = this.currentUser.role === 'employee' 
            ? expenses.filter(e => e.employee_id === this.currentUser.id)
            : expenses.filter(e => e.company_id === this.currentUser.company_id);
        
        // Generate monthly data
        const monthlyData = {};
        const currentDate = new Date();
        for (let i = 5; i >= 0; i--) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const monthKey = date.toISOString().slice(0, 7);
            monthlyData[monthKey] = 0;
        }
        
        filteredExpenses.forEach(expense => {
            const monthKey = expense.expense_date.slice(0, 7);
            if (monthlyData.hasOwnProperty(monthKey)) {
                monthlyData[monthKey] += expense.amount_in_company_currency;
            }
        });
        
        const ctx = canvas.getContext('2d');
        new Chart(ctx, {
            type: type,
            data: {
                labels: Object.keys(monthlyData).map(key => new Date(key).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })),
                datasets: [{
                    label: 'Expenses ($)',
                    data: Object.values(monthlyData),
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545'],
                    borderColor: '#1FB8CD',
                    borderWidth: 2,
                    fill: type === 'line' ? false : true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(0);
                            }
                        }
                    }
                }
            }
        });
    }

    // View expense details (placeholder)
    viewExpenseDetails(expenseId) {
        this.showToast('Expense details feature coming soon!', 'info');
    }

    // Show reports (placeholder)
    showReports() {
        this.showToast('Reports feature coming soon!', 'info');
    }

    // Filter table
    filterTable(input, tableId) {
        const filter = input.value.toLowerCase();
        const table = document.getElementById(tableId);
        if (!table) return;
        
        const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
        
        for (let row of rows) {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(filter) ? '' : 'none';
        }
    }

    // Filter expenses by status
    filterExpensesByStatus(status) {
        const table = document.getElementById('expenses-table');
        if (!table) return;
        
        const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
        
        for (let row of rows) {
            const statusCell = row.cells[5].textContent.toLowerCase();
            row.style.display = status === '' || statusCell.includes(status) ? '' : 'none';
        }
    }

    // Toggle user status
    toggleUserStatus(userId) {
        const users = this.getData('users');
        const userIndex = users.findIndex(u => u.id === userId);
        users[userIndex].is_active = !users[userIndex].is_active;
        this.saveData('users', users);
        this.showToast(`User ${users[userIndex].is_active ? 'activated' : 'deactivated'} successfully!`, 'success');
        this.showUserManagement();
    }

    // Show toast notification
    showToast(message, type = 'info') {
        const toastContainer = document.querySelector('.toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type} show`;
        toast.innerHTML = `
            <div class="toast-header">
                <strong class="me-auto">
                    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
                    ${type.charAt(0).toUpperCase() + type.slice(1)}
                </strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">${message}</div>
        `;
        
        toastContainer.appendChild(toast);
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);
    }

    // Logout
    logout() {
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        this.showLandingPage();
        this.showToast('Logged out successfully!', 'success');
    }
}

// Global functions for HTML onclick events
function showSignup() {
    const modal = new bootstrap.Modal(document.getElementById('signupModal'));
    modal.show();
}

function showLogin() {
    const modal = new bootstrap.Modal(document.getElementById('loginModal'));
    modal.show();
}

function logout() {
    app.logout();
}

function processApproval(status) {
    app.processApproval(status);
}

function removeFile() {
    app.removeFile();
}

// Initialize app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new ExpenseFlowApp();
});