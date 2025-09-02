import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://cmsback.e-aribt.com/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle messages and errors
api.interceptors.response.use(
  (response) => {
    // Handle successful responses
    const { data } = response;

    // Show success message if provided by backend
    if (data?.message) {
      toast.success(data.message);
    }

    return response;
  },
  (error) => {
    // Handle error responses
    const { response } = error;

    if (response?.data?.message) {
      // Show error message from backend
      toast.error(response.data.message);
    } else if (response?.data?.error) {
      // Alternative error field
      toast.error(response.data.error);
    } else if (response?.status === 401) {
      // Unauthorized
      toast.error("Authentication failed. Please login again.");
      localStorage.removeItem("auth_token");
    } else if (response?.status === 403) {
      // Forbidden
      toast.error("You don't have permission to perform this action.");
    } else if (response?.status === 404) {
      // Not found
      toast.error("Resource not found.");
    } else if (response?.status >= 500) {
      // Server errors
      toast.error("Server error. Please try again later.");
    } else if (error.code === "NETWORK_ERROR" || !response) {
      // Network errors
      toast.error("Network error. Please check your connection.");
    } else {
      // Generic error
      toast.error("An unexpected error occurred.");
    }

    return Promise.reject(error);
  }
);

// Generic API functions
const apiService = {
  // GET all items
  getAll: async (endpoint: string) => {
    const response = await api.get(`/${endpoint}`);
    return response.data;
  },

  // GET item by ID
  getById: async (endpoint: string, id: number | string) => {
    const response = await api.get(`/${endpoint}/${id}`);
    return response.data;
  },

  // POST create new item
  create: async (endpoint: string, data: any) => {
    const config =
      data instanceof FormData
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : {};
    const response = await api.post(`/${endpoint}`, data, config);
    return response.data;
  },

  // PATCH update item
  update: async (endpoint: string, id: number | string, data: any) => {
    const config =
      data instanceof FormData
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : {};
    const response = await api.patch(`/${endpoint}/${id}`, data, config);
    return response.data;
  },

  // DELETE item
  delete: async (endpoint: string, id: number | string) => {
    const response = await api.delete(`/${endpoint}/${id}`);
    return response.data;
  },

  // Authentication
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },
};

// Custom hooks for each section
export const useApiHooks = () => {
  const queryClient = useQueryClient();

  // Generic hooks
  const useGetAll = (endpoint: string, queryKey: string) => {
    return useQuery({
      queryKey: [queryKey],
      queryFn: () => apiService.getAll(endpoint),
    });
  };

  const useGetById = (
    endpoint: string,
    id: number | string,
    queryKey: string
  ) => {
    return useQuery({
      queryKey: [queryKey, id],
      queryFn: () => apiService.getById(endpoint, id),
      enabled: !!id,
    });
  };

  const useCreate = (endpoint: string, queryKey: string) => {
    return useMutation({
      mutationFn: (data: any) => apiService.create(endpoint, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      },
    });
  };

  const useUpdate = (endpoint: string, queryKey: string) => {
    return useMutation({
      mutationFn: ({ id, data }: { id: number | string; data: any }) =>
        apiService.update(endpoint, id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      },
    });
  };

  const useDelete = (endpoint: string, queryKey: string) => {
    return useMutation({
      mutationFn: (id: number | string) => apiService.delete(endpoint, id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      },
    });
  };

  // Authentication hooks
  const useLogin = () => {
    return useMutation({
      mutationFn: apiService.login,
      onSuccess: (data) => {
        if (data.token) {
          localStorage.setItem("auth_token", data.token);
        }
      },
    });
  };

  // Sponsors hooks
  const useSponsors = () => ({
    getAll: useGetAll("sponsers", "sponsors"),
    getById: (id: number | string) => useGetById("sponsers", id, "sponsor"),
    create: useCreate("sponsers", "sponsors"),
    update: useUpdate("sponsers", "sponsors"),
    delete: useDelete("sponsers", "sponsors"),
  });

  // About/Hackathon Info hooks
  const useHackathonInfo = () => ({
    get: useGetAll("abouthackerthon", "hackathon-info"),
    update: useUpdate("abouthackerthon", "hackathon-info"),
  });

  // Registration hooks
  const useRegistrations = () => ({
    getAll: useGetAll("registrationformhacker", "registrations"),
    getById: (id: number | string) =>
      useGetById("registrationformhacker", id, "registration"),
    create: useCreate("registrationformhacker", "registrations"),
    update: useUpdate("registrationformhacker", "registrations"),
    delete: useDelete("registrationformhacker", "registrations"),
    updateStatus: useMutation({
      mutationFn: ({ id, status }: { id: number | string; status: string }) =>
        apiService.update("registrationformhacker", id, { status }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["registrations"] });
      },
    }),
  });

  // Partners hooks
  const usePartners = () => ({
    getAll: useGetAll("supportingpartners", "partners"),
    getById: (id: number | string) =>
      useGetById("supportingpartners", id, "partner"),
    create: useCreate("supportingpartners", "partners"),
    update: useUpdate("supportingpartners", "partners"),
    delete: useDelete("supportingpartners", "partners"),
  });

  // Team Members hooks
  const useTeamMembers = () => ({
    getAll: useGetAll("teamsmemberhacker", "team-members"),
    getById: (id: number | string) =>
      useGetById("teamsmemberhacker", id, "team-member"),
    create: useCreate("teamsmemberhacker", "team-members"),
    update: useUpdate("teamsmemberhacker", "team-members"),
    delete: useDelete("teamsmemberhacker", "team-members"),
  });

  // Hackers/Teams hooks
  const useHackers = () => ({
    getAll: useGetAll("hackers", "teams"),
    getById: (id: number | string) => useGetById("hackers", id, "team"),
    create: useCreate("hackers", "teams"),
    update: useUpdate("hackers", "teams"),
    delete: useDelete("hackers", "teams"),
    getHackers: useGetAll("hackers", "hackers"),
  });

  return {
    useLogin,
    useSponsors,
    useHackathonInfo,
    useRegistrations,
    usePartners,
    useTeamMembers,
    useHackers,
  };
};

export default apiService;
