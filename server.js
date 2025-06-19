const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// In-memory data store (in production, use a real database)
let products = [
  {
    id: 1,
    name: "Laptop",
    description: "High-performance laptop for professionals",
    price: 1299.99,
    category: "Electronics",
    inStock: true
  },
  {
    id: 2,
    name: "Coffee Mug",
    description: "Ceramic coffee mug with ergonomic handle",
    price: 12.99,
    category: "Home",
    inStock: true
  },
  {
    id: 3,
    name: "Wireless Headphones",
    description: "Noise-cancelling wireless headphones",
    price: 199.99,
    category: "Electronics",
    inStock: false
  },
  {
    id: 4,
    name: "Book - JavaScript Guide",
    description: "Comprehensive guide to JavaScript programming",
    price: 29.99,
    category: "Books",
    inStock: true
  }
];

let nextId = 5;

//error handling classes

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed') {
    super(message, 400);
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401);
  }
}

// Utility function to handle async route handlers

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

const validateProduct = (productData, isUpdate = false) => {
  const { name, description, price, category, inStock } = productData;
  const errors = [];

  if (!isUpdate || name !== undefined) {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      errors.push('Name is required and must be a non-empty string');
    }
  }

  if (!isUpdate || description !== undefined) {
    if (!description || typeof description !== 'string') {
      errors.push('Description is required and must be a string');
    }
  }

  if (!isUpdate || price !== undefined) {
    if (price === undefined || typeof price !== 'number' || price < 0) {
      errors.push('Price is required and must be a non-negative number');
    }
  }

  if (!isUpdate || category !== undefined) {
    if (!category || typeof category !== 'string' || category.trim().length === 0) {
      errors.push('Category is required and must be a non-empty string');
    }
  }

  if (!isUpdate || inStock !== undefined) {
    if (typeof inStock !== 'boolean') {
      errors.push('InStock must be a boolean value');
    }
  }

  return errors;
};

//middleware for logging requests

const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
};

// JSON Parser Middleware
app.use(express.json({ limit: '10mb' }));

// Authentication Middleware
const authenticate = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return next(new AuthenticationError('API key is required'));
  }
  
  // In production, validate against a secure store
  if (apiKey !== 'your-secret-api-key-123') {
    return next(new AuthenticationError('Invalid API key'));
  }
  
  next();
};

// Validation Middleware for Product Routes
const validateProductData = (isUpdate = false) => {
  return (req, res, next) => {
    const errors = validateProduct(req.body, isUpdate);
    
    if (errors.length > 0) {
      return next(new ValidationError(`Validation errors: ${errors.join(', ')}`));
    }
    
    next();
  };
};

// Apply global middleware
app.use(logger);

//routes

// GET /api/products - List all products with filtering, pagination, and search
app.get('/api/products', asyncHandler(async (req, res) => {
  let { category, inStock, page = 1, limit = 10, search } = req.query;
  
  // Convert query parameters
  page = parseInt(page);
  limit = parseInt(limit);
  
  // Validate pagination parameters
  if (page < 1) page = 1;
  if (limit < 1 || limit > 100) limit = 10;
  
  let filteredProducts = [...products];
  
  // Filter by category
  if (category) {
    filteredProducts = filteredProducts.filter(
      product => product.category.toLowerCase() === category.toLowerCase()
    );
  }
  
  // Filter by stock status
  if (inStock !== undefined) {
    const stockFilter = inStock === 'true';
    filteredProducts = filteredProducts.filter(
      product => product.inStock === stockFilter
    );
  }
  
  // Search by name
  if (search) {
    filteredProducts = filteredProducts.filter(
      product => product.name.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  // Calculate pagination
  const total = filteredProducts.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    data: paginatedProducts,
    pagination: {
      current: page,
      pages: totalPages,
      total: total,
      limit: limit
    },
    filters: {
      category: category || null,
      inStock: inStock || null,
      search: search || null
    }
  });
}));

// GET /api/products/:id - Get specific product by ID
app.get('/api/products/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  
  if (isNaN(id)) {
    throw new ValidationError('Product ID must be a valid number');
  }
  
  const product = products.find(p => p.id === id);
  
  if (!product) {
    throw new NotFoundError(`Product with ID ${id} not found`);
  }
  
  res.json({
    success: true,
    data: product
  });
}));

// POST /api/products - Create new product
app.post('/api/products', authenticate, validateProductData(), asyncHandler(async (req, res) => {
  const { name, description, price, category, inStock } = req.body;
  
  const newProduct = {
    id: nextId++,
    name: name.trim(),
    description: description.trim(),
    price: parseFloat(price),
    category: category.trim(),
    inStock: Boolean(inStock)
  };
  
  products.push(newProduct);
  
  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: newProduct
  });
}));

// PUT /api/products/:id - Update existing product
app.put('/api/products/:id', authenticate, validateProductData(true), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  
  if (isNaN(id)) {
    throw new ValidationError('Product ID must be a valid number');
  }
  
  const productIndex = products.findIndex(p => p.id === id);
  
  if (productIndex === -1) {
    throw new NotFoundError(`Product with ID ${id} not found`);
  }
  
  // Update only provided fields
  const updatedProduct = { ...products[productIndex] };
  
  if (req.body.name !== undefined) updatedProduct.name = req.body.name.trim();
  if (req.body.description !== undefined) updatedProduct.description = req.body.description.trim();
  if (req.body.price !== undefined) updatedProduct.price = parseFloat(req.body.price);
  if (req.body.category !== undefined) updatedProduct.category = req.body.category.trim();
  if (req.body.inStock !== undefined) updatedProduct.inStock = Boolean(req.body.inStock);
  
  products[productIndex] = updatedProduct;
  
  res.json({
    success: true,
    message: 'Product updated successfully',
    data: updatedProduct
  });
}));

// DELETE /api/products/:id - Delete product
app.delete('/api/products/:id', authenticate, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  
  if (isNaN(id)) {
    throw new ValidationError('Product ID must be a valid number');
  }
  
  const productIndex = products.findIndex(p => p.id === id);
  
  if (productIndex === -1) {
    throw new NotFoundError(`Product with ID ${id} not found`);
  }
  
  const deletedProduct = products.splice(productIndex, 1)[0];
  
  res.json({
    success: true,
    message: 'Product deleted successfully',
    data: deletedProduct
  });
}));

// GET /api/products/search - Search products by name
app.get('/api/products/search', asyncHandler(async (req, res) => {
  const { q: query, page = 1, limit = 10 } = req.query;
  
  if (!query || query.trim().length === 0) {
    throw new ValidationError('Search query is required');
  }
  
  const searchTerm = query.toLowerCase().trim();
  let searchResults = products.filter(
    product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm)
  );
  
  // Pagination for search results
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const total = searchResults.length;
  const totalPages = Math.ceil(total / limitNum);
  const startIndex = (pageNum - 1) * limitNum;
  
  searchResults = searchResults.slice(startIndex, startIndex + limitNum);
  
  res.json({
    success: true,
    data: searchResults,
    pagination: {
      current: pageNum,
      pages: totalPages,
      total: total,
      limit: limitNum
    },
    query: query
  });
}));

// GET /api/products/stats - Get product statistics
app.get('/api/products/stats', asyncHandler(async (req, res) => {
  const stats = {
    total: products.length,
    inStock: products.filter(p => p.inStock).length,
    outOfStock: products.filter(p => !p.inStock).length,
    byCategory: {},
    averagePrice: 0,
    priceRange: {
      min: 0,
      max: 0
    }
  };
  
  // Category breakdown
  products.forEach(product => {
    if (stats.byCategory[product.category]) {
      stats.byCategory[product.category]++;
    } else {
      stats.byCategory[product.category] = 1;
    }
  });
  
  // Price calculations
  if (products.length > 0) {
    const prices = products.map(p => p.price);
    stats.averagePrice = parseFloat((prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2));
    stats.priceRange.min = Math.min(...prices);
    stats.priceRange.max = Math.max(...prices);
  }
  
  res.json({
    success: true,
    data: stats
  });
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString()
  });
});

// 404 handler for undefined routes
app.all('*', (req, res, next) => {
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
});

// =====================================================
// GLOBAL ERROR HANDLING MIDDLEWARE
// =====================================================

const globalErrorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  
  // Log error for debugging
  console.error('Error:', err);
  
  // Default error values
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';
  
  // Handle specific error types
  if (err.name === 'CastError') {
    message = 'Resource not found';
    statusCode = 404;
  }
  
  if (err.name === 'ValidationError') {
    message = 'Validation Error';
    statusCode = 400;
  }
  
  // Handle JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    message = 'Invalid JSON format';
    statusCode = 400;
  }
  
  res.status(statusCode).json({
    success: false,
    error: {
      message: message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

app.use(globalErrorHandler);

//server startup

app.listen(PORT, () => {
  console.log(`
🚀 Server is running on port ${PORT}
📋 Available endpoints:
   GET    /health                    - Health check
   GET    /api/products              - List all products (with filtering & pagination)
   GET    /api/products/:id          - Get specific product
   POST   /api/products              - Create new product (requires API key)
   PUT    /api/products/:id          - Update product (requires API key)
   DELETE /api/products/:id          - Delete product (requires API key)
   GET    /api/products/search       - Search products
   GET    /api/products/stats        - Get product statistics

🔑 API Key: x-api-key: your-secret-api-key-123

📖 Example requests:
   GET /api/products?category=Electronics&page=1&limit=5
   GET /api/products/search?q=laptop&page=1&limit=10
   POST /api/products (with x-api-key header and JSON body)
  `);
});

module.exports = app;