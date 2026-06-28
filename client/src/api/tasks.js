const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const authHeaders = (user) => {
  if (!user?.email) return {};
  return {
    "x-user-email": user.email,
    "x-user-name": user.displayName || user.email.split("@")[0]
  };
};

export const request = async (path, options = {}) => {
  const { user, ...fetchOptions } = options;
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(user),
      ...fetchOptions.headers
    },
    ...fetchOptions
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || "Request failed");
    error.details = data.errors || {};
    throw error;
  }

  return data;
};

export const fetchTasks = (user, filters) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== "all") params.set(key, value);
  });
  const query = params.toString();
  return request(`/tasks${query ? `?${query}` : ""}`, { user });
};

export const createTask = (user, task) =>
  request("/tasks", {
    user,
    method: "POST",
    body: JSON.stringify(task)
  });

export const updateTask = (user, id, task) =>
  request(`/tasks/${id}`, {
    user,
    method: "PUT",
    body: JSON.stringify(task)
  });

export const deleteTask = (user, id) =>
  request(`/tasks/${id}`, {
    user,
    method: "DELETE"
  });
