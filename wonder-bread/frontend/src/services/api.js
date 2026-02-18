/**
 * Wonder Bread API Service
 * Handles all API communication with the backend
 */

const API_BASE_URL =
  process.env.REACT_APP_WONDER_BREAD_API_URL || "http://localhost:5001";

/**
 * Get authentication token from localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem("wonderBreadToken");
};

/**
 * Set authentication token in localStorage
 */
const setAuthToken = (token) => {
  localStorage.setItem("wonderBreadToken", token);
};

/**
 * Remove authentication token from localStorage
 */
const removeAuthToken = () => {
  localStorage.removeItem("wonderBreadToken");
};

/**
 * Make API request with authentication
 */
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  console.log(`[API] ${options.method || "GET"} ${endpoint}`, {
    hasToken: !!token,
  });

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { error: "Request failed" };
    }
    console.error(`[API Error] ${response.status}:`, errorData);
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return response.json();
};

// ─── Authentication API ───────────────────────────────────────────────────────

/**
 * Register new user
 */
export const register = async (userData) => {
  const response = await apiRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });

  if (response.access_token) {
    setAuthToken(response.access_token);
  }

  return response;
};

/**
 * Login user
 */
export const login = async (email, password) => {
  const response = await apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (response.access_token) {
    setAuthToken(response.access_token);
  }

  return response;
};

/**
 * Logout user
 */
export const logout = async () => {
  try {
    await apiRequest("/api/auth/logout", {
      method: "POST",
    });
  } finally {
    removeAuthToken();
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async () => {
  return apiRequest("/api/auth/user");
};

// ─── Menu API ─────────────────────────────────────────────────────────────────

/**
 * Get bread products menu
 */
export const getMenu = async () => {
  return apiRequest("/api/menu");
};

// ─── Profile API ──────────────────────────────────────────────────────────────

/**
 * Get user profile
 */
export const getProfile = async () => {
  return apiRequest("/api/profile");
};

/**
 * Update user profile
 */
export const updateProfile = async (data) => {
  return apiRequest("/api/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

/**
 * Get delivery addresses
 */
export const getAddresses = async () => {
  return apiRequest("/api/profile/addresses");
};

/**
 * Add delivery address
 */
export const addAddress = async (address) => {
  return apiRequest("/api/profile/addresses", {
    method: "POST",
    body: JSON.stringify(address),
  });
};

/**
 * Update notification preferences
 */
export const updatePreferences = async (prefs) => {
  return apiRequest("/api/profile/preferences", {
    method: "PUT",
    body: JSON.stringify(prefs),
  });
};

// ─── Orders API ───────────────────────────────────────────────────────────────

/**
 * Create new order
 */
export const createOrder = async (orderData) => {
  return apiRequest("/api/orders", {
    method: "POST",
    body: JSON.stringify(orderData),
  });
};

/**
 * Get user orders
 */
export const getOrders = async () => {
  return apiRequest("/api/orders");
};

/**
 * Get order by ID with tracking
 */
export const getOrderById = async (id) => {
  return apiRequest(`/api/orders/${id}`);
};

// ─── Utilities ────────────────────────────────────────────────────────────────

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getAuthToken();
};

/**
 * Get auth token
 */
export { getAuthToken, setAuthToken, removeAuthToken };
