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

  // Authentication hooks
  const useLogin = () => {
    return useMutation({
      mutationFn: apiService.login,
      onSuccess: (data) => {
        if (data.access_token) {
          localStorage.setItem("auth_token", data.access_token);
        }
      },
    });
  };

  // Sponsors hooks
  const useSponsors = () => ({
    getAll: useGetAll("sponsers", "sponsors"),
    getById: (id: number | string) => useGetById("sponsers", id, "sponsor"),
    create: useMutation({
      mutationFn: (data: any) => apiService.create("sponsers", data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["sponsors"] });
        toast.success("Sponsor added successfully!");
      },
    }),
    update: useMutation({
      mutationFn: ({ id, data }: { id: number | string; data: any }) =>
        apiService.update("sponsers", id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["sponsors"] });
        toast.success("Sponsor updated successfully!");
      },
    }),
    delete: useMutation({
      mutationFn: (id: number | string) => apiService.delete("sponsers", id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["sponsors"] });
        toast.success("Sponsor removed successfully!");
      },
    }),
  });

  // About/Hackathon Info hooks
  const useHackathonInfo = () => ({
    get: useGetAll("abouthackerthon", "hackathon-info"),
    update: useMutation({
      mutationFn: ({ id, data }: { id: number | string; data: any }) =>
        apiService.update("abouthackerthon", id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["hackathon-info"] });
        toast.success("Hackathon information updated successfully!");
      },
    }),
  });

  // Registration hooks
  const useRegistrations = () => ({
    getAll: useGetAll("registrationformhacker", "registrations"),
    getById: (id: number | string) =>
      useGetById("registrationformhacker", id, "registration"),
    create: useMutation({
      mutationFn: (data: any) =>
        apiService.create("registrationformhacker", data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["registrations"] });
        toast.success("Registration created successfully!");
      },
    }),
    update: useMutation({
      mutationFn: ({ id, data }: { id: number | string; data: any }) =>
        apiService.update("registrationformhacker", id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["registrations"] });
        toast.success("Registration updated successfully!");
      },
    }),
    delete: useMutation({
      mutationFn: (id: number | string) =>
        apiService.delete("registrationformhacker", id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["registrations"] });
        toast.success("Registration deleted successfully!");
      },
    }),
    updateStatus: useMutation({
      mutationFn: ({ id, status }: { id: number | string; status: string }) =>
        apiService.update("registrationformhacker", id, { verified: status }),
      onSuccess: (_, { status }) => {
        queryClient.invalidateQueries({ queryKey: ["registrations"] });
        toast.success(
          `Registration ${
            status === "yes" ? "verified" : "unverified"
          } successfully!`
        );
      },
    }),
  });

  // Partners hooks
  const usePartners = () => ({
    getAll: useGetAll("supportingpartners", "partners"),
    getById: (id: number | string) =>
      useGetById("supportingpartners", id, "partner"),
    create: useMutation({
      mutationFn: (data: any) => apiService.create("supportingpartners", data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["partners"] });
        toast.success("Partner added successfully!");
      },
    }),
    update: useMutation({
      mutationFn: ({ id, data }: { id: number | string; data: any }) =>
        apiService.update("supportingpartners", id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["partners"] });
        toast.success("Partner updated successfully!");
      },
    }),
    delete: useMutation({
      mutationFn: (id: number | string) =>
        apiService.delete("supportingpartners", id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["partners"] });
        toast.success("Partner removed successfully!");
      },
    }),
  });

  // Team Members hooks
  const useTeamMembers = () => ({
    getAll: useGetAll("teamsmemberhacker", "team-members"),
    getById: (id: number | string) =>
      useGetById("teamsmemberhacker", id, "team-member"),
    create: useMutation({
      mutationFn: (data: any) => apiService.create("teamsmemberhacker", data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["team-members"] });
        toast.success("Team member added successfully!");
      },
    }),
    update: useMutation({
      mutationFn: ({ id, data }: { id: number | string; data: any }) =>
        apiService.update("teamsmemberhacker", id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["team-members"] });
        toast.success("Team member updated successfully!");
      },
    }),
    delete: useMutation({
      mutationFn: (id: number | string) =>
        apiService.delete("teamsmemberhacker", id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["team-members"] });
        toast.success("Team member removed successfully!");
      },
    }),
  });

  // Hackers/Teams hooks
  const useHackers = () => ({
    getAll: useGetAll("hackers", "teams"),
    getById: (id: number | string) => useGetById("hackers", id, "team"),
    create: useMutation({
      mutationFn: (data: any) => apiService.create("hackers", data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["teams"] });
        toast.success("Team created successfully!");
      },
    }),
    update: useMutation({
      mutationFn: ({ id, data }: { id: number | string; data: any }) =>
        apiService.update("hackers", id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["teams"] });
        toast.success("Team updated successfully!");
      },
    }),
    delete: useMutation({
      mutationFn: (id: number | string) => apiService.delete("hackers", id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["teams"] });
        toast.success("Team deleted successfully!");
      },
    }),
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
