# Express.js RESTful API - Products Management

A comprehensive RESTful API built with Express.js for managing products with advanced features including authentication, filtering, pagination, search, and statistics.

## 🚀 Features

- **Full CRUD Operations** for products
- **Authentication** via API key
- **Advanced Filtering** by category and stock status
- **Pagination** support for large datasets
- **Search Functionality** across product names and descriptions
- **Statistics Dashboard** with category breakdown and price analytics
- **Comprehensive Error Handling** with custom error classes
- **Request Logging** middleware
- **Input Validation** for all operations
- **Health Check** endpoint for monitoring

## 📋 Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Server](#running-the-server)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Examples](#examples)

## 🛠 Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd express-products-api
   ```

2. **Install dependencies:**
   ```bash
   npm install express
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your configuration.

4. **Start the server:**
   ```bash
   npm start
   # or for development with nodemon
   npm run dev
   ```

## ⚙️ Configuration

Create a `.env` file in the root directory (see `.env.example` for reference):

```env
PORT=3000
NODE_ENV=development
API_KEY=your-secret-api-key-123
```

## 🏃 Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in your environment variables).

## 📚 API Endpoints

### Base URL
```
http://localhost:3000
```

### Health Check
- **GET** `/health` - Check if the API is running

### Products

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/products` | Get all products with filtering & pagination | No |
| GET | `/api/products/:id` | Get a specific product by ID | No |
| POST | `/api/products` | Create a new product | Yes |
| PUT | `/api/products/:id` | Update an existing product | Yes |
| DELETE | `/api/products/:id` | Delete a product | Yes |
| GET | `/api/products/search` | Search products by name/description | No |
| GET | `/api/products/stats` | Get product statistics | No |

### Query Parameters for GET `/api/products`

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `category` | string | Filter by category | `?category=Electronics` |
| `inStock` | boolean | Filter by stock status | `?inStock=true` |
| `page` | number | Page number for pagination | `?page=1` |
| `limit` | number | Items per page (max 100) | `?limit=10` |
| `search` | string | Search in name/description | `?search=laptop` |

### Query Parameters for GET `/api/products/search`

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `q` | string | Search query | Yes |
| `page` | number | Page number | No |
| `limit` | number | Items per page | No |

## 🔐 Authentication

Protected endpoints require an API key in the request headers:

```
x-api-key: your-secret-api-key-123
```

**Protected Endpoints:**
- POST `/api/products`
- PUT `/api/products/:id`
- DELETE `/api/products/:id`

## 📝 Product Schema

```json
{
  "id": "number (auto-generated)",
  "name": "string (required)",
  "description": "string (required)",
  "price": "number (required, >= 0)",
  "category": "string (required)",
  "inStock": "boolean (required)"
}
```

## ⚠️ Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": {
    "message": "Error description"
  }
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (Validation Error)
- `401` - Unauthorized (Missing/Invalid API Key)
- `404` - Not Found
- `500` - Internal Server Error

## 📖 Examples

### 1. Get All Products
```bash
curl -X GET "http://localhost:3000/api/products"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Laptop",
      "description": "High-performance laptop for professionals",
      "price": 1299.99,
      "category": "Electronics",
      "inStock": true
    }
  ],
  "pagination": {
    "current": 1,
    "pages": 1,
    "total": 4,
    "limit": 10
  },
  "filters": {
    "category": null,
    "inStock": null,
    "search": null
  }
}
```

### 2. Get Products with Filtering and Pagination
```bash
curl -X GET "http://localhost:3000/api/products?category=Electronics&inStock=true&page=1&limit=2"
```

### 3. Get Specific Product
```bash
curl -X GET "http://localhost:3000/api/products/1"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Laptop",
    "description": "High-performance laptop for professionals",
    "price": 1299.99,
    "category": "Electronics",
    "inStock": true
  }
}
```

### 4. Create New Product
```bash
curl -X POST "http://localhost:3000/api/products" \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-api-key-123" \
  -d '{
    "name": "Smartphone",
    "description": "Latest model smartphone with advanced features",
    "price": 699.99,
    "category": "Electronics",
    "inStock": true
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": 5,
    "name": "Smartphone",
    "description": "Latest model smartphone with advanced features",
    "price": 699.99,
    "category": "Electronics",
    "inStock": true
  }
}
```

### 5. Update Product
```bash
curl -X PUT "http://localhost:3000/api/products/1" \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-api-key-123" \
  -d '{
    "price": 1199.99,
    "inStock": false
  }'
```

### 6. Delete Product
```bash
curl -X DELETE "http://localhost:3000/api/products/1" \
  -H "x-api-key: your-secret-api-key-123"
```

**Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully",
  "data": {
    "id": 1,
    "name": "Laptop",
    "description": "High-performance laptop for professionals",
    "price": 1299.99,
    "category": "Electronics",
    "inStock": true
  }
}
```

### 7. Search Products
```bash
curl -X GET "http://localhost:3000/api/products/search?q=laptop&page=1&limit=5"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Laptop",
      "description": "High-performance laptop for professionals",
      "price": 1299.99,
      "category": "Electronics",
      "inStock": true
    }
  ],
  "pagination": {
    "current": 1,
    "pages": 1,
    "total": 1,
    "limit": 5
  },
  "query": "laptop"
}
```

### 8. Get Product Statistics
```bash
curl -X GET "http://localhost:3000/api/products/stats"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 4,
    "inStock": 3,
    "outOfStock": 1,
    "byCategory": {
      "Electronics": 2,
      "Home": 1,
      "Books": 1
    },
    "averagePrice": 385.74,
    "priceRange": {
      "min": 12.99,
      "max": 1299.99
    }
  }
}
```

### 9. Health Check
```bash
curl -X GET "http://localhost:3000/health"
```

**Response:**
```json
{
  "success": true,
  "message": "API is healthy",
  "timestamp": "2025-06-19T10:30:00.000Z"
}
```

## 🧪 Testing with Different Tools

### Using curl (as shown above)

### Using Postman
1. Import the collection by creating requests for each endpoint
2. Set up environment variables for base URL and API key
3. Use the examples provided above

### Using JavaScript/Node.js
```javascript
const axios = require('axios');

// Get all products
const getProducts = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/products');
    console.log(response.data);
  } catch (error) {
    console.error(error.response.data);
  }
};

// Create a product
const createProduct = async () => {
  try {
    const response = await axios.post('http://localhost:3000/api/products', {
      name: 'Test Product',
      description: 'A test product',
      price: 99.99,
      category: 'Test',
      inStock: true
    }, {
      headers: {
        'x-api-key': 'your-secret-api-key-123'
      }
    });
    console.log(response.data);
  } catch (error) {
    console.error(error.response.data);
  }
};
```

## 📦 Package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

## 🔧 Development Notes

- The API uses in-memory storage for demonstration purposes
- In production, replace with a proper database (MongoDB, PostgreSQL, etc.)
- Consider implementing rate limiting for production use
- Add comprehensive logging for production environments
- Implement proper authentication/authorization system
- Add input sanitization for security

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

If you have any questions or issues, please open an issue on the repository or contact the development team.